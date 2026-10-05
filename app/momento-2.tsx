"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChapterMark } from "../components/chapter-mark";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const GOLD = "#c4a36a";

const SCENES = [
  {
    id: "verde",
    num: "01",
    src: "/momento2/verde.png",
    kicker: "La expansión",
    title: "El campo se abre",
    body: "Durante siglos Europa roturó el bosque para sembrar. La tierra parecía no tener límite. Cada nuevo claro era más campo, más pan y más gente.",
  },
  {
    id: "presion",
    num: "02",
    src: "/momento2/presion.png",
    kicker: "La rotación trienal",
    title: "El suelo ya no descansa",
    body: "Sembrar en tres tiempos permitió cosechar más seguido: una franja con trigo, otra en rastrojo, otra que debía descansar. Al principio el suelo aguantaba. En el siglo XIV las tierras nuevas eran peores, y el abono ya no alcanzaba a devolver lo que la cosecha se llevaba.",
  },
  {
    id: "agotado",
    num: "03",
    src: "/momento2/agotado.png",
    kicker: "El límite",
    title: "La tierra empezó a cansarse",
    body: "Bajó la cosecha. El alimento de las personas empezó a competir con el de los bueyes y los caballos. Detrás del suelo cansado llegaron el hambre, los precios altos y la crisis.",
  },
] as const;

const CHAIN = [
  "Expansión",
  "Más cultivos",
  "El suelo ya no descansa",
  "Menor productividad",
] as const;

const STRIPS = ["Trigo", "Rastrojo", "Descanso"] as const;

const SWEEP_COLORS = [
  "#d6b26c",
  "#bf7442",
  "#8d8274",
  "#bf7442",
  "#d6b26c",
] as const;

const GAUGE_SEGMENTS = 14;
const GAUGE_STATES = ["Fértil", "Exigido", "Agotado"] as const;

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

