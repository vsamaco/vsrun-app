import WeekSettingsForm from "~/components/settings/Week";
import { api } from "~/utils/api";
import SettingsLayout from "~/components/settings/layout";

function WeekSettingsPage() {
  const { data, isLoading } = api.runProfile.getProfile.useQuery();
  const { data: activities, isLoading: loadingActivities } =
    api.strava.getActivities.useQuery();

  if (isLoading && loadingActivities) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Week Stats</h1>
      <WeekSettingsForm profile={data} activities={activities} />
    </div>
  );
}

WeekSettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default WeekSettingsPage;
