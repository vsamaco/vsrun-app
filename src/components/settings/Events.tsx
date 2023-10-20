import React from "react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { type Event } from "~/types";
import { api } from "~/utils/api";
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
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventSettingsFormSchema } from "~/utils/schemas";
import { z } from "zod";
import { ToastClose } from "../ui/toast";
import { toast } from "../ui/use-toast";

type EventSettingsFormProps = {
  events: Event[];
};

type EventsFormValues = {
  events: {
    id: number;
    name: string;
    start_date: Date;
    distance: number;
  }[];
};

function EventSettingsForm({ events }: EventSettingsFormProps) {
  const methods = useForm<EventsFormValues>({
    resolver: zodResolver(z.object({ events: EventSettingsFormSchema })),
    defaultValues: {
      events: events.map((event) => ({
        ...event,
        start_date: new Date(event.start_date),
      })),
    },
  });
  const { control, handleSubmit } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "events",
  });

  const utils = api.useContext();
  const updateProfile = api.runProfile.updateProfile.useMutation({
    onSuccess: async (newEntry) => {
      await utils.runProfile.getProfile.invalidate();
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

  const onSubmit = handleSubmit((data) => {
    console.log("submit", data);
    updateProfile.mutate({
      events: data.events.map((event) => ({
        ...event,
        id: event.id.toString(),
        start_date: event.start_date.toISOString(),
      })),
    });
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <div className="space-y-4">
          {fields.map((event, index) => {
            return (
              <FormItem key={event.id} className="rounded-lg border p-4">
                <FormField
                  control={methods.control}
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
                  control={methods.control}
                  name={`events.${index}.start_date`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
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
                                format(field.value, "PPP")
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
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        The end date of the event.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
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
                <Button type="button" onClick={() => remove(index)}>
                  Remove
                </Button>
              </FormItem>
            );
          })}
        </div>
        <div className="flex flex-row items-center justify-between">
          <Button
            type="button"
            onClick={() =>
              append({
                id: Date.now(),
                name: "",
                start_date: new Date(),
                distance: 0,
              })
            }
          >
            Create New Event
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </FormProvider>
  );
}

export default EventSettingsForm;
