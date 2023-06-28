import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const runProfileRouter = createTRPCRouter({
  getProfile: publicProcedure.query(async ({ ctx }) => {
    const profiles = await ctx.prisma.runProfile.findMany();
    return profiles.length ? profiles[0] : null;
  }),
});
