/* eslint-disable no-console */

import type { Comment, Group, HashTag, Post, Topics, User } from "@prisma/client";

import { faker } from "@faker-js/faker";
import {
  Gender,
  GroupInvitationStatus,
  GroupInvitationType,
  GroupStatus,
  GroupType,
  NotificationType,
  PostStatus
} from "@prisma/client";

import { prisma } from ".";

const args = process.argv.slice(2);

const shouldClean = args.includes("--clean");

async function resetDatabase() {
  console.log("🗑️  Clearing database...");
  await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Topics" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "HashTag" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Group" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "GroupMember" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "GroupInvitation" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Post" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "PostHashTag" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "PostAsset" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Comment" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "CommentUpvote" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Upvote" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Follow" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Friend" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "UserInterests" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "Notification" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "GroupMember" CASCADE`;
  await prisma.$queryRaw`TRUNCATE TABLE "GroupInvitation" CASCADE`;
  console.log("🗑️  Database cleared!");
}

async function main() {
  if (shouldClean) {
    await resetDatabase();
    process.exit();
  }

  console.log("✨ Seeding...");
  await resetDatabase();
  console.log("🌱 Seeding database...");

  const topics = await createTopics();
  const users = await createUsers();
  await createUserInterests(users, topics);
  await createFollows(users);
  const hashtags = await createHashtags();
  const groups = await createGroups();
  await addUsersToGroups(users, groups);
  await createGroupInvitations(users, groups);
  const posts = await createPosts(users, groups, hashtags, topics);
  const comments = await createComments(users, posts);
  await createUpvotes(users, posts);
  await createCommentUpvotes(users, posts, comments);
  await createNotifications(users);

  console.log("🌱 Seeding completed!");
  process.exit();
}

async function createTopics() {
  const topicNames = [
    "Technology",
    "Science",
    "Health",
    "Business",
    "Entertainment",
    "Sports",
    "Politics",
    "Education",
    "Art",
    "Food",
    "Travel",
    "Fashion",
    "Music",
    "Movies",
    "Books",
    "Gaming",
    "Photography",
    "DIY",
    "Fitness",
    "Environment"
  ];

  const topics: Topics[] = [];

  for (const name of topicNames) {
    const topic = await prisma.topics.create({
      data: {
        name
      }
    });
    topics.push(topic);
  }

  console.log("✅ Topics created!");
  return topics;
}

