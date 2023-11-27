import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { z } from "zod";
import { api } from "~/utils/api";
import { WeekSettingsFormSchema } from "~/utils/schemas";
import {
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "../ui/form";
import { toast } from "../ui/use-toast";
import { type WeekStat } from "~/types";
import { ToastClose } from "../ui/toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { type RunProfile } from "@prisma/client";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "~/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, setDay } from "date-fns";
import { metersToMiles } from "~/utils/activity";

type FormValues = {
  weekStats: WeekStat;
};

function EditWeekStatsModal({ profile }: { profile: RunProfile }) {
  const weekStat = profile.weekStats as WeekStat;
  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ weekStats: WeekSettingsFormSchema })),
    defaultValues: {
      weekStats: {
        start_date: weekStat?.start_date,
        end_date: weekStat?.end_date,
        total_runs: weekStat?.total_runs,
        total_distance: weekStat?.total_distance,
        total_duration: weekStat?.total_duration,
        total_elevation: weekStat?.total_elevation,
      },
    },
  });

  const utils = api.useContext();
  const updateWeekStatProfile = api.runProfile.updateProfile.useMutation({
    onSuccess: async (newEntry) => {
      await utils.runProfile.getUserProfile.invalidate();
      setOpen(false);

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
      updateWeekStatProfile.mutate(data);
    },
    (errors) => {
      console.log("errors:", errors);
    }
  );

  const handleRemove = () => {
    console.log("remove week stats");
    updateWeekStatProfile.mutate({ weekStats: null });
    methods.reset({
      weekStats: {
        start_date: "",
        end_date: "",
        total_runs: "",
        total_distance: "",
        total_duration: "",
        total_elevation: "",
      },
    });
  };

  const [showImport, setShowImport] = useState(false);
  const handleImportShoe = () => setShowImport(true);

  const setSelectedWeekStats = (weekStats: WeekStat) => {
    setShowImport(false);
    console.log("import activity:", weekStats);
    methods.setValue("weekStats.start_date", weekStats.start_date);
    methods.setValue("weekStats.end_date", weekStats.end_date);
    methods.setValue("weekStats.total_runs", weekStats.total_runs);
    methods.setValue("weekStats.total_duration", weekStats.total_duration);
    methods.setValue("weekStats.total_distance", weekStats.total_distance);
    methods.setValue("weekStats.total_elevation", weekStats.total_elevation);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Edit Week Stats</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <FormProvider {...methods}>
          <form id="hook-form" onSubmit={onSubmit} className="space-y-8">
            <DialogHeader>
              <DialogTitle>Edit Week Stats</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            {!showImport && <EditWeekStatsForm />}
            {showImport && (
              <ImportRunForm setSelectedWeekStats={setSelectedWeekStats} />
            )}

            <DialogFooter>
              {weekStat && (
                <Button type="button" onClick={handleRemove}>
                  Remove
                </Button>
              )}
              {!showImport && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleImportShoe}
                >
                  Import from Strava
                </Button>
              )}
              {!showImport && (
                <Button type="submit" form="hook-form">
                  Save changes
                </Button>
              )}
              {showImport && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowImport(false)}
                >
                  Cancel
                </Button>
              )}
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

function ImportRunForm({
  setSelectedWeekStats,
}: {
  setSelectedWeekStats: (weekStats: WeekStat) => void;
}) {
  const { data: activities, isLoading } = api.strava.getActivities.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!activities) {
    return <div>No activities found</div>;
  }

  const handleImportSelect = (weekStats: WeekStat) => {
    setSelectedWeekStats({
      start_date: weekStats.start_date,
      end_date: weekStats.end_date,
      total_runs: weekStats.total_runs,
      total_distance: weekStats.total_distance,
      total_duration: weekStats.total_duration,
      total_elevation: weekStats.total_elevation,
    });
  };

  const weeklyActivities = {};
  const groupActivitiesByWeek = () => {
    console.log("called GA");
    activities.forEach((activity) => {
      const date = new Date(activity.start_date);
      const key = format(date, "yyyy-I");
      const startWeek = setDay(date, 1, { weekStartsOn: 1 });
      const endWeek = setDay(date, 6);

      if (!weeklyActivities[key]) {
        weeklyActivities[key] = {
          start_date: startWeek,
          end_date: endWeek,
          activities: [activity],
          total_distance: activity.distance,
          total_duration: activity.moving_time,
          total_elevation: activity.total_elevation_gain,
          total_runs: 1,
        };
      } else {
        const currentWeek = weeklyActivities[key];
        weeklyActivities[key] = {
          start_date: currentWeek.start_date,
          end_date: currentWeek.end_date,
          activities: [...currentWeek.activities, activity],
          total_distance: currentWeek.total_distance + activity.distance,
          total_duration: currentWeek.total_duration + activity.moving_time,
          total_elevation:
            currentWeek.total_elevation + activity.total_elevation_gain,
          total_runs: currentWeek.total_runs + 1,
        };
      }
    });
  };
  groupActivitiesByWeek();

  return (
    <>
      <p className="text-sm">Choose shoe to import:</p>
      <div className="max-h-[300px] space-y-2 overflow-scroll">
        {Object.keys(weeklyActivities).map((groupKey, index) => {
          return (
            <div
              key={groupKey}
              className="flex items-center justify-between space-x-2 space-y-1"
            >
              <div className="flex w-full justify-between text-sm">
                <div className="flex flex-col">
                  <div className="font-medium">
                    {format(weeklyActivities[groupKey].start_date, "LL/dd")} -
                    {format(weeklyActivities[groupKey].end_date, "LL/dd")}
                  </div>
                  <div className="font-light">
                    {weeklyActivities[groupKey].activities.map((activity) => {
                      return <div key={activity.id}>{activity.name}</div>;
                    })}
                  </div>
                </div>
                <div>
                  {Math.ceil(
                    metersToMiles(weeklyActivities[groupKey].total_distance)
                  )}{" "}
                  mi
                </div>
              </div>
              <div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    handleImportSelect({
                      start_date: weeklyActivities[groupKey].start_date,
                      end_date: weeklyActivities[groupKey].end_date,
                      total_runs: weeklyActivities[groupKey].total_runs,
                      total_duration: weeklyActivities[groupKey].total_duration,
                      total_distance: weeklyActivities[groupKey].total_distance,
                      total_elevation:
                        weeklyActivities[groupKey].total_elevation,
                    })
                  }
                >
                  Select
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function EditWeekStatsForm() {
  const { control } = useFormContext();

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
        name="weekStats.total_distance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Distance</FormLabel>
            <FormControl>
              <Input placeholder="total distance" {...field} />
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
            <FormLabel>Total Duration</FormLabel>
            <FormControl>
              <Input placeholder="total duration" {...field} />
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
            <FormLabel>Total Elevation</FormLabel>
            <FormControl>
              <Input placeholder="total elevation" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
    </>
  );
}

export default EditWeekStatsModal;
