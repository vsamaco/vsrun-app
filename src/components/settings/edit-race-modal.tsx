import { type RunProfile } from "@prisma/client";
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
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
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

type FormValues = {
  events: RaceEvent[];
};

function EditRaceModal({
  profile,
  raceIndex,
}: {
  profile: RunProfile;
  raceIndex: number;
}) {
  const raceEvents = profile.events as RaceEvent[];

  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ events: EventSettingsFormSchema })),
    defaultValues: {
      events: [raceEvents[raceIndex]],
    },
  });

  const utils = api.useContext();
  const updateRacesProfile = api.runProfile.updateProfile.useMutation({
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
      const updatedRace = {
        ...data.events[0],
        start_date: new Date(data.events[0]!.start_date).toUTCString(),
      };
      console.log("updatedRace:", updatedRace);
      updateRacesProfile.mutate({
        events: raceEvents.map((event, index) => {
          return index === raceIndex ? updatedRace : event;
        }),
      });
    },
    (errors) => {
      console.log("errors:", errors);
    }
  );

  const handleRemove = () => {
    const updatedRaces = raceEvents.filter(
      (race, index) => index !== raceIndex
    );
    updateRacesProfile.mutate({ events: updatedRaces });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <FormProvider {...methods}>
          <form id="hook-form" onSubmit={onSubmit} className="space-y-8">
            <DialogHeader>
              <DialogTitle>Edit Race</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <EditRaceForm />
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

const getRaceId = () => {
  return Math.random().toString(16).slice(2);
};

export function AddRaceModal({ profile }: { profile: RunProfile }) {
  const races = profile.events as RaceEvent[];

  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ events: EventSettingsFormSchema })),
    defaultValues: {
      events: [
        {
          id: getRaceId(),
          name: "",
          start_date: "",
          distance: 0,
        },
      ],
    },
  });

  const utils = api.useContext();
  const updateShoesProfile = api.runProfile.updateProfile.useMutation({
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
      updateShoesProfile.mutate({
        events: [...races, ...data.events],
      });
    },
    (errors) => {
      console.log("errors:", errors);
    }
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Add Race</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <FormProvider {...methods}>
          <form id="hook-form" onSubmit={onSubmit} className="space-y-8">
            <DialogHeader>
              <DialogTitle>Add Race</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <EditRaceForm />
            <DialogFooter>
              <Button type="submit" form="hook-form">
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

function EditRaceForm() {
  const { control } = useFormContext();

  const { fields } = useFieldArray({
    control,
    name: "events",
  });

  return (
    <div>
      {fields.map((event, index) => {
        return (
          <FormItem key={event.id} className="">
            <FormField
              control={control}
              name={`events.${index}.name`}
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
              name={`events.${index}.start_date`}
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
                  <FormDescription>
                    The start date of the event.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`events.${index}.distance`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distance:</FormLabel>
                  <FormControl>
                    <Input placeholder="distance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </FormItem>
        );
      })}
    </div>
  );
}

export default EditRaceModal;
