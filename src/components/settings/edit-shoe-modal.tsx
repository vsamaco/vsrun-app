/* eslint-disable @typescript-eslint/no-misused-promises */
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { SHOE_CATEGORIES, type Shoe } from "~/types";
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
import { metersToMiles } from "~/utils/activity";
import { Checkbox } from "../ui/checkbox";

type FormValues = {
  shoe: Shoe;
};

function EditShoeModal({
  shoes = [],
  shoeIndex,
  buttonType = "edit",
}: {
  shoes: Shoe[];
  shoeIndex: number;
  buttonType?: "add" | "edit";
}) {
  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(z.object({ shoe: ShoeSettingsFormSchema })),
    defaultValues: {
      shoe: shoes?.at(shoeIndex)
        ? shoes[shoeIndex]
        : {
            brand_name: "",
            model_name: "",
            distance: 0,
            categories: [],
          },
    },
  });

  const utils = api.useContext();
  const updateShoesProfile = api.runProfile.updateProfile.useMutation({
    onSuccess: async (_) => {
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
      console.log("onsubmit:", data);

      // update selected shoe from list
      const updatedShoes = shoes.map((shoe, index) => {
        return index === shoeIndex ? data.shoe : shoe;
      });

      // append new shoe to list
      if (shoeIndex === shoes.length) {
        updatedShoes.push(data.shoe);
      }

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

  const [showImport, setShowImport] = useState(false);
  const handleImportShoe = () => setShowImport(true);

  const setSelectedShoe = (shoe: Shoe) => {
    setShowImport(false);
    console.log("import shoe:", shoe);
    methods.setValue("shoe.model_name", shoe.model_name);
    methods.setValue("shoe.brand_name", shoe.brand_name);
    methods.setValue("shoe.distance", shoe.distance);
  };

  const dialogTitle = buttonType === "edit" ? "Edit Shoe" : "Add Shoe";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {buttonType === "add" ? (
          <Button className="w-full">Add Shoe</Button>
        ) : (
          <Button variant="outline">Edit</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <FormProvider {...methods}>
          <form id="hook-form" onSubmit={onSubmit} className="space-y-8">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>
                Make changes to your shoe here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            {!showImport && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleImportShoe}
                >
                  Import from Strava
                </Button>
                <EditShoeForm />
              </>
            )}
            {showImport && <ImportShoeForm setSelectedShoe={setSelectedShoe} />}
            <DialogFooter>
              <div className="flex w-full items-center justify-between">
                {showImport && (
                  <Button type="button" onClick={() => setShowImport(false)}>
                    Back
                  </Button>
                )}
                {!showImport && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemove}
                  >
                    Remove
                  </Button>
                )}
                {!showImport && (
                  <Button type="submit" form="hook-form">
                    Save changes
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

function ImportShoeForm({
  setSelectedShoe,
}: {
  setSelectedShoe: (shoe: Shoe) => void;
}) {
  const { data: shoes, isLoading } = api.strava.getShoes.useQuery();
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!shoes) {
    return <div>No shoes found</div>;
  }

  const handleImportSelect = (shoe: Shoe) => {
    setSelectedShoe(shoe);
  };

  return (
    <>
      <p className="text-sm">Choose shoe to import:</p>
      <div className="max-h-[300px] overflow-scroll">
        {shoes.map((shoe) => {
          return (
            <div
              key={shoe.id}
              className="flex items-center justify-between space-x-5 space-y-1"
            >
              <div className="flex w-full justify-between text-sm">
                <div className="w-[200px] truncate font-medium">
                  {shoe.brand_name} {shoe.model_name}
                </div>
                <div className="font-light">
                  {Math.ceil(metersToMiles(shoe.distance))} mi
                </div>
              </div>
              <div>
                <Button
                  variant="secondary"
                  onClick={() =>
                    handleImportSelect({ ...shoe, categories: [] })
                  }
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

function EditShoeForm() {
  const { control } = useFormContext();

  return (
    <div>
      <FormItem className="">
        <FormField
          control={control}
          name={`shoe.brand_name`}
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
          name={`shoe.model_name`}
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
          name={`shoe.distance`}
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
      <FormItem>
        <FormLabel className="text-base">Shoe Categories:</FormLabel>
        <FormControl>
          <div className="space-y-2">
            {SHOE_CATEGORIES.map((category) => (
              <FormField
                key={category}
                control={control}
                name={`shoe.categories`}
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                          checked={field.value?.includes(category)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                field.onChange([...field.value, category])
                              : field.onChange(
                                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                                  field.value?.filter(
                                    (value: string) => value !== category
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="front-normal text-sm">
                        {category}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    </div>
  );
}

export default EditShoeModal;
