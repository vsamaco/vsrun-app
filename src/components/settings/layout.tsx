import { Separator } from "~/components/ui/separator";
import { SidebarNav } from "./sidebar-nav";
import { Toaster } from "../ui/toaster";
import MainNavigation from "../ui/layout/main-navigation";
import { MaxWidthWrapper } from "../ui/layout/max-width-wrapper";
import UserNavigation from "../ui/layout/user-navigation";
import Footer from "../ui/layout/footer";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings",
  },
  // {
  //   title: "Run",
  //   href: "/settings/run",
  // },
  // {
  //   title: "Week",
  //   href: "/settings/week",
  // },
  {
    title: "Shoe Rotations",
    href: "/settings/shoe_rotations",
  },
  // {
  //   title: "Events",
  //   href: "/settings/events",
  // },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="relative">
      <div className="sticky top-0 z-20 w-full flex-col bg-white md:flex">
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
      <div className="space-y-6 p-4 pb-16 md:p-10">
        <MaxWidthWrapper>
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">
              Manage your profile and shoe rotations.
            </p>
          </div>
          <Separator className="my-6" />
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-mx-4 lg:w-1/5">
              <SidebarNav items={sidebarNavItems} />
            </aside>
            <div className="flex-1 lg:max-w-2xl">{children}</div>
          </div>
          <Toaster />
          <Footer />
        </MaxWidthWrapper>
      </div>
    </div>
  );
}
