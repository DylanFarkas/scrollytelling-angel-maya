"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
} from "react";
import { gsap } from "gsap";

export interface AccordionGalleryItem {
  image: string;
  label?: string;
  link?: string;
  alt?: string;
}

export interface AccordionGalleryProps {
  items?: AccordionGalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  /** Número en px o cualquier longitud CSS. */
  height?: number | string;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: "horizontal" | "vertical";
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: "hover" | "click";
  showLabels?: boolean;
  grayscale?: boolean;
  /** Etiqueta enorme y tenue, en vertical, dentro de los paneles cerrados. */
  ghostLabels?: boolean;
  className?: string;
  /** Panel abierto controlado desde fuera (por ejemplo, por el scroll). */
  activeIndex?: number;
  /** Con activeIndex, el usuario pide un panel y el padre decide. */
  onSelect?: (index: number) => void;
  onChange?: (index: number) => void;
}

const DEFAULT_ITEMS: AccordionGalleryItem[] = [
  { image: "https://picsum.photos/id/1015/900/1200", label: "Canyon", link: "#" },
  {
    image: "https://picsum.photos/id/1018/900/1200",
    label: "Ridgeline",
    link: "#",
  },
  { image: "https://picsum.photos/id/1039/900/1200", label: "Falls", link: "#" },
  {
    image: "https://picsum.photos/id/1043/900/1200",
    label: "Harbour",
    link: "#",
  },
  {
    image: "https://picsum.photos/id/1044/900/1200",
    label: "Skyline",
    link: "#",
  },
];

