import Head from "next/head";
import Run from "~/components/Run";
import Shoes from "~/components/Shoes";
import Week from "~/components/Week";
import Events from "~/components/Events";
import { type Shoe, type Activity, type Event, type WeekStat } from "~/types";
import { api } from "~/utils/api";
import Hero from "~/components/Hero";
import Layout from "~/components/layout";

const Home = () => {
  const { data, isLoading } = api.runProfile.getProfile.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return null;
  }

  const highlightRun = data?.highlightRun as Activity;
  const weekStats = data?.weekStats as WeekStat;
  const shoes = data?.shoes as Shoe[];
  const events = data?.events as Event[];

  return (
    <>
      <Head>
        <title>{data?.username}</title>
        <meta name="description" content="Running profile" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container space-y-5">
        <Hero username={data?.username} />
        <div className="bg-gray-100">
          {data?.highlightRun && <Run activity={highlightRun} />}
        </div>
        <div className="bg-gray-100">
          {data?.highlightRun && <Week weekStats={weekStats} />}
        </div>
        <div className="bg-gray-100">
          {data?.shoes && <Shoes shoes={shoes} />}
        </div>
        <div className="bg-gray-100">
          {data?.events && <Events events={events} />}
        </div>
      </div>
    </>
  );
};

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Home;
