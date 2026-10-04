"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAME_COUNT = 193;
const POSTER_SRC = "/momento3/momento3-inicio.png";

// Hasta la balanza inclinada el scroll acompaña el texto.
// Desde ese fotograma el video sigue a un ritmo más corto, hasta las nubes.
const SCALE_AT = 108 / (FRAME_COUNT - 1);
const SCALE_SCROLL = 0.62;

function videoProgress(scroll: number) {
  if (scroll <= SCALE_SCROLL) return (scroll / SCALE_SCROLL) * SCALE_AT;
  return (
    SCALE_AT +
    ((scroll - SCALE_SCROLL) / (1 - SCALE_SCROLL)) * (1 - SCALE_AT)
  );
}

function frameSrc(index: number) {
  return `/momento3/frames/frame_${String(index + 1).padStart(3, "0")}.jpg`;
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

export function Momento3() {
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
      gsap.set("[data-beat='hero']", { autoAlpha: 1, y: 0 });

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

      if (reduced) {
        gsap.set(beats, { autoAlpha: 0 });
        gsap.set("[data-beat='limite']", { autoAlpha: 1, y: 0 });
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

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            targetProgress = videoProgress(self.progress);
          },
        },
      });

      // La línea de tiempo dura 10. Hasta 6.2 la balanza; después el acercamiento y las nubes.
      timeline
        .to("[data-beat='hero']", { autoAlpha: 0, y: -14, duration: 0.45 }, 0.7)
        .fromTo(
          "[data-beat='hambre']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.4 },
          1.15,
        )
        .to("[data-beat='hambre']", { autoAlpha: 0, y: -14, duration: 0.3 }, 2.4)
        .fromTo(
          "[data-beat='guerra']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.4 },
          2.85,
        )
        .to("[data-beat='guerra']", { autoAlpha: 0, y: -14, duration: 0.3 }, 4.15)
        .fromTo(
          "[data-beat='peste']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.4 },
          4.6,
        )
        .to("[data-beat='peste']", { autoAlpha: 0, y: -14, duration: 0.3 }, 6.05)
        .fromTo(
          "[data-beat='limite']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          7.7,
        )
        .to({}, { duration: 1.8 }, 8.2);

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
      aria-label="La crisis"
      className="relative z-0 h-[760vh] bg-ink"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        <img
          src={POSTER_SRC}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="absolute inset-0 z-1 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,14,8,0.28),rgba(20,14,8,0.06)_46%,rgba(20,14,8,0.46)_100%)]" />
        <div
          data-entry-veil
          className="pointer-events-none absolute inset-x-0 top-0 z-5 h-[45vh] bg-linear-to-b from-ink to-transparent"
        />

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
              <p className="font-sans text-[0.68rem] tracking-[0.32em] text-[#c4a36a] uppercase">
                Tercer momento
              </p>
              <h2 className="mt-6 font-display text-[clamp(3.2rem,8vw,7.4rem)] leading-[0.9] font-medium tracking-[-0.02em] text-balance text-[#f7f3ea]">
                La crisis
              </h2>
              <p className="mx-auto mt-8 max-w-lg font-display text-[clamp(1.25rem,2vw,1.7rem)] leading-snug font-normal text-[#f7f3ea]/90 italic">
                El deterioro del territorio
                <br />
                se volvió hambre, guerra y peste.
              </p>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p
              data-beat="hambre"
              className="max-w-4xl text-center font-display text-[clamp(2rem,4.6vw,4.2rem)] leading-[1.05] font-medium text-balance text-[#f7f3ea] opacity-0"
            >
              Hambre. El pan se pone inalcanzable.
              <br />
              Pueblos enteros quedan vacíos.
            </p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p
              data-beat="guerra"
              className="max-w-4xl text-center font-display text-[clamp(2rem,4.6vw,4.2rem)] leading-[1.05] font-medium text-balance text-[#f7f3ea] opacity-0"
            >
              Antes que la peste, la guerra.
              <br />
              Tampoco había hacia dónde ir.
            </p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p
              data-beat="peste"
              className="max-w-4xl text-center font-display text-[clamp(2rem,4.6vw,4.2rem)] leading-[1.05] font-medium text-balance text-[#f7f3ea] opacity-0"
            >
              La peste llegó después,
              <br />
              cuando el campo ya se había rendido.
            </p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <h2
              data-beat="limite"
              className="max-w-5xl text-center font-display text-[clamp(2.8rem,6.6vw,6.2rem)] leading-[0.95] font-medium tracking-[-0.02em] text-balance text-[#f7f3ea] opacity-0"
            >
              Ya no hay hacia dónde ir.
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
