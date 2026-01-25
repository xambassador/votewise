/* eslint-disable no-console */

import type {
  Group,
  NewComment,
  NewFollow,
  NewGroup,
  NewGroupAggregates,
  NewGroupInvitation,
  NewGroupMember,
  NewHashTag,
  NewPost,
  NewPostAggregates,
  NewPostAsset,
  NewPostHashTag,
  NewPostTopic,
  NewTimeline,
  NewTopics,
  NewUpvote,
  NewUser,
  NewUserAggregates,
  NewUserInterests,
  Post,
  Topics,
  User
} from "./db/schema";

import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { config } from "dotenv";
import { sql } from "kysely";

import { dataLayer } from ".";

config();

const args = process.argv.slice(2);
const shouldClean = args.includes("--clean");

const SEED_CONFIG = {
  TOTAL_USERS: 150,
  USER_BATCH_SIZE: 50,
  TOTAL_POSTS: 800,
  POSTS_PER_PREDEFINED_USER: { min: 8, max: 15 },
  POSTS_PER_REGULAR_USER: { min: 0, max: 8 },
  POST_BATCH_SIZE: 100,
  TOTAL_GROUPS: 30,
  GROUP_MODERATORS: { min: 1, max: 3 },
  GROUP_MEMBERS_DISTRIBUTION: [
    { min: 10, max: 30, weight: 5 },
    { min: 30, max: 70, weight: 3 },
    { min: 70, max: 120, weight: 2 }
  ],
  FOLLOW_BASE: { min: 5, max: 20 },
  FOLLOW_INFLUENCER: { min: 30, max: 80 },
  INFLUENCER_PROBABILITY: 0.15,
  COMMENTS_DISTRIBUTION: [
    { value: 0, weight: 15 },
    { min: 1, max: 5, weight: 40 },
    { min: 6, max: 15, weight: 30 },
    { min: 16, max: 50, weight: 10 },
    { min: 51, max: 100, weight: 5 }
  ],
  REPLY_PROBABILITY: 0.35,
  REPLIES_PER_COMMENT: { min: 1, max: 4 },
  UPVOTES_DISTRIBUTION: [
    { min: 0, max: 10, weight: 30 },
    { min: 11, max: 50, weight: 35 },
    { min: 51, max: 150, weight: 20 },
    { min: 151, max: 400, weight: 10 },
    { min: 401, max: 800, weight: 5 }
  ],
  RECENT_POST_BOOST: 1.5,
  RECENT_DAYS: 7,
  TIMELINE_TRENDING_PROBABILITY: 0.08,
  USER_INTERESTS: { min: 2, max: 6 },
  POST_ASSET_PROBABILITY: 0.45,
  ASSETS_PER_POST: { min: 1, max: 3 },
  POST_DATE_RANGE_DAYS: 90,
  USER_CREATED_YEARS_AGO: 3,
  INVITATIONS_PER_GROUP: { min: 3, max: 12 },
  HASHTAGS_PER_POST: { min: 1, max: 4 }
} as const;

const UNSPLASH_IMAGES = {
  avatars: [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face"
  ],
  covers: [
    "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1557682260-96773eb01377?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1557682268-e3955ed5d83f?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&h=400&fit=crop"
  ],
  posts: [
    "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1682687221038-404cb8830901?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1682695797221-8164ff1fafc9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1682695794947-17061dc284dd?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1682695796954-bad0d0f59ff1?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1518173946687-a4c932f0c6c9?w=800&h=600&fit=crop"
  ],
  groupLogos: [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1614851099511-773084f6911d?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1614850523060-8d5a8e1bcf27?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop"
  ],
  groupCovers: [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=400&fit=crop"
  ]
};

function getRandomImage(category: keyof typeof UNSPLASH_IMAGES): string {
  const images = UNSPLASH_IMAGES[category];
  return images[Math.floor(Math.random() * images.length)];
}

const aloheAvatars = Array.from({ length: 147 }).map(
  (_, i) => `/votewise-bucket/votewise/assets/avatars/avatar_${i + 1}.png`
);

function getAvatarById(): string {
  const index = Math.floor(Math.random() * aloheAvatars.length);
  return aloheAvatars[index];
}

function weightedRandom<T>(options: Array<{ value?: T; min?: number; max?: number; weight: number }>): T | number {
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
  let random = Math.random() * totalWeight;

  for (const option of options) {
    random -= option.weight;
    if (random <= 0) {
      if (option.value !== undefined) return option.value;
      if (option.min !== undefined && option.max !== undefined) {
        return faker.number.int({ min: option.min, max: option.max });
      }
      return 0;
    }
  }

  const lastOption = options[options.length - 1];
  if (lastOption.value !== undefined) return lastOption.value;
  if (lastOption.min !== undefined && lastOption.max !== undefined) {
    return faker.number.int({ min: lastOption.min, max: lastOption.max });
  }
  return 0;
}

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 200);
  return `${base}-${createId().slice(0, 8)}`;
}

