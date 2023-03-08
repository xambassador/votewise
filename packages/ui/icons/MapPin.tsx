import * as React from "react";

export function MapPin({ className = "", width = 20, height = 20, fill = "#6b7280" }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_42_1095)">
        <path
          d="M17.5 8.33337C17.5 14.1667 10 19.1667 10 19.1667C10 19.1667 2.5 14.1667 2.5 8.33337C2.5 6.34425 3.29018 4.4366 4.6967 3.03007C6.10322 1.62355 8.01088 0.833374 10 0.833374C11.9891 0.833374 13.8968 1.62355 15.3033 3.03007C16.7098 4.4366 17.5 6.34425 17.5 8.33337Z"
          stroke={fill}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 10.8334C11.3807 10.8334 12.5 9.71409 12.5 8.33337C12.5 6.95266 11.3807 5.83337 10 5.83337C8.61929 5.83337 7.5 6.95266 7.5 8.33337C7.5 9.71409 8.61929 10.8334 10 10.8334Z"
          stroke={fill}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_42_1095">
          <rect width={20} height={20} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
