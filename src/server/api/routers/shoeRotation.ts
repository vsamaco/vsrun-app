import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { nanoid } from "nanoid";
import { SHOE_CATEGORIES } from "~/types";

// function filter<T extends object>(
//   obj: T,
//   predicate: <K extends keyof T>(value: T[K], key: K) => boolean
// ) {
//   const result: { [K in keyof T]?: T[K] } = {};
//   (Object.keys(obj) as Array<keyof T>).forEach((name) => {
//     if (predicate(obj[name], name)) {
//       result[name] = obj[name];
//     }
//   });
//   return result;
// }

export const shoeRotationRouter = createTRPCRouter({
  getShoeRotationBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const shoeRotation = await ctx.prisma.shoeRotation.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          runProfile: true,
        },
      });
      return shoeRotation;
    }),

  getUserShoeRotations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const runProfile = await ctx.prisma.runProfile.findUnique({
      where: { userId },
    });
    if (!runProfile) return [];

    const shoeRotations = await ctx.prisma.shoeRotation.findMany({
      where: {
        profileId: runProfile.id,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return shoeRotations;
  }),

  createShoeRotation: protectedProcedure
    .input(
      z.object({
        body: z.object({
          name: z.string(),
          description: z.string(),
          startDate: z.coerce.date(),
          shoes: z.array(
            z.object({
              brand_name: z.string(),
              model_name: z.string(),
              distance: z.number(),
              categories: z.array(z.enum(SHOE_CATEGORIES)),
              description: z.string(),
            })
          ),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const runProfile = await ctx.prisma.runProfile.findUnique({
        where: { userId },
      });
      if (!runProfile) return null;

      const result = await ctx.prisma.shoeRotation.create({
        data: {
          slug: nanoid(8),
          name: input.body.name,
          startDate: input.body.startDate,
          description: input.body.description,
          shoes: input.body.shoes,
          profileId: runProfile.id,
        },
      });

      return result;
    }),

  updateShoeRotation: protectedProcedure
    .input(
      z.object({
        params: z.object({
          slug: z.string(),
        }),
        body: z.object({
          name: z.string(),
          description: z.string(),
          startDate: z.coerce.date(),
          shoes: z.array(
            z.object({
              brand_name: z.string(),
              model_name: z.string(),
              distance: z.number(),
              categories: z.array(z.enum(SHOE_CATEGORIES)),
              description: z.string(),
            })
          ),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const runProfile = await ctx.prisma.runProfile.findUnique({
        where: { userId },
      });
      if (!runProfile) return null;

      const result = await ctx.prisma.shoeRotation.update({
        where: {
          slug: input.params.slug,
          profileId: runProfile.id,
        },
        data: {
          name: input.body.name,
          startDate: input.body.startDate,
          description: input.body.description,
          shoes: input.body.shoes,
        },
      });

      return result;
    }),

  deleteShoeRotation: protectedProcedure
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
      const result = await ctx.prisma.shoeRotation.delete({
        where: {
          slug: input.params.slug,
          profileId: runProfile.id,
        },
      });

      return result;
    }),
});
