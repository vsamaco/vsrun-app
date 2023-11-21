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
import { type RunProfile } from "@prisma/client";
import { type Activity } from "~/types";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { RunSettingsFormSchema } from "~/utils/schemas";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { metersToMiles } from "~/utils/activity";
import { type StravaActivity } from "~/server/api/routers/strava";

type FormValues = {
  highlightRun: Activity;
};

function EditRunModal({ profile }: { profile: RunProfile }) {
  const highlightRun = profile.highlightRun as Activity;
  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ highlightRun: RunSettingsFormSchema })),
    defaultValues: {
      highlightRun: highlightRun,
    },
  });

  const utils = api.useContext();
  const updateRunProfile = api.runProfile.updateProfile.useMutation({
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
      updateRunProfile.mutate(data);
    },
    (errors) => {
      console.log("errors:", errors);
    }
  );

  const handleRemove = () => {
    updateRunProfile.mutate({ highlightRun: null });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Edit Run</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <FormProvider {...methods}>
          <form id="hook-form" onSubmit={onSubmit} className="space-y-8">
            <DialogHeader>
              <DialogTitle>Edit Run</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <EditRunForm />

            <DialogFooter>
              <div className="flex w-full items-center justify-between">
                <Button type="button" onClick={handleRemove}>
                  Remove
                </Button>
                <Button type="submit" form="hook-form">
                  Save changes
                </Button>
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

const getActivityId = () => {
  return Math.random().toString(16).slice(2);
};

export function AddRunModal({ profile }: { profile: RunProfile }) {
  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ highlightRun: RunSettingsFormSchema })),
    defaultValues: {
      highlightRun: {
        id: getActivityId(),
        name: "",
        start_date: "",
        moving_time: 0,
        elapsed_time: 0,
        distance: 0,
        total_elevation_gain: 0,
      },
    },
  });

  const utils = api.useContext();
  const updateRunProfile = api.runProfile.updateProfile.useMutation({
    onSuccess: async (newEntry) => {
      await utils.runProfile.getUserProfile.invalidate();
      reset();
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

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(
    (data) => {
      console.log("onsubmit:", data);
      updateRunProfile.mutate(data);
    },
    (errors) => {
      console.log("errors:", errors);
    }
  );

  const [showImport, setShowImport] = useState(false);
  const handleImportShoe = () => setShowImport(true);

  const setSelectedActivity = (activity: StravaActivity) => {
    setShowImport(false);
    console.log("import activity:", activity);
    methods.setValue("highlightRun.name", activity.name);
    methods.setValue("highlightRun.start_date", activity.start_date);
    methods.setValue("highlightRun.moving_time", activity.moving_time);
    methods.setValue("highlightRun.elapsed_time", activity.elapsed_time);
    methods.setValue("highlightRun.distance", activity.distance);
    methods.setValue("highlightRun.start_latlng", activity.start_latlng);
    methods.setValue(
      "highlightRun.summary_polyline",
      activity.map.summary_polyline
    );
    methods.setValue(
      "highlightRun.total_elevation_gain",
      activity.total_elevation_gain
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Add Run</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <FormProvider {...methods}>
          <form id="hook-form" onSubmit={onSubmit} className="space-y-8">
            <DialogHeader>
              <DialogTitle>Add Run</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            {showImport && (
              <ImportRunForm setSelectedActivity={setSelectedActivity} />
            )}
            {!showImport && <EditRunForm />}
            <DialogFooter>
              {showImport && (
                <>
                  <Button type="button" onClick={() => setShowImport(false)}>
                    Cancel
                  </Button>
                </>
              )}
              {!showImport && (
                <div className="flex w-full items-center justify-between">
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleImportShoe}
                    >
                      Import from Strava
                    </Button>
                    <Button type="submit" form="hook-form">
                      Save changes
                    </Button>
                  </>
                </div>
              )}
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
    return <div>No shoes found</div>;
  }

  const handleImportSelect = (activity: StravaActivity) => {
    setSelectedActivity(activity);
  };

  return (
    <>
      <p className="text-sm">Choose shoe to import:</p>
      <div className="max-h-[300px] overflow-scroll">
        {activities.map((activity, index) => {
          return (
            <div
              key={activity.id}
              className="flex items-center justify-between space-x-2 space-y-1"
            >
              <div className="flex w-full justify-between text-sm">
                <div className="w-[200px] truncate font-medium">
                  {activity.name}
                </div>
                <div className="font-light">
                  {Math.ceil(metersToMiles(activity.distance))} mi
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
  const { control } = useFormContext();
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
            <FormDescription>The start date of the event.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="highlightRun.moving_time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Moving Time</FormLabel>
            <FormControl>
              <Input placeholder="moving time" {...field} />
            </FormControl>
            <FormMessage />
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
            <FormMessage />
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
            <FormMessage />
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
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
    </>
  );
}

export default EditRunModal;
