import React from "react";
import { type Shoe } from "~/types";
import { metersToMiles } from "~/utils/activity";

type Props = {
  shoes: Shoe[];
};

export default function Shoes({ shoes }: Props) {
  return (
    <div id="shoes" className="flex flex-col justify-center py-10 sm:py-20">
      <div className=" mb-5 border-b-4 border-green-300">
        <h3 className="text-6xl text-green-300">SHOES</h3>
      </div>

      <ul className="space-y-5 divide-y divide-black">
        {shoes.map((shoe, index) => (
          <li
            key={index}
            className="flex w-full items-center justify-between pt-5"
          >
            <div className="">
              <div className="text-lg uppercase md:text-2xl">
                {shoe.brand_name}
              </div>
              <div className=" text-lg font-thin uppercase md:text-2xl">
                {shoe.model_name}
              </div>
            </div>
            <div className="text-2xl font-thin md:text-4xl">
              {Math.ceil(metersToMiles(shoe.distance))} mi
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
