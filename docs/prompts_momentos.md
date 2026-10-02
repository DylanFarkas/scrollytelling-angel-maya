# Prompts por momento

Referencia de puesta en escena: `ejemplo-scroll.mp4` (la página PEAK).

Esa web no es una ilustración con iconos. Es cine a pantalla completa: niebla, un solo sujeto grande, y una frase blanca enorme en el centro. El texto lo pone el código; el video no lleva letras.

Cada video se arma así: imagen de inicio, imagen de fin (con la primera como referencia), y el clip entre las dos, cámara quieta o con un travelling lentísimo, 8–10 segundos, 16:9.

## Estilo

Pégalo en todas las piezas, junto con la época.

```text
Cinematic full-bleed hero for a premium website, same feeling as a high-end brand film: soft fog, dawn light, desaturated grade, fine atmosphere, large-format photography. Palette: charcoal mist, warm parchment haze, olive, terracotta soil, muted gold. One clear subject, lots of calm space in the center for giant white type added later. Photoreal, elegant, quiet. No text, no letters, no logos, no watermark, no UI, no subtitles, no modern objects. 16:9, locked camera or one very slow move, no cuts, no zoom punch.
```

## Época — Europa

Momentos 1, 2, 3, 4 y el lado izquierdo del 6.

```text
Europe about 1400–1520. Open fields, oxen, timber and stone villages, dirt roads, wool and linen, wooden caravels. Soil, wood, stone, daylight, mist. No electricity, no modern buildings, no machines, no steamships, no fantasy armor.
```

## Época — América

Momentos 5 y el lado derecho del 6. En el 4, solo cuando el barco llega a la costa.

```text
The Americas around 1492–1550, already inhabited. Maize, potato, cassava, avocado, Andean terraces, tropical forest, communities in the land. Dignified, specific, not empty wilderness, not a caricature. No colonial cathedrals, no European cities on this continent, no text.
```

---

## Momento 1 — El gancho

**Video** `m1-gancho.mp4`

El inicio y el fin tienen que verse distintos a simple vista. Misma cámara, mismo valle: al principio el encuadre es un bosque cerrado; al final ese bosque ya solo queda en los bordes y el centro es campo, aldeas y cosecha. El video es ese cambio, no un fundido de niebla.

**Inicio**

```text
[Estilo] + [Época Europa]

Wide cinematic aerial of one European valley at dawn, camera locked. The entire frame is an unbroken old forest, dark olive canopy, almost no sky, no fields, no villages, no roads. Dense, vast, quiet. A thin band of mist in the treetops. No text.
```

**Fin**

```text
[Estilo] + [Época Europa]
Same valley, same camera height, same horizon. The start image is only a reference for the angle, not for the contents.

The forest has been pushed to the far left and right edges. The center of the valley is now open late-medieval farmland: a bright patchwork of olive and gold fields, ripe grain, dirt roads, and several timber-and-stone villages with smoke. The change from the start must be obvious: closed forest versus a cultivated valley. No text.
```

**Video**

```text
Locked camera, same valley, no cuts, no zoom. An unbroken 15th-century forest slowly opens from the center. Trees recede toward the left and right edges while fields, dirt roads, grain, and timber-and-stone villages appear in their place. One continuous transformation from wild forest to farmland. The difference between the first and last frame is large. No text.
```

---

## Momento 2 — La tierra se agota

Tres **imágenes**, no un video. El scroll las funde en este orden: campo lleno, campo ralo, tierra agotada. Por eso las tres tienen que ser la misma foto con otro estado del suelo. Si cambia el horizonte, la hora o la altura de la cámara, el fundido se ve como un corte.

Genera primero `verde`. En las otras dos, súbela como referencia de imagen y pide que solo cambie el cultivo.

Archivos, en `public/momento2/`:

- `verde.jpg`
- `presion.jpg`
- `agotado.jpg`

16:9. Centro del encuadre relativamente despejado: ahí se apoya el texto. Surcos de labranza medieval, irregulares, hechos a mano. Nada de hileras rectas de tractor ni de cultivo industrial.

### Imagen — `verde.jpg`