const defaultPassword = "$2a$12$WiBdk9VyfUbSb4Ys0ya9Y.3KwbEgDMjWaui9Bfs2pDlBiVdmF/r0u"; // Password@123
const awesomePeople = [
  {
    username: "jerry_bhai",
    firstName: "Jerry",
    lastName: "Bhai",
    email: "jerrybhai.tomandjerry@gmail.com",
    avatar: "avatars/avatar_jerry_bhai.jpeg",
    background: "backgrounds/bg_jerry_bhai.jpg",
    about: "Just an ordinary mouse with extraordinary plans.",
    location: "Cartoon City",
    gender: "MALE"
  },
  {
    username: "tom",
    firstName: "Tom",
    lastName: "Jasper",
    email: "tom.jasper@gmail.com",
    avatar: "avatars/tom_the_legend.jpg",
    background: "backgrounds/tom_the_legend.webp",
    about: "A cat with a never-ending chase and a heart of gold.",
    location: "Cartoon City",
    gender: "MALE"
  },
  {
    username: "doremon",
    firstName: "Doremon",
    lastName: "Billa",
    email: "doremon@gmail.com",
    avatar: "avatars/doremon.jpg",
    background: "",
    about: "A robotic cat from the future, here to help a useless kid named Nobita.",
    location: "Tokyo, Japan",
    gender: "MALE"
  },
  {
    username: "tinku_bhai",
    firstName: "Tinku",
    lastName: "Bhai",
    email: "tinkubhai@gmail.com",
    avatar: "avatars/tinku.jpg",
    background: "",
    about: "EMI dreams, cash attitude. Inbox pehle, respect baad mein.",
    location: "Bhindi Bazar",
    gender: "MALE"
  },
  {
    username: "ludobhai",
    firstName: "Ludo",
    lastName: "Bhai",
    email: "ludobhai@gmail.com",
    avatar: "avatars/ludo_bhai.jpeg",
    background: "backgrounds/ludo_bhai.webp",
    about: "Life is a dice roll. Main toh bas 6 pe hi rukta hoon.",
    location: "Bhindi Bazar",
    gender: "MALE"
  },
  {
    username: "munnabhai",
    firstName: "Munna",
    lastName: "Bhai",
    email: "munna_bhai@gmail.com",
    avatar: "avatars/munnabhai.png",
    background: "backgrounds/munnabhai.jpeg",
    about: "Aye yede tere baap ki saadi hai kya ?.",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "bablibhai",
    firstName: "Babli",
    lastName: "Bhai",
    email: "babli_bhai@gmail.com",
    avatar: "avatars/babli_bhai.jpg",
    background: "",
    about: "Party badal liya sala",
    location: "On the boat",
    gender: "MALE"
  },
  {
    username: "rajuhalkat",
    firstName: "Raju",
    lastName: "Hera pheri wala",
    email: "raju@gmail.com",
    avatar: "avatars/raju.webp",
    background: "backgrounds/raju.jpg",
    about: "Ekkis din main paise double.",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "tiwari_seth",
    firstName: "Tiwari",
    lastName: "Seth",
    email: "tiwari.seth@gmail.com",
    avatar: "avatars/tiwari_seth.jpg",
    background: "",
    about: "Mera bees laat rupiya kidhal hai.",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "maru_dhamdhere",
    firstName: "Martand",
    lastName: "Dhamdhere",
    email: "maru@gmail.com",
    avatar: "avatars/maru.jpg",
    background: "",
    about: "Aaj budhwar hai aur budhwar ko main kagaz kalam chhuta nahi.",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "majanu",
    firstName: "Majnu",
    lastName: "Bhai",
    email: "majnu_bhai@gmail.com",
    avatar: "avatars/majnu.avif",
    background: "backgrounds/majnu.jpg",
    about: "Yeh raaz bhi ushi ke saath chala gaya.",
    location: "Dubai",
    gender: "MALE"
  },
  {
    username: "uday_shetty",
    firstName: "Uday",
    lastName: "Shetty",
    email: "uday@gmail.com",
    avatar: "avatars/uday.jpeg",
    background: "backgrounds/uday.jpeg",
    about: "Control uday control.",
    location: "Dubai",
    gender: "MALE"
  },
  {
    username: "papi_papita",
    firstName: "Papi",
    lastName: "papita",
    email: "papi.papita@gmail.com",
    avatar: "avatars/papita.jpg",
    background: "",
    about: "Half fruit, half flirt, full-time papita.",
    location: "Hawaii",
    gender: "MALE"
  },
  {
    username: "mithunda",
    firstName: "Mithun",
    lastName: "Chakraborty",
    email: "mithun.da@gmail.com",
    avatar: "avatars/mithun_da.webp",
    background: "backgrounds/mithun_da.webp",
    about: "My name is Jimmy, and I'm a gangster! Half hero, half dancer, full Da.",
    location: "Kolkata",
    gender: "MALE"
  },
  {
    username: "chagan_halwai_880",
    firstName: "Chagan",
    lastName: "Halwai",
    email: "chagan.halwai@yahoo.com",
    avatar: "avatars/chagan_lal.jpg",
    background: "",
    about: "My problems melt faster than my jalebis.",
    location: "Dholakpur",
    gender: "MALE"
  },
  {
    username: "mikala_jaksun",
    firstName: "Mikalal",
    lastName: "Jeksun",
    email: "mikalal.jaksun@gmail.com",
    avatar: "avatars/mikala_jaksun.jpg",
    background: "",
    about: "The only King of Pop who still takes the bus.",
    location: "Los Angeles, CA",
    gender: "MALE"
  },
  {
    username: "champaklal",
    firstName: "Champak lal",
    lastName: "Gada",
    email: "champak.gada@gmail.com",
    avatar: "avatars/champak.jpg",
    background: "",
    about: "Nahane ja nahane.",
    location: "Gokuldham Society",
    gender: "MALE"
  },
  {
    username: "lord_jetha",
    firstName: "Jetha",
    lastName: "Champak Gada",
    email: "jethalovesbabita@gmail.com",
    avatar: "avatars/jetha_bhai.jpg",
    background: "",
    about: "Cash ya cheque.",
    location: "Gokuldham Society",
    gender: "MALE"
  },
  {
    username: "shishimaru",
    firstName: "Shishimaru",
    lastName: "Ninja dog",
    email: "shishimaru@gmail.com",
    avatar: "avatars/shishimaru.webp",
    background: "",
    about: "Andhe ne movie dekhi, gunge ne gana gaya!!!!!",
    location: "Iga Village, Japan",
    gender: "MALE"
  },
  {
    username: "kio",
    firstName: "Kio",
    lastName: "black billa",
    email: "kio.koga@gmail.com",
    avatar: "avatars/kio.jpeg",
    background: "",
    about: "Yeh Shishimaru sirf acting karta hai... asli talent toh mere paas hai!",
    location: "Koga Village, Japan",
    gender: "MALE"
  },
  {
    username: "lord_amara",
    firstName: "Kemuzou",
    lastName: "Kemumaki",
    email: "amara@gmail.com",
    avatar: "avatars/amara.jpg",
    background: "backgrounds/amara.webp",
    about: "Mera name hai Amara, or main marta hu favara.",
    location: "Koga Village, Japan",
    gender: "MALE"
  },
  {
    username: "kaliya",
    firstName: "Kaliya",
    lastName: "Bully boy",
    email: "kaliya@gmail.com",
    avatar: "avatars/kaliya.jpeg",
    background: "",
    about: "Only wearing black chaddi and fit kid in the dholakpur.",
    location: "Dholakpur",
    gender: "MALE"
  },
  {
    username: "kaliya_ka_mama",
    firstName: "Kaliya",
    lastName: "Ka mama",
    email: "kaliya.mama@gmail.com",
    avatar: "avatars/kaliya_ka_mama.jpeg",
    background: "",
    about: "Mumbai se aarela mama.",
    location: "Mumbai <-> Dholakpur",
    gender: "MALE"
  },
  {
    username: "dhooni_baba",
    firstName: "Dhooni",
    lastName: "Baba",
    email: "dhooni.baba@gmail.com",
    avatar: "avatars/dhooni_baba.jpeg",
    background: "",
    about: "Dhooni baba, the wisest of them all.",
    location: "Dholakpur <-> Himalayas",
    gender: "MALE"
  },
  {
    username: "kitchak",
    firstName: "Kitchak",
    lastName: "kothari",
    email: "kitchak@gmail.com",
    avatar: "avatars/kitchak.jpg",
    background: "",
    about: "Pehlwan pur ka kitchak.",
    location: "Pehlwan pur",
    gender: "MALE"
  },
  {
    username: "principle_007",
    firstName: "Bunta",
    lastName: "Takakura",
    email: "principle@gmail.com",
    avatar: "avatars/principle.jpeg",
    background: "backgrounds/principle.webp",
    about: "Kasukabe kindergarden principle.",
    location: "Kasukabe, Japan",
    gender: "MALE"
  },
  {
    username: "baburao_aapte",
    firstName: "Baburao",
    lastName: "Ganpatrao Apte",
    email: "babu.aapte@gmail.com",
    avatar: "avatars/babu_rao.jpg",
    background: "backgrounds/babu_rao.jpeg",
    about: "Cha maila, babu bhaiya se direct babu, tera to game bajana padega.",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "shyam",
    firstName: "Shyam",
    lastName: "Sundar",
    email: "shyam@gmail.com",
    avatar: "avatars/shyam.png",
    background: "backgrounds/shyam.webp",
    about: "ITUS - Iski Topi Uske Sar.",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "bagheswar",
    firstName: "Bagha",
    lastName: "Boy",
    email: "bagha.boy@gmail.com",
    avatar: "avatars/bagha_boy.png",
    background: "",
    about: "Voto, jaisi jiski soch",
    location: "Gokuldham Society",
    gender: "MALE"
  },
  {
    username: "radhe_shyam",
    firstName: "Radhe",
    lastName: "Shyam tiwari",
    email: "radheshyam.tiwari@gmail.com",
    avatar: "avatars/radhe_tiwari.jpg",
    background: "",
    about: "Kaua kitna bhi washing machine mai naha le, bagula nahi banta.",
    location: "Gokuldham Society",
    gender: "MALE"
  },
  {
    username: "lord_jack",
    firstName: "Jack",
    lastName: "--",
    email: "jack@gmail.com",
    avatar: "avatars/lord_jack.gif",
    background: "",
    about: "Papa hu papa, iss duniya ka papa",
    location: "All around the world 🌍",
    gender: "MALE"
  },
  {
    username: "giyan",
    firstName: "Takeshi",
    lastName: "Gouda",
    email: "giyan.aslimard@gmail.com",
    avatar: "avatars/giyan.jpeg",
    background: "",
    about: "I am Gian — anyone who says no to me gets a free private performance.",
    location: "Tokyo, Japan",
    gender: "MALE"
  },
  {
    username: "sinchan",
    firstName: "Shinnosuke",
    lastName: "Nohara",
    email: "sinchan.nohara@gmail.com",
    avatar: "avatars/sinchan.jpeg",
    background: "",
    about: "My name is sinchan and I am 5 years old.",
    location: "Tokyo, Japan",
    gender: "MALE"
  },
  {
    username: "kachara_seth",
    firstName: "Kachara",
    lastName: "Seth",
    email: "kachara.seth@gmail.com",
    avatar: "avatars/kachara_seth.jpeg",
    background: "",
    about: "150rs dega!",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "chotta_chattri",
    firstName: "Chotta",
    lastName: "Chattri",
    email: "chotta.chattri@gmail.com",
    avatar: "avatars/chotta_chatri.avif",
    background: "",
    about: "Aye break maar, vinash kale viprit buddhi",
    location: "Mumbai",
    gender: "MALE"
  },
  {
    username: "dr_ghungroo",
    firstName: "Dr.",
    lastName: "Ghungroo",
    email: "drghungroo@gmail.com",
    avatar: "avatars/drghungroo.jpg",
    background: "",
    about: "Tera baap yaha chodke gaya tha ya teri ma?",
    location: "Dubai",
    gender: "MALE"
  },
  {
    username: "vasooli",
    firstName: "Vasooli",
    lastName: "Bhai",
    email: "vasooli_bhai@gmail.com",
    avatar: "avatars/vasooli_bhai.png",
    background: "",
    about: "Jaldi bol kal subah panvel niklna hai.",
    location: "Goa",
    gender: "MALE"
  },
  {
    username: "buri_buri",
    firstName: "Buri",
    lastName: "zaemon",
    email: "buriburizaemon@gmail.com",
    avatar: "avatars/buriburizaemon.jpg",
    background: "",
    about: "Mai hamesha takatwar logo ki madad karta hu.",
    location: "Tokyo, Japan",
    gender: "MALE"
  },
  {
    username: "pythagorus_bhai",
    firstName: "Pythagorus",
    lastName: "Bhai",
    email: "pythogorus_bhai@gmail.com",
    avatar: "avatars/pythogorus_bhai.jpg",
    background: "",
    about: "Inventor of pythagorus theorem and a great mathematician.",
    location: "Ancient Greece",
    gender: "MALE"
  },
  {
    username: "mommbati_joshi",
    firstName: "Mommbati",
    lastName: "Joshi",
    email: "mommbati.joshi@gmail.com",
    avatar: "avatars/mommbati_joshi.jpg",
    background: "",
    about: "Selling videshi lalli powder",
    location: "California, USA",
    gender: "FEMALE"
  },
  {
    username: "ramesh",
    firstName: "Ramesh",
    lastName: "Rasilla",
    email: "ramesh@gmail.com",
    avatar: "avatars/ramesh.jpg",
    background: "",
    about: "Just a sweet guy who loves rasilla padarth.",
    location: "Uttar Pradesh, India",
    gender: "MALE"
  },
  {
    username: "jhoney_pandey",
    firstName: "Jhoney",
    lastName: "Pandey",
    email: "jhoney.pandey@gmail.com",
    avatar: "avatars/jhoney.jpeg",
    background: "",
    about: "Freedom fighter. Fight for memes.",
    location: "India",
    gender: "MALE"
  },
  {
    username: "pavitra_prabhakar",
    firstName: "Pavitra",
    lastName: "Prabhakar",
    email: "pavitra.prabhakar@gmail.com",
    avatar: "avatars/spoidermon.png",
    background: "",
    about: "Just your friendly neighborhood spoiderman.",
    location: "New York, USA",
    gender: "MALE"
  },
  {
    username: "ajay_bhai_devgan",
    firstName: "Ajay",
    lastName: "Bhai Devgan",
    email: "ajay.devgan@gmail.com",
    avatar: "avatars/ajay_devgan.jpg",
    background: "",
    about: "Bolo zubaan kesri.",
    location: "Kanpur, India",
    gender: "MALE"
  },
  {
    username: "babloo_blaster",
    firstName: "Babloo",
    lastName: "Blaster",
    email: "babloo.blaster@gmail.com",
    avatar: "avatars/babloo_blaster.jpg",
    background: "",
    about: "Eat s, shoots, and leaves.",
    location: "Chandani Chowk",
    gender: "MALE"
  },
  {
    username: "jogindar_jehrila",
    firstName: "Jogindar",
    lastName: "Jehrila",
    email: "jogindar@gmail.com",
    avatar: "avatars/jogindar.webp",
    background: "",
    about: "I love snakes 🐍",
    location: "Somewhere in Amazon forest",
    gender: "MALE"
  },
  {
    username: "barmunda_kumar",
    firstName: "Barmunda",
    lastName: "Bur kumar",
    email: "barmunda.kumar@gmail.com",
    avatar: "avatars/barmunda_kumar.jpg",
    background: "",
    about: "Riding high on the waves of life 🌊.",
    location: "Barmuda Triangle",
    gender: "MALE"
  },
  {
    username: "divakar_pardeshi",
    firstName: "Divakar",
    lastName: "Pardeshi",
    email: "divakar@gmail.com",
    avatar: "avatars/divakar.jpg",
    background: "",
    about: "Love desi potli with some extra water.",
    location: "Bhainsa",
    gender: "MALE"
  },
  {
    username: "raju_dalal",
    firstName: "Raju",
    lastName: "Dalal",
    email: "raju.dalal@gmail.com",
    avatar: "avatars/raju_dalal.jpg",
    background: "",
    about: "Share market se bada koi game nahi.",
    location: "Lost in stock market",
    gender: "MALE"
  },
  {
    username: "mangal_singh",
    firstName: "Daku",
    lastName: "Mangal Singh",
    email: "dakumangal.singh@gmail.com",
    avatar: "avatars/mangal_singh.jpg",
    background: "",
    about: "Most wanted daku of dholakpur.",
    location: "Dholakpur",
    gender: "MALE"
  },
  {
    username: "action_ka_men",
    firstName: "Action",
    lastName: "Ka men",
    email: "actionkamen@gmail.com",
    avatar: "avatars/action_men.jpg",
    background: "",
    about: "Just like my name, I am full of action and always ready for an adventure.",
    location: "Tokyo, Japan",
    gender: "MALE"
  },
  {
    username: "lucky_man",
    firstName: "Lucky",
    lastName: "Men",
    email: "lucky.men@gmail.com",
    avatar: "avatars/lucky_men.jpg",
    background: "",
    about: "They call me Lucky because I always find a way out of tricky situations.",
    location: "Tokyo, Japan",
    gender: "MALE"
  },
  {
    username: "hagemaru",
    firstName: "Tsurupika",
    lastName: "Hagemaru",
    email: "hagemaru@gmail.com",
    avatar: "avatars/hagemaru.jpg",
    background: "",
    about: "A kanjus kid in tokyo.",
    location: "Tokyo, Japan",
    gender: "MALE"
  }
];

