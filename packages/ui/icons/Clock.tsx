import * as React from "react";

export function Clock({ className = "", width = 20, height = 20, fill = "#6b7280" }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_42_1100)">
        <path
          d="M10.0001 18.3333C14.6025 18.3333 18.3334 14.6023 18.3334 9.99996C18.3334 5.39759 14.6025 1.66663 10.0001 1.66663C5.39771 1.66663 1.66675 5.39759 1.66675 9.99996C1.66675 14.6023 5.39771 18.3333 10.0001 18.3333Z"
          stroke={fill}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 5V10L13.3333 11.6667"
          stroke={fill}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_42_1100">
          <rect width={20} height={20} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