```text
[Estilo] + [Época Europa]

Wide cinematic photograph of one open medieval wheat field, about 1450, camera locked at a gentle high three-quarter angle. Soft dawn, warm mist on a low horizon, muted gold and olive. The field fills the frame with hand-sown ridge-and-furrow strips: slightly uneven, organic, not tractor-straight. Crop is dense and alive, dark soil only in the furrows. Quiet center, so a title can sit there later. No village, no people, no animals, no modern agriculture, no text.
```

### Imagen — `presion.jpg`

Esta foto es la rotación trienal pidiéndole demasiado al suelo. En el libro, ese cultivo de tres tiempos al principio cuidaba la tierra; en el siglo XIV ya le exigía más de lo que el abono podía devolver. No es un campo “un poco más seco”. Es el mismo predio partido en tres franjas, y la franja que debería descansar ya no se recupera.

```text
[Estilo] + [Época Europa]
Use verde.jpg as the image reference. Keep the exact same camera, horizon, dawn light, mist, and the same furrow lines. Do not move the viewpoint.

The same medieval field is now divided into the three strips of a three-field rotation, about 1300–1350. One strip still carries a thin, tired wheat crop. The next is only stubble. The third should be resting fallow, but the soil there is already pale, dusty, and hungry: not enough manure to restore it. The fallow strip does not look fertile. Dark living soil is gone. The field is being asked for more than it can give back. Same place as the reference, clearly more strained. No village, no people, no animals, no modern tools, no text.
```

### Imagen — `agotado.jpg`

```text
[Estilo] + [Época Europa]
Use verde.jpg as the image reference. Keep the exact same camera, horizon, light, mist, and furrow lines. Change only the crop.

The same three strips are still there, and the same camera. Now none of them recover. Wheat, stubble, and fallow have all become pale cracked soil, with only a few wilted stalks left in the old furrows. The difference from the green field must be obvious at a glance. Calm fatigue, not a disaster. No village, no people, no text.
```

Cuando las tres estén, reemplaza los archivos de `public/momento2/` con esos nombres. La animación ya las funde y enciende, en orden, Expansión, Más cultivos, El suelo ya no descansa, Menor productividad, y cierra con «La tierra empezó a cansarse.»

---

## Momento 3 — La crisis

**Video** `m3-balanza.mp4`

Una balanza sola, en medio de la niebla, tratada como objeto de cine y no como diagrama de libro. A la izquierda crecen gente, ciudad y pan. A la derecha se adelgazan trigo, bosque y bueyes. Al final la niebla se lo traga y queda el vacío para la frase puente.

**Inicio**

```text
[Estilo] + [Época Europa]

A large wooden balance scale, perfectly level, standing in soft fog, centered, small in a vast charcoal atmosphere. Left pan: a few villagers in wool, a tiny stone town, bread. Right pan, equal weight: wheat, a small grove, one ox. Objects are few and clear. Huge empty mist around them. No text, no numbers.
```

**Fin**

```text
[Estilo] + [Época Europa]
Same scale, same fog, same camera.

The beam has tipped to the left. Left pan lower: more people, a denser stone town, more bread. Right pan high and sparse: little grain, thin trees, no ox. Fog is closing in until the scene is almost empty charcoal. No text, no numbers.
```

**Video**

```text
Locked camera, no cuts. A wooden scale in mist starts level, then slowly tips left as people, a stone town, and bread grow heavier, while wheat, trees, and the ox on the right thin away. In the last second fog swallows the scale into empty charcoal. No text.
```

---

## Momento 4 — Europa mira hacia afuera

Este es el plano del barco de PEAK: mar abierto, una sola nave, estela, cielo enorme. Aquí la nave es una carabela de 1492.

**Imagen** `m4-mapa.png`

Solo si hace falta una transición breve antes del viaje. Mapa limpio, sin nombres, mucho mar.

```text
[Estilo] + [Época Europa] + [Época América]

A quiet cinematic map of the Atlantic seen from above, parchment and olive coasts, Europe upper right, West Africa center, the Americas left. Vast empty ocean, soft haze. No labels, no letters, no ships, no compass text.
```

**Video** `m4-ruta.mp4`

**Inicio**

```text
[Estilo] + [Época Europa]

Aerial view of a calm Atlantic at dawn, huge sky, soft haze. A single wooden caravel, about 1492, small in the lower center, just leaving a European coast that is faint in the mist behind it. No wake yet. No text, no modern ship.
```

