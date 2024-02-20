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
import { MaxWidthWrapper } from "~/components/ui/layout/max-width-wrapper";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { metersToMiles } from "~/utils/activity";
import { Badge } from "~/components/ui/badge";
import { formatDate } from "~/utils/date";

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
    <MaxWidthWrapper>
      <div className="space-y-5 p-5">
        <div className="mx-auto items-center">
          <div className="flex h-full flex-col items-center justify-center space-y-5">
            <h1 className="mt-20 scroll-m-20 text-center text-4xl font-extrabold tracking-tight lg:text-5xl">
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
                <span className="">{runProfile.name}</span>
              </div>
            )}
          </div>
          <p className="leading-7 [&:not(:first-child)]:mt-6">{description}</p>
          <div className="mt-10 space-y-5">
            {shoes.map((shoe, index) => (
              <div
                key={index}
                className="border-gray group rounded-lg border p-5 hover:border-black"
              >
                <div className="flex flex-row items-center justify-between">
                  <div className="space-y-1 text-2xl">
                    <div className="uppercase">{shoe.brand_name}</div>
                    <div className="font-thin uppercase">{shoe.model_name}</div>
                    <div className="space-x-2 uppercase">
                      {shoe.categories.map((category, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm group-hover:bg-yellow-400"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {shoe.distance > 0 && (
                    <div className="text-6xl font-thin text-gray-100 group-hover:text-gray-500">
                      {Math.ceil(metersToMiles(shoe.distance))} mi
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
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
