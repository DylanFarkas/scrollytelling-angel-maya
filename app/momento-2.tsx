"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SCENES = [
  {
    id: "verde",
    src: "/momento2/verde.png",
    kicker: "La expansión",
    title: "El campo se abre",
    body: "Durante siglos Europa roturó el bosque para sembrar. La tierra parecía no tener límite. Cada nuevo claro era más campo, más pan y más gente.",
  },
  {
    id: "presion",
    src: "/momento2/presion.png",
    kicker: "La rotación trienal",
    title: "El suelo ya no descansa",
    body: "Sembrar en tres tiempos permitió cosechar más seguido: una franja con trigo, otra en rastrojo, otra que debía descansar. Al principio el suelo aguantaba. En el siglo XIV las tierras nuevas eran peores, y el abono ya no alcanzaba a devolver lo que la cosecha se llevaba.",
  },
  {
    id: "agotado",
    src: "/momento2/agotado.png",
    kicker: "El límite",
    title: "La tierra empezó a cansarse",
    body: "Bajó la cosecha. El alimento de las personas empezó a competir con el de los bueyes y los caballos. Detrás del suelo cansado llegaron el hambre, los precios altos y la crisis.",
  },
] as const;

export function Momento2() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set("[data-plate]", { autoAlpha: 0 });
      gsap.set("[data-plate='verde']", { autoAlpha: 1 });
      gsap.set("[data-story]", { autoAlpha: 0, y: 16 });
      gsap.set("[data-story='verde']", { autoAlpha: 1, y: 0 });

      if (reduced) {
        gsap.set("[data-plate]", { autoAlpha: 0 });
        gsap.set("[data-plate='agotado']", { autoAlpha: 1 });
        gsap.set("[data-story]", { autoAlpha: 0, y: 0 });
        gsap.set("[data-story='agotado']", { autoAlpha: 1, y: 0 });
        return;
      }

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      timeline
        .to("[data-plate='verde']", { autoAlpha: 0, duration: 1 }, 1.15)
        .to("[data-story='verde']", { autoAlpha: 0, y: -12, duration: 0.8 }, 1.05)
        .fromTo(
          "[data-plate='presion']",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 1 },
          1.15,
        )
        .fromTo(
          "[data-story='presion']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          1.25,
        )
        .to("[data-plate='presion']", { autoAlpha: 0, duration: 1 }, 2.7)
        .to("[data-story='presion']", { autoAlpha: 0, y: -12, duration: 0.8 }, 2.6)
        .fromTo(
          "[data-plate='agotado']",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 1 },
          2.7,
        )
        .fromTo(
          "[data-story='agotado']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          2.8,
        )
        .to({}, { duration: 1.2 }, 3.8);
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative h-[460vh] bg-[#0A0A0A]">
      <div className="sticky top-0 flex h-dvh flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-14">
          <p className="font-sans text-[0.68rem] tracking-[0.22em] text-paper/80 uppercase">
            Ángel Maya
          </p>
          <p className="font-sans text-[0.68rem] tracking-[0.22em] text-paper/80 uppercase">
            Capítulo 9
          </p>
        </header>

        <div className="grid min-h-0 flex-1 items-center gap-8 px-6 pb-10 sm:px-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:gap-14 lg:px-14 lg:pb-16">
          <div className="relative mx-auto aspect-video w-full max-w-5xl overflow-hidden">
            {SCENES.map((scene) => (
              <img
                key={scene.id}
                data-plate={scene.id}
                src={scene.src}
                alt=""
                className="absolute inset-0 h-full w-full object-contain"
              />
            ))}
          </div>

          <div className="grid">
            {SCENES.map((scene) => (
              <article
                key={scene.id}
                data-story={scene.id}
                className="col-start-1 row-start-1 max-w-md"
              >
                <p className="font-sans text-[0.68rem] tracking-[0.22em] text-[#c4a36a] uppercase">
                  {scene.kicker}
                </p>
                <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] font-medium text-balance text-[#f7f3ea]">
                  {scene.title}
                </h2>
                <p className="mt-5 font-display text-lg leading-relaxed text-paper/85 italic sm:text-xl">
                  {scene.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