async function createUsers() {
  const users: User[] = [];
  const genders = Object.values(Gender);
  const avatars = Array.from({ length: 50 }).map((_, index) => "avatars/avatar_" + (index + 1) + ".png");
  const backgrounds = Array.from({ length: 10 }).map((_, index) => "backgrounds/bg_" + (index + 1) + ".png");

  for (let i = 0; i < awesomePeople.length; i++) {
    const userName = awesomePeople[i].username;
    const user = await prisma.user.create({
      data: {
        email: awesomePeople[i].email,
        user_name: userName,
        password: defaultPassword,
        first_name: awesomePeople[i].firstName,
        last_name: awesomePeople[i].lastName,
        about: awesomePeople[i].about,
        twitter_profile_url: faker.helpers.maybe(() => `https://twitter.com/${userName}`, { probability: 0.6 }),
        facebook_profile_url: faker.helpers.maybe(() => `https://facebook.com/${userName}`, { probability: 0.5 }),
        instagram_profile_url: faker.helpers.maybe(() => `https://instagram.com/${userName}`, { probability: 0.7 }),
        github_profile_url: faker.helpers.maybe(() => `https://github.com/${userName}`, { probability: 0.4 }),
        avatar_url: awesomePeople[i].avatar || avatars[faker.number.int(avatars.length - 1)],
        cover_image_url: awesomePeople[i].background || backgrounds[faker.number.int(backgrounds.length - 1)],
        location: awesomePeople[i].location || faker.location.city(),
        gender: (awesomePeople[i].gender as "MALE") || faker.helpers.arrayElement(genders),
        last_login: faker.date.recent(),
        is_onboarded: true,
        is_email_verify: true,
        email_confirmed_at: faker.helpers.maybe(() => faker.date.past(), { probability: 0.8 }),
        created_at: faker.date.past(),
        userAggregates: {
          create: {
            total_comments: 0,
            total_followers: 0,
            total_following: 0,
            total_groups: 0,
            total_posts: 0,
            total_votes: 0
          }
        }
      }
    });

    users.push(user);
  }

  console.log(`✅ ${awesomePeople.length} users created!`);
  return users;
}

