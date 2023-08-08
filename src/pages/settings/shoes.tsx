import React from "react";
import ShoeSettingsForm from "~/components/settings/Shoes";
import SettingsLayout from "~/components/settings/layout";
import { type Shoe } from "~/types";
import { api } from "~/utils/api";

type ShoesSettingsProps = {};

function ShoesSettingsPage({}: ShoesSettingsProps) {
  const { data, isLoading } = api.runProfile.getProfile.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Not found</div>;
  }
  const shoes = data.shoes as Shoe[];

  return (
    <div>
      <h1>Shoe Settings</h1>
      <ShoeSettingsForm shoes={shoes} />
    </div>
  );
}

ShoesSettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default ShoesSettingsPage;
