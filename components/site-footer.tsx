"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SECTIONS, scrollToSection, scrollToY } from "../lib/sections";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STILLS = [
  "/momento1/frames/frame_001.jpg",
  "/momento1/frames/frame_124.jpg",
  "/momento2/verde.jpg",
  "/momento2/presion.jpg",
  "/momento2/agotado.jpg",
  "/momento3/frames/frame_100.jpg",
  "/momento3/frames/frame_190.jpg",
  "/momento4/frames/frame_160.jpg",
  "/momento5/frames/frame_330.jpg",
  "/momento5/m5-q-01-trigo.webp",
  "/momento5/m5-q-02-tala.webp",
  "/momento5/m5-q-04-encomienda.webp",
  "/momento5/m5-q-05-desintegracion.webp",
  "/momento6/frames/frame_001.jpg",
  "/momento6/frames/frame_241.jpg",
  "/momento4/frames/frame_110.jpg",
];

const WALL_ROWS = Array.from({ length: 7 }, (_, row) =>
  Array.from(
    { length: 6 },
    (_, k) => STILLS[(row * 5 + k * 3) % STILLS.length],
  ),
);

export function SiteFooter() {
  const rootRef = useRef<HTMLDivElement>(null);
  // El lazy nativo no calcula bien la posición de un muro en 3D: se carga todo al acercarse.
  const [near, setNear] = useState(false);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top bottom+=150%",
        end: "bottom top",
        onEnter: () => setNear(true),
        onEnterBack: () => setNear(true),
      });

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduced) return;

      gsap.utils.toArray<HTMLElement>("[data-wall-row]").forEach((row, i) => {
        gsap.fromTo(
          row,
          { xPercent: i % 2 === 0 ? -6 : -18 },
          {
            xPercent: i % 2 === 0 ? -18 : -6,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-wall]",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      gsap.fromTo(
        "[data-wall-grid]",
        { yPercent: 8 },
        {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-wall]",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      gsap.fromTo(
        "[data-pill]",
        { scale: 0.78, borderRadius: "48px" },
        {
          scale: 1,
          borderRadius: "999px",
          ease: "power2.out",
          scrollTrigger: {
            trigger: "[data-pill-wrap]",
            start: "top bottom",
            end: "center center",
            scrub: true,
          },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative z-20 bg-black">
      <section
        data-wall
        aria-label="El recorrido completo"
        className="relative h-[160vh]"
      >
        <div className="sticky top-0 h-dvh overflow-hidden perspective-[1600px]">
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 w-[190vw] -translate-x-1/2 -translate-y-1/2 transform-3d"
          >
            <div data-wall-grid className="transform-3d">
              <div className="grid gap-4 transform-[rotateX(26deg)_rotateZ(-12deg)]">
                {WALL_ROWS.map((row, i) => (
                  <div key={i} data-wall-row className="flex gap-4">
                    {[...row, ...row].map((src, k) => (
                      <img
                        key={`${src}-${k}`}
                        src={near ? src : undefined}
                        alt=""
                        decoding="async"
                        className="aspect-video w-[min(26rem,34vw)] flex-none rounded-sm object-cover opacity-80"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.15),rgba(0,0,0,0.65)_60%,#000_100%)]" />
          <div className="absolute inset-0 grid place-items-center px-6 text-center">
            <div className="legible">
              <p className="eyebrow text-gold-soft">El recorrido</p>
              <p className="mt-4 font-display text-[clamp(1.8rem,4vw,3.4rem)] leading-[1.05] text-balance text-cream">
                Del bosque abierto a la flor marchita.
                <br />
                <em>Una sola historia, dos capítulos.</em>
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative flex min-h-dvh flex-col items-center justify-center gap-[clamp(2rem,6vh,4rem)] px-6 py-24">
        <div data-pill-wrap className="w-full max-w-5xl">
          <button
            type="button"
            data-pill
            onClick={() => scrollToY(0)}
            className="group relative block h-[clamp(9rem,24vw,17rem)] w-full overflow-hidden rounded-full text-left"
            aria-label="Volver a recorrer la historia desde el inicio"
          >
            <span
              aria-hidden
              className="footer-marquee absolute inset-y-0 left-0 flex w-max gap-2"
            >
              {[...STILLS, ...STILLS].map((src, i) => (
                <img
                  key={`${src}-${i}`}
                  src={near ? src : undefined}
                  alt=""
                  decoding="async"
                  className="h-full w-auto flex-none object-cover"
                />
              ))}
            </span>
            <span className="absolute inset-0 bg-[rgba(12,9,6,0.55)] transition-colors duration-500 group-hover:bg-[rgba(12,9,6,0.38)]" />
            <span className="type-menu absolute inset-0 flex flex-col items-center justify-center text-center text-[clamp(1.6rem,5.4vw,4.4rem)] text-cream">
              <span>Volver a recorrer</span>
              <span>la historia</span>
            </span>
          </button>
        </div>

        <nav aria-label="Momentos" className="w-full max-w-5xl">
          <ul className="m-0 flex list-none flex-wrap justify-center gap-x-6 gap-y-3 p-0">
            {SECTIONS.map((section) => (
              <li key={section.hash}>
                <a
                  href={section.hash}
                  onClick={(event) => {
                    if (scrollToSection(section.hash)) event.preventDefault();
                  }}
                  className="eyebrow text-paper/70 transition-colors hover:text-gold-soft"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid max-w-3xl gap-3 text-center">
          <p className="m-0 font-display text-[1.15rem] leading-[1.4] text-cream/85 italic">
            Basado en los capítulos 9 y 10 de{" "}
            <span className="not-italic">
              La fragilidad ambiental de la cultura
            </span>
            , de Augusto Ángel Maya.
          </p>
          <p className="m-0 text-[0.85rem] text-paper/45">
            Imágenes y videos generados para esta lectura. Gracias por
            recorrerla.
          </p>
        </div>
      </footer>
    </div>
  );
}
