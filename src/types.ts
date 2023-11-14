export type Activity = {
  id: number;
  name: string;
  start_date: string;
  moving_time: number;
  elapsed_time: number;
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
  id: string;
  brand_name: string;
  model_name: string;
  distance: number;
};

export type Event = {
  id: number;
  name: string;
  start_date: string;
  distance: number;
};
