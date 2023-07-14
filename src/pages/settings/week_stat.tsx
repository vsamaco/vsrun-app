import WeekStatForm from "~/components/settings/WeekStat";
import { api } from "~/utils/api";

function WeekStat() {
  const { data, isLoading } = api.runProfile.getProfile.useQuery();
  const { data: activities, isLoading: loadingActivities } =
    api.strava.getActivities.useQuery();

  if (isLoading && loadingActivities) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Week Stats</h1>
      <WeekStatForm profile={data} activities={activities} />
    </div>
  );
}

export default WeekStat;
