import { zodResolver } from "@hookform/resolvers/zod";
import { type RunProfile } from "@prisma/client";
import React, { useState } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { z } from "zod";
import { type Shoe } from "~/types";
import { api } from "~/utils/api";
import { ShoeSettingsFormSchema } from "~/utils/schemas";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

type FormValues = {
  shoes: Shoe[];
};

function EditShoeModal({
  profile,
  shoeIndex,
}: {
  profile: RunProfile;
  shoeIndex: number;
}) {
  const shoes = profile.shoes as Shoe[];

  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ shoes: ShoeSettingsFormSchema })),
    defaultValues: {
      shoes: shoes.filter((shoe, index) => index === shoeIndex),
    },
  });

  const utils = api.useContext();
  const updateShoesProfile = api.runProfile.updateProfile.useMutation({
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
      const updatedShoes = shoes.map((shoe, index) => {
        return index === shoeIndex ? data.shoes[0] : shoe;
      });
      updateShoesProfile.mutate({ shoes: updatedShoes });
    },
    (errors) => {
      console.log("errors:", errors);
    }
  );

  const handleRemove = () => {
    const updatedShoes = shoes.filter((shoe, index) => index !== shoeIndex);
    console.log("remove new shoes:", updatedShoes);
    updateShoesProfile.mutate({ shoes: updatedShoes });
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
              <DialogTitle>Edit Shoe</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <EditShoeForm />
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

const getShoeId = () => {
  return Math.random().toString(16).slice(2);
};

export function AddShoeModal({ profile }: { profile: RunProfile }) {
  const shoes = profile.shoes as Shoe[];

  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ shoes: ShoeSettingsFormSchema })),
    defaultValues: {
      shoes: [
        {
          id: getShoeId(),
          brand_name: "",
          model_name: "",
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
        shoes: [...shoes, ...data.shoes],
      });
    },
    (errors) => {
      console.log("errors:", errors);
    }
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Add Shoe</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <FormProvider {...methods}>
          <form id="hook-form" onSubmit={onSubmit} className="space-y-8">
            <DialogHeader>
              <DialogTitle>Add Shoe</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <EditShoeForm />
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

function EditShoeForm() {
  const { control } = useFormContext();

  const { fields } = useFieldArray({
    control,
    name: "shoes",
  });
  return (
    <div>
      {fields.map((shoe, index) => {
        return (
          <FormItem className="" key={shoe.id}>
            <FormField
              control={control}
              name={`shoes.${index}.brand_name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand:</FormLabel>
                  <FormControl>
                    <Input placeholder="brand" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <FormField
              control={control}
              name={`shoes.${index}.model_name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model:</FormLabel>
                  <FormControl>
                    <Input placeholder="model" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <FormField
              control={control}
              name={`shoes.${index}.distance`}
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

export default EditShoeModal;
