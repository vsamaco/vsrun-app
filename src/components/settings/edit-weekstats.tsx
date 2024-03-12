/* eslint-disable @typescript-eslint/no-misused-promises */
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { z } from "zod";
import { type WeekStat } from "~/types";
import { api } from "~/utils/api";
import { WeekSettingsFormSchema } from "~/utils/schemas";
import { toast } from "../ui/use-toast";
import { ToastClose } from "../ui/toast";
import { Button } from "../ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "~/lib/utils";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { useRouter } from "next/router";
import {
  formatDurationHMS,
  metersToFeet,
  metersToMiles,
  milesToMeters,
  parseHmsToSeconds,
} from "~/utils/activity";
import { type StravaActivity } from "~/server/api/routers/strava";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { API_CACHE_DURATION } from "~/utils/constants";

type FormValues = {
  weekStats: WeekStat;
};

function EditWeekStats({
  weekStats,
}: {
  weekStats: WeekStat | Record<string, never>;
}) {
  const router = useRouter();

  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ weekStats: WeekSettingsFormSchema })),
    defaultValues: {
      weekStats: {
        start_date: weekStats?.start_date
          ? new Date(weekStats?.start_date)
          : undefined,
        end_date: weekStats?.end_date
          ? new Date(weekStats?.end_date)
          : undefined,
        total_runs: weekStats?.total_runs,
        total_distance: weekStats?.total_distance || 0,
        total_distance_mi: weekStats.total_distance_mi
          ? weekStats.total_distance_mi
          : metersToMiles(weekStats.total_distance),
        total_duration: weekStats?.total_duration || 0,
        total_duration_hms: weekStats.total_duration_hms
          ? weekStats.total_duration_hms
          : formatDurationHMS(weekStats.total_duration),
        total_elevation: weekStats?.total_elevation || 0,
        total_elevation_ft: weekStats.total_elevation_ft
          ? weekStats.total_elevation_ft
          : Math.ceil(metersToFeet(weekStats.total_elevation)),
        metadata: weekStats?.metadata || null,
      },
    },
  });

  const utils = api.useContext();
  const updateWeekStatProfile = api.runProfile.updateProfile.useMutation({
    onSuccess: async (_) => {
      await utils.runProfile.getUserProfile.invalidate();
      await router.push("/settings");

      toast({ title: "Success", description: "Successfully saved changes." });
    },
    onError: (error) => {
      console.log({ error });
      toast({
        title: "Error",
        description: error.message,
        action: <ToastClose>Close</ToastClose>,
      });
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = handleSubmit(
    (data) => {
      console.log("onsubmit:", data);
      updateWeekStatProfile.mutate({
        weekStats: {
          ...data.weekStats,
          start_date: new Date(data.weekStats.start_date),
          end_date: new Date(data.weekStats.end_date),
        },
      });
    },
    (errors) => {
      console.log("errors:", errors);
    }
  );

  const handleRemove = async () => {
    console.log("remove week stats");
    updateWeekStatProfile.mutate({ weekStats: null });
    await router.push("/settings");
  };

  return (
    <FormProvider {...methods}>
      <form id="hook-form" onSubmit={onSubmit} className="space-y-8">
        <ImportFormModal />
        <EditWeekStatsForm />

        <div className="flex w-full items-center justify-between">
          <Button type="button" variant="outline" onClick={handleRemove}>
            Remove
          </Button>
          <Button type="submit" form="hook-form">
            Save changes
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

function EditWeekStatsForm() {
  const { control, setValue } = useFormContext<FormValues>();

  return (
    <>
      <FormField
        control={control}
        name="weekStats.start_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Start Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                      format(new Date(field.value), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormDescription>
              The start date of the week activities.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="weekStats.end_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>End Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                      format(new Date(field.value), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormDescription>
              The end date of the week activities.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="weekStats.total_runs"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Runs</FormLabel>
            <FormControl>
              <Input placeholder="total runs" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>

      <FormField
        control={control}
        name="weekStats.total_distance_mi"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Distance (mi)</FormLabel>
            <FormControl>
              <Input
                placeholder="total distance"
                {...field}
                onBlur={(e) => {
                  const distanceMeters = milesToMeters(+e.target.value);
                  setValue("weekStats.total_distance", distanceMeters);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
      <FormField
        control={control}
        name="weekStats.total_distance"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input type="hidden" placeholder="total distance" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>

      <FormField
        control={control}
        name="weekStats.total_duration_hms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Duration (hh:mm:ss)</FormLabel>
            <FormControl>
              <Input
                placeholder="total duration"
                {...field}
                onBlur={(e) => {
                  const movingTimeSeconds = parseHmsToSeconds(e.target.value);
                  setValue("weekStats.total_duration", movingTimeSeconds);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
      <FormField
        control={control}
        name="weekStats.total_duration"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input type="hidden" placeholder="total duration" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>

      <FormField
        control={control}
        name="weekStats.total_elevation_ft"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Elevation (ft)</FormLabel>
            <FormControl>
              <Input
                placeholder="total elevation"
                {...field}
                onBlur={(e) => {
                  const elevationMeters = milesToMeters(+e.target.value);
                  setValue("weekStats.total_elevation", elevationMeters);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
      <FormField
        control={control}
        name="weekStats.total_elevation"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input type="hidden" placeholder="total elevation" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
    </>
  );
}

type WeekGroupStats = {
  [index: string]: WeekStat & { activities: StravaActivity[] };
};

function ImportFormModal() {
  const [open, setOpen] = useState(false);
  const methods = useFormContext<FormValues>();

  const handleImportSelect = (weekStats: WeekStat) => {
    methods.setValue("weekStats", {
      start_date: weekStats.start_date,
      end_date: weekStats.end_date,
      total_runs: weekStats.total_runs,
      total_distance: weekStats.total_distance,
      total_distance_mi: metersToMiles(weekStats.total_distance),
      total_duration: weekStats.total_duration,
      total_duration_hms: formatDurationHMS(weekStats.total_duration),
      total_elevation: weekStats.total_elevation,
      total_elevation_ft: metersToFeet(weekStats.total_elevation),
      metadata: {
        external_source: "strava",
      },
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          Import Week from Strava
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Week</DialogTitle>
          <DialogDescription>
            Choose an week to import as weekly stats.
          </DialogDescription>
        </DialogHeader>

        <ImportRunForm setSelectedWeekStats={handleImportSelect} />

        <DialogFooter className="flex justify-end">
          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImportRunForm({
  setSelectedWeekStats,
}: {
  setSelectedWeekStats: (weekStats: WeekStat) => void;
}) {
  const { data: activities, isLoading } = api.strava.getActivities.useQuery(
    undefined,
    { staleTime: API_CACHE_DURATION.stravaGetActivities }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!activities) {
    return <div>No activities found</div>;
  }

  const weeklyActivities: WeekGroupStats = {};
  const groupActivitiesByWeek = () => {
    console.log("called GA");
    activities.forEach((activity) => {
      const date = new Date(activity.start_date);
      const key = format(date, "yyyy-I");
      const startWeek = startOfWeek(date, { weekStartsOn: 1 });
      const endWeek = endOfWeek(date, { weekStartsOn: 1 });

      // define new week group
      if (!weeklyActivities[key]) {
        weeklyActivities[key] = {
          start_date: startWeek,
          end_date: endWeek,
          activities: [activity],
          total_distance: activity.distance,
          total_duration: activity.moving_time,
          total_elevation: activity.total_elevation_gain,
          total_runs: 1,
          metadata: { external_source: "strava" },
        };
      } else {
        // append to existing week group
        const currentWeek = weeklyActivities[key];
        if (currentWeek) {
          weeklyActivities[key] = {
            ...currentWeek,
            activities: [...currentWeek.activities, activity],
            total_distance: currentWeek.total_distance + activity.distance,
            total_duration: currentWeek.total_duration + activity.moving_time,
            total_elevation:
              currentWeek.total_elevation + activity.total_elevation_gain,
            total_runs: currentWeek.total_runs + 1,
          };
        }
      }
      // console.log(weeklyActivities);
    });
  };
  groupActivitiesByWeek();

  const onSelectWeek = (
    currentWeek: WeekStat & { activities: StravaActivity[] }
  ) => {
    setSelectedWeekStats(currentWeek);
  };

  return (
    <div className="max-h-[300px] space-y-2 overflow-scroll">
      {Object.keys(weeklyActivities).map((groupKey) => {
        const currentWeek = weeklyActivities[groupKey];
        const weekStartFormatted =
          currentWeek?.start_date &&
          format(new Date(currentWeek?.start_date), "LL/dd");
        const weekEndFormatted =
          currentWeek?.start_date &&
          format(new Date(currentWeek?.end_date), "LL/dd");

        return (
          <div
            key={groupKey}
            className="flex items-center justify-between space-x-5 space-y-1"
          >
            <div className="w-full text-sm">
              <div className="flex justify-between font-medium">
                <div>
                  {weekStartFormatted &&
                    weekEndFormatted &&
                    [weekStartFormatted, weekEndFormatted].join(" - ")}
                </div>
                <div>
                  {currentWeek &&
                    metersToMiles(
                      currentWeek?.total_distance
                    ).toLocaleString()}{" "}
                  mi
                </div>
              </div>
              <div className="w-[250px] truncate font-light">
                {currentWeek?.activities.map((activity) => {
                  return <div key={activity.id}>{activity.name}</div>;
                })}
              </div>
            </div>
            <div>
              {currentWeek && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onSelectWeek(currentWeek)}
                >
                  Select
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default EditWeekStats;
