import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { default as strava } from "strava-v3";
import { z } from "zod";
import { parseShoeBrandModel } from "~/utils/shoe";

strava.config({
  access_token: "",
  redirect_uri: "http://localhost:3000/api/strava/callback",
  client_id: process.env.STRAVA_CLIENT_ID!,
  client_secret: process.env.STRAVA_CLIENT_SECRET!,
});

export type StravaActivity = {
  id: number;
  name: string;
  moving_time: number;
  elapsed_time: number;
  type: string;
  distance: number;
  start_date: string;
  start_latlng: [number, number];
  map: {
    summary_polyline: string;
  };
  total_elevation_gain: number;
  workout_type: number;
};

export type StravaAthlete = {
  shoes: {
    id: string;
    name: string;
    distance: number;
  }[];
};

export const stravaRouter = createTRPCRouter({
  getActivities: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user.id;
    const account = await ctx.prisma.account.findFirst({
      where: {
        userId,
      },
    });

    if (!account) {
      return [];
    }
    const activities = (await strava.athlete.listActivities({
      access_token: account.access_token,
      per_page: 100,
    })) as StravaActivity[];

    // console.log({ activities });
    return activities.filter((activity) => activity.type === "Run");
  }),
  getShoes: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user.id;
    const account = await ctx.prisma.account.findFirst({
      where: { userId },
    });

    if (!account) {
      return null;
    }

    const athlete = (await strava.athlete.get({
      access_token: account.access_token,
    })) as StravaAthlete;

    if (!athlete || !athlete.shoes) {
      return null;
    }

    return athlete.shoes.map((shoe) => {
      const { brand: brand_name, model: model_name } = parseShoeBrandModel(
        shoe.name
      );

      return {
        id: shoe.id,
        brand_name,
        model_name,
        distance: shoe.distance,
      };
    });
  }),
  getRaceActivities: protectedProcedure
    .input(
      z.object({
        page: z.number().nullish(),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const page = input.page ?? 1;
      const userId = ctx.session?.user.id;
      const account = await ctx.prisma.account.findFirst({
        where: {
          userId,
        },
      });

      if (!account) {
        return null;
      }
      const activities = (await strava.athlete.listActivities({
        access_token: account.access_token,
        page: page,
        per_page: 100,
      })) as StravaActivity[];
      const races = activities.filter(
        (activity) => activity.type === "Run" && activity.workout_type === 1
      );

      console.log("activities", { page, activities: races.length });

      return {
        activities: races,
        nextCursor: races.slice(0, -1)[0]?.id,
      };
    }),
});
