import "nprogress/nprogress.css";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import "react-lazy-load-image-component/src/effects/blur.css";
import "react-lazy-load-image-component/src/effects/opacity.css";
import "simplebar-react/dist/simplebar.min.css";
import "styles/globals.css";

import type { NextPage } from "next";
import type { AppProps } from "next/app";

import type { ReactElement, ReactNode } from "react";
import React, { useState } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import { Toaster } from "@votewise/ui";

import { AuthScreenLayout } from "components/AuthScreenLayout";
import { Layout } from "components/Layout";
import { ProgressBar } from "components/Progressbar";

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps, router }: AppPropsWithLayout) {
  const { pathname } = router;
  const [queryClient] = useState(() => new QueryClient());

  if (pathname === "/verify-email") {
    return <Component {...pageProps} />;
  }

  let LayoutComponent;
  if (pathname === "/signin" || pathname === "/signup" || pathname === "/onboarding") {
    LayoutComponent = AuthScreenLayout;
  } else {
    LayoutComponent = Layout;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LayoutComponent>
        <ProgressBar />
        <Hydrate state={pageProps.dehydratedState}>
          <Component {...pageProps} />
        </Hydrate>
        <Toaster position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} />
      </LayoutComponent>
    </QueryClientProvider>
  );
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};
