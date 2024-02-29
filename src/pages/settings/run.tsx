import { notFound } from "next/navigation";
import { EditHighlightRun } from "~/components/settings/edit-highlight-run";
import Layout from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";

function HighlightRunSettings() {
  const { data, isLoading } = api.runProfile.getUserProfile.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Highlight Run</h3>
        <p className="text-sm text-muted-foreground">
          Highlight run with distance, time, elevation, and map.
        </p>
      </div>
      <Separator />
      <EditHighlightRun highlightRun={data?.highlightRun} />
    </div>
  );
}

HighlightRunSettings.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default HighlightRunSettings;
