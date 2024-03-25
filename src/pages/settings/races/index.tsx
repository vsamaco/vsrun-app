import Head from "next/head";
import Link from "next/link";
import { notFound } from "next/navigation";
import Layout from "~/components/settings/layout";
import { buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
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
        <div className="grid grid-cols-2 gap-4">
          {races &&
            races.map((race) => {
              return (
                <Card key={race.slug} className="">
                  <CardHeader>
                    <CardTitle className="pb-2">{race.name}</CardTitle>
                    <CardDescription className="mt-5">
                      {formatDate(race.start_date, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent></CardContent>
                  <CardFooter className="flex justify-between">
                    {/* <Link
                      href={`/races/${race.slug}`}
                      className={buttonVariants({ variant: "outline" })}
                      target="_blank"
                    >
                      View
                    </Link> */}
                    <Link
                      className={buttonVariants({ variant: "outline" })}
                      href={`/settings/races/${race.slug}/edit`}
                    >
                      Edit
                    </Link>
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
