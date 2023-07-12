import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { Activity } from "~/types";

export const runProfileRouter = createTRPCRouter({
  getProfile: publicProcedure.query(async ({ ctx }) => {
    const profiles = await ctx.prisma.runProfile.findMany();
    return profiles.length ? profiles[0] : null;
  }),
  updateProfile: protectedProcedure
    .input(
      z.object({
        username: z.string(),
        highlightRun: z.object({
          id: z.number(),
          name: z.string(),
          start_date: z.string(),
          start_latlng: z.array(z.number()),
          elapsed_time: z.number(),
          moving_time: z.number(),
          distance: z.number(),
          total_elevation_gain: z.number(),
          summary_polyline: z.string(),
        }),
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

      const result = await ctx.prisma.runProfile.update({
        where: {
          userId: userId,
        },
        data: {
          username: input.username,
          highlightRun: {
            ...highlightRun,
            ...input.highlightRun,
          },
        },
      });

      return {
        success: true,
        profile: result,
      };
    }),
});
