import Head from "next/head";
import { useRouter } from "next/router";
import EditRaceForm from "~/components/settings/edit-race";
import Layout from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";

function EditRaceSettingsPage() {
  const router = useRouter();
  const slug = router.query.slug as string;
  const { data: race, isLoading } = api.races.getProfileRaceBySlug.useQuery({
    slug,
  });

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
          <h3 className="text-lg font-medium">Edit Race</h3>
        </div>
        <Separator />
        <EditRaceForm race={race} />
      </div>
    </>
  );
}

EditRaceSettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default EditRaceSettingsPage;
