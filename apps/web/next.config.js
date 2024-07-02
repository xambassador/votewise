/** @type {import('next').NextConfig} */

import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = bundleAnalyzer({
  reactStrictMode: true,
  output: "standalone",
  eslint: { dirs: ["."] },
  poweredByHeader: false,
  transpilePackages: ["ui", "@votewise/ui"],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  webpack: (config, context) => {
    config.externals.push({
      bufferutil: "bufferutil",
      "utf-8-validate": "utf-8-validate",
    });
    return config;
  },
});

module.exports = nextConfig;
