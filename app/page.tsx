import { Momento1 } from "./momento-1";
import { Momento2 } from "./momento-2";
import { Momento3 } from "./momento-3";
import { Momento4 } from "./momento-4";
import { Momento5 } from "./momento-5";
import { Quiebre } from "./quiebre";
import { Momento6 } from "./momento-6";
import { Cierre } from "./cierre";
import { Cruce } from "../components/cruce";
import { HiddenMessage } from "../components/hidden-message";
import { CreditsFooter } from "../components/credits-footer";
import { SiteFooter } from "../components/site-footer";

export default function Home() {
  return (
    <main>
      <Momento1 />
      <Momento2 />
      <Momento3 />
      <Momento4 />
      <Cruce />
      <Momento5 />
      <Quiebre />
      <Momento6 />
      <Cierre />
      <SiteFooter />
      <HiddenMessage />
      <CreditsFooter />
    </main>
  );
}
