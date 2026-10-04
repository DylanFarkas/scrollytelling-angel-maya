"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import AccordionGallery from "./components/accordion-gallery";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAME_COUNT = 337;
const POSTER_SRC = "/momento5/momento5-inicio.png";
// Los primeros 4 s van al doble de fotogramas: el mar, si no, salta entre olas.
const OPEN_FRAMES = 189;
const OPEN_TIME = 188 / 48;
const TOTAL_TIME = 242 / 24;

function framePosition(progress: number) {
  const t = Math.min(TOTAL_TIME, Math.max(0, progress * TOTAL_TIME));
  if (t <= OPEN_TIME) return (t / OPEN_TIME) * (OPEN_FRAMES - 1);
  const u = (t - OPEN_TIME) / (TOTAL_TIME - OPEN_TIME);
  return OPEN_FRAMES - 1 + u * (FRAME_COUNT - OPEN_FRAMES);
}

function frameSrc(index: number) {
  return `/momento5/frames/frame_${String(index + 1).padStart(3, "0")}.jpg`;
}

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
] as const;

const FRASE_CONQUISTA =
  "La conquista interrumpió formas de adaptación que ya existían, y puso la tierra al servicio de la acumulación europea.";

const FRASE_CHILAM =
  "Ellos vinieron a marchitar las flores. Para que su flor viviese, destruyeron nuestra flor.";

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

function Momento5Quiebre() {
  const [active, setActive] = useState(0);
  const onChange = useCallback((index: number) => {
    setActive(index);
  }, []);

  const last = active === QUIEBRE_ITEMS.length - 1;

  return (
    <section
      aria-label="El quiebre: América interrumpida"
      className="relative z-20 bg-ink"
    >
      <div className="flex min-h-dvh flex-col justify-center gap-10 px-6 py-16 sm:px-10">
        <header className="flex items-center justify-between">
          <p className="font-sans text-[0.68rem] tracking-[0.22em] text-paper/80 uppercase">
            Ángel Maya
          </p>
          <p className="font-sans text-[0.68rem] tracking-[0.22em] text-paper/80 uppercase">
            Capítulo 10
          </p>
        </header>

        <AccordionGallery
          items={[...QUIEBRE_ITEMS]}
          defaultIndex={0}
          accentColor="#c4a36a"
          overlayColor="#14110e"
          textColor="#f7f3ea"
          height={620}
          gap={10}
          radius={16}
          expandRatio={0.52}
          trigger="hover"
          grayscale
          showLabels
          onChange={onChange}
        />

        <p
          key={last ? "chilam" : "conquista"}
          className="mx-auto max-w-4xl text-center font-display text-[clamp(1.35rem,2.8vw,2.15rem)] leading-[1.2] font-medium text-balance text-[#f7f3ea]"
        >
          {last ? FRASE_CHILAM : FRASE_CONQUISTA}
        </p>
      </div>
    </section>
  );
}

export function Momento5() {
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

        const exact = framePosition(shownProgress);
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

      if (reduced) {
        gsap.set("[data-scene]", { autoAlpha: 1 });
        gsap.set("[data-beat='antes']", { autoAlpha: 1, y: 0 });
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
            const hold = fade * 0.2;
            const scroll = self.progress;
            targetProgress = scroll <= hold ? 0 : (scroll - hold) / (1 - hold);
          },
        },
      });

      timeline
        .fromTo(
          "[data-beat='antes']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.55 },
          7.7,
        )
        .to({}, { duration: 1.6 }, 8.4);

      return () => {
        window.removeEventListener("resize", onResize);
        gsap.ticker.remove(syncFrames);
      };
    },
    { scope: sectionRef },
  );

  return (
    <>
      <section
        ref={sectionRef}
        aria-label="América ya tenía una historia"
        className="relative z-20 mt-[-200vh] h-[860vh] bg-transparent"
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

          <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10">
            <p className="font-sans text-[0.68rem] tracking-[0.22em] text-paper/80 uppercase">
              Ángel Maya
            </p>
            <p className="font-sans text-[0.68rem] tracking-[0.22em] text-paper/80 uppercase">
              Capítulo 10
            </p>
          </header>

          <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
            <p
              data-beat="antes"
              className="max-w-5xl text-center font-display text-[clamp(1.8rem,4vw,3.6rem)] leading-[1.08] font-medium text-balance text-[#f7f3ea] opacity-0"
            >
              Mucho antes de la llegada europea,
              <br />
              ya existían formas de vivir
              <br />
              y adaptarse al territorio.
            </p>
          </div>
        </div>
      </section>
      <Momento5Quiebre />
    </>
  );
}
