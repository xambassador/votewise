import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function classnames(cfg: { inputs: ClassValue[]; disableMerge?: boolean }) {
  const { disableMerge = false } = cfg;
  if (disableMerge) {
    return clsx(cfg.inputs);
  }
  return twMerge(clsx(cfg.inputs));
}
