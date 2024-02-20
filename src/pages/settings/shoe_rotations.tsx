import Link from "next/link";
import { useState } from "react";
import ShoeRotationModal from "~/components/settings/edit-shoe-rotation-modal";
import { buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import MainNavigation from "~/components/ui/layout/main-navigation";
import { MaxWidthWrapper } from "~/components/ui/layout/max-width-wrapper";
import UserNavigation from "~/components/ui/layout/user-navigation";
import { Separator } from "~/components/ui/separator";
import { Toaster } from "~/components/ui/toaster";
import { type ShoeRotationType } from "~/types";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/date";

function ShoeRotationSettings() {
  const { data: shoeRotations, isLoading } =
    api.shoeRotation.getUserShoeRotations.useQuery();
  const [isNewOpen, setIsNewOpen] = useState(false);

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div className="px-4 py-6 lg:px-8">
        <div className="ml-auto mr-4">
          <ShoeRotationModal
            shoeRotation={null}
            isOpen={isNewOpen}
            setOpen={setIsNewOpen}
          />
        </div>
      </div>
      <div className="mb-10 flex w-full items-center justify-between">
        <div className="grid grid-cols-1 space-y-4 md:grid-cols-2 md:space-x-4 md:space-y-0">
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
  const [isOpen, setIsOpen] = useState(false);

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
        <ShoeRotationModal
          shoeRotation={shoeRotation}
          isOpen={isOpen}
          setOpen={setIsOpen}
        />
      </CardFooter>
    </Card>
  );
}

ShoeRotationSettings.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <div className="flex-col md:flex">
        <div className="border-b">
          <MaxWidthWrapper>
            <div className="flex h-16 items-center px-4">
              <MainNavigation className="mx-6" />
              <div className="ml-auto flex items-center space-x-4">
                <UserNavigation />
              </div>
            </div>
          </MaxWidthWrapper>
        </div>
      </div>
      <div className="space-y-6 p-10 pb-16 md:block">
        <MaxWidthWrapper>
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">
              Settings / Shoe Rotations
            </h2>
          </div>
          <Separator className="my-6" />
          <div className="flex w-full flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <div className="flex-1">{page}</div>
          </div>
          <Toaster />
        </MaxWidthWrapper>
      </div>
    </>
  );
};

export default ShoeRotationSettings;
