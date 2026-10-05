"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { getLenis } from "./smooth-scroll";
import { SEQUENCE_PROGRESS_EVENT, getSequenceProgress } from "./frame-sequence";
import { markStoryReady } from "../lib/story-ready";

gsap.registerPlugin(useGSAP);

// El inicio solo necesita los primeros fotogramas; el resto sigue cargando detrás.
const READY_AT = 0.16;
const MIN_TIME = 1.8;
const MAX_TIME = 5;

export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const html = document.documentElement;
      let revealed = false;
      const reveal = () => {
        if (revealed) return;
        revealed = true;
        html.style.overflow = "";
        getLenis()?.start();
        markStoryReady();
      };
      const finish = () => {
        reveal();
        setGone(true);
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
        return;
      }

      html.style.overflow = "hidden";
      const holdScroll = () => {
        const lenis = getLenis();
        if (lenis && !lenis.isStopped) lenis.stop();
      };
      gsap.ticker.add(holdScroll);

      // Si el navegador restauró el scroll más abajo, los fotogramas del inicio no importan.
      const needsFrames = window.scrollY < window.innerHeight;
      const shown = { value: 0 };
      const started = performance.now();
      let leaving = false;

      const sky = root.querySelector<HTMLElement>("[data-sky]");
      const ground = root.querySelector<HTMLElement>("[data-ground]");
      const flood = root.querySelector<HTMLElement>("[data-flood]");
      const sun = root.querySelector<HTMLElement>("[data-sun]");
      const glow = root.querySelector<HTMLElement>("[data-glow]");
      const count = root.querySelector<HTMLElement>("[data-count]");

      const render = () => {
        const p = shown.value;
        gsap.set(sun, { xPercent: -50, yPercent: (1 - p) * 110 });
        gsap.set(glow, {
          xPercent: -50,
          yPercent: 50,
          scale: 0.55 + p * 0.45,
          opacity: 0.25 + p * 0.75,
        });
        if (count)
          count.textContent = String(Math.round(p * 100)).padStart(3, "0");
      };

      // El transform inicial del HTML es solo para el primer pintado del servidor.
      gsap.set([sun, glow], { clearProps: "transform" });
      render();

      const leave = () => {
        if (leaving) return;
        leaving = true;
        gsap.ticker.remove(holdScroll);
        // Como en ComPsych: la luz satura el cielo, el horizonte baja y empuja
        // el suelo fuera de cuadro, y el inicio aparece bajo esa luz.
        gsap
          .timeline({ onComplete: finish })
          .to(shown, {
            value: 1,
            duration: 0.5,
            ease: "power2.out",
            onUpdate: render,
          })
          .to(
            "[data-copy]",
            { autoAlpha: 0, y: -10, duration: 0.4, ease: "power1.in" },
            0.15,
          )
          .to(
            glow,
            { scale: 3.4, opacity: 1, duration: 1.1, ease: "power2.in" },
            0.5,
          )
          .to(sun, { scale: 1.5, duration: 1.1, ease: "power2.in" }, 0.5)
          .to(flood, { opacity: 1, duration: 1.1, ease: "power2.in" }, 0.5)
          .to(
            sky,
            { height: "100%", duration: 1.05, ease: "power3.inOut" },
            1.0,
          )
          .to(
            ground,
            { yPercent: 100, duration: 1.05, ease: "power3.inOut" },
            1.0,
          )
          .add(reveal, 2.0)
          .to(root, { autoAlpha: 0, duration: 0.9, ease: "power2.out" }, 2.0);
      };

      const update = () => {
        if (leaving) return;
        const elapsed = (performance.now() - started) / 1000;
        const loaded = needsFrames
          ? Math.min(1, getSequenceProgress("momento1") / READY_AT)
          : 1;
        const timed = Math.min(1, elapsed / MIN_TIME);
        const goal = Math.min(loaded, timed);
        shown.value += (goal - shown.value) * 0.08;
        render();
        if ((goal >= 1 && shown.value > 0.97) || elapsed > MAX_TIME) leave();
      };

      gsap.ticker.add(update);
      window.addEventListener(SEQUENCE_PROGRESS_EVENT, update);

      return () => {
        gsap.ticker.remove(update);
        gsap.ticker.remove(holdScroll);
        window.removeEventListener(SEQUENCE_PROGRESS_EVENT, update);
        html.style.overflow = "";
      };
    },
    { scope: rootRef },
  );

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-label="Cargando la historia"
      className="preloader fixed inset-0 z-60 overflow-hidden bg-black text-paper"
    >
      <div
        data-sky
        className="absolute inset-x-0 top-0 h-[58%] overflow-hidden"
      >
        <div
          data-flood
          className="absolute inset-0 bg-[linear-gradient(180deg,#d9bf8c_0%,#f3e2bf_55%,#fffaf0_100%)] opacity-0"
        />
        <div
          data-glow
          className="absolute bottom-0 left-1/2 aspect-square w-[min(130vw,1400px)] rounded-full bg-[radial-gradient(closest-side,rgba(247,226,180,0.55),rgba(196,163,106,0.28)_35%,rgba(90,68,38,0.12)_62%,transparent)] opacity-25"
          style={{ transform: "translate(-50%, 50%) scale(0.55)" }}
        />
        <div
          data-sun
          className="absolute bottom-0 left-1/2 size-[clamp(3rem,6vw,4.5rem)] rounded-full bg-[radial-gradient(circle,#fff8e8,#f2dcae_55%,#e2c690)] shadow-[0_0_60px_18px_rgba(226,198,144,0.45)]"
          style={{ transform: "translate(-50%, 110%)" }}
        />
      </div>

      <div
        data-ground
        className="absolute inset-x-0 top-[58%] bottom-0 bg-black"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-paper/18" />
        <div
          data-copy
          className="absolute inset-x-0 top-0 flex flex-col items-center gap-3 pt-7 text-center"
        >
          <p className="eyebrow text-paper/70">
            Augusto Ángel Maya · Capítulos 9 y 10
          </p>
          <p className="font-display text-xl text-cream/85 italic">
            Cuando la tierra ya no alcanza
          </p>
          <p className="type-menu-num mt-2 text-[0.7rem] tracking-[0.2em] text-gold">
            <span data-count>000</span>
          </p>
        </div>
      </div>
    </div>
  );
}