function Words({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => (
        <span key={index}>
          <span className="mb-[-0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
            <span data-word className="inline-block will-change-transform">
              {word}
            </span>
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

function lerpColor(vital: number) {
  // dorado vivo -> terracota -> polvo
  const high = "#d6b26c";
  const mid = "#bf7442";
  const low = "#8d8274";
  return vital > 0.5
    ? gsap.utils.interpolate(mid, high, (vital - 0.5) / 0.5)
    : gsap.utils.interpolate(low, mid, vital / 0.5);
}

export function Momento2() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      // Con movimiento reducido se conservan los fundidos, sin desplazamientos.
      const move = reduced ? 0 : 1;

      const q = gsap.utils.selector(section);

      /* ---------- medidor de fertilidad ---------- */
      const segments = q<HTMLElement>("[data-seg]");
      const gauge = { vital: 1 };
      const renderGauge = () => {
        const level = gauge.vital * GAUGE_SEGMENTS;
        const color = lerpColor(gauge.vital);
        segments.forEach((seg, i) => {
          // i = 0 es el segmento superior: el primero en apagarse.
          const rank = GAUGE_SEGMENTS - 1 - i;
          const lit = gsap.utils.clamp(0, 1, level - rank);
          seg.style.opacity = String(0.28 + lit * 0.72);
          seg.style.backgroundColor =
            lit > 0.02 ? color : "rgba(244,239,230,0.32)";
        });
      };
      renderGauge();

      /* ---------- estado inicial ---------- */
      gsap.set("[data-plate]", { autoAlpha: 0 });
      gsap.set("[data-plate='verde']", { autoAlpha: 1 });
      gsap.set("[data-plates]", { scale: 1 + 0.14 * move, yPercent: 2 * move });
      gsap.set("[data-shade]", { opacity: 0.62 });
      gsap.set("[data-dust]", { opacity: 0 });
      gsap.set("[data-card]", { autoAlpha: 0 });
      gsap.set(
        "[data-climax] [data-meta], [data-climax] [data-body], [data-sellos-title]",
        { autoAlpha: 0 },
      );
      // Con movimiento reducido las palabras se funden en vez de subir.
      gsap.set("[data-word]", {
        yPercent: 110 * move,
        autoAlpha: reduced ? 0 : 1,
      });
      gsap.set("[data-intro] [data-word]", { yPercent: 0, autoAlpha: 1 });
      gsap.set("[data-ui]", { autoAlpha: 0 });
      gsap.set("[data-rail-fill]", { scaleX: 0 });
      gsap.set("[data-state]", { autoAlpha: 0 });
      gsap.set("[data-state='0']", { autoAlpha: 1 });
      gsap.set("[data-strip-fill]", { scaleX: 0 });
      gsap.set("[data-strip-note]", { autoAlpha: 0 });
      gsap.set("[data-sello-path]", { strokeDashoffset: 1 });
      gsap.set("[data-sello-label]", { autoAlpha: 0, y: 6 * move });
      gsap.set("[data-sello-ring]", { autoAlpha: 0, scale: 1 - 0.12 * move });
      gsap.set("[data-band]", {
        xPercent: (_: number, el: HTMLElement) =>
          (el.dataset.from === "right" ? 105 : -105) * move,
        autoAlpha: reduced ? 0 : 1,
      });

      /* ---------- entrada desde el momento 1 ---------- */
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

      /* ---------- helpers ---------- */
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      const cardIn = (id: string, at: number) => {
        tl.set(`[data-card='${id}']`, { autoAlpha: 1 }, at)
          .fromTo(
            `[data-card='${id}'] [data-meta]`,
            { autoAlpha: 0, x: -14 * move },
            { autoAlpha: 1, x: 0, duration: 0.45, ease: "power2.out" },
            at,
          )
          .to(
            `[data-card='${id}'] [data-word]`,
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.5,
              stagger: 0.06,
              ease: "power3.out",
            },
            at + 0.1,
          )
          .fromTo(
            `[data-card='${id}'] [data-body]`,
            { autoAlpha: 0, y: 14 * move },
            { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
            at + 0.35,
          );
      };

      const cardOut = (id: string, at: number) => {
        tl.to(
          `[data-card='${id}']`,
          { autoAlpha: 0, y: -18 * move, duration: 0.5, ease: "power1.in" },
          at,
        );
      };

      const nodeOn = (index: number, at: number) => {
        tl.to(
          `[data-node='${index}'] [data-dot]`,
          {
            backgroundColor: GOLD,
            borderColor: GOLD,
            scale: 1.35,
            duration: 0.25,
          },
          at,
        ).to(
          `[data-node='${index}'] [data-node-label]`,
          { opacity: 1, color: "#f7f3ea", duration: 0.25 },
          at,
        );
      };

      const stateTo = (index: number, at: number) => {
        tl.to("[data-state]", { autoAlpha: 0, duration: 0.3 }, at).to(
          `[data-state='${index}']`,
          { autoAlpha: 1, duration: 0.3 },
          at + 0.15,
        );
      };

      /* ---------- recorrido ---------- */
      tl
        // cámara lenta sobre todo el momento
        .to("[data-plates]", { scale: 1, yPercent: 0, duration: 10.5 }, 0)

        // 0 — apertura del capítulo
        .to(
          "[data-intro]",
          { autoAlpha: 0, y: -24 * move, duration: 0.7, ease: "power1.in" },
          0.85,
        )
        .to("[data-shade]", { opacity: 0.12, duration: 1 }, 0.9)
        .to("[data-ui]", { autoAlpha: 1, duration: 0.5 }, 1.25);

      // 01 — la expansión
      cardIn("verde", 1.35);
      nodeOn(0, 1.5);
      tl.to("[data-rail-fill]", { scaleX: 0.333, duration: 1.6 }, 1.5);
      nodeOn(1, 3.05);

      // fertilidad: se vacía de forma continua
      tl.to(gauge, { vital: 0.62, duration: 2.1, onUpdate: renderGauge }, 1.5)
        .to(gauge, { vital: 0.3, duration: 2.7, onUpdate: renderGauge }, 3.6)
        .to(gauge, { vital: 0.07, duration: 1.4, onUpdate: renderGauge }, 6.3);

      // 02 — la rotación trienal
      cardOut("verde", 3.4);
      tl.to("[data-plate='presion']", { autoAlpha: 1, duration: 1.2 }, 3.4)
        .to("[data-plate='verde']", { autoAlpha: 0, duration: 0.6 }, 4.0)
        .to("[data-rail-fill]", { scaleX: 0.666, duration: 0.9 }, 3.5);
      stateTo(1, 3.6);
      cardIn("presion", 3.85);
      nodeOn(2, 4.35);

      tl.to(
        "[data-strip='0'] [data-strip-fill]",
        { scaleX: 1, duration: 0.45, ease: "power2.out" },
        4.55,
      )
        .to(
          "[data-strip='1'] [data-strip-fill]",
          { scaleX: 1, duration: 0.45, ease: "power2.out" },
          4.8,
        )
        .to(
          "[data-strip='2'] [data-strip-fill]",
          { scaleX: 1, duration: 0.45, ease: "power2.out" },
          5.05,
        )
        .to(
          "[data-strip='2'] [data-strip-fill]",
          { backgroundColor: "rgba(214,201,178,0.55)", duration: 0.5 },
          5.55,
        )
        .to(
          "[data-strip='2'] [data-strip-label]",
          { opacity: 0.45, duration: 0.5 },
          5.55,
        )
        .to("[data-strip='2'] [data-strike]", { scaleX: 1, duration: 0.4 }, 5.6)
        .to("[data-strip-note]", { autoAlpha: 1, duration: 0.4 }, 5.75);

      // 03 — el límite
      cardOut("presion", 6.3);
      tl.to("[data-plate='agotado']", { autoAlpha: 1, duration: 1.2 }, 6.3)
        .to("[data-plate='presion']", { autoAlpha: 0, duration: 0.6 }, 6.9)
        .to("[data-dust]", { opacity: 1, duration: 1.4 }, 6.3)
        .to("[data-rail-fill]", { scaleX: 1, duration: 0.6 }, 6.35);
      stateTo(2, 6.6);
      nodeOn(3, 6.9);

      // clímax: la frase grande al centro
      tl.to("[data-rail], [data-scrim]", { autoAlpha: 0, duration: 0.5 }, 7.15)
        .to("[data-shade]", { opacity: 0.48, duration: 0.8 }, 7.15)
        .fromTo(
          "[data-climax] [data-meta]",
          { autoAlpha: 0, y: 10 * move },
          { autoAlpha: 1, y: 0, duration: 0.4 },
          7.35,
        )
        .to(
          "[data-climax] [data-word]",
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.6,
            stagger: 0.07,
            ease: "power3.out",
          },
          7.45,
        )
        .fromTo(
          "[data-climax] [data-body]",
          { autoAlpha: 0, y: 14 * move },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          8.1,
        )
        .fromTo(
          "[data-climax] [data-sellos-title]",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.35 },
          8.65,
        )
        .to(
          "[data-sello-ring]",
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.4,
            stagger: 0.15,
            ease: "power2.out",
          },
          8.7,
        )
        .to(
          "[data-sello-path]",
          {
            strokeDashoffset: 0,
            duration: 0.7,
            stagger: 0.04,
            ease: "power1.inOut",
          },
          8.85,
        )
        .to(
          "[data-sello-label]",
          { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.18 },
          9.2,
        );

      // salida: franjas con la paleta del medidor cubren la pantalla hasta la tinta.
      // Dura más que el resto a propósito: el barrido va atado al scroll y,
      // si es corto, un gesto lo completa entero.
      tl.to(
        "[data-band='color']",
        {
          xPercent: 0,
          autoAlpha: 1,
          duration: 2.2,
          stagger: 0.18,
          ease: "power3.inOut",
        },
        11,
      )
        .to(
          "[data-band='ink']",
          {
            xPercent: 0,
            autoAlpha: 1,
            duration: 2.2,
            stagger: 0.18,
            ease: "power3.inOut",
          },
          12.3,
        )
        .to({}, { duration: 0.5 }, 15.2);
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="la-tierra"
      ref={sectionRef}
      aria-label="La tierra comienza a agotarse"
      className="relative h-[920vh] bg-black"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        {/* ---------- fotografía ---------- */}
        <div
          data-plates
          className="absolute inset-0 origin-[50%_60%] will-change-transform"
        >
          {SCENES.map((scene) => (
            <img
              key={scene.id}
              data-plate={scene.id}
              src={scene.src}
              alt=""
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ))}
        </div>

        {/* ---------- atmósfera ---------- */}
        <div
          data-dust
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(226,206,172,0.32)_0%,rgba(200,178,146,0.12)_45%,rgba(120,96,70,0.18)_100%)] mix-blend-screen"
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="m2-fog" />
          <div className="m2-fog m2-fog--slow" />
        </div>
        <div
          data-scrim
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_75%_at_12%_92%,rgba(14,10,6,0.86),rgba(14,10,6,0.45)_45%,transparent_75%)]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-[rgba(12,9,6,0.7)] to-transparent" />
        <div
          data-shade
          className="pointer-events-none absolute inset-0 bg-ink"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(12,9,6,0.55)_100%)]" />
        <div className="m2-grain pointer-events-none absolute inset-0" />
        <div
          data-entry-veil
          className="pointer-events-none absolute inset-x-0 top-0 h-[45vh] bg-linear-to-b from-ink to-transparent"
        />

        <ChapterMark className="z-30">Capítulo 9</ChapterMark>

        {/* ---------- apertura ---------- */}
        <div
          data-intro
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
        >
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-gold/70" />
            <p className="eyebrow on-image text-gold-soft">
              <span className="type-menu-num">°02</span> · Segundo momento
            </p>
            <span className="h-px w-10 bg-gold/70" />
          </div>
          <h2 className="type-menu mt-7 max-w-5xl text-[clamp(2.8rem,8vw,7.2rem)] text-balance text-cream">
            <Words text="La tierra comienza a agotarse" />
          </h2>
        </div>

        {/* ---------- medidor de fertilidad ---------- */}
        <div
          data-ui
          aria-hidden
          className="absolute top-16 right-6 z-20 flex flex-col items-end gap-2 sm:right-10 lg:top-1/2 lg:right-14 lg:-translate-y-1/2 lg:items-center lg:gap-4"
        >
          <p className="eyebrow text-[0.62rem] text-paper/70 lg:[writing-mode:vertical-rl] lg:rotate-180">
            Fertilidad del suelo
          </p>
          <div className="flex flex-row-reverse gap-0.75 lg:flex-col lg:gap-1.25">
            {Array.from({ length: GAUGE_SEGMENTS }, (_, i) => (
              <span
                key={i}
                data-seg
                className="block h-3 w-1.5 rounded-[1px] lg:h-1 lg:w-9"
              />
            ))}
          </div>
          <div className="grid font-display text-lg text-cream italic lg:text-xl">
            {GAUGE_STATES.map((state, i) => (
              <span
                key={state}
                data-state={i}
                className="col-start-1 row-start-1 text-right lg:text-center"
              >
                {state}
              </span>
            ))}
          </div>
        </div>

        {/* ---------- tarjetas 01 y 02 ---------- */}
        {SCENES.slice(0, 2).map((scene) => (
          <article
            key={scene.id}
            data-card={scene.id}
            className="absolute bottom-30 left-6 z-20 max-w-136 pr-6 sm:left-10 sm:bottom-34 lg:left-14 short:sm:bottom-28 tiny:bottom-24 tiny:sm:bottom-24"
          >
            <div data-meta className="flex items-center gap-4">
              <span className="type-menu-num text-[2.4rem] leading-none text-gold">
                °{scene.num}
              </span>
              <span className="h-px w-12 bg-gold/60" />
              <p className="eyebrow text-gold-soft">{scene.kicker}</p>
            </div>
            <h3 className="type-menu mt-4 text-[clamp(1.9rem,min(4vw,6.4vh),3.6rem)] text-balance text-cream">
              <Words text={scene.title} />
            </h3>
            <div data-body>
              <p className="mt-4 max-w-[44ch] text-[clamp(0.95rem,min(1.15vw,2.1vh),1.1rem)] leading-[1.55] text-paper/82 short:mt-3 short:leading-[1.45] tiny:hidden">
                {scene.body}
              </p>

              {scene.id === "presion" ? (
                <div className="mt-7" aria-hidden>
                  <div className="grid grid-cols-3 gap-3">
                    {STRIPS.map((strip, i) => (
                      <div key={strip} data-strip={i}>
                        <div className="h-1.5 overflow-hidden rounded-full bg-paper/12">
                          <div
                            data-strip-fill
                            className="h-full origin-left rounded-full"
                            style={{
                              backgroundColor:
                                i === 0
                                  ? "#d6b26c"
                                  : i === 1
                                    ? "#b88a52"
                                    : "#7f8a52",
                            }}
                          />
                        </div>
                        <p
                          data-strip-label
                          className="eyebrow relative mt-2 inline-block text-[0.62rem] text-paper/80"
                        >
                          {strip}
                          {i === 2 ? (
                            <span
                              data-strike
                              className="absolute top-1/2 left-0 h-px w-full origin-left scale-x-0 bg-gold-soft"
                            />
                          ) : null}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p
                    data-strip-note
                    className="mt-3 font-display text-lg text-gold-soft italic"
                  >
                    La franja que debía descansar ya no se recupera.
                  </p>
                </div>
              ) : null}
            </div>
          </article>
        ))}

        {/* ---------- clímax 03 ---------- */}
        <div
          data-climax
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
        >
          <div data-meta className="flex items-center gap-4">
            <span className="type-menu-num text-2xl leading-none text-gold">
              °{SCENES[2].num}
            </span>
            <span className="h-px w-10 bg-gold/60" />
            <p className="eyebrow text-gold-soft">{SCENES[2].kicker}</p>
          </div>
          <h2 className="type-menu mt-6 max-w-5xl text-[clamp(2.6rem,7vw,6.4rem)] text-balance text-cream">
            <Words text={SCENES[2].title} />
          </h2>
          <p
            data-body
            className="mt-7 max-w-[52ch] text-[clamp(1.02rem,1.25vw,1.15rem)] leading-[1.6] text-paper/82"
          >
            {SCENES[2].body}
          </p>

          <div className="mt-10 sm:mt-12">
            <p
              data-sellos-title
              className="eyebrow text-[0.62rem] text-paper/65"
            >
              La presión también llegó a
            </p>
            <ul className="mt-5 flex items-start justify-center gap-8 sm:gap-14">
              {SELLOS.map((sello) => (
                <li
                  key={sello.id}
                  className="flex w-24 flex-col items-center sm:w-28"
                >
                  <span
                    data-sello-ring
                    className="grid size-16 place-items-center rounded-full border border-gold/35 bg-[rgba(14,10,6,0.35)] backdrop-blur-[2px] sm:size-18"
                  >
                    <svg
                      viewBox="0 0 48 48"
                      className="size-9 text-gold-soft sm:size-10"
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
                  </span>
                  <span
                    data-sello-label
                    className="eyebrow mt-3 text-[0.6rem] leading-snug text-paper/80"
                  >
                    {sello.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- cadena del proceso ---------- */}
        <div
          data-ui
          className="absolute right-20 bottom-7 left-6 z-20 sm:right-52 sm:left-10 lg:left-14"
        >
          <div data-rail aria-hidden>
            <div className="relative mx-[0.4rem] h-px bg-paper/18">
              <div
                data-rail-fill
                className="absolute inset-0 origin-left bg-linear-to-r from-[#d6b26c] via-[#bf7442] to-[#8d8274]"
              />
            </div>
            <ol className="mt-[-0.4rem] grid grid-cols-4">
              {CHAIN.map((step, i) => (
                <li
                  key={step}
                  data-node={i}
                  className={`flex flex-col gap-3 ${
                    i === 0
                      ? "items-start text-left"
                      : i === CHAIN.length - 1
                        ? "items-end text-right"
                        : "items-center text-center"
                  }`}
                >
                  <span
                    data-dot
                    className="block size-[0.8rem] rounded-full border border-paper/45 bg-ink"
                  />
                  <span
                    data-node-label
                    className="max-w-[5.2rem] font-sans text-[0.5rem] leading-snug font-medium tracking-[0.08em] text-paper/45 uppercase opacity-80 sm:max-w-none sm:text-[0.66rem] sm:tracking-[0.16em]"
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ---------- barrido de salida ---------- */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-40 flex flex-col"
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
