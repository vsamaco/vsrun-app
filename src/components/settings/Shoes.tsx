import React, { useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { type Shoe } from "~/types";
import { api as tApi } from "~/utils/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
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
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import { metersToMiles } from "~/utils/activity";
import { z } from "zod";
import { ShoeSettingsFormSchema } from "~/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastClose } from "@radix-ui/react-toast";
import { toast } from "../ui/use-toast";

type ShoesFormValues = {
  shoes: Shoe[];
};

type ShoesSettingsProps = {
  shoes: Shoe[];
};

function ShoeSettingsForm({ shoes }: ShoesSettingsProps) {
  const methods = useForm<ShoesFormValues>({
    resolver: zodResolver(z.object({ shoes: ShoeSettingsFormSchema })),
    defaultValues: {
      shoes: shoes,
    },
  });
  const { control, register, handleSubmit } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "shoes",
  });

  const utils = tApi.useContext();
  const updateProfile = tApi.runProfile.updateProfile.useMutation({
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
    updateProfile.mutate({ shoes: data.shoes });
  });

  const handleImportShoes = (shoes: Shoe[]) => {
    console.log("import shoes", shoes);
    shoes.forEach((shoe) => append(shoe));
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <div className="space-y-4">
          {fields.map((shoe, index) => {
            return (
              <FormItem
                className="flex flex-row items-center justify-between rounded-lg border p-4"
                key={shoe.id}
              >
                <FormField
                  control={methods.control}
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
                  control={methods.control}
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
                  control={methods.control}
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
                <Button type="button" onClick={() => remove(index)}>
                  Remove
                </Button>
              </FormItem>
            );
          })}
        </div>
        <ImportDialogContent handleImportShoes={handleImportShoes} />
        <Button type="submit">Save</Button>
      </form>
    </FormProvider>
  );
}

type ImportDialogContentProps = {
  handleImportShoes: (shoes: Shoe[]) => void;
};

function ImportDialogContent({ handleImportShoes }: ImportDialogContentProps) {
  const { data: shoes, isLoading } = tApi.strava.getShoes.useQuery();
  const [open, setOpen] = useState(false);
  const form = useForm<{ shoes: number[] }>({
    defaultValues: {
      shoes: [],
    },
  });

  const onSubmit = form.handleSubmit((formData) => {
    const checkedShoes = shoes?.filter((shoe) =>
      formData.shoes.includes(shoe.id)
    );
    console.log("on submit import", checkedShoes);
    if (checkedShoes) {
      handleImportShoes(checkedShoes);
    }
    setOpen(false);
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!shoes) {
    return <div>Not found</div>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Import Strava Activity</Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form className="space-y-4">
            <DialogHeader>
              <DialogTitle>Import Strava Activity</DialogTitle>
              <DialogDescription>
                Select any activity to be imported as highlight run.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[200px] space-y-2 rounded-md border p-2">
              <div className="space-y-2">
                {shoes.map((shoe) => (
                  <FormField
                    key={shoe.id}
                    control={form.control}
                    name="shoes"
                    render={({ field }) => {
                      return (
                        <FormItem key={shoe.id.toString()}>
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(shoe.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, shoe.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== shoe.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {shoe.brand_name} {shoe.model_name}{" "}
                            {metersToMiles(shoe.distance)}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button type="button" onClick={onSubmit}>
                Import
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ShoeSettingsForm;
