export type ActivityProps = {
  id: string;
  name: string;
  moving_time: number;
  elapsed_time: number;
  distance: number;
  total_elevation_gain: number;
  start_latlng: [number, number];
  summary_polyline: string;
};

export type WeekStatProp = {
  start_date: Date;
  end_date: Date;
  total_runs: number;
  total_duration: number;
  total_distance: number;
  total_elevation: number;
};

export type ShoeProps = {
  id: string;
  brand_name: string;
  model_name: string;
  distance: number;
};
