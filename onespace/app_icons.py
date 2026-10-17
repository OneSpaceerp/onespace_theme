"""App icons in the OneSpace style, generated for whatever apps are installed.

Every Frappe app ships its own logo - Frappe HR's green leaf, Helpdesk's blue
headset, Healthcare's red cross - drawn in its own vendor's style, so a site
running six apps looks like six products. This draws each installed app an
icon in one family instead:

* Colour Tiles - the Launcher's rounded gradient tile with a white glyph;
* Brand Tiles  - the OneSpace app icon's charcoal tile with an orange glyph.

What goes on the tile, in order:

  1. the glyph and colour an admin chose for the app in OneSpace Settings;
  2. the ones this file knows for the app (Frappe HR, Helpdesk, Healthcare,
     CRM, LMS, Insights, Drive, ... about forty apps);
  3. one picked from keywords in the app's name and title, so a custom app
     called "ecs_cheques" gets a card and "nsd_itsm" a headset;
  4. the app's initials, on a colour derived from its name.

Steps 3 and 4 are deterministic: the same app gets the same icon on every
site and every boot, so nobody learns to look for a tile that then moves.

The icons are small SVG documents returned as data: URIs, so nothing is
written to disk, nothing needs `bench build`, and a newly installed app has
its icon on the next page load. This module has no frappe import, so it is
covered by the pure tests.

Glyphs are from Lucide (https://lucide.dev), ISC License.
"""

import hashlib
import re
from functools import lru_cache
from urllib.parse import quote
from xml.sax.saxutils import escape

STYLE_COLOUR = "Colour Tiles"
STYLE_BRAND = "Brand Tiles"
STYLE_ONESPACE = "OneSpace Icon"
STYLE_ORIGINAL = "Original Logos"
STYLES = (STYLE_COLOUR, STYLE_BRAND, STYLE_ONESPACE, STYLE_ORIGINAL)
GENERATED_STYLES = (STYLE_COLOUR, STYLE_BRAND)

BRAND_ORANGE = "#FF3301"

# Gradient pairs, light end first. The same pairs as the Launcher's tiles
# ($hues in public/css/onespace/_launcher.scss); a test keeps them in step.
HUES = {
	"teal": ("#2dd4bf", "#0d9488"),
	"orange": ("#ff7a45", "#de2f00"),
	"violet": ("#a78bfa", "#7c3aed"),
	"gold": ("#fbbf24", "#d97706"),
	"emerald": ("#34d399", "#059669"),
	"pink": ("#f472b6", "#c026d3"),
	"indigo": ("#818cf8", "#4338ca"),
	"green": ("#4ade80", "#10b981"),
	"amber": ("#fdba74", "#ea580c"),
	"cyan": ("#22d3ee", "#0891b2"),
	"blue": ("#60a5fa", "#2563eb"),
	"sky": ("#7dd3fc", "#0284c7"),
	"slate": ("#94a3b8", "#334155"),
}

# 24x24 stroke glyphs (Lucide, ISC).
GLYPHS = {
	"package": '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
	"layers": '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
	"users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
	"headset": '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/>',
	"stethoscope": '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
	"heart-pulse": '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
	"heart": '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
	"handshake": '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
	"chart": '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
	"graduation": '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
	"library": '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
	"card": '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
	"pen": '<path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
	"folder": '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
	"book": '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
	"printer": '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
	"landmark": '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
	"chat": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
	"message": '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
	"kanban": '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 7v7"/><path d="M12 7v4"/><path d="M16 7v9"/>',
	"bed": '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
	"sprout": '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
	"cart": '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
	"truck": '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
	"file-check": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/>',
	"phone": '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
	"receipt": '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
	"calendar": '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
	"mail": '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
	"monitor": '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
	"briefcase": '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
	"plug": '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
	"home": '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
	"plane": '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
	"store": '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>',
	"wrench": '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
	"shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
	"box": '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
	"globe": '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
	"factory": '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
	"car": '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
}

