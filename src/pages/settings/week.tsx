import WeekSettingsForm from "~/components/settings/Week";
import { api } from "~/utils/api";
import SettingsLayout from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";

function WeekSettingsPage() {
  const { data, isLoading } = api.runProfile.getUserProfile.useQuery();
  const { data: activities, isLoading: loadingActivities } =
    api.strava.getActivities.useQuery();

  if (isLoading && loadingActivities) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Stats</h3>
        <p className="text-sm text-muted-foreground">
          Showcase your weekly running stats.
        </p>
      </div>
      <Separator />
      <WeekSettingsForm profile={data} activities={activities} />
    </div>
  );
}

WeekSettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default WeekSettingsPage;
