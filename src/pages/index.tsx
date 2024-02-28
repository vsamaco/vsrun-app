import Head from "next/head";
import Layout from "~/components/layout";
import { buttonVariants } from "~/components/ui/button";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";

const Home = () => {
  const session = useSession();
  return (
    <>
      <Head>
        <title>mpdrun</title>
        <meta name="description" content="mpdrun | Running profile" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mx-auto max-w-screen-xl px-4 py-8 text-center lg:py-16">
        <h1 className="mb-4 text-4xl font-bold leading-none tracking-tight md:text-5xl lg:text-6xl">
          mpdrun
        </h1>
        <p className="mb-8 text-lg font-normal text-gray-500 dark:text-gray-400 sm:px-16 lg:px-48 lg:text-xl">
          Showcase runs, stats, shoes, and races
        </p>
        {session.status !== "loading" && (
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
            {!session?.data?.user && (
              <Image
                src="/images/btn_strava_orange.png"
                className="hover:cursor-pointer"
                alt={"Connect with Strava"}
                width="193"
                height="48"
                onClick={() =>
                  void signIn("strava", { callbackUrl: "/settings" })
                }
              />
            )}
            {session?.data?.user && (
              <Link
                href="/settings"
                className={buttonVariants({ variant: "default" })}
              >
                Manage Profile
              </Link>
            )}

            <Link
              className={buttonVariants({ variant: "secondary" })}
              href="/p/milesperdonut"
            >
              Preview
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout showNav={false}>{page}</Layout>;
};

export default Home;
