import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    const profiles = await tx.runProfile.findMany();

    for (const profile of profiles) {
      const races = await tx.activity.findMany({
        where: {
          raceProfileId: profile.id,
        },
      });

      const highlightRun = await tx.activity.findUnique({
        where: {
          highlightRunProfileId: profile.id,
          name: profile.highlightRun.name,
        },
      });

      if (profile.highlightRun && !highlightRun) {
        console.log(` ${profile.name} migrate highlightRun`);
        const createHighlightRun = await tx.activity.create({
          data: {
            name: profile.highlightRun.name,
            start_date: profile.highlightRun.start_date,
            description: "",
            distance: profile.highlightRun.distance,
            moving_time: profile.highlightRun.moving_time,
            total_elevation_gain: profile.highlightRun.total_elevation_gain,
            start_latlng: profile.highlightRun.start_latlng,
            end_latlng: profile.highlightRun.end_latlng,
            summary_polyline: profile.highlightRun.summary_polyline,
            metadata: profile.highlightRun.metadata,
            highlightRunProfileId: profile.id,
          },
        });
        console.log(
          `${profile.name} created highlight activity: ${createHighlightRun.id}`
        );
      }

      if (profile.events && races.length === 0) {
        console.log(` ${profile.name} migrate ${profile.events.length} races`);

        for (const raceEvent of profile.events) {
          const createRace = await tx.activity.create({
            data: {
              name: raceEvent.name,
              workout_type: "race",
              start_date: new Date(raceEvent.start_date),
              description: "",
              distance: raceEvent.distance,
              moving_time: raceEvent.moving_time,
              total_elevation_gain: raceEvent?.total_elevation_gain || 0,
              raceProfileId: profile.id,
            },
          });
          console.log(
            `${profile.name} created race activity: ${createRace.id}`
          );
        }
      }
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => await prisma.$disconnect());
