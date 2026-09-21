"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "visibilitychange"] as const;

/**
 * Banking-style inactivity guard. After `timeoutMs` without input the session ends; `warnMs` before that a
 * warning is raised with a live countdown. Uses wall-clock deadlines so background-tab timer throttling
 * cannot extend the session.
 */
export function useIdleTimeout({ timeoutMs, warnMs, onTimeout }: { timeoutMs: number; warnMs: number; onTimeout: () => void }) {
  const lastActivity = useRef(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => { onTimeoutRef.current = onTimeout; });

  const stay = useCallback(() => {
    lastActivity.current = Date.now();
    setSecondsLeft(null);
  }, []);

  useEffect(() => {
    lastActivity.current = Date.now();
    const touch = () => {
      // Once the warning is showing, only an explicit "continue" counts — stray mouse moves must not dismiss it.
      if (Date.now() - lastActivity.current < timeoutMs - warnMs) lastActivity.current = Date.now();
    };
    EVENTS.forEach((e) => window.addEventListener(e, touch, { passive: true }));

    const tick = setInterval(() => {
      const idle = Date.now() - lastActivity.current;
      if (idle >= timeoutMs) { clearInterval(tick); onTimeoutRef.current(); }
      else if (idle >= timeoutMs - warnMs) setSecondsLeft(Math.ceil((timeoutMs - idle) / 1000));
      else setSecondsLeft(null);
    }, 1000);

    return () => { EVENTS.forEach((e) => window.removeEventListener(e, touch)); clearInterval(tick); };
  }, [timeoutMs, warnMs]);

  return { secondsLeft, warning: secondsLeft !== null, stay };
}
