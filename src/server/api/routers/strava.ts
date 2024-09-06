import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type DetailedActivityResponse, default as strava } from "strava-v3";
import { z } from "zod";
import { type ActivityWorkoutKeys } from "~/types";
import { parseShoeBrandModel } from "~/utils/shoe";

strava.config({
  access_token: "",
  redirect_uri: "http://localhost:3000/api/strava/callback",
  client_id: process.env.STRAVA_CLIENT_ID!,
  client_secret: process.env.STRAVA_CLIENT_SECRET!,
});

export type BaseActivity = {
  id: number;
  name: string;
  moving_time: number;
  type: string;
  distance: number;
  start_date: string;
  total_elevation_gain: number;
};

type BaseActivityLap = BaseActivity & {
  split_index: number;
  lap_index: number;
};

export type StravaActivity = BaseActivity & {
  start_latlng: [number, number];
  end_latlng: [number, number];
  map: {
    polyline: string;
    summary_polyline: string;
  };
  workout_type?: ActivityWorkoutKeys;
  laps: BaseActivityLap[];
  gear_id: string;
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
    console.log("========== GET STRAVA ACTIVITIES ============");
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
  getActivityById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      console.log("========== GET STRAVA SINGLE ACTIVITY ============");
      const userId = ctx.session?.user.id;
      const account = await ctx.prisma.account.findFirst({
        where: {
          userId,
        },
      });

      if (!account) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account not found",
        });
      }
      const response: DetailedActivityResponse = await strava.activities.get({
        id: input.id,
        access_token: account.access_token,
      });

      const activity: StravaActivity | null = response
        ? {
            id: +response.id,
            type: response.sport_type,
            name: response.name,
            start_date: new Date(response.start_date).toISOString(),
            workout_type: undefined,
            moving_time: response.moving_time || 0,
            distance: response.distance || 0,
            start_latlng:
              response.start_latlng as StravaActivity["start_latlng"],
            end_latlng: response.end_latlng as StravaActivity["end_latlng"],
            map: {
              polyline: response.map?.summary_polyline || "",
              summary_polyline: response.map?.summary_polyline || "",
            },
            total_elevation_gain: response.total_elevation_gain || 0,
            laps: [],
            gear_id: response.gear_id || "",
          }
        : null;
      return activity;
    }),
  getShoes: protectedProcedure.query(async ({ ctx }) => {
    console.log("======== GET STRAVA SHOES =========");
    const userId = ctx.session?.user.id;
    const account = await ctx.prisma.account.findFirst({
      where: { userId },
    });

    if (!account) {
      return [];
    }

    const athlete = (await strava.athlete.get({
      access_token: account.access_token,
    })) as StravaAthlete;

    if (!athlete || !athlete.shoes) {
      return [];
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
      console.log("======== GET STRAVA RACES =========");
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

      console.log("query:", activities.length);
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
