/* eslint-disable no-console */

import { copycat } from "@snaplet/copycat";
import { createSeedClient } from "@snaplet/seed";

const args = process.argv.slice(2);

const shouldClean = args.includes("--clean");

async function initClient() {
  const client = createSeedClient();
  return client;
}

async function main() {
  if (shouldClean) {
    console.log("🗑️  Clearing database...");
    const seed = await initClient();
    await seed.$resetDatabase();
    console.log("🗑️  Database cleared!");
    process.exit();
  }

  console.log("✨ Seeding...");
  const seed = await initClient();

  console.log("🗑️  Clearing database...");
  await seed.$resetDatabase();
  console.log("🌱 Seeding database...");

  await seed.user((x) =>
    x(100, () => ({
      email: (ctx) => copycat.email(ctx.seed),
      user_name: (ctx) => copycat.username(ctx.seed),
      id: (ctx) => copycat.uuid(ctx.seed),
      password: (ctx) => copycat.password(ctx.seed),
      is_email_verify: (ctx) => copycat.bool(ctx.seed),
      is_onboarded: true
    }))
  );

  console.log("🌱 Seeding completed!");
  process.exit();
}

main();
