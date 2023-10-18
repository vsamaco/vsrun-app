import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "./ui/toaster";

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <main>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </main>
  );
}
