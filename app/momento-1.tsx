"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAME_COUNT = 124;
const POSTER_SRC = "/momento1/momento1-inicio.png";

function frameSrc(index: number) {
  return `/momento1/frames/frame_${String(index + 1).padStart(3, "0")}.jpg`;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  width: number,
  height: number,
) {
  const source = img as HTMLImageElement;
  const imageRatio = source.width / source.height;
  const canvasRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  let offsetX = 0;
  let offsetY = 0;

  if (imageRatio > canvasRatio) {
    drawWidth = height * imageRatio;
    offsetX = (width - drawWidth) / 2;
  } else {
    drawHeight = width / imageRatio;
    offsetY = (height - drawHeight) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

export function Momento1() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const canvas = canvasRef.current;
      if (!section || !canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const frames = Array.from({ length: FRAME_COUNT }, (_, index) => {
        const image = new Image();
        image.src = frameSrc(index);
        return image;
      });
      framesRef.current = frames;

      let targetProgress = reduced ? 1 : 0;
      let shownProgress = targetProgress;

      const resize = () => {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      };

      const paint = () => {
        const width = canvas.width;
        const height = canvas.height;
        if (!width || !height) return;

        const exact = shownProgress * (FRAME_COUNT - 1);
        const index = Math.min(FRAME_COUNT - 2, Math.floor(exact));
        const blend = exact - index;
        const current = frames[index];
        const next = frames[index + 1];

        ctx.clearRect(0, 0, width, height);
        if (current?.complete && current.naturalWidth) {
          ctx.globalAlpha = 1;
          drawCover(ctx, current, width, height);
        }
        if (next?.complete && next.naturalWidth && blend > 0.001) {
          ctx.globalAlpha = blend;
          drawCover(ctx, next, width, height);
          ctx.globalAlpha = 1;
        }
      };

      resize();
      const onResize = () => {
        resize();
        paint();
      };
      window.addEventListener("resize", onResize);
      if (frames[0]?.complete) paint();
      else frames[0]?.addEventListener("load", paint, { once: true });

      const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", section);
      gsap.set(beats, { autoAlpha: 0, y: 28 });
      gsap.set("[data-beat='hero']", { autoAlpha: 1, y: 0 });

      if (reduced) {
        gsap.set(beats, { autoAlpha: 0 });
        gsap.set("[data-beat='pregunta']", { autoAlpha: 1, y: 0 });
        gsap.set("[data-scroll-hint]", { autoAlpha: 0 });
        shownProgress = 1;
        paint();
        return () => window.removeEventListener("resize", onResize);
      }

      const lenis = new Lenis({
        lerp: 0.075,
        smoothWheel: true,
        wheelMultiplier: 0.85,
        syncTouch: true,
      });
      lenis.on("scroll", ScrollTrigger.update);

      const raf = (time: number) => {
        lenis.raf(time * 1000);
      };
      const syncFrames = () => {
        shownProgress += (targetProgress - shownProgress) * 0.22;
        if (Math.abs(targetProgress - shownProgress) < 0.0008) {
          shownProgress = targetProgress;
        }
        paint();
      };

      gsap.ticker.add(raf);
      gsap.ticker.add(syncFrames);
      gsap.ticker.lagSmoothing(0);

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            targetProgress = self.progress;
          },
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
        window.removeEventListener("resize", onResize);
        gsap.ticker.remove(raf);
        gsap.ticker.remove(syncFrames);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative h-[620vh] bg-ink">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <img
          src={POSTER_SRC}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="absolute inset-0 z-1 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,14,8,0.34),rgba(20,14,8,0.08)_46%,rgba(20,14,8,0.42)_100%)]" />

        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10">
          <p className="font-sans text-[0.68rem] tracking-[0.22em] text-paper/80 uppercase">
            Ángel Maya
          </p>
          <p className="font-sans text-[0.68rem] tracking-[0.22em] text-paper/80 uppercase">
            Capítulo 9
          </p>
        </header>

        <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div data-beat="hero" className="max-w-4xl text-center">
              <h1 className="font-display text-[clamp(3.2rem,8vw,7.4rem)] leading-[0.9] font-medium tracking-[-0.02em] text-balance text-[#f7f3ea]">
                Cuando la tierra
                <br />
                ya no alcanza
              </h1>
              <p className="mx-auto mt-8 max-w-md font-display text-[clamp(1.25rem,2vw,1.7rem)] leading-snug font-normal text-[#f7f3ea]/90 italic">
                Europa crecía.
                <br />
                Pero sus recursos tenían un límite.
              </p>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <h2
              data-beat="campos"
              className="max-w-3xl text-center font-display text-[clamp(2.6rem,6vw,5.4rem)] leading-[0.95] font-medium text-balance text-[#f7f3ea] opacity-0"
            >
              Se abren los campos.
              <br />
              Crece la población.
            </h2>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <h2
              data-beat="bosque"
              className="max-w-3xl text-center font-display text-[clamp(2.6rem,6vw,5.4rem)] leading-[0.95] font-medium text-balance text-[#f7f3ea] opacity-0"
            >
              Aumenta la producción.
              <br />
              El bosque retrocede.
            </h2>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p
              data-beat="pregunta"
              className="max-w-4xl text-center font-display text-[clamp(2rem,4.4vw,4.1rem)] leading-[1.05] font-medium text-balance text-[#f7f3ea] opacity-0"
            >
              ¿Qué ocurre cuando una sociedad necesita cada vez más, pero el
              territorio ya no puede darle lo suficiente?
            </p>
          </div>
        </div>

        <p
          data-scroll-hint
          className="absolute inset-x-0 bottom-8 z-20 text-center font-sans text-[0.72rem] tracking-[0.28em] text-paper/75 uppercase"
        >
          Haz scroll
        </p>
      </div>
    </section>
  );
}
