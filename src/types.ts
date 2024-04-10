import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "./server/api/root";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    // Insert your types here!
    type ShoeRotationShoeType = Omit<Shoe, "id" | "slug">;
    type ProfileHighlightRunType = Activity | Record<string, never>;
    type ProfileWeekStatsType = WeekStat | Record<string, never>;
    type ProfileShoesType = Omit<Shoe, "slug" | "start_date">[] | undefined;
    type ProfileEventsType = RaceEvent[] | undefined;
    type RaceLapType = RaceActivity["laps"][0];
    type ActivityLatLng = [number, number];
  }
}

export type Activity = {
  name: string;
  start_date: Date;
  workout_type?: string;
  moving_time: number;
  moving_time_hms?: string;
  distance: number;
  distance_mi?: number;
  total_elevation_gain: number;
  total_elevation_gain_ft?: number;
  start_latlng?: [number, number];
  end_latlng?: [number, number];
  summary_polyline?: string;
  metadata: {
    external_id: string;
    external_source: string;
  } | null;
};

export type ActivityLap = Activity & {
  lap_index: number;
  split_index: number;
};

export type WeekStat = {
  start_date: Date;
  end_date: Date;
  total_runs: number;
  total_duration: number;
  total_duration_hms?: string;
  total_distance: number;
  total_distance_mi?: number;
  total_elevation: number;
  total_elevation_ft?: number;
  activities: Activity[];
  metadata: {
    external_source: string;
  } | null;
};

export type Shoe = {
  slug: string;
  brand_name: string;
  model_name: string;
  start_date: Date;
  distance: number;
  distance_mi?: number;
  categories: ShoeCategories[];
  description?: string;
  metadata?: {
    external_source: string;
    external_id: string;
  } | null;
};

export type RaceEvent = {
  name: string;
  start_date: string;
  moving_time: number;
  moving_time_hms?: string;
  distance: number;
  distance_mi?: number;
  total_elevation_gain: number;
  total_elevation_gain_ft?: number;
};

export const ActivityWorkoutType = {
  1: "race",
  2: "long_run",
  3: "workout",
} as const;

export type ActivityWorkoutKeys = keyof typeof ActivityWorkoutType;
export type ActivityWorkoutTypes =
  (typeof ActivityWorkoutType)[keyof typeof ActivityWorkoutType];

export type RaceActivity = Activity & {
  id: string;
  slug: string;
  description: string;
  workout_type?: ActivityWorkoutTypes;
  laps: ActivityLap[];
  metadata?: {
    external_id: string;
    external_source: string;
  };
};

export const SHOE_CATEGORIES = [
  "daily_trainer",
  "easy",
  "long_run",
  "tempo",
  "track",
  "trail",
  "race",
] as const;
export type ShoeCategories = (typeof SHOE_CATEGORIES)[number];

export type ShoeRotation = {
  id: string;
  slug: string;
  start_date: Date;
  name: string;
  description: string;
  shoeList: ShoeCategories[];
  shoes: Shoe[];
};

type RouterOutput = inferRouterOutputs<AppRouter>;
export type ShoeType = RouterOutput["shoe"]["getUserShoes"][0];
export type ShoeRotationType =
  RouterOutput["shoeRotation"]["getUserShoeRotations"][0];

export type RunProfileType = RouterOutput["runProfile"]["getUserProfile"];
export type RaceProfileType = RouterOutput["activity"]["getProfileRaceBySlug"];
export type HighlightRunProfileType =
  RouterOutput["activity"]["getUserProfileHighlightRun"];
export type StravaShoeType = RouterOutput["strava"]["getShoes"][0];
