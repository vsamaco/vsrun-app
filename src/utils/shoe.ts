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
  const regex = new RegExp(`^(${SHOE_BRANDS.join("|")})\\s(.+)$`);
  const match = shoeName.match(regex);

  if (match) {
    return { brand: match[1], model: match[2] };
  }
  return { brand: null, model: shoeName };
};
