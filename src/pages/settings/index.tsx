import { type RunProfile } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import EditProfileModal from "~/components/settings/edit-profile-modal";
import EditRaceModal from "~/components/settings/edit-race-modal";
import EditRunModal from "~/components/settings/edit-run-modal";
import EditShoeModal from "~/components/settings/edit-shoe-modal";
import EditWeekStatsModal from "~/components/settings/edit-weekstats-modal";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import MainNavigation from "~/components/ui/layout/main-navigation";
import { MaxWidthWrapper } from "~/components/ui/layout/max-width-wrapper";
import UserNavigation from "~/components/ui/layout/user-navigation";
import { Separator } from "~/components/ui/separator";
import { Toaster } from "~/components/ui/toaster";
import { cn } from "~/lib/utils";
import {
  type RaceEvent,
  type Activity,
  type Shoe,
  type WeekStat,
} from "~/types";
import {
  formatDate,
  formatSeconds,
  isEmpty,
  metersToFeet,
  metersToMiles,
} from "~/utils/activity";
import { api } from "~/utils/api";

function GeneralSettingsPage() {
  const { data, isLoading } = api.runProfile.getUserProfile.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {!data ? <NoProfilePlaceholder /> : <ProfileDashboard profile={data} />}
    </div>
  );
}

function DemoContainer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-center [&>div]:w-full",
        className
      )}
      {...props}
    />
  );
}

type DashboardProfile = {
  profile: RunProfile;
};

function ProfileDashboard({ profile }: DashboardProfile) {
  const highlightRun = !isEmpty(profile.highlightRun)
    ? (profile.highlightRun as Activity)
    : null;
  const weekStats = !isEmpty(profile.weekStats)
    ? (profile.weekStats as WeekStat)
    : null;
  const shoes = !isEmpty(profile.shoes) ? (profile.shoes as Shoe[]) : [];
  const events = !isEmpty(profile.events)
    ? (profile.events as RaceEvent[])
    : [];

  return (
    <>
      {profile && <ProfileSection profile={profile} />}
      <div className="hidden items-start justify-center gap-6 rounded-lg md:grid lg:grid-cols-2">
        <div className="col-span-2 grid items-start gap-6 lg:col-span-1">
          <DemoContainer>
            <HighlightRunCard highlightRun={highlightRun} />
          </DemoContainer>
          <DemoContainer>
            <WeekStatsCard weekStats={weekStats} />
          </DemoContainer>
        </div>
        <div className="col-span-2 grid items-start gap-6 lg:col-span-1">
          <DemoContainer>
            <ShoesCard shoes={shoes} />
          </DemoContainer>
          <DemoContainer>
            <RaceEventsCard events={events} />
          </DemoContainer>
        </div>
      </div>
    </>
  );
}

function NoProfilePlaceholder() {
  return (
    <div className="my-10 flex flex-col items-center justify-center rounded-md border border-gray-200 bg-white py-12">
      <h2 className="z-10 mb-10 text-xl font-semibold text-gray-700">
        You don&apos;t have a profile yet!
      </h2>
      <EditProfileModal profile={null} />
    </div>
  );
}

function ProfileSection({ profile }: { profile: RunProfile }) {
  return (
    <div className="mb-10 flex w-full items-center justify-between">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarFallback>{profile.name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <h3 className=" text-lg">{profile.name}</h3>
      </div>
      <div className="space-x-2">
        <EditProfileModal profile={profile} />
        <Link href={`/p/${profile.slug}`} target="_blank">
          <Button>View Profile</Button>
        </Link>
      </div>
    </div>
  );
}

function HighlightRunCard({ highlightRun }: { highlightRun: Activity | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Run</CardTitle>
        <CardDescription>Highlight your recent activity</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {highlightRun && (
          <div className="grid-cols mb-4 grid items-start pb-4 last:mb-0 last:pb-0">
            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {highlightRun.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(highlightRun.start_date)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {metersToMiles(highlightRun.distance).toLocaleString()} mi
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <EditRunModal highlightRun={highlightRun} />
      </CardFooter>
    </Card>
  );
}

function WeekStatsCard({ weekStats }: { weekStats: WeekStat | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Week Stats</CardTitle>
        <CardDescription>Highlight your weekly stats</CardDescription>
      </CardHeader>
      {weekStats && (
        <CardContent className="grid gap-1">
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Date</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(weekStats.start_date), "LL/dd")} -{" "}
                {format(new Date(weekStats.end_date), "LL/dd")}
              </p>
            </div>
          </div>
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Distance</p>
              <p className="text-sm text-muted-foreground">
                {metersToMiles(weekStats.total_distance).toLocaleString()} mi
              </p>
            </div>
          </div>
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Time</p>
              <p className="text-sm text-muted-foreground">
                {formatSeconds(weekStats.total_duration)}
              </p>
            </div>
          </div>
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Elevation</p>
              <p className="text-sm text-muted-foreground">
                {Math.ceil(metersToFeet(weekStats.total_elevation))} ft
              </p>
            </div>
          </div>
        </CardContent>
      )}
      <CardFooter>
        <EditWeekStatsModal weekStats={weekStats} />
      </CardFooter>
    </Card>
  );
}

function ShoesCard({ shoes }: { shoes: Shoe[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shoes</CardTitle>
        <CardDescription>Highlight your shoe rotation</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {shoes.map((shoe, index) => {
          return (
            <div
              className="flex items-center justify-between space-x-4"
              key={index}
            >
              <div className="flex items-center space-x-4">
                <p className="w-[180px] truncate text-sm font-medium leading-none">
                  {shoe.brand_name} {shoe.model_name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-muted-foreground">
                  {Math.ceil(metersToMiles(shoe.distance))} mi
                </p>
                {shoes && <EditShoeModal shoes={shoes} shoeIndex={index} />}
              </div>
            </div>
          );
        })}
      </CardContent>

      <CardFooter>
        <EditShoeModal
          shoes={shoes}
          shoeIndex={shoes.length}
          buttonType="add"
        />
      </CardFooter>
    </Card>
  );
}

function RaceEventsCard({ events }: { events: RaceEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Races</CardTitle>
        <CardDescription>Highlight your upcoming races</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {events.map((event, index) => {
          return (
            <div
              className="flex items-center justify-between space-x-4"
              key={index}
            >
              <div className="flex items-center space-x-4">
                <p className="w-[180px] truncate text-sm font-medium leading-none">
                  {event.name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-muted-foreground">
                  {metersToMiles(event.distance).toLocaleString()} mi
                </p>
                {events && <EditRaceModal events={events} raceIndex={index} />}
              </div>
            </div>
          );
        })}
      </CardContent>
      <CardFooter>
        <EditRaceModal
          events={events}
          raceIndex={events.length}
          buttonType="add"
        />
      </CardFooter>
    </Card>
  );
}
GeneralSettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <MaxWidthWrapper>
            <div className="flex h-16 items-center px-4">
              <MainNavigation className="mx-6" />
              <div className="ml-auto flex items-center space-x-4">
                <UserNavigation />
              </div>
            </div>
          </MaxWidthWrapper>
        </div>
      </div>
      <div className="hidden space-y-6 p-10 pb-16 md:block">
        <MaxWidthWrapper>
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          </div>
          <Separator className="my-6" />
          <div className="flex w-full flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <div className="flex-1">{page}</div>
          </div>
          <Toaster />
        </MaxWidthWrapper>
      </div>
    </>
  );
};

export default GeneralSettingsPage;