async function createUserInterests(users: User[], topics: Topics[]) {
  for (const user of users) {
    const userTopics = faker.helpers.arrayElements(topics, { min: 3, max: 7 });

    for (const topic of userTopics) {
      await prisma.userInterests.create({
        data: {
          user_id: user.id,
          topic_id: topic.id
        }
      });
    }
  }

  console.log("✅ User interests created!");
}

async function createFollows(users: User[]) {
  for (const user of users) {
    const followCount = faker.number.int({ min: 5, max: 20 });
    const potentialFollowees = users.filter((u) => u.id !== user.id);
    const followees = faker.helpers.arrayElements(potentialFollowees, Math.min(followCount, potentialFollowees.length));

    for (const followee of followees) {
      await prisma.follow.create({
        data: {
          follower_id: user.id,
          following_id: followee.id
        }
      });
      await prisma.userAggregates.update({
        where: { user_id: followee.id },
        data: { total_followers: { increment: 1 } }
      });
    }
  }

  console.log("✅ Follows created!");
}

async function createHashtags() {
  const hashtagNames = [
    "trending",
    "viral",
    "news",
    "tech",
    "innovation",
    "startup",
    "health",
    "wellness",
    "fitness",
    "food",
    "travel",
    "adventure",
    "photography",
    "art",
    "design",
    "music",
    "entertainment",
    "movies",
    "gaming",
    "sports",
    "nature",
    "environment",
    "climate",
    "science",
    "research",
    "education",
    "learning",
    "career",
    "business",
    "marketing",
    "socialmedia",
    "digital",
    "programming",
    "coding",
    "development",
    "motivation",
    "inspiration",
    "success",
    "leadership",
    "productivity"
  ];

  const hashtags: HashTag[] = [];

  for (const name of hashtagNames) {
    const hashtag = await prisma.hashTag.create({
      data: {
        name,
        count: faker.number.int({ min: 10, max: 1000 })
      }
    });
    hashtags.push(hashtag);
  }

  console.log("✅ Hashtags created!");

  return hashtags;
}

