import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Run from "~/components/Run";
import { api } from "~/utils/api";

type HighlightRun = {
  id: string;
  name: string;
  moving_time: number;
  distance: number;
  total_elevation_gain: number;
};

export default function Home() {
  const { data, isLoading } = api.runProfile.getProfile.useQuery();

  if (isLoading) {
    return null;
  }

  const highlightRun = data?.highlightRun as HighlightRun;

  return (
    <>
      <Head>
        <title>{data?.username}</title>
        <meta name="description" content="Running profile" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <h1 className="text-white">{data?.username}</h1>
        <div className="bg-white">
          {data?.highlightRun && <Run activity={highlightRun} />}
        </div>
      </main>
    </>
  );
}
