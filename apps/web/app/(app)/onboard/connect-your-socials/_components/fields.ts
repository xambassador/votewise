import type { TConnectYourSocials } from "@/app/(app)/onboard/_utils/schema";

type Keys = keyof TConnectYourSocials;
export const fields: { name: Keys; label: string; type: string; placeholder: string }[] = [
  { name: "location", label: "Location", type: "text", placeholder: "Where you leave John" },
  { name: "facebook", label: "Facebook", type: "text", placeholder: "Your facebook profile" },
  { name: "instagram", label: "Instagram", type: "text", placeholder: "Your instagram profile" },
  { name: "twitter", label: "Twitter", type: "text", placeholder: "Your twitter profile" }
];
