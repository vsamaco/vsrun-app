import Head from "next/head";
import { notFound } from "next/navigation";
import EditWeekStats from "~/components/settings/edit-weekstats";
import Layout from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";

function WeekStatsSettings() {
  const { data, isLoading } = api.runProfile.getUserProfile.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) return notFound();

  return (
    <>
      <Head>
        <title>vsrun | Settings</title>
        <meta name="description" content="vsrun | running showcase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Weekly Stats</h3>
          <p className="text-sm text-muted-foreground">
            Highlight your weekly mileage, duration, and elevation
          </p>
        </div>
        <Separator />
        <EditWeekStats weekStats={data?.weekStats} />
      </div>
    </>
  );
}

WeekStatsSettings.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default WeekStatsSettings;
