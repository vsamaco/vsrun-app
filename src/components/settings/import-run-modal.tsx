/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import { metersToMiles } from "~/utils/activity";
import { api } from "~/utils/api";
import { API_CACHE_DURATION } from "~/utils/constants";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useFormContext } from "react-hook-form";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

type ImportRunModalProps = {
  setSelectedActivity: (activity: StravaActivity) => void;
};

export default function ImportRunModal({
  setSelectedActivity,
}: ImportRunModalProps) {
  const [open, setOpen] = useState(false);

  const handleSelectActivity = (activity: StravaActivity) => {
    setSelectedActivity(activity);
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
            Search or browse activity for importing.
          </DialogDescription>
        </DialogHeader>

        <ImportRunForm setSelectedActivity={handleSelectActivity} />

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImportActivityRow({
  activity,
  handleImportSelect,
}: {
  activity: StravaActivity;
  handleImportSelect: (activity: StravaActivity) => void;
}) {
  return (
    <div className="flex items-center justify-between space-x-5 space-y-2">
      <div className="flex w-full justify-between text-sm">
        <div className="w-[200px] truncate font-medium">{activity.name}</div>
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
}

function ImportSearchResult({
  searchLoading,
  searchActivity,
  searchError,
  handleImportSelect,
}: {
  searchLoading: boolean;
  searchActivity?: StravaActivity | null;
  searchError: any;
  handleImportSelect: (activity: StravaActivity) => void;
}) {
  if (searchLoading) {
    return <p className="text-sm">Loading...</p>;
  }
  if (searchError) {
    return <p className="text-sm">Error</p>;
  }
  if (!searchActivity) {
    return <p className="text-sm">Activity not found</p>;
  }
  return (
    <>
      {searchActivity && (
        <ImportActivityRow
          activity={searchActivity}
          handleImportSelect={() => handleImportSelect(searchActivity)}
        />
      )}
    </>
  );
}

function ImportRunForm({
  setSelectedActivity,
}: {
  setSelectedActivity: (activity: StravaActivity) => void;
}) {
  const [mode, setMode] = useState<"search" | "browse" | null>(null);
  const [stravaLink, setStravaLink] = useState("");
  const [searchId, setSearchId] = useState("");
  const [searchMessage, setSearchMessage] = useState("");

  const { control } = useFormContext();

  const {
    data: activities,
    isLoading,
    refetch: refetchBrowse,
  } = api.strava.getActivities.useQuery(undefined, {
    staleTime: API_CACHE_DURATION.stravaGetActivities,
    enabled: false,
  });

  const {
    data: searchActivity,
    isLoading: searchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = api.strava.getActivityById.useQuery({ id: searchId }, { enabled: false });
  const handleBrowse = () => {
    setMode("browse");
  };

  const handleSearch = () => {
    const regex = /strava.com\/activities\/(\d+)/i;
    const match = stravaLink.match(regex);
    setSearchMessage("");
    if (match && match[1]) {
      setSearchId(match[1].toString());
      setMode("search");
    } else {
      setSearchMessage("Invalid strava url");
    }
  };

  const handleImportSelect = (activity: StravaActivity) => {
    setSelectedActivity({ ...activity });
  };

  useEffect(() => {
    const fetchImport = async () => {
      try {
        if (mode === "search" && searchId) {
          await refetchSearch();
        } else if (mode === "browse") {
          await refetchBrowse();
        }
      } catch (error) {
        console.error(error);
      }
    };
    void fetchImport();
  }, [refetchSearch, refetchBrowse, searchId, mode]);

  return (
    <>
      <div>
        <FormField
          control={control}
          name="importActivity.stravaUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Strava Url</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => setStravaLink(e.target.value)}
                  placeholder="https://www.strava.com/activities/1234567890"
                />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage>{searchMessage}</FormMessage>
            </FormItem>
          )}
        ></FormField>
        <div className="flex flex-row gap-2">
          <Button type="button" variant="secondary" onClick={handleSearch}>
            Search
          </Button>
          <Button type="button" variant="secondary" onClick={handleBrowse}>
            Browse
          </Button>
        </div>
      </div>
      {mode === "search" && (
        <ImportSearchResult
          searchLoading={searchLoading}
          searchActivity={searchActivity}
          searchError={searchError}
          handleImportSelect={handleImportSelect}
        />
      )}
      {mode === "browse" && (
        <div className="max-h-[300px] overflow-y-scroll">
          {isLoading && <p className="text-sm">Loading...</p>}
          {!isLoading && !activities && (
            <p className="text-sm">No activities found</p>
          )}
          {activities &&
            activities.map((activity) => (
              <ImportActivityRow
                key={activity.id}
                activity={activity}
                handleImportSelect={() => handleImportSelect(activity)}
              />
            ))}
        </div>
      )}
    </>
  );
}
