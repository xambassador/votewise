// https://esbuild.github.io/

const packages = require("./package.json");
const esbuild = require("esbuild");
const fs = require("fs");

const external = [];
Object.keys(packages.dependencies || {}).forEach((key) => {
  if (key.startsWith("@votewise")) return;
  return external.push(key);
});

esbuild
  .build({
    entryPoints: ["./server.ts"],
    bundle: true,
    minify: true,
    minifyWhitespace: true,
    platform: "node",
    target: "node16",
    outfile: "./dist/server.js",
    tsconfig: "./tsconfig.json",
    external
  })
  .then(() => {
    console.log(`[${packages.name}] ✨ Build successfull`);
    process.exit(0);
  })
  .catch(() => process.exit(1));
