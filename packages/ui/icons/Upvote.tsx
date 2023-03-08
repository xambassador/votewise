import * as React from "react";

export function Upvote({ className = "", width = 20, height = 20, fill = "#6b7280" }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M14 12L10 8L6 12" stroke={fill} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={0.5} y={0.5} width={19} height={19} rx={3.5} stroke="#D1D5DB" />
    </svg>
  );
}
