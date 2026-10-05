"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SECTIONS, currentSectionIndex } from "../lib/sections";

function pastStory() {
  const last = document.querySelector<HTMLElement>(SECTIONS[SECTIONS.length - 1].hash);
  return !!last && last.getBoundingClientRect().bottom < window.innerHeight * 0.5;
}

export function MomentNote() {
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setIndex(currentSectionIndex());
      setHidden(pastStory());
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

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const section = SECTIONS[index];
  const { note } = section;
  const expanded = open && !hidden;

  return (
    <div
      ref={rootRef}
      aria-hidden={hidden || undefined}
      className={`fixed right-5 bottom-19 z-40 transition-opacity duration-500 sm:right-auto sm:bottom-6 sm:left-6 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <section
        id={panelId}
        aria-label={`Sobre este momento: ${section.label}`}
        inert={!expanded}
        className={`absolute right-0 bottom-full mb-3 w-[min(22.5rem,calc(100vw-2.5rem))] origin-bottom-right rounded-2xl border border-white/10 bg-[#0A0A0A] px-5 pt-4 pb-5 text-white shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)] transition-[opacity,translate,scale] duration-500 ease-out-expo motion-reduce:transition-none sm:right-auto sm:left-0 sm:origin-bottom-left ${
          expanded ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-2 scale-[0.97] opacity-0"
        }`}
      >
        <div key={section.hash} className="note-swap">
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow text-[0.62rem] text-white/55">
              {note.chapter}
              <span aria-hidden className="text-gold"> · </span>
              {note.pages}
            </p>
            {section.num !== "—" && (
              <span className="type-menu-num text-[0.8rem] text-white/40">{section.num}</span>
            )}
          </div>
          <h2 className="mt-3 mb-0 font-sans text-[1.02rem] leading-snug font-bold tracking-[-0.02em] text-white">
            {note.title}
          </h2>
          <p className="m-0 mt-2 text-[0.86rem] leading-[1.55] text-pretty text-white short:text-[0.8rem] short:leading-normal">
            {note.text}
          </p>
        </div>
      </section>

      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        tabIndex={hidden ? -1 : undefined}
        onClick={() => setOpen((value) => !value)}
        className="group flex cursor-pointer appearance-none items-center gap-3 border-0 bg-transparent p-0 text-left"
      >
        <span className="grid size-11 place-items-center rounded-full border border-gold/55 bg-black/30 text-gold-soft shadow-[0_8px_24px_-8px_rgba(0,0,0,0.7)] backdrop-blur-md transition-[background-color,border-color,scale] duration-500 ease-out-expo group-hover:scale-105 group-hover:border-gold">
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            aria-hidden="true"
            className={`transition-transform duration-500 ease-out-expo ${expanded ? "rotate-45" : ""}`}
          >
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <span className="eyebrow hidden text-[0.6rem] leading-normal text-paper/70 [text-shadow:0_1px_10px_rgb(0_0_0/0.6)] sm:block">
          <span className="block text-paper/45">{expanded ? "Cerrar" : "Qué estás viendo"}</span>
          <span key={section.hash} className="note-swap block text-cream transition-colors group-hover:text-gold-soft">
            {section.label}
          </span>
        </span>
        <span className="sr-only sm:hidden">Qué estás viendo: {section.label}</span>
      </button>
    </div>
  );
}
