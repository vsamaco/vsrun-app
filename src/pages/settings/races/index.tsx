import Head from "next/head";
import Link from "next/link";
import Layout from "~/components/settings/layout";
import { buttonVariants } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";

function RacesSettings() {
  const { data: activities, isLoading } =
    api.races.getUserProfileRaces.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
          {activities &&
            activities.map((activity) => {
              return (
                <Card key={activity.id}>
                  <CardContent>
                    <Link href={`/settings/races/${activity.slug}/edit`}>
                      {activity.name}
                    </Link>
                  </CardContent>
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
