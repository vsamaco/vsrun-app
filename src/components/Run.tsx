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
    <div className="flex flex-col justify-center border-t-4 border-yellow-300 px-5 py-10 sm:px-10 sm:py-20">
      <h3 className="text-8xl font-light uppercase text-yellow-300">Run</h3>
      <h4 className="mt-3 text-5xl">{activity.name}</h4>
      <div className="mt-10 grid sm:grid-cols-1 md:grid-cols-2">
        <ul className="mt-10 flex flex-col justify-end space-y-5 text-4xl font-light sm:mt-5 lg:text-6xl">
          {top_stats.map((stat) => (
            <li className="border-l-4 border-yellow-300 pl-2" key={stat.label}>
              {stat.value}
            </li>
          ))}
        </ul>
        {activity && (
          <div className="mt-10 sm:mt-5">
            <MapWithNoSSR activity={activity} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Run;
