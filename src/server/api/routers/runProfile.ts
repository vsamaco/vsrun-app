import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { Activity, WeekStat } from "~/types";
import {
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
        general: GeneralSettingsFormSchema.optional(),
        highlightRun: RunSettingsFormSchema.optional(),
        weekStats: WeekSettingsFormSchema.optional(),
        shoes: ShoeSettingsFormSchema.optional(),
        events: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              start_date: z.string(),
              distance: z.number(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const profile = await ctx.prisma.runProfile.findUnique({
        where: {
          userId: userId,
        },
      });

      const highlightRun = profile?.highlightRun as Activity;
      const weekStats = profile?.weekStats as WeekStat;

      const result = await ctx.prisma.runProfile.update({
        where: {
          userId: userId,
        },
        data: {
          ...(input.general ? { username: input.general.username } : null),
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
});
