import { ThemeProvider } from "~/components/theme-provider";
import Footer from "./ui/layout/footer";

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <main>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Footer />
      </ThemeProvider>
    </main>
  );
}
