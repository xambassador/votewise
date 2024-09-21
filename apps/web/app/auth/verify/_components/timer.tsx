"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { Milisecond, Minute } from "@votewise/times";
import { Progress, ProgressBar, ProgressTrack } from "@votewise/ui/progress";

type Props = { time: number };

export function Timer(props: Props) {
  const { time } = props;

  const str = dayjs()
    .startOf("day")
    .add(time / Minute, "minute")
    .format("m:ss");
  const [total, setTotal] = useState(time);
  const [timeString, setTimeString] = useState(str);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const _total = total - Milisecond;
      const remaining = _total / Minute;
      const str = dayjs().startOf("day").add(remaining, "minute").format("m:ss");
      const progress = 100 - (_total * 100) / time;
      setTotal(_total);
      setTimeString(str);
      setProgress(progress);
    }, 1000);

    if (total <= 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [time, total]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm flex-[0_0_40%]">Expires in {timeString} minutes</span>
        <Progress progress={progress}>
          <ProgressTrack />
          <ProgressBar />
        </Progress>
      </div>
      {total <= 0 && <button className="text-blue-400 w-fit text-sm font-medium">Resend OTP</button>}
    </div>
  );
}
