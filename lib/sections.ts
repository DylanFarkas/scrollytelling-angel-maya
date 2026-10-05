import { getLenis } from "../components/smooth-scroll";

export type StorySection = {
  hash: string;
  num: string;
  label: string;
  ariaLabel: string;
  /** Pantallas que se suman al inicio: la sección se monta sobre la anterior. */
  entryOffset?: number;
};

export const SECTIONS: StorySection[] = [
  { hash: "#inicio", num: "01", label: "Inicio", ariaLabel: "Ir al inicio: Cuando la tierra ya no alcanza" },
  { hash: "#la-tierra", num: "02", label: "La tierra", ariaLabel: "Ir a La tierra comienza a agotarse" },
  { hash: "#la-crisis", num: "03", label: "La crisis", ariaLabel: "Ir a La crisis" },
  { hash: "#afuera", num: "04", label: "Afuera", ariaLabel: "Ir a Europa mira hacia afuera", entryOffset: 1 },
  { hash: "#el-cruce", num: "—", label: "El cruce", ariaLabel: "Ir a El cruce hacia América" },
  { hash: "#america", num: "05", label: "América", ariaLabel: "Ir a América ya tenía una historia" },
  { hash: "#el-quiebre", num: "—", label: "El quiebre", ariaLabel: "Ir a El quiebre" },
  { hash: "#dos-flores", num: "06", label: "Dos flores", ariaLabel: "Ir a Dos flores: el trigo y el maíz" },
  { hash: "#cierre", num: "—", label: "Cierre", ariaLabel: "Ir al cierre: ambiente, sociedad y cultura" },
];

export function sectionTop(hash: string) {
  const el = document.querySelector<HTMLElement>(hash);
  if (!el) return null;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const offset = SECTIONS.find((section) => section.hash === hash)?.entryOffset ?? 0;
  return top + offset * window.innerHeight;
}

export function currentSectionIndex() {
  const probe = window.scrollY + window.innerHeight * 0.5;
  let index = 0;
  SECTIONS.forEach((section, i) => {
    const top = sectionTop(section.hash);
    if (top !== null && top <= probe) index = i;
  });
  return index;
}

export function scrollToSection(hash: string) {
  const top = sectionTop(hash);
  if (top === null) return false;
  scrollToY(top);
  return true;
}

export function scrollToY(top: number) {
  const lenis = getLenis();
  if (lenis) {
    lenis.start();
    lenis.scrollTo(top, {
      duration: 1.6,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
  } else {
    window.scrollTo({ top });
  }
}
