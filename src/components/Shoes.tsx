import React from "react";
import { type Shoe } from "~/types";
import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { metersToMiles } from "~/utils/activity";

type Props = {
  shoes: Omit<Shoe, "slug">[];
};

export default function Shoes({ shoes }: Props) {
  return (
    <div id="shoes" className="flex flex-col justify-center py-10 sm:py-20">
      <div className=" mb-5 border-b-4 border-green-300">
        <h3 className="text-6xl text-green-300">SHOES</h3>
      </div>

      <div className="space-y-4">
        {shoes.map((shoe, index) => (
          <Card key={index} className="group hover:border-gray-500">
            <CardHeader className="flex flex-row justify-between space-y-0 pb-2">
              <CardTitle className="">
                <div className="flex max-w-[200px] flex-col md:max-w-none md:flex-row">
                  <span className="mr-2">{shoe.brand_name}</span>
                  <span className="">{shoe.model_name}</span>
                </div>
              </CardTitle>
              <div className="text-xl  md:text-2xl">
                {Math.ceil(metersToMiles(shoe.distance))} mi
              </div>
            </CardHeader>
            <CardFooter>
              <div className="space-x-2">
                {shoe.categories.map((category, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-sm uppercase tracking-wide group-hover:bg-yellow-400"
                  >
                    {category.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
