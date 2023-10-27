import React from "react";
import ShoeSettingsForm from "~/components/settings/Shoes";
import SettingsLayout from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";
import { type Shoe } from "~/types";
import { api } from "~/utils/api";

type ShoesSettingsProps = {};

function ShoesSettingsPage({}: ShoesSettingsProps) {
  const { data, isLoading } = api.runProfile.getUserProfile.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Not found</div>;
  }
  const shoes = data.shoes as Shoe[];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Shoes</h3>
        <p className="text-sm text-muted-foreground">
          Showcase your shoe rotation for the current season.
        </p>
      </div>
      <Separator />
      <ShoeSettingsForm shoes={shoes} />
    </div>
  );
}

ShoesSettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default ShoesSettingsPage;
