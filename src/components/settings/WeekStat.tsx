import { type RunProfile } from "@prisma/client";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { type StravaActivity } from "~/server/api/routers/strava";
import { type Activity, type WeekStat } from "~/types";
import { api } from "~/utils/api";

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

function WeekStatForm({ profile, activities }: Props) {
  const weekStat = profile.weekStats as WeekStat;

  const methods = useForm<WeekStatFormValues>({
    defaultValues: {
      weekStats: {
        start_date: weekStat.start_date,
        end_date: weekStat.end_date,
        total_runs: weekStat.total_runs,
        total_distance: weekStat.total_distance,
        total_duration: weekStat.total_duration,
        total_elevation: weekStat.total_elevation,
      },
    },
  });
  const { register, handleSubmit, setValue } = methods;

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
    console.log({ data });
    updateProfile.mutate({
      weekStats: {
        ...data.weekStats,
        start_date: data.weekStats.start_date.toUTCString(),
        end_date: data.weekStats.end_date.toUTCString(),
      },
    });
  });

  const handleImportWeekStats = (weekStats: WeekStat) => {
    setValue("weekStats", weekStats);
  };

  return (
    <FormProvider {...methods}>
      <div>
        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="start_date">Start Date</label>
            <input {...register("weekStats.start_date")} />
          </div>
          <div>
            <label htmlFor="end_date">End Date</label>
            <input {...register("weekStats.end_date")} />
          </div>
          <div>
            <label htmlFor="total_runs">Total Runs</label>
            <input {...register("weekStats.total_runs")} />
          </div>
          <div>
            <label htmlFor="total_distance">Total Distance</label>
            <input {...register("weekStats.total_distance")} />
          </div>
          <div>
            <label htmlFor="total_duration">Total Duration</label>
            <input {...register("weekStats.total_duration")} />
          </div>
          <div>
            <label htmlFor="total_elevation">Total Elevation</label>
            <input {...register("weekStats.total_elevation")} />
          </div>
          <button type="submit">Submit</button>
        </form>
        <div>
          {activities && (
            <StravaActivities
              activities={activities}
              handleImportWeekStats={handleImportWeekStats}
            />
          )}
        </div>
      </div>
    </FormProvider>
  );
}

type StravaActivitiesProps = {
  handleImportWeekStats: (weekStats: WeekStat) => void;
  activities: StravaActivity[];
};

function StravaActivities({
  handleImportWeekStats,
  activities,
}: StravaActivitiesProps) {
  const [checkedActivities, setCheckedActivities] = useState<boolean[]>(
    new Array(activities.length).fill(false)
  );
  const [weekStats, setWeekStats] = useState<WeekStat>({
    total_runs: 0,
    total_distance: 0,
    total_duration: 0,
    total_elevation: 0,
    start_date: new Date(),
    end_date: new Date(),
  } as WeekStat);

  const handleSelectActivity = (position: number) => {
    const updatedCheckedActivities = checkedActivities.map((selected, index) =>
      index === position ? !selected : selected
    );
    setCheckedActivities(updatedCheckedActivities);

    const totals = {
      total_runs: 0,
      total_distance: 0,
      total_duration: 0,
      total_elevation: 0,
    };
    const selectedActivities = activities.filter(
      (activities, index) => updatedCheckedActivities[index] === true
    );

    selectedActivities.forEach((activity) => {
      totals.total_runs += 1;
      totals.total_distance += activity.distance;
      totals.total_duration += activity.moving_time;
      totals.total_elevation += activity.total_elevation_gain;
    });

    console.log({ totals });

    setWeekStats((prevStat) => ({
      ...prevStat,
      start_date: selectedActivities.length
        ? new Date(selectedActivities.slice(-1)[0].start_date)
        : new Date(),
      end_date:
        selectedActivities.length > 1
          ? new Date(selectedActivities[0].start_date)
          : new Date(),
      ...totals,
    }));
  };

  return (
    <div>
      <div>
        Week Stat: <pre>{JSON.stringify(weekStats)}</pre>
      </div>
      <button
        type="button"
        className=""
        onClick={() => handleImportWeekStats(weekStats)}
      >
        Import
      </button>
      <ul>
        {activities.map((activity, index) => {
          return (
            <div key={activity.id}>
              <input
                type="checkbox"
                onClick={() => handleSelectActivity(index)}
              />
              {activity.name}
            </div>
          );
        })}
      </ul>
    </div>
  );
}

export default WeekStatForm;
