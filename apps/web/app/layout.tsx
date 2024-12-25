import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Poppins } from "next/font/google";

import { Toaster } from "@votewise/ui/toast";

import "@/styles/globals.css";

import Providers, { MotionProvider } from "@/components/providers";

/* ----------------------------------------------------------------------------------------------- */

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
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
      <body className={poppins.className + " bg-nobelBlack-50 text-gray-200"}>
        <Toaster />
        <Providers>
          <MotionProvider>{props.children}</MotionProvider>
        </Providers>
      </body>
    </html>
  );
}