function randomDate(daysAgo: number, endDate = new Date()): Date {
  const start = new Date(endDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return faker.date.between({ from: start, to: endDate });
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

const defaultPassword = "$2a$12$WiBdk9VyfUbSb4Ys0ya9Y.3KwbEgDMjWaui9Bfs2pDlBiVdmF/r0u"; // Password@123

const awesomePeople = [
  {
    username: "jerry_bhai",
    firstName: "Jerry",
    lastName: "Bhai",
    email: "jerrybhai.tomandjerry@gmail.com",
    avatar: "/votewise-bucket/votewise/assets/avatars/avatar_jerry_bhai.jpeg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/tom_the_legend.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/doremon.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/tinku.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/ludo_bhai.jpeg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/munnabhai.png",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/babli_bhai.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/raju.webp",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/tiwari_seth.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/maru.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/majnu.avif",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/uday.jpeg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/papita.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/mithun_da.webp",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/chagan_lal.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/mikala_jaksun.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/champak.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/jetha_bhai.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/shishimaru.webp",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/kio.jpeg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/amara.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/kaliya.jpeg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/kaliya_ka_mama.jpeg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/dhooni_baba.jpeg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/kitchak.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/principle.jpeg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/babu_rao.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/shyam.png",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/bagha_boy.png",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/radhe_tiwari.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/lord_jack.gif",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/giyan.jpeg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/sinchan.jpeg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/kachara_seth.jpeg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/chotta_chatri.avif",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/drghungroo.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/vasooli_bhai.png",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/buriburizaemon.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/pythogorus_bhai.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/mommbati_joshi.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/ramesh.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/jhoney.jpeg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/spoidermon.png",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/ajay_devgan.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/babloo_blaster.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/jogindar.webp",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/barmunda_kumar.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/divakar.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/raju_dalal.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/mangal_singh.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/action_men.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/lucky_men.jpg",
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
    avatar: "/votewise-bucket/votewise/assets/avatars/hagemaru.jpg",
    background: "",
    about: "A kanjus kid in tokyo.",
    location: "Tokyo, Japan",
    gender: "MALE"
  }
];

const postTemplates = {
  Technology: [
    "Just deployed my new {tech} project. The performance improvements are insane! 🚀",
    "Hot take: {tech} is overrated. Change my mind.",
    "Finally figured out why my {tech} code was so slow. It was the {problem} all along!",
    "Who else is excited about the new {tech} release? The features look amazing!",
    "Spent 6 hours debugging only to find a missing semicolon. Classic.",
    "My VS Code setup is finally perfect. Until tomorrow when I change everything again.",
    "AI will replace developers they said. Meanwhile I just asked ChatGPT to fix my bug and it suggested deleting system32.",
    "The best thing about being a developer? The free therapy sessions disguised as rubber duck debugging."
  ],
  Gaming: [
    "Finally beat {game} on nightmare difficulty. My hands are still shaking!",
    "Hot take: {game} is the greatest game ever made and I will die on this hill.",
    "Looking for squad members for {game}. Must have sense of humor, mic optional.",
    "The ending of {game} has me questioning everything. No spoilers but WOW.",
    "Rage quit {game} for the 5th time today. See you tomorrow, {game}.",
    "My gaming setup vs my productivity. Perfectly balanced, as all things should be."
  ],
  Food: [
    "Made {dish} from scratch today. Gordon Ramsay would be proud... I think.",
    "Unpopular opinion: {dish} is better than {dish2}. Fight me in the comments.",
    "When the recipe says '30 minutes' but you've been cooking for 2 hours 💀",
    "Street food hits different at 2 AM. Just had the best {dish} of my life!",
    "Tried making {dish} at home. Nailed it! (Don't look at the kitchen though)",
    "Food is my love language. My fridge is my diary."
  ],
  Travel: [
    "Just landed in {place}! The views are absolutely breathtaking 🌅",
    "Lost in {place} but honestly, that's the best way to explore.",
    "Pro tip: Always try the local {dish} when visiting {place}. You won't regret it!",
    "Collected another stamp for the passport. {place} was incredible!",
    "That feeling when you're at the airport and the adventure is about to begin ✈️",
    "Met the kindest strangers in {place}. Humanity restored!"
  ],
  Fitness: [
    "PR day at the gym! Finally hit {weight}kg on {exercise}! 💪",
    "Rest day? Never heard of her. Just kidding, rest is crucial!",
    "Day {number} of my fitness journey. Progress is slow but steady.",
    "That post-workout feeling > everything else",
    "Gym playlist suggestions needed. Current one is getting stale.",
    "Cardio is just strength training for your heart. Change my mind."
  ],
  Entertainment: [
    "Just finished {show} and I need to talk about that ending! No spoilers but 😱",
    "Unpopular opinion: The book was better than the movie. Always.",
    "Looking for new {genre} recommendations. What's everyone watching?",
    "That scene in {show} had me ugly crying. No shame.",
    "Weekend plans: Binge watching {show}. Don't disturb unless it's about food.",
    "The soundtrack from {show} has been on repeat for days!"
  ],
  General: [
    "It's {day} and I've already peaked for the week.",
    "Plot twist: I was the main character all along.",
    "Current mood: Chaotically organized.",
    "They say follow your dreams but what if my dreams are weird?",
    "Life update: Still figuring it out. Will keep you posted.",
    "Hot take: Monday motivation is a myth created by morning people.",
    "New week, same me, different coffee order.",
    "Professional overthinker at your service."
  ]
};

function generatePostContent(topic: string): { title: string; content: string } {
  const templates = postTemplates[topic as keyof typeof postTemplates] || postTemplates.General;
  let template = faker.helpers.arrayElement(templates);

  const replacements: Record<string, () => string> = {
    "{tech}": () =>
      faker.helpers.arrayElement(["React", "Node.js", "TypeScript", "Python", "Rust", "Go", "Docker", "Kubernetes"]),
    "{game}": () => faker.helpers.arrayElement(["Elden Ring", "Zelda", "GTA VI", "Minecraft", "Valorant", "Fortnite"]),
    "{dish}": () => faker.helpers.arrayElement(["biryani", "pizza", "sushi", "tacos", "pasta", "ramen", "burger"]),
    "{dish2}": () => faker.helpers.arrayElement(["pizza", "burger", "sushi", "tacos"]),
    "{place}": () => faker.helpers.arrayElement(["Tokyo", "Paris", "Bali", "New York", "Dubai", "Mumbai", "London"]),
    "{show}": () =>
      faker.helpers.arrayElement(["Breaking Bad", "The Office", "Stranger Things", "Game of Thrones", "The Boys"]),
    "{genre}": () => faker.helpers.arrayElement(["thriller", "comedy", "sci-fi", "documentary", "anime"]),
    "{weight}": () => faker.number.int({ min: 50, max: 200 }).toString(),
    "{exercise}": () => faker.helpers.arrayElement(["bench press", "squat", "deadlift", "overhead press"]),
    "{number}": () => faker.number.int({ min: 30, max: 365 }).toString(),
    "{day}": () => faker.helpers.arrayElement(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
    "{problem}": () => faker.helpers.arrayElement(["cache", "memory leak", "async issue", "race condition"])
  };

  for (const [placeholder, generator] of Object.entries(replacements)) {
    template = template.replace(new RegExp(placeholder, "g"), generator);
  }

  return {
    title: template.slice(0, 50),
    content: template
  };
}

const commentTemplates = [
  "This is exactly what I needed to see today! 🙌",
  "Couldn't agree more! Great point.",
  "Wait, really? I had no idea!",
  "Lol, this is too relatable 😂",
  "Big if true",
  "Adding this to my saved posts!",
  "The comments here are gold 🏆",
  "Underrated post right here",
  "This deserves more upvotes",
  "Facts! No cap.",
  "W post 🔥",
  "Bro spitting facts",
  "Real ones know 💯",
  "This hit different",
  "Saving this for later",
  "Finally someone said it!",
  "The accuracy though 😭",
  "Based take",
  "I feel personally attacked by this post",
  "Screenshots don't lie 📸"
];

const replyTemplates = [
  "Exactly my thoughts!",
  "This ^",
  "Hard agree",
  "You're onto something here",
  "Valid point 👆",
  "The real truth is always in the comments",
  "Couldn't have said it better",
  "Fr fr",
  "No lies detected",
  "Spitting facts"
];

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
  "productivity",
  "mindset",
  "growth"
];

async function resetDatabase(): Promise<void> {
  console.log("Clearing database...");

  const tables = [
    "Timeline",
    "Upvote",
    "Comment",
    "PostAsset",
    "PostHashTag",
    "PostTopic",
    "PostAggregates",
    "Post",
    "GroupInvitation",
    "GroupMember",
    "GroupAggregates",
    "Group",
    "UserInterests",
    "Follow",
    "UserAggregates",
    "Notification",
    "RefreshToken",
    "Session",
    "Challenge",
    "Factor",
    "User",
    "HashTag",
    "Topics"
  ];

  for (const table of tables) {
    try {
      await sql`TRUNCATE TABLE ${sql.ref(table)} CASCADE`.execute(dataLayer);
    } catch {
      // --
    }
  }

  console.log("Database cleared!");
}

interface AggregateTracker {
  userPosts: Map<string, number>;
  userComments: Map<string, number>;
  userVotes: Map<string, number>;
  userFollowers: Map<string, number>;
  userFollowing: Map<string, number>;
  userGroups: Map<string, number>;
  postVotes: Map<string, number>;
  postComments: Map<string, number>;
  groupMembers: Map<string, number>;
  groupPosts: Map<string, number>;
  groupComments: Map<string, number>;
  groupVotes: Map<string, number>;
}

function createAggregateTracker(): AggregateTracker {
  return {
    userPosts: new Map(),
    userComments: new Map(),
    userVotes: new Map(),
    userFollowers: new Map(),
    userFollowing: new Map(),
    userGroups: new Map(),
    postVotes: new Map(),
    postComments: new Map(),
    groupMembers: new Map(),
    groupPosts: new Map(),
    groupComments: new Map(),
    groupVotes: new Map()
  };
}

async function seedTopics(): Promise<Topics[]> {
  console.log("Creating topics...");

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

  const now = new Date();
  const topicsData: NewTopics[] = topicNames.map((name) => ({
    id: createId(),
    name,
    is_system_topic: true,
    created_at: now,
    updated_at: now
  }));

  await dataLayer.insertInto("Topics").values(topicsData).execute();
  const topics = await dataLayer.selectFrom("Topics").selectAll().execute();

  console.log(`Created ${topics.length} topics`);
  return topics;
}

async function seedHashtags(): Promise<{ id: string; name: string }[]> {
  console.log("Creating hashtags...");

  const hashtagsData: NewHashTag[] = hashtagNames.map((name) => ({
    id: createId(),
    name,
    count: 0
  }));

  await dataLayer.insertInto("HashTag").values(hashtagsData).execute();
  const hashtags = await dataLayer.selectFrom("HashTag").select(["id", "name"]).execute();

  console.log(`Created ${hashtags.length} hashtags`);
  return hashtags;
}

async function seedUsers(tracker: AggregateTracker): Promise<User[]> {
  console.log("Creating users...");

  const users: NewUser[] = [];
  const usedEmails = new Set<string>();
  const usedUsernames = new Set<string>();
  const genders = ["MALE", "FEMALE", "OTHER"] as const;

  for (let i = 0; i < awesomePeople.length; i++) {
    const person = awesomePeople[i];
    usedEmails.add(person.email.toLowerCase());
    usedUsernames.add(person.username.toLowerCase());

    const createdAt = randomDate(SEED_CONFIG.USER_CREATED_YEARS_AGO * 365);
    const id = createId();

    tracker.userPosts.set(id, 0);
    tracker.userComments.set(id, 0);
    tracker.userVotes.set(id, 0);
    tracker.userFollowers.set(id, 0);
    tracker.userFollowing.set(id, 0);
    tracker.userGroups.set(id, 0);

    users.push({
      id,
      email: person.email,
      user_name: person.username,
      password: defaultPassword,
      first_name: person.firstName,
      last_name: person.lastName,
      secret: crypto.randomUUID(),
      about: person.about,
      twitter_profile_url: Math.random() > 0.4 ? `https://twitter.com/${person.username}` : null,
      facebook_profile_url: Math.random() > 0.5 ? `https://facebook.com/${person.username}` : null,
      instagram_profile_url: Math.random() > 0.3 ? `https://instagram.com/${person.username}` : null,
      github_profile_url: Math.random() > 0.6 ? `https://github.com/${person.username}` : null,
      avatar_url: person.avatar || getAvatarById(),
      cover_image_url: person.background || getRandomImage("covers"),
      location: person.location,
      gender: person.gender as "MALE" | "FEMALE" | "OTHER",
      last_login: faker.date.recent({ days: 30 }),
      is_onboarded: true,
      is_email_verify: true,
      email_confirmed_at: faker.date.past({ years: 1 }),
      email_confirmation_sent_at: null,
      banned_until: null,
      vote_bucket: 10,
      last_bucket_reset_at: null,
      created_at: createdAt,
      updated_at: createdAt
    });
  }

  const additionalUsersCount = SEED_CONFIG.TOTAL_USERS - awesomePeople.length;

  for (let i = 0; i < additionalUsersCount; i++) {
    let email: string;
    let username: string;
    let attempts = 0;

    do {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      email = faker.internet.email({ firstName, lastName }).toLowerCase();
      username =
        `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${faker.number.int({ min: 10, max: 999 })}`.slice(0, 20);
      attempts++;
    } while ((usedEmails.has(email) || usedUsernames.has(username)) && attempts < 100);

    if (attempts >= 100) continue;

    usedEmails.add(email);
    usedUsernames.add(username);

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const createdAt = randomDate(SEED_CONFIG.USER_CREATED_YEARS_AGO * 365);
    const isActive = Math.random() > 0.15;
    const id = createId();

    tracker.userPosts.set(id, 0);
    tracker.userComments.set(id, 0);
    tracker.userVotes.set(id, 0);
    tracker.userFollowers.set(id, 0);
    tracker.userFollowing.set(id, 0);
    tracker.userGroups.set(id, 0);

    users.push({
      id,
      email,
      user_name: username,
      password: defaultPassword,
      first_name: firstName.slice(0, 50),
      last_name: lastName.slice(0, 50),
      secret: crypto.randomUUID(),
      about: Math.random() > 0.3 ? faker.person.bio().slice(0, 256) : null,
      twitter_profile_url: Math.random() > 0.7 ? `https://twitter.com/${username}` : null,
      facebook_profile_url: Math.random() > 0.7 ? `https://facebook.com/${username}` : null,
      instagram_profile_url: Math.random() > 0.6 ? `https://instagram.com/${username}` : null,
      github_profile_url: Math.random() > 0.8 ? `https://github.com/${username}` : null,
      avatar_url: getAvatarById(),
      cover_image_url: Math.random() > 0.6 ? getRandomImage("covers") : null,
      location: Math.random() > 0.4 ? faker.location.city().slice(0, 100) : null,
      gender: faker.helpers.arrayElement(genders),
      last_login: isActive ? faker.date.recent({ days: 14 }) : null,
      is_onboarded: isActive,
      is_email_verify: Math.random() > 0.1,
      email_confirmed_at: Math.random() > 0.2 ? faker.date.past({ years: 1 }) : null,
      email_confirmation_sent_at: null,
      banned_until: null,
      vote_bucket: 10,
      last_bucket_reset_at: null,
      created_at: createdAt,
      updated_at: createdAt
    });
  }

  for (const chunk of chunkArray(users, SEED_CONFIG.USER_BATCH_SIZE)) {
    await dataLayer.insertInto("User").values(chunk).execute();
  }

  const allUsers = await dataLayer.selectFrom("User").selectAll().execute();
  console.log(`Created ${allUsers.length} users`);
  return allUsers;
}

async function seedUserInterests(users: User[], topics: Topics[]): Promise<void> {
  console.log("Creating user interests...");

  const interests: NewUserInterests[] = [];

  for (const user of users) {
    const numInterests = faker.number.int(SEED_CONFIG.USER_INTERESTS);
    const userTopics = faker.helpers.arrayElements(topics, numInterests);

    for (const topic of userTopics) {
      interests.push({
        user_id: user.id,
        topic_id: topic.id
      });
    }
  }

  for (const chunk of chunkArray(interests, 200)) {
    await dataLayer.insertInto("UserInterests").values(chunk).execute();
  }

  console.log(`Created ${interests.length} user interests`);
}

async function seedFollows(users: User[], tracker: AggregateTracker): Promise<void> {
  console.log("Creating follow relationships...");

  const follows: NewFollow[] = [];
  const existingFollows = new Set<string>();
  const predefinedUserIds = new Set(users.slice(0, awesomePeople.length).map((u) => u.id));

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const isPredefined = predefinedUserIds.has(user.id);
    const isInfluencer = isPredefined || Math.random() < SEED_CONFIG.INFLUENCER_PROBABILITY;

    const followConfig = isInfluencer ? SEED_CONFIG.FOLLOW_INFLUENCER : SEED_CONFIG.FOLLOW_BASE;
    const numToFollow = faker.number.int(followConfig);

    const potentialFollowees = users.filter((u) => u.id !== user.id);
    const followees = faker.helpers.arrayElements(potentialFollowees, Math.min(numToFollow, potentialFollowees.length));

    for (const followee of followees) {
      const key = `${user.id}-${followee.id}`;
      if (existingFollows.has(key)) continue;
      existingFollows.add(key);

      const now = new Date();
      follows.push({
        id: createId(),
        follower_id: user.id,
        following_id: followee.id,
        created_at: now
      });

      tracker.userFollowing.set(user.id, (tracker.userFollowing.get(user.id) || 0) + 1);
      tracker.userFollowers.set(followee.id, (tracker.userFollowers.get(followee.id) || 0) + 1);
    }
  }

  for (const chunk of chunkArray(follows, 200)) {
    await dataLayer.insertInto("Follow").values(chunk).execute();
  }

  console.log(`Created ${follows.length} follow relationships`);
}

async function seedGroups(tracker: AggregateTracker): Promise<Group[]> {
  console.log("Creating groups...");

  const groupPrefixes = ["Tech", "Gaming", "Fitness", "Foodies", "Travel", "Music", "Movies", "Books", "Art", "Biz"];
  const groups: NewGroup[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < SEED_CONFIG.TOTAL_GROUPS; i++) {
    const prefix = faker.helpers.arrayElement(groupPrefixes);
    let name: string;
    let attempts = 0;

    do {
      name = `${prefix}_${faker.word.noun()}_${faker.number.int({ min: 1, max: 99 })}`.slice(0, 21);
      attempts++;
    } while (usedNames.has(name.toLowerCase()) && attempts < 50);

    if (attempts >= 50) continue;
    usedNames.add(name.toLowerCase());

    const createdAt = randomDate(365 * 2);
    const id = createId();

    tracker.groupMembers.set(id, 0);
    tracker.groupPosts.set(id, 0);
    tracker.groupComments.set(id, 0);
    tracker.groupVotes.set(id, 0);

    groups.push({
      id,
      name,
      about: faker.lorem.paragraphs(2).slice(0, 500),
      cover_image_url: Math.random() > 0.3 ? getRandomImage("groupCovers") : null,
      logo_url: Math.random() > 0.2 ? getRandomImage("groupLogos") : null,
      type: Math.random() > 0.3 ? "PUBLIC" : "PRIVATE",
      status: faker.helpers.weightedArrayElement([
        { value: "OPEN" as const, weight: 8 },
        { value: "CLOSED" as const, weight: 1 },
        { value: "INACTIVE" as const, weight: 1 }
      ]),
      created_at: createdAt,
      updated_at: createdAt
    });
  }

  await dataLayer.insertInto("Group").values(groups).execute();
  const allGroups = await dataLayer.selectFrom("Group").selectAll().execute();

  console.log(`Created ${allGroups.length} groups`);
  return allGroups;
}

async function seedGroupMembers(
  users: User[],
  groups: Group[],
  tracker: AggregateTracker
): Promise<Map<string, Set<string>>> {
  console.log("Adding users to groups...");

  const members: NewGroupMember[] = [];
  const groupMemberSets = new Map<string, Set<string>>();

  for (const group of groups) {
    groupMemberSets.set(group.id, new Set());
  }

  for (const group of groups) {
    const memberSet = groupMemberSets.get(group.id)!;
    const now = new Date();

    const admin = faker.helpers.arrayElement(users);
    members.push({
      id: createId(),
      role: "ADMIN",
      joined_at: group.created_at,
      blocked: false,
      is_removed: false,
      user_id: admin.id,
      group_id: group.id,
      created_at: now
    });
    memberSet.add(admin.id);
    tracker.groupMembers.set(group.id, (tracker.groupMembers.get(group.id) || 0) + 1);
    tracker.userGroups.set(admin.id, (tracker.userGroups.get(admin.id) || 0) + 1);

    const modCount = faker.number.int(SEED_CONFIG.GROUP_MODERATORS);
    const potentialMods = users.filter((u) => !memberSet.has(u.id));
    const mods = faker.helpers.arrayElements(potentialMods, Math.min(modCount, potentialMods.length));

    for (const mod of mods) {
      members.push({
        id: createId(),
        role: "MODERATOR",
        joined_at: faker.date.between({ from: group.created_at, to: new Date() }),
        blocked: false,
        is_removed: false,
        user_id: mod.id,
        group_id: group.id,
        created_at: now
      });
      memberSet.add(mod.id);
      tracker.groupMembers.set(group.id, (tracker.groupMembers.get(group.id) || 0) + 1);
      tracker.userGroups.set(mod.id, (tracker.userGroups.get(mod.id) || 0) + 1);
    }

    const memberConfig = weightedRandom(
      SEED_CONFIG.GROUP_MEMBERS_DISTRIBUTION.map((d) => ({ ...d, value: undefined }))
    ) as number;
    const potentialMembers = users.filter((u) => !memberSet.has(u.id));
    const regularMembers = faker.helpers.arrayElements(
      potentialMembers,
      Math.min(memberConfig, potentialMembers.length)
    );

    for (const member of regularMembers) {
      members.push({
        id: createId(),
        role: "MEMBER",
        joined_at: faker.date.between({ from: group.created_at, to: new Date() }),
        blocked: Math.random() < 0.02,
        is_removed: false,
        user_id: member.id,
        group_id: group.id,
        created_at: now
      });
      memberSet.add(member.id);
      tracker.groupMembers.set(group.id, (tracker.groupMembers.get(group.id) || 0) + 1);
      tracker.userGroups.set(member.id, (tracker.userGroups.get(member.id) || 0) + 1);
    }
  }

  for (const chunk of chunkArray(members, 200)) {
    await dataLayer.insertInto("GroupMember").values(chunk).execute();
  }

  console.log(`Added ${members.length} group memberships`);
  return groupMemberSets;
}

async function seedGroupInvitations(
  users: User[],
  groups: Group[],
  groupMemberSets: Map<string, Set<string>>
): Promise<void> {
  console.log("Creating group invitations...");

  const invitations: NewGroupInvitation[] = [];

  for (const group of groups) {
    const memberSet = groupMemberSets.get(group.id)!;
    const nonMembers = users.filter((u) => !memberSet.has(u.id));

    const invCount = faker.number.int(SEED_CONFIG.INVITATIONS_PER_GROUP);
    const invitedUsers = faker.helpers.arrayElements(nonMembers, Math.min(invCount, nonMembers.length));

    for (const user of invitedUsers) {
      const now = new Date();
      invitations.push({
        id: createId(),
        type: faker.helpers.arrayElement(["JOIN", "INVITE"] as const),
        status: faker.helpers.weightedArrayElement([
          { value: "PENDING" as const, weight: 5 },
          { value: "ACCEPTED" as const, weight: 3 },
          { value: "REJECTED" as const, weight: 2 }
        ]),
        sent_at: faker.date.recent({ days: 30 }),
        group_id: group.id,
        user_id: user.id,
        created_at: now
      });
    }
  }

  for (const chunk of chunkArray(invitations, 200)) {
    await dataLayer.insertInto("GroupInvitation").values(chunk).execute();
  }

  console.log(`Created ${invitations.length} group invitations`);
}

async function seedPosts(
  users: User[],
  groups: Group[],
  topics: Topics[],
  hashtags: { id: string; name: string }[],
  groupMemberSets: Map<string, Set<string>>,
  tracker: AggregateTracker
): Promise<Post[]> {
  console.log("Creating posts...");

  const posts: NewPost[] = [];
  const postAggregates: NewPostAggregates[] = [];
  const postTopics: NewPostTopic[] = [];
  const postHashtags: NewPostHashTag[] = [];
  const postAssets: NewPostAsset[] = [];
  const usedSlugs = new Set<string>();

  const predefinedUsers = users.slice(0, awesomePeople.length);
  const regularUsers = users.slice(awesomePeople.length);

  const createPost = (author: User, group: Group | null, topic: Topics) => {
    const { title, content } = generatePostContent(topic.name);
    let slug: string;
    let attempts = 0;

    do {
      slug = generateSlug(title);
      attempts++;
    } while (usedSlugs.has(slug) && attempts < 50);

    if (attempts >= 50) return null;
    usedSlugs.add(slug);

    const postId = createId();
    const createdAt = randomDate(SEED_CONFIG.POST_DATE_RANGE_DAYS);

    const post: NewPost = {
      id: postId,
      title: title.slice(0, 50),
      content: content.slice(0, 300),
      slug,
      type: group ? "GROUP_ONLY" : "PUBLIC",
      status: faker.helpers.weightedArrayElement([
        { value: "OPEN" as const, weight: 85 },
        { value: "CLOSED" as const, weight: 10 },
        { value: "ARCHIVED" as const, weight: 5 }
      ]),
      group_id: group?.id || null,
      author_id: author.id,
      created_at: createdAt,
      updated_at: createdAt
    };

    tracker.userPosts.set(author.id, (tracker.userPosts.get(author.id) || 0) + 1);
    if (group) {
      tracker.groupPosts.set(group.id, (tracker.groupPosts.get(group.id) || 0) + 1);
    }

    tracker.postVotes.set(postId, 0);
    tracker.postComments.set(postId, 0);

    postAggregates.push({
      post_id: postId,
      votes: 0,
      comments: 0,
      views: faker.number.int({ min: 10, max: 2000 }),
      shares: faker.number.int({ min: 0, max: 50 })
    });

    postTopics.push({
      post_id: postId,
      topic_id: topic.id
    });

    const numHashtags = faker.number.int(SEED_CONFIG.HASHTAGS_PER_POST);
    const selectedHashtags = faker.helpers.arrayElements(hashtags, numHashtags);
    for (const hashtag of selectedHashtags) {
      postHashtags.push({
        id: createId(),
        post_id: postId,
        hash_tag_id: hashtag.id
      });
    }

    if (Math.random() < SEED_CONFIG.POST_ASSET_PROBABILITY) {
      const assetCount = faker.number.int(SEED_CONFIG.ASSETS_PER_POST);
      for (let i = 0; i < assetCount; i++) {
        postAssets.push({
          id: createId(),
          type: "image",
          url: getRandomImage("posts"),
          mime_type: faker.helpers.arrayElement(["image/jpeg", "image/png", "image/webp"]),
          size: faker.number.int({ min: 100000, max: 3000000 }),
          post_id: postId
        });
      }
    }

    return post;
  };

  for (const user of predefinedUsers) {
    const postCount = faker.number.int(SEED_CONFIG.POSTS_PER_PREDEFINED_USER);

    for (let i = 0; i < postCount; i++) {
      const topic = faker.helpers.arrayElement(topics);
      let group: Group | null = null;

      if (Math.random() < 0.3) {
        const userGroups = groups.filter((g) => groupMemberSets.get(g.id)?.has(user.id));
        if (userGroups.length > 0) {
          group = faker.helpers.arrayElement(userGroups);
        }
      }

      const post = createPost(user, group, topic);
      if (post) posts.push(post);
    }
  }

  for (const user of regularUsers) {
    const postCount = faker.number.int(SEED_CONFIG.POSTS_PER_REGULAR_USER);

    for (let i = 0; i < postCount; i++) {
      const topic = faker.helpers.arrayElement(topics);
      let group: Group | null = null;

      if (Math.random() < 0.2) {
        const userGroups = groups.filter((g) => groupMemberSets.get(g.id)?.has(user.id));
        if (userGroups.length > 0) {
          group = faker.helpers.arrayElement(userGroups);
        }
      }

      const post = createPost(user, group, topic);
      if (post) posts.push(post);
    }
  }

  while (posts.length < SEED_CONFIG.TOTAL_POSTS) {
    const user = faker.helpers.arrayElement(users);
    const topic = faker.helpers.arrayElement(topics);
    const post = createPost(user, null, topic);
    if (post) posts.push(post);
  }

  for (const chunk of chunkArray(posts, SEED_CONFIG.POST_BATCH_SIZE)) {
    await dataLayer.insertInto("Post").values(chunk).execute();
  }

  for (const chunk of chunkArray(postAggregates, 200)) {
    await dataLayer.insertInto("PostAggregates").values(chunk).execute();
  }

  for (const chunk of chunkArray(postTopics, 200)) {
    await dataLayer.insertInto("PostTopic").values(chunk).execute();
  }

  if (postHashtags.length > 0) {
    for (const chunk of chunkArray(postHashtags, 200)) {
      await dataLayer.insertInto("PostHashTag").values(chunk).execute();
    }
  }

  if (postAssets.length > 0) {
    for (const chunk of chunkArray(postAssets, 200)) {
      await dataLayer.insertInto("PostAsset").values(chunk).execute();
    }
  }

  const allPosts = await dataLayer.selectFrom("Post").selectAll().execute();
  console.log(`Created ${allPosts.length} posts with ${postAssets.length} assets`);

  return allPosts;
}

async function seedComments(users: User[], posts: Post[], tracker: AggregateTracker): Promise<void> {
  console.log("Creating comments...");

  const comments: NewComment[] = [];

  for (const post of posts) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const commentCount = weightedRandom(SEED_CONFIG.COMMENTS_DISTRIBUTION) as number;

    for (let i = 0; i < commentCount; i++) {
      const commenter = faker.helpers.arrayElement(users);
      const commentId = createId();
      const commentCreatedAt = faker.date.between({ from: post.created_at, to: new Date() });

      comments.push({
        id: commentId,
        text: faker.helpers.arrayElement(commentTemplates),
        parent_id: null,
        appreciated: Math.random() < 0.1,
        post_id: post.id,
        user_id: commenter.id,
        created_at: commentCreatedAt,
        updated_at: commentCreatedAt
      });

      tracker.postComments.set(post.id, (tracker.postComments.get(post.id) || 0) + 1);
      tracker.userComments.set(commenter.id, (tracker.userComments.get(commenter.id) || 0) + 1);

      if (post.group_id) {
        tracker.groupComments.set(post.group_id, (tracker.groupComments.get(post.group_id) || 0) + 1);
      }

      if (Math.random() < SEED_CONFIG.REPLY_PROBABILITY) {
        const replyCount = faker.number.int(SEED_CONFIG.REPLIES_PER_COMMENT);

        for (let j = 0; j < replyCount; j++) {
          const replier = faker.helpers.arrayElement(users);
          const replyCreatedAt = faker.date.between({ from: commentCreatedAt, to: new Date() });

          comments.push({
            id: createId(),
            text: faker.helpers.arrayElement(replyTemplates),
            parent_id: commentId,
            appreciated: Math.random() < 0.05,
            post_id: post.id,
            user_id: replier.id,
            created_at: replyCreatedAt,
            updated_at: replyCreatedAt
          });

          tracker.postComments.set(post.id, (tracker.postComments.get(post.id) || 0) + 1);
          tracker.userComments.set(replier.id, (tracker.userComments.get(replier.id) || 0) + 1);

          if (post.group_id) {
            tracker.groupComments.set(post.group_id, (tracker.groupComments.get(post.group_id) || 0) + 1);
          }
        }
      }
    }
  }

  for (const chunk of chunkArray(comments, 200)) {
    await dataLayer.insertInto("Comment").values(chunk).execute();
  }

  console.log(`Created ${comments.length} comments`);
}

