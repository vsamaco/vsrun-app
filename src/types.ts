import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "./server/api/root";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    // Insert your types here!
    type ShoeRotationShoeType = Shoe;
    type ProfileHighlightRunType = Activity | Record<string, never>;
    type ProfileWeekStatsType = WeekStat | Record<string, never>;
    type ProfileShoesType = Shoe[] | undefined;
    type ProfileEventsType = RaceEvent[] | undefined;
  }
}

export type Activity = {
  name: string;
  start_date: string;
  moving_time: number;
  distance: number;
  total_elevation_gain: number;
  start_latlng: [number, number];
  summary_polyline: string;
};

export type WeekStat = {
  start_date: string;
  end_date: string;
  total_runs: number;
  total_duration: number;
  total_distance: number;
  total_elevation: number;
};

export type Shoe = {
  brand_name: string;
  model_name: string;
  distance: number;
  distance_mi?: number;
  categories: ShoeCategories[];
  description?: string;
};

export type RaceEvent = {
  name: string;
  start_date: string;
  moving_time: number;
  distance: number;
};

export const SHOE_CATEGORIES = [
  "daily_trainer",
  "tempo",
  "race",
  "long_run",
] as const;
type ShoeCategories = (typeof SHOE_CATEGORIES)[number];

export type ShoeRotation = {
  id: string;
  slug: string;
  start_date: Date;
  name: string;
  description: string;
  shoes: Shoe[];
};

type RouterOutput = inferRouterOutputs<AppRouter>;
export type ShoeRotationType =
  RouterOutput["shoeRotation"]["getUserShoeRotations"][0];
