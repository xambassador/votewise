"use client";

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { domAnimation, LazyMotion } from "framer-motion";

function queryClientFactory() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000 } }
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
        {children}
      </LazyMotion>
    </QueryClientProvider>
  );
}
