"use client";

import { Progress, ProgressBar, ProgressTrack } from "@votewise/ui/progress";

import { useTimer } from "../_hooks/use-timer";

type Props = { remainingTime: number; total: number };

export function Timer(props: Props) {
  const { progress, timeString, totalRemainingTime } = useTimer(props);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm flex-[0_0_40%]">Expires in {timeString} minutes</span>
        <Progress progress={progress}>
          <ProgressTrack />
          <ProgressBar />
        </Progress>
      </div>
      {totalRemainingTime <= 0 && <button className="text-blue-400 w-fit text-sm font-medium">Resend OTP</button>}
    </div>
  );
}
