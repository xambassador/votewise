/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Calls all functions in the order they were chained with the same arguments.
 * @example
 * const a = (x: number) => console.log(x + 1);
 * const b = (x: number) => console.log(x + 2);
 * const c = (x: number) => console.log(x + 3);
 * const d = chain(a, b, c);
 * d(1); // 2, 3, 4
 *
 * @param callbacks The functions to call.
 */
export function chain(...callbacks: any[]): (...args: any[]) => void {
  return (...args: any[]) => {
    for (const callback of callbacks) {
      if (typeof callback === "function") {
        callback(...args);
      }
    }
  };
}
