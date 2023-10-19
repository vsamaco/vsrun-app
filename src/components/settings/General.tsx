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

type SettingFormProps = {
  profile: RunProfile | null;
};

type FormValues = {
  general: {
    username: string;
  };
};

function GeneralSettingsForm({ profile }: SettingFormProps) {
  const username = profile?.username;

  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ general: GeneralSettingsFormSchema })),
    defaultValues: {
      general: {
        username: username,
      },
    },
  });

  const { handleSubmit } = methods;

  const utils = api.useContext();
  const updateProfile = api.runProfile.updateGeneralProfile.useMutation({
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
        name="general.username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input placeholder="username" {...field} />
            </FormControl>
            <FormDescription>https://vsrun.app/username</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
    </>
  );
}

export default GeneralSettingsForm;
