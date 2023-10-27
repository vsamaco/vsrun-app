import { Separator } from "@radix-ui/react-select";
import React from "react";
import GeneralSettingsForm from "~/components/settings/General";
import SettingsLayout from "~/components/settings/layout";
import { api } from "~/utils/api";

function GeneralSettingsPage() {
  const { data, isLoading } = api.runProfile.getUserProfile.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Not Found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General</h3>
        <p className="text-sm text-muted-foreground">
          Manage general settings.
        </p>
      </div>
      <Separator />
      <GeneralSettingsForm profile={data} />
    </div>
  );
}

GeneralSettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default GeneralSettingsPage;
