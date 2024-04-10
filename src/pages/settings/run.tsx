import Head from "next/head";
import { EditHighlightRun } from "~/components/settings/edit-highlight-run";
import Layout from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";

function HighlightRunSettings() {
  const { data, isLoading } =
    api.activity.getUserProfileHighlightRun.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const highlightRun = data || null;

  return (
    <>
      <Head>
        <title>vsrun | Settings</title>
        <meta name="description" content="vsrun | running showcase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Run</h3>
          <p className="text-sm text-muted-foreground">
            Highlight run with distance, time, elevation, and map.
          </p>
        </div>
        <Separator />
        <EditHighlightRun highlightRun={highlightRun} />
      </div>
    </>
  );
}

HighlightRunSettings.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default HighlightRunSettings;
