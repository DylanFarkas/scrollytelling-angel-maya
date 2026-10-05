"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChapterMark } from "../components/chapter-mark";
import { createFrameSequence } from "../components/frame-sequence";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAME_COUNT = 243;
const POSTER_SRC = "/momento2/frames/frame_001.jpg";
// En unidades de la línea de tiempo: quieto para el título, quieto para el clímax y el barrido.
const PLAY_FROM = 0.8;
const PLAY_TO = 7.4;

const SWEEP_COLORS = [
  "#d6b26c",
  "#bf7442",
  "#8d8274",
  "#bf7442",
  "#d6b26c",
] as const;

function frameSrc(index: number) {
  return `/momento2/frames/frame_${String(index + 1).padStart(3, "0")}.jpg`;
}

const CHAIN = [
  { id: "expansion", text: "Expansión" },
  { id: "cultivos", text: "Más cultivos" },
  { id: "descanso", text: "El suelo ya no descansa" },
  { id: "productividad", text: "Menor productividad" },
] as const;

/* Sellos: trazos simples, se dibujan con strokeDashoffset. */
const SELLOS = [
  {
    id: "bosque",
    label: "Bosques",
    paths: [
      "M24 44V25",
      "M24 33l-5-5",
      "M24 30l5-5",
      "M24 27c-7.5 0-12.5-4-12.5-9 0-3 2-5.6 4.7-6.6C17 7.2 20.2 4.5 24 4.5s7 2.7 7.8 6.9c2.7 1 4.7 3.6 4.7 6.6 0 5-5 9-12.5 9z",
      "M16 44h16",
    ],
  },
  {
    id: "bueyes",
    label: "Animales de trabajo",
    paths: [
      "M7 9c0 6 5 10 11 10",
      "M41 9c0 6-5 10-11 10",
      "M17 19h14c1.2 5 1.2 9 .2 13-1.2 5-3.4 9-7.2 10.5-3.8-1.5-6-5.5-7.2-10.5-1-4-1-8 .2-13z",
      "M17 21.5l-6.5 2.5 6.6 3",
      "M31 21.5l6.5 2.5-6.6 3",
      "M20.5 27.5h2M25.5 27.5h2",
      "M21 38.5c1 .8 2 1.2 3 1.2s2-.4 3-1.2",
    ],
  },
  {
    id: "alimento",
    label: "Alimento",
    paths: [
      "M24 45V13",
      "M24 13c-2.2-3-2.2-6 0-9 2.2 3 2.2 6 0 9z",
      "M24 20c-4-1-6-4-6-8 4 1 6 4 6 8z",
      "M24 20c4-1 6-4 6-8-4 1-6 4-6 8z",
      "M24 27c-4-1-6-4-6-8 4 1 6 4 6 8z",
      "M24 27c4-1 6-4 6-8-4 1-6 4-6 8z",
      "M24 34c-4-1-6-4-6-8 4 1 6 4 6 8z",
      "M24 34c4-1 6-4 6-8-4 1-6 4-6 8z",
    ],
  },
] as const;

const beatClass =
  "legible max-w-4xl text-center font-display text-[clamp(2rem,4.6vw,4.2rem)] leading-[1.05] tracking-[-0.02em] text-balance text-cream opacity-0";

