"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChapterMark } from "../components/chapter-mark";
import { createFrameSequence } from "../components/frame-sequence";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAME_COUNT = 241;
const POSTER_SRC = "/momento6/momento6-inicio.jpg";
// Un tramo quieto al principio para leer las dos tierras, y otro al final para la pregunta.
const PLAY_FROM = 0.1;
const PLAY_TO = 0.8;

function frameSrc(index: number) {
  return `/momento6/frames/frame_${String(index + 1).padStart(3, "0")}.jpg`;
}

const beatClass =
  "legible max-w-4xl text-center font-display text-[clamp(1.7rem,3.8vw,3.4rem)] leading-[1.08] tracking-[-0.02em] text-balance text-cream opacity-0";

export function Momento6() {
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
        id: "momento6",
        section,
        canvases: [canvas],
        frameCount: FRAME_COUNT,
        src: frameSrc,
      });

      const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", section);
      gsap.set(beats, { autoAlpha: 0, y: 24 });
      gsap.set("[data-beat='hero']", { autoAlpha: 1, y: 0 });
      gsap.set("[data-land]", { autoAlpha: 0 });

      gsap.fromTo(
        "[data-entry-veil]",
        { opacity: 1 },
        {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        },
      );

      if (reduced) {
        gsap.set(beats, { autoAlpha: 0 });
        gsap.set("[data-beat='pregunta']", { autoAlpha: 1, y: 0 });
        sequence.jumpTo(1);
        return () => sequence.destroy();
      }

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) =>
            sequence.setTarget((self.progress - PLAY_FROM) / (PLAY_TO - PLAY_FROM)),
        },
      });

      timeline
        .to("[data-land]", { autoAlpha: 1, duration: 0.5, stagger: 0.2 }, 0.3)
        .to("[data-beat='hero']", { autoAlpha: 0, y: -14, duration: 0.5 }, 1.1)
        .fromTo(
          "[data-beat='corriente']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          2.4,
        )
        .to("[data-land]", { autoAlpha: 0, duration: 0.5 }, 3.4)
        .to("[data-beat='corriente']", { autoAlpha: 0, y: -14, duration: 0.4 }, 4.5)
        .fromTo(
          "[data-beat='flor']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          5.0,
        )
        .to("[data-beat='flor']", { autoAlpha: 0, y: -14, duration: 0.4 }, 7.2)
        .fromTo(
          "[data-beat='pregunta']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.6 },
          7.7,
        )
        .to({}, { duration: 1.7 }, 8.3);

      return () => sequence.destroy();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="dos-flores"
      ref={sectionRef}
      aria-label="Dos flores, un solo plano"
      className="relative z-20 h-[760vh] bg-ink"
    >
      <div data-panel className="sticky top-0 h-dvh overflow-hidden">
        <img
          src={POSTER_SRC}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="absolute inset-0 z-1 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 z-2 bg-[radial-gradient(ellipse_at_center,rgba(20,14,8,0.12),rgba(20,14,8,0.04)_46%,rgba(20,14,8,0.4)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-2 h-[42%] bg-linear-to-t from-[rgba(10,8,6,0.82)] via-[rgba(10,8,6,0.45)] to-transparent" />
        <div
          data-entry-veil
          className="pointer-events-none absolute inset-x-0 top-0 z-5 h-[45vh] bg-linear-to-b from-black to-transparent"
        />

        <ChapterMark>Capítulo 10</ChapterMark>

        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[24%] z-10">
          <p
            data-land
            className="eyebrow absolute left-[8%] text-paper/85 [text-shadow:0_1px_14px_rgb(0_0_0/0.5)]"
          >
            <span className="mb-2 block h-px w-8 bg-gold" />
            Europa · hacia 1450
          </p>
          <p
            data-land
            className="eyebrow absolute right-[8%] text-right text-paper/85 [text-shadow:0_1px_14px_rgb(0_0_0/0.5)]"
          >
            <span className="mb-2 ml-auto block h-px w-8 bg-gold" />
            América
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-[7%] z-10 flex justify-center px-6 short:bottom-[4%]">
          <div className="relative grid w-full max-w-5xl place-items-center">
            <div
              data-beat="hero"
              className="legible col-start-1 row-start-1 text-center"
            >
              <p className="eyebrow on-image text-gold-soft">
                <span className="type-menu-num">°06</span> · Sexto momento
              </p>
              <h2 className="type-menu mt-4 text-[clamp(2.4rem,6.4vw,5.6rem)] text-balance text-cream">
                Dos flores
              </h2>
              <p className="mt-3 font-display text-[clamp(1.2rem,2.2vw,1.7rem)] text-cream/90 italic">
                Un solo plano. Dos tierras a la vez.
              </p>
            </div>

            <p data-beat="corriente" className={`col-start-1 row-start-1 ${beatClass}`}>
              Una corriente sale de América hacia Europa.
              <br />
              <em>No la alimenta: la drena.</em>
            </p>

            <p data-beat="flor" className={`col-start-1 row-start-1 ${beatClass}`}>
              «Para que su flor viviese,
              <br />
              <em>destruyeron nuestra flor.»</em>
              <span className="eyebrow mt-4 block text-paper/60 not-italic">
                Chilam Balam
              </span>
            </p>

            <h2
              data-beat="pregunta"
              className="legible type-menu col-start-1 row-start-1 max-w-5xl text-center text-[clamp(1.9rem,4.8vw,4.4rem)] text-balance text-cream opacity-0"
            >
              ¿Hasta dónde puede crecer una sociedad sin transformar el lugar que la
              sostiene?
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
