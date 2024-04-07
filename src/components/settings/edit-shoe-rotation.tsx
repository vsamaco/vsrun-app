/* eslint-disable @typescript-eslint/no-misused-promises */
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Pencil, MoreVertical } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useId, useState } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  type UseFormSetValue,
  type UseFormReset,
  type UseFormReturn,
} from "react-hook-form";
import { cn } from "~/lib/utils";
import {
  SHOE_CATEGORIES,
  type StravaShoeType,
  type Shoe,
  type ShoeRotationType,
  type ShoeType,
} from "~/types";
import { metersToMiles, milesToMeters } from "~/utils/activity";
import { api } from "~/utils/api";
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { toast } from "../ui/use-toast";
import { ToastClose } from "../ui/toast";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button, buttonVariants } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import {
  ShoeRotationFormSchema,
  ShoeSettingsFormSchema,
} from "~/utils/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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
import {
  EditShoeForm as EditShoeForm2,
  type EditShoeFormValues,
} from "./edit-shoe";
import { z } from "zod";
import Link from "next/link";

type ShoeRotationFormValues = Omit<
  ShoeRotationType,
  "slug" | "createdAt" | "updatedAt"
>;

export function EditShoeRotationForm({
  shoeRotation,
}: {
  shoeRotation: ShoeRotationType | null;
}) {
  const isNew = shoeRotation == null;
  const router = useRouter();

  const methods = useForm<ShoeRotationFormValues>({
    resolver: zodResolver(ShoeRotationFormSchema),
    defaultValues: {
      name: shoeRotation?.name || "",
      startDate: shoeRotation?.startDate,
      description: shoeRotation?.description,
      shoeList: shoeRotation?.shoeList.map((s) => ({
        ...s,
        metadata: s.metadata || undefined,
      })),
      shoes:
        shoeRotation?.shoes?.map((s) => ({
          ...s,
          distance_mi: metersToMiles(s.distance),
          start_date: new Date(),
        })) || [],
    },
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields, errors },
  } = methods;

  useEffect(() => {
    if (shoeRotation) {
      reset(shoeRotation);
    }
  }, [shoeRotation, reset]);

  const utils = api.useContext();
  const createShoeRotation = api.shoeRotation.createShoeRotation.useMutation({
    onSuccess: async (_) => {
      await utils.shoeRotation.getUserShoeRotations.invalidate();
      await router.push(`/settings/shoe_rotations`);

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
  const updateShoeRotation = api.shoeRotation.updateShoeRotation.useMutation({
    onSuccess: async (_) => {
      await utils.shoeRotation.getShoeRotationBySlug.invalidate({
        slug: shoeRotation?.slug,
      });
      await utils.shoeRotation.getUserShoeRotations.invalidate();

      if (!dirtyFields?.shoeList) {
        await router.push(`/settings/shoe_rotations`);
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

  const deleteShoeRotation = api.shoeRotation.deleteShoeRotation.useMutation({
    onSuccess: async (_) => {
      await utils.shoeRotation.getUserShoeRotations.invalidate();

      await router.push("/settings/shoe_rotations");
      toast({ title: "Success", description: "Successfully deleted." });
    },
    onError: (error) => {
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

      const shoeRotationData = {
        ...data,
        shoeList: data.shoeList.map((shoe) => shoe as Shoe),
      };

      if (shoeRotation?.slug) {
        updateShoeRotation.mutate({
          params: { slug: shoeRotation.slug },
          body: shoeRotationData,
        });
      } else {
        createShoeRotation.mutate({ body: shoeRotationData });
      }
    },
    (error) => {
      console.log("error:", error);
    }
  );

  const onDelete = () => {
    if (shoeRotation?.slug) {
      deleteShoeRotation.mutate({ params: { slug: shoeRotation.slug } });
    }
  };

  const {
    fields: shoeListFields,
    prepend: shoeListPrepend,
    remove: shoeListRemove,
  } = useFieldArray({
    control,
    name: "shoeList",
    keyName: "key",
  });

  const handleAddShoe = async (shoe: ShoeRotationType["shoeList"][0]) => {
    shoeListPrepend(shoe);
    if (shoeRotation?.slug) {
      await onSubmit();
    }
  };

  const handleRemoveShoe = async (index: number) => {
    shoeListRemove(index);
    if (shoeRotation?.slug) {
      await onSubmit();
    }
  };

  return (
    <div className="">
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="space-y-8">
          <FormItem className="">
            <FormField
              control={control}
              name={`name`}
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
          </FormItem>

          <FormItem className="">
            <FormField
              control={control}
              name={`startDate`}
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

          <FormItem className="">
            <FormField
              control={control}
              name={`description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description:</FormLabel>
                  <FormControl>
                    <Textarea placeholder="description" rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </FormItem>

          <FormItem>
            <FormLabel>Shoes:</FormLabel>
            {errors.shoeList && (
              <FormMessage>{errors.shoeList.message}</FormMessage>
            )}
            <AddShoeModal
              shoeList={shoeListFields}
              handleAddShoe={handleAddShoe}
            />
            {shoeListFields.map((shoe, index) => {
              return (
                <Card
                  key={shoe.key}
                  className={cn(
                    "border-gray group border hover:border-gray-500"
                  )}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-normal">
                      <div className="flex flex-row items-center justify-between">
                        <div className="space-y-2 rounded-sm ">
                          <div className="text-balance">
                            <span>{shoe.brand_name}</span>&nbsp;
                            <span className="font-thin">{shoe.model_name}</span>
                          </div>
                        </div>

                        <div className="flex flex-row space-x-2">
                          <>
                            {shoeRotation && (
                              <Link
                                href={`/settings/shoes/${shoe.slug}/edit?nextShoeRotationId=${shoeRotation.slug}`}
                                className={buttonVariants({
                                  variant: "outline",
                                })}
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={false}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">More</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleRemoveShoe(index)}
                                >
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-x-2">
                      {shoe.categories.map((category, categoryIdx) => (
                        <Badge
                          key={categoryIdx}
                          variant="secondary"
                          className="group-hover:bg-yellow-400"
                        >
                          {category.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </FormItem>
        </form>
      </FormProvider>

      <div className="mt-10">
        <div className="flex justify-between">
          {!isNew && (
            <Button type="button" variant="outline" onClick={onDelete}>
              Remove
            </Button>
          )}
          <Button disabled={!isDirty} onClick={onSubmit}>
            {isNew ? "Create" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function EditShoeModal({
  shoe,
  renderTrigger,
  index,
  parentMethods,
  setValue,
}: {
  shoe: Shoe | null;
  renderTrigger: React.ReactElement;
  reset: UseFormReset<ShoeRotationFormValues>;
  index: number;
  parentMethods: UseFormReturn<ShoeRotationFormValues, any, undefined>;
  setValue: UseFormSetValue<ShoeRotationFormValues>;
}) {
  const [open, setOpen] = useState(false);
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
  const updateShoe = api.shoe.updateShoe.useMutation({
    onSuccess: async (data) => {
      await utils.runProfile.getUserProfile.invalidate();
      await utils.shoeRotation.getShoeRotationBySlug.invalidate();
      await utils.shoe.getUserShoes.invalidate();
      await utils.shoe.getShoeBySlug.invalidate();

      if (data) {
        setValue(`shoeList.${index}`, data);
        const currentValues = parentMethods.getValues();
        parentMethods.reset({ ...currentValues });
      }

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

  const handleCancel = () => {
    setOpen(false);
  };

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
      }
    },
    (error) => {
      console.log("error:", error);
    }
  );

  const formId = useId();

  return (
    <FormProvider {...methods}>
      <form id={`shoe-form-${formId}`} onSubmit={onSubmit}>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>{renderTrigger}</DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Shoe</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            <EditShoeForm2 shoe={shoe} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>

              <Button type="submit" form={`shoe-form-${formId}`}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </FormProvider>
  );
}

export function EditShoeForm3({
  shoe,
  index,
}: {
  shoe: Shoe | null;
  index: number;
}) {
  const { control, setValue } = useFormContext();

  return (
    <div className="space-y-8">
      <FormField
        control={control}
        name={`shoeList.${index}.brand_name`}
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
        name={`shoeList.${index}.model_name`}
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
          name={`shoeList.${index}.start_date`}
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
        name={`shoeList.${index}.distance`}
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
        name={`shoeList.${index}.distance_mi`}
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
                name={`shoeList.${index}.categories`}
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
        name={`shoeList.${index}.description`}
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

type EditShoeFormParams = {
  shoeOp: "edit" | "add" | null;
  setShowShoeForm: (value: boolean) => void;
  index: number;
  shoeRotation: ShoeRotationType | null;
  handleUpdate: () => void;
};

function EditShoeForm({
  shoeRotation,
  shoeOp,
  setShowShoeForm,
  index,
  handleUpdate,
}: EditShoeFormParams) {
  const [showImportShoeForm, setShowImportShoeForm] = useState(false);
  const { control, setValue, trigger } =
    useFormContext<ShoeRotationFormValues>();

  // const distanceWatch = watch(`shoes.${index}.distance`);
  // useEffect(() => {
  //   if (distanceWatch && distanceWatch > 0) {
  //     setValue(`shoes.${index}.distance_mi`, metersToMiles(distanceWatch));
  //   }
  // }, [distanceWatch, getValues, index, setValue]);

  if (shoeOp == null) return;

  // const handleCancel = () => {
  //   if (shoeOp === "add") {
  //     remove(index);
  //     setShowShoeForm(false);
  //   }
  //   if (shoeOp === "edit") {
  //     resetField(`shoes.${index}`);
  //     setShowShoeForm(false);
  //   }
  // };

  const handleEdit = async () => {
    const result = await trigger(`shoes.${index}`);
    if (!result) return;

    // inline update shoes for existing shoe rotation
    if (shoeRotation?.slug) {
      handleUpdate();
    }
    setShowShoeForm(false);
  };

  const handleImportSelect = (shoe: StravaShoeType) => {
    setValue(`shoes.${index}.brand_name`, shoe.brand_name);
    setValue(`shoes.${index}.model_name`, shoe.model_name);
    setValue(`shoes.${index}.distance`, shoe.distance);
    setValue(`shoes.${index}.distance_mi`, metersToMiles(shoe.distance));
    setShowImportShoeForm(false);
  };

  return (
    <div className="space-y-8">
      {!showImportShoeForm && (
        <Button
          type="button"
          variant="secondary"
          className=""
          onClick={() => setShowImportShoeForm(true)}
        >
          Import From Strava
        </Button>
      )}
      {showImportShoeForm && (
        <>
          <ImportShoeForm handleImportSelect={handleImportSelect} />
          <Button type="button" onClick={() => setShowImportShoeForm(false)}>
            Cancel
          </Button>
        </>
      )}
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
            <FormControl>
              <Input placeholder="distance" type="hidden" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
      <FormField
        control={control}
        name={`shoes.${index}.distance_mi`}
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
                    setValue(`shoes.${index}.distance`, distanceMeters);
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
                name={`shoes.${index}.categories`}
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
        name={`shoes.${index}.description`}
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
      <div className="my-10 flex justify-end">
        <Button type="button" onClick={handleEdit}>
          {shoeOp === "edit" ? "Update" : "Add"} Shoe
        </Button>
      </div>
    </div>
  );
}

function AddShoeModal({
  shoeList,
  handleAddShoe,
}: {
  handleAddShoe: (shoe: ShoeType) => void;
  shoeList: ShoeRotationType["shoeList"];
}) {
  const [open, setOpen] = useState(false);

  const setSelectedShoe = (shoe: ShoeType) => {
    handleAddShoe(shoe);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          Add Shoe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Shoe</DialogTitle>
          <DialogDescription>Choose a shoe to add:</DialogDescription>
        </DialogHeader>

        <AddShoeForm setSelectedShoe={setSelectedShoe} shoeList={shoeList} />

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddShoeForm({
  setSelectedShoe,
  shoeList,
}: {
  setSelectedShoe: (shoe: ShoeType) => void;
  shoeList: ShoeRotationType["shoeList"];
}) {
  const { data: shoes, isLoading } = api.shoe.getUserShoes.useQuery(undefined, {
    staleTime: API_CACHE_DURATION.stravaGetShoes,
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!shoes) {
    return <div>No shoes found</div>;
  }

  const existingShoeIds = shoeList.map((s) => s.slug);
  const unselectedShoes = shoes.filter(
    (s) => !existingShoeIds.includes(s.slug)
  );

  return (
    <>
      <div className="overflow-scroll">
        {unselectedShoes.map((shoe) => {
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
                  {metersToMiles(shoe.distance).toFixed(2)} mi
                </div>
              </div>
              <div>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedShoe(shoe)}
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

function ImportShoeForm({
  handleImportSelect,
}: {
  handleImportSelect: (shoe: StravaShoeType) => void;
}) {
  const { data: shoes, isLoading } = api.strava.getShoes.useQuery(undefined, {
    staleTime: API_CACHE_DURATION.stravaGetShoes,
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!shoes) {
    return <div>No shoes found</div>;
  }

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
                  {metersToMiles(shoe.distance).toFixed(2)} mi
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
