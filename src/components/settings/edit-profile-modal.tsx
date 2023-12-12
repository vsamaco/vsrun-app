/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GeneralSettingsFormSchema } from "~/utils/schemas";
import { z } from "zod";
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
import { Input } from "../ui/input";
import { api } from "~/utils/api";
import { toast } from "../ui/use-toast";
import { ToastClose } from "../ui/toast";
import { type RunProfile } from "@prisma/client";

type FormValues = {
  general: {
    name: string;
    slug: string;
  };
};

function EditProfileModal({ profile }: { profile: RunProfile | null }) {
  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ general: GeneralSettingsFormSchema })),
    defaultValues: {
      general: {
        name: profile?.name || "",
        slug: profile?.slug || "",
      },
    },
  });

  const utils = api.useContext();
  const updateGeneralProfile = api.runProfile.updateGeneralProfile.useMutation({
    onSuccess: async (_) => {
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

  const onSubmit = methods.handleSubmit(
    (data) => {
      console.log("submit", data);
      updateGeneralProfile.mutate(data);
    },
    (errors) => {
      console.log("errors:", errors);
    }
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {profile ? (
          <Button className="w-full">Edit Profile</Button>
        ) : (
          <Button className="">Create Profile</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <FormProvider {...methods}>
          <form id="hook-form" onSubmit={onSubmit} className="space-y-8">
            <DialogHeader>
              <DialogTitle>{profile ? "Edit" : "Create"} profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>

            <EditProfileForm />

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

function EditProfileForm() {
  const { control } = useFormContext();

  return (
    <>
      <FormField
        control={control}
        name="general.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="name" {...field} />
            </FormControl>
            <FormDescription>Profile Name</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
      <FormField
        control={control}
        name="general.slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <Input placeholder="slug" {...field} />
            </FormControl>
            <FormDescription>https://vsrun.app/[slug]</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
    </>
  );
}

export default EditProfileModal;
