# Medios de consultoría

## Selección

`src/lib/consultoria-media.mjs` centraliza las fotografías, galerías y clips seleccionados. Los originales no se modifican.

- Las fotografías `consultoria/1.jpg` a `8.jpg` corresponden, en ese orden, a las ocho portadas de servicios.
- Las galerías ampliadas incorporan tomas seleccionadas de `diseño`, `revision` y `working` de la misma sesión fotográfica. Las portadas exteriores no cambian automáticamente.
- La tarjeta de consultoría del home usa una fotografía horizontal de `revision/Equipo y página web-59.jpg` mientras no haya interacción.
- El preview del home combina los clips horizontales `STOCK/C7258.MP4`, `C7242.MP4` y `C7269.MP4`: reunión técnica, modelado estructural y coordinación de planos. Se verificó la orientación efectiva de los 69 clips disponibles; 28 son horizontales.

## Preparación reproducible

```sh
npm run prepare:consultoria-images
npm run prepare:consultoria-preview
npm run prepare:consultoria-hero
```

Las imágenes se guardan en `public/assets/consultoria/`: WebP sin metadatos, sin ampliar el original, hasta 1280 × 1440 px y con un objetivo máximo de 90 KB por archivo. La selección actual de 19 fotografías pasa de 22 MB a 0,89 MB. Astro genera adicionalmente tamaños responsivos para portadas, galerías y home. Todas las fotografías de servicios usan `object-fit: cover`, incluidas las verticales de las tarjetas ampliadas, para llenar su panel sin bandas laterales. Las portadas no tienen tinte azul ni oscurecimiento adicional al hover; solo un degradado negro fijo junto al texto para mantener su legibilidad.

Los videos se guardan en `public/assets/services/consultoria-stock*.mp4`: H.264 de 8 bits, 24 fps, sin audio ni metadatos y con `faststart`. Se generan dos tamaños: 1280 × 720 y 768 × 432. Las disolvencias de 500 ms, incluido el enlace del loop, están incorporadas en un único archivo de 12 segundos por tamaño; no hay varios decodificadores ni transiciones JavaScript entre clips.

Tamaños verificados: **1,13 MB** para escritorio y **0,52 MB** para la versión compacta. Ambos archivos se han decodificado completos para comprobar su integridad y ausencia de audio.

## Hero de la página de consultoría

El hero tiene dos montajes independientes, codificados directamente desde los originales de STOCK:

- Escritorio: las tres tomas horizontales del preview, en **1920 × 1080**.
- Móvil (hasta 900 px): las tomas verticales **C7256.MP4, C7249.MP4 y C7272.MP4**, en **720 × 1280**, sin recortar la edición horizontal.

Ambos usan H.264, 24 fps, CRF 22, disolvencias de 500 ms y un loop de 12 segundos. Cada edición tiene un poster WebP de su primer fotograma. Un `<picture>` selecciona el poster correcto antes de cargar JavaScript; no se descarga el poster horizontal en móvil.

`npm run prepare:consultoria-hero` genera ambas versiones. Para regenerar únicamente la edición vertical: `npm run prepare:consultoria-hero-mobile`. El hero horizontal pesa **4,31 MB**. La antigua versión compacta horizontal queda sin referencias y no se publica.

La edición vertical pesa **1,81 MB** y se verificó su decodificación completa: 720 × 1280, relación 9:16, 24 fps, 12 segundos y sin audio. Se probó la selección exclusiva de video/poster móvil en 390, 430 y 768 px, y la conservación de la edición horizontal en escritorio.

Solo se descarga una versión según el ancho de pantalla. El hero se reproduce únicamente mientras está visible y la pestaña está activa; con ahorro de datos conserva el poster. Las versiones publicadas y los previews del home están permitidos expresamente en `.gitignore`; los originales permanecen intactos.

## Carga y reproducción

- Sin hover ni foco de teclado: solo fotografía, video sin `src`, `preload="none"` y ninguna descarga del preview.
- Hover de ratón o foco visible: se asigna el archivo apropiado y se desvanece el video sobre la fotografía al empezar la reproducción.
- Al retirar el hover/foco, salir del viewport o esconder la pestaña: pausa y retorno suave a la fotografía.
- Con ahorro de datos: únicamente fotografía estática.
- En dispositivos táctiles: no hay autoplay por scroll; el enlace conserva su navegación normal.
- El coordinador compartido `src/lib/viewport-media.ts` permite únicamente un video decorativo activo a la vez y respeta la elegibilidad de cada tarjeta.

Construcción conserva sus archivos actuales. Sus previews también permanecen estáticos hasta hover/foco, para evitar descargas y reproducción involuntarias.
