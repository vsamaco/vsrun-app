import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppProps, type AppType } from "next/app";
import { api as tApi } from "~/utils/api";
import "~/styles/globals.css";
import { type NextPage } from "next";
import type Layout from "~/components/layout";

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

  return <SessionProvider session={session}>{layout}</SessionProvider>;
}

export default tApi.withTRPC(MyApp);
