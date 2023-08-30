import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function classNames(...classes: unknown[]) {
  return twMerge(classes.filter(Boolean).join(" "));
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
