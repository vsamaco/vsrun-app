import { z } from "zod";

export const GeneralSettingsFormSchema = z.object({
  slug: z
    .string({
      required_error: "Slug is required.",
    })
    .min(3),
  name: z
    .string({
      required_error: "Name is required.",
    })
    .min(3),
});

export const RunSettingsFormSchema = z.object({
  name: z
    .string({
      required_error: "Name is required.",
    })
    .min(1),
  start_date: z.coerce.date(),
  start_latlng: z.array(z.number()).optional(),
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
  summary_polyline: z.string().optional(),
});

export const WeekSettingsFormSchema = z.object({
  total_runs: z.coerce
    .number({
      required_error: "Total runs is required.",
    })
    .min(1),
  total_distance: z.coerce
    .number({
      required_error: "Total distance is required.",
    })
    .min(1),
  total_duration: z.coerce
    .number({
      required_error: "Total duration is required.",
    })
    .min(1),
  total_elevation: z.coerce
    .number({
      required_error: "Total elevation is required.",
    })
    .min(1),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
});

export const ShoeSettingsFormSchema = z.array(
  z.object({
    id: z.string(),
    brand_name: z
      .string({
        required_error: "Brand is required",
      })
      .min(1),
    model_name: z
      .string({
        required_error: "Model is required",
      })
      .min(1),
    distance: z.coerce.number().min(1),
  })
);

export const EventSettingsFormSchema = z.array(
  z.object({
    id: z.string(),
    name: z
      .string({
        required_error: "Name is required.",
      })
      .min(1),
    start_date: z.coerce.date({
      required_error: "Start date is required.",
    }),
    distance: z.coerce
      .number({
        required_error: "Distance is required.",
      })
      .min(1),
  })
);
