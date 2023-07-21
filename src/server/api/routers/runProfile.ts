import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { Activity, WeekStat } from "~/types";

export const runProfileRouter = createTRPCRouter({
  getProfile: publicProcedure.query(async ({ ctx }) => {
    const profiles = await ctx.prisma.runProfile.findMany();
    return profiles.length ? profiles[0] : null;
  }),
  updateProfile: protectedProcedure
    .input(
      z.object({
        username: z.string().optional(),
        highlightRun: z
          .object({
            id: z.number(),
            name: z.string(),
            start_date: z.string(),
            start_latlng: z.array(z.number()),
            elapsed_time: z.number(),
            moving_time: z.number(),
            distance: z.number(),
            total_elevation_gain: z.number(),
            summary_polyline: z.string(),
          })
          .optional(),
        weekStats: z
          .object({
            total_runs: z.number(),
            total_distance: z.number(),
            total_duration: z.number(),
            total_elevation: z.number(),
            start_date: z.string(),
            end_date: z.string(),
          })
          .optional(),
        shoes: z
          .array(
            z.object({
              id: z.string(),
              brand_name: z.string(),
              model_name: z.string(),
              distance: z.number(),
            })
          )
          .optional(),
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
          ...(input.username ? { username: input.username } : null),
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
