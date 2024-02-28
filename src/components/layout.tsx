import { ThemeProvider } from "~/components/theme-provider";
import Footer from "./ui/layout/footer";
import MainNavigation from "./ui/layout/main-navigation";
import { MaxWidthWrapper } from "./ui/layout/max-width-wrapper";

type LayoutProps = {
  children: React.ReactNode;
  showNav?: boolean;
};

export default function RootLayout({ children, showNav = true }: LayoutProps) {
  return (
    <main className="relative">
      {showNav && (
        <div className="sticky top-0 z-10 w-full flex-col bg-white md:flex">
          <div className="border-b">
            <MaxWidthWrapper>
              <div className="m:h-16 flex h-12 items-center px-4">
                <MainNavigation className="mx-6" />
              </div>
            </MaxWidthWrapper>
          </div>
        </div>
      )}
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Footer />
      </ThemeProvider>
    </main>
  );
}
