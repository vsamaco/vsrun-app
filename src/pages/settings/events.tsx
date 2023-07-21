import React from "react";
import EventSettings from "~/components/settings/Events";
import { type Event } from "~/types";
import { api } from "~/utils/api";

type Props = {};

function EventSettingsPage({}: Props) {
  const { data, isLoading } = api.runProfile.getProfile.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Not found</div>;
  }
  const events = data.events as Event[];

  return (
    <div>
      <EventSettings events={events} />
    </div>
  );
}

export default EventSettingsPage;
