import Head from "next/head";
import { notFound } from "next/navigation";
import { useRouter } from "next/router";
import { EditShoeRotationForm } from "~/components/settings/edit-shoe-rotation";
import Layout from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";
import { type ShoeRotationType } from "~/types";
import { api } from "~/utils/api";

function EditShoeRotationPage() {
  const router = useRouter();
  const slug = router.query.slug as string;
  const { data: shoeRotation, isLoading } =
    api.shoeRotation.getShoeRotationBySlug.useQuery({ slug });

  if (isLoading) return <div>Loading...</div>;

  if (!shoeRotation) return notFound();

  return (
    <>
      <Head>
        <title>vsrun | Settings</title>
        <meta name="description" content="vsrun | running showcase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Edit Shoe Rotation</h3>
        </div>
        <Separator />
        <EditShoeRotationForm shoeRotation={shoeRotation as ShoeRotationType} />
      </div>
    </>
  );
}

EditShoeRotationPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default EditShoeRotationPage;
