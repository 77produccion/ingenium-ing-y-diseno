# Fotografías del equipo

El componente compartido `src/components/TeamSection.astro` se utiliza en inicio y en nosotros.

## Fuentes

Las fotografías originales se conservan sin cambios en:

`public/ingenium/11-17-2026 (EDITADAS Equipo y página web)/individual-set/`

Los derivados para la web están en `public/assets/team/portraits-2026/`:

| Integrante | Miniatura | Retrato principal |
| --- | --- | --- |
| Julián Alfonso Ruge | julian.webp | julian2.webp |
| Leonardo González | leo.webp | leo.webp |
| Juan Sebastián Giraldo | juan.webp | juan.webp |
| Julio Alberto Toro | julio1.webp | julio2.webp |
| Jefry Daniel Monsalve | jefry.webp | jefry2.webp |
| Camilo Londoño | camilo.webp | camilo2.webp |

Duvan y Tatiana conservan sus recortes anteriores hasta que se proporcionen sus nuevas tomas con nombre. No se utilizan las fotografías genéricas `Equipo y página web-*.jpg`.

`team-background.webp` es una conversión optimizada de `back-ground-team.png`. Es una única capa de fondo compartida; no se duplica en cada retrato.

## Preparación

Se eliminó el fondo de las once fotografías con nombre mediante segmentación local, conservando los píxeles originales de las personas. Los recortes se exportan en WebP con canal alfa, hasta 1200 px de alto y sin ampliar la fuente. El procesamiento no se ejecuta en el navegador ni añade dependencias al sitio. Astro genera las variantes responsivas.

El componente utiliza derivados de cintura hacia arriba en `portraits-2026/waist/`. Se regeneran con `node scripts/prepare-team-framing.mjs`. Cada toma tiene su propio encuadre inferior para conservar brazos cruzados, manos y accesorios; se mantiene el ancho completo y la parte superior del recorte. Duvan y Tatiana ya tienen encuadres de busto y conservan sus archivos anteriores. La imagen principal usa `object-fit: contain` y deja espacio para la tira inferior.

## Interacción

El fondo ocupa toda la sección y la tira de selección compacta se superpone en su borde inferior. Las miniaturas permanecen inmóviles y únicamente cambian de color al hover o al seleccionar una persona.

GSAP combina un slide horizontal corto del retrato con un desvanecido del perfil. La dirección depende de la posición del integrante seleccionado respecto al anterior. No se aplican giros, escalados ni entradas desde las esquinas.

Los retratos se precargan y decodifican cuando la sección se acerca al viewport. La selección inferior se actualiza de inmediato, sin esperar a la imagen ni a la animación superior. Entrada y salida se ejecutan simultáneamente; no se acumulan transiciones ni contextos GSAP por hover.

Se mantienen selección por hover, clic, teclado y pantalla táctil. El clic fija la selección; Escape o un clic exterior vuelve al estado inicial. Las transiciones anteriores se cancelan al cambiar rápidamente de persona y se limpian al abandonar la página.
