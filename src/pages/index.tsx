import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Run from "~/components/Run";
import Shoes from "~/components/Shoes";
import Week from "~/components/Week";
import { type ActivityProps } from "~/types";
import { api } from "~/utils/api";

export default function Home() {
  const { data, isLoading } = api.runProfile.getProfile.useQuery();

  if (isLoading) {
    return null;
  }

  const highlightRun = data?.highlightRun as ActivityProps;
  const weekStats = {
    start_date: new Date(2023, 5, 29),
    end_date: new Date(2023, 6, 4),
    total_runs: 5,
    total_distance: 12000,
    total_duration: 30000,
    total_elevation: 1000,
  };
  const shoes = [
    {
      id: "123",
      brand_name: "Saucony",
      model_name: "Ride 15",
      distance: 100000,
    },
    {
      id: "234",
      brand_name: "Adidas",
      model_name: "Adizero Pro 3",
      distance: 20000,
    },
    {
      id: "345",
      brand_name: "New Balance",
      model_name: "Rebel v3",
      distance: 10000,
    },
  ];

  return (
    <>
      <Head>
        <title>{data?.username}</title>
        <meta name="description" content="Running profile" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <h1 className="text-white">{data?.username}</h1>
        <div className="bg-gray-100">
          {data?.highlightRun && <Run activity={highlightRun} />}
        </div>
        <div className="bg-gray-100">
          {data?.highlightRun && <Week weekStats={weekStats} />}
        </div>
        <div className="bg-gray-100">
          {data?.shoes && <Shoes shoes={shoes} />}
        </div>
      </main>
    </>
  );
}
