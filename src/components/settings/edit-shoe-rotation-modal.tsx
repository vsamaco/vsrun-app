/* eslint-disable @typescript-eslint/no-misused-promises */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { z } from "zod";
import { SHOE_CATEGORIES, type Shoe, type ShoeRotationType } from "~/types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { api } from "~/utils/api";
import { toast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { ToastClose } from "../ui/toast";
import { Checkbox } from "../ui/checkbox";
import { type ReactNode, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Pencil, Trash2 } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { metersToMiles, milesToMeters } from "~/utils/activity";

type ShoeRotationModalProps = {
  shoeRotation: ShoeRotationType | null;
} & Omit<ModalProps, "children">;

function ShoeRotationModal({
  shoeRotation,
  ...modalProps
}: ShoeRotationModalProps) {
  const isNew = shoeRotation == null;

  return (
    <Modal {...modalProps}>
      <DialogTrigger asChild>
        <Button className="">{isNew ? "Create" : "Edit"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isNew ? "Create" : "Edit"} Shoe Rotation</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <ShoeRotationForm
          shoeRotation={shoeRotation}
          setOpen={modalProps.setOpen}
          isOpen={modalProps.isOpen}
        />
      </DialogContent>
    </Modal>
  );
}

type ModalProps = {
  setOpen: (value: boolean) => void;
  isOpen: boolean;
  children: ReactNode;
};

function Modal({ isOpen, setOpen, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {children}
    </Dialog>
  );
}

type ShoeRotationFormValues = Omit<ShoeRotationType, "id" | "slug">;

type ShoeRotationFormProps = {
  shoeRotation: ShoeRotationType | null;
} & Omit<ModalProps, "children">;

function ShoeRotationForm({
  shoeRotation,
  ...modalProps
}: ShoeRotationFormProps) {
  const isNew = shoeRotation == null;

  const methods = useForm<ShoeRotationFormValues>({
    resolver: zodResolver(
      z.object({
        name: z.string(),
        startDate: z.coerce.date(),
        description: z.string(),
        shoes: z.array(
          z.object({
            brand_name: z.string(),
            model_name: z.string(),
            distance: z.coerce.number(),
            distance_mi: z.coerce.number(),
            categories: z.array(z.enum(SHOE_CATEGORIES)),
          })
        ),
      })
    ),
    defaultValues: {
      name: shoeRotation?.name || "",
      startDate: shoeRotation?.startDate,
      description: shoeRotation?.description || "",
      shoes:
        shoeRotation?.shoes?.map((s) => ({
          ...s,
          distance_mi: metersToMiles(s.distance),
        })) || [],
    },
  });
  const {
    control,
    handleSubmit,
    watch,
    formState: { isDirty },
  } = methods;

  const utils = api.useContext();
  const createShoeRotation = api.shoeRotation.createShoeRotation.useMutation({
    onSuccess: async (_) => {
      await utils.shoeRotation.getShoeRotationBySlug.invalidate();
      await utils.shoeRotation.getUserShoeRotations.invalidate();
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
  const updateShoeRotation = api.shoeRotation.updateShoeRotation.useMutation({
    onSuccess: async (_) => {
      await utils.shoeRotation.getShoeRotationBySlug.invalidate();
      await utils.shoeRotation.getUserShoeRotations.invalidate();
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

  const deleteShoeRotation = api.shoeRotation.deleteShoeRotation.useMutation({
    onSuccess: async (_) => {
      await utils.shoeRotation.getShoeRotationBySlug.invalidate();
      await utils.shoeRotation.getUserShoeRotations.invalidate();

      methods.reset();
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
      modalProps.setOpen(false);

      if (shoeRotation?.slug) {
        updateShoeRotation.mutate({
          params: { slug: shoeRotation.slug },
          body: data,
        });
      } else {
        createShoeRotation.mutate({ body: data });
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "shoes",
  });

  const defaultValues = {
    brand_name: "default brand",
    model_name: "default model",
    distance: 0,
    categories: [],
  };

  const [shoeIndex, setShoeIndex] = useState(() => {
    return fields.length;
  });
  const [showAddShoeForm, setShowAddShoeForm] = useState(false);
  const [shoeOp, setShoeOp] = useState<"add" | "edit" | null>(null);

  const handleEdit = (index: number) => {
    setShoeIndex(index);
    setShoeOp("edit");
    setShowAddShoeForm(true);
  };

  const shoes = watch("shoes", []);

  return (
    <div className="">
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="space-y-8">
          {!showAddShoeForm && (
            <>
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
                        <Textarea
                          placeholder="description"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
              </FormItem>

              <FormItem>
                <FormLabel>Shoes:</FormLabel>
                <div className="space-y-5">
                  {shoes.map((shoe, shoeIndex) => (
                    <div
                      key={shoeIndex}
                      className="border-gray group flex w-full flex-row items-center justify-between border py-2"
                    >
                      <div className="space-y-2 rounded-sm px-3 ">
                        <div
                          onClick={() => handleEdit(shoeIndex)}
                          className="w-[200px] truncate group-hover:cursor-pointer"
                        >
                          <span>{shoe.brand_name}</span>&nbsp;
                          <span>{shoe.model_name}</span>
                        </div>
                        <div className="space-x-2">
                          {shoe.categories.map((category, categoryIdx) => (
                            <Badge
                              key={categoryIdx}
                              variant="secondary"
                              className="group-hover:bg-yellow-400"
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-row space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => remove(shoeIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleEdit(shoeIndex)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {!showAddShoeForm && (
                  <>
                    <Button
                      type="button"
                      onClick={() => {
                        append(defaultValues);
                        setShoeOp("add");
                        setShoeIndex(shoes.length);
                        setShowAddShoeForm(true);
                      }}
                      className="w-full"
                    >
                      Add Shoe
                    </Button>
                  </>
                )}
              </FormItem>

              <div className="">
                <div className="flex justify-between">
                  {!isNew && (
                    <Button type="button" onClick={onDelete}>
                      Delete
                    </Button>
                  )}
                  <Button disabled={!isDirty} type="submit">
                    {isNew ? "Create" : "Save"}
                  </Button>
                </div>
              </div>
            </>
          )}

          {showAddShoeForm && (
            <EditShoeForm
              shoeOp={shoeOp}
              setShowShoeForm={setShowAddShoeForm}
              index={shoeIndex}
            />
          )}
        </form>
      </FormProvider>
    </div>
  );
}

function EditShoeForm({
  shoeOp,
  setShowShoeForm,
  index,
}: {
  shoeOp: "edit" | "add" | null;
  setShowShoeForm: (value: boolean) => void;
  index: number;
}) {
  const [showImportShoeForm, setShowImportShoeForm] = useState(false);
  const { control, resetField, setValue, watch, getValues } =
    useFormContext<ShoeRotationFormValues>();

  const { remove } = useFieldArray({
    control,
    name: "shoes",
  });

  const distanceWatch = watch(`shoes.${index}.distance`);
  useEffect(() => {
    if (distanceWatch > 0) {
      setValue(`shoes.${index}.distance_mi`, metersToMiles(distanceWatch));
    }
  }, [distanceWatch, getValues, index, setValue]);

  if (shoeOp == null) return;

  const handleCancel = () => {
    if (shoeOp === "add") {
      remove(index);
      setShowShoeForm(false);
    }
    if (shoeOp === "edit") {
      resetField(`shoes.${index}`);
      setShowShoeForm(false);
    }
  };

  const handleEdit = () => {
    setShowShoeForm(false);
  };

  const handleImportSelect = (shoe: Shoe) => {
    setValue(`shoes.${index}.brand_name`, shoe.brand_name);
    setValue(`shoes.${index}.model_name`, shoe.model_name);
    setValue(`shoes.${index}.distance`, shoe.distance);
    setShowImportShoeForm(false);
  };

  return (
    <div className="space-y-8">
      <h3>{shoeOp === "add" ? "Add" : "Edit"} Shoe</h3>
      {!showImportShoeForm && (
        <Button
          type="button"
          variant="secondary"
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
              <Input placeholder="distance" {...field} />
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
        <FormLabel className="text-base">Shoe Categories:</FormLabel>
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
      <div className="my-10 flex justify-between">
        <Button type="button" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleEdit}>
          {shoeOp === "edit" ? "Update" : "Add"} Shoe
        </Button>
      </div>
    </div>
  );
}

function ImportShoeForm({
  handleImportSelect,
}: {
  handleImportSelect: (shoe: Shoe) => void;
}) {
  const { data: shoes, isLoading } = api.strava.getShoes.useQuery();
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

export default ShoeRotationModal;
