import dynamic from "next/dynamic";
import Link from "next/link";
import { type Activity } from "~/types";
import {
  formatHumanizeSeconds,
  metersToFeet,
  metersToMiles,
} from "~/utils/activity";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar, Footprints, Mountain, Timer } from "lucide-react";
import { formatDate } from "~/utils/date";

type RunProps = {
  activity: Activity | Record<string, never>;
};

const MapWithNoSSR = dynamic(() => import("./ActivityMap"), {
  ssr: false,
});

function Run({ activity }: RunProps) {
  const top_stats = [
    {
      label: "distance",
      value: `${metersToMiles(activity.distance).toLocaleString()} mi`,
      icon: <Footprints className="h-6 w-6 text-muted-foreground" />,
    },
    {
      label: "duration",
      value: formatHumanizeSeconds(activity.moving_time),
      icon: <Timer className="h-6 w-6 text-muted-foreground" />,
    },
    {
      label: "elevation",
      value: `${Math.ceil(
        metersToFeet(activity.total_elevation_gain)
      ).toLocaleString()} ft`,
      icon: <Mountain className="h-6 w-6 text-muted-foreground" />,
    },
  ];

  return (
    <div id="run" className="flex flex-col justify-center py-10 sm:py-20">
      <div className=" mb-10 flex w-full border-b-4 border-yellow-300">
        <h3 className="text-6xl uppercase text-yellow-300">Run</h3>
      </div>
      <div className="mb-10 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="text-2xl md:text-4xl">{activity.name}</div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Calendar className="h-6 w-6 text-muted-foreground" />
          <span className="monospace text-lg font-thin uppercase md:text-2xl">
            {formatDate(new Date(activity.start_date), {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {top_stats.map((stat) => (
            <Card key={stat.label} className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-thin uppercase md:text-2xl">
                  {stat.label}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-thin md:text-4xl">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {activity?.summary_polyline && (
        <div className="border-gray border ">
          <MapWithNoSSR activity={activity} />
        </div>
      )}
      {activity.metadata && (
        <div>
          <Link
            href={`https://www.strava.com/activities/${activity.metadata.external_id}`}
            target="_blank"
            className=" text-[#FC4C02]"
          >
            View on {activity.metadata?.external_source}
          </Link>
        </div>
      )}
    </div>
  );
}

export default Run;
