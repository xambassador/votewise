"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { Millisecond, Minute, Second } from "@votewise/times";

type Props = { remainingTime: number; total: number };

export function useTimer(props: Props) {
  const { remainingTime, total } = props;
  const _timeString = dayjs()
    .startOf("day")
    .add(remainingTime / Minute, "minute")
    .format("m:ss");

  const [totalRemainingTime, setTotalRemainingTime] = useState(remainingTime);
  const [timeString, setTimeString] = useState(_timeString);
  const [progress, setProgress] = useState(100 - (remainingTime * 100) / total);

  useEffect(() => {
    const interval = setInterval(() => {
      const remainingTime = totalRemainingTime - Millisecond;
      const remainingMinutes = remainingTime / Minute;
      const str = dayjs().startOf("day").add(remainingMinutes, "minute").format("m:ss");
      const progress = 100 - (remainingTime * 100) / total;
      setTotalRemainingTime(remainingTime);
      setTimeString(str);
      setProgress(progress);
    }, Second);

    if (totalRemainingTime <= 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [total, totalRemainingTime]);

  return { timeString, progress, totalRemainingTime };
}