# Apps this file knows, by their bench name: (glyph, hue).
KNOWN_APPS = {
	"frappe": ("layers", "slate"),
	"erpnext": ("package", "orange"),
	"hrms": ("users", "pink"),
	"helpdesk": ("headset", "blue"),
	"healthcare": ("stethoscope", "cyan"),
	"marley": ("heart-pulse", "cyan"),
	"crm": ("handshake", "teal"),
	"insights": ("chart", "violet"),
	"lms": ("graduation", "indigo"),
	"education": ("library", "indigo"),
	"payments": ("card", "emerald"),
	"lending": ("landmark", "emerald"),
	"builder": ("pen", "amber"),
	"drive": ("folder", "sky"),
	"wiki": ("book", "gold"),
	"print_designer": ("printer", "slate"),
	"raven": ("chat", "violet"),
	"gameplan": ("kanban", "teal"),
	"hospitality": ("bed", "amber"),
	"agriculture": ("sprout", "green"),
	"non_profit": ("heart", "pink"),
	"webshop": ("store", "orange"),
	"ecommerce_integrations": ("cart", "orange"),
	"erpnext_shipping": ("truck", "amber"),
	"india_compliance": ("file-check", "emerald"),
	"telephony": ("phone", "green"),
	"expenses": ("receipt", "gold"),
	"frappe_whatsapp": ("message", "green"),
	"mail": ("mail", "blue"),
	"posawesome": ("monitor", "orange"),
	"posnext": ("monitor", "orange"),
	"pos_next": ("monitor", "orange"),
	"twilio_integration": ("phone", "pink"),
	"payroll": ("receipt", "pink"),
	"fleet_management": ("car", "blue"),
	"asset_management": ("box", "emerald"),
	"manufacturing": ("factory", "indigo"),
	"website": ("globe", "sky"),
	"studio": ("pen", "violet"),
	"frappe_appointment": ("calendar", "teal"),
}

# Anything else is matched by keyword, first match wins. Checked against the
# app's bench name and its title, lower-cased, with _ and - as spaces.
KEYWORDS = [
	(r"\b(hr|hrms|payroll|employee|people|attendance|leave|recruit)", ("users", "pink")),
	(r"(help ?desk|support|ticket|itsm|service ?desk|issue)", ("headset", "blue")),
	(r"(health|clinic|hospital|patient|medical|pharma)", ("stethoscope", "cyan")),
	(r"(crm|lead|sales|deal|customer)", ("handshake", "teal")),
	(r"(insight|analytic|report|dashboard|\bbi\b)", ("chart", "violet")),
	(r"(lms|learn|course|training)", ("graduation", "indigo")),
	(r"(school|education|student|academ|universit)", ("library", "indigo")),
	(r"(cheque|check|payment|card|wallet|pay\b)", ("card", "emerald")),
	(r"(bank|treasury|loan|lending|finance|cash)", ("landmark", "emerald")),
	(r"(installment|instalment|invoice|billing|expense|receipt)", ("receipt", "gold")),
	(
		r"(contract|agreement|legal|compliance|einvoice|e invoice|zatca|\beta\b|tax)",
		("file-check", "emerald"),
	),
	(r"(chat|raven|whatsapp|sms|message)", ("message", "green")),
	(r"(mail|email|newsletter)", ("mail", "blue")),
	(r"(pos\b|point of sale|retail|cashier)", ("monitor", "orange")),
	(r"(shop|commerce|store|cart|market)", ("cart", "orange")),
	(r"(ship|logist|delivery|fleet|transport|freight)", ("truck", "amber")),
	(r"(trip|travel|flight|tour)", ("plane", "sky")),
	(r"(car\b|cars|vehicle|auto)", ("car", "blue")),
	(r"(hotel|hospitality|booking|room)", ("bed", "amber")),
	(r"(farm|agri|crop)", ("sprout", "green")),
	(r"(real ?estate|property|propert|tenant|lease|rent)", ("home", "teal")),
	(r"(project|task|kanban|plan)", ("kanban", "teal")),
	(r"(calendar|appointment|schedul|event)", ("calendar", "teal")),
	(r"(drive|file|document|storage)", ("folder", "sky")),
	(r"(wiki|knowledge|\bkb\b|docs)", ("book", "gold")),
	(r"(print|label|barcode)", ("printer", "slate")),
	(r"(career|job|vacanc)", ("briefcase", "indigo")),
	(r"(phone|call|telephon|voip)", ("phone", "green")),
	(r"(maintenance|repair|service|workshop)", ("wrench", "slate")),
	(r"(manufactur|production|factory|plant)", ("factory", "indigo")),
	(r"(asset|inventory|stock|warehouse)", ("box", "gold")),
	(r"(security|audit|access|auth)", ("shield", "slate")),
	(r"(website|web|portal|builder|cms)", ("globe", "sky")),
	(r"(integration|connector|sync|api|webhook)", ("plug", "violet")),
	(r"(charity|donat|non ?profit|ngo)", ("heart", "pink")),
]

# Words a title shares with every app on the site, so they say nothing about
# this one and must not become its initials.
_NOISE = {"onespace", "frappe", "erpnext", "the", "app", "for", "and", "of"}


