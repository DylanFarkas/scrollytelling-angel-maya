"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LINES = ["Ambiente +", "sociedad +", "cultura."] as const;

const IDEAS = [
  {
    source: "Ángel Maya · Capítulo 9",
    text: "Agotadas las posibilidades internas, las soluciones técnicas solo sirvieron cuando se ampliaron los horizontes de la explotación.",
    tilt: -4,
  },
  {
    source: "Ángel Maya · Capítulo 10",
    text: "El efecto ambiental más grave de la conquista fue la desintegración de culturas milenarias y, con ellas, del conocimiento del medio acumulado durante miles de años.",
    tilt: 3,
  },
  {
    source: "Ángel Maya · Capítulo 10",
    text: "Desde entonces, el trópico quedó sin ser asumido como escenario cultural.",
    tilt: -2,
  },
] as const;

export function Cierre() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const move = reduced ? 0 : 1;
      const vw = (n: number) => () => window.innerWidth * n * move;
      const vh = (n: number) => () => window.innerHeight * n * move;

      gsap.set("[data-line]", { yPercent: 105 * move, autoAlpha: reduced ? 0 : 1 });
      gsap.set("[data-idea]", { xPercent: -50, yPercent: -50, autoAlpha: 0 });
      gsap.set("[data-final] > *", { autoAlpha: 0, y: 18 * move });

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

      tl.to("[data-line]", {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.7,
        stagger: 0.25,
        ease: "power3.out",
      }, 0.2);

      IDEAS.forEach((idea, i) => {
        const card = `[data-idea='${i}']`;
        const at = 1.6 + i * 2.1;
        const side = i % 2 === 0 ? 1 : -1;
        tl.fromTo(
          card,
          {
            x: vw(0.55 * side),
            y: vh(0.7),
            rotation: 16 * side * move,
            scale: 1 - 0.15 * move,
            autoAlpha: 0,
          },
          {
            x: 0,
            y: 0,
            rotation: idea.tilt * move,
            scale: 1,
            autoAlpha: 1,
            duration: 1,
            ease: "power2.out",
          },
          at,
        ).to(
          card,
          {
            x: vw(-0.6 * side),
            y: vh(-0.75),
            rotation: -14 * side * move,
            autoAlpha: reduced ? 0 : 1,
            duration: 1,
            ease: "power2.in",
          },
          at + 1.45,
        );
      });

      tl.to("[data-giant]", { opacity: 0.1, duration: 0.6 }, 8.0)
        .to("[data-final] > *", { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.3 }, 8.2)
        .to({}, { duration: 1.4 }, 9.1);
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="cierre"
      ref={sectionRef}
      aria-label="Cierre: ambiente, sociedad y cultura"
      className="relative z-20 h-[620vh] bg-black"
    >
      <div className="sticky top-0 flex h-dvh items-center justify-center overflow-hidden px-6">
        <p className="eyebrow absolute top-[14%] left-1/2 -translate-x-1/2 text-gold short:top-[16%]">
          Capítulos 9 y 10 · Una misma historia
        </p>

        <h2
          data-giant
          className="type-menu m-0 text-center text-[min(15vw,21vh)] leading-[0.9] text-cream"
        >
          {LINES.map((line) => (
            <span key={line} className="block overflow-hidden pb-[0.04em]">
              <span data-line className="block">
                {line}
              </span>
            </span>
          ))}
        </h2>

        {IDEAS.map((idea, i) => (
          <figure
            key={idea.text}
            data-idea={i}
            className="absolute top-1/2 left-1/2 m-0 w-[min(30rem,84vw)] rounded-sm bg-paper px-[clamp(1.5rem,3vw,2.5rem)] py-[clamp(1.5rem,3.4vw,2.6rem)] text-center text-ink opacity-0 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)]"
          >
            <span aria-hidden className="block font-display text-6xl leading-[0.5] text-gold">
              “
            </span>
            <blockquote className="m-0 mt-4 font-display text-[clamp(1.25rem,2vw,1.6rem)] leading-[1.22] tracking-[-0.01em] text-balance">
              {idea.text}
            </blockquote>
            <figcaption className="eyebrow mt-5 text-ink/60">{idea.source}</figcaption>
          </figure>
        ))}

        <div
          data-final
          className="absolute inset-x-6 top-1/2 mx-auto grid max-w-4xl -translate-y-1/2 gap-5 text-center"
        >
          <p className="type-menu m-0 text-[clamp(2rem,5vw,4.4rem)] text-balance text-cream">
            El problema no es solamente utilizar los recursos.
          </p>
          <p className="m-0 font-display text-[clamp(1.4rem,2.8vw,2.4rem)] leading-[1.15] text-balance text-cream/90 italic">
            También importa cómo, cuánto y para qué los utilizamos.
          </p>
        </div>
      </div>
    </section>
  );
}