import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/styles/globals.css";

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
      <body>{props.children}</body>
    </html>
  );
}
