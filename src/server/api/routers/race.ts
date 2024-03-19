import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { nanoid } from "nanoid";
import { RaceFormSchema } from "~/utils/schemas";

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

export const raceProfileRouter = createTRPCRouter({
  getProfileRaceBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const activity = await ctx.prisma.race.findUnique({
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
        },
      });
      return activity;
    }),

  getUserProfileRaces: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const runProfile = await ctx.prisma.runProfile.findUnique({
      where: { userId },
    });
    if (!runProfile) return [];

    const activities = await ctx.prisma.race.findMany({
      where: {
        profileId: runProfile.id,
      },
      orderBy: {
        start_date: "desc",
      },
    });

    return activities;
  }),

  createProfileRace: protectedProcedure
    .input(
      z.object({
        body: RaceFormSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const runProfile = await ctx.prisma.runProfile.findUnique({
        where: { userId },
      });
      if (!runProfile) return null;

      try {
        const result = await ctx.prisma.race.create({
          data: {
            slug: nanoid(8),
            name: input.body.name,
            start_date: input.body.start_date,
            workout_type: input.body.workout_type,
            description: input.body.description || "",
            moving_time: input.body.moving_time,
            elapsed_time: input.body.elapsed_time,
            distance: input.body.distance,
            total_elevation_gain: input.body.total_elevation_gain,
            start_latlng: input.body.start_latlng,
            end_latlng: input.body.end_latlng,
            summary_polyline: input.body.summary_polyline,
            laps: input.body.laps,
            metadata: input.body.metadata,
            profileId: runProfile.id,
          },
        });

        return result;
      } catch (error) {
        console.log("created profile race error:", error);
      }
    }),

  updateProfileRace: protectedProcedure
    .input(
      z.object({
        params: z.object({
          slug: z.string(),
        }),
        body: RaceFormSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const runProfile = await ctx.prisma.runProfile.findUnique({
        where: { userId },
      });
      if (!runProfile) return null;

      const result = await ctx.prisma.race.update({
        where: {
          slug: input.params.slug,
          profileId: runProfile.id,
        },
        data: {
          name: input.body.name,
          start_date: input.body.start_date,
          workout_type: input.body.workout_type?.toString(),
          description: input.body.description || "",
          moving_time: input.body.moving_time,
          elapsed_time: input.body.elapsed_time,
          distance: input.body.distance,
          total_elevation_gain: input.body.total_elevation_gain,
          start_latlng: input.body.start_latlng,
          end_latlng: input.body.end_latlng,
          summary_polyline: input.body.summary_polyline,
          laps: input.body.laps,
          metadata: input.body.metadata,
          profileId: runProfile.id,
        },
      });

      return result;
    }),

  deleteProfileRace: protectedProcedure
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
      const result = await ctx.prisma.race.delete({
        where: {
          slug: input.params.slug,
          profileId: runProfile.id,
        },
      });

      return result;
    }),
});
