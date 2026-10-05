import type { HTMLAttributes } from "react";

// Alineada verticalmente con la cabecera fija del menú.
export function ChapterMark({ className = "", children, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...rest}
      className={`eyebrow pointer-events-none absolute top-0 left-1/2 z-20 flex h-[3.95rem] -translate-x-1/2 items-center whitespace-nowrap text-paper/75 [text-shadow:0_1px_14px_rgb(0_0_0/0.35)] max-sm:h-[3.45rem] ${className}`}
    >
      {children}
    </p>
  );
}