async function seedUpvotes(users: User[], posts: Post[], tracker: AggregateTracker): Promise<void> {
  console.log("Creating upvotes...");

  const upvotes: NewUpvote[] = [];
  const existingUpvotes = new Set<string>();

  for (const post of posts) {
    const postAge = Date.now() - post.created_at.getTime();
    const isRecent = postAge < SEED_CONFIG.RECENT_DAYS * 24 * 60 * 60 * 1000;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    let baseUpvotes = weightedRandom(SEED_CONFIG.UPVOTES_DISTRIBUTION) as number;
    if (isRecent) {
      baseUpvotes = Math.floor(baseUpvotes * SEED_CONFIG.RECENT_POST_BOOST);
    }

    const upvoterCount = Math.min(baseUpvotes, users.length);
    const upvoters = faker.helpers.arrayElements(users, upvoterCount);

    for (const upvoter of upvoters) {
      const key = `${post.id}-${upvoter.id}`;
      if (existingUpvotes.has(key)) continue;
      existingUpvotes.add(key);

      const upvoteCreatedAt = faker.date.between({ from: post.created_at, to: new Date() });

      upvotes.push({
        post_id: post.id,
        user_id: upvoter.id,
        created_at: upvoteCreatedAt
      });

      tracker.postVotes.set(post.id, (tracker.postVotes.get(post.id) || 0) + 1);
      tracker.userVotes.set(upvoter.id, (tracker.userVotes.get(upvoter.id) || 0) + 1);

      if (post.group_id) {
        tracker.groupVotes.set(post.group_id, (tracker.groupVotes.get(post.group_id) || 0) + 1);
      }
    }
  }

  for (const chunk of chunkArray(upvotes, 500)) {
    await dataLayer.insertInto("Upvote").values(chunk).execute();
  }

  console.log(`Created ${upvotes.length} upvotes`);
}

