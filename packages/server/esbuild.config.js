// https://esbuild.github.io/

const packages = require("./package.json");
const esbuild = require("esbuild");
const fsExtra = require("fs-extra");
const { copy } = require("esbuild-plugin-copy");

const external = ["prisma"];
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
  .then(() => {
    fsExtra.copySync("../../node_modules/.prisma/client", "./dist", {
      filter: (src) => {
        if (src.endsWith(".js") || src.endsWith(".ts") || src.endsWith(".json") || src.endsWith(".prisma")) {
          return false;
        }
        return true;
      },
    });
    console.log(`[${packages.name}] ✨ Build successfull`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(`[${packages.name}] ❌ Build failed`);
    console.error(e);
    process.exit(1);
  });
