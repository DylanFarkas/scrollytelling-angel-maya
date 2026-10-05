import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const SEQUENCE_PROGRESS_EVENT = "frame-sequence-progress";

const loadedFraction = new Map<string, number>();

export function getSequenceProgress(id: string) {
  return loadedFraction.get(id) ?? 0;
}

export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
) {
  const imageRatio = img.naturalWidth / img.naturalHeight;
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

type FrameSequenceOptions = {
  id: string;
  section: HTMLElement;
  canvases: HTMLCanvasElement[];
  frameCount: number;
  src: (index: number) => string;
  /** Progreso suavizado (0–1) a posición exacta de fotograma. */
  position?: (progress: number) => number;
  /** Carga al montar en vez de esperar a que la sección se acerque. */
  eager?: boolean;
};

export function createFrameSequence({
  id,
  section,
  canvases,
  frameCount,
  src,
  position = (progress) => progress * (frameCount - 1),
  eager = false,
}: FrameSequenceOptions) {
  const contexts = canvases
    .map((canvas) => canvas.getContext("2d"))
    .filter((ctx): ctx is CanvasRenderingContext2D => Boolean(ctx));

  const frames = Array.from({ length: frameCount }, () => new Image());
  let requested = false;
  let loaded = 0;
  let destroyed = false;

  let target = 0;
  let shown = 0;
  let dirty = true;
  let wasVisible = false;

  const report = () => {
    const fraction = loaded / frameCount;
    loadedFraction.set(id, fraction);
    window.dispatchEvent(
      new CustomEvent(SEQUENCE_PROGRESS_EVENT, { detail: { id, fraction } }),
    );
  };

  const load = () => {
    if (requested) return;
    requested = true;
    const settle = () => {
      if (destroyed) return;
      loaded += 1;
      dirty = true;
      report();
    };
    frames.forEach((image, index) => {
      image.addEventListener("load", settle, { once: true });
      image.addEventListener("error", settle, { once: true });
      image.src = src(index);
    });

    // Decodificar por lotes evita tirones al llegar a fotogramas nuevos.
    let cursor = 0;
    const decodeNext = () => {
      if (destroyed || cursor >= frames.length) return;
      const slice = frames.slice(cursor, cursor + 8);
      cursor += slice.length;
      Promise.all(slice.map((image) => image.decode().catch(() => undefined))).then(
        decodeNext,
      );
    };
    decodeNext();
  };

  const loader = eager
    ? null
    : ScrollTrigger.create({
        trigger: section,
        start: "top bottom+=150%",
        end: "bottom top",
        onEnter: load,
        onEnterBack: load,
      });
  if (eager) load();
  else if (loader?.isActive) load();

  const resizeCanvas = (canvas: HTMLCanvasElement) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.round(width * ratio);
    const nextHeight = Math.round(height * ratio);
    if (canvas.width === nextWidth && canvas.height === nextHeight) return;
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    dirty = true;
  };

  const paint = () => {
    const exact = gsap.utils.clamp(0, frameCount - 1, position(shown));
    const index = Math.min(frameCount - 2, Math.floor(exact));
    const blend = exact - index;
    const current = frames[index];
    const next = frames[index + 1];
    // Si el fotograma aún no llega se deja el último pintado (o el póster).
    if (!current?.complete || !current.naturalWidth) return;

    contexts.forEach((ctx) => {
      const { width, height } = ctx.canvas;
      if (!width || !height) return;
      ctx.globalAlpha = 1;
      drawCover(ctx, current, width, height);
      if (next?.complete && next.naturalWidth && blend > 0.001) {
        ctx.globalAlpha = blend;
        drawCover(ctx, next, width, height);
        ctx.globalAlpha = 1;
      }
    });
  };

  const tick = () => {
    const rect = section.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < window.innerHeight;
    if (!visible) {
      wasVisible = false;
      return;
    }
    canvases.forEach(resizeCanvas);

    const moving = shown !== target;
    if (moving) {
      shown += (target - shown) * 0.22;
      if (Math.abs(target - shown) < 0.0008) shown = target;
    }
    if (moving || dirty || !wasVisible) {
      paint();
      dirty = false;
    }
    wasVisible = true;
  };

  gsap.ticker.add(tick);

  return {
    setTarget(progress: number) {
      target = gsap.utils.clamp(0, 1, progress);
    },
    jumpTo(progress: number) {
      target = gsap.utils.clamp(0, 1, progress);
      shown = target;
      dirty = true;
    },
    destroy() {
      destroyed = true;
      gsap.ticker.remove(tick);
      loader?.kill();
    },
  };
}
