"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChapterMark } from "../components/chapter-mark";
import { createFrameSequence } from "../components/frame-sequence";
import { isStoryReady, onStoryReady } from "../lib/story-ready";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAME_COUNT = 124;
const POSTER_SRC = "/momento1/momento1-inicio.png";

function frameSrc(index: number) {
  return `/momento1/frames/frame_${String(index + 1).padStart(3, "0")}.jpg`;
}

export function Momento1() {
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
        id: "momento1",
        section,
        canvases: [canvas],
        frameCount: FRAME_COUNT,
        src: frameSrc,
        eager: true,
      });

      const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", section);
      gsap.set(beats, { autoAlpha: 0, y: 28 });
      gsap.set("[data-beat='hero']", { autoAlpha: 1, y: 0 });

      if (reduced) {
        gsap.set(beats, { autoAlpha: 0 });
        gsap.set("[data-beat='pregunta']", { autoAlpha: 1, y: 0 });
        gsap.set("[data-scroll-hint]", { autoAlpha: 0 });
        sequence.jumpTo(1);
        return () => sequence.destroy();
      }

      if (!isStoryReady()) {
        gsap.set("[data-hero-line]", { yPercent: 110 });
        gsap.set("[data-hero-fade]", { autoAlpha: 0, y: 12 });
      }
      const stopEntrance = onStoryReady(() => {
        gsap.to("[data-hero-line]", {
          yPercent: 0,
          duration: 1.1,
          stagger: 0.12,
          ease: "expo.out",
        });
        gsap.to("[data-hero-fade]", {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          delay: 0.35,
          ease: "power2.out",
        });
      });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => sequence.setTarget(self.progress),
        },
      });

      timeline
        .to("[data-scroll-hint]", { autoAlpha: 0, duration: 0.9 }, 0.15)
        .to("[data-beat='hero']", { autoAlpha: 0, y: -14, duration: 1.15 }, 1.7)
        .fromTo(
          "[data-beat='campos']",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 1.15 },
          1.75,
        )
        .to("[data-beat='campos']", { autoAlpha: 0, y: -14, duration: 1.05 }, 3.85)
        .fromTo(
          "[data-beat='bosque']",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 1.05 },
          3.9,
        )
        .to("[data-beat='bosque']", { autoAlpha: 0, y: -14, duration: 1.05 }, 6.0)
        .fromTo(
          "[data-beat='pregunta']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 1.15 },
          6.05,
        )
        .to({}, { duration: 2.1 }, 7.3);

      return () => {
        stopEntrance();
        sequence.destroy();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="inicio"
      ref={sectionRef}
      aria-label="Cuando la tierra ya no alcanza"
      className="relative h-[620vh] bg-ink"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        <img
          src={POSTER_SRC}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="absolute inset-0 z-1 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,14,8,0.34),rgba(20,14,8,0.08)_46%,rgba(20,14,8,0.42)_100%)]" />

        <ChapterMark>Capítulo 9</ChapterMark>

        <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div data-beat="hero" className="legible max-w-5xl text-center">
              <p data-hero-fade className="eyebrow on-image text-paper/80">
                Augusto Ángel Maya · Capítulos 9 y 10
              </p>
              <h1 className="type-menu mt-6 text-[clamp(2.25rem,min(9vw,11vh),4.5rem)] text-balance text-cream short:mt-4">
                <span className="block overflow-hidden pb-[0.06em]">
                  <span data-hero-line className="block">Cuando la tierra</span>
                </span>
                <span className="block overflow-hidden pb-[0.06em]">
                  <span data-hero-line className="block">ya no alcanza</span>
                </span>
              </h1>
              <p data-hero-fade className="mx-auto mt-8 max-w-md font-display text-[clamp(1.4rem,min(3vw,4.6vh),1.875rem)] tracking-[-0.02em] text-cream/90 italic short:mt-4">
                Europa crecía.
                <br />
                Pero sus recursos tenían un límite.
              </p>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <h2
              data-beat="campos"
              className="legible max-w-3xl text-center font-display text-[clamp(2.6rem,6vw,5.4rem)] leading-[0.95] tracking-[-0.02em] text-balance text-cream opacity-0"
            >
              Se abren los campos.
              <br />
              <em>Crece la población.</em>
            </h2>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <h2
              data-beat="bosque"
              className="legible max-w-3xl text-center font-display text-[clamp(2.6rem,6vw,5.4rem)] leading-[0.95] tracking-[-0.02em] text-balance text-cream opacity-0"
            >
              Aumenta la producción.
              <br />
              <em>El bosque retrocede.</em>
            </h2>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p
              data-beat="pregunta"
              className="legible max-w-4xl text-center font-display text-[clamp(2rem,4.4vw,4.1rem)] leading-[1.05] tracking-[-0.02em] text-balance text-cream opacity-0"
            >
             ¿Qué ocurre cuando una sociedad <em>necesita cada vez más, pero el
              territorio ya no puede darle lo suficiente?</em>
            </p>
          </div>
        </div>

        <p
          data-scroll-hint
          className="eyebrow absolute inset-x-0 bottom-8 z-20 flex flex-col items-center gap-3 text-paper/75 short:bottom-4 short:gap-2 tiny:hidden"
        >
          Haz scroll
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            aria-hidden="true"
            fill="none"
            className="animate-bounce motion-reduce:animate-none"
          >
            <path
              d="M8 2.5v11M3.5 9 8 13.5 12.5 9"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </p>
      </div>
    </section>
  );
}
