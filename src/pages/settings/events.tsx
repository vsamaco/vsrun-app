import React from "react";
import EventSettingsForm from "~/components/settings/Events";
import SettingsLayout from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";
import { type RaceEvent } from "~/types";
import { api } from "~/utils/api";

type Props = {};

function EventSettingsPage({}: Props) {
  const { data, isLoading } = api.runProfile.getUserProfile.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Not found</div>;
  }
  const events = data.events as RaceEvent[];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Events</h3>
        <p className="text-sm text-muted-foreground">
          Showcase your upcoming events.
        </p>
      </div>
      <Separator />
      <EventSettingsForm events={events} />
    </div>
  );
}

EventSettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default EventSettingsPage;
