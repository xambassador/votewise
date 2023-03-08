import React from "react";

export function Home({ className = "", width = 24, height = 24, stroke = "#101010", fill = "#fff" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none" className={className}>
      <g stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" clipPath="url(#a)">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
        <path d="M9 22V12h6v10" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill={fill} d="M0 0h24v24H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}
