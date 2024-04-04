import Head from "next/head";
import { useRouter } from "next/router";
import EditShoeForm from "~/components/settings/edit-shoe";
import Layout from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";
import { type Shoe } from "~/types";
import { api } from "~/utils/api";

function EditShoePage() {
  const router = useRouter();
  const slug = router.query.slug as string;
  const nextShoeRotationId = router.query.nextShoeRotationId as string;

  const { data: shoe, isLoading } = api.shoe.getShoeBySlug.useQuery({ slug });

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Head>
        <title>vsrun | Settings</title>
        <meta name="description" content="vsrun | running showcase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Edit Shoe </h3>
        </div>
        <Separator />
        <EditShoeForm
          shoe={shoe as Shoe}
          nextShoeRotationId={nextShoeRotationId}
        />
      </div>
    </>
  );
}

EditShoePage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default EditShoePage;