async function seedTimeline(users: User[], posts: Post[]): Promise<void> {
  console.log("Creating timeline entries...");

  const timelines: NewTimeline[] = [];
  const existingEntries = new Set<string>();

  const follows = await dataLayer.selectFrom("Follow").selectAll().execute();
  const userFollowing = new Map<string, Set<string>>();

  for (const follow of follows) {
    if (!userFollowing.has(follow.follower_id)) {
      userFollowing.set(follow.follower_id, new Set());
    }
    userFollowing.get(follow.follower_id)!.add(follow.following_id);
  }

  const memberships = await dataLayer.selectFrom("GroupMember").selectAll().execute();
  const userGroups = new Map<string, Set<string>>();

  for (const membership of memberships) {
    if (!userGroups.has(membership.user_id)) {
      userGroups.set(membership.user_id, new Set());
    }
    userGroups.get(membership.user_id)!.add(membership.group_id);
  }

  for (const user of users) {
    const following = userFollowing.get(user.id) || new Set();
    const groups = userGroups.get(user.id) || new Set();

    for (const post of posts) {
      if (post.author_id === user.id) continue;

      const key = `${user.id}-${post.id}`;
      if (existingEntries.has(key)) continue;

      let shouldAdd = false;

      if (following.has(post.author_id)) shouldAdd = true;
      if (post.group_id && groups.has(post.group_id)) shouldAdd = true;
      if (!shouldAdd && post.type === "PUBLIC" && Math.random() < SEED_CONFIG.TIMELINE_TRENDING_PROBABILITY) {
        shouldAdd = true;
      }

      if (shouldAdd) {
        existingEntries.add(key);
        timelines.push({
          user_id: user.id,
          post_id: post.id,
          created_at: post.created_at
        });
      }
    }
  }

  for (const chunk of chunkArray(timelines, 500)) {
    await dataLayer.insertInto("Timeline").values(chunk).execute();
  }

  console.log(`Created ${timelines.length} timeline entries`);
}

