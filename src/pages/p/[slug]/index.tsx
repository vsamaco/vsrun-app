import {
  type InferGetServerSidePropsType,
  type GetServerSidePropsContext,
} from "next";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import Head from "next/head";
import Events from "~/components/Events";
import Hero from "~/components/Hero";
import Run from "~/components/Run";
import Shoes from "~/components/Shoes";
import Week from "~/components/Week";
import Layout from "~/components/layout";
import { api } from "~/utils/api";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { isEmpty } from "~/utils/activity";
import { MaxWidthWrapper } from "~/components/ui/layout/max-width-wrapper";
import { type ShoeRotationType } from "~/types";
import Link from "next/link";
import { formatDate } from "~/utils/date";
import { notFound } from "next/navigation";

function RunProfilePage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { slug } = props;

  const { data: profile, isLoading } = api.runProfile.getProfileBySlug.useQuery(
    {
      slug: slug,
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return notFound();
  }

  const name = profile.name;
  const highlightRun = !isEmpty(profile.highlightRun)
    ? profile.highlightRun
    : null;
  const weekStats = !isEmpty(profile.weekStats) ? profile.weekStats : null;
  const shoes = !isEmpty(profile.shoes) ? profile.shoes : null;
  const shoeRotations = profile.shoeRotations;
  const events = !isEmpty(profile.events) ? profile.events : null;

  return (
    <>
      <Head>
        <title>{profile?.name}</title>
        <meta name="description" content={`${name} Running profile`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MaxWidthWrapper>
        <div className="space-y-5 p-5">
          <Hero
            name={name}
            showHighlightRun={!!highlightRun}
            showWeekStats={!!weekStats}
            showShoes={!!shoes}
            showShoeRotations={!!shoeRotations}
            showEvents={!!events}
          />
          {highlightRun && <Run activity={highlightRun} />}
          {weekStats && <Week weekStats={weekStats} />}
          {shoes && <Shoes shoes={shoes} />}
          {shoeRotations.length > 0 && (
            <ShoeRotations shoeRotations={shoeRotations} />
          )}
          {events && <Events events={events} />}
        </div>
      </MaxWidthWrapper>
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

      <div className="space-y-4 ">
        {shoeRotations.map((sr) => (
          <Link
            href={`/shoes/${sr.slug}`}
            key={sr.id}
            className="border-gray group flex items-center justify-between rounded-lg border p-4 hover:cursor-pointer hover:border-black"
          >
            <div>
              <div className="text-balance max-w-[200px] break-words text-2xl font-thin md:max-w-none md:whitespace-normal">
                {sr.name}
              </div>
              <div className="text-md font-thin uppercase">
                {formatDate(sr.startDate, {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </div>
            </div>
            <div className="text-lg font-thin md:text-2xl">
              {sr.shoes.length} shoes
            </div>
          </Link>
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
