import { z } from "zod";

export const RunSettingsFormSchema = z.object({
  id: z.number(),
  name: z
    .string({
      required_error: "Name is required.",
    })
    .min(1),
  start_latlng: z.array(z.number()),
  elapsed_time: z.coerce
    .number({
      required_error: "Elapsed time is required.",
    })
    .min(1),
  moving_time: z.coerce
    .number({
      required_error: "Moving time is required.",
    })
    .min(1),
  distance: z.coerce
    .number({
      required_error: "Distance is required.",
    })
    .min(1),
  total_elevation_gain: z.coerce
    .number({
      required_error: "Elevation is required.",
    })
    .min(-1000),
  summary_polyline: z.string(),
});