async function createGroups() {
  const groupTypes = Object.values(GroupType);
  const groupStatuses = Object.values(GroupStatus);
  const groups: Group[] = [];

  for (let i = 0; i < 20; i++) {
    const name = faker.company.name().slice(0, 21);
    const group = await prisma.group.create({
      data: {
        name,
        about: faker.lorem.paragraphs(2).slice(0, 500),
        type: faker.helpers.arrayElement(groupTypes),
        status: faker.helpers.arrayElement(groupStatuses),
        groupAggregates: {
          create: {
            total_comments: 0,
            total_members: 0,
            total_posts: 0,
            total_votes: 0
          }
        }
      }
    });
    groups.push(group);
  }

  console.log("✅ Groups created!");
  return groups;
}

async function addUsersToGroups(users: User[], groups: Group[]) {
  for (const group of groups) {
    // Select a random user as admin
    const adminUser = faker.helpers.arrayElement(users);
    await prisma.groupMember.create({
      data: {
        role: "ADMIN",
        user_id: adminUser.id,
        group_id: group.id
      }
    });
    await prisma.userAggregates.update({
      where: { user_id: adminUser.id },
      data: { total_groups: { increment: 1 } }
    });
    await prisma.groupAggregates.update({
      where: { group_id: group.id },
      data: { total_members: { increment: 1 } }
    });

    const moderatorCount = faker.number.int({ min: 2, max: 5 });
    const potentialModerators = users.filter((u) => u.id !== adminUser.id);
    const moderators = faker.helpers.arrayElements(potentialModerators, moderatorCount);

    for (const moderator of moderators) {
      await prisma.groupMember.create({
        data: {
          role: "MODERATOR",
          user_id: moderator.id,
          group_id: group.id
        }
      });
      await prisma.userAggregates.update({
        where: { user_id: moderator.id },
        data: { total_groups: { increment: 1 } }
      });
      await prisma.groupAggregates.update({
        where: { group_id: group.id },
        data: { total_members: { increment: 1 } }
      });
    }

    const memberCount = faker.number.int({ min: 10, max: 50 });
    const existingUserIds = [adminUser.id, ...moderators.map((m) => m.id)];
    const potentialMembers = users.filter((u) => !existingUserIds.includes(u.id));
    const members = faker.helpers.arrayElements(potentialMembers, Math.min(memberCount, potentialMembers.length));

    for (const member of members) {
      await prisma.groupMember.create({
        data: {
          role: "MEMBER",
          user_id: member.id,
          group_id: group.id,
          blocked: faker.helpers.maybe(() => true, { probability: 0.05 })
        }
      });
      await prisma.userAggregates.update({
        where: { user_id: member.id },
        data: { total_groups: { increment: 1 } }
      });
      await prisma.groupAggregates.update({
        where: { group_id: group.id },
        data: { total_members: { increment: 1 } }
      });
    }
  }

  console.log("✅ Users added to groups!");
}

