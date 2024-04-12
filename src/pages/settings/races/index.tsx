import { CalendarIcon } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import Layout from "~/components/settings/layout";
import { buttonVariants } from "~/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { formatDurationHMS, metersToMiles } from "~/utils/activity";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/date";

function RacesSettings() {
  const { data, isLoading } = api.activity.getUserProfileRaces.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const races = data;

  return (
    <>
      <Head>
        <title>vsrun | Settings</title>
        <meta name="description" content="vsrun | running showcase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Races</h3>
          <p className="text-sm text-muted-foreground">
            Highlight your races from 5k to marathon
          </p>
        </div>
        <Link className={buttonVariants()} href="/settings/races/new">
          Create Race
        </Link>
        <Separator />
        <div className="flex flex-col gap-4">
          {races &&
            races.map((race) => {
              return (
                <Card key={race.slug} className="">
                  <CardHeader className="">
                    <CardTitle>
                      <Link
                        className="hover:underline"
                        href={`/settings/races/${race.slug}/edit`}
                      >
                        {race.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="flex space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 hidden h-4 w-4 md:block" />
                      {formatDate(race.start_date, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div>{formatDurationHMS(race.moving_time)}</div>
                    <div>{metersToMiles(race.distance)} mi</div>
                  </CardFooter>
                </Card>
              );
            })}
        </div>
      </div>
    </>
  );
}

RacesSettings.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default RacesSettings;
