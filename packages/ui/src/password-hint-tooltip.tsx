"use client";

import { cn } from "./cn";
import { InforCircleSolid } from "./icons/info-circle-solid";
import { checkStrength } from "./password-strength";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const success = "✅";
const fail = "❌";

export type PasswordHintTooltipProps = {
  password: string;
  tooltipContentProps?: React.ComponentProps<typeof TooltipContent>;
} & Omit<React.ComponentProps<typeof Tooltip>, "children">;
export function PasswordHintTooltip(props: PasswordHintTooltipProps) {
  const { password, tooltipContentProps, ...rest } = props;

  const strength = checkStrength(password);

  return (
    <Tooltip {...rest}>
      <TooltipTrigger
        title="Password requirements"
        aria-label="Password requirements"
        className="focus-presets rounded-full"
      >
        <InforCircleSolid className="text-gray-400" />
      </TooltipTrigger>
      <TooltipContent
        {...tooltipContentProps}
        className={cn(
          "bg-nobelBlack-200 border border-nobelBlack-100 rounded p-4 shadow-lg",
          tooltipContentProps?.className
        )}
      >
        <h5 className="text-gray-400 mb-2 text-base">Password must have</h5>
        <ul className="text-gray-400 text-sm pl-3 flex flex-col gap-1">
          <li>{strength.hasLength ? success : fail} At least 8 characters</li>
          <li>{strength.hasLowerCase ? success : fail} At least 1 lowercase letter</li>
          <li>{strength.hasUpperCase ? success : fail} At least 1 uppercase letter</li>
          <li>{strength.hasNumber ? success : fail} At least 1 number</li>
          <li>{strength.hasSpecial ? success : fail} At least 1 special character</li>
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
