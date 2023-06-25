import React from "react";

type IndicatorProps = {
  isSelected: boolean;
  selectionColor?: string;
  unselectedColor?: string;
  color?: string;
};
export function Indicator(props: IndicatorProps) {
  const { isSelected, selectionColor = "#51CF66", unselectedColor = "#6B7280", color = "#F9FAFB" } = props;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="8" fill={isSelected ? selectionColor : unselectedColor} />
      <circle cx="8" cy="8" r="3" fill={color} />
    </svg>
  );
}
