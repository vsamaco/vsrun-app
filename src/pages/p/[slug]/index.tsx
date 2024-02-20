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

  const name = profile?.name as string;
  const highlightRun = !isEmpty(profile?.highlightRun)
    ? profile?.highlightRun
    : null;
  const weekStats = !isEmpty(profile?.weekStats) ? profile?.weekStats : null;
  const shoes = !isEmpty(profile?.shoes) ? profile?.shoes : null;
  const events = !isEmpty(profile?.events) ? profile?.events : null;

  return (
    <>
      <Head>
        <title>{profile?.name}</title>
        <meta name="description" content={`${name} Running profile`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MaxWidthWrapper>
        <div className="space-y-5 p-5">
          <Hero name={name} />
          {highlightRun && <Run activity={highlightRun} />}
          {weekStats && <Week weekStats={weekStats} />}
          {shoes && <Shoes shoes={shoes} />}
          {events && <Events events={events} />}
        </div>
      </MaxWidthWrapper>
    </>
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