**Fin**

```text
[Estilo] + [Época América]
Same altitude, same light, start image as reference.

The same caravel arriving at a green American coast, Caribbean shore, forested, already alive. One long muted-gold wake behind it across open water. The coast is inhabited land, not an empty beach. No text, no second ship.
```

**Video**

```text
Very slow aerial, no cuts, no fast zoom. A single wooden caravel sails from a misty European coast across calm ocean, past a distant West African shore, and arrives at a forested Caribbean coast. One continuous voyage, one ship, one wake. Sky stays large and quiet. No text.
```

---

## Momento 5 — América ya tenía una historia

**Video** `m5-america.mp4`

La niebla se abre, como la montaña de PEAK, y debajo no hay tierra vacía: hay terrazas, maíz, selva y comunidades.

**Inicio**

```text
[Estilo] + [Época América]

Aerial dawn. Thick warm mist over a continent. Only a silhouette of mountains and forest canopy. Quiet, vast, the land present but not yet readable. No ships. No text.
```

**Fin**

```text
[Estilo] + [Época América]
Same aerial, same camera, start image as reference.

The mist has opened. Andean terraces, maize, potato plots, cassava and avocado near a tropical forest, and small communities settled in the landscape. Clearly an old cultivated world. Still spacious, cinematic, not a collage of icons. No European ships, no colonial towns, no text.
```

**Video**

```text
Locked aerial, no cuts. Mist slowly clears over the Americas and reveals terraces, maize, forest, and Indigenous communities that were already there. The land does not move. No ships, no text.
```

**Imágenes** de la pantalla partida. Verticales 3:4, mismo grado de color, mismo cine. El código las pone lado a lado.

`m5-adaptarse.png`

```text
[Estilo] + [Época América]

Vertical 3:4 cinematic still. Andean terraces and maize in soft fog, people small in the land, tropical forest below. Calm dawn, olive and parchment. No ships, no text.
```

`m5-explotar.png`

```text
[Estilo] + [Época Europa]

Vertical 3:4 cinematic still, same fog and grade. A modest early-16th-century hillside mine, a single grain field, one wooden caravel offshore, a faint gold sense of wealth leaving toward the sea. Serious, clean, not a battle. No modern machines, no text.
```

---

## Momento 6 — Cierre

**Video** `m6-raices.mp4`

Empieza tan quieto como el primer plano y termina llenando la pantalla: las raíces cruzan de un campo europeo a un paisaje americano.

**Inicio**

```text
[Estilo] + [Época Europa]

Wide cinematic frame, charcoal mist. On the left, a small seedling in 15th-century European soil, short roots, a few leaves. The rest of the frame is almost empty fog. No text.
```

**Fin**

```text
[Estilo] + [Época Europa] + [Época América]
Same camera, start image as reference.

The plant has grown. Fine gold-olive roots travel across the whole frame, from European fields on the left into Andean terraces, maize, and forest on the right. Roots are the subject. A darker calm band remains along the lower third. No text.
```

**Video**

```text
Locked camera, no cuts. A seedling on the left grows, and its roots extend in one slow gesture from medieval European soil across the frame into an already inhabited American landscape. Smooth, readable, one plant. No text, no ships.
```

---

## Qué generar

| Archivo | Tipo | Plano |
| --- | --- | --- |
| `m1-gancho.mp4` | Video | El paisaje europeo sale de la niebla |
| `m2-suelo.mp4` | Video | Un campo se agota |
| `m3-balanza.mp4` | Video | La balanza se inclina y desaparece |
| `m4-mapa.png` | Imagen | Atlántico quieto, sin nombres |
| `m4-ruta.mp4` | Video | Una carabela cruza el mar |
| `m5-america.mp4` | Video | La niebla abre una América habitada |
| `m5-adaptarse.png` | Imagen | Terrazas y cultivos |
| `m5-explotar.png` | Imagen | Mina, campo y carabela |
| `m6-raices.mp4` | Video | Las raíces cruzan hasta América |

En la herramienta: 16:9, 1920×1080, cámara estática, 8–10 segundos. Si aparece texto, un zoom brusco o un corte, esa toma no sirve.
