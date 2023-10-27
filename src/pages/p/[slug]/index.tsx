import Head from "next/head";
import { useRouter } from "next/router";
import Events from "~/components/Events";
import Hero from "~/components/Hero";
import Run from "~/components/Run";
import Shoes from "~/components/Shoes";
import Week from "~/components/Week";
import Layout from "~/components/layout";
import { type Activity, type Shoe, type WeekStat } from "~/types";
import { api } from "~/utils/api";

function RunProfilePage() {
  const router = useRouter();
  const slug = router.query.slug as string;

  const { data: profile, isLoading } = api.runProfile.getProfileBySlug.useQuery(
    {
      slug: slug,
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const name = profile?.name as string;
  const highlightRun = profile?.highlightRun as Activity;
  const weekStats = profile?.weekStats as WeekStat;
  const shoes = profile?.shoes as Shoe[];
  const events = profile?.events as unknown as Event[];

  return (
    <>
      <Head>
        <title>{profile?.name}</title>
        <meta name="description" content={`${name} Running profile`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container space-y-5">
        <Hero name={name} />
        <div className="bg-gray-100">
          {highlightRun && <Run activity={highlightRun} />}
        </div>
        <div className="bg-gray-100">
          {weekStats && <Week weekStats={weekStats} />}
        </div>
        <div className="bg-gray-100">{shoes && <Shoes shoes={shoes} />}</div>
        <div className="bg-gray-100">
          {events && <Events events={events} />}
        </div>
      </div>
    </>
  );
}

RunProfilePage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default RunProfilePage;
