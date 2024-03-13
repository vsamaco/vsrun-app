import { ResponsiveBar } from "@nivo/bar";
import { format, getDay } from "date-fns";
import React from "react";
import { type Activity, type WeekStat } from "~/types";
import {
  formatHumanizeSeconds,
  metersToFeet,
  metersToMiles,
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
      {weekStats.activities && weekStats.activities.length > 0 && (
        <MyResponsiveBar activities={weekStats.activities} />
      )}
    </div>
  );
}

const MyResponsiveBar = ({ activities }: { activities: Activity[] }) => {
  const weekData = [
    { id: "monday", value: 0 },
    { id: "tuesday", value: 0 },
    { id: "wednesday", value: 0 },
    { id: "thursday", value: 0 },
    { id: "friday", value: 0 },
    { id: "saturday", value: 0 },
    { id: "sunday", value: 0 },
  ];

  activities.forEach((activity) => {
    let weekIndex = getDay(new Date(activity.start_date)) - 1;
    if (weekIndex === -1) weekIndex = 6;

    console.log(weekIndex, activity.start_date, activity.name);
    if (weekIndex in weekData) {
      weekData[weekIndex]!.value += metersToMiles(activity.distance);
    }
  });

  console.log(weekData);

  return (
    <div style={{ height: 400 }}>
      <ResponsiveBar
        data={weekData}
        keys={["value"]}
        indexBy="id"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={{ scheme: "nivo" }}
        defs={[
          {
            id: "dots",
            type: "patternDots",
            background: "inherit",
            color: "#38bcb2",
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: "lines",
            type: "patternLines",
            background: "inherit",
            color: "#eed312",
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
        fill={[
          {
            match: {
              id: "fries",
            },
            id: "dots",
          },
          {
            match: {
              id: "sandwich",
            },
            id: "lines",
          },
        ]}
        borderColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "day of week",
          legendPosition: "middle",
          legendOffset: 32,
          // truncateTickAt: 0,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "distance (mi)",
          legendPosition: "middle",
          legendOffset: -40,
          // truncateTickAt: 0,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        // legends={[
        //   {
        //     dataFrom: "keys",
        //     anchor: "bottom-right",
        //     direction: "column",
        //     justify: false,
        //     translateX: 120,
        //     translateY: 0,
        //     itemsSpacing: 2,
        //     itemWidth: 100,
        //     itemHeight: 20,
        //     itemDirection: "left-to-right",
        //     itemOpacity: 0.85,
        //     symbolSize: 20,
        //     effects: [
        //       {
        //         on: "hover",
        //         style: {
        //           itemOpacity: 1,
        //         },
        //       },
        //     ],
        //   },
        // ]}
        role="application"
        ariaLabel="Nivo bar chart demo"
        barAriaLabel={(e) =>
          `${e.id} : ${e.formattedValue} in country: ${e.indexValue}`
        }
      />
    </div>
  );
};

export default Week;
