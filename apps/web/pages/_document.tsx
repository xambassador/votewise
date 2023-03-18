import { Head, Html, Main, NextScript } from "next/document";

import React from "react";

export default function Document() {
  return (
    // NOTE: Add a scrollbar class. Only way to fix layout shift issue when Modal is going to close.
    <Html lang="en" className="scrollbar h-full">
      <Head />
      <body className="h-full bg-gray-50 font-sans">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
