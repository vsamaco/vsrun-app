import { z } from "zod";
import { SHOE_CATEGORIES } from "~/types";

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

export const RunSettingsFormSchema = z
  .object({
    name: z
      .string({
        required_error: "Name is required.",
      })
      .min(1),
    start_date: z.coerce.date(),
    start_latlng: z.array(z.number()).optional(),
    moving_time: z.coerce
      .number({
        required_error: "Moving time is required.",
      })
      .min(1),
    moving_time_hms: z
      .string()
      .refine(
        (value) => /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]$/.test(value),
        "Format must be HH:mm:ss"
      ),
    distance: z.coerce
      .number({
        required_error: "Distance is required.",
      })
      .min(1),
    distance_mi: z.coerce.number(),
    total_elevation_gain: z.coerce
      .number({
        required_error: "Elevation is required.",
      })
      .min(-1000),
    total_elevation_gain_ft: z.coerce.number(),
    summary_polyline: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (!values.moving_time && !values.moving_time_hms) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["moving_time_hms"],
        message: "Moving time is required",
      });
    }
    if (!values.distance && !values.distance_mi) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["distance_mi"],
        message: "Distance is required",
      });
    }
    if (!values.total_elevation_gain && !values.total_elevation_gain_ft) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["total_elevation_gain_ft"],
        message: "Elevation is required",
      });
    }
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

export const ShoeSettingsFormSchema = z.object({
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
  categories: z.array(z.enum(SHOE_CATEGORIES)),
  description: z.string().optional(),
});

export const EventSettingsFormSchema = z
  .object({
    name: z
      .string({
        required_error: "Name is required.",
      })
      .min(1),
    start_date: z.coerce.date({
      required_error: "Start date is required.",
    }),
    moving_time: z.coerce.number(),
    moving_time_hms: z
      .string()
      .refine(
        (value) => /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]$/.test(value),
        "Format must be HH:mm:ss"
      )
      .optional(),
    distance: z.coerce
      .number({
        required_error: "Distance is required.",
      })
      .min(1),
    distance_mi: z.coerce.number(),
  })
  .superRefine((values, context) => {
    if (!values.distance && !values.distance_mi) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["distance_mi"],
        message: "Distance is required",
      });
    }
  });

export const ShoeRotationFormSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  shoes: z.array(ShoeSettingsFormSchema),
});
