import { zodResolver } from "@hookform/resolvers/zod";
import { type RunProfile } from "@prisma/client";
import { ToastClose } from "@radix-ui/react-toast";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { api } from "~/utils/api";
import { toast } from "../ui/use-toast";
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
import { GeneralSettingsFormSchema } from "~/utils/schemas";
import { signOut } from "next-auth/react";

type SettingFormProps = {
  profile: RunProfile;
};

type FormValues = {
  general: {
    name: string;
    slug: string;
  };
};

function GeneralSettingsForm({ profile }: SettingFormProps) {
  const slug = profile?.slug as string;
  const name = profile?.name as string;

  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ general: GeneralSettingsFormSchema })),
    defaultValues: {
      general: { slug, name },
    },
  });

  const { handleSubmit } = methods;

  const utils = api.useContext();
  const updateProfile = api.runProfile.updateGeneralProfile.useMutation({
    onSuccess: async (newEntry) => {
      await utils.runProfile.getUserProfile.invalidate();

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
    console.log(data);
    updateProfile.mutate({
      ...data,
    });
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="space-y-8">
        <GeneralSettings />
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </FormProvider>
  );
}

function GeneralSettings() {
  const { setValue, control } = useFormContext();

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

export default GeneralSettingsForm;
