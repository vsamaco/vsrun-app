import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { nanoid } from "nanoid";
import { ShoeRotationFormSchema } from "~/utils/schemas";
import { type Shoe } from "~/types";

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
          runProfile: {
            select: {
              name: true,
              slug: true,
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
            },
          },
          shoeList: true,
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
      include: {
        shoeList: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return shoeRotations.map((sr) => ({
      ...sr,
      shoeList: sr.shoeList as Shoe[],
    }));
  }),

  createShoeRotation: protectedProcedure
    .input(
      z.object({
        body: ShoeRotationFormSchema,
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
          description: input.body.description || "",
          shoes: input.body.shoes,
          profileId: runProfile.id,
          shoeList: {
            connect: input.body.shoeList
              .filter((s) => s.id)
              .map((s) => ({ id: s.id })),
          },
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
        body: ShoeRotationFormSchema,
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
          shoeList: {
            set: input.body.shoeList
              .filter((s) => s.id)
              .map((s) => ({ id: s.id })),
          },
        },
        include: {
          shoeList: true,
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
