"use client";

import { useEffect, useRef } from "react";

import { makeToast } from "@votewise/ui/toast";

export function FlashMessage(props: { message: string; title: string; type: string }) {
  const { type = "success", message, title } = props;
  const isRunning = useRef(false);

  useEffect(() => {
    let cleanUp: () => void = () => {};
    if (!isRunning.current) {
      if (type === "success") {
        cleanUp = makeToast.success(title, message);
      } else {
        cleanUp = makeToast.error(title, message);
      }
      fetch("/self/flash");
      isRunning.current = true;
    }
    return cleanUp;
  }, [message, title, type]);

  return null;
}
