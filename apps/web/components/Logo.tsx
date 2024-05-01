import React from "react";
import Image from "next/image";

export function Logo({ width = 202, height = 16 }) {
  return (
    <figure>
      <Image src="/logo.png" alt="Logo" width={width} height={height} />
    </figure>
  );
}
