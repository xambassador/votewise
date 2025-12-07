"use client";

import { Progress, ProgressBar, ProgressTrack } from "@votewise/ui/progress";

import { useTimer } from "../_hooks/use-timer";

type Props = { remainingTime: number; total: number };

export function Timer(props: Props) {
  const { progress, timeString, totalRemainingTime } = useTimer(props);
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-3 justify-between sm:justify-start">
        <span className="text-gray-400 text-xs sm:text-sm sm:flex-[0_0_40%]">Expires in {timeString} minutes</span>
        <Progress progress={progress}>
          <ProgressTrack />
          <ProgressBar />
        </Progress>
      </div>
      {totalRemainingTime <= 0 && <button className="text-blue-400 w-fit text-sm font-medium">Resend OTP</button>}
    </div>
  );
}
