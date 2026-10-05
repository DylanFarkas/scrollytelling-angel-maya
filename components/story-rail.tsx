"use client";

import { useEffect, useRef } from "react";

function pageProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
}

export function StoryRail() {
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${pageProgress()})`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-45 h-0.5 lg:hidden">
      <span
        ref={barRef}
        className="block h-full origin-left bg-gold/80"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
