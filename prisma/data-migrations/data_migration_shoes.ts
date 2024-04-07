import { PrismaClient } from "@prisma/client";
import yargs from "yargs/yargs";

const prisma = new PrismaClient();

async function main() {
  const argv = yargs(process.argv.slice(2))
    .options({
      f: { type: "boolean", default: false },
      profile: { type: "array" },
      allProfiles: { type: "boolean", default: false },
    })
    .parseSync();

  const writeShoes = argv.f;
  console.log("ARGS", {
    f: argv.f,
    profile: argv.profile,
    allProfiles: argv.allProfiles,
  });

  console.log(writeShoes ? `MIGRATE SHOES WRITE` : `MIGRATE SHOES READ`);

  await prisma.$transaction(
    async (tx) => {
      const profiles = await tx.runProfile.findMany({
        ...(argv.profile?.length
          ? {
              where: {
                slug: { in: argv.profile as string[] },
              },
            }
          : null),
        include: {
          shoeRotations: {
            include: { shoeList: true },
          },
          shoes2: true,
        },
      });

      for (const profile of profiles) {
        console.log("\nprocess profile:", profile.slug);
        const { shoeRotations, shoes2: shoeList } = profile;

        for (const shoeRotation of shoeRotations) {
          console.log("\nprocess shoeRotation:" + shoeRotation.name);
          const currentShoes = shoeRotation.shoes;

          for (const shoe of currentShoes) {
            const foundShoe = shoeList.find(
              (s) =>
                s.brand_name === shoe.brand_name &&
                s.model_name === shoe.model_name &&
                s.distance === shoe.distance
            );

            if (!foundShoe) {
              // migrate existing shoe
              console.log(`create shoe: ${shoe.brand_name} ${shoe.model_name}`);
              if (writeShoes) {
                const shoeResult = await tx.shoe.create({
                  data: {
                    ...shoe,
                    start_date: new Date(),
                    description: shoe.description || "",
                    runProfileId: profile.id,
                    shoeRotations: {
                      connect: { id: shoeRotation.id },
                    },
                  },
                });
                console.log(`shoe id: ${shoeResult.id}`);
                shoeList.push(shoeResult);
              }
            } else {
              // check shoeRotation relation
              const needShoeRotation =
                foundShoe &&
                !shoeRotation.shoeList.find((s) => s.id === foundShoe.id);

              if (needShoeRotation) {
                await tx.shoe.update({
                  where: { id: foundShoe.id },
                  data: {
                    shoeRotations: {
                      connect: { id: shoeRotation.id },
                    },
                  },
                });
                console.log(
                  "update shoeRotation connection:" +
                    shoe.brand_name +
                    " " +
                    shoe.model_name
                );
              }
            }
          }
        }
      }
    },
    {
      maxWait: 5000, // default: 2000
      timeout: 20000, // default: 5000
    }
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => await prisma.$disconnect());
