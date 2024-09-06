import { type StravaActivity } from "~/server/api/routers/strava";

export const stravaActivityFixture: StravaActivity = {
  name: "Foo Activity",
  laps: [],
  distance: 27527.2,
  moving_time: 9946,
  total_elevation_gain: 150,
  type: "Run",
  workout_type: 2,
  id: 123456789,
  start_date: "2024-03-31T20:48:06Z",
  map: {
    summary_polyline: "",
    polyline: "",
  },
  gear_id: "gear_id",
  start_latlng: [37.8, -122.46],
  end_latlng: [37.8, -122.46],
};
