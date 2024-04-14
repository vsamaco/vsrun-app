import { SessionProvider } from "next-auth/react";
import { type AppProps } from "next/app";
import { api as tApi } from "~/utils/api";
import "~/styles/globals.css";
import { type NextPage } from "next";
import type Layout from "~/components/layout";
import { ProfileProvider } from "~/contexts/Profile";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppWithLayoutType = AppProps & {
  Component: NextPageWithLayout;
};

export type PageWithLayoutType = NextPage & { layout: typeof Layout };

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppWithLayoutType) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const layout = getLayout(<Component {...pageProps} />);

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    <SessionProvider session={session}>
      <ProfileProvider>{layout}</ProfileProvider>
    </SessionProvider>
  );
}

export default tApi.withTRPC(MyApp);