export function Momento2() {
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
        id: "momento2",
        section,
        canvases: [canvas],
        frameCount: FRAME_COUNT,
        src: frameSrc,
      });

      const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", section);
      gsap.set(beats, { autoAlpha: 0, y: 28 });
      gsap.set("[data-beat='hero']", { autoAlpha: 1, y: 0 });
      gsap.set("[data-chain]", { autoAlpha: 0 });
      gsap.set("[data-chain-mark]", { scaleX: 0 });
      gsap.set("[data-sello]", { autoAlpha: 0, y: 10 });
      gsap.set("[data-sello-path]", { strokeDashoffset: 1 });
      gsap.set("[data-sellos-title]", { autoAlpha: 0 });
      gsap.set("[data-band]", {
        xPercent: (_: number, el: HTMLElement) =>
          el.dataset.from === "right" ? 105 : -105,
      });

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
        gsap.set("[data-beat='cansancio']", { autoAlpha: 1, y: 0 });
        gsap.set("[data-sellos-title], [data-sello]", { autoAlpha: 1, y: 0 });
        gsap.set("[data-sello-path]", { strokeDashoffset: 0 });
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
            sequence.setTarget(
              (self.progress * timeline.duration() - PLAY_FROM) /
                (PLAY_TO - PLAY_FROM),
            ),
        },
      });

      const beat = (id: string, inAt: number, outAt: number) => {
        timeline
          .fromTo(
            `[data-beat='${id}']`,
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.45 },
            inAt,
          )
          .to(
            `[data-beat='${id}']`,
            { autoAlpha: 0, y: -14, duration: 0.35 },
            outAt,
          );
      };

      const light = (id: string, at: number) => {
        timeline
          .to(`[data-chain='${id}']`, { autoAlpha: 1, duration: 0.35 }, at)
          .to(
            `[data-chain='${id}'] [data-chain-mark]`,
            { scaleX: 1, duration: 0.4 },
            at,
          );
      };

      timeline.to(
        "[data-beat='hero']",
        { autoAlpha: 0, y: -14, duration: 0.45 },
        0.9,
      );

      beat("expansion", 1.45, 2.85);
      light("expansion", 1.6);
      light("cultivos", 2.5);

      beat("rotacion", 3.25, 4.75);
      light("descanso", 3.6);

      beat("abono", 5.15, 6.55);
      light("productividad", 5.9);

      timeline
        .to("[data-chain]", { autoAlpha: 0, duration: 0.4 }, 6.7)
        .fromTo(
          "[data-beat='cansancio']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          7.0,
        )
        .to("[data-sellos-title]", { autoAlpha: 1, duration: 0.35 }, 7.7)
        .to(
          "[data-sello]",
          { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.18 },
          7.8,
        )
        .to(
          "[data-sello-path]",
          {
            strokeDashoffset: 0,
            duration: 0.6,
            stagger: 0.03,
            ease: "power1.inOut",
          },
          7.9,
        )
        // Salida: franjas con la paleta del campo cubren la pantalla hasta la tinta.
        // Dura más que el resto a propósito: el barrido va atado al scroll y,
        // si es corto, un gesto lo completa entero.
        .to(
          "[data-band='color']",
          { xPercent: 0, duration: 2.2, stagger: 0.18, ease: "power3.inOut" },
          9.4,
        )
        .to(
          "[data-band='ink']",
          { xPercent: 0, duration: 2.2, stagger: 0.18, ease: "power3.inOut" },
          10.7,
        )
        .to({}, { duration: 0.5 }, 13.6);

      return () => sequence.destroy();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="la-tierra"
      ref={sectionRef}
      aria-label="La tierra comienza a agotarse"
      className="relative h-[1080vh] bg-black"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        <img
          src={POSTER_SRC}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="absolute inset-0 z-1 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 z-2 bg-[radial-gradient(ellipse_at_center,rgba(20,14,8,0.3),rgba(20,14,8,0.06)_46%,rgba(20,14,8,0.46)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-2 h-[30%] bg-linear-to-t from-[rgba(10,8,6,0.6)] to-transparent" />
        <div
          data-entry-veil
          className="pointer-events-none absolute inset-x-0 top-0 z-5 h-[45vh] bg-linear-to-b from-ink to-transparent"
        />

        <ChapterMark>Capítulo 9</ChapterMark>

        <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div data-beat="hero" className="legible max-w-4xl text-center">
              <p className="eyebrow on-image text-gold-soft">
                <span className="type-menu-num">°02</span> · Segundo momento
              </p>
              <h2 className="type-menu mt-6 text-[clamp(2.6rem,7.4vw,6.6rem)] text-balance text-cream">
                La tierra comienza a agotarse
              </h2>
              <p className="mx-auto mt-8 max-w-lg font-display text-[clamp(1.35rem,2.4vw,1.95rem)] leading-[1.15] tracking-[-0.02em] text-cream/90 italic">
                El mismo campo,
                <br />
                cosecha tras cosecha.
              </p>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6 pb-16">
            <p data-beat="expansion" className={beatClass}>
              Europa roturó el bosque para sembrar.
              <br />
              <em>La tierra parecía no tener límite.</em>
            </p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6 pb-16">
            <p data-beat="rotacion" className={beatClass}>
              Trigo, rastrojo, descanso.
              <br />
              <em>Pero la franja que debía descansar ya no se recupera.</em>
            </p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6 pb-16">
            <p data-beat="abono" className={beatClass}>
              Las tierras nuevas eran peores
              <br />
              <em>y el abono ya no alcanzaba.</em>
            </p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div data-beat="cansancio" className="legible max-w-5xl text-center opacity-0">
              <h2 className="type-menu text-[clamp(2.4rem,6.4vw,6rem)] text-balance text-cream">
                La tierra empezó a cansarse.
              </h2>
              <p
                data-sellos-title
                className="eyebrow on-image mt-[clamp(2rem,6vh,3.5rem)] text-paper/70"
              >
                La presión también llegó a
              </p>
              <ul className="mt-5 flex items-start justify-center gap-8 sm:gap-14">
                {SELLOS.map((sello, i) => (
                  <li
                    key={sello.id}
                    data-sello
                    className="flex w-24 flex-col items-center sm:w-32"
                  >
                    <svg
                      viewBox="0 0 48 48"
                      className="size-10 text-gold-soft sm:size-12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      {sello.paths.map((d) => (
                        <path
                          key={d}
                          d={d}
                          pathLength={1}
                          strokeDasharray="1"
                          data-sello-path
                        />
                      ))}
                    </svg>
                    <span className="mt-3 flex items-baseline gap-2">
                      <span className="type-menu-num text-[0.7rem] text-gold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="type-menu text-[0.8rem] tracking-[-0.03em] text-cream sm:text-[0.95rem]">
                        {sello.label}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <ol
          aria-label="Cómo se agotó la tierra"
          className="absolute bottom-6 left-6 z-20 flex flex-col gap-2 sm:bottom-24 sm:left-10 lg:inset-x-10 lg:bottom-8 lg:flex-row lg:items-end lg:justify-center lg:gap-12 short:gap-1.5"
        >
          {CHAIN.map((step, i) => (
            <li
              key={step.id}
              data-chain={step.id}
              className="flex items-center gap-3 lg:block lg:text-center"
            >
              <span
                data-chain-mark
                className="block h-px w-6 origin-left bg-gold lg:mx-auto lg:mb-3 lg:w-8"
              />
              <span className="flex items-baseline gap-2 lg:justify-center">
                <span className="type-menu-num text-[0.7rem] text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="type-menu text-[0.8rem] tracking-[-0.03em] text-cream sm:text-[0.95rem]">
                  {step.text}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 flex flex-col"
        >
          {SWEEP_COLORS.map((color, i) => {
            const from = i % 2 ? "right" : "left";
            return (
              <div key={i} className="relative -my-px flex-1">
                <span
                  data-band="color"
                  data-from={from}
                  className="absolute inset-y-0 left-[-12%] w-[124%] rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span
                  data-band="ink"
                  data-from={from}
                  className="absolute inset-y-0 left-[-12%] w-[124%] rounded-full bg-black"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
