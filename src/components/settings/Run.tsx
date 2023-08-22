import { metersToMiles } from "~/utils/activity";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { api } from "~/utils/api";
import { useState } from "react";
import { type Activity } from "~/types";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { Input } from "../ui/input";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { type RunProfile } from "@prisma/client";
import { type StravaActivity } from "~/server/api/routers/strava";

type SettingFormProps = {
  profile: RunProfile | null;
};

type FormValues = {
  username: string;
  highlightRun: {
    id: number;
    name: string;
    start_date: string;
    elapsed_time: number;
    moving_time: number;
    distance: number;
    total_elevation_gain: number;
    start_latlng: [number, number];
    summary_polyline: string;
  };
};

function RunSettingForm({ profile }: SettingFormProps) {
  const highlightRun = profile.highlightRun as Activity;

  const methods = useForm<FormValues>({
    defaultValues: {
      username: "username",
      highlightRun: {
        id: highlightRun.id,
        name: highlightRun.name,
        start_date: highlightRun.start_date,
        elapsed_time: highlightRun.elapsed_time,
        moving_time: highlightRun.moving_time,
        distance: highlightRun.distance,
        total_elevation_gain: highlightRun.total_elevation_gain,
        start_latlng: highlightRun.start_latlng,
        summary_polyline: highlightRun.summary_polyline,
      },
    },
  });
  const { handleSubmit } = methods;

  const utils = api.useContext();
  const updateProfile = api.runProfile.updateProfile.useMutation({
    onSuccess: async (newEntry) => {
      await utils.runProfile.getProfile.invalidate();
    },
    onError: (error) => {
      console.log({ error });
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    updateProfile.mutate({
      highlightRun: {
        ...data.highlightRun,
      },
    });
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="space-y-8">
        <HighlightRunSettings />
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </FormProvider>
  );
}

function HighlightRunSettings() {
  const { setValue, control } = useFormContext();
  const handleImportActivity = (activity: Activity | undefined) => {
    console.log("handle import", activity);
    setValue("highlightRun", activity);
  };

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
          </FormItem>
        )}
      ></FormField>
      <FormField
        control={control}
        name="highlightRun.moving_time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Moving Time</FormLabel>
            <FormControl>
              <Input placeholder="moving time" {...field} />
            </FormControl>
          </FormItem>
        )}
      ></FormField>
      <FormField
        control={control}
        name="highlightRun.elapsed_time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Elapsed Time</FormLabel>
            <FormControl>
              <Input placeholder="elapsed time" {...field} />
            </FormControl>
          </FormItem>
        )}
      ></FormField>
      <FormField
        control={control}
        name="highlightRun.distance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Distance</FormLabel>
            <FormControl>
              <Input placeholder="distance" {...field} />
            </FormControl>
          </FormItem>
        )}
      ></FormField>
      <FormField
        control={control}
        name="highlightRun.total_elevation_gain"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Elevation</FormLabel>
            <FormControl>
              <Input placeholder="elevation" {...field} />
            </FormControl>
          </FormItem>
        )}
      ></FormField>
      <ImportDialogContent handleImportActivity={handleImportActivity} />
    </>
  );
}

type ImportDialogContentProps = {
  handleImportActivity: (activity: Activity | undefined) => void;
};

function ImportDialogContent({
  handleImportActivity,
}: ImportDialogContentProps) {
  const { data, isLoading } = api.strava.getActivities.useQuery();
  const [selectedActivity, setSelectedActivity] = useState<Activity>();
  const [open, setOpen] = useState(false);
  const handleSelectActivity = (id: string) => {
    const activity = data?.find((a) => a.id.toString() === id);

    if (!activity) return;

    console.log("handle select activity", activity);
    const selectedActivity = {
      id: activity.id,
      name: activity.name,
      start_date: activity.start_date,
      moving_time: activity.moving_time,
      elapsed_time: activity.elapsed_time,
      distance: activity.distance,
      total_elevation_gain: activity.total_elevation_gain,
      start_latlng: activity.start_latlng,
      summary_polyline: activity.map.summary_polyline,
    };
    console.log("selectedActivity:", selectedActivity);
    setSelectedActivity(selectedActivity);
  };

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
        <DialogHeader>
          <DialogTitle>Import Strava Activity</DialogTitle>
          <DialogDescription>
            Select any activity to be imported as highlight run.
          </DialogDescription>
        </DialogHeader>
        <Select onValueChange={(e) => handleSelectActivity(e)}>
          <SelectTrigger className="">
            <SelectValue placeholder="Select activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {data.map((activity: StravaActivity) => {
                return (
                  <SelectItem key={activity.id} value={activity.id.toString()}>
                    {activity.name} {metersToMiles(activity.distance)} mi
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              handleImportActivity(selectedActivity);
              setOpen(false);
            }}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RunSettingForm;
