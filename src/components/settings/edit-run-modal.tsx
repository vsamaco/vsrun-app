/* eslint-disable @typescript-eslint/no-misused-promises */
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { api } from "~/utils/api";
import { toast } from "../ui/use-toast";
import { ToastClose } from "../ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { type Activity } from "~/types";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { RunSettingsFormSchema } from "~/utils/schemas";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import {
  feetToMeters,
  formatDurationHMS,
  metersToMiles,
  milesToMeters,
  parseHmsToSeconds,
} from "~/utils/activity";
import { type StravaActivity } from "~/server/api/routers/strava";

type FormValues = {
  highlightRun: Activity & {
    moving_time_hms: string;
    distance_mi: number;
    total_elevation_gain_ft: number;
  };
};

function EditRunModal({ highlightRun }: { highlightRun: Activity | null }) {
  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        highlightRun: RunSettingsFormSchema,
      })
    ),
    defaultValues: {
      highlightRun: highlightRun || {
        name: "",
        start_date: undefined,
        moving_time: 0,
        moving_time_hms: "",
        distance: 0,
        distance_mi: 0,
        total_elevation_gain: 0,
        total_elevation_gain_ft: 0,
        metadata: null,
      },
    },
  });

  const utils = api.useContext();
  const updateRunProfile = api.runProfile.updateProfile.useMutation({
    onSuccess: async (_) => {
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
      const updatedRun = {
        ...data.highlightRun,
        start_date: new Date(data.highlightRun.start_date),
      };

      console.log("updatedRun:", updatedRun);
      updateRunProfile.mutate({ highlightRun: updatedRun });
    },
    (errors) => {
      console.log("errors:", errors);
    }
  );

  const handleRemove = () => {
    updateRunProfile.mutate({ highlightRun: null });
    methods.reset({
      highlightRun: {
        name: "",
        start_date: undefined,
        distance: 0,
        distance_mi: 0,
        moving_time: 0,
        moving_time_hms: "",
        total_elevation_gain: 0,
        total_elevation_gain_ft: 0,
        start_latlng: [],
        summary_polyline: "",
        metadata: null,
      },
    });
  };

  const [showImport, setShowImport] = useState(false);
  const handleImportRun = () => setShowImport(true);

  const setSelectedActivity = (activity: StravaActivity) => {
    setShowImport(false);
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
  };

  const dialogTitle = highlightRun ? "Edit Run" : "Create Run";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">{dialogTitle}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <FormProvider {...methods}>
          <form id="hook-form" onSubmit={onSubmit} className="space-y-8">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>
                Make changes to your run here. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>

            {!showImport && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleImportRun}
                >
                  Import from Strava
                </Button>
                <EditRunForm />
              </>
            )}
            {showImport && (
              <ImportRunForm setSelectedActivity={setSelectedActivity} />
            )}

            <DialogFooter>
              <div className="flex w-full items-center justify-between">
                {!showImport && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemove}
                  >
                    Remove
                  </Button>
                )}
                {showImport && (
                  <Button type="button" onClick={() => setShowImport(false)}>
                    Back
                  </Button>
                )}
                {!showImport && (
                  <>
                    <Button type="submit" form="hook-form">
                      Save changes
                    </Button>
                  </>
                )}
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
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
      <p className="text-sm">Choose run to import:</p>
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

function EditRunForm() {
  const { control, setValue } = useFormContext();
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
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  selected={new Date(field.value)}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormDescription>The start date of the event.</FormDescription>
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

export default EditRunModal;
