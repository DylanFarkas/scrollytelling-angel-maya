import { getLenis } from "../components/smooth-scroll";

export type SectionNote = {
  chapter: string;
  pages: string;
  title: string;
  text: string;
};

export type StorySection = {
  hash: string;
  num: string;
  label: string;
  ariaLabel: string;
  /** Pantallas que se suman al inicio: la sección se monta sobre la anterior. */
  entryOffset?: number;
  /** Qué plasma el momento, según los capítulos 9 y 10. */
  note: SectionNote;
};

export const SECTIONS: StorySection[] = [
  {
    hash: "#inicio",
    num: "01",
    label: "Inicio",
    ariaLabel: "Ir al inicio: Cuando la tierra ya no alcanza",
    note: {
      chapter: "Capítulo 9",
      pages: "p. 77",
      title: "Un crecimiento con techo",
      text: "Desde finales del primer milenio Europa vivió un crecimiento arrollador: abrió campos sobre el bosque y su población aumentó. Ángel Maya lo lee desde lo ambiental: ese auge dependía de un territorio con límites materiales.",
    },
  },
  {
    hash: "#la-tierra",
    num: "02",
    label: "La tierra",
    ariaLabel: "Ir a La tierra comienza a agotarse",
    note: {
      chapter: "Capítulo 9",
      pages: "p. 77",
      title: "La tierra se cansa",
      text: "Se agotaron los márgenes de colonización. Las tierras nuevas eran peores, el cultivo trienal exigía demasiado al suelo y el abono no alcanzaba. Al caer la producción, el alimento humano compitió con el animal y las cabras acabaron con los últimos bosques.",
    },
  },
  {
    hash: "#la-crisis",
    num: "03",
    label: "La crisis",
    ariaLabel: "Ir a La crisis",
    note: {
      chapter: "Capítulo 9",
      pages: "pp. 78–80",
      title: "Hambre, guerra y peste",
      text: "En el siglo XIV la crisis agraria se volvió social: carestía desde 1313, cosechas reducidas a la mitad, pueblos abandonados y la Guerra de los Cien Años. Para el autor, la peste negra de 1348 no fue un accidente: fue la «guadaña final» sobre una población ya debilitada.",
    },
  },
  {
    hash: "#afuera",
    num: "04",
    label: "Afuera",
    ariaLabel: "Ir a Europa mira hacia afuera",
    entryOffset: 1,
    note: {
      chapter: "Capítulo 10",
      pages: "pp. 81–82",
      title: "Una expansión inevitable",
      text: "Agotadas las posibilidades internas, la técnica no bastaba: Europa solo salió de la crisis ampliando los horizontes de la explotación. Por eso los viajes no fueron simple curiosidad: se buscaban tierras de cereal, metales y, al final, apareció América.",
    },
  },
  {
    hash: "#el-cruce",
    num: "—",
    label: "El cruce",
    ariaLabel: "Ir a El cruce hacia América",
    note: {
      chapter: "Capítulo 10",
      pages: "pp. 81–82",
      title: "El orden del libro",
      text: "Las paradas siguen el recorrido que describe Ángel Maya: Canarias en busca de trigo, Madeira y la costa africana tras el oro del Sahara, y por último América. El encuentro no fue un diálogo entre culturas, sino una subordinación impuesta por las armas y las ideas.",
    },
  },
  {
    hash: "#america",
    num: "05",
    label: "América",
    ariaLabel: "Ir a América ya tenía una historia",
    note: {
      chapter: "Capítulo 10",
      pages: "pp. 82–84",
      title: "Un mundo ya habitado",
      text: "Hace unos 35.000 años los primeros pobladores cruzaron Bering y crearon culturas adaptadas a cada ecosistema, de los Andes a la selva. Domesticaron la papa, la yuca, el maíz y el algodón. El autor no las idealiza: sin animales de tiro ni hierro, quedaron expuestas ante la conquista.",
    },
  },
  {
    hash: "#el-quiebre",
    num: "—",
    label: "El quiebre",
    ariaLabel: "Ir a El quiebre",
    note: {
      chapter: "Capítulo 10",
      pages: "pp. 84–86",
      title: "De la adaptación al saqueo",
      text: "La Colonia cambió la búsqueda de formas de adaptarse al medio por un sistema de saqueo: tala alrededor de las minas, trigo impuesto en suelos frágiles, encomiendas y metales rumbo a Europa. Lo más destructivo fue la desintegración de las culturas que sabían vivir en el trópico.",
    },
  },
  {
    hash: "#dos-flores",
    num: "06",
    label: "Dos flores",
    ariaLabel: "Ir a Dos flores: el trigo y el maíz",
    note: {
      chapter: "Capítulo 10",
      pages: "pp. 86–87",
      title: "Lo que gana uno, lo pierde el otro",
      text: "El metal americano reactivó la economía europea mientras América perdía sus formas de vida. El Chilam Balam lo dice con dos flores. Desde entonces, según el autor, el trópico no ha sido asumido como escenario cultural, y sus últimas culturas se llevan saberes de milenios.",
    },
  },
  {
    hash: "#cierre",
    num: "—",
    label: "Cierre",
    ariaLabel: "Ir al cierre: ambiente, sociedad y cultura",
    note: {
      chapter: "Capítulos 9 y 10",
      pages: "pp. 77–87",
      title: "Una misma historia",
      text: "Los dos capítulos cuentan un solo proceso: un modelo de crecimiento choca con los límites de su territorio y los resuelve trasladando la presión a otro. Para Ángel Maya, lo ambiental no es solo naturaleza: es la relación entre el ecosistema y la cultura.",
    },
  },
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
