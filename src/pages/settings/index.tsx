import { type RunProfile } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import EditProfileModal from "~/components/settings/edit-profile-modal";
import EditRaceModal from "~/components/settings/edit-race-modal";
import Layout from "~/components/settings/layout";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import {
  type Shoe,
  type WeekStat,
  type RunProfileType,
  type RaceEvent,
  type ShoeRotationType,
} from "~/types";
import {
  formatHumanizeSeconds,
  isEmpty,
  metersToFeet,
  metersToMiles,
} from "~/utils/activity";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/date";

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
  profile: RunProfileType;
};

function ProfileDashboard({ profile }: DashboardProfile) {
  const weekStats = !isEmpty(profile?.weekStats)
    ? (profile?.weekStats as WeekStat)
    : null;
  const shoes = (profile?.shoes2 as Shoe[]) || [];
  return (
    <>
      {profile && <ProfileSection profile={profile} />}
      <Separator />
      <div className="grid items-start justify-center gap-6 rounded-lg lg:grid-cols-2">
        <div className="col-span-2 grid items-start gap-6 lg:col-span-1">
          <DemoContainer>
            <HighlightRunCard profile={profile} />
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
            <ShoeRotationsCard
              shoeRotations={
                (profile?.shoeRotations as ShoeRotationType[]) || []
              }
            />
          </DemoContainer>
          <DemoContainer>
            <RacesCard profile={profile} />
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
    <div className="mb-10 flex w-full flex-col items-center justify-between space-y-2 md:flex-row">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarFallback>{profile.name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <h3 className=" text-lg">{profile.name}</h3>
      </div>
      <div className="space-x-2">
        <EditProfileModal profile={profile} />
        <Link href={`/p/${profile.slug}`}>
          <Button>View Profile</Button>
        </Link>
      </div>
    </div>
  );
}

function HighlightRunCard({ profile }: { profile: RunProfileType }) {
  const highlightRun = profile?.highlight_run;

  return (
    <Card data-testid="settings-highlight-run-card">
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
                  {formatDate(new Date(highlightRun.start_date), {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
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
        <Link className={cn("w-full", buttonVariants())} href={`/settings/run`}>
          {highlightRun ? "Edit Run" : "Add Run"}
        </Link>
      </CardFooter>
    </Card>
  );
}

function WeekStatsCard({ weekStats }: { weekStats: WeekStat | null }) {
  return (
    <Card data-testid="settings-weekstats-card">
      <CardHeader>
        <CardTitle>Week</CardTitle>
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
                {formatHumanizeSeconds(weekStats.total_duration)}
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
        {/* <EditWeekStatsModal weekStats={weekStats} /> */}
        <Link href="/settings/week" className={cn("w-full", buttonVariants())}>
          {weekStats ? "Edit" : "Add"} Week
        </Link>
      </CardFooter>
    </Card>
  );
}

function ShoesCard({ shoes }: { shoes: Shoe[] }) {
  return (
    <Card data-testid="settings-shoes-card">
      <CardHeader>
        <CardTitle>Shoes</CardTitle>
        <CardDescription>Highlight your shoes</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {shoes.map((shoe, index) => {
          return (
            <div
              className="flex items-center justify-between space-x-4"
              key={index}
            >
              <div className="flex items-center space-x-4">
                <p className="w-[160px] truncate text-sm font-medium leading-none">
                  {shoe.brand_name} {shoe.model_name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-muted-foreground">
                  {Math.ceil(metersToMiles(shoe.distance))} mi
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>

      <CardFooter>
        <Link className={cn("w-full", buttonVariants())} href="/settings/shoes">
          Edit Shoes
        </Link>
      </CardFooter>
    </Card>
  );
}

function ShoeRotationsCard({
  shoeRotations,
}: {
  shoeRotations: ShoeRotationType[];
}) {
  return (
    <Card data-testid="settings-shoe-rotations-card">
      <CardHeader>
        <CardTitle>Shoe Rotations</CardTitle>
        <CardDescription>Highlight your shoe rotation</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {shoeRotations.map((shoeRotation, index) => {
          return (
            <div
              className="flex items-center justify-between space-x-4"
              key={index}
            >
              <div className="flex items-center space-x-4">
                <p className="w-[160px] truncate text-sm font-medium leading-none">
                  {shoeRotation.name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-muted-foreground">
                  {shoeRotation.shoeList.length || 0} shoes
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>

      <CardFooter>
        <Link
          className={cn("w-full", buttonVariants())}
          href="/settings/shoe_rotations"
        >
          Edit Rotations
        </Link>
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

function RacesCard({ profile }: { profile: RunProfileType }) {
  if (!profile?.races) {
    return null;
  }

  const { races } = profile;

  return (
    <Card data-testid="settings-races-card">
      <CardHeader>
        <CardTitle>Races</CardTitle>
        <CardDescription>Highlight your races</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {races.map((race, index) => {
          return (
            <div
              className="flex items-center justify-between space-x-4"
              key={index}
            >
              <div className="flex items-center space-x-4">
                <p className="w-[160px] truncate text-sm font-medium leading-none">
                  {race.name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-muted-foreground">
                  {metersToMiles(race.distance).toLocaleString()} mi
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
      <CardFooter>
        <Link href="/settings/races" className={cn("w-full", buttonVariants())}>
          Edit Races
        </Link>
      </CardFooter>
    </Card>
  );
}
GeneralSettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default GeneralSettingsPage;
