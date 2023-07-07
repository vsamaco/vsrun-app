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
  const startMonth = parseDateMonth(weekStats.start_date);
  const startDay = parseDateDay(weekStats.start_date);

  const endMonth = parseDateMonth(weekStats.end_date);
  const endDay = parseDateDay(weekStats.end_date);

  const { total_distance, total_duration, total_elevation } = weekStats;

  return (
    <div
      id="week"
      className="flex flex-col justify-center border-t-4 border-blue-300 px-5 py-10 sm:px-10 sm:py-20"
    >
      <h2 className="text-8xl font-light text-blue-300">WEEK</h2>
      <p className="mt-3 text-4xl uppercase">
        {startMonth} {startDay} - {endMonth} {endDay}
      </p>

      <div className="mt-10 grid grid-cols-1 justify-center gap-5 sm:mt-10 md:mt-40 md:grid-cols-3">
        <div className="flex h-64 w-full flex-col items-center justify-center border-b-4 border-blue-300 bg-white">
          <div data-testid="distance-value" className="text-right text-6xl">
            {metersToMiles(total_distance).toLocaleString()} mi
          </div>
          <div className="mt-5 text-left text-2xl font-light">DISTANCE</div>
        </div>
        <div className="flex h-64 flex-col items-center justify-center border-b-4 border-blue-300 bg-white">
          <div data-testid="time-value" className="text-right text-6xl">
            {formatHumanizeSeconds(total_duration)}
          </div>
          <div className="mt-5 text-left text-2xl font-light">TIME</div>
        </div>
        <div className="flex h-64 flex-col items-center justify-center border-b-4 border-blue-300 bg-white">
          <div data-testid="elevation-value" className="text-right text-6xl">
            {Math.ceil(metersToFeet(total_elevation)).toLocaleString()} ft
          </div>
          <div className="text-lef mt-5 text-2xl font-light">ELEVATION</div>
        </div>
      </div>
    </div>
  );
}

export default Week;
