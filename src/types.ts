export type ActivityProps = {
  id: string;
  name: string;
  moving_time: number;
  distance: number;
  total_elevation_gain: number;
  start_latlng: [number, number];
  summary_polyline: string;
};
