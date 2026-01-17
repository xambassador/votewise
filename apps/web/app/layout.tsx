import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Inter } from "next/font/google";

import { Toaster } from "@votewise/ui/toast";

import "@/styles/globals.css";

import { environment } from "@votewise/env";

import Providers from "@/components/providers";

/* ----------------------------------------------------------------------------------------------- */

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"]
});

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  title: "Welcome to Votewise",
  description: "Share your ideas with the world"
};

export default function RootLayout(props: Props) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-nobelBlack-50 text-gray-200"}>
        <Toaster />
        <Providers>{props.children}</Providers>
        {environment.IS_SANDBOX && (
          <div
            className="p-4 w-full text-sm text-gray-400 rounded-lg bg-nobelBlack-100 border border-nobelBlack-200 fixed bottom-0 inset-x-0 text-center"
            role="alert"
          >
            This is a sandbox environment. Data may be periodically reset and any actions performed here will not affect
            the system.
          </div>
        )}
      </body>
    </html>
  );
}
