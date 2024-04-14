import {
  type InferGetServerSidePropsType,
  type GetServerSidePropsContext,
} from "next";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import Head from "next/head";
import Hero from "~/components/Hero";
import Run from "~/components/Run";
import Shoes from "~/components/Shoes";
import Week from "~/components/Week";
import Layout from "~/components/layout";
import { api } from "~/utils/api";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import {
  formatDurationHMS,
  isEmpty,
  metersToFeet,
  metersToMiles,
} from "~/utils/activity";
import {
  type Shoe,
  type Activity,
  type RaceActivity,
  type ShoeRotationType,
} from "~/types";
import Link from "next/link";
import { formatDate } from "~/utils/date";
import { notFound } from "next/navigation";
import { Card, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { totalShoeMiles } from "~/utils/shoe";
import React, { useEffect, useRef } from "react";
import { useProfile } from "~/contexts/useProfile";

function RunProfilePage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { slug } = props;
  const { data: profile, isLoading } = api.runProfile.getProfileBySlug.useQuery(
    {
      slug: slug,
    }
  );

  const profileContext = useProfile();
  const heroRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (profile && profile?.slug !== profileContext.profile?.slug) {
      profileContext.setProfile({ name: profile.name, slug: profile.slug });
    }

    const observer = new IntersectionObserver(([entry]) => {
      profileContext.setShowProfileHeader(!entry?.isIntersecting || false);
    });

    observer.observe(heroRef.current!);

    return () => {
      observer.disconnect();
    };
  }, [profile, profileContext]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return notFound();
  }

  const name = profile.name;
  const highlightRun = profile.highlight_run as Activity;
  const weekStats = !isEmpty(profile.weekStats) ? profile.weekStats : null;
  const shoes = profile.shoes2 as Shoe[];
  const shoeRotations = profile.shoeRotations;
  const events = !isEmpty(profile.events) ? profile.events : null;
  const races = (profile?.races as unknown as RaceActivity[]) || [];

  return (
    <>
      <Head>
        <title>{`vsrun | ${name}`}</title>
        <meta name="description" content={`vsrun | running showcase`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="space-y-5 p-4 md:p-10">
        <Hero
          name={name}
          showHighlightRun={!!highlightRun}
          showWeekStats={!!weekStats}
          showShoes={!!shoes}
          showShoeRotations={shoeRotations.length > 0}
          showEvents={!!events}
          showRaces={races.length > 0}
          heroRef={heroRef}
        />
        {highlightRun && <Run activity={highlightRun} />}
        {weekStats && <Week weekStats={weekStats} />}
        {shoes && <Shoes shoes={shoes} />}
        {shoeRotations.length > 0 && (
          <ShoeRotations shoeRotations={shoeRotations} />
        )}
        {/* {events && <Events events={events} />} */}
        {races.length > 0 && <Races races={races} />}
        {profile.user.accounts[0] && (
          <div className="">
            <Link
              href={`https://www.strava.com/athletes/${profile.user.accounts[0].providerAccountId}`}
              className="text-[#FC4C02]"
              target="_blank"
            >
              View on Strava
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function ShoeRotations({
  shoeRotations,
}: {
  shoeRotations: ShoeRotationType[];
}) {
  return (
    <div id="shoe-rotations" className="py-10">
      <div className=" mb-10 w-full border-b-4 border-orange-400">
        <h3 className="text-6xl uppercase text-orange-400">Shoe Rotations</h3>
      </div>

      <div className="space-y-4">
        {shoeRotations.map((sr) => (
          <Card key={sr.id} className="hover:border-gray-500">
            <CardHeader className="pb-4">
              <CardTitle className="hover:underline">
                <Link
                  href={`/shoes/${sr.slug}`}
                  className="text-balance max-w-[200px] break-words md:max-w-none md:whitespace-normal"
                >
                  {sr.name}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardFooter>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  {formatDate(sr.startDate, {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </div>
                <div className="flex items-center">
                  {sr.shoeList.length} shoes
                </div>
                <div className="flex items-center">
                  {totalShoeMiles(sr.shoeList)} miles
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Races({ races }: { races: RaceActivity[] }) {
  return (
    <div id="races" className="py-10">
      <div className=" mb-10 w-full border-b-4 border-red-400">
        <h3 className="text-6xl uppercase text-red-400">Races</h3>
      </div>

      <div className="space-y-4 ">
        {races.map((race) => (
          <Card key={race.id} className="hover:border-gray-500">
            <CardHeader className="flex flex-row items-center justify-between space-x-4 pb-4">
              <CardTitle className="hover:underline">
                <span className="text-balance max-w-[200px] break-words md:max-w-none md:whitespace-normal">
                  {race.name}
                </span>
              </CardTitle>
              <div className="text-xl  md:text-2xl">
                {formatDurationHMS(race.moving_time)}
              </div>
            </CardHeader>
            <CardFooter>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  {formatDate(race.start_date, {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </div>
                <div>{metersToMiles(race.distance)} mi</div>
                {race.total_elevation_gain > 0 && (
                  <div>{metersToFeet(race.total_elevation_gain)} ft</div>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
export async function getServerSideProps(
  ctx: GetServerSidePropsContext<{ slug: string }>
) {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: {
      session: null,
      prisma,
    },
    transformer: superjson,
  });
  const slug = ctx.params?.slug as string;
  await ssg.runProfile.getProfileBySlug.prefetch({ slug });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug,
    },
  };
}

RunProfilePage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default RunProfilePage;
