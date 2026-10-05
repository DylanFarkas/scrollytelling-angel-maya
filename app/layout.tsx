import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { NextMoment } from "../components/next-moment";
import { Preloader } from "../components/preloader";
import { SiteNav } from "../components/site-nav";
import { SmoothScroll } from "../components/smooth-scroll";
import { StoryRail } from "../components/story-rail";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  title: "Cuando la tierra ya no alcanza",
  description:
    "Scrollytelling de los capítulos 9 y 10 de La fragilidad ambiental de la cultura, de Augusto Ángel Maya.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geist.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink text-paper">
        <SmoothScroll />
        <Preloader />
        <SiteNav />
        <StoryRail />
        {children}
        <NextMoment />
      </body>
    </html>
  );
}
