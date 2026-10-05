"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { gsap } from "gsap";

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}

export interface StaggeredMenuProps {
  position?: "left" | "right";
  colors?: string[];
  items?: StaggeredMenuItem[];
  displayItemNumbering?: boolean;
  className?: string;
  logo?: ReactNode;
  logoLabel?: string;
  footer?: ReactNode;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  panelColor?: string;
  isFixed?: boolean;
  changeMenuColorOnOpen?: boolean;
  closeOnClickAway?: boolean;
  activeIndex?: number;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  onItemClick?: (item: StaggeredMenuItem, event: MouseEvent<HTMLAnchorElement>) => void;
}

const OPEN_LABEL = "Menú";
const CLOSE_LABEL = "Cerrar";

export function StaggeredMenu({
  position = "right",
  colors = ["#5a4426", "#c4a36a"],
  items = [],
  displayItemNumbering = true,
  className,
  logo,
  logoLabel = "Inicio",
  footer,
  menuButtonColor = "#f7f3ea",
  openMenuButtonColor = "#f7f3ea",
  changeMenuColorOnOpen = true,
  accentColor = "#c4a36a",
  panelColor = "#14110e",
  isFixed = false,
  closeOnClickAway = true,
  activeIndex = -1,
  onMenuOpen,
  onMenuClose,
  onItemClick,
}: StaggeredMenuProps) {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const scopeRef = useRef<HTMLDivElement | null>(null);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);

  const textInnerRef = useRef<HTMLSpanElement | null>(null);
  const [textLines, setTextLines] = useState<string[]>([OPEN_LABEL, CLOSE_LABEL]);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef = useRef<gsap.core.Timeline | null>(null);
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);

  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;

      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      const preLayers = preContainer
        ? (Array.from(preContainer.querySelectorAll(".sm-prelayer")) as HTMLElement[])
        : [];
      preLayerElsRef.current = preLayers;

      const offscreen = position === "left" ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
      if (preContainer) gsap.set(preContainer, { xPercent: 0, opacity: 1 });

      gsap.set(plusH, { transformOrigin: "50% 50%", rotate: 0 });
      gsap.set(plusV, { transformOrigin: "50% 50%", rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" });
      gsap.set(textInner, { yPercent: 0 });

      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });

    const scope = scopeRef.current;
    if (scope) scope.dataset.ready = "";

    return () => {
      if (scope) delete scope.dataset.ready;
      ctx.revert();
    };
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    closeTweenRef.current = null;

    const itemEls = Array.from(panel.querySelectorAll(".sm-panel-itemLabel")) as HTMLElement[];
    const numberEls = Array.from(
      panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item"),
    ) as HTMLElement[];
    const footerEls = Array.from(panel.querySelectorAll("[data-sm-footer]")) as HTMLElement[];

    const offscreen = position === "left" ? -100 : 100;

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    if (numberEls.length) gsap.set(numberEls, { "--sm-num-opacity": 0 });
    if (footerEls.length) gsap.set(footerEls, { y: 25, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    layers.forEach((el, i) => {
      tl.fromTo(el, { xPercent: offscreen }, { xPercent: 0, duration: 0.5, ease: "power4.out" }, i * 0.07);
    });

    const lastTime = layers.length ? (layers.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layers.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(
      panel,
      { xPercent: offscreen },
      { xPercent: 0, duration: panelDuration, ease: "power4.out" },
      panelInsertTime,
    );

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15;

      tl.to(
        itemEls,
        { yPercent: 0, rotate: 0, duration: 1, ease: "power4.out", stagger: { each: 0.1, from: "start" } },
        itemsStart,
      );

      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: "power2.out",
            "--sm-num-opacity": 1,
            stagger: { each: 0.08, from: "start" },
          },
          itemsStart + 0.1,
        );
      }
    }

    if (footerEls.length) {
      tl.to(
        footerEls,
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: "power3.out",
          stagger: { each: 0.08, from: "start" },
        },
        panelInsertTime + panelDuration * 0.4,
      );
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback("onComplete", () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    closeTweenRef.current?.kill();
    const offscreen = position === "left" ? -100 : 100;

    closeTweenRef.current = gsap.to([...layers, panel], {
      xPercent: offscreen,
      duration: 0.32,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll(".sm-panel-itemLabel")) as HTMLElement[];
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });

        const numberEls = Array.from(
          panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item"),
        ) as HTMLElement[];
        if (numberEls.length) gsap.set(numberEls, { "--sm-num-opacity": 0 });

        const footerEls = Array.from(panel.querySelectorAll("[data-sm-footer]")) as HTMLElement[];
        if (footerEls.length) gsap.set(footerEls, { y: 25, opacity: 0 });

        busyRef.current = false;
      },
    });
  }, [position]);

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    const h = plusHRef.current;
    const v = plusVRef.current;
    if (!icon || !h || !v) return;

    spinTweenRef.current?.kill();

    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" });
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .to(h, { rotate: 45, duration: 0.5 }, 0)
        .to(v, { rotate: -45, duration: 0.5 }, 0);
    } else {
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: "power3.inOut" } })
        .to(h, { rotate: 0, duration: 0.35 }, 0)
        .to(v, { rotate: 90, duration: 0.35 }, 0)
        .to(icon, { rotate: 0, duration: 0.001 }, 0);
    }
  }, []);

  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, { color: targetColor, delay: 0.18, duration: 0.3, ease: "power2.out" });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen],
  );

  useEffect(() => {
    if (!toggleBtnRef.current) return;
    const targetColor =
      changeMenuColorOnOpen && openRef.current ? openMenuButtonColor : menuButtonColor;
    gsap.set(toggleBtnRef.current, { color: targetColor });
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current;
    if (!inner) return;

    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? OPEN_LABEL : CLOSE_LABEL;
    const targetLabel = opening ? CLOSE_LABEL : OPEN_LABEL;
    const cycles = 3;

    const seq: string[] = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === OPEN_LABEL ? CLOSE_LABEL : OPEN_LABEL;
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);

    setTextLines(seq);
    gsap.set(inner, { yPercent: 0 });

    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;

    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: "power4.out",
    });
  }, []);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);

    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }

    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    onMenuClose?.();
    playClose();
    animateIcon(false);
    animateColor(false);
    animateText(false);
  }, [playClose, animateIcon, animateColor, animateText, onMenuClose]);

  useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeOnClickAway, open, closeMenu]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);

  const layerColors = (() => {
    const raw = colors.length ? colors.slice(0, 4) : ["#1e1e22", "#35353c"];
    const arr = [...raw];
    if (arr.length >= 3) arr.splice(Math.floor(arr.length / 2), 1);
    return arr;
  })();

  return (
    <div
      ref={scopeRef}
      className={`sm-scope z-50 ${isFixed ? "fixed inset-x-0 top-0 w-screen pointer-events-none" : "relative w-full h-full"}`}
      data-fixed={isFixed || undefined}
    >
      <div
        className={`${className ? className + " " : ""}staggered-menu-wrapper`}
        style={
          {
            "--sm-accent": accentColor,
            "--sm-panel": panelColor,
          } as CSSProperties
        }
        data-position={position}
        data-open={open || undefined}
      >
        <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
          {layerColors.map((c, i) => (
            <div key={i} className="sm-prelayer" style={{ background: c }} />
          ))}
        </div>

        <header className="staggered-menu-header" aria-label="Navegación principal">
          <a
            href="#inicio"
            className="sm-logo"
            data-open={open || undefined}
            aria-label={logoLabel}
            onClick={(event) => {
              closeMenu();
              onItemClick?.({ label: logoLabel, ariaLabel: logoLabel, link: "#inicio" }, event);
            }}
          >
            {logo}
          </a>

          <button
            ref={toggleBtnRef}
            className="sm-toggle"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
          >
            <span className="sm-toggle-textWrap" aria-hidden="true">
              <span ref={textInnerRef} className="sm-toggle-textInner">
                {textLines.map((l, i) => (
                  <span className="sm-toggle-line" key={i}>
                    {l}
                  </span>
                ))}
              </span>
            </span>

            <span ref={iconRef} className="sm-icon" aria-hidden="true">
              <span ref={plusHRef} className="sm-icon-line" />
              <span ref={plusVRef} className="sm-icon-line" />
            </span>
          </button>
        </header>

        <aside
          id="staggered-menu-panel"
          ref={panelRef}
          className="staggered-menu-panel"
          aria-hidden={!open}
          inert={!open}
        >
          <div className="sm-panel-inner">
            <ul className="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
              {items.map((it, idx) => (
                <li className="sm-panel-itemWrap" key={it.label + idx}>
                  <a
                    className="sm-panel-item"
                    href={it.link}
                    aria-label={it.ariaLabel}
                    aria-current={idx === activeIndex ? "location" : undefined}
                    data-index={idx + 1}
                    onClick={(event) => {
                      closeMenu();
                      onItemClick?.(it, event);
                    }}
                  >
                    <span className="sm-panel-itemLabel">{it.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            {footer ? <div className="sm-footer">{footer}</div> : null}
          </div>
        </aside>
      </div>

      <style>{`
.sm-scope .staggered-menu-wrapper { position: relative; width: 100%; height: 100%; z-index: 40; pointer-events: none; }
.sm-scope[data-fixed] .staggered-menu-wrapper { height: auto; }
.sm-scope .staggered-menu-header { position: absolute; top: 0; left: 0; width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 1.5em; background: transparent; pointer-events: none; z-index: 20; }
.sm-scope[data-fixed] .staggered-menu-header { position: relative; }
.sm-scope .staggered-menu-header > * { pointer-events: auto; }
.sm-scope .sm-logo { display: inline-flex; align-items: center; color: var(--color-cream); text-decoration: none; user-select: none; text-shadow: 0 1px 14px rgb(0 0 0 / 0.35); transition: color 0.3s ease; }
.sm-scope .sm-logo:focus-visible { outline: 2px solid var(--sm-accent); outline-offset: 4px; border-radius: 4px; }
.sm-scope .sm-toggle { position: relative; display: inline-flex; align-items: center; gap: 0.3rem; background: transparent; border: none; cursor: pointer; font-family: var(--font-sans); font-size: 0.95rem; font-weight: 500; line-height: 1; overflow: visible; letter-spacing: -0.01em; filter: drop-shadow(0 1px 8px rgb(0 0 0 / 0.35)); }
.sm-scope .sm-toggle:focus-visible { outline: 2px solid var(--sm-accent); outline-offset: 4px; border-radius: 4px; }
.sm-scope .sm-toggle-textWrap { position: relative; margin-right: 0.5em; display: inline-block; height: 1em; overflow: hidden; white-space: nowrap; }
.sm-scope .sm-toggle-textInner { display: flex; flex-direction: column; line-height: 1; }
.sm-scope .sm-toggle-line { display: block; height: 1em; line-height: 1; }
.sm-scope .sm-icon { position: relative; width: 14px; height: 14px; flex: 0 0 14px; display: inline-flex; align-items: center; justify-content: center; will-change: transform; }
.sm-scope .sm-icon-line { position: absolute; left: 50%; top: 50%; width: 100%; height: 2px; background: currentColor; border-radius: 2px; transform: translate(-50%, -50%); will-change: transform; }
.sm-scope .staggered-menu-panel { position: absolute; top: 0; right: 0; width: clamp(300px, 44vw, 540px); height: 100%; background: var(--sm-panel); display: flex; flex-direction: column; padding: 6.5em 2em 2.5em 2em; overflow-y: auto; z-index: 10; pointer-events: auto; }
.sm-scope[data-fixed] .staggered-menu-panel { position: fixed; height: 100dvh; }
.sm-scope [data-position='left'] .staggered-menu-panel { right: auto; left: 0; }
.sm-scope .sm-prelayers { position: absolute; top: 0; right: 0; bottom: 0; width: clamp(300px, 44vw, 540px); pointer-events: none; z-index: 5; }
.sm-scope[data-fixed] .sm-prelayers { position: fixed; top: 0; bottom: auto; height: 100dvh; }
.sm-scope [data-position='left'] .sm-prelayers { right: auto; left: 0; }
.sm-scope .sm-prelayer { position: absolute; top: 0; right: 0; height: 100%; width: 100%; transform: translateX(0); }
.sm-scope:not([data-ready]) .staggered-menu-panel,
.sm-scope:not([data-ready]) .sm-prelayers { visibility: hidden; }
.sm-scope .sm-panel-inner { flex: 1; display: flex; flex-direction: column; justify-content: flex-start; gap: 1.25rem; padding-top: 0.25rem; }
.sm-scope .sm-panel-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.28em; }
.sm-scope .sm-panel-itemWrap { position: relative; overflow: hidden; line-height: 1; }
.sm-scope .sm-panel-item { position: relative; display: inline-block; color: var(--color-cream); font-family: var(--font-sans); font-weight: 700; font-size: clamp(2rem, min(5.4vw, 6.6vh), 4.4rem); cursor: pointer; line-height: 0.92; letter-spacing: -0.05em; text-transform: uppercase; text-decoration: none; white-space: nowrap; transition: color 0.2s ease; }
.sm-scope .sm-panel-item[aria-current] { color: var(--sm-accent); }
.sm-scope .sm-panel-itemLabel { display: inline-block; will-change: transform; transform-origin: 50% 100%; }
.sm-scope .sm-panel-item:hover { color: var(--sm-accent); }
.sm-scope .sm-panel-item:focus-visible { outline: 2px solid var(--sm-accent); outline-offset: 4px; }
.sm-scope .sm-panel-list[data-numbering] { counter-reset: smItem; }
.sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after { counter-increment: smItem; content: counter(smItem, decimal-leading-zero); display: inline-block; vertical-align: super; margin-left: 0.18em; font-family: var(--font-sans); font-size: 0.2em; font-weight: 500; line-height: 1; letter-spacing: 0; color: var(--sm-accent); pointer-events: none; user-select: none; opacity: var(--sm-num-opacity, 0); }
.sm-scope .sm-footer { margin-top: auto; padding-top: 2rem; display: grid; gap: 0.75rem; }
@media (max-width: 1024px) {
  .sm-scope .staggered-menu-panel,
  .sm-scope .sm-prelayers { width: min(100%, 460px); }
}
@media (max-width: 640px) {
  .sm-scope .staggered-menu-header { padding: 1.25em; }
  .sm-scope .staggered-menu-panel,
  .sm-scope .sm-prelayers { width: 100%; left: 0; right: 0; }
  .sm-scope .sm-panel-item { font-size: clamp(2.4rem, 11vw, 3.4rem); letter-spacing: -0.045em; }
}
      `}</style>
    </div>
  );
}

export default StaggeredMenu;
