import { z } from "zod";
import { ActivityWorkoutType, SHOE_CATEGORIES } from "~/types";

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

const BaseActivitySchema = z.object({
  name: z
    .string({
      required_error: "Name is required.",
    })
    .min(1),
  start_date: z.coerce.date(),
  start_latlng: z.tuple([z.number(), z.number()]).optional(),
  end_latlng: z.tuple([z.number(), z.number()]).optional(),
  moving_time: z.coerce
    .number({
      required_error: "Moving time is required.",
    })
    .min(1, { message: "Moving time must be greater than 0" }),
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
    .min(1, { message: "Distance must be greater than 0" }),
  distance_mi: z.coerce.number().optional(),
  total_elevation_gain: z.coerce.number({
    required_error: "Elevation is required.",
  }),
  total_elevation_gain_ft: z.coerce.number().optional(),
  summary_polyline: z.string().optional(),
  metadata: z
    .object({
      external_id: z.string(),
      external_source: z.string(),
    })
    .optional(),
});

const ActivityLapSchema = BaseActivitySchema.merge(
  z.object({
    lap_index: z.coerce.number(),
    split_index: z.coerce.number(),
  })
);

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
      .min(1, { message: "Moving time must be greater than 0" }),
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
      .min(1, { message: "Distance must be greater than 0" }),
    distance_mi: z.coerce.number().optional(),
    total_elevation_gain: z.coerce.number({
      required_error: "Elevation is required.",
    }),
    total_elevation_gain_ft: z.coerce.number().optional(),
    summary_polyline: z.string().optional(),
    metadata: z
      .object({
        external_id: z.string(),
        external_source: z.string(),
      })
      .nullable(),
    workout_type: z.string().optional(),
    laps: z.array(ActivityLapSchema).optional(),
  })
  .superRefine((values, context) => {
    // if (!values.moving_time && !values.moving_time_hms) {
    //   context.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     path: ["moving_time_hms"],
    //     message: "Moving time is required",
    //   });
    // }
    // if (!values.distance && !values.distance_mi) {
    //   context.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     path: ["distance_mi"],
    //     message: "Distance is required",
    //   });
    // }
    // if (!values.total_elevation_gain && !values.total_elevation_gain_ft) {
    //   context.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     path: ["total_elevation_gain_ft"],
    //     message: "Elevation is required",
    //   });
    // }
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
  id: z.string().optional(),
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
  distance: z.coerce.number(),
  start_date: z.coerce.date(),
  categories: z.array(z.enum(SHOE_CATEGORIES)),
  description: z.string().optional(),
  metadata: z
    .object({
      external_id: z.string(),
      external_source: z.string(),
    })
    .optional()
    .nullable(),
});

export const EventSettingsFormSchema = z.object({
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
  distance_mi: z.coerce.number().optional(),
  total_elevation_gain: z.coerce.number({
    required_error: "Elevation is required.",
  }),
  total_elevation_gain_ft: z.coerce.number().optional(),
});

export const ShoeRotationFormSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  shoeList: z
    .array(ShoeSettingsFormSchema)
    .min(1, { message: "must contain at least 1 shoe" }),
  shoes: z.array(ShoeSettingsFormSchema),
});

export const RaceFormSchema = BaseActivitySchema.merge(
  z.object({
    workout_type: z.enum(["race", "workout", "long_run"]).optional(),
    description: z.string(),
    laps: z.array(ActivityLapSchema).optional(),
  })
);
