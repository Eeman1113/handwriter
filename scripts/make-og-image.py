"""
Renders src/app/opengraph-image.png -- the 1200x630 card shown when the site is
shared on social media and in some search results.

Author: Eeman Majumder <eeman.majumder@gmail.com>
Run `node scripts/make-og-image.mjs` first. Needs Pillow.
"""
import json
import pathlib

from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
W, H, SS = 1200, 630, 2          # supersampled, then downscaled for clean edges
PAPER = (251, 251, 250)
INK = (26, 42, 108)
GREY = (118, 114, 106)

geometry_file = ROOT / "scripts/.og-geometry.json"
if not geometry_file.exists():
    raise SystemExit("Run `node scripts/make-og-image.mjs` first.")

g = json.loads(geometry_file.read_text())

img = Image.new("RGB", (W * SS, H * SS), PAPER)
draw = ImageDraw.Draw(img)

# The wordmark, sized to a comfortable share of the card width.
# `oy` is the top of the glyph box, since the path is measured down from maxY.
MARK_TOP = 170          # in final pixels
scale = (W * SS * 0.62) / g["width"]
ox = (W * SS - g["width"] * scale) / 2
oy = MARK_TOP * SS

mark_height = g["height"] * scale / SS   # final pixels, used to place the captions

for stroke in g["strokes"]:
    pts = [(ox + (x - g["minX"]) * scale, oy + (g["maxY"] - y) * scale) for x, y in stroke]
    draw.line(pts, fill=INK, width=int(0.9 * scale), joint="curve")

card = img.resize((W, H), Image.LANCZOS)
draw = ImageDraw.Draw(card)


def font(size):
    """A real UI face if one is available, otherwise Pillow's fallback."""
    for candidate in (
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNS.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ):
        if pathlib.Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def centred(text, y, f, fill):
    w = draw.textbbox((0, 0), text, font=f)[2]
    draw.text(((W - w) / 2, y), text, font=f, fill=fill)


caption_y = MARK_TOP + mark_height + 56
centred("Text into real handwriting", caption_y, font(38), (26, 26, 24))
centred("Transparent SVG & PNG  ·  80 hands  ·  free & open source",
        caption_y + 58, font(24), GREY)

card.save(ROOT / "src/app/opengraph-image.png")
print(f"opengraph-image.png written — {W}x{H}")
