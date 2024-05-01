import React from "react";
import { motion } from "framer-motion";

type Props = React.ComponentProps<typeof motion.div>;

export function FadeIn(props: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ opacity: { duration: 0.2 } }}
      {...props}
    />
  );
}
