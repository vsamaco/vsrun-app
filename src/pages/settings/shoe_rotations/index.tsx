import { CalendarIcon, ExternalLink } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import Layout from "~/components/settings/layout";
import { buttonVariants } from "~/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { type ShoeRotationType } from "~/types";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/date";
import { totalShoeMiles } from "~/utils/shoe";

function ShoeRotationSettings() {
  const { data: shoeRotations, isLoading } =
    api.shoeRotation.getUserShoeRotations.useQuery();

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
          <h3 className="text-lg font-medium">Shoe Rotations</h3>
          <p className="text-sm text-muted-foreground">
            Highlight shoe rotations used for a given period
          </p>
          <Link
            href="/settings/shoe_rotations/new"
            className={cn("mt-5", buttonVariants())}
          >
            Create Shoe Rotation
          </Link>
        </div>
        <Separator />
        <div className="flex flex-col gap-4">
          {shoeRotations &&
            shoeRotations.map((shoeRotation) => (
              <ShoeRotationRow
                key={shoeRotation.id}
                shoeRotation={shoeRotation}
              />
            ))}
        </div>
      </div>
    </>
  );
}

function ShoeRotationRow({ shoeRotation }: { shoeRotation: ShoeRotationType }) {
  if (!shoeRotation) return;

  return (
    <Card className="hover:outline hover:outline-1">
      <CardHeader className="flex flex-row justify-between pb-4">
        <CardTitle className="hover:underline">
          <Link
            href={`/settings/shoe_rotations/${shoeRotation.slug}/edit`}
            className="text-balance max-w-[200px] break-words md:max-w-none md:whitespace-normal"
          >
            {shoeRotation.name}
          </Link>
        </CardTitle>
        <Link href={`/shoes/${shoeRotation.slug}`} target="_blank">
          <ExternalLink className="h-6 w-6" />
        </Link>
      </CardHeader>
      <CardFooter>
        <div className="flex space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <CalendarIcon className="mr-1 hidden h-4 w-4 md:block" />
            {formatDate(shoeRotation.startDate, {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </div>
          <div className="flex items-center">
            {shoeRotation.shoeList.length} shoes
          </div>
          <div className="flex items-center">
            {totalShoeMiles(shoeRotation.shoeList)} miles
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

ShoeRotationSettings.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default ShoeRotationSettings;
