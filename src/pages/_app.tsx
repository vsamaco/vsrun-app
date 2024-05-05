import { SessionProvider } from "next-auth/react";
import { type AppProps } from "next/app";
import { api as tApi } from "~/utils/api";
import "~/styles/globals.css";
import { type InferGetServerSidePropsType, type NextPage } from "next";
import type Layout from "~/components/layout";
import { ProfileProvider } from "~/contexts/Profile";

export type NextPageWithLayout<Props extends (args: any) => any> = NextPage & {
  getLayout?: (
    page: React.ReactElement,
    props: InferGetServerSidePropsType<Props>
  ) => React.ReactNode;
};

type AppWithLayoutType = AppProps & {
  Component: NextPageWithLayout<any>;
};

export type PageWithLayoutType = NextPage & { layout: typeof Layout };

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppWithLayoutType) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const layout = getLayout(<Component {...pageProps} />, pageProps);

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    <SessionProvider session={session}>
      <ProfileProvider>{layout}</ProfileProvider>
    </SessionProvider>
  );
}

export default tApi.withTRPC(MyApp);