async function updateAllAggregates(
  users: User[],
  posts: Post[],
  groups: Group[],
  tracker: AggregateTracker
): Promise<void> {
  console.log("Creating user aggregates...");
  const userAggregates: NewUserAggregates[] = users.map((user) => ({
    user_id: user.id,
    total_posts: tracker.userPosts.get(user.id) || 0,
    total_comments: tracker.userComments.get(user.id) || 0,
    total_votes: tracker.userVotes.get(user.id) || 0,
    total_followers: tracker.userFollowers.get(user.id) || 0,
    total_following: tracker.userFollowing.get(user.id) || 0,
    total_groups: tracker.userGroups.get(user.id) || 0
  }));

  for (const chunk of chunkArray(userAggregates, 100)) {
    await dataLayer.insertInto("UserAggregates").values(chunk).execute();
  }

  const groupAggregates: NewGroupAggregates[] = groups.map((group) => ({
    group_id: group.id,
    total_members: tracker.groupMembers.get(group.id) || 0,
    total_posts: tracker.groupPosts.get(group.id) || 0,
    total_comments: tracker.groupComments.get(group.id) || 0,
    total_votes: tracker.groupVotes.get(group.id) || 0
  }));

  await dataLayer.insertInto("GroupAggregates").values(groupAggregates).execute();

  console.log("Updating post aggregates...");
  for (const post of posts) {
    await dataLayer
      .updateTable("PostAggregates")
      .set({
        votes: tracker.postVotes.get(post.id) || 0,
        comments: tracker.postComments.get(post.id) || 0
      })
      .where("post_id", "=", post.id)
      .execute();
  }

  const hashtagCounts = await dataLayer
    .selectFrom("PostHashTag")
    .select(["hash_tag_id"])
    .select((eb) => eb.fn.count("hash_tag_id").as("count"))
    .groupBy("hash_tag_id")
    .execute();

  for (const { hash_tag_id, count } of hashtagCounts) {
    await dataLayer
      .updateTable("HashTag")
      .set({ count: Number(count) })
      .where("id", "=", hash_tag_id)
      .execute();
  }
}

