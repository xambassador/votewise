import type { TConnectYourSocials } from "@/app/onboard/_utils/schema";

type Keys = keyof TConnectYourSocials;
export const fields: (data: { name?: string }) => { name: Keys; label: string; type: string; placeholder: string }[] = (
  data
) => [
  {
    name: "location",
    label: "Location",
    type: "text",
    placeholder: data.name ? `Where you leave ${data.name}` : "Where you leave"
  },
  { name: "facebook", label: "Facebook", type: "text", placeholder: "Your facebook profile" },
  { name: "instagram", label: "Instagram", type: "text", placeholder: "Your instagram profile" },
  { name: "twitter", label: "Twitter", type: "text", placeholder: "Your twitter profile" }
];
