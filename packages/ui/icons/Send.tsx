import * as React from "react";

export function Sent({ className = "", width = 20, height = 20, fill = "#6b7280" }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_42_1121)">
        <path
          d="M18.3334 1.66663L9.16675 10.8333"
          stroke={fill}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.3334 1.66663L12.5001 18.3333L9.16675 10.8333L1.66675 7.49996L18.3334 1.66663Z"
          stroke={fill}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_42_1121">
          <rect width={20} height={20} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
