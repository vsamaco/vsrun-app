import React from "react";
import { type Event } from "../types";
import { formatEventDate, metersToMiles } from "~/utils/activity";

type EventsProps = {
  events: Event[];
};

function Events({ events }: EventsProps) {
  return (
    <div
      id="races"
      className="flex flex-col justify-center border-t-4 border-red-400 px-5 py-10 sm:px-10 sm:py-20"
    >
      <h2 className="text-8xl font-light uppercase text-red-400">Races</h2>
      <div className="mt-20 flex flex-col justify-end space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        {events.map(({ name, start_date, distance, id }) => {
          return (
            <div
              key={id}
              className="relative h-96 w-full border-b-4 border-red-400 bg-white px-10 py-20 sm:w-72"
            >
              <div className="text-5xl">{name}</div>
              <div className="mt-2 text-lg">{formatEventDate(start_date)}</div>
              <div className="absolute bottom-10 mt-20 text-right text-6xl font-light">
                {metersToMiles(distance).toLocaleString("en-US", {
                  maximumFractionDigits: 1,
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Events;
