/* eslint-disable @typescript-eslint/no-misused-promises */
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { z } from "zod";
import { type StravaActivity } from "~/server/api/routers/strava";
import {
  ActivityWorkoutType,
  type RaceProfileType,
  type RaceActivity,
  type ActivityWorkoutTypes,
} from "~/types";
import {
  feetToMeters,
  formatDurationHMS,
  metersToFeet,
  metersToMiles,
  milesToMeters,
  parseHmsToSeconds,
} from "~/utils/activity";
import { api } from "~/utils/api";
import { RaceFormSchema } from "~/utils/schemas";
import { toast } from "../ui/use-toast";
import { Button } from "../ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
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
import { API_CACHE_DURATION } from "~/utils/constants";
import { useRouter } from "next/router";
import { Textarea } from "../ui/textarea";

type FormValues = {
  race: Omit<RaceActivity, "id" | "slug">;
};

function EditRaceForm({ race }: { race: RaceProfileType }) {
  const router = useRouter();
  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ race: RaceFormSchema })),
    defaultValues: {
      race: {
        name: race?.name || "",
        description: race?.description || "",
        workout_type: race?.workout_type
          ? (race.workout_type as ActivityWorkoutTypes)
          : undefined,
        start_date: race?.start_date,
        moving_time: race?.moving_time || 0,
        moving_time_hms: race?.moving_time
          ? formatDurationHMS(race.moving_time)
          : "0:00:00",
        distance: race?.distance || 0,
        distance_mi: race?.distance ? metersToMiles(race.distance) : 0,
        total_elevation_gain: race?.total_elevation_gain || 0,
        total_elevation_gain_ft: race?.total_elevation_gain
          ? metersToFeet(race?.total_elevation_gain)
          : 0,
        laps: race?.laps || [],
        metadata: race?.metadata || undefined,
      },
    },
  });

  const utils = api.useContext();
  const createRaceProfile = api.activity.createProfileRace.useMutation({
    onSuccess: async (_) => {
      await utils.activity.getProfileRaceBySlug.invalidate();
      await router.push("/settings/races");
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

  const updateRaceProfile = api.activity.updateProfileRace.useMutation({
    onSuccess: async (_) => {
      await utils.activity.getProfileRaceBySlug.invalidate();
      await router.push("/settings/races");
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

  const deleteRaceProfile = api.activity.deleteProfileActivity.useMutation({
    onSuccess: async (_) => {
      await utils.activity.getProfileRaceBySlug.invalidate();
      await router.push("/settings/races");
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

  const { handleSubmit, control, setValue } = methods;

  const onSubmit = handleSubmit(
    (data) => {
      console.log("updatedRaces:", data);
      const updatedRace = {
        ...data.race,
        laps: [],
        metadata: data.race.metadata,
      };
      if (!race) {
        console.log("create race");
        createRaceProfile.mutate({ body: updatedRace });
      } else {
        console.log("update race");
        updateRaceProfile.mutate({
          params: { slug: race.slug },
          body: updatedRace,
        });
      }
    },
    (errors) => {
      console.log("errors:", errors);
    }
  );

  const handleRemove = () => {
    if (race) {
      deleteRaceProfile.mutate({ params: { slug: race.slug } });
    }
  };

  return (
    <FormProvider {...methods}>
      <form id="hook-form" onSubmit={onSubmit} className="space-y-8">
        <ImportRunModal />

        <FormField
          control={control}
          name="race.name"
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
          name="race.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="description" {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>

        <FormField
          control={control}
          name={`race.start_date`}
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
          name="race.moving_time_hms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moving Time (hh:mm:ss)</FormLabel>
              <FormControl>
                <Input
                  placeholder="moving time hms"
                  {...field}
                  onBlur={(e) => {
                    const movingTimeSeconds = parseHmsToSeconds(e.target.value);
                    setValue("race.moving_time", movingTimeSeconds);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={control}
          name={`race.moving_time`}
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
          name="race.distance_mi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distance (mi)</FormLabel>
              <FormControl>
                <Input
                  placeholder="distance"
                  {...field}
                  onBlur={(e) => {
                    const distanceMeters = milesToMeters(+e.target.value);
                    setValue("race.distance", distanceMeters);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={control}
          name={`race.distance`}
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
          name="race.total_elevation_gain_ft"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Elevation (ft)</FormLabel>
              <FormControl>
                <Input
                  placeholder="elevation"
                  {...field}
                  onBlur={(e) => {
                    const elevationMeters = feetToMeters(+e.target.value);
                    setValue("race.total_elevation_gain", elevationMeters);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={control}
          name={`race.total_elevation_gain`}
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

        <div className="flex w-full items-center justify-between">
          {race && (
            <Button type="button" variant="outline" onClick={handleRemove}>
              Remove
            </Button>
          )}
          <Button type="submit" form="hook-form">
            Save changes
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

function ImportRunModal() {
  const [open, setOpen] = useState(false);
  const methods = useFormContext<FormValues>();

  const setSelectedActivity = (activity: StravaActivity) => {
    console.log("import activity:", activity);

    methods.setValue("race", {
      name: activity.name,
      description: methods.getValues("race.description"),
      start_date: new Date(activity.start_date),
      moving_time: activity.moving_time,
      moving_time_hms: formatDurationHMS(activity.moving_time),
      distance: activity.distance,
      distance_mi: metersToMiles(activity.distance),
      start_latlng: activity.start_latlng,
      end_latlng: activity.end_latlng,
      summary_polyline: activity.map.summary_polyline,
      total_elevation_gain: activity.total_elevation_gain,
      total_elevation_gain_ft: activity.total_elevation_gain
        ? metersToFeet(activity.total_elevation_gain)
        : 0,
      metadata: {
        external_id: activity.id.toString(),
        external_source: "strava",
      },
      workout_type: activity.workout_type
        ? ActivityWorkoutType[activity.workout_type]
        : undefined,
      laps: [],
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
            Choose an activity to import as race.
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
  const [page, setPage] = useState(1);
  const { data, isLoading } = api.strava.getRaceActivities.useQuery(
    { page },
    { staleTime: API_CACHE_DURATION.stravaGetActivities }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const activities = data?.activities || [];

  if (!activities) {
    return <div>No activities found</div>;
  }

  const handleImportSelect = (activity: StravaActivity) => {
    setSelectedActivity({ ...activity });
  };

  return (
    <>
      <div className="max-h-[300px] overflow-y-scroll">
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
      <div className="flex items-center justify-center gap-5">
        {page > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setPage((prevPage) => prevPage - 1)}
          >
            Prev {page - 1}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => setPage((prevPage) => prevPage + 1)}
        >
          Next {page}
        </Button>
      </div>
    </>
  );
}

export default EditRaceForm;