async function createGroupInvitations(users: User[], groups: Group[]) {
  const invitationTypes = Object.values(GroupInvitationType);
  const statuses = Object.values(GroupInvitationStatus);

  for (const group of groups) {
    // Find users who are not members of this group
    const groupMembers = await prisma.groupMember.findMany({
      where: { group_id: group.id },
      select: { user_id: true }
    });

    const memberUserIds = groupMembers.map((m) => m.user_id);
    const nonMembers = users.filter((u) => !memberUserIds.includes(u.id));

    const invitationCount = faker.number.int({ min: 5, max: 15 });
    const invitedUsers = faker.helpers.arrayElements(nonMembers, Math.min(invitationCount, nonMembers.length));

    for (const user of invitedUsers) {
      const isAlreadyInvited = await prisma.groupInvitation.findFirst({
        where: { group_id: group.id, user_id: user.id }
      });
      if (isAlreadyInvited) continue;
      await prisma.groupInvitation.create({
        data: {
          type: faker.helpers.arrayElement(invitationTypes),
          status: faker.helpers.arrayElement(statuses),
          sent_at: faker.date.recent(),
          group_id: group.id,
          user_id: user.id
        }
      });
    }
  }

  console.log("✅ Group invitations created!");
}

async function createPosts(users: User[], groups: Group[], hashtags: HashTag[], topics: Topics[]) {
  const postStatuses = Object.values(PostStatus);
  const posts: Post[] = [];

  for (const topic of topics) {
    for (let i = 0; i < 20; i++) {
      const user = faker.helpers.arrayElement(users);
      const isGroupPost = faker.datatype.boolean();
      let group: Group | null | undefined = null;

      if (isGroupPost) {
        // Find groups this user is a member of
        const userGroups = await prisma.groupMember.findMany({
          where: { user_id: user.id },
          select: { group_id: true }
        });

        if (userGroups.length > 0) {
          const randomGroupId = faker.helpers.arrayElement(userGroups).group_id;
          group = groups.find((g) => g.id === randomGroupId);
        }
      }

      const title = faker.lorem.sentence().slice(0, 50);
      const slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        faker.string.alphanumeric(8);

      const post = await prisma.post.create({
        data: {
          title,
          content: faker.lorem.paragraphs({ min: 2, max: 5 }).slice(0, 300),
          slug,
          type: group ? "GROUP_ONLY" : "PUBLIC",
          status: faker.helpers.arrayElement(postStatuses),
          group_id: group?.id || null,
          author_id: user.id,
          created_at: faker.date.past(),
          postAggregates: {
            create: {
              comments: 0,
              shares: 0,
              views: 0,
              votes: 0
            }
          }
        }
      });

      await prisma.postTopic.create({
        data: {
          post_id: post.id,
          topic_id: topic.id
        }
      });

      await prisma.userAggregates.update({
        where: { user_id: user.id },
        data: { total_posts: { increment: 1 } }
      });
      if (group) {
        await prisma.groupAggregates.update({
          where: { group_id: group.id },
          data: { total_posts: { increment: 1 } }
        });
      }

      posts.push(post);

      // Add 1-3 hashtags to each post
      const postHashtagCount = faker.number.int({ min: 1, max: 3 });
      const postHashtags = faker.helpers.arrayElements(hashtags, postHashtagCount);

      for (const hashtag of postHashtags) {
        await prisma.postHashTag.create({
          data: {
            post_id: post.id,
            hash_tag_id: hashtag.id
          }
        });
      }

      // Add 0-3 assets to each post
      const assetCount = faker.number.int({ min: 0, max: 3 });

      for (let j = 0; j < assetCount; j++) {
        const url = faker.image.url();
        await prisma.postAsset.create({
          data: {
            type: "image",
            url,
            post_id: post.id
          }
        });
      }
    }
  }

  console.log("✅ Posts created!");
  return posts;
}

