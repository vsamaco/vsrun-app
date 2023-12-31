import dynamic from "next/dynamic";
import { type Activity } from "~/types";
import {
  formatHumanizeSeconds,
  metersToFeet,
  metersToMiles,
} from "~/utils/activity";

type RunProps = {
  activity: Activity;
};

const MapWithNoSSR = dynamic(() => import("./ActivityMap"), {
  ssr: false,
});

function Run({ activity }: RunProps) {
  const top_stats = [
    {
      label: "distance",
      value: `${metersToMiles(activity.distance).toLocaleString()} mi`,
    },
    {
      label: "duration",
      value: formatHumanizeSeconds(activity.moving_time),
    },
    {
      label: "elevation",
      value: `${Math.ceil(
        metersToFeet(activity.total_elevation_gain)
      ).toLocaleString()} ft`,
    },
  ];

  return (
    <div id="run" className="flex flex-col justify-center py-10 sm:py-20">
      <div className=" mb-10 w-full border-b-4 border-yellow-300">
        <h3 className="text-6xl uppercase text-yellow-300">Run</h3>
      </div>
      <div className="mb-10 space-y-5">
        <div className="text-2xl uppercase md:text-4xl">{activity.name}</div>
        <div className="grid grid-cols-3">
          {top_stats.map((stat) => (
            <div key={stat.label} className="">
              <div className="text-2xl font-thin md:text-4xl">{stat.value}</div>
              <div className="text-sm uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-gray border ">
        {activity?.summary_polyline && <MapWithNoSSR activity={activity} />}
      </div>
    </div>
  );
}

export default Run;
