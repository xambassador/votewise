"use client";

import { cn } from "./cn";
import { createContext } from "./context";

type Props = { progress: number; pWidth?: number };

const [ProgressCtx, useProgress] = createContext<Props & { cx: number; cy: number; radius: number }>("Progress");

type ProgressProps = React.SVGProps<SVGSVGElement> & Props;
export function Progress(props: ProgressProps) {
  const { progress, pWidth = 200, ...rest } = props;

  const cx = pWidth / 2;
  const cy = pWidth / 2;
  const r = pWidth / 2 - 20;

  return (
    <ProgressCtx progress={progress} cx={cx} cy={cy} radius={r}>
      <svg
        {...rest}
        className={cn("-rotate-90 size-10", rest.className)}
        x="0px"
        y="0px"
        width={`${pWidth}px`}
        height={`${pWidth}px`}
        viewBox={`0 0 ${pWidth} ${pWidth}`}
      />
    </ProgressCtx>
  );
}

type ProgressTrackProps = React.SVGProps<SVGCircleElement>;
export function ProgressTrack(props: ProgressTrackProps) {
  const { cx, cy, radius } = useProgress("ProgressTrack");
  return (
    <circle
      {...props}
      className={cn("text-nobelBlack-200", props.className)}
      fill="none"
      strokeWidth="5"
      cx={cx}
      cy={cy}
      r={radius}
      stroke="currentColor"
    />
  );
}

type ProgressBarProps = React.SVGProps<SVGCircleElement>;
export function ProgressBar(props: ProgressBarProps) {
  const { progress, cx, cy, radius } = useProgress("ProgressBar");
  const len = 2 * Math.PI * 80;
  const strokeDashArray = len;
  const strokeDashOffset = len - (progress / 100) * len;
  return (
    <circle
      {...props}
      className={cn("text-blue-700", props.className)}
      stroke="currentColor"
      fill="none"
      strokeWidth="8"
      strokeLinecap="round"
      cx={cx}
      cy={cy}
      r={radius}
      style={{
        strokeDashoffset: strokeDashOffset,
        strokeDasharray: strokeDashArray,
        transition: "stroke-dashoffset 0.3s ease-in-out",
        ...props.style
      }}
    />
  );
}
