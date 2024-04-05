import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  EventSettingsFormSchema,
  GeneralSettingsFormSchema,
  RunSettingsFormSchema,
  ShoeSettingsFormSchema,
  WeekSettingsFormSchema,
} from "~/utils/schemas";

export const runProfileRouter = createTRPCRouter({
  getProfileBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const profile = await ctx.prisma.runProfile.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          shoeRotations: {
            orderBy: {
              startDate: "desc",
            },
          },
          shoes2: true,
          user: {
            select: {
              accounts: {
                select: {
                  provider: true,
                  providerAccountId: true,
                },
              },
            },
          },
          races: true,
          highlight_run: true,
        },
      });
      return profile;
    }),
  getUserProfile: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user.id;
    const profile = await ctx.prisma.runProfile.findUnique({
      where: {
        userId: userId,
      },
      include: {
        races: true,
        highlight_run: true,
      },
    });
    return profile;
  }),
  updateProfile: protectedProcedure
    .input(
      z.object({
        highlightRun: RunSettingsFormSchema.nullable().optional(),
        weekStats: WeekSettingsFormSchema.nullable().optional(),
        shoes: z.array(ShoeSettingsFormSchema).optional(),
        events: z.array(EventSettingsFormSchema).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const updateHighlightRun = input.highlightRun !== undefined && {
        highlightRun: input.highlightRun || {},
      };

      const updateWeekStats = input.weekStats !== undefined && {
        weekStats: input.weekStats || {},
      };

      const updateShoes = input.shoes && { shoes: input.shoes || [] };

      const updateEvents = input.events && {
        events: input.events.map((e) => ({
          ...e,
          start_date: new Date(e.start_date).toUTCString(),
        })),
      };

      const data = {
        ...updateHighlightRun,
        ...updateWeekStats,
        ...updateShoes,
        ...updateEvents,
      };
      console.log("==== DATA:", data);

      const result = await ctx.prisma.runProfile.update({
        where: {
          userId: userId,
        },
        data: {
          ...updateHighlightRun,
          ...updateWeekStats,
          ...updateShoes,
          ...updateEvents,
        },
      });

      return {
        success: true,
        profile: result,
      };
    }),
  updateGeneralProfile: protectedProcedure
    .input(
      z.object({
        general: GeneralSettingsFormSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const result = await ctx.prisma.runProfile.upsert({
        where: {
          userId: userId,
        },
        create: {
          userId,
          ...input.general,
          highlightRun: {},
          weekStats: {},
          shoes: [],
          events: [],
        },
        update: {
          ...input.general,
        },
      });

      return {
        success: true,
        profile: {
          slug: result.slug,
          name: result.name,
        },
      };
    }),
});
