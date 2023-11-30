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

type FormValues = {
  event: RaceEvent;
};

function EditRaceModal({
  profile,
  raceIndex,
  buttonType = "edit",
}: {
  profile: RunProfile;
  raceIndex: number;
  buttonType?: "add" | "edit";
}) {
  const raceEvents = profile.events as RaceEvent[];

  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ event: EventSettingsFormSchema })),
    defaultValues: {
      event: raceEvents[raceIndex]
        ? raceEvents[raceIndex]
        : {
            name: "",
            start_date: "",
            distance: 0,
          },
    },
  });

  const utils = api.useContext();
  const updateRacesProfile = api.runProfile.updateProfile.useMutation({
    onSuccess: async (newEntry) => {
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
        start_date: new Date(data.event.start_date).toUTCString(),
      };

      // update existing event
      const updatedRaces = raceEvents.map((event, index) => {
        return index === raceIndex ? updatedRace : event;
      });

      // add new event
      if (raceIndex === raceEvents.length) {
        updatedRaces.push(updatedRace);
      }

      console.log("updatedRace:", updatedRace);
      updateRacesProfile.mutate({ events: updatedRaces });
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
        {buttonType === "edit" ? (
          <Button className="">Edit</Button>
        ) : (
          <Button className="w-full">Add Race</Button>
        )}
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

function EditRaceForm() {
  const { control } = useFormContext();

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
          name={`event.distance`}
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
    </div>
  );
}

export default EditRaceModal;
