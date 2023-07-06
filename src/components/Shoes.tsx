import React from "react";
import { type Shoe } from "~/types";
import { metersToMiles } from "~/utils/activity";

type Props = {
  shoes: Shoe[];
};

export default function Shoes({ shoes }: Props) {
  return (
    <div className="flex flex-col justify-center border-t-4 border-green-300 px-5 py-10 sm:px-10 sm:py-20">
      <h3 className="flex flex-col justify-center text-8xl font-light text-green-300">
        SHOES
      </h3>

      <ul className=" mt-20 space-y-4">
        {shoes.map((shoe) => (
          <li key={shoe.id} className="flex">
            <div className="flex-grow border-l-4 border-green-300 bg-white py-4 pl-4">
              <div className="text-2xl font-light uppercase sm:text-4xl">
                {shoe.brand_name}
              </div>
              <div className="text-lg sm:text-2xl ">{shoe.model_name}</div>
            </div>
            <div className="flex flex-none flex-col justify-center bg-white pr-5 text-2xl font-light sm:text-5xl">
              {metersToMiles(shoe.distance)} mi
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
