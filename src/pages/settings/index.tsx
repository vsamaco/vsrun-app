import { RunProfile } from "@prisma/client";
import { BellRing, Check } from "lucide-react";
import GeneralSettingsForm from "~/components/settings/General";
import EditProfileModal from "~/components/settings/edit-profile-modal";
import CreateProfileModal from "~/components/settings/edit-profile-modal";
import EditRunModal from "~/components/settings/edit-run-modal";
import EditShoeModal, {
  AddShoeModal,
} from "~/components/settings/edit-shoe-modal";
import EditWeekStatsModal from "~/components/settings/edit-weekstats-modal";
import SettingsLayout from "~/components/settings/layout";
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
import { type Activity, type Shoe, type WeekStat } from "~/types";
import {
  formatDate,
  formatSeconds,
  metersToFeet,
  metersToMiles,
} from "~/utils/activity";
import { api } from "~/utils/api";

function GeneralSettingsPage() {
  const { data, isLoading } = api.runProfile.getUserProfile.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Not Found</div>;
  }

  return (
    <div className="space-y-6">
      {/* <GeneralSettingsForm profile={data} /> */}
      {data && <ProfileDashboard profile={data} />}
      {!data && <NoProfilePlaceholder />}
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
  const highlightRun = profile.highlightRun as Activity;
  const weekStats = profile.weekStats as WeekStat;
  const shoes = profile.shoes as Shoe[];
  const events = profile.events as unknown as Event[];

  return (
    <>
      <div className="hidden items-start justify-center gap-6 rounded-lg md:grid lg:grid-cols-2">
        <div className="col-span-2 grid items-start gap-6 lg:col-span-1">
          <DemoContainer>
            <Card className={cn("w-[380px]")}>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {profile.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {profile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {profile.slug}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <EditProfileModal profile={profile} />
              </CardFooter>
            </Card>
          </DemoContainer>
        </div>
        <div className="col-span-2 grid items-start gap-6 lg:col-span-1">
          <DemoContainer>
            <Card className={cn("w-[380px]")}>
              <CardHeader>
                <CardTitle>Run</CardTitle>
                <CardDescription>Highlight recent activity.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                  <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {highlightRun.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(highlightRun.start_date)}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {!highlightRun && <Button className="w-full">Add Run</Button>}
                {highlightRun && <EditRunModal profile={profile} />}
              </CardFooter>
            </Card>
          </DemoContainer>
          <DemoContainer>
            <Card className={cn("w-[380px]")}>
              <CardHeader>
                <CardTitle>Week Stats</CardTitle>
                <CardDescription>Highlight weekly stats.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-1">
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Distance</p>
                    <p className="text-sm text-muted-foreground">
                      {metersToMiles(weekStats.total_duration)}
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
                    <p className="text-sm font-medium leading-none">
                      Elevation
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {metersToFeet(weekStats.total_elevation)}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {profile && <EditWeekStatsModal profile={profile} />}
              </CardFooter>
            </Card>
          </DemoContainer>
          <DemoContainer>
            <Card className={cn("w-[380px]")}>
              <CardHeader>
                <CardTitle>Shoes</CardTitle>
                <CardDescription>Highlight shoe rotation.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {profile.shoes.map((shoe, index) => {
                  const shoeObj = shoe as Shoe;
                  return (
                    <>
                      <div
                        className="flex items-center justify-between space-x-4"
                        key={shoeObj.id}
                      >
                        <div className="flex items-center space-x-4">
                          <p className="w-[180px] truncate text-sm font-medium leading-none">
                            {shoeObj.brand_name} {shoeObj.model_name}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <p className="text-sm text-muted-foreground">
                            {Math.ceil(metersToMiles(shoeObj.distance))} mi
                          </p>
                          {profile.shoes && (
                            <EditShoeModal
                              profile={profile}
                              shoeIndex={index}
                            />
                          )}
                        </div>
                      </div>
                    </>
                  );
                })}
              </CardContent>

              <CardFooter>
                <AddShoeModal profile={profile} />
              </CardFooter>
            </Card>
          </DemoContainer>
          <DemoContainer>
            <Card className={cn("w-[380px]")}>
              <CardHeader>
                <CardTitle>Races</CardTitle>
                <CardDescription>Highlight upcoming races.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4"></CardContent>
              <CardFooter>
                <Button className="w-full">
                  <Check className="mr-2 h-4 w-4" />
                  Add Race
                </Button>
              </CardFooter>
            </Card>
          </DemoContainer>
        </div>
      </div>
    </>
  );
}

function NoProfilePlaceholder() {
  return (
    <div className="col-span-3 flex flex-col items-center justify-center rounded-md border border-gray-200 bg-white py-12">
      <h2 className="z-10 text-xl font-semibold text-gray-700">
        You don't have a profile yet!
      </h2>
      <EditProfileModal profile={null} />
    </div>
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
            <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
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
