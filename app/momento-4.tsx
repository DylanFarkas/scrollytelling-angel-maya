"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAME_COUNT = 192;
const POSTER_SRC = "/momento4/momento4-inicio.png";

// El cruce entre costas es el tramo largo del video. El 5 no puede comérselo.
const SHIP_AT = 129 / (FRAME_COUNT - 1);
const SHIP_SCROLL = 0.48;

function videoProgress(play: number) {
  if (play <= SHIP_SCROLL) return (play / SHIP_SCROLL) * SHIP_AT;
  return (
    SHIP_AT +
    ((play - SHIP_SCROLL) / (1 - SHIP_SCROLL)) * (1 - SHIP_AT)
  );
}

const LABELS = [
  { id: "cereal", text: "Tierras de cereal" },
  { id: "metales", text: "Metales" },
  { id: "america", text: "América" },
] as const;

function frameSrc(index: number) {
  return `/momento4/frames/frame_${String(index + 1).padStart(3, "0")}.jpg`;
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

export function Momento4() {
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

      let decodeCursor = 0;
      const decodeNext = () => {
        if (decodeCursor >= frames.length) return;
        const slice = frames.slice(decodeCursor, decodeCursor + 8);
        decodeCursor += slice.length;
        Promise.all(
          slice.map((image) => image.decode().catch(() => undefined)),
        ).then(decodeNext);
      };
      decodeNext();

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
        const rect = section.getBoundingClientRect();
        const view = window.innerHeight;
        if (rect.bottom < 0 || rect.top > view) return;

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
      gsap.set("[data-label]", { autoAlpha: 0 });
      gsap.set("[data-label-mark]", { scaleX: 0 });
      gsap.set("[data-header]", { autoAlpha: 0 });

      if (reduced) {
        gsap.set("[data-scene]", { autoAlpha: 1 });
        gsap.set("[data-header]", { autoAlpha: 1 });
        gsap.set(beats, { autoAlpha: 0 });
        gsap.set("[data-beat='afuera']", { autoAlpha: 1, y: 0 });
        gsap.set("[data-label]", { autoAlpha: 1 });
        gsap.set("[data-label-mark]", { scaleX: 1 });
        shownProgress = 1;
        const onScroll = () => paint();
        window.addEventListener("scroll", onScroll, { passive: true });
        paint();
        return () => {
          window.removeEventListener("resize", onResize);
          window.removeEventListener("scroll", onScroll);
        };
      }

      const syncFrames = () => {
        shownProgress += (targetProgress - shownProgress) * 0.22;
        if (Math.abs(targetProgress - shownProgress) < 0.0008) {
          shownProgress = targetProgress;
        }
        paint();
      };

      gsap.ticker.add(syncFrames);

      // Mientras el 3 sigue fijo en las nubes, esta escena se funde encima.
      gsap.fromTo(
        "[data-scene]",
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight}`,
            scrub: true,
          },
        },
      );

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            const sticky = section.querySelector<HTMLElement>("[data-panel]");
            const pin =
              section.offsetHeight - (sticky?.offsetHeight ?? window.innerHeight);
            const fade = pin > 0 ? window.innerHeight / pin : 0;
            const hold = pin > 0 ? (window.innerHeight * 2) / pin : 0;
            const scroll = self.progress;
            if (scroll <= fade) {
              targetProgress = 0;
              return;
            }
            if (scroll >= 1 - hold) {
              targetProgress = 1;
              return;
            }
            targetProgress = videoProgress(
              (scroll - fade) / (1 - fade - hold),
            );
          },
        },
      });

      const light = (id: string, at: number) => {
        timeline
          .to(
            `[data-label='${id}']`,
            { autoAlpha: 1, duration: 0.35 },
            at,
          )
          .to(
            `[data-label='${id}'] [data-label-mark]`,
            { scaleX: 1, duration: 0.4 },
            at,
          );
      };

      // El primer tramo sigue en las nubes, sin anunciar otra sección.
      timeline
        .fromTo(
          "[data-header]",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.4 },
          1.7,
        )
        .fromTo(
          "[data-beat='limites']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          2.2,
        )
        .to("[data-beat='limites']", { autoAlpha: 0, y: -14, duration: 0.4 }, 3.9)
        .fromTo(
          "[data-beat='afuera']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.55 },
          5.1,
        );

      light("cereal", 6.0);
      light("metales", 7.2);
      light("america", 8.5);
      timeline.to({}, { duration: 1.6 }, 8.8);

      return () => {
        window.removeEventListener("resize", onResize);
        gsap.ticker.remove(syncFrames);
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Europa mira hacia afuera"
      className="relative z-10 mt-[-200vh] h-[1040vh] bg-transparent"
    >
      <div data-panel className="sticky top-0 h-dvh overflow-hidden">
        <div data-scene className="absolute inset-0 opacity-0">
          <img
            src={POSTER_SRC}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,14,8,0.28),rgba(20,14,8,0.06)_46%,rgba(20,14,8,0.46)_100%)]" />
        </div>

        <header
          data-header
          className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 opacity-0 sm:px-10"
        >
          <p className="font-sans text-[0.68rem] tracking-[0.22em] text-paper/80 uppercase">
            Ángel Maya
          </p>
          <p className="font-sans text-[0.68rem] tracking-[0.22em] text-paper/80 uppercase">
            Capítulo 10
          </p>
        </header>

        <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p
              data-beat="limites"
              className="max-w-4xl text-center font-display text-[clamp(2rem,4.6vw,4.2rem)] leading-[1.05] font-medium text-balance text-[#f7f3ea] opacity-0"
            >
              Europa estaba llegando
              <br />
              a sus propios límites.
            </p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6 pb-16">
            <p
              data-beat="afuera"
              className="max-w-5xl text-center font-display text-[clamp(2rem,4.4vw,4rem)] leading-[1.05] font-medium text-balance text-[#f7f3ea] opacity-0"
            >
              Si los recursos se acababan dentro…
              <br />
              había que mirar hacia afuera.
            </p>
          </div>
        </div>

        <ol className="absolute inset-x-6 bottom-8 z-20 flex items-end justify-center gap-8 sm:inset-x-10 sm:gap-14">
          {LABELS.map((label) => (
            <li key={label.id} data-label={label.id} className="text-center">
              <span
                data-label-mark
                className="mx-auto mb-3 block h-px w-8 origin-left bg-[#c4a36a]"
              />
              <span className="font-sans text-[0.62rem] tracking-[0.22em] text-[#f7f3ea] uppercase sm:text-[0.68rem]">
                {label.text}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
