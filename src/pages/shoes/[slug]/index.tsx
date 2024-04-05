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
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { metersToMiles } from "~/utils/activity";
import { Badge } from "~/components/ui/badge";
import { formatDate } from "~/utils/date";
import { type Shoe } from "~/types";
import { useLayoutEffect, useRef, useState } from "react";
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
import { Separator } from "~/components/ui/separator";

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

  const { name, description, shoeList: shoes, runProfile } = shoeRotation;

  return (
    <>
      <Head>
        <title>{`vsrun | ${name}`}</title>
        <meta name="description" content="vsrun | running showcase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="space-y-5 p-4 md:p-10">
        <h1 className="mt-10 text-6xl font-medium">{name}</h1>
        <div className="flex flex-row space-x-4">
          {runProfile && (
            <div className="flex flex-row items-center space-x-4">
              <div className="flex flex-row items-center space-x-2">
                <Avatar>
                  {runProfile.user.image && (
                    <AvatarImage
                      src={runProfile.user.image}
                      alt={`${runProfile.name}`}
                      className=""
                    />
                  )}
                  <AvatarFallback>{runProfile.name[0]}</AvatarFallback>
                </Avatar>
                <Link href={`/p/${runProfile.slug}`} className="">
                  {runProfile.name}
                </Link>
              </div>
              <Separator orientation="vertical" className="my-4 " />
              <div className="">
                {formatDate(shoeRotation.startDate, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          )}
        </div>
        <Separator />
        <div className="">
          <p className="[&:not(:first-child)]:mt-6">{description}</p>
        </div>
        <div className="space-y-5">
          {shoes.map((shoe, index) => (
            <div key={index}>
              <ShoeCard shoe={shoe as Shoe} />
            </div>
          ))}
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

export function ShoeCard({ shoe }: { shoe: Omit<Shoe, "slug"> }) {
  const [isTruncated, setIsTruncated] = useState(false);
  const [isReadingMore, setIsReadingMore] = useState(false);
  const readMoreRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const { offsetHeight, scrollHeight } = readMoreRef.current || {};

    if (offsetHeight && scrollHeight && offsetHeight < scrollHeight) {
      setIsTruncated(true);
    } else {
      setIsTruncated(false);
    }
  }, [readMoreRef]);

  return (
    <Card className={cn("group hover:border-black")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="">
          <div className="flex items-center">
            <div className="flex max-w-[200px] flex-col leading-normal md:max-w-none md:flex-row ">
              <span className="mr-2">{shoe.brand_name}</span>
              <span className="">{shoe.model_name}</span>
            </div>
          </div>
        </CardTitle>
        <div className=" text-xl md:text-2xl">
          {Math.ceil(metersToMiles(shoe.distance))} mi
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={readMoreRef}
          className={cn("", !isReadingMore && "line-clamp-1")}
        >
          {shoe.description}
        </div>
        {isTruncated && (
          <div onClick={() => setIsReadingMore((prev) => !prev)}>
            {isReadingMore ? (
              <span className="flex items-center">
                Read less
                <ChevronRight className="w-4" />
              </span>
            ) : (
              <span className="flex items-center">
                Read more
                <ChevronDown className="w-4" />
              </span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
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
