import Head from "next/head";
import EditRaceForm from "~/components/settings/edit-race";
import Layout from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";

function NewRaceSettingsPage() {
  return (
    <>
      <Head>
        <title>vsrun | Settings</title>
        <meta name="description" content="vsrun | running showcase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">New Race</h3>
        </div>
        <Separator />
        <EditRaceForm race={null} />
      </div>
    </>
  );
}

NewRaceSettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default NewRaceSettingsPage;
