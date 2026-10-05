"use client";

import { useEffect, useState } from "react";
import { SECTIONS, currentSectionIndex, scrollToSection } from "../lib/sections";

export function NextMoment() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setIndex(currentSectionIndex());
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

  const next = SECTIONS[index + 1];
  const hidden = !next;

  return (
    <a
      href={next?.hash ?? "#cierre"}
      aria-label={next ? `Saltar a: ${next.label}` : undefined}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      onClick={(event) => {
        if (next && scrollToSection(next.hash)) event.preventDefault();
      }}
      className={`group fixed right-5 bottom-5 z-40 flex items-center gap-3 transition-opacity duration-500 sm:right-6 sm:bottom-6 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <span className="eyebrow hidden text-right text-[0.6rem] leading-normal text-paper/70 [text-shadow:0_1px_10px_rgb(0_0_0/0.6)] sm:block">
        <span className="block text-paper/45">Siguiente</span>
        <span className="block text-cream transition-colors group-hover:text-gold-soft">
          {next?.label}
        </span>
      </span>
      <span className="grid size-11 place-items-center rounded-full bg-gold text-ink shadow-[0_8px_24px_-8px_rgba(0,0,0,0.7)] transition-transform duration-500 ease-out-expo group-hover:translate-y-0.5 group-hover:scale-105">
        <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
          <path
            d="M8 2.5v11M3.5 9 8 13.5 12.5 9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  );
}
