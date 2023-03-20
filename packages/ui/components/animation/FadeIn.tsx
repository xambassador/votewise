import { motion } from "framer-motion";

import React from "react";

type Props = React.ComponentProps<typeof motion.div>;

export function FadeIn(props: Props) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} {...props} />
  );
}
