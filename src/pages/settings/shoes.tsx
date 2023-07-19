import React from "react";
import ShoesSettingsForm from "~/components/settings/Shoes";
import { Shoe } from "~/types";
import { api } from "~/utils/api";

type ShoesSettingsProps = {};

function ShoesSettings({}: ShoesSettingsProps) {
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
      <h1>shoes settings</h1>
      <ShoesSettingsForm shoes={shoes} />
    </div>
  );
}

export default ShoesSettings;
