import type { Transition } from "framer-motion";
import { motion } from "framer-motion";

// -----------------------------------------------------------------------------------------
import React from "react";
import type { ReactNode } from "react";
import useMeasure from "react-use-measure";

// -----------------------------------------------------------------------------------------

export function ResizablePanel({
  children,
  transition = { type: "spring", bounce: 0.2, duration: 0.8 },
}: {
  children: ReactNode;
  transition?: Transition;
}) {
  const [ref, { height }] = useMeasure();
  return (
    <motion.div animate={{ height }} transition={transition}>
      <div ref={ref}>{children}</div>
    </motion.div>
  );
}
