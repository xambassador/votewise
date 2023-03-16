import React from "react";
import { Toaster } from "react-hot-toast";

type Props = React.ComponentProps<typeof Toaster>;

export function Toast(props: Props) {
  return <Toaster {...props} />;
}