async function main(): Promise<void> {
  console.log("Seeding...");

  if (shouldClean) {
    await resetDatabase();
    console.log("\nDatabase cleaned successfully!");
    process.exit(0);
  }

  const startTime = Date.now();
  const tracker = createAggregateTracker();

  try {
    await resetDatabase();

    const topics = await seedTopics();
    const hashtags = await seedHashtags();
    const users = await seedUsers(tracker);
    await seedUserInterests(users, topics);
    await seedFollows(users, tracker);

    const groups = await seedGroups(tracker);
    const groupMemberSets = await seedGroupMembers(users, groups, tracker);
    await seedGroupInvitations(users, groups, groupMemberSets);

    const posts = await seedPosts(users, groups, topics, hashtags, groupMemberSets, tracker);
    await seedComments(users, posts, tracker);
    await seedUpvotes(users, posts, tracker);
    await seedTimeline(users, posts);

    await updateAllAggregates(users, posts, groups, tracker);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("Seeding completed successfully!");
    console.log(`Users: ${users.length}`);
    console.log(`Posts: ${posts.length}`);
    console.log(`Groups: ${groups.length}`);
    console.log(`Topics: ${topics.length}`);
    console.log(`Hashtags: ${hashtags.length}`);
    console.log(`Duration: ${duration}s`);
    console.log();
    console.log("Default login credentials:");
    console.log("Email: Any predefined user email");
    console.log("Password: Password@123");
  } catch (error) {
    console.error("\nSeeding failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
