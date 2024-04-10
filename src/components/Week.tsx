import { format, getDay } from "date-fns";
import React from "react";
import { type Activity, type WeekStat } from "~/types";
import {
  formatHumanizeSeconds,
  metersToFeet,
  metersToMiles,
} from "~/utils/activity";
import { formatDate } from "~/utils/date";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar, Footprints, Mountain, Timer } from "lucide-react";

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
      <div className="flex flex-row items-center space-x-2">
        <Calendar className="h-6 w-6 text-muted-foreground" />
        <div className="hidden text-xl uppercase md:text-2xl" ref={periodRef}>
          {formatDate(new Date(weekStats.start_date), {
            year: "numeric",
            month: "2-digit",
            day: "numeric",
          })}
        </div>
      </div>
      <div className="my-5 grid gap-4 md:grid-cols-3">
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-normal uppercase md:text-xl">
              Distance
            </CardTitle>
            <Footprints className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-normal md:text-2xl">
              {metersToMiles(total_distance).toLocaleString()} mi
            </div>
          </CardContent>
        </Card>
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-normal uppercase md:text-xl">
              Duration
            </CardTitle>
            <Timer className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-normal md:text-2xl">
              {formatHumanizeSeconds(total_duration)}
            </div>
          </CardContent>
        </Card>
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-normal uppercase md:text-xl">
              Elevation
            </CardTitle>
            <Mountain className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-normal md:text-2xl">
              {Math.ceil(metersToFeet(total_elevation))} ft
            </div>
          </CardContent>
        </Card>
      </div>
      {weekStats.activities && (
        <WeekDistanceBar activities={weekStats.activities} />
      )}
    </div>
  );
}

const WeekDistanceBar = ({ activities }: { activities: Activity[] }) => {
  const weekData = [
    { name: "Mon", total: 0 },
    { name: "Tue", total: 0 },
    { name: "Wed", total: 0 },
    { name: "Thu", total: 0 },
    { name: "Fri", total: 0 },
    { name: "Sat", total: 0 },
    { name: "Sun", total: 0 },
  ];

  activities.forEach((activity) => {
    let weekIndex = getDay(new Date(activity.start_date)) - 1;
    if (weekIndex === -1) weekIndex = 6;

    // console.log(weekIndex, activity.start_date, activity.name);
    if (weekIndex in weekData) {
      weekData[weekIndex]!.total += metersToMiles(activity.distance);
    }
  });

  // console.log(weekData);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={weekData} margin={{ left: -20 }}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value as string}`}
        />
        <Tooltip />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="text-blue-300"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Week;
