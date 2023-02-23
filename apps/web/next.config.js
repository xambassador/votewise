require("dotenv").config({ path: "../../.env " });

/** @type {import('next').NextConfig} */

const plugins = [];
if (process.env.ANALYZE === "true" && process.env.NODE_ENV === "production") {
  const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
    openAnalyzer: false,
  });
  plugins.push(withBundleAnalyzer);
}

const nextConfig = {
  reactStrictMode: true,
  // https://nextjs.org/blog/next-13-1#built-in-module-transpilation-stable
  transpilePackages: ["@votewise/ui"],
};

module.exports = nextConfig;