const AccordionGallery = ({
  items = DEFAULT_ITEMS,
  defaultIndex = 2,
  accentColor = "#ffffff",
  overlayColor = "#060010",
  textColor = "#ffffff",
  height = 460,
  gap = 10,
  radius = 16,
  expandRatio = 0.52,
  orientation = "horizontal",
  duration = 0.6,
  ease = "power3.out",
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = "hover",
  showLabels = true,
  grayscale = true,
  ghostLabels = false,
  className = "",
  activeIndex,
  onSelect,
  onChange,
}: AccordionGalleryProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLElement | null)[]>([]);
  const barRefs = useRef<(HTMLElement | null)[]>([]);
  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const ghostRefs = useRef<(HTMLElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);

  const vertical = orientation === "vertical";
  const count = items.length;
  const [ownActive, setOwnActive] = useState(
    Math.min(Math.max(defaultIndex, 0), count - 1),
  );
  const controlled = activeIndex !== undefined;
  const active = controlled
    ? Math.min(Math.max(activeIndex, 0), count - 1)
    : ownActive;
  const setActive = useCallback(
    (next: number | ((current: number) => number)) => {
      const value = typeof next === "function" ? next(active) : next;
      if (controlled) onSelect?.(value);
      else setOwnActive(value);
    },
    [active, controlled, onSelect],
  );

  const prefersReduced =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const overlayBg = `linear-gradient(180deg, transparent 45%, color-mix(in srgb, ${overlayColor} 78%, transparent) 100%), color-mix(in srgb, ${overlayColor} calc(var(--ag-dim, 0.35) * 100%), transparent)`;

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const root = rootRef.current;
      const cross = vertical ? (root?.clientWidth ?? 0) : (root?.clientHeight ?? 0);
      const main = vertical ? (root?.clientHeight ?? 0) : (root?.clientWidth ?? 0);
      const usable = Math.max(main - gap * Math.max(count - 1, 0), 0);
      const activeImg = mediaRefs.current[active]?.querySelector("img");
      const aspect =
        activeImg && activeImg.naturalWidth > 0
          ? activeImg.naturalWidth / activeImg.naturalHeight
          : 0;

      // El panel abierto toma la proporción de la foto. Si no, object-cover
      // la recorta y parece un zoom sobre el centro.
      let grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
      if (aspect > 0 && cross > 0 && usable > 0 && count > 1) {
        const fitted = vertical ? cross / aspect : cross * aspect;
        const activeMain = Math.min(usable * 0.72, Math.max(usable * 0.22, fitted));
        const inactive = (usable - activeMain) / (count - 1);
        if (inactive > 1) grow = activeMain / inactive;
      }

      tlRef.current?.kill();
      const dur = animate && !prefersReduced ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const media = mediaRefs.current[i];
        const bar = barRefs.current[i];
        const text = textRefs.current[i];
        const ghost = ghostRefs.current[i];

        const rot = isActive ? 0 : i < active ? tilt : -tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

        tl.to(
          panel,
          { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease },
          0,
        );

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          const shift = drift * parallax * 12;
          const gray = grayscale ? (isActive ? 0 : 1) : 0;
          const picture = media.querySelector("img");
          if (picture) picture.style.objectFit = isActive ? "contain" : "cover";
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : isActive ? 0 : shift,
              y: vertical ? (isActive ? 0 : shift) : 0,
              scale: isActive ? 1 : 1.14,
              "--ag-gray": gray,
              "--ag-dim": isActive ? 0 : 0.35,
              duration: dur,
              ease,
            },
            0,
          );
        }

        if (ghost) {
          tl.to(
            ghost,
            { opacity: isActive ? 0 : 0.24, duration: dur, ease },
            0,
          );
        }

        if (showLabels && bar && text) {
          if (isActive) {
            tl.to(
              [bar, text],
              {
                opacity: 1,
                x: 0,
                duration: dur,
                ease,
                stagger: prefersReduced ? 0 : stagger,
              },
              0,
            );
          } else {
            tl.to(
              [bar, text],
              { opacity: 0, x: -14, duration: dur * 0.6, ease },
              0,
            );
          }
        }
      });

      tlRef.current = tl;
    },
    [
      active,
      count,
      expandRatio,
      duration,
      ease,
      vertical,
      gap,
      tilt,
      parallax,
      grayscale,
      showLabels,
      stagger,
      prefersReduced,
    ],
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      applyLayout(!firstRunRef.current);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const onLoad = () => measure();
    const imgs = [...el.querySelectorAll("img")];
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", onLoad);
    });
    return () => {
      ro.disconnect();
      imgs.forEach((img) => img.removeEventListener("load", onLoad));
    };
  }, [applyLayout]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(() => {
    onChange?.(active);
  }, [active, onChange]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
    },
    [],
  );

  const handleEnter = (i: number) => {
    if (trigger === "hover") setActive(i);
  };

  const handleClick = (i: number, e: MouseEvent) => {
    if (i !== active) {
      e.preventDefault();
      setActive(i);
    }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i + 1) % count);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i - 1 + count) % count);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`flex ${vertical ? "flex-col" : "flex-row"} w-full max-w-full perspective-[1400px] max-[520px]:flex-col! max-[520px]:perspective-none ${className}`}
      style={{
        gap: `${gap}px`,
        height:
          typeof height === "string"
            ? height
            : vertical
              ? `${Math.round(height * 1.6)}px`
              : `${height}px`,
      }}
      role="list"
      aria-label="Image accordion gallery"
    >
      {items.map((item, i) => {
        const isActive = i === active;
        const Tag = (item.link ? "a" : "div") as "a";
        return (
          <Tag
            key={i}
            ref={(el: HTMLElement | null) => {
              panelRefs.current[i] = el;
            }}
            className="group relative block min-h-0 min-w-0 flex-[1_1_0] cursor-pointer overflow-hidden bg-[#0e0b08] no-underline outline-none origin-center transform-3d [box-shadow:0_10px_30px_-18px_rgba(0,0,0,0.8)] focus-visible:[box-shadow:0_0_0_2px_var(--ag-accent),0_10px_30px_-18px_rgba(0,0,0,0.8)] max-[520px]:min-h-21 max-[520px]:transform-none!"
            style={
              {
                borderRadius: `${radius}px`,
                "--ag-accent": accentColor,
                willChange: "flex-grow, transform",
              } as CSSProperties
            }
            href={item.link || undefined}
            onClick={(e) => handleClick(i, e)}
            onMouseEnter={() => handleEnter(i)}
            onFocus={() => setActive(i)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? "true" : undefined}
            aria-label={item.label}
          >
            <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
              <span
                ref={(el: HTMLElement | null) => {
                  mediaRefs.current[i] = el;
                }}
                className="absolute top-1/2 left-1/2 h-full w-full filter-[grayscale(var(--ag-gray,1))]"
                style={{ willChange: "transform, filter" }}
              >
                <img
                  src={item.image}
                  alt={item.alt || item.label || ""}
                  draggable={false}
                  className="block h-full w-full object-cover select-none [-webkit-user-drag:none]"
                />
              </span>
              <span
                className="pointer-events-none absolute inset-0"
                style={{ background: overlayBg }}
                aria-hidden="true"
              />
            </span>
            {ghostLabels && item.label ? (
              <span
                ref={(el: HTMLElement | null) => {
                  ghostRefs.current[i] = el;
                }}
                aria-hidden="true"
                className="type-menu pointer-events-none absolute inset-0 z-1 flex items-center justify-center text-[clamp(2.4rem,5vw,5.5rem)] whitespace-nowrap opacity-0 [writing-mode:vertical-rl] rotate-180 max-[520px]:hidden"
                style={{ color: textColor }}
              >
                {item.label}
              </span>
            ) : null}
            {showLabels && (
              <span
                className="pointer-events-none absolute right-5 bottom-5 left-5 z-2 flex items-center gap-3"
                aria-hidden="true"
              >
                <span
                  ref={(el: HTMLElement | null) => {
                    barRefs.current[i] = el;
                  }}
                  className="h-6.5 w-0.75 flex-none rounded-[3px] opacity-0"
                  style={{
                    background: accentColor,
                    boxShadow: `0 0 12px color-mix(in srgb, ${accentColor} 60%, transparent)`,
                  }}
                />
                <span
                  ref={(el: HTMLElement | null) => {
                    textRefs.current[i] = el;
                  }}
                  className="type-menu overflow-hidden text-[clamp(1rem,1.4vw,1.4rem)] tracking-[-0.03em] text-ellipsis whitespace-nowrap opacity-0 [text-shadow:0_2px_14px_rgba(0,0,0,0.55)]"
                  style={{ color: textColor }}
                >
                  {item.label}
                </span>
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
};

export default AccordionGallery;
