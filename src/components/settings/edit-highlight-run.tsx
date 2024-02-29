/* eslint-disable @typescript-eslint/no-misused-promises */
import { zodResolver } from "@hookform/resolvers/zod";

import { useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { type Activity } from "~/types";
import {
  feetToMeters,
  formatDurationHMS,
  metersToMiles,
  milesToMeters,
  parseHmsToSeconds,
} from "~/utils/activity";
import { api } from "~/utils/api";
import { RunSettingsFormSchema } from "~/utils/schemas";
import { toast } from "../ui/use-toast";
import { ToastClose } from "../ui/toast";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { type StravaActivity } from "~/server/api/routers/strava";
import { z } from "zod";
import { Calendar } from "../ui/calendar";

type FormValues = {
  highlightRun: Omit<Activity, "id">;
};

export function EditHighlightRun({
  highlightRun,
}: {
  highlightRun: Activity | Record<string, never>;
}) {
  const router = useRouter();

  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ highlightRun: RunSettingsFormSchema })),
    defaultValues: {
      highlightRun: {
        name: highlightRun?.name || "",
        start_date: highlightRun?.start_date,
        moving_time: highlightRun?.moving_time || 0,
        moving_time_hms: highlightRun?.moving_time_hms || "00:00:00",
        distance: highlightRun?.distance || 0,
        distance_mi: highlightRun?.distance_mi || 0,
        total_elevation_gain: highlightRun?.total_elevation_gain || 0,
        total_elevation_gain_ft: highlightRun?.total_elevation_gain_ft || 0,
        metadata: highlightRun?.metadata || null,
      },
    },
  });

  const utils = api.useContext();
  const updateRunProfile = api.runProfile.updateProfile.useMutation({
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
      const updatedRun = {
        ...data,
        start_date: new Date(data.highlightRun.start_date),
      };

      console.log("updatedRun:", updatedRun);
      updateRunProfile.mutate(updatedRun);
    },
    (errors) => {
      console.log("errors:", errors);
    }
  );

  const handleRemove = () => {
    updateRunProfile.mutate({ highlightRun: null });
  };

  return (
    <>
      <FormProvider {...methods}>
        <form id="hook-form" onSubmit={onSubmit} className="space-y-8">
          <ImportRunModal />
          <EditRunForm />
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
    </>
  );
}

function EditRunForm() {
  const { control, setValue } = useFormContext<FormValues>();
  return (
    <>
      <FormField
        control={control}
        name="highlightRun.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="name" {...field} />
            </FormControl>
            <FormDescription>The name of the run activity.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
      <FormField
        control={control}
        name={`highlightRun.start_date`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
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
                  selected={new Date(field.value)}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormDescription>The start date of the activity</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="highlightRun.moving_time_hms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Moving Time (hh:mm:ss)</FormLabel>
            <FormControl>
              <Input
                placeholder="moving time hms"
                {...field}
                onBlur={(e) => {
                  const movingTimeSeconds = parseHmsToSeconds(e.target.value);
                  setValue("highlightRun.moving_time", movingTimeSeconds);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
      <FormField
        control={control}
        name={`highlightRun.moving_time`}
        render={({ field }) => (
          <FormItem>
            <FormMessage />
            <FormControl>
              <Input placeholder="moving time" type="hidden" {...field} />
            </FormControl>
          </FormItem>
        )}
      ></FormField>

      <FormField
        control={control}
        name="highlightRun.distance_mi"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Distance (mi)</FormLabel>
            <FormControl>
              <Input
                placeholder="distance"
                {...field}
                onBlur={(e) => {
                  const distanceMeters = milesToMeters(+e.target.value);
                  setValue("highlightRun.distance", distanceMeters);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
      <FormField
        control={control}
        name={`highlightRun.distance`}
        render={({ field }) => (
          <FormItem>
            <FormMessage />
            <FormControl>
              <Input placeholder="distance" type="hidden" {...field} />
            </FormControl>
          </FormItem>
        )}
      ></FormField>

      <FormField
        control={control}
        name="highlightRun.total_elevation_gain_ft"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Elevation (ft)</FormLabel>
            <FormControl>
              <Input
                placeholder="elevation"
                {...field}
                onBlur={(e) => {
                  const elevationMeters = milesToMeters(+e.target.value);
                  setValue(
                    "highlightRun.total_elevation_gain",
                    elevationMeters
                  );
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
      <FormField
        control={control}
        name={`highlightRun.total_elevation_gain`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                placeholder="total elevation gain"
                type="hidden"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
    </>
  );
}

function ImportRunModal() {
  const [open, setOpen] = useState(false);
  const methods = useFormContext<FormValues>();

  const setSelectedActivity = (activity: StravaActivity) => {
    console.log("import activity:", activity);
    methods.setValue("highlightRun", {
      name: activity.name,
      start_date: new Date(activity.start_date),
      moving_time: activity.moving_time,
      moving_time_hms: formatDurationHMS(activity.moving_time),
      distance: activity.distance,
      distance_mi: metersToMiles(activity.distance),
      start_latlng: activity.start_latlng,
      summary_polyline: activity.map.summary_polyline,
      total_elevation_gain: activity.total_elevation_gain,
      total_elevation_gain_ft: activity.total_elevation_gain
        ? feetToMeters(activity.total_elevation_gain)
        : 0,
      metadata: {
        external_id: activity.id.toString(),
        external_source: "Strava",
      },
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          Import Activity from Strava
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Activity</DialogTitle>
          <DialogDescription>
            Choose an activity to import as highlighted run.
          </DialogDescription>
        </DialogHeader>

        <ImportRunForm setSelectedActivity={setSelectedActivity} />

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImportRunForm({
  setSelectedActivity,
}: {
  setSelectedActivity: (activity: StravaActivity) => void;
}) {
  const { data: activities, isLoading } = api.strava.getActivities.useQuery();
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!activities) {
    return <div>No activities found</div>;
  }

  const handleImportSelect = (activity: StravaActivity) => {
    setSelectedActivity({ ...activity });
  };

  return (
    <>
      <div className="max-h-[300px] overflow-scroll">
        {activities.map((activity) => {
          return (
            <div
              key={activity.id}
              className="flex items-center justify-between space-x-5 space-y-2"
            >
              <div className="flex w-full justify-between text-sm">
                <div className="w-[200px] truncate font-medium">
                  {activity.name}
                </div>
                <div className="font-light">
                  {metersToMiles(activity.distance).toLocaleString()} mi
                </div>
              </div>
              <div>
                <Button
                  variant="secondary"
                  onClick={() => handleImportSelect(activity)}
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
