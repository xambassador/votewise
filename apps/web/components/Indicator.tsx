import React from "react";

type IndicatorProps = {
  isSelected: boolean;
};
export function Indicator(props: IndicatorProps) {
  const { isSelected } = props;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="8" fill={isSelected ? "#51CF66" : "#6B7280"} />
      <circle cx="8" cy="8" r="3" fill="#F9FAFB" />
    </svg>
  );
}
