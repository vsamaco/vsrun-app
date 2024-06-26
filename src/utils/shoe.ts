import { type ShoeRotationType } from "~/types";
import { metersToMiles } from "./activity";

export const SHOE_BRANDS = [
  "Adidas",
  "Altra",
  "Asics",
  "Brooks",
  "Hoka",
  "New Balance",
  "Nike",
  "Mizuno",
  "On",
  "Puma",
  "Reebok",
  "Saucony",
];

export const parseShoeBrandModel = (shoeName: string) => {
  const regex = new RegExp(`^(${SHOE_BRANDS.join("|")})\\s(.+)$`, "i");
  const match = shoeName.match(regex);

  if (match && match[1] && match[2]) {
    return { brand: match[1], model: match[2] };
  }
  return { brand: "", model: shoeName };
};

export const totalShoeMiles = (shoes: ShoeRotationType["shoeList"]) => {
  return Math.ceil(
    shoes.reduce((acc, item) => {
      acc += metersToMiles(item.distance);
      return acc;
    }, 0)
  );
};
