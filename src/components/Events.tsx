import React from "react";
import { type RaceEvent } from "../types";
import { formatDurationHMS } from "~/utils/activity";
import { format } from "date-fns";

type EventsProps = {
  events: RaceEvent[];
};

function Events({ events }: EventsProps) {
  return (
    <div id="races" className="flex flex-col justify-center py-10 sm:py-20">
      <div className="mb-5 border-b-4 border-red-400">
        <h2 className="text-6xl uppercase text-red-400">Races</h2>
      </div>
      <ul className="space-y-5 divide-y divide-black">
        {events.map((event, index) => {
          return (
            <li key={index} className="">
              <div className="flex w-full flex-row items-center justify-between pt-5">
                <div className="">
                  <div className="text-2xl">
                    <span className="uppercase">
                      {format(new Date(event.start_date), "MMM")}
                    </span>{" "}
                    <span className=" font-thin">
                      {format(new Date(event.start_date), "dd")}
                    </span>
                  </div>
                  <div className="text-2xl font-thin uppercase md:text-4xl">
                    {event.name}
                  </div>
                </div>
                {event.moving_time > 0 && (
                  <div className="text-2xl font-thin md:text-4xl">
                    {formatDurationHMS(event.moving_time)}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Events;
