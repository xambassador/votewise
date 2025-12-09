/** @type {import('next').NextConfig} */

import withBundleAnalyzer from "@next/bundle-analyzer";

import { validateEnv } from "@votewise/env";

validateEnv(process.env);

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
});

const nextConfig = bundleAnalyzer({
  reactStrictMode: true,
  output: "standalone",
  eslint: { dirs: ["."] },
  poweredByHeader: false,
  transpilePackages: ["@votewise/ui"],
  webpack: (config) => {
    config.externals.push({
      bufferutil: "bufferutil",
      "utf-8-validate": "utf-8-validate"
    });

    // Support for mp3 imports
    config.module.rules.push({
      test: /\.mp3$/,
      use: [
        {
          loader: "file-loader",
          options: {
            name: "[name].[hash].[ext]",
            outputPath: "static/media/",
            publicPath: "/_next/static/media/"
          }
        }
      ]
    });

    return config;
  },
  experimental: {
    serverActions: {
      // https://github.com/vercel/next.js/issues/58295
      allowedOrigins: [new URL(process.env.VOTEWISE_APP_URL).host, process.env.VOTEWISE_APP_URL]
    }
  }
});

export default nextConfig;
