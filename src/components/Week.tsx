import { format } from "date-fns";
import React from "react";
import { type WeekStat } from "~/types";
import {
  formatHumanizeSeconds,
  metersToFeet,
  metersToMiles,
  parseDateDay,
  parseDateMonth,
} from "~/utils/activity";
import { formatDate } from "~/utils/date";

type WeekProps = {
  weekStats: WeekStat | Record<string, never>;
};

function Week({ weekStats }: WeekProps) {
  const { total_distance, total_duration, total_elevation } = weekStats;

  const periodRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const startMonth = format(new Date(weekStats.start_date), "MMM");
    const startDay = format(new Date(weekStats.start_date), "dd");
    const endMonth = format(new Date(weekStats.end_date), "MMM");
    const endDay = format(new Date(weekStats.end_date), "dd");

    if (periodRef.current) {
      periodRef.current.textContent = `${startMonth} ${startDay} - ${
        endMonth !== startMonth ? endMonth : ""
      } ${endDay}`;
      periodRef.current.style.display = "block";
    }
  }, [weekStats, periodRef]);

  return (
    <div id="week" className="flex flex-col justify-center py-10 sm:py-20">
      <div className="mb-5 border-b-4 border-blue-300">
        <h2 className="text-6xl text-blue-300">WEEK</h2>
      </div>

      <ul className="space-y-5 divide-y divide-gray-500">
        <li className="flex w-full items-center justify-between pt-5">
          <div className="text-xl uppercase md:text-2xl">period</div>
          <div
            className="hidden text-2xl font-thin uppercase md:text-4xl"
            ref={periodRef}
          >
            {formatDate(new Date(weekStats.start_date), {
              year: "numeric",
              month: "2-digit",
              day: "numeric",
            })}
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
            {Math.ceil(metersToFeet(total_elevation))} ft
          </div>
        </li>
      </ul>
    </div>
  );
}

export default Week;
