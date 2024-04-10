import Head from "next/head";
import Link from "next/link";
import Layout from "~/components/settings/layout";
import { buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
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
            Showcase shoes used for your runs
          </p>
          <Link
            href="/settings/shoes/new"
            className={cn("mt-5", buttonVariants())}
          >
            Add Shoe
          </Link>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          {data &&
            data.map((shoe) => {
              return (
                <Card key={shoe.slug}>
                  <CardHeader>
                    <CardTitle>
                      {shoe.brand_name} {shoe.model_name}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter>
                    <Link
                      href={`/settings/shoes/${shoe.slug}/edit`}
                      className={buttonVariants()}
                    >
                      Edit Shoe
                    </Link>
                  </CardFooter>
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
