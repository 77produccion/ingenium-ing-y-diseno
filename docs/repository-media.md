# Medios publicados y originales locales

GitHub contiene el código, los scripts de preparación y únicamente los nuevos medios optimizados utilizados por la web.

- `public/ingenium/` y `public/videos/`: originales locales, ignorados. Los scripts de preparación requieren disponer de esos originales; no son necesarios para compilar los derivados publicados.
- `public/assets/services/`: solo los previews activos de Consultoría y Construcción y el poster de Construcción.
- `public/assets/hero-videos/`: películas y posters activos. El antiguo preview de Consultoría queda local, sin seguimiento.
- `public/assets/team/portraits-2026/`: solo el fondo y los diez recortes de `waist/` utilizados. Los recortes fuente y la variante `juan2` quedan locales.
- `public/assets/consultoria/working-oficina.webp`: derivado sin uso, ignorado.

Los MP4 publicados de `hero-videos/` y `services/` usan Git LFS. Al clonar se necesita Git LFS para descargar los videos, además de `npm ci` para instalar dependencias. No se ha reescrito el historial del repositorio.

Ignorar archivos no impide que Astro copie archivos locales de `public/` a `dist/`. Para publicar desde este equipo se debe usar un checkout limpio o excluir los originales del paquete de despliegue.
