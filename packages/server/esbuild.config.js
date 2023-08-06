// https://esbuild.github.io/

const packages = require("./package.json");
const esbuild = require("esbuild");
const { copy } = require("esbuild-plugin-copy");

const external = [];
Object.keys(packages.dependencies || {}).forEach((key) => {
  if (key.startsWith("@votewise")) return;
  return external.push(key);
});

esbuild
  .build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    minify: true,
    minifyWhitespace: true,
    platform: "node",
    target: "node16",
    outfile: "./dist/index.js",
    tsconfig: "./tsconfig.json",
    external,
    plugins: [
      copy({
        // prisma schema needs to copied to dist folder since prisma client needs it
        resolveFrom: "cwd",
        assets: {
          from: "../prisma/schema.prisma",
          to: "./dist/schema.prisma",
        },
      }),
    ],
  })
  .catch(() => process.exit(1));
