/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ToastClose } from "../ui/toast";
import { toast } from "../ui/use-toast";
import { api } from "~/utils/api";
import { EventSettingsFormSchema } from "~/utils/schemas";
import { type RaceEvent } from "~/types";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import {
  formatDurationHMS,
  metersToMiles,
  milesToMeters,
  parseHmsToSeconds,
} from "~/utils/activity";
import { type StravaActivity } from "~/server/api/routers/strava";

type FormValues = {
  event: RaceEvent & {
    moving_time_hms: string;
    distance_mi: number;
  };
};

function EditRaceModal({
  events = [],
  raceIndex,
  buttonType = "edit",
}: {
  events: RaceEvent[];
  raceIndex: number;
  buttonType?: "add" | "edit";
}) {
  const currentEvent = events?.at(raceIndex) ? events[raceIndex] : null;

  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ event: EventSettingsFormSchema })),
    defaultValues: {
      event: currentEvent
        ? currentEvent
        : {
            name: "",
            start_date: "",
            moving_time: 0,
            distance: 0,
            distance_mi: 0,
          },
    },
  });

  const utils = api.useContext();
  const updateRacesProfile = api.runProfile.updateProfile.useMutation({
    onSuccess: async (_) => {
      await utils.runProfile.getUserProfile.invalidate();
      setOpen(false);
      methods.reset();
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
      const updatedRace = {
        ...data.event,
        start_date: new Date(data.event.start_date),
      };

      // update existing event
      const updatedRaces = events.map((event, index) => {
        return index === raceIndex
          ? updatedRace
          : {
              name: event.name,
              start_date: new Date(event.start_date),
              moving_time: event.moving_time || 0,
              moving_time_hms: event?.moving_time
                ? formatDurationHMS(event.moving_time)
                : undefined,
              distance: event.distance,
              distance_mi: event?.distance ? metersToMiles(event.distance) : 0,
            };
      });

      // add new event
      if (raceIndex === events.length) {
        updatedRaces.push(updatedRace);
      }

      console.log("updatedRaces:", updatedRaces);
      updateRacesProfile.mutate({ events: updatedRaces });
    },
    (errors) => {
      console.log("errors:", errors);
    }
  );

  const handleRemove = () => {
    const updatedRaces = events
      .filter((race, index) => index !== raceIndex)
      .map((event) => ({
        name: event.name,
        start_date: new Date(event.start_date),
        distance: event.distance,
        distance_mi: metersToMiles(event.distance),
        moving_time: event.moving_time,
        moving_time_hms: formatDurationHMS(event.moving_time),
      }));
    updateRacesProfile.mutate({ events: updatedRaces });
  };

  const [showImport, setShowImport] = useState(false);
  const handleImportRun = () => setShowImport(true);

  const setSelectedActivity = (activity: StravaActivity) => {
    setShowImport(false);
    console.log("import activity:", activity);
    methods.setValue("event", {
      name: activity.name,
      start_date: activity.start_date,
      moving_time: activity.moving_time,
      moving_time_hms: formatDurationHMS(activity.moving_time),
      distance: activity.distance,
      distance_mi: metersToMiles(activity.distance),
    });
  };

  const diaglogTitle = buttonType === "edit" ? "Edit Race" : "Add Race";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {buttonType === "edit" ? (
          <Button variant="outline" className="">
            Edit
          </Button>
        ) : (
          <Button className="w-full">Add Race</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <FormProvider {...methods}>
          <form id="hook-form" onSubmit={onSubmit} className="space-y-8">
            <DialogHeader>
              <DialogTitle>{diaglogTitle}</DialogTitle>
              <DialogDescription>
                Make changes to your race here. Click save when you&apos;re
                done.
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
                <EditRaceForm />
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
                  <Button type="submit" form="hook-form">
                    Save changes
                  </Button>
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
  const { data: activities, isLoading } =
    api.strava.getRaceActivities.useQuery();
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!activities) {
    return <div>No races found</div>;
  }

  const handleImportSelect = (activity: StravaActivity) => {
    setSelectedActivity(activity);
  };

  return (
    <>
      <p className="text-sm">Choose race to import:</p>
      <div className="max-h-[300px] overflow-scroll">
        {activities.map((activity, index) => {
          return (
            <div
              key={activity.id}
              className="flex items-center justify-between space-x-2 space-y-1"
            >
              <div className="flex w-full justify-between pr-5 text-sm">
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

function EditRaceForm() {
  const { control, setValue, getValues } = useFormContext();

  return (
    <div>
      <FormItem className="">
        <FormField
          control={control}
          name={`event.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name:</FormLabel>
              <FormControl>
                <Input placeholder="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={control}
          name={`event.start_date`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Race Date</FormLabel>
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
          name={`event.distance_mi`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distance (mi):</FormLabel>
              <FormControl>
                <Input
                  placeholder="distance"
                  {...field}
                  onBlur={(e) => {
                    const distanceMeters = milesToMeters(
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                      getValues("event.distance_mi")
                    );
                    setValue("event.distance", distanceMeters);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={control}
          name={`event.moving_time_hms`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moving time (hh:mm:ss):</FormLabel>
              <FormControl>
                <Input
                  placeholder="hh:mm:ss"
                  {...field}
                  onBlur={(e) => {
                    const movingTimeHMS = parseHmsToSeconds(
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                      getValues("event.moving_time_hms")
                    );
                    setValue("event.moving_time", movingTimeHMS);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
      </FormItem>
    </div>
  );
}

export default EditRaceModal;
