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
      });
      return profile;
    }),
  getUserProfile: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user.id;
    const profile = await ctx.prisma.runProfile.findUnique({
      where: {
        userId: userId,
      },
    });
    return profile;
  }),
  updateProfile: protectedProcedure
    .input(
      z.object({
        highlightRun: RunSettingsFormSchema.optional(),
        weekStats: WeekSettingsFormSchema.optional(),
        shoes: ShoeSettingsFormSchema.optional(),
        events: EventSettingsFormSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const result = await ctx.prisma.runProfile.update({
        where: {
          userId: userId,
        },
        data: {
          ...(input.highlightRun ? { highlightRun: input.highlightRun } : null),
          ...(input.weekStats ? { weekStats: input.weekStats } : null),
          ...(input.shoes ? { shoes: input.shoes } : null),
          ...(input.events ? { events: input.events } : null),
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
      const result = await ctx.prisma.runProfile.update({
        where: {
          userId: userId,
        },
        data: {
          ...(input.general ? { ...input.general } : null),
        },
      });

      return {
        success: true,
        general: {
          slug: result.slug as string,
          name: result.name as string,
        },
      };
    }),
});
