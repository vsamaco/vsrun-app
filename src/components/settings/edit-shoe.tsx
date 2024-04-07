/* eslint-disable @typescript-eslint/no-misused-promises */
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { metersToMiles, milesToMeters } from "~/utils/activity";
import { api } from "~/utils/api";
import { toast } from "../ui/use-toast";
import { ShoeSettingsFormSchema } from "~/utils/schemas";
import { ToastClose } from "../ui/toast";
import { SHOE_CATEGORIES, type Shoe, type StravaShoeType } from "~/types";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { API_CACHE_DURATION } from "~/utils/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";

export type EditShoeFormValues = {
  shoe: Omit<Shoe, "slug">;
};

function EditShoe({
  shoe,
  nextShoeRotationId,
}: {
  shoe: Shoe | null;
  nextShoeRotationId?: string;
}) {
  const router = useRouter();
  const methods = useForm<EditShoeFormValues>({
    resolver: zodResolver(z.object({ shoe: ShoeSettingsFormSchema })),
    defaultValues: {
      shoe: {
        brand_name: shoe?.brand_name || "",
        model_name: shoe?.model_name || "",
        description: shoe?.description || "",
        start_date: shoe?.start_date,
        distance: shoe?.distance || 0,
        distance_mi: shoe?.distance ? metersToMiles(shoe.distance) : 0,
        categories: shoe?.categories || [],
        metadata: shoe?.metadata || null,
      },
    },
  });
  const { handleSubmit } = methods;

  const utils = api.useContext();
  const createShoe = api.shoe.createShoe.useMutation({
    onSuccess: async (_) => {
      await utils.runProfile.getUserProfile.invalidate();
      await utils.shoe.getUserShoes.invalidate();
      await router.push("/settings/shoes");
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

  const updateShoe = api.shoe.updateShoe.useMutation({
    onSuccess: async (_) => {
      await utils.runProfile.getUserProfile.invalidate();
      await utils.shoe.getUserShoes.invalidate();
      await utils.shoe.getShoeBySlug.invalidate({ slug: shoe?.slug });
      if (nextShoeRotationId) {
        await utils.shoeRotation.getShoeRotationBySlug.invalidate({
          slug: nextShoeRotationId,
        });
        await router.push(
          `/settings/shoe_rotations/${nextShoeRotationId}/edit`
        );
      } else {
        await router.push("/settings/shoes");
      }
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

  const removeShoe = api.shoe.deleteShoe.useMutation({
    onSuccess: async (_) => {
      await utils.runProfile.getUserProfile.invalidate();
      await utils.shoe.getUserShoes.invalidate();
      await router.push("/settings/shoes");
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

  const onSubmit = handleSubmit(
    (data) => {
      console.log("onsubmit:", data);

      const shoeData = {
        ...data.shoe,
      };

      if (shoe?.slug) {
        updateShoe.mutate({
          params: { slug: shoe.slug },
          body: shoeData,
        });
      } else {
        createShoe.mutate({ body: shoeData });
      }
    },
    (error) => {
      console.log("error:", error);
    }
  );

  const handleRemove = () => {
    if (shoe?.slug) {
      console.log("remove shoe");
      removeShoe.mutate({ params: { slug: shoe.slug } });
    }
  };

  return (
    <FormProvider {...methods}>
      <form id="hook-form" onSubmit={onSubmit} className="space-y-8">
        <ImportRunModal />
        <EditShoeForm shoe={shoe} />
        <div className="flex w-full items-center justify-between">
          <Button type="button" variant="outline" onClick={handleRemove}>
            Remove
          </Button>

          <Button type="submit" form="hook-form">
            Save changes
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

export function EditShoeForm({ shoe }: { shoe: Shoe | null }) {
  const { control, setValue } = useFormContext();
  const shoeOp = shoe ? "Create" : "Update";

  return (
    <div className="space-y-8">
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

      <FormItem className="">
        <FormField
          control={control}
          name={`shoe.start_date`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date:</FormLabel>
              <FormControl>
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
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                      selected={new Date(field.value)}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
      </FormItem>

      <FormField
        control={control}
        name={`shoe.distance`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="distance" type="hidden" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
      <FormField
        control={control}
        name={`shoe.distance_mi`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Distance (mi):</FormLabel>
            <FormControl>
              <Input
                placeholder="distance"
                {...field}
                onBlur={(e) => {
                  const value = +e.target.value;
                  if (typeof value === "number") {
                    const distanceMeters = milesToMeters(value);
                    setValue(`shoe.distance`, distanceMeters);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
      <FormItem>
        <FormLabel>Shoe Categories:</FormLabel>
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
                      <FormLabel className="text-sm font-normal">
                        {category.replace("_", " ")}
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
      <FormField
        control={control}
        name={`shoe.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description:</FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder="description" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
    </div>
  );
}

function ImportRunModal() {
  const [open, setOpen] = useState(false);
  const methods = useFormContext<EditShoeFormValues>();

  const setSelectedShoe = (shoe: StravaShoeType) => {
    console.log("import activity:", shoe);
    methods.setValue("shoe", {
      brand_name: shoe.brand_name,
      model_name: shoe.model_name,
      start_date: new Date(),
      description: "",
      distance: shoe.distance,
      distance_mi: metersToMiles(shoe.distance),
      categories: [],
      metadata: {
        external_id: shoe.id.toString(),
        external_source: "strava",
      },
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          Import Shoe from Strava
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Shoe</DialogTitle>
          <DialogDescription>Choose a shoe to import:</DialogDescription>
        </DialogHeader>

        <ImportShoeForm setSelectedShoe={setSelectedShoe} />

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImportShoeForm({
  setSelectedShoe,
}: {
  setSelectedShoe: (shoe: StravaShoeType) => void;
}) {
  const { data: shoes, isLoading } = api.strava.getShoes.useQuery(undefined, {
    staleTime: API_CACHE_DURATION.stravaGetActivities,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!shoes) {
    return <div>No shoes found</div>;
  }

  const handleImportSelect = (shoe: StravaShoeType) => {
    setSelectedShoe(shoe);
  };

  return (
    <>
      <div className="max-h-[300px] overflow-y-scroll">
        {shoes.map((shoe) => {
          return (
            <div
              key={shoe.id}
              className="border-gray flex items-center justify-between space-x-5 space-y-2 border"
            >
              <div className="flex w-full justify-between text-sm">
                <div className="w-[200px] truncate font-medium">
                  {shoe.brand_name} {shoe.model_name}
                </div>
                <div className="font-light">
                  {metersToMiles(shoe.distance).toLocaleString()} mi
                </div>
              </div>
              <div>
                <Button
                  variant="secondary"
                  onClick={() => handleImportSelect(shoe)}
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

export default EditShoe;
