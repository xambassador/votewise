/* eslint-disable no-console */

import { createSeedClient } from "@snaplet/seed";

import { prisma } from ".";

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

  const topics = [
    "Technology",
    "Science",
    "Business",
    "Health",
    "Sports",
    "Entertainment",
    "Travel",
    "Fashion",
    "Food"
  ];

  await prisma.topics.createMany({
    data: topics.map((topic) => ({ name: topic }))
  });

  console.log("🌱 Seeding completed!");
  process.exit();
}

main();
