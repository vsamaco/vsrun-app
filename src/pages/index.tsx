import Head from "next/head";
import Run from "~/components/Run";
import Shoes from "~/components/Shoes";
import Week from "~/components/Week";
import Events from "~/components/Events";
import { type Shoe, type Activity, type Event, type WeekStat } from "~/types";
import { api } from "~/utils/api";
import Hero from "~/components/Hero";
import Layout from "~/components/layout";
import { Button, buttonVariants } from "~/components/ui/button";
import Link from "next/link";
import { signIn } from "next-auth/react";

const Home = () => {
  return (
    <>
      <Head>
        <title>mpdrun</title>
        <meta name="description" content="Running profile" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mx-auto max-w-screen-xl px-4 py-8 text-center lg:py-16">
        <h1 className="mb-4 text-4xl font-bold leading-none tracking-tight md:text-5xl lg:text-6xl">
          mpdrun
        </h1>
        <p className="mb-8 text-lg font-normal text-gray-500 dark:text-gray-400 sm:px-16 lg:px-48 lg:text-xl">
          Showcase runs, stats, shoes, and races
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
          <Button variant="default" onClick={() => void signIn("strava")}>
            Login with Strava
          </Button>
          <Link
            className={buttonVariants({ variant: "secondary" })}
            href="/p/milesperdonut"
          >
            Preview
          </Link>
        </div>
      </div>
    </>
  );
};

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Home;
