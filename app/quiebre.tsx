"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import AccordionGallery from "../components/accordion-gallery";
import { scrollToY } from "../lib/sections";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const QUIEBRE_ITEMS = [
  {
    image: "/momento5/m5-q-01-trigo.webp",
    label: "El trigo",
    alt: "Trigo pálido impuesto sobre una terraza; el maíz queda desplazado abajo.",
  },
  {
    image: "/momento5/m5-q-02-tala.webp",
    label: "La tala",
    alt: "Claro de hacha en la ladera; el monte que queda se ve arriba.",
  },
  {
    image: "/momento5/m5-q-03-mina.webp",
    label: "El saqueo",
    alt: "Boca de una mina modesta y mineral extraído en la ladera.",
  },
  {
    image: "/momento5/m5-q-04-encomienda.webp",
    label: "La encomienda",
    alt: "Un camino saca a la gente de las casas hacia el trigo y la mina.",
  },
  {
    image: "/momento5/m5-q-05-desintegracion.webp",
    label: "La desintegración",
    alt: "Casas de paja todavía en pie, ya casi sin gente.",
  },
];

const FRASE_CONQUISTA =
  "La conquista interrumpió formas de adaptación que ya existían, y puso la tierra al servicio de la acumulación europea.";

const FRASE_CHILAM =
  "Ellos vinieron a marchitar las flores. Para que su flor viviese, destruyeron nuestra flor.";

// Tramo del scroll en el que las tiras entran; el resto se reparte entre las cinco fotos.
const ENTRY = 0.14;
const HOLD = 0.08;

const SHARDS = [
  "polygon(14% 10%, 96% 0%, 82% 100%, 0% 86%)",
  "polygon(0% 18%, 88% 4%, 100% 92%, 10% 100%)",
  "polygon(8% 0%, 100% 14%, 90% 84%, 0% 100%)",
  "polygon(0% 6%, 92% 0%, 100% 100%, 16% 90%)",
  "polygon(10% 12%, 100% 0%, 86% 94%, 0% 100%)",
];

const pad = (n: number) => String(n).padStart(2, "0");

function indexAt(progress: number) {
  const span = 1 - ENTRY - HOLD;
  const local = (progress - ENTRY) / span;
  return Math.min(
    QUIEBRE_ITEMS.length - 1,
    Math.max(0, Math.floor(local * QUIEBRE_ITEMS.length)),
  );
}

export function Quiebre() {
  const sectionRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const panels = gsap.utils.toArray<HTMLElement>("[role='listitem']", section);

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setActive(indexAt(self.progress)),
      });

      if (reduced) return;

      panels.forEach((panel, i) => {
        gsap.fromTo(
          panel,
          { clipPath: SHARDS[i % SHARDS.length], autoAlpha: 0 },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            autoAlpha: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: () => `top+=${i * 0.04 * window.innerHeight} bottom`,
              end: () => `top+=${(0.6 + i * 0.12) * window.innerHeight} top`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      gsap.fromTo(
        "[data-shard-wrap]",
        { y: () => window.innerHeight * 0.18, rotation: -1.5 },
        {
          y: 0,
          rotation: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: () => `top+=${window.innerHeight * 0.9} top`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { scope: sectionRef },
  );

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        counterRef.current,
        { yPercent: 70, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.6, ease: "power3.out", overwrite: true },
      );
    },
    { dependencies: [active] },
  );

  const onSelect = useCallback((index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const span = 1 - ENTRY - HOLD;
    const progress = ENTRY + ((index + 0.5) / QUIEBRE_ITEMS.length) * span;
    const top = section.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + progress * (section.offsetHeight - window.innerHeight));
  }, []);

  const last = active === QUIEBRE_ITEMS.length - 1;

  return (
    <section
      id="el-quiebre"
      ref={sectionRef}
      aria-label="El quiebre: América interrumpida"
      className="relative z-20 h-[520vh] bg-black"
    >
      <div className="tint-cap10 sticky top-0 h-dvh overflow-hidden">
        <div className="mx-auto flex h-full w-[min(84rem,calc(100%-3rem))] flex-col justify-center-safe gap-[clamp(1rem,2.6vh,2.25rem)] pt-[clamp(4.25rem,10vh,6rem)] pb-[clamp(1rem,4vh,3rem)] lg:w-[min(84rem,calc(100%-7rem))]">
          <header className="grid gap-[clamp(0.75rem,2vh,1.75rem)]">
            <div className="eyebrow flex items-baseline justify-between gap-4 border-b border-paper/12 pb-3 text-paper/55 tiny:hidden">
              <span>Capítulo 10</span>
              <span className="hidden sm:inline">América interrumpida</span>
              <span>El quiebre</span>
            </div>

            <div className="flex items-end justify-between gap-6">
              <div className="grid gap-2">
                <p className="eyebrow text-gold">
                  <span className="type-menu-num">°05</span> · Quinto momento
                </p>
                <p
                  className="type-menu m-0 text-[clamp(1.5rem,min(3vw,5vh),2.4rem)] text-cream"
                  aria-live="polite"
                >
                  {QUIEBRE_ITEMS[active].label}
                </p>
              </div>
              <p className="m-0 flex items-baseline gap-2 leading-none">
                <span className="inline-block overflow-hidden pt-1">
                  <span
                    ref={counterRef}
                    className="type-menu-num block text-[clamp(2.4rem,min(5vw,8vh),4.8rem)] leading-[0.9] text-cream"
                  >
                    {pad(active + 1)}
                  </span>
                </span>
                <span className="text-[clamp(0.95rem,1.3vw,1.2rem)] font-medium text-paper/40">
                  / {pad(QUIEBRE_ITEMS.length)}
                </span>
              </p>
            </div>
          </header>

          <div data-shard-wrap className="flex min-h-48 w-full min-w-0 flex-1">
            <AccordionGallery
              items={QUIEBRE_ITEMS}
              activeIndex={active}
              onSelect={onSelect}
              accentColor="#c4a36a"
              overlayColor="#14110e"
              textColor="#f7f3ea"
              height="100%"
              gap={10}
              radius={4}
              expandRatio={0.46}
              trigger="click"
              grayscale
              ghostLabels
              showLabels
              className="h-full"
            />
          </div>

          <div className="grid gap-3 border-t border-paper/12 pt-[clamp(0.75rem,2.4vh,1.5rem)] text-center">
            <p className="eyebrow text-paper/55 tiny:hidden">
              {last ? "Chilam Balam" : "Ángel Maya"}
            </p>
            <p
              key={last ? "chilam" : "conquista"}
              className={`m-0 mx-auto max-w-4xl font-display text-[clamp(1.2rem,min(2.8vw,4.4vh),2.25rem)] leading-[1.18] tracking-[-0.02em] text-balance text-cream ${last ? "italic" : ""}`}
            >
              {last ? `«${FRASE_CHILAM}»` : FRASE_CONQUISTA}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
