import React from "react";
import { api } from "~/utils/api";
import SettingsLayout from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";
import RunSettingForm from "~/components/settings/Run";

const RunSettingsPage = () => {
  const { data, isLoading } = api.runProfile.getProfile.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Not Found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Run</h3>
        <p className="text-sm text-muted-foreground">
          Showcase your run activity.
        </p>
      </div>
      <Separator />
      <RunSettingForm profile={data} />
    </div>
  );
};

RunSettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default RunSettingsPage;
