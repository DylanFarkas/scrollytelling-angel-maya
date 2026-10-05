"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PARADAS = [
  {
    word: "Cereal",
    num: "01",
    title: "Tierras de cereal",
    text: "El trigo escaseaba y España venía optando por la oveja. Buscando tierras, los portugueses llegaron a las Canarias.",
    image: "/momento4/frames/frame_110.jpg",
  },
  {
    word: "Metales",
    num: "02",
    title: "Metales",
    text: "Los genoveses llegaron a Madeira buscando el oro del Sahara. Después vino la costa africana.",
    image: "/momento4/frames/frame_160.jpg",
  },
  {
    word: "América",
    num: "03",
    title: "América",
    text: "Del otro lado no había un territorio vacío: había sociedades que ya sabían vivir con la tierra.",
    image: "/momento5/frames/frame_330.jpg",
  },
] as const;

const STOP_AT = [1.1, 3.9, 6.7];

export function Cruce() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const move = reduced ? 0 : 1;
      const vh = (n: number) => () => window.innerHeight * n * move;

      gsap.set("[data-word]", { autoAlpha: 0 });
      gsap.set("[data-card]", { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo("[data-track]", { xPercent: 0 }, { xPercent: -40 * move, duration: 10 }, 0)
        .to("[data-intro]", { autoAlpha: 0, y: -20 * move, duration: 0.6 }, 0.7);

      PARADAS.forEach((_, i) => {
        const at = STOP_AT[i];
        const last = i === PARADAS.length - 1;
        tl.to(`[data-word='${i}']`, { autoAlpha: 1, duration: 0.5 }, at)
          .fromTo(
            `[data-card='${i}']`,
            {
              y: vh(0.75),
              rotationX: 55 * move,
              scale: 1 - 0.12 * move,
              autoAlpha: 0,
            },
            {
              y: 0,
              rotationX: 0,
              scale: 1,
              autoAlpha: 1,
              duration: 1.1,
              ease: "power2.out",
            },
            at,
          )
          .fromTo(
            `[data-card='${i}'] [data-ficha] > *`,
            { autoAlpha: 0, y: 10 * move },
            { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.12 },
            at + 0.6,
          );
        if (!last) {
          tl.to(`[data-word='${i}']`, { autoAlpha: 0, duration: 0.4 }, at + 2.4).to(
            `[data-card='${i}']`,
            {
              y: vh(-0.8),
              rotationX: -40 * move,
              autoAlpha: reduced ? 0 : 1,
              duration: 0.9,
              ease: "power2.in",
            },
            at + 2.1,
          );
        }
      });

      tl.to({}, { duration: 1 }, 9);
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="el-cruce"
      ref={sectionRef}
      aria-label="El cruce hacia América"
      className="relative z-20 h-[560vh] bg-black"
    >
      <div className="tint-cap9 sticky top-0 h-dvh overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div data-track className="relative w-max">
            {PARADAS.map((parada, i) => (
              <p
                key={parada.word}
                data-word={i}
                className="type-menu m-0 flex gap-[0.25em] whitespace-nowrap text-[min(24vw,34vh)] leading-none text-cream not-first:absolute not-first:inset-0"
              >
                {Array.from({ length: 6 }, (_, k) => (
                  <span key={k}>{parada.word}</span>
                ))}
              </p>
            ))}
          </div>
        </div>

        <header
          data-intro
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-black px-6 text-center"
        >
          <p className="eyebrow text-gold">Capítulo 10 · El cruce</p>
          <h2 className="m-0 max-w-4xl font-display text-[clamp(2.3rem,5.2vw,4.4rem)] leading-[1.04] tracking-[-0.02em] text-balance text-cream">
            Lo que había afuera
            <br />
            <em>no era tierra vacía.</em>
          </h2>
          <p className="m-0 max-w-[46ch] text-[1.02rem] leading-[1.6] text-paper/70">
            Europa cruzó el mar buscando lo que su propio suelo ya no daba. El
            orden es el del libro: primero tierras, luego metales, y al final un
            mundo que ya tenía historia.
          </p>
        </header>

        <div className="absolute inset-0 grid place-items-center px-6 perspective-[1400px]">
          {PARADAS.map((parada, i) => (
            <article
              key={parada.word}
              data-card={i}
              className="col-start-1 row-start-1 w-[min(30rem,78vw)] origin-[50%_100%] overflow-hidden rounded-sm bg-paper shadow-[0_50px_90px_-30px_rgba(0,0,0,0.9)] will-change-transform"
            >
              <img
                src={parada.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="block h-[min(36vh,17rem)] w-full object-cover"
              />
              <div
                data-ficha
                className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-2 px-6 py-5 text-ink short:py-4"
              >
                <span className="type-menu-num row-span-2 text-[2rem] leading-none text-gold">
                  {parada.num}
                </span>
                <h3 className="type-menu m-0 text-[clamp(1.3rem,2.4vw,1.8rem)] tracking-[-0.04em]">
                  {parada.title}
                </h3>
                <p className="m-0 text-[0.95rem] leading-normal text-ink/70 short:text-[0.85rem]">
                  {parada.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