async function createComments(users: User[], posts: Post[]) {
  const comments: Comment[] = [];

  for (const post of posts) {
    const commentCount = faker.number.int({ min: 0, max: 10 });

    for (let i = 0; i < commentCount; i++) {
      const user = faker.helpers.arrayElement(users);

      const comment = await prisma.comment.create({
        data: {
          text: faker.lorem.paragraph(),
          parent_id: null, // For simplicity, not creating nested comments
          post_id: post.id,
          user_id: user.id,
          created_at: faker.date.recent()
        }
      });
      await prisma.postAggregates.update({
        where: { post_id: post.id },
        data: { comments: { increment: 1 } }
      });
      await prisma.userAggregates.update({
        where: { user_id: user.id },
        data: { total_comments: { increment: 1 } }
      });
      if (post.group_id) {
        await prisma.groupAggregates.update({
          where: { group_id: post.group_id },
          data: { total_comments: { increment: 1 } }
        });
      }

      comments.push(comment);
    }
  }

  console.log("✅ Comments created!");
  return comments;
}

async function createUpvotes(users: User[], posts: Post[]) {
  for (const post of posts) {
    const upvoteCount = faker.number.int({ min: 0, max: 20 });
    const upvoters = faker.helpers.arrayElements(users, upvoteCount);

    for (const user of upvoters) {
      await prisma.upvote.create({
        data: {
          post_id: post.id,
          user_id: user.id
        }
      });
      await prisma.postAggregates.update({
        where: { post_id: post.id },
        data: { votes: { increment: 1 } }
      });
      await prisma.userAggregates.update({
        where: { user_id: user.id },
        data: { total_votes: { increment: 1 } }
      });
      await prisma.groupAggregates.updateMany({
        where: { group_id: post.group_id || undefined },
        data: { total_votes: { increment: 1 } }
      });
    }
  }

  console.log("✅ Post upvotes created!");
}

async function createCommentUpvotes(users: User[], posts: Post[], comments: Comment[]) {
  for (const comment of comments) {
    const upvoteCount = faker.number.int({ min: 0, max: 5 });
    const upvoters = faker.helpers.arrayElements(users, upvoteCount);
    const post = posts.find((p) => p.id === comment.post_id);
    if (!post) continue;

    for (const user of upvoters) {
      await prisma.commentUpvote.create({
        data: {
          comment_id: comment.id,
          post_id: post.id,
          user_id: user.id
        }
      });
    }
  }

  console.log("✅ Comment upvotes created!");
}

async function createNotifications(users: User[]) {
  const notificationTypes = Object.values(NotificationType);

  for (let i = 0; i < 300; i++) {
    const user = faker.helpers.arrayElement(users);

    await prisma.notification.create({
      data: {
        event_type: faker.helpers.arrayElement(notificationTypes),
        is_read: faker.helpers.maybe(() => true, { probability: 0.4 }),
        user_id: user.id,
        created_at: faker.date.recent()
      }
    });
  }

  console.log("✅ Notifications created!");
}

main();
