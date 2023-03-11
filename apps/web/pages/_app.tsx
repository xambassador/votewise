import type { AppProps } from "next/app";
import "styles/globals.css";

import type { NextPage } from "next";

import type { ReactElement, ReactNode } from "react";
import React from "react";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import "react-lazy-load-image-component/src/effects/blur.css";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient();

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  return getLayout(
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};
