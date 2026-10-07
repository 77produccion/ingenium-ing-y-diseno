from __future__ import annotations

from collections import defaultdict
from pathlib import Path
import html
import math
import sys

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "assets"
OUTPUT = ROOT / "public" / "drawings"


def thin(mask: np.ndarray) -> np.ndarray:
    """Zhang-Suen thinning: reduce bright raster strokes to their centerlines."""
    image = mask.copy()
    height, width = image.shape
    while True:
        changed = False
        for phase in (0, 1):
            p = np.pad(image, 1)
            n = [p[:-2, 1:-1], p[:-2, 2:], p[1:-1, 2:], p[2:, 2:],
                 p[2:, 1:-1], p[2:, :-2], p[1:-1, :-2], p[:-2, :-2]]
            count = sum(x.astype(np.uint8) for x in n)
            transitions = sum((~n[i] & n[(i + 1) % 8]).astype(np.uint8) for i in range(8))
            remove = image & (count >= 2) & (count <= 6) & (transitions == 1)
            if phase == 0:
                remove &= ~(n[0] & n[2] & n[4]) & ~(n[2] & n[4] & n[6])
            else:
                remove &= ~(n[0] & n[2] & n[6]) & ~(n[0] & n[4] & n[6])
            if np.any(remove):
                image[remove] = False
                changed = True
        if not changed:
            return image


def simplify(points: list[tuple[int, int]], tolerance: float = 0.7) -> list[tuple[int, int]]:
    if len(points) < 3:
        return points
    first, last = points[0], points[-1]
    dx, dy = last[0] - first[0], last[1] - first[1]
    denom = math.hypot(dx, dy)
    best, index = -1.0, -1
    for i, point in enumerate(points[1:-1], 1):
        distance = (math.hypot(point[0] - first[0], point[1] - first[1]) if denom == 0
                    else abs(dy * point[0] - dx * point[1] + last[0] * first[1] - last[1] * first[0]) / denom)
        if distance > best:
            best, index = distance, i
    if best <= tolerance:
        return [first, last]
    return simplify(points[:index + 1], tolerance)[:-1] + simplify(points[index:], tolerance)


def chains(skeleton: np.ndarray) -> list[list[tuple[int, int]]]:
    ys, xs = np.nonzero(skeleton)
    pixels = set(zip(xs.tolist(), ys.tolist()))
    neighbor_cache: dict[tuple[int, int], list[tuple[int, int]]] = {}

    def neighbors(point: tuple[int, int]) -> list[tuple[int, int]]:
        if point not in neighbor_cache:
            x, y = point
            result = []
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    candidate = (x + dx, y + dy)
                    if not (dx or dy) or candidate not in pixels:
                        continue
                    # Prefer orthogonal connections where a diagonal would create
                    # a false triangle at every corner of a one-pixel line.
                    if dx and dy and ((x + dx, y) in pixels or (x, y + dy) in pixels):
                        continue
                    result.append(candidate)
            neighbor_cache[point] = result
        return neighbor_cache[point]

    nodes = {point for point in pixels if len(neighbors(point)) != 2}
    visited: set[tuple[tuple[int, int], tuple[int, int]]] = set()
    result: list[list[tuple[int, int]]] = []

    def edge(a: tuple[int, int], b: tuple[int, int]) -> tuple[tuple[int, int], tuple[int, int]]:
        return (a, b) if a < b else (b, a)

    for start in nodes:
        for following in neighbors(start):
            if edge(start, following) in visited:
                continue
            path = [start, following]
            visited.add(edge(start, following))
            previous, current = start, following
            while current not in nodes:
                options = [point for point in neighbors(current) if point != previous]
                if not options:
                    break
                nxt = options[0]
                if edge(current, nxt) in visited:
                    break
                visited.add(edge(current, nxt))
                path.append(nxt)
                previous, current = current, nxt
            if len(path) > 1:
                result.append(simplify(path))

    # Closed loops have no endpoint/junction, so visit their unclaimed edges too.
    for start in pixels:
        for following in neighbors(start):
            if edge(start, following) in visited:
                continue
            path = [start, following]
            visited.add(edge(start, following))
            previous, current = start, following
            while True:
                options = [point for point in neighbors(current) if point != previous]
                if not options or edge(current, options[0]) in visited:
                    break
                nxt = options[0]
                visited.add(edge(current, nxt))
                path.append(nxt)
                previous, current = current, nxt
            if len(path) > 1:
                result.append(simplify(path))
    return result


def trace(source: Path) -> None:
    image = Image.open(source).convert("RGB")
    width, height = image.size
    rgb = np.asarray(image, dtype=np.uint8)
    # The supplied blueprint sheets use near-black backgrounds and pale ink.
    gray = (rgb[:, :, 0].astype(np.uint32) * 299 + rgb[:, :, 1].astype(np.uint32) * 587 +
            rgb[:, :, 2].astype(np.uint32) * 114) // 1000
    mask = gray >= 165
    skeleton = thin(mask)
    strokes = chains(skeleton)
    strokes = [p for p in strokes if len(p) > 1]
    strokes.sort(key=lambda points: (-max(point[1] for point in points), min(point[0] for point in points)))

    # The source image informs only geometry; the output contains SVG paths alone.
    markup = []
    for points in strokes:
        coordinates = " ".join(f"{x},{y}" for x, y in points)
        markup.append(f'<polyline class="draw-stroke" points="{coordinates}"/>')
    name = source.stem
    OUTPUT.mkdir(parents=True, exist_ok=True)
    destination = OUTPUT / f"{name}.svg"
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
           f'width="100%" height="100%" preserveAspectRatio="xMidYMid meet" '
           f'role="img" aria-label="Dibujo técnico vectorial: {html.escape(name)}">\n'
           f'<g fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" '
           f'stroke-width="1.15">\n' + "\n".join(markup) + "\n</g>\n</svg>\n")
    destination.write_text(svg, encoding="utf-8")
    print(f"{source.name}: {len(strokes)} paths -> {destination.relative_to(ROOT)}")


def main() -> None:
    sources = sorted(SOURCE.glob("*.png"))
    if len(sys.argv) > 1:
        wanted = set(sys.argv[1:])
        sources = [source for source in sources if source.stem in wanted]
    for source in sources:
        trace(source)


if __name__ == "__main__":
    main()
