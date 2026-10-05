"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChapterMark } from "../components/chapter-mark";
import { createFrameSequence } from "../components/frame-sequence";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAME_COUNT = 192;
const POSTER_SRC = "/momento4/momento4-inicio.png";

// El cruce entre costas es el tramo largo del video. El 5 no puede comérselo.
const SHIP_AT = 129 / (FRAME_COUNT - 1);
const SHIP_SCROLL = 0.48;

function videoProgress(play: number) {
  if (play <= SHIP_SCROLL) return (play / SHIP_SCROLL) * SHIP_AT;
  return (
    SHIP_AT +
    ((play - SHIP_SCROLL) / (1 - SHIP_SCROLL)) * (1 - SHIP_AT)
  );
}

const LABELS = [
  { id: "cereal", text: "Tierras de cereal" },
  { id: "metales", text: "Metales" },
  { id: "america", text: "América" },
] as const;

function frameSrc(index: number) {
  return `/momento4/frames/frame_${String(index + 1).padStart(3, "0")}.jpg`;
}

export function Momento4() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const canvas = canvasRef.current;
      if (!section || !canvas) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const sequence = createFrameSequence({
        id: "momento4",
        section,
        canvases: [canvas],
        frameCount: FRAME_COUNT,
        src: frameSrc,
      });

      const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", section);
      gsap.set(beats, { autoAlpha: 0, y: 28 });
      gsap.set("[data-label]", { autoAlpha: 0 });
      gsap.set("[data-label-mark]", { scaleX: 0 });
      gsap.set("[data-header]", { autoAlpha: 0 });

      if (reduced) {
        gsap.set("[data-scene]", { autoAlpha: 1 });
        gsap.set("[data-header]", { autoAlpha: 1 });
        gsap.set(beats, { autoAlpha: 0 });
        gsap.set("[data-beat='afuera']", { autoAlpha: 1, y: 0 });
        gsap.set("[data-label]", { autoAlpha: 1 });
        gsap.set("[data-label-mark]", { scaleX: 1 });
        sequence.jumpTo(1);
        return () => sequence.destroy();
      }

      // Mientras el 3 sigue fijo en las nubes, esta escena se funde encima.
      gsap.fromTo(
        "[data-scene]",
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight}`,
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
              section.offsetHeight - (sticky?.offsetHeight ?? window.innerHeight);
            const fade = pin > 0 ? window.innerHeight / pin : 0;
            const hold = pin > 0 ? (window.innerHeight * 2) / pin : 0;
            const scroll = self.progress;
            if (scroll <= fade) {
              sequence.setTarget(0);
              return;
            }
            if (scroll >= 1 - hold) {
              sequence.setTarget(1);
              return;
            }
            sequence.setTarget(
              videoProgress((scroll - fade) / (1 - fade - hold)),
            );
          },
        },
      });

      const light = (id: string, at: number) => {
        timeline
          .to(
            `[data-label='${id}']`,
            { autoAlpha: 1, duration: 0.35 },
            at,
          )
          .to(
            `[data-label='${id}'] [data-label-mark]`,
            { scaleX: 1, duration: 0.4 },
            at,
          );
      };

      // El primer tramo sigue en las nubes, sin anunciar otra sección.
      timeline
        .fromTo(
          "[data-header]",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.4 },
          1.7,
        )
        .fromTo(
          "[data-beat='limites']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          2.2,
        )
        .to("[data-beat='limites']", { autoAlpha: 0, y: -14, duration: 0.4 }, 3.9)
        .fromTo(
          "[data-beat='afuera']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.55 },
          5.1,
        );

      light("cereal", 6.0);
      light("metales", 7.2);
      light("america", 8.5);
      timeline.to({}, { duration: 1.6 }, 8.8);

      return () => sequence.destroy();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="afuera"
      ref={sectionRef}
      aria-label="Europa mira hacia afuera"
      className="relative z-10 mt-[-200vh] h-[1040vh] bg-transparent"
    >
      <div data-panel className="sticky top-0 h-dvh overflow-hidden">
        <div data-scene className="absolute inset-0 opacity-0">
          <img
            src={POSTER_SRC}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,14,8,0.28),rgba(20,14,8,0.06)_46%,rgba(20,14,8,0.46)_100%)]" />
        </div>

        <ChapterMark data-header className="opacity-0">
          Capítulo 10
        </ChapterMark>

        <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p
              data-beat="limites"
              className="legible max-w-4xl text-center font-display text-[clamp(2rem,4.6vw,4.2rem)] leading-[1.05] tracking-[-0.02em] text-balance text-cream opacity-0"
            >
              Europa estaba llegando
              <br />
              <em>a sus propios límites.</em>
            </p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6 pb-16">
            <p
              data-beat="afuera"
              className="legible max-w-5xl text-center font-display text-[clamp(2rem,4.4vw,4rem)] leading-[1.05] tracking-[-0.02em] text-balance text-cream opacity-0"
            >
              Si los recursos se acababan dentro…
              <br />
              <em>había que mirar hacia afuera.</em>
            </p>
          </div>
        </div>

        <ol className="absolute inset-x-6 bottom-8 z-20 flex items-end justify-center gap-8 sm:inset-x-10 sm:gap-14">
          {LABELS.map((label, i) => (
            <li key={label.id} data-label={label.id} className="text-center">
              <span
                data-label-mark
                className="mx-auto mb-3 block h-px w-8 origin-left bg-gold"
              />
              <span className="flex items-baseline gap-2">
                <span className="type-menu-num text-[0.7rem] text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="type-menu text-[0.8rem] tracking-[-0.03em] text-cream sm:text-[0.95rem]">
                  {label.text}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
