"""Checks that need no site: colours, assets, defaults and the sign-in template.

Run with `bench --site <site> run-tests --app onespace`, or directly with
`python -m unittest onespace.tests.test_pure` from the app folder (only
jinja2 is needed for the template test, and it skips without it).
"""

import ast
import json
import os
import re
import unittest

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(APP, "public")
TOKENS = os.path.join(PUBLIC, "css", "onespace", "_tokens.scss")


def read(*parts):
	with open(os.path.join(APP, *parts), encoding="utf-8") as f:
		return f.read()


# ---------------------------------------------------------------------------
# Colour maths (WCAG 2.x relative luminance and contrast)
# ---------------------------------------------------------------------------


def parse_colour(value):
	value = value.strip().lower()
	if value.startswith("#"):
		h = value[1:]
		if len(h) == 3:
			h = "".join(c * 2 for c in h)
		return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4)) + (1.0,)
	m = re.match(r"rgba?\(([^)]+)\)", value)
	if m:
		parts = [p.strip() for p in m.group(1).split(",")]
		rgb = tuple(int(float(p)) for p in parts[:3])
		return rgb + ((float(parts[3]) if len(parts) > 3 else 1.0),)
	raise ValueError(value)


def over(fg, bg):
	"""Composite a translucent colour over an opaque one."""
	a = fg[3]
	return tuple(round(fg[i] * a + bg[i] * (1 - a)) for i in range(3)) + (1.0,)


def luminance(c):
	def ch(v):
		v /= 255
		return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

	return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2])


def contrast(a, b):
	la, lb = luminance(a), luminance(b)
	return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def token_sets():
	"""{"light": {name: colour}, "dark": {...}} with var() references resolved."""
	src = read("public", "css", "onespace", "_tokens.scss")
	primitives = dict(re.findall(r"(--os-[a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8});", src.split("@mixin")[0]))

	def block(name):
		body = re.search(r"@mixin " + name + r" \{(.*?)\n\}", src, re.S).group(1)
		return dict(re.findall(r"(--os-[a-z0-9-]+):\s*([^;]+);", body))

	def resolve(value, scope):
		for _ in range(5):
			m = re.fullmatch(r"var\((--os-[a-z0-9-]+)\)", value.strip())
			if not m:
				break
			value = scope.get(m.group(1)) or primitives[m.group(1)]
		return value

	out = {}
	for mode in ("light", "dark"):
		raw = block("os-" + mode)
		resolved = {}
		for k, v in raw.items():
			v = resolve(v, raw)
			try:
				resolved[k] = parse_colour(v)
			except ValueError:
				continue
		out[mode] = resolved
	return out


class TestTokens(unittest.TestCase):
	"""Every text/background pair the design uses clears WCAG AA."""

	TEXT_PAIRS = [
		("--os-text", "--os-canvas"),
		("--os-text", "--os-surface"),
		("--os-text-body", "--os-surface"),
		("--os-text-muted", "--os-surface"),
		("--os-text-muted", "--os-canvas"),
		("--os-label", "--os-surface"),
		("--os-link", "--os-surface"),
		("--os-link", "--os-canvas"),
		("--os-on-primary", "--os-primary"),
		("--os-on-primary", "--os-primary-hover"),
		("--os-success-fg", "--os-success-bg"),
		("--os-danger-fg", "--os-danger-bg"),
		("--os-pending-fg", "--os-pending-bg"),
		("--os-neutral-fg", "--os-neutral-bg"),
		("--os-on-inverse", "--os-inverse"),
	]

	def setUp(self):
		self.sets = token_sets()

	def bg(self, mode, name):
		colour = self.sets[mode][name]
		# Translucent fills sit on a card.
		return over(colour, self.sets[mode]["--os-surface"]) if colour[3] < 1 else colour

	def test_text_pairs_meet_aa(self):
		failures = []
		for mode in ("light", "dark"):
			for fg, bg in self.TEXT_PAIRS:
				ratio = contrast(self.sets[mode][fg], self.bg(mode, bg))
				if ratio < 4.5:
					failures.append(f"{mode}: {fg} on {bg} = {ratio:.2f}")
		self.assertEqual(failures, [], "below WCAG AA 4.5:1")

	def test_focus_ring_colour_is_visible(self):
		# Non-text contrast (WCAG 1.4.11): 3:1 against the page.
		for mode in ("light", "dark"):
			for bg in ("--os-canvas", "--os-surface"):
				ratio = contrast(self.sets[mode]["--os-brand"], self.bg(mode, bg))
				self.assertGreaterEqual(ratio, 3.0, f"{mode}: brand ring on {bg} = {ratio:.2f}")

	def test_signature_orange_is_not_used_under_white_text(self):
		"""#FF3700 under white text is 3.6:1. Filled buttons must use --os-primary."""
		white = parse_colour("#ffffff")
		self.assertLess(contrast(white, parse_colour("#ff3700")), 4.5)
		for mode in ("light", "dark"):
			self.assertNotEqual(self.sets[mode]["--os-primary"], parse_colour("#ff3700"))

	def test_both_modes_define_the_same_tokens(self):
		src = read("public", "css", "onespace", "_tokens.scss")
		light = set(
			re.findall(r"(--os-[a-z0-9-]+):", re.search(r"@mixin os-light \{(.*?)\n\}", src, re.S).group(1))
		)
		dark = set(
			re.findall(r"(--os-[a-z0-9-]+):", re.search(r"@mixin os-dark \{(.*?)\n\}", src, re.S).group(1))
		)
		self.assertEqual(light ^ dark, set(), "a token defined in one mode only would leak across modes")


