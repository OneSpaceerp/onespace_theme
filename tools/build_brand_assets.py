#!/usr/bin/env python3
"""Regenerate every OneSpace brand asset the app ships.

    python tools/build_brand_assets.py <folder holding the three source PNGs>

The sources are the artwork the brand was delivered as:

    onespace_light.png   lockup with charcoal letters, for light backgrounds
    onespace_dark.png    lockup with light letters, for dark backgrounds
    onespace_icon.png    app icon: the mark on a rounded charcoal tile

The mark itself is not read from the PNGs. It is four plain shapes - the
vertical stem, the horizontal bar and the two 45-degree strokes - traced from
the lockup (99.7% pixel overlap with the artwork), so it can be drawn
crisply at any size and shipped as SVG. Everything below is derived from
those shapes, so the favicon, the tab icon and the launcher tile can never
drift from one another.

Requires Pillow. Writes into onespace/public/images/.
"""

import os
import sys

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "onespace", "public", "images")

BRAND = (255, 51, 1)  # #FF3301, sampled from the delivered artwork
BRAND_HEX = "#FF3301"
TILE_CENTRE = (6, 6, 6)
TILE_EDGE = (52, 50, 50)

# The mark in the lockup's own pixel space (1884 x 914 artwork).
MARK_BOX = (0, 11, 513, 903)  # x0, y0, x1, y1
MARK_SHAPES = [
	[(411, 11), (513, 11), (513, 903), (411, 903)],
	[(0, 402), (412, 402), (412, 512), (0, 512)],
	[(109.5, 176.5), (183, 103), (411.5, 331.5), (411.5, 478.5)],
	[(96, 743), (174.5, 821.5), (411.5, 585.5), (411.5, 427.5)],
]


def _points(shape):
	return " ".join(f"{x:g},{y:g}" for x, y in shape)


def mark_svg() -> str:
	x0, y0, x1, y1 = MARK_BOX
	polys = "".join(f'<polygon points="{_points(s)}"/>' for s in MARK_SHAPES)
	return (
		f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {x1 - x0} {y1 - y0}" '
		f'role="img" aria-label="OneSpace"><g fill="{BRAND_HEX}">{polys}</g></svg>\n'
	)


def icon_svg() -> str:
	"""The app tile: the mark centred on a rounded charcoal square, at the
	proportions of the delivered icon (mark 79% of the tile's height)."""
	x0, y0, x1, y1 = MARK_BOX
	mw, mh = x1 - x0, y1 - y0
	size = 512
	scale = size * 0.79 / mh
	tx = (size - mw * scale) / 2 - x0 * scale
	ty = (size - mh * scale) / 2 - y0 * scale
	polys = "".join(f'<polygon points="{_points(s)}"/>' for s in MARK_SHAPES)
	return (
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="OneSpace">'
		'<defs><radialGradient id="t" cx="0.5" cy="0.5" r="0.72">'
		'<stop offset="0" stop-color="#060606"/><stop offset="1" stop-color="#343232"/>'
		"</radialGradient></defs>"
		'<rect width="512" height="512" rx="112" fill="url(#t)"/>'
		f'<g fill="{BRAND_HEX}" transform="translate({tx:.2f} {ty:.2f}) scale({scale:.5f})">{polys}</g>'
		"</svg>\n"
	)


def render_icon(size: int) -> Image.Image:
	"""Rasterise the tile at `size`, supersampled 8x for clean edges."""
	ss = 8
	big = size * ss
	tile = Image.new("RGBA", (big, big), (0, 0, 0, 0))

	# Radial: near-black at the centre, warm charcoal at the edges, as the
	# delivered icon is drawn. Computed on a small grid and scaled up.
	g = 256
	gradient = Image.new("RGBA", (g, g))
	for y in range(g):
		for x in range(g):
			d = min(1.0, (((x - g / 2) ** 2 + (y - g / 2) ** 2) ** 0.5) / (g * 0.72))
			gradient.putpixel(
				(x, y),
				tuple(round(TILE_CENTRE[i] + (TILE_EDGE[i] - TILE_CENTRE[i]) * d) for i in range(3)) + (255,),
			)
	gradient = gradient.resize((big, big), Image.BICUBIC)
	mask = Image.new("L", (big, big), 0)
	ImageDraw.Draw(mask).rounded_rectangle((0, 0, big - 1, big - 1), radius=round(big * 112 / 512), fill=255)
	tile.paste(gradient, (0, 0), mask)

	x0, y0, x1, y1 = MARK_BOX
	mw, mh = x1 - x0, y1 - y0
	scale = big * 0.79 / mh
	tx = (big - mw * scale) / 2 - x0 * scale
	ty = (big - mh * scale) / 2 - y0 * scale
	draw = ImageDraw.Draw(tile)
	for shape in MARK_SHAPES:
		draw.polygon([(tx + x * scale, ty + y * scale) for x, y in shape], fill=BRAND + (255,))
	return tile.resize((size, size), Image.LANCZOS)


def trimmed_logo(path: str, height: int) -> Image.Image:
	im = Image.open(path).convert("RGBA")
	im = im.crop(im.getbbox())
	width = round(im.width * height / im.height)
	return im.resize((width, height), Image.LANCZOS)


def main(src: str) -> None:
	os.makedirs(OUT, exist_ok=True)

	def write(name, text):
		with open(os.path.join(OUT, name), "w", encoding="utf-8", newline="\n") as f:
			f.write(text)

	write("onespace-mark.svg", mark_svg())
	write("onespace-icon.svg", icon_svg())

	for size in (32, 64, 180, 192, 512):
		render_icon(size).save(os.path.join(OUT, f"onespace-icon-{size}.png"), optimize=True)
	render_icon(64).save(os.path.join(OUT, "favicon.png"), optimize=True)

	# 160px tall: sharp on a 2x screen at the 80px the login panel draws it.
	trimmed_logo(os.path.join(src, "onespace_light.png"), 160).save(
		os.path.join(OUT, "onespace-logo-light.png"), optimize=True
	)
	trimmed_logo(os.path.join(src, "onespace_dark.png"), 160).save(
		os.path.join(OUT, "onespace-logo-dark.png"), optimize=True
	)
	print("Wrote brand assets to", OUT)


if __name__ == "__main__":
	if len(sys.argv) != 2:
		sys.exit(__doc__)
	main(sys.argv[1])