def _norm(text: str) -> str:
	return re.sub(r"[_\-]+", " ", (text or "").lower()).strip()


def _hue_from_name(name: str) -> str:
	keys = sorted(HUES)
	digest = hashlib.sha1((name or "").encode("utf-8")).hexdigest()
	return keys[int(digest[:8], 16) % len(keys)]


def initials(title: str, app: str = "") -> str:
	words = [w for w in re.findall(r"[A-Za-z0-9]+", title or "") if w.lower() not in _NOISE]
	if not words:
		words = [w for w in re.findall(r"[A-Za-z0-9]+", _norm(app)) if w.lower() not in _NOISE]
	if not words:
		return "?"
	if len(words) == 1:
		return words[0][:2].upper() if len(words[0]) > 1 else words[0].upper()
	return (words[0][0] + words[1][0]).upper()


def choose(
	app: str, title: str = "", glyph: str | None = None, hue: str | None = None
) -> tuple[str | None, str]:
	"""(glyph or None for a monogram, hue) for an app. Choices from Settings win."""
	known_glyph, known_hue = KNOWN_APPS.get(app, (None, None))
	if not known_glyph:
		haystack = f"{_norm(app)} {_norm(title)}"
		for pattern, (g, h) in KEYWORDS:
			if re.search(pattern, haystack):
				known_glyph, known_hue = g, h
				break
	chosen_glyph = glyph if glyph in GLYPHS else known_glyph
	chosen_hue = hue if hue in HUES else (known_hue or _hue_from_name(app))
	return chosen_glyph, chosen_hue


def _glyph_group(glyph: str | None, label: str, stroke: str) -> str:
	if glyph and glyph in GLYPHS:
		return (
			f"<g transform='translate(15 15) scale(1.4167)' fill='none' stroke='{stroke}' "
			f"stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'>{GLYPHS[glyph]}</g>"
		)
	size = 26 if len(label) <= 1 else 22
	return (
		f"<text x='32' y='33' text-anchor='middle' dominant-baseline='central' "
		f"font-family='Plus Jakarta Sans,Segoe UI,Helvetica Neue,Arial,sans-serif' "
		f"font-weight='800' font-size='{size}' letter-spacing='-0.5' fill='{stroke}'>{escape(label)}</text>"
	)


@lru_cache(maxsize=512)
def svg(
	app: str, title: str = "", style: str = STYLE_COLOUR, glyph: str | None = None, hue: str | None = None
) -> str:
	"""The icon as an SVG document, 64x64."""
	chosen_glyph, chosen_hue = choose(app, title, glyph, hue)
	label = initials(title, app)
	light, dark = HUES[chosen_hue]

	if style == STYLE_BRAND:
		background = (
			"<defs><radialGradient id='t' cx='.5' cy='.5' r='.72'>"
			"<stop offset='0' stop-color='#0b0b0b'/><stop offset='1' stop-color='#353333'/>"
			"</radialGradient></defs>"
			"<rect width='64' height='64' rx='16' fill='url(#t)'/>"
		)
		stroke = BRAND_ORANGE
	else:
		background = (
			"<defs><linearGradient id='t' x1='0' y1='0' x2='1' y2='1'>"
			f"<stop offset='0' stop-color='{light}'/><stop offset='1' stop-color='{dark}'/>"
			"</linearGradient><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'>"
			"<stop offset='0' stop-color='#fff' stop-opacity='.24'/><stop offset='.55' stop-color='#fff' stop-opacity='0'/>"
			"</linearGradient></defs>"
			"<rect width='64' height='64' rx='16' fill='url(#t)'/>"
			"<rect width='64' height='64' rx='16' fill='url(#s)'/>"
		)
		stroke = "#ffffff"

	return (
		"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' width='64' height='64'>"
		f"{background}{_glyph_group(chosen_glyph, label, stroke)}</svg>"
	)


def data_uri(document: str) -> str:
	"""An SVG as a data: URI that is safe inside any HTML attribute.

	Percent-encoded rather than base64 (a third smaller), with every quote,
	space, angle bracket and `#` encoded: some of the desk's templates
	interpolate logo URLs into attributes unescaped, and a raw `#` would end
	the URI.
	"""
	return "data:image/svg+xml," + quote(document, safe="/:=.,-()")


def icon_uri(
	app: str, title: str = "", style: str = STYLE_COLOUR, glyph: str | None = None, hue: str | None = None
) -> str:
	return data_uri(svg(app, title, style, glyph or None, hue or None))
