"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChapterMark } from "../components/chapter-mark";
import { createFrameSequence } from "../components/frame-sequence";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAME_COUNT = 193;
const POSTER_SRC = "/momento3/frames/frame_001.jpg";

// Hasta la balanza inclinada el scroll acompaña el texto.
// Desde ese fotograma el video sigue a un ritmo más corto, hasta las nubes.
const SCALE_AT = 108 / (FRAME_COUNT - 1);
const SCALE_SCROLL = 0.62;

function videoProgress(scroll: number) {
  if (scroll <= SCALE_SCROLL) return (scroll / SCALE_SCROLL) * SCALE_AT;
  return (
    SCALE_AT +
    ((scroll - SCALE_SCROLL) / (1 - SCALE_SCROLL)) * (1 - SCALE_AT)
  );
}

function frameSrc(index: number) {
  return `/momento3/frames/frame_${String(index + 1).padStart(3, "0")}.jpg`;
}

export function Momento3() {
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
        id: "momento3",
        section,
        canvases: [canvas],
        frameCount: FRAME_COUNT,
        src: frameSrc,
      });

      const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", section);
      gsap.set(beats, { autoAlpha: 0, y: 28 });
      gsap.set("[data-beat='hero']", { autoAlpha: 1, y: 0 });

      gsap.fromTo(
        "[data-entry-veil]",
        { opacity: 1 },
        {
          opacity: 0,
          // el Momento 2 termina en tinta: el borde superior se funde con ella
          ease: "power2.in",
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
        gsap.set("[data-beat='limite']", { autoAlpha: 1, y: 0 });
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
          onUpdate: (self) => sequence.setTarget(videoProgress(self.progress)),
        },
      });

      // La línea de tiempo dura 10. Hasta 6.2 la balanza; después el acercamiento y las nubes.
      timeline
        .to("[data-beat='hero']", { autoAlpha: 0, y: -14, duration: 0.45 }, 0.7)
        .fromTo(
          "[data-beat='hambre']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.4 },
          1.15,
        )
        .to("[data-beat='hambre']", { autoAlpha: 0, y: -14, duration: 0.3 }, 2.4)
        .fromTo(
          "[data-beat='guerra']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.4 },
          2.85,
        )
        .to("[data-beat='guerra']", { autoAlpha: 0, y: -14, duration: 0.3 }, 4.15)
        .fromTo(
          "[data-beat='peste']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.4 },
          4.6,
        )
        .to("[data-beat='peste']", { autoAlpha: 0, y: -14, duration: 0.3 }, 6.05)
        .fromTo(
          "[data-beat='limite']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          7.7,
        )
        .to({}, { duration: 1.8 }, 8.2);

      return () => sequence.destroy();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="la-crisis"
      ref={sectionRef}
      aria-label="La crisis"
      className="relative z-0 h-[760vh] bg-ink"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        <img
          src={POSTER_SRC}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="absolute inset-0 z-1 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,14,8,0.28),rgba(20,14,8,0.06)_46%,rgba(20,14,8,0.46)_100%)]" />
        <div
          data-entry-veil
          className="pointer-events-none absolute inset-x-0 top-0 z-5 h-[45vh] bg-linear-to-b from-ink to-transparent"
        />

        <ChapterMark>Capítulo 9</ChapterMark>

        <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div data-beat="hero" className="legible max-w-4xl text-center">
              <p className="eyebrow on-image text-gold-soft">
                <span className="type-menu-num">°03</span> · Tercer momento
              </p>
              <h2 className="type-menu mt-6 text-[clamp(3rem,9vw,7.6rem)] text-balance text-cream">
                La crisis
              </h2>
              <p className="mx-auto mt-8 max-w-lg font-display text-[clamp(1.35rem,2.4vw,1.95rem)] leading-[1.15] tracking-[-0.02em] text-cream/90 italic">
                El deterioro del territorio
                <br />
                se volvió hambre, guerra y peste.
              </p>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p
              data-beat="hambre"
              className="legible max-w-4xl text-center font-display text-[clamp(2rem,4.6vw,4.2rem)] leading-[1.05] tracking-[-0.02em] text-balance text-cream opacity-0"
            >
              Hambre. El pan se pone inalcanzable.
              <br />
              <em>Pueblos enteros quedan vacíos.</em>
            </p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p
              data-beat="guerra"
              className="legible max-w-4xl text-center font-display text-[clamp(2rem,4.6vw,4.2rem)] leading-[1.05] tracking-[-0.02em] text-balance text-cream opacity-0"
            >
              Antes que la peste, la guerra.
              <br />
              <em>Tampoco había hacia dónde ir.</em>
            </p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p
              data-beat="peste"
              className="legible max-w-4xl text-center font-display text-[clamp(2rem,4.6vw,4.2rem)] leading-[1.05] tracking-[-0.02em] text-balance text-cream opacity-0"
            >
              La peste llegó después,
              <br />
              <em>cuando el campo ya se había rendido.</em>
            </p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <h2
              data-beat="limite"
              className="legible type-menu max-w-5xl text-center text-[clamp(2.4rem,6.4vw,6rem)] text-balance text-cream opacity-0"
            >
              Ya no hay hacia dónde ir.
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
