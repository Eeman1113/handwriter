"""
Renders src/app/apple-icon.png from the same glyph as icon.svg.

iOS ignores transparency on touch icons and composites them onto black, so
this one gets a solid ink-coloured tile with the letter knocked out in white,
rather than the adaptive transparent treatment the SVG favicon uses.

Run: python3 scripts/make-apple-icon.py   (needs Pillow)
"""
import json
import pathlib
import re

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
SIZE = 180          # the size iOS asks for
SS = 4              # supersample factor, for smooth edges
INK = (26, 42, 108) # the default blue-black
PAPER = (255, 255, 255)

geometry_file = ROOT / "scripts/.icon-geometry.json"
if not geometry_file.exists():
    raise SystemExit("Run `node scripts/make-icon.mjs` first — it writes the glyph this needs.")

geom = json.loads(geometry_file.read_text())
box, stroke, path = geom["box"], geom["stroke"], geom["path"]

# The generated path is only ever M/L commands, so a simple parse is enough.
points = [tuple(map(float, m)) for m in re.findall(r"[ML](-?[\d.]+) (-?[\d.]+)", path)]

scale = SIZE * SS / box
img = Image.new("RGB", (SIZE * SS, SIZE * SS), INK)
draw = ImageDraw.Draw(img)

pts = [(x * scale, y * scale) for x, y in points]
width = int(stroke * scale)
draw.line(pts, fill=PAPER, width=width, joint="curve")
# round off the two ends, which `line` leaves square
for x, y in (pts[0], pts[-1]):
    r = width / 2
    draw.ellipse([x - r, y - r, x + r, y + r], fill=PAPER)

img.resize((SIZE, SIZE), Image.LANCZOS).save(ROOT / "src/app/apple-icon.png")
print(f"apple-icon.png written — {SIZE}x{SIZE}, {len(points)} points")
