import Head from "next/head";
import Link from "next/link";
import Layout from "~/components/settings/layout";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { metersToMiles } from "~/utils/activity";
import { api } from "~/utils/api";

function ShoeSettingsPage() {
  const { data, isLoading } = api.shoe.getUserShoes.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Head>
        <title>vsrun | Settings</title>
        <meta name="description" content="vsrun | running showcase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Shoes</h3>
          <p className="text-sm text-muted-foreground">
            Showcase shoes used on your runs
          </p>
          <Link
            href="/settings/shoes/new"
            className={cn("mt-5", buttonVariants())}
          >
            Add Shoe
          </Link>
        </div>
        <Separator />
        <div className="flex flex-col gap-4">
          {data &&
            data.map((shoe) => {
              return (
                <Card key={shoe.slug} className="hover:outline hover:outline-1">
                  <Link href={`/settings/shoes/${shoe.slug}/edit`}>
                    <CardHeader className="flex flex-row justify-between space-y-0 pb-4">
                      <CardTitle className="">
                        <div className="flex max-w-[200px] flex-col md:max-w-none md:flex-row">
                          <span className="mr-2">{shoe.brand_name}</span>
                          <span className="">{shoe.model_name}</span>
                        </div>
                      </CardTitle>
                      <div className="text-xl  md:text-2xl">
                        {Math.ceil(metersToMiles(shoe.distance))} mi
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <div className="space-x-2">
                        {shoe.categories.map((category, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-sm uppercase tracking-wide group-hover:bg-yellow-400"
                          >
                            {category.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </CardFooter>
                  </Link>
                </Card>
              );
            })}
        </div>
      </div>
    </>
  );
}

ShoeSettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default ShoeSettingsPage;
