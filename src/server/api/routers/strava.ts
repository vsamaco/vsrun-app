import { api } from "~/utils/api";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { default as strava, Strava } from "strava-v3";
import { TRPCClientError } from "@trpc/client";

strava.config({
  access_token: "5c1dc67092d63182e49ca1b70614c7f86767da1b",
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
  start_date: Date;
  start_latlng: [number, number];
  map: {
    summary_polyline: string;
  };
  total_elevation_gain: number;
};

export const stravaRouter = createTRPCRouter({
  getActivities: publicProcedure.query(async ({ ctx }) => {
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
    })) as StravaActivity[];

    // console.log({ activities });
    return activities;
  }),
});
