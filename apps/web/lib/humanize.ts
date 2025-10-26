import type { MillifyOptions } from "millify/dist/options";

import { millify } from "millify";

export function humanizeNumber(num: number, opts?: Partial<MillifyOptions>): string {
  return millify(num, { precision: 1, ...opts });
}
