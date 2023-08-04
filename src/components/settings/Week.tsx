import { type RunProfile } from "@prisma/client";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { type StravaActivity } from "~/server/api/routers/strava";
import { type WeekStat } from "~/types";
import { api as tApi } from "~/utils/api";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  Form,
} from "../ui/form";
import { Input } from "../ui/input";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { metersToMiles } from "~/utils/activity";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";

type Props = {
  profile: RunProfile;
  activities: StravaActivity[];
};

type WeekStatFormValues = {
  weekStats: {
    start_date: Date;
    end_date: Date;
    total_runs: number;
    total_distance: number;
    total_duration: number;
    total_elevation: number;
  };
};

function WeekSettingsForm({ profile, activities }: Props) {
  const weekStat = profile.weekStats as WeekStat;

  const methods = useForm<WeekStatFormValues>({
    defaultValues: {
      weekStats: {
        start_date: new Date(weekStat.start_date),
        end_date: new Date(weekStat.end_date),
        total_runs: weekStat.total_runs,
        total_distance: weekStat.total_distance,
        total_duration: weekStat.total_duration,
        total_elevation: weekStat.total_elevation,
      },
    },
  });
  const { handleSubmit, setValue } = methods;

  const utils = tApi.useContext();
  const updateProfile = tApi.runProfile.updateProfile.useMutation({
    onSuccess: async (newEntry) => {
      await utils.runProfile.getProfile.invalidate();
    },
    onError: (error) => {
      console.log({ error });
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log({ data });
    updateProfile.mutate({
      weekStats: {
        ...data.weekStats,
        start_date: data.weekStats.start_date.toISOString(),
        end_date: data.weekStats.end_date.toISOString(),
      },
    });
  });

  const handleImportWeekStats = (activities: StravaActivity[]) => {
    if (!activities) {
      return;
    }

    const totals = {
      total_runs: 0,
      total_distance: 0,
      total_duration: 0,
      total_elevation: 0,
      start_date: new Date(activities.slice(-1)[0]?.start_date),
      end_date: new Date(activities.slice(0)[0]?.start_date),
    };

    activities.forEach((activity) => {
      totals.total_runs += 1;
      totals.total_distance += activity.distance;
      totals.total_duration += activity.moving_time;
      totals.total_elevation += activity.total_elevation_gain;
    });

    setValue("weekStats", totals);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="space-y-8">
        <FormField
          control={methods.control}
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
                        format(field.value, "PPP")
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
            </FormItem>
          )}
        />
        <FormField
          control={methods.control}
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
                        format(field.value, "PPP")
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
            </FormItem>
          )}
        />
        <FormField
          control={methods.control}
          name="weekStats.total_runs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Runs</FormLabel>
              <FormControl>
                <Input placeholder="total runs" {...field} />
              </FormControl>
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={methods.control}
          name="weekStats.total_runs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Distance</FormLabel>
              <FormControl>
                <Input placeholder="total distance" {...field} />
              </FormControl>
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={methods.control}
          name="weekStats.total_duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Duration</FormLabel>
              <FormControl>
                <Input placeholder="total duration" {...field} />
              </FormControl>
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={methods.control}
          name="weekStats.total_elevation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Elevation</FormLabel>
              <FormControl>
                <Input placeholder="total elevation" {...field} />
              </FormControl>
            </FormItem>
          )}
        ></FormField>
        <ImportDialogContent handleImportWeekStats={handleImportWeekStats} />
        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  );
}

type ImportDialogContentProps = {
  handleImportWeekStats: (activities: StravaActivity[]) => void;
};

function ImportDialogContent({
  handleImportWeekStats,
}: ImportDialogContentProps) {
  const { data, isLoading } = tApi.strava.getActivities.useQuery();
  const [open, setOpen] = useState(false);

  const form = useForm<{ activities: number[] }>({
    defaultValues: {
      activities: [],
    },
  });

  const onSubmit = form.handleSubmit((formData) => {
    const checkedActivities = data?.filter((x) =>
      formData.activities.includes(x.id)
    );
    console.log("submit checked activities:", checkedActivities);
    if (checkedActivities) {
      handleImportWeekStats(checkedActivities);
    }
    setOpen(false);
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!data) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Import Strava Activity</Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form className="space-y-4">
            <DialogHeader>
              <DialogTitle>Import Strava Activity</DialogTitle>
              <DialogDescription>
                Select any activity to be imported as highlight run.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[200px] space-y-2 rounded-md border p-2">
              <div className="space-y-2">
                {data.map((activity) => (
                  <FormField
                    key={activity.id}
                    control={form.control}
                    name="activities"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={activity.id.toString()}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(activity.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...field.value,
                                      activity.id,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== activity.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {activity.name} {metersToMiles(activity.distance)}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button type="button" onClick={onSubmit}>
                Import
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default WeekSettingsForm;
