import Link from "next/link";
import Layout from "~/components/settings/layout";
import { buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { type ShoeRotationType } from "~/types";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/date";

function ShoeRotationSettings() {
  const { data: shoeRotations, isLoading } =
    api.shoeRotation.getUserShoeRotations.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Shoe Rotations</h3>
        <p className="text-sm text-muted-foreground">
          Show shoe rotations used for a given period.
        </p>
        <Link
          href="/settings/shoe_rotations/new"
          className={cn("mt-5", buttonVariants())}
        >
          Create Shoe Rotation
        </Link>
      </div>
      <Separator />
      <div className="grid gap-4 md:grid-cols-2">
        {shoeRotations &&
          shoeRotations.map((shoeRotation) => (
            <ShoeRotationRow
              key={shoeRotation.id}
              shoeRotation={shoeRotation}
            />
          ))}
      </div>
    </div>
  );
}

function ShoeRotationRow({ shoeRotation }: { shoeRotation: ShoeRotationType }) {
  if (!shoeRotation) return;

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="truncate pb-2">{shoeRotation.name}</CardTitle>
        <CardDescription className="mt-5">
          {formatDate(shoeRotation.startDate, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="flex justify-between">
        <Link
          href={`/shoes/${shoeRotation.slug}`}
          className={buttonVariants({ variant: "outline" })}
          target="_blank"
        >
          View
        </Link>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href={`/settings/shoe_rotations/${shoeRotation.slug}/edit`}
        >
          Edit
        </Link>
      </CardFooter>
    </Card>
  );
}

ShoeRotationSettings.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default ShoeRotationSettings;
