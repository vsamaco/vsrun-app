import React from "react";
import { type WeekStat } from "~/types";
import {
  formatHumanizeSeconds,
  metersToFeet,
  metersToMiles,
  parseDateDay,
  parseDateMonth,
} from "~/utils/activity";

type WeekProps = {
  weekStats: WeekStat;
};

function Week({ weekStats }: WeekProps) {
  const startMonth = parseDateMonth(new Date(weekStats.start_date));
  const startDay = parseDateDay(new Date(weekStats.start_date));

  const endMonth = parseDateMonth(new Date(weekStats.end_date));
  const endDay = parseDateDay(new Date(weekStats.end_date));

  const { total_distance, total_duration, total_elevation } = weekStats;

  return (
    <div id="week" className="flex flex-col justify-center py-10 sm:py-20">
      <div className="mb-5 border-b-4 border-blue-300">
        <h2 className="text-6xl text-blue-300">WEEK</h2>
      </div>

      <ul className="space-y-5 divide-y divide-gray-500">
        <li className="flex w-full items-center justify-between pt-5">
          <div className="text-xl uppercase md:text-2xl">period</div>
          <div className="text-2xl font-thin uppercase md:text-4xl">
            {startMonth} {startDay} - {endMonth !== startMonth ? endMonth : ""}{" "}
            {endDay}
          </div>
        </li>
        <li className="flex w-full items-center justify-between pt-5">
          <div className="text-xl uppercase md:text-2xl">distance</div>
          <div className="text-2xl font-thin md:text-4xl">
            {metersToMiles(total_distance).toLocaleString()} mi
          </div>
        </li>
        <li className="flex w-full items-center justify-between pt-5">
          <div className="text-xl uppercase md:text-2xl">duration</div>
          <div className="text-2xl font-thin md:text-4xl">
            {formatHumanizeSeconds(total_duration)}
          </div>
        </li>
        <li className="flex w-full items-center justify-between pt-5">
          <div className="text-xl uppercase md:text-2xl">elevation</div>
          <div className="text-2xl font-thin md:text-4xl">
            {Math.ceil(metersToFeet(total_elevation)).toLocaleString()} ft
          </div>
        </li>
      </ul>
    </div>
  );
}

export default Week;
