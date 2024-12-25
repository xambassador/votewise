"use client";

import { useEffect } from "react";

import { makeToast } from "@votewise/ui/toast";

export function FlashMessage(props: { message: string; title: string; type: string }) {
  const { type = "success", message, title } = props;

  useEffect(() => {
    let cleanUp: () => void = () => {};
    if (type === "success") {
      cleanUp = makeToast.success(title, message);
    } else {
      cleanUp = makeToast.error(title, message);
    }

    fetch("/self/flash");
    return cleanUp;
  }, [message, title, type]);

  return null;
}