class TestAssets(unittest.TestCase):
	def test_shipped_brand_assets_exist(self):
		src = read("branding.py")
		for path in re.findall(r'f"\{IMG\}/([^"]+)"', src):
			self.assertTrue(os.path.isfile(os.path.join(PUBLIC, "images", path)), path)

	def test_every_font_face_file_exists(self):
		src = read("public", "css", "onespace", "_fonts.scss")
		files = set(re.findall(r"/assets/onespace/fonts/([^\")]+)", src))
		self.assertTrue(files)
		for name in files:
			self.assertTrue(os.path.isfile(os.path.join(PUBLIC, "fonts", name)), name)

	def test_fonts_are_self_hosted(self):
		for name in os.listdir(os.path.join(PUBLIC, "css", "onespace")):
			src = read("public", "css", "onespace", name)
			self.assertNotIn("fonts.googleapis.com", src, name)
			self.assertNotIn("fonts.gstatic.com", src, name)

	def test_hook_bundles_exist(self):
		hooks = read("hooks.py")
		for bundle in re.findall(r'"([a-z_]+\.bundle\.(?:css|js))"', hooks):
			stem, kind = bundle.rsplit(".", 1)
			candidates = [
				os.path.join(PUBLIC, kind, f"{stem}.{ext}")
				for ext in (("scss", "css") if kind == "css" else ("js",))
			]
			self.assertTrue(any(os.path.isfile(c) for c in candidates), bundle)

	def test_mark_svg_is_the_brand_orange(self):
		svg = read("public", "images", "onespace-mark.svg")
		self.assertIn('fill="#FF3301"', svg)
		self.assertEqual(svg.count("<polygon"), 4)


class TestDefaults(unittest.TestCase):
	"""branding.DEFAULTS stands in for the DocType before migrate; they must agree."""

	def test_code_defaults_match_the_doctype(self):
		tree = ast.parse(read("branding.py"))
		defaults = next(
			ast.literal_eval(node.value)
			for node in tree.body
			if isinstance(node, ast.Assign) and getattr(node.targets[0], "id", None) == "DEFAULTS"
		)
		meta = json.loads(read("onespace", "doctype", "onespace_settings", "onespace_settings.json"))
		fields = {f["fieldname"]: f for f in meta["fields"]}
		mismatched = []
		for key, value in defaults.items():
			field = fields.get(key)
			if not field:
				mismatched.append(f"{key}: no such field")
			elif str(field.get("default")) != str(value):
				mismatched.append(f"{key}: code {value!r} vs DocType {field.get('default')!r}")
		self.assertEqual(mismatched, [])

	def test_settings_doctype_is_system_manager_only(self):
		meta = json.loads(read("onespace", "doctype", "onespace_settings", "onespace_settings.json"))
		self.assertEqual([p["role"] for p in meta["permissions"]], ["System Manager"])
		self.assertEqual(meta.get("make_attachments_public"), 1)


class TestLoginTemplate(unittest.TestCase):
	"""Settings text reaches visitors who are not signed in: it must be escaped."""

	def render(self, **overrides):
		try:
			import jinja2
		except ImportError:
			self.skipTest("jinja2 not installed")
		web = (
			"{% block head_include %}{% endblock %}{% block navbar %}{% endblock %}"
			"{% block page_content %}{% endblock %}{% block footer %}{% endblock %}{% block script %}{% endblock %}"
		)
		macros = "{% macro alert_banner(kind, msg='') %}<div class='{{ kind }}'>{{ msg }}</div>{% endmacro %}"
		env = jinja2.Environment(
			autoescape=False,  # as Frappe's website environment
			loader=jinja2.DictLoader(
				{
					"templates/web.html": web,
					"templates/includes/login/macros.html": macros,
					"templates/includes/login/login.js": "/*login.js*/",
					"page": read("templates", "onespace_login", "onespace_login.html"),
				}
			),
		)
		env.globals.update(_=lambda s, *a: s, include_style=lambda n: f"<link href='{n}'>")
		evil = "<script>alert(1)</script>"
		ctx = dict(
			os_brand=dict(name=evil, logo_light="/l", logo_dark="/d", mark="/m", touch_icon="/t"),
			os_headline=evil,
			os_subheadline=evil,
			os_points=[evil],
			os_footnote=evil,
			os_background='/x" onerror="alert(1)',
			social_login=False,
			disable_signup=False,
			disable_user_pass_login=False,
			signup_form_template="",
		)
		ctx.update(overrides)
		return env.get_template("page").render(**ctx)

	def test_settings_text_is_escaped(self):
		out = self.render()
		self.assertNotIn("<script>alert(1)", out)
		self.assertNotIn('onerror="alert', out)

	def test_frappe_login_hooks_are_kept(self):
		out = self.render()
		for needle in (
			"for-login",
			"for-signup",
			"for-forgot",
			"for-login-with-email-link",
			'id="login_email"',
			'id="login_password"',
			"btn-login",
			"form-forgot",
			"/*login.js*/",
			"login.bundle.css",
		):
			self.assertIn(needle, out)


