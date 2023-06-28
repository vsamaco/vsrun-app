import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.runProfile.upsert({
    where: {
      userId: "cljdfv2yx0000smvl6hsz37tx",
    },
    update: {},
    create: {
      userId: "cljdfv2yx0000smvl6hsz37tx",
      username: "milesperdonut",
      highlightRun: {
        id: "123",
        name: "Sample Run",
        distance: 100,
        moving_time: 200,
        total_elevation_gain: 300,
      },
      weekStats: {
        weekMonth: "June",
        weekStartDate: "1",
        weekEndDate: "7",
        weekDistance: 100,
        weekDuration: 200,
        weekElevation: 300,
      },
      shoes: [
        {
          id: "456",
          brand_name: "Saucony",
          model_name: "Endorphin Pro 3",
          distance: 100,
        },
      ],
      events: [
        {
          name: "San Francisco Marathon",
          start_date: new Date(2023, 7, 23).toUTCString(),
          distance: 26.2,
        },
      ],
    },
  });
  console.log("after", profile);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
