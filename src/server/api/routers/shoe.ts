import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { nanoid } from "nanoid";
import { ShoeSettingsFormSchema } from "~/utils/schemas";

export const shoeRouter = createTRPCRouter({
  getShoeBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const shoe = await ctx.prisma.shoe.findUnique({
        where: {
          slug: input.slug,
        },
      });
      return shoe;
    }),

  getUserShoes: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const runProfile = await ctx.prisma.runProfile.findUnique({
      where: { userId },
    });
    if (!runProfile) return [];

    const shoes = await ctx.prisma.shoe.findMany({
      where: {
        runProfileId: runProfile.id,
      },
      orderBy: {
        start_date: "asc",
      },
    });

    return shoes;
  }),

  createShoe: protectedProcedure
    .input(
      z.object({
        body: ShoeSettingsFormSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const runProfile = await ctx.prisma.runProfile.findUnique({
        where: { userId },
      });
      if (!runProfile) return null;

      const result = await ctx.prisma.shoe.create({
        data: {
          slug: nanoid(8),
          brand_name: input.body.brand_name,
          model_name: input.body.model_name,
          start_date: input.body.start_date,
          distance: input.body.distance,
          categories: input.body.categories,
          description: input.body.description || "",
          runProfileId: runProfile.id,
        },
      });

      return result;
    }),

  updateShoe: protectedProcedure
    .input(
      z.object({
        params: z.object({
          slug: z.string(),
        }),
        body: ShoeSettingsFormSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const runProfile = await ctx.prisma.runProfile.findUnique({
        where: { userId },
      });
      if (!runProfile) return null;

      const result = await ctx.prisma.shoe.update({
        where: {
          slug: input.params.slug,
          runProfileId: runProfile.id,
        },
        data: {
          brand_name: input.body.brand_name,
          model_name: input.body.model_name,
          start_date: input.body.start_date,
          distance: input.body.distance,
          categories: input.body.categories,
          description: input.body.description || "",
          metadata: input.body.metadata,
        },
      });

      return result;
    }),

  deleteShoe: protectedProcedure
    .input(
      z.object({
        params: z.object({ slug: z.string() }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const runProfile = await ctx.prisma.runProfile.findUnique({
        where: { userId },
      });
      if (!runProfile) return null;
      const result = await ctx.prisma.shoe.delete({
        where: {
          slug: input.params.slug,
          runProfileId: runProfile.id,
        },
      });

      return result;
    }),
});
