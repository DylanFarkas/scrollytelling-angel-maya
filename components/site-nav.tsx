"use client";

import { useCallback, useState, type MouseEvent } from "react";
import { getLenis } from "./smooth-scroll";
import { StaggeredMenu, type StaggeredMenuItem } from "./staggered-menu";
import { SECTIONS, currentSectionIndex, scrollToSection } from "../lib/sections";

const MENU_ITEMS: StaggeredMenuItem[] = SECTIONS.map((section) => ({
  label: section.label,
  ariaLabel: section.ariaLabel,
  link: section.hash,
}));

export function SiteNav() {
  const [active, setActive] = useState(-1);

  const onMenuOpen = useCallback(() => {
    setActive(currentSectionIndex());
    getLenis()?.stop();
  }, []);

  const onMenuClose = useCallback(() => {
    getLenis()?.start();
  }, []);

  const onItemClick = useCallback((item: StaggeredMenuItem, event: MouseEvent<HTMLAnchorElement>) => {
    if (scrollToSection(item.link)) event.preventDefault();
  }, []);

  return (
    <StaggeredMenu
      isFixed
      position="right"
      items={MENU_ITEMS}
      activeIndex={active}
      colors={["#5a4426", "#c4a36a"]}
      accentColor="#c4a36a"
      panelColor="#000000"
      menuButtonColor="#f7f3ea"
      openMenuButtonColor="#f7f3ea"
      logoLabel="Ángel Maya — volver al inicio"
      logo={<span className="type-menu text-[0.95rem] tracking-[-0.03em]">Ángel Maya</span>}
      footer={
        <>
          <p data-sm-footer className="eyebrow text-gold">
            Capítulos 9 y 10
          </p>
          <p
            data-sm-footer
            className="m-0 max-w-[30ch] font-display text-[1.35rem] leading-[1.2] text-cream/80 italic"
          >
            La fragilidad ambiental de la cultura
          </p>
          <p data-sm-footer className="m-0 text-[0.85rem] text-paper/50">
            Augusto Ángel Maya
          </p>
        </>
      }
      onMenuOpen={onMenuOpen}
      onMenuClose={onMenuClose}
      onItemClick={onItemClick}
    />
  );
}
