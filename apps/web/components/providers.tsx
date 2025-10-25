"use client";

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { domAnimation, LazyMotion } from "framer-motion";

import { Realtime } from "./realtime";

function queryClientFactory() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false, retry: false, gcTime: 60 * 1000 } }
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) return queryClientFactory();
  if (!browserQueryClient) browserQueryClient = queryClientFactory();
  return browserQueryClient;
}

type Props = { children: React.ReactNode };

export default function Providers(props: Props) {
  const { children } = props;
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion strict features={domAnimation}>
        <Realtime>{children}</Realtime>
      </LazyMotion>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
