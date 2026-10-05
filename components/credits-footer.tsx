"use client";

import { scrollToY } from "../lib/sections";

const INTEGRANTES = [
  { nombre: "Hugo Alexander Eraso Rosero", codigo: "2416885" },
  { nombre: "Dylan Farkas Quiza", codigo: "2183118" },
] as const;

export function CreditsFooter() {
  return (
    <footer className="relative z-30 bg-black text-white">
      <div className="mx-auto max-w-6xl px-[clamp(1.25rem,4vw,3rem)] pt-[clamp(3.5rem,8vw,6rem)]">
        <div className="mb-[clamp(1.75rem,4vw,3rem)] grid grid-cols-1 gap-9 min-[720px]:grid-cols-3 min-[720px]:gap-[clamp(2rem,5vw,4.5rem)]">
          <div>
            <h2 className="mb-4 font-sans text-[0.95rem] font-bold tracking-[0.01em] text-white">
              Obra
            </h2>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 font-sans text-[0.9rem] leading-[1.45] text-[#9a9a9a]">
              <li>La fragilidad ambiental de la cultura</li>
              <li>Augusto Ángel Maya</li>
              <li>Capítulos 9 y 10</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-sans text-[0.95rem] font-bold tracking-[0.01em] text-white">
              Experiencia
            </h2>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 font-sans text-[0.9rem] leading-[1.45] text-[#9a9a9a]">
              <li>Cuando la tierra ya no alcanza</li>
              <li>Scrollytelling</li>
              <li>Experiencia interactiva</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-sans text-[0.95rem] font-bold tracking-[0.01em] text-white">
              Integrantes
            </h2>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 font-sans text-[0.9rem] leading-[1.45] text-[#9a9a9a]">
              {INTEGRANTES.map(({ nombre, codigo }) => (
                <li key={codigo}>
                  {nombre}
                  <span className="text-[#9a9a9a]/75"> — {codigo}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-[clamp(1.25rem,3vw,2rem)] mt-30">
        <p
          aria-label="Tierra"
          className="type-menu m-0 w-full select-none px-[clamp(0.25rem,0.6vw,0.75rem)] text-center text-[clamp(5.5rem,28vw,28rem)] font-black leading-[0.68] tracking-[-0.07em] whitespace-nowrap text-white"
        >
          TIERRA
        </p>
        <div className="mx-auto flex w-full max-w-6xl items-baseline justify-end px-[clamp(1.25rem,4vw,3rem)]">
          <button
            type="button"
            onClick={() => scrollToY(0)}
            className="cursor-pointer appearance-none border-0 bg-transparent p-0 font-sans text-[0.85rem] text-white transition-colors duration-160 ease-in-out hover:text-[#9a9a9a] motion-reduce:transition-none"
          >
            Volver arriba ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
