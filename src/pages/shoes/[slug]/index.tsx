import { createServerSideHelpers } from "@trpc/react-query/server";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { api } from "~/utils/api";
import { notFound } from "next/navigation";
import Layout from "~/components/layout";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { metersToMiles } from "~/utils/activity";
import { Badge } from "~/components/ui/badge";
import { formatDate } from "~/utils/date";
import { type Shoe } from "~/types";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Head from "next/head";

export default function ShoesPage({
  slug,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: shoeRotation, isLoading } =
    api.shoeRotation.getShoeRotationBySlug.useQuery({
      slug: slug,
    });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!shoeRotation) {
    return notFound();
  }

  const { name, description, shoes, runProfile } = shoeRotation;

  return (
    <>
      <Head>
        <title>{`vsrun | ${name}`}</title>
        <meta name="description" content="vsrun | running showcase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="space-y-5 p-4 md:p-10">
        <div className="mx-auto items-center">
          <div className="border-bottom flex h-full flex-col items-center justify-center space-y-5 border-black">
            <h1 className="mt-20 scroll-m-20 text-center text-2xl font-extrabold tracking-tight md:text-4xl lg:text-5xl ">
              {name}
            </h1>
            <div className="">
              {formatDate(shoeRotation.startDate, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            {runProfile && (
              <div className="flex flex-row items-center space-x-2">
                <Avatar>
                  <AvatarFallback>{runProfile.name[0]}</AvatarFallback>
                </Avatar>
                <Link href={`/p/${runProfile.slug}`} className="">
                  {runProfile.name}
                </Link>
              </div>
            )}
          </div>
          <div className="mt-5 text-center">
            <p className="text-xl  [&:not(:first-child)]:mt-6">{description}</p>
          </div>
          <div className="mt-10 space-y-5">
            {shoes.map((shoe, index) => (
              <div key={index}>
                <ShoeCard shoe={shoe} />
              </div>
            ))}
          </div>
        </div>
        {shoeRotation.runProfile.user.accounts[0] && (
          <div>
            <Link
              href={`https://www.strava.com/athletes/${shoeRotation.runProfile.user.accounts[0].providerAccountId}`}
              target="_blank"
              className=" text-[#FC4C02]"
            >
              View on Strava
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function ShoeCard({ shoe }: { shoe: Shoe }) {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <Card
      className={cn(
        "group hover:border-black",
        shoe.description && "cursor-pointer"
      )}
      onClick={() => setShowDescription((value) => !value)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-normal">
          <div className="flex items-center">
            <div className="flex max-w-[200px] flex-col text-lg md:max-w-none md:flex-row md:text-2xl">
              <span className="mr-2">{shoe.brand_name}</span>
              <span className="text-balance font-thin">{shoe.model_name}</span>
            </div>
            <div>
              {shoe.description && !showDescription && (
                <ChevronRight className="w-10" />
              )}
              {shoe.description && showDescription && (
                <ChevronDown className="w-10" />
              )}
            </div>
          </div>
        </CardTitle>
        <div className="text-right text-xl font-thin text-gray-500 md:text-6xl">
          {Math.ceil(metersToMiles(shoe.distance))} mi
        </div>
      </CardHeader>
      {showDescription && shoe.description && (
        <CardContent>{shoe.description}</CardContent>
      )}
      <CardFooter>
        <div className="space-x-2 uppercase">
          {shoe.categories.map((category, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-sm group-hover:bg-yellow-400"
            >
              {category.replace("_", " ")}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
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
  await ssg.shoeRotation.getShoeRotationBySlug.prefetch({ slug });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug,
    },
  };
}

ShoesPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
