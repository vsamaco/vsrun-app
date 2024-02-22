import { notFound } from "next/navigation";
import { useRouter } from "next/router";
import { EditShoeRotationForm } from "~/components/settings/edit-shoe-rotation";
import Layout from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";

function EditShoeRotationPage() {
  const router = useRouter();
  const slug = router.query.slug as string;
  const { data: shoeRotation, isLoading } =
    api.shoeRotation.getShoeRotationBySlug.useQuery({ slug });

  if (isLoading) return <div>Loading...</div>;

  if (!shoeRotation) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Shoe Rotations &gt; Edit</h3>
        <p className="text-sm text-muted-foreground">
          Show shoe rotations used for a given period.
        </p>
      </div>
      <Separator />
      <EditShoeRotationForm shoeRotation={shoeRotation} />
    </div>
  );
}

EditShoeRotationPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default EditShoeRotationPage;
