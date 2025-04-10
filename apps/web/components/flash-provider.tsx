import type { PropsWithChildren } from "react";

import { Fragment } from "react";

import { getFlashMessage } from "@/lib/cookie";

import { FlashMessage } from "./flash";

export function FlashProvider(props: PropsWithChildren) {
  const flash = getFlashMessage();
  return (
    <Fragment>
      {flash && <FlashMessage {...flash} />}
      {props.children}
    </Fragment>
  );
}