if __name__ == "__main__":
	unittest.main()


class TestAppIcons(unittest.TestCase):
	"""The generated icons: valid, safe to embed, deterministic, on-palette."""

	def setUp(self):
		import sys

		sys.path.insert(0, os.path.dirname(APP))
		from onespace import app_icons

		self.ai = app_icons

	def test_known_apps_use_real_glyphs_and_hues(self):
		for app, (glyph, hue) in self.ai.KNOWN_APPS.items():
			self.assertIn(glyph, self.ai.GLYPHS, app)
			self.assertIn(hue, self.ai.HUES, app)
		for _pattern, (glyph, hue) in self.ai.KEYWORDS:
			self.assertIn(glyph, self.ai.GLYPHS)
			self.assertIn(hue, self.ai.HUES)

	def test_palette_matches_the_launcher_tiles(self):
		scss = read("public", "css", "onespace", "_launcher.scss")
		pairs = dict(
			(name, (a.lower(), b.lower()))
			for name, a, b in re.findall(r'"([a-z]+)": \((#[0-9a-fA-F]{6}), (#[0-9a-fA-F]{6})\)', scss)
		)
		self.assertEqual(pairs, {k: (a.lower(), b.lower()) for k, (a, b) in self.ai.HUES.items()})

	def test_every_icon_is_well_formed_svg(self):
		import xml.etree.ElementTree as ET

		apps = [*self.ai.KNOWN_APPS, "some_custom_app", "x"]
		for style in self.ai.GENERATED_STYLES:
			for app in apps:
				ET.fromstring(self.ai.svg(app, app.title(), style))
			ET.fromstring(self.ai.svg("evil", "<script>&\"'</script>", style))

	def test_data_uri_is_safe_in_any_attribute(self):
		for app in ("hrms", "zeta_x", "evil"):
			uri = self.ai.icon_uri(app, "<b>\"Quoted\" & 'single'</b> #1")
			self.assertTrue(uri.startswith("data:image/svg+xml,"))
			for ch in "\"'<> #":
				self.assertNotIn(ch, uri[len("data:image/svg+xml,") :], repr(ch))

	def test_choice_is_deterministic(self):
		self.assertEqual(self.ai.icon_uri("acme_widgets", "Acme"), self.ai.icon_uri("acme_widgets", "Acme"))
		self.assertEqual(self.ai.choose("acme_widgets")[1], self.ai.choose("acme_widgets")[1])

	def test_custom_apps_are_recognised_by_keyword(self):
		expect = {
			"ecs_cheques": "card",
			"nsd_itsm": "headset",
			"treasury": "landmark",
			"business_trip": "plane",
			"nsd_contract_management": "file-check",
			"nsd_installment": "receipt",
			"careers": "briefcase",
			"cars_empire": "car",
		}
		for app, glyph in expect.items():
			self.assertEqual(self.ai.choose(app, app.replace("_", " ").title())[0], glyph, app)

	def test_unknown_app_gets_initials(self):
		glyph, hue = self.ai.choose("zeta_x", "Zeta X")
		self.assertIsNone(glyph)
		self.assertIn(hue, self.ai.HUES)
		self.assertEqual(self.ai.initials("Zeta X"), "ZX")
		self.assertEqual(self.ai.initials("OneSpace HR"), "HR", "the brand word is not an initial")

	def test_settings_choice_wins_and_bad_values_fall_back(self):
		self.assertEqual(self.ai.choose("hrms", glyph="factory", hue="blue"), ("factory", "blue"))
		self.assertEqual(self.ai.choose("hrms", glyph="nope", hue="nope"), self.ai.KNOWN_APPS["hrms"])

	def test_doctype_options_match_the_generator(self):
		row = json.loads(read("onespace", "doctype", "onespace_app_title", "onespace_app_title.json"))
		options = {
			f["fieldname"]: [o for o in (f.get("options") or "").split("\n") if o] for f in row["fields"]
		}
		self.assertEqual(sorted(options["glyph"]), sorted(self.ai.GLYPHS))
		self.assertEqual(sorted(options["hue"]), sorted(self.ai.HUES))
		settings = json.loads(read("onespace", "doctype", "onespace_settings", "onespace_settings.json"))
		style = next(f for f in settings["fields"] if f["fieldname"] == "app_icon_style")
		self.assertEqual(style["options"].split("\n"), list(self.ai.STYLES))
