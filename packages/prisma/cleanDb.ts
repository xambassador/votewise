/* eslint-disable no-console */

import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import ora from "ora";

const prisma = new PrismaClient();

const spinner = ora();

async function main() {
  console.log(chalk.blue("🤠 Cleaning database..."));
  spinner.start(chalk.blue("🧟‍♀️ Deleting all data..."));
  await prisma.postHashTag.deleteMany();
  await prisma.hashTag.deleteMany();
  await prisma.friend.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.upvote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postAsset.deleteMany();
  await prisma.post.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  spinner.succeed(chalk.blue("✨✨ Deleted all data... ✨✨"));
}

main()
  .then(() => {
    console.log("Done");
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    spinner.fail();
    spinner.stop();
    prisma.$disconnect();
    process.exit(1);
  });
