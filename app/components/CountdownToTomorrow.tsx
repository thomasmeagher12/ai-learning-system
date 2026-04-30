"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const pad = (n: number) => String(n).padStart(2, "0");

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function timeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const total = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

export default function CountdownToTomorrow() {
  const router = useRouter();
  const [label, setLabel] = useState("--:--:--");
  const initialDayRef = useRef<string | null>(null);
  const refreshedRef = useRef(false);

  useEffect(() => {
    initialDayRef.current = dayKey(new Date());
    const tick = () => {
      const r = timeUntilMidnight();
      setLabel(`${pad(r.h)}:${pad(r.m)}:${pad(r.s)}`);
      if (
        !refreshedRef.current &&
        initialDayRef.current !== null &&
        dayKey(new Date()) !== initialDayRef.current
      ) {
        refreshedRef.current = true;
        router.refresh();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <p className="text-xs text-neutral-500 dark:text-neutral-400">
      Next session in{" "}
      <span className="font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
        {label}
      </span>
    </p>
  );
}
