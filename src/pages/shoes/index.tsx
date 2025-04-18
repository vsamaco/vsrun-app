/* eslint-disable @typescript-eslint/no-misused-promises */
import { zodResolver } from "@hookform/resolvers/zod";
import { AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import { useRouter } from "next/router";
import { type InferGetServerSidePropsType } from "next/types";
import React, { useEffect } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import Layout from "~/components/layout";
import { Accordion, AccordionContent } from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import {
  SHOE_CATEGORIES,
  type ShoeCategories,
  type ShoeRotationType,
} from "~/types";
import { api } from "~/utils/api";
import { SHOE_BRANDS, type ShoeBrandType } from "~/utils/shoe";

type FormValues = {
  brands: ShoeBrandType[];
  categories: ShoeCategories[];
};

export const FormSchema = z.object({
  brands: z.array(z.enum(SHOE_BRANDS)),
  categories: z.array(z.enum(SHOE_CATEGORIES)),
});

export default function ShoeIndexPage() {
  const router = useRouter();
  const query = router.query;

  const methods = useForm<FormValues>({
    defaultValues: {
      brands: [],
      categories: [],
    },
    resolver: zodResolver(FormSchema),
  });

  const { handleSubmit, setValue, getValues, watch } = methods;

  const shoeBrands = watch("brands", []);
  const shoeCategories = watch("categories", []);

  const { data, isLoading, refetch, isFetching } =
    api.shoeRotation.getShoeRotations.useQuery(
      {
        shoe_brands: getValues("brands"),
        shoe_categories: getValues("categories"),
      },
      {
        enabled: false,
        keepPreviousData: false,
      }
    );

  useEffect(() => {
    console.log("useeffect:", {
      query: { brands: query.shoe_brands, categories: query.shoe_categories },
    });
    if (query.shoe_brands) {
      const queryBrands =
        typeof query.shoe_brands === "string"
          ? [query.shoe_brands]
          : query.shoe_brands;
      setValue("brands", queryBrands as ShoeBrandType[]);
    }

    if (query.shoe_categories) {
      const queryCategories = Array.isArray(query.shoe_categories)
        ? query.shoe_categories
        : [query.shoe_categories];
      setValue("categories", queryCategories as ShoeCategories[]);
    }
  }, [query, setValue]);

  const onSubmit = handleSubmit(
    async (data) => {
      const queryParams = {
        shoe_brands: data.brands,
        shoe_categories: data.categories,
      };
      await router.push({ query: queryParams }, undefined, { shallow: true });
      await refetch();
    },
    (error) => {
      console.log("error:", error);
    }
  );

  const filterByBrand = (shoe: ShoeRotationType["shoeList"][0]) => {
    if (!shoeBrands.length) return true;
    return shoeBrands.includes(shoe.brand_name as ShoeBrandType);
  };

  const filterByCategory = (shoe: ShoeRotationType["shoeList"][0]) => {
    if (!shoeCategories.length) return true;
    return shoe.categories.some((category) =>
      shoeCategories.includes(category as ShoeCategories)
    );
  };

  const combineFilter = (shoe: ShoeRotationType["shoeList"][0]) => {
    const brandFilter = filterByBrand(shoe);
    const categoryFilter = filterByCategory(shoe);
    return brandFilter && categoryFilter;
  };

  const removeBrand = async (brand: ShoeBrandType) => {
    const updatedBrands = shoeBrands.filter((b) => b !== brand);
    console.log("updatedBrands:", updatedBrands);
    setValue("brands", updatedBrands);
    await refetch();
  };

  const removeCategory = async (category: ShoeCategories) => {
    const updatedCategories = shoeCategories.filter((c) => c !== category);
    setValue("categories", updatedCategories);
    await refetch();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <div className="flex flex-row">
          <ShoeFilterSection />
          <div className="">
            <h3>Shoe Rotations</h3>
            <div className="space-x-2">
              {shoeBrands.map((b, i) => (
                <Badge key={`brand-${i}`}>
                  {b} <button onClick={() => removeBrand(b)}>x</button>
                </Badge>
              ))}
              {shoeCategories.map((c, i) => (
                <Badge key={`category-${i}`}>
                  {c}
                  <button onClick={() => removeCategory(c)}>x</button>
                </Badge>
              ))}
            </div>
            {isLoading && isFetching && <div>Loading...</div>}
            {data && (
              <div className="space-y-2">
                {data.map((shoeRotation) => {
                  return (
                    <Card key={shoeRotation.slug}>
                      <CardHeader>{shoeRotation.name}</CardHeader>
                      <CardContent>
                        {shoeRotation.shoeList
                          .filter(combineFilter)
                          .map((shoe) => {
                            return (
                              <div key={shoe.id} className="flex flex-row">
                                <div>{shoe.brand_name}</div>
                                <div>{shoe.categories.join(",")}</div>
                              </div>
                            );
                          })}
                      </CardContent>
                      <CardFooter>{shoeRotation.runProfile.name}</CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

function ShoeFilterSection() {
  const methods = useFormContext<FormValues>();
  const { control } = methods;

  return (
    <div className="w-[250px]">
      <Accordion type="single" defaultValue="item-1" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Brand</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col">
              {SHOE_BRANDS.map((brand) => (
                <FormField
                  key={brand}
                  control={control}
                  name={`brands`}
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(brand)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, brand])
                                : field.onChange(
                                    field.value?.filter(
                                      (value: string) => value !== brand
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="front-normal text-sm">
                          {brand}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col">
              {SHOE_CATEGORIES.map((category) => (
                <FormField
                  key={category}
                  control={control}
                  name={`categories`}
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(category)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, category])
                                : field.onChange(
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button type="submit">Submit</Button>
    </div>
  );
}

ShoeIndexPage.getLayout = function getLayout(
  page: React.ReactElement,
  pageProps: InferGetServerSidePropsType<(args: any) => any>
) {
  return <Layout {...pageProps}>{page}</Layout>;
};
