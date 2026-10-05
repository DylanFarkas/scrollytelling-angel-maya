"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Planta de maíz en trazo: se dibuja con strokeDashoffset mientras sube. */
const MAIZ = [
  "M100 400V96",
  "M100 300c-26-8-52-30-64-62 22 4 46 20 64 46",
  "M100 250c28-10 54-34 66-66-24 6-48 24-66 50",
  "M100 196c-22-8-42-26-52-52 18 4 38 18 52 38",
  "M100 236c10-26 34-40 44-34 6 4-2 30-22 52-8 8-16 12-22 12",
  "M122 202c8 14 10 28 4 40",
  "M100 96c-4-18-14-34-28-44",
  "M100 96c4-18 14-34 28-44",
  "M100 96V40",
  "M100 70c-8-10-18-14-28-14",
  "M100 70c8-10 18-14 28-14",
  "M60 400h80",
];

export function HiddenMessage() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      gsap.set("[data-maiz-path]", { strokeDashoffset: reduced ? 0 : 1 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
        },
      });

      tl.fromTo("[data-tint]", { opacity: 0 }, { opacity: 1, duration: 1 }, 0.6)
        .fromTo(
          "[data-secret] > *",
          { autoAlpha: 0, y: reduced ? 0 : 16 },
          { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.2 },
          1.1,
        )
        .fromTo(
          "[data-maiz]",
          { yPercent: reduced ? 0 : 45 },
          { yPercent: 0, duration: 1.4, ease: "power2.out" },
          1.0,
        )
        .to(
          "[data-maiz-path]",
          { strokeDashoffset: 0, duration: 1.2, stagger: 0.05 },
          1.1,
        );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Mensaje oculto"
      className="relative z-20 h-[170vh] bg-black"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        <div data-tint className="absolute inset-0 bg-[#8a4526] opacity-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_110%,rgba(226,198,144,0.35),transparent_60%)]" />

        <div
          data-secret
          className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pt-[16vh] text-center"
        >
         {/* <p className="eyebrow text-cream/75">Encontraste un mensaje oculto</p>*/}
          <p className="mt-8 font-display text-[clamp(1.7rem,3.6vw,3rem)] leading-[1.12] tracking-[-0.01em] text-balance text-cream">
            Lo ambiental no es solo la naturaleza.
            <br />
            <em>Es la relación entre el ecosistema y la cultura.</em>
          </p>
          <p className="eyebrow mt-6 text-cream/60">
            La idea que recorre la obra de Augusto Ángel Maya
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <svg
            data-maiz
            viewBox="0 0 200 400"
            aria-hidden
            className="h-[min(52vh,30rem)] text-gold-soft"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {MAIZ.map((d) => (
              <path
                key={d}
                d={d}
                pathLength={1}
                strokeDasharray="1"
                data-maiz-path
              />
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
