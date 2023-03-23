import { useAutoAnimate } from "@formkit/auto-animate/react";
import React from "react";

type ListProps = React.HtmlHTMLAttributes<HTMLUListElement>;

export function AnimatedList(props: ListProps) {
  const [animationParent] = useAutoAnimate({
    easing: "ease-in-out",
    duration: 200,
  });

  return <ul ref={animationParent} {...props} />;
}
