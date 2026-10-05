"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChapterMark } from "../components/chapter-mark";
import { createFrameSequence } from "../components/frame-sequence";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAME_COUNT = 337;
const POSTER_SRC = "/momento5/momento5-inicio.png";
// Los primeros 4 s van al doble de fotogramas: el mar, si no, salta entre olas.
const OPEN_FRAMES = 189;
const OPEN_TIME = 188 / 48;
const TOTAL_TIME = 242 / 24;

function framePosition(progress: number) {
  const t = Math.min(TOTAL_TIME, Math.max(0, progress * TOTAL_TIME));
  if (t <= OPEN_TIME) return (t / OPEN_TIME) * (OPEN_FRAMES - 1);
  const u = (t - OPEN_TIME) / (TOTAL_TIME - OPEN_TIME);
  return OPEN_FRAMES - 1 + u * (FRAME_COUNT - OPEN_FRAMES);
}

// Posiciones sobre el último plano (1024×576), en % de la imagen.
const CHIPS = [
  { id: "maiz", label: "Maíz", x: 14, y: 67 },
  { id: "terrazas", label: "Terrazas", x: 41, y: 76 },
  { id: "rio", label: "Río", x: 57, y: 60 },
  { id: "comunidades", label: "Comunidades", x: 88, y: 59 },
] as const;

function frameSrc(index: number) {
  return `/momento5/frames/frame_${String(index + 1).padStart(3, "0")}.jpg`;
}

export function Momento5() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const foreRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const canvas = canvasRef.current;
      const fore = foreRef.current;
      if (!section || !canvas || !fore) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const sequence = createFrameSequence({
        id: "momento5",
        section,
        canvases: [canvas, fore],
        frameCount: FRAME_COUNT,
        src: frameSrc,
        position: framePosition,
      });

      const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", section);
      gsap.set(beats, { autoAlpha: 0, y: 28 });
      gsap.set("[data-chip]", { autoAlpha: 0 });
      gsap.set("[data-chip-line]", { scaleY: 0 });

      if (reduced) {
        gsap.set("[data-scene]", { autoAlpha: 1 });
        gsap.set("[data-title='america']", { autoAlpha: 0 });
        gsap.set("[data-beat='antes']", { autoAlpha: 1, y: 0 });
        sequence.jumpTo(1);
        return () => sequence.destroy();
      }

      gsap.fromTo(
        "[data-title='america']",
        { "--fill": 0 },
        {
          "--fill": 1,
          ease: "power1.in",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "top -40%",
            scrub: true,
          },
        },
      );

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            const sticky = section.querySelector<HTMLElement>("[data-panel]");
            const pin =
              section.offsetHeight -
              (sticky?.offsetHeight ?? window.innerHeight);
            // Un tramo quieto sobre el plano de apertura, para que AMERICA se lea entero.
            const hold = pin > 0 ? (window.innerHeight * 0.85) / pin : 0;
            const scroll = self.progress;
            sequence.setTarget(
              scroll <= hold ? 0 : (scroll - hold) / (1 - hold),
            );
          },
        },
      });

      timeline
        .fromTo(
          "[data-title='america']",
          { y: 18 },
          { y: -28, duration: 3.2 },
          0,
        )
        .to("[data-title='america']", { autoAlpha: 0, duration: 0.85 }, 2.35)
        // el valle se despeja: se nombran sus partes, sin ilustrarlas
        .to("[data-chip]", { autoAlpha: 1, duration: 0.3, stagger: 0.18 }, 7.0)
        .to(
          "[data-chip-line]",
          { scaleY: 1, duration: 0.35, stagger: 0.18, ease: "power2.out" },
          7.0,
        )
        .to("[data-chip]", { autoAlpha: 0, duration: 0.35 }, 8.25)
        .fromTo(
          "[data-beat='antes']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.55 },
          8.6,
        )
        .to({}, { duration: 1.1 }, 9.15);

      return () => sequence.destroy();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="america"
      ref={sectionRef}
      aria-label="América ya tenía una historia"
      className="relative z-20 h-[860vh] bg-ink"
    >
      <div data-panel className="sticky top-0 h-dvh overflow-hidden">
        <div data-scene className="absolute inset-0">
          <img
            src={POSTER_SRC}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,14,8,0.22),rgba(20,14,8,0.04)_46%,rgba(20,14,8,0.42)_100%)]" />
          <p data-title="america" className="america-title">
            America
          </p>
          <canvas ref={foreRef} aria-hidden className="america-fore" />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 z-10 h-[max(100dvh,56.25vw)] w-[max(100vw,177.78dvh)] -translate-x-1/2 -translate-y-1/2"
        >
          {CHIPS.map((chip) => (
            <div
              key={chip.id}
              data-chip
              className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
              style={{ left: `${chip.x}%`, top: `${chip.y}%` }}
            >
              <span className="rounded-full border border-paper/30 bg-[rgba(14,10,6,0.5)] px-3 py-1.5 text-[0.62rem] font-medium tracking-[0.16em] text-cream uppercase backdrop-blur-sm">
                {chip.label}
              </span>
              <span
                data-chip-line
                className="block h-[min(9vh,4.5rem)] w-px origin-bottom bg-paper/70"
              />
              <span className="block size-1.5 rounded-full bg-gold-soft" />
            </div>
          ))}
        </div>

        <ChapterMark>Capítulo 10</ChapterMark>

        <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
          <p
            data-beat="antes"
            className="legible max-w-5xl text-center font-display text-[clamp(1.8rem,4vw,3.6rem)] leading-[1.08] tracking-[-0.02em] text-balance text-cream opacity-0"
          >
            Mucho antes de la llegada europea,
            <br />
            ya existían formas de vivir
            <br />
            <em>y adaptarse al territorio.</em>
          </p>
        </div>
      </div>
    </section>
  );
}
