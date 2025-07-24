"use client";

import { useLayoutEffect as useReactLayoutEffect } from "react";

export const useLayoutEffect = globalThis?.document ? useReactLayoutEffect : () => {};
