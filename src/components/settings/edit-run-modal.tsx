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

type FormValues = {
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
