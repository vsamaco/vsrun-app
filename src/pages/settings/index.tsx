import { type RunProfile } from "@prisma/client";
import React, { useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { StravaActivity } from "~/server/api/routers/strava";
import { Activity } from "~/types";
import { RouterOutputs, api } from "~/utils/api";

type SettingFormProps = {
  profile: RunProfile;
};

type FormValues = {
  username: string;
  highlightRun: {
    id: number;
    name: string;
    start_date: Date;
    moving_time: number;
    distance: number;
    total_elevation_gain: number;
    start_latlng: [number, number];
    summary_polyline: string;
  };
};

function SettingForm({ profile }: SettingFormProps) {
  const highlightRun = profile.highlightRun as Activity;

  const methods = useForm<FormValues>({
    defaultValues: {
      username: profile.username,
      highlightRun: {
        id: highlightRun.id,
        name: highlightRun.name,
        moving_time: highlightRun.moving_time,
        distance: highlightRun.distance,
        total_elevation_gain: highlightRun.total_elevation_gain,
        start_latlng: highlightRun.start_latlng,
        summary_polyline: highlightRun.summary_polyline,
      },
    },
  });
  const { register, handleSubmit } = methods;

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
    updateProfile.mutate(data);
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input {...register("username")} placeholder="username" />
        </div>
        <HighlightRunSettings />
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </FormProvider>
  );
}

function HighlightRunSettings() {
  const { register, setValue } = useFormContext();
  const handleImportActivity = (activity: Activity | undefined) => {
    setValue("highlightRun", activity);
  };

  return (
    <div className="flex">
      <div className="flex-col">
        <div>
          <label htmlFor="activity_name">Activity Name:</label>
          <input
            {...register("highlightRun.name")}
            placeholder="activity name"
          />
        </div>
        <div>
          <label htmlFor="moving_time">Moving Time:</label>
          <input
            {...register("highlightRun.moving_time")}
            placeholder="moving time"
          />
        </div>
        <div>
          <label htmlFor="distance">Distance:</label>
          <input
            {...register("highlightRun.distance")}
            placeholder="distance"
          />
        </div>
        <div>
          <label htmlFor="moving_time">Total Elevation Gain:</label>
          <input
            {...register("highlightRun.total_elevation_gain")}
            placeholder="elevation gain"
          />
        </div>
      </div>
      <div className="flex-col">
        <StravaActivities handleImportActivity={handleImportActivity} />
      </div>
    </div>
  );
}

type StravaActivitiesProps = {
  handleImportActivity: (activity: Activity | undefined) => void;
};

function StravaActivities({ handleImportActivity }: StravaActivitiesProps) {
  const { data, isLoading } = api.strava.getActivities.useQuery();
  const [selectedActivity, setSelectedActivity] = useState<Activity>();

  const handleSelectActivity = (activity: StravaActivity) => {
    const selectedActivity: Activity = {
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

  if ("activities" in data) {
    return (
      <div>
        <button
          type="button"
          className=""
          onClick={() => handleImportActivity(selectedActivity)}
        >
          Import
        </button>
        <ul>
          {data.activities.map((activity: StravaActivity) => {
            return (
              <div key={activity.id}>
                <input
                  type="checkbox"
                  onClick={() => handleSelectActivity(activity)}
                />
                {activity.name}
              </div>
            );
          })}
        </ul>
      </div>
    );
  }
}

function Settings() {
  const { data, isLoading } = api.runProfile.getProfile.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Not Found</div>;
  }

  return (
    <div>
      <h1>Settings</h1>
      <SettingForm profile={data} />
    </div>
  );
}

export default Settings;
