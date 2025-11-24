import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Inter } from "next/font/google";

import { Toaster } from "@votewise/ui/toast";

import "@/styles/globals.css";

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
      </body>
    </html>
  );
}
