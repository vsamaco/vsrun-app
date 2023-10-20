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
  getProfile: publicProcedure.query(async ({ ctx }) => {
    const profiles = await ctx.prisma.runProfile.findMany();
    return profiles.length ? profiles[0] : null;
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
          ...(input.general ? { username: input.general.username } : null),
        },
      });

      return {
        success: true,
        general: {
          username: result.username,
        },
      };
    }),
});
