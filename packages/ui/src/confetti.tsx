"use client";

import styles from "./confetti.module.css";

import { useEffect, useState } from "react";

import { cn } from "./cn";

type Props = {
  size?: number;
  x?: [number, number];
  y?: [number, number];
  duration?: number;
  infinite?: boolean;
  delay?: [number, number];
  colorRange?: [number, number];
  colorArray?: string[];
  amount?: number;
  iterationCount?: number;
  fallDistance?: number;
  rounded?: boolean;
  cone?: boolean;
  noGravity?: boolean;
  xSpread?: number;
  destroyOnComplete?: boolean;
  disableForReducedMotion?: boolean;
};

export function Confetti(props?: Props) {
  const {
    size = 10,
    x = [-0.5, 0.5],
    y = [0.25, 1],
    duration = 2000,
    infinite = false,
    delay = [0, 50],
    colorRange = [0, 360],
    colorArray = [],
    amount = 50,
    iterationCount = 1,
    fallDistance = "100px",
    rounded = false,
    cone = false,
    noGravity = false,
    xSpread = 0.15,
    destroyOnComplete = false,
    disableForReducedMotion = false
  } = props || {};

  const [isComplete, setIsComplete] = useState(false);

  function getColor() {
    if (colorArray.length) return colorArray[Math.round(Math.random() * (colorArray.length - 1))];
    else return `hsl(${Math.round(randomBetween(colorRange[0], colorRange[1]))}, 75%, 50%)`;
  }

  useEffect(() => {
    if (!destroyOnComplete || infinite || typeof iterationCount === "string") return;
    const id = setTimeout(
      () => {
        setIsComplete(true);
      },
      (duration + delay[1]) * iterationCount
    );

    // eslint-disable-next-line consistent-return
    return () => clearTimeout(id);
  }, [delay, destroyOnComplete, duration, infinite, iterationCount]);

  if (isComplete) return null;

  return (
    <div
      className={cn(
        styles.confettiHolder,
        rounded ? styles.rounded : "",
        cone ? styles.cone : "",
        noGravity ? styles.noGravity : "",
        disableForReducedMotion ? styles.disableForReducedMotion : ""
      )}
      style={{
        // @ts-expect-error - TS doesn't like custom properties
        "--fall-distance": fallDistance,
        "--size": `${size}px`,
        "--x-spread": 1 - xSpread,
        "--transition-iteration-count": infinite ? "infinite" : iterationCount
      }}
    >
      {Array.from({ length: amount }).map((_, i) => (
        <div
          className={styles.confetti}
          key={i}
          style={{
            // @ts-expect-error - TS doesn't like custom properties
            "--color": getColor(),
            "--skew": `${randomBetween(-45, 45)}deg, ${randomBetween(-45, 45)}deg`,
            "--rotation-xyz": `${randomBetween(-10, 10)}, ${randomBetween(-10, 10)}, ${randomBetween(-10, 10)}`,
            "--rotation-deg": `${randomBetween(0, 360)}deg`,
            "--translate-y-multiplier": `${randomBetween(y[0], y[1])}`,
            "--translate-x-multiplier": `${randomBetween(x[0], x[1])}`,
            "--scale": `${0.1 * randomBetween(2, 10)}`,
            "--transition-delay": `${randomBetween(delay[0], delay[1])}ms`,
            "--transition-duration": infinite ? `calc(${duration}ms * var(--scale))` : `${duration}ms`
          }}
        />
      ))}
    </div>
  );
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
