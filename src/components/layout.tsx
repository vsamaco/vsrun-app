import { ThemeProvider } from "~/components/theme-provider";
import Footer from "./ui/layout/footer";
import MainNavigation from "./ui/layout/main-navigation";
import { MaxWidthWrapper } from "./ui/layout/max-width-wrapper";
import UserNavigation from "./ui/layout/user-navigation";

type LayoutProps = {
  children: React.ReactNode;
  showNav?: boolean;
};

export default function RootLayout({ children, showNav = true }: LayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="relative">
        {showNav && (
          <header className="sticky top-0 z-10 w-full flex-col bg-white md:flex">
            <div className="border-b">
              <MaxWidthWrapper>
                <div className="flex h-12 items-center md:h-16 md:px-4">
                  <MainNavigation className="mx-6" />
                  <div className="ml-auto flex items-center space-x-4">
                    <UserNavigation />
                  </div>
                </div>
              </MaxWidthWrapper>
            </div>
          </header>
        )}
        <MaxWidthWrapper>
          <main>{children}</main>
          <Footer className="mx-6 px-4" />
        </MaxWidthWrapper>
      </div>
    </ThemeProvider>
  );
}
