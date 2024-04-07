import Head from "next/head";
import EditShoeForm from "~/components/settings/edit-shoe";
import Layout from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";

function NewShoePage() {
  return (
    <>
      <Head>
        <title>vsrun | Settings</title>
        <meta name="description" content="vsrun | running showcase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">New Shoe </h3>
        </div>
        <Separator />
        <EditShoeForm shoe={null} />
      </div>
    </>
  );
}

NewShoePage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default NewShoePage;
