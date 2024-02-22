import { EditShoeRotationForm } from "~/components/settings/edit-shoe-rotation";
import Layout from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";

function NewShoeRotationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Shoe Rotations &gt; New</h3>
        <p className="text-sm text-muted-foreground">
          Show shoe rotations used for a given period.
        </p>
      </div>
      <Separator />
      <EditShoeRotationForm shoeRotation={null} />
    </div>
  );
}

NewShoeRotationPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default NewShoeRotationPage;
