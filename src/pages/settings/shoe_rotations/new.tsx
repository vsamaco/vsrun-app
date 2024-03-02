import Head from "next/head";
import { EditShoeRotationForm } from "~/components/settings/edit-shoe-rotation";
import Layout from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";

function NewShoeRotationPage() {
  return (
    <>
      <Head>
        <title>vsrun | Settings</title>
        <meta name="description" content="vsrun | running showcase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">New Shoe Rotation</h3>
        </div>
        <Separator />
        <EditShoeRotationForm shoeRotation={null} />
      </div>
    </>
  );
}

NewShoeRotationPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default NewShoeRotationPage;
