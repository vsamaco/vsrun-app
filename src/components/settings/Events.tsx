import React, { useState } from "react";
import {
  type UseFieldArrayAppend,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { type Event } from "~/types";
import { api } from "~/utils/api";

type Props = {
  events: Event[];
};

function EventSettings({ events }: Props) {
  return (
    <div>
      <h1>EventSettings</h1>
      <EventSettingsForm events={events} />
    </div>
  );
}

type EventSettingsFormProps = {
  events: Event[];
};

type EventsFormValues = {
  events: Event[];
};

function EventSettingsForm({ events }: EventSettingsFormProps) {
  const methods = useForm<EventsFormValues>({
    defaultValues: {
      events: events,
    },
  });
  const { control, register, handleSubmit } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "events",
  });

  const utils = api.useContext();
  const updateProfile = api.runProfile.updateProfile.useMutation({
    onSuccess: async (newEntry) => {
      await utils.runProfile.getProfile.invalidate();
    },
    onError: (error) => {
      console.log({ error });
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log("submit", data);
    updateProfile.mutate({ events: data.events });
  });

  return (
    <form onSubmit={onSubmit}>
      <div className="flex">
        <div className="flex-col">
          {fields.map((event, index) => {
            return (
              <div className="flex" key={index}>
                <div className="flex flex-col">
                  <label htmlFor="name">Name</label>
                  <input {...register(`events.${index}.name`)} />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="distance">Distance</label>
                  <input {...register(`events.${index}.distance`)} />
                </div>
                <div className="flex flex-col">{event.start_date}</div>
                <div className="flex-col">
                  <span onClick={() => remove(index)}>Remove</span>
                </div>
              </div>
            );
          })}
          <button type="submit">Save</button>
        </div>
        <div className="flex-col">
          <NewEventForm append={append} />
        </div>
      </div>
    </form>
  );
}

type NewEventFormProps = {
  append: UseFieldArrayAppend<EventsFormValues, "events">;
};

type NewEventProps = {
  id: string | null;
  name: string;
  start_date: string;
  distance: number | null;
};

function NewEventForm({ append }: NewEventFormProps) {
  const [newEvent, setNewEvent] = useState<NewEventProps>({
    id: null,
    name: "test event",
    start_date: new Date().toUTCString(),
    distance: 100,
  });

  const handleAddEvent = () => {
    append({
      ...newEvent,
      id: Date.now().toString(),
    });
  };

  return (
    <>
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          name="name"
          value={newEvent.name}
          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="start_date">Start Date</label>
        <input
          type="text"
          name="start_date"
          value={newEvent.start_date}
          onChange={(e) =>
            setNewEvent({ ...newEvent, start_date: e.target.value })
          }
        />
      </div>
      <div>
        <label htmlFor="distance">Distance</label>
        <input
          type="number"
          name="distance"
          pattern="[0-9]*"
          value={newEvent.distance}
          onChange={(e) =>
            setNewEvent({ ...newEvent, distance: +e.target.value })
          }
        />
      </div>
      <button type="button" onClick={() => handleAddEvent()}>
        Add Event
      </button>
    </>
  );
}

export default EventSettings;
