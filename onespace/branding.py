"""The OneSpace brand, applied to Frappe and ERPNext.

Three ways in, from most to least permanent:

* Site settings. System, Website and Navbar Settings already have a place for
  the product name, the logo, the favicon and the help menu, and Frappe reads
  them everywhere - the browser tab, emails, the splash screen, the web
  navbar. Filling those in is the supported way to rename the product, so
  apply_site_branding() does exactly that. Every value it replaces is
  remembered first; restore_site_branding() puts them back on uninstall or
  when "Apply Brand to Site Settings" is turned off.

* Boot. Each app ships its own title and logo, and the desk draws whichever
  app you are in - so one site reads as three vendors' products.
  extend_bootinfo() renames the apps and points their logos at the OneSpace
  icon as the boot is built. Nothing is stored; turning a setting off gives
  Frappe's own values back on the next load.

* Website context. The favicon, splash image and "powered by" line of every
  website page, the sign-in page included.

Every entry point here is wrapped so that a fault in branding can never stop
the desk from loading or a page from rendering: the worst case is Frappe's
own look, never an error page.
"""

import json

import frappe
from frappe.utils import cint, escape_html

from onespace import __version__, app_icons

SETTINGS = "OneSpace Settings"
LAUNCHER_PAGE = "onespace-launcher"
ORIGINALS_KEY = "onespace:originals"

IMG = "/assets/onespace/images"
SHIPPED = {
	"logo_light": f"{IMG}/onespace-logo-light.png",
	"logo_dark": f"{IMG}/onespace-logo-dark.png",
	"brand_icon": f"{IMG}/onespace-icon.svg",
	"favicon": f"{IMG}/favicon.png",
	"mark": f"{IMG}/onespace-mark.svg",
	"touch_icon": f"{IMG}/onespace-icon-180.png",
}

# What each installed app is called unless OneSpace Settings says otherwise.
# Keyed by the app's bench name, which is stable; titles are not.
DEFAULT_APP_TITLES = {
	"frappe": "OneSpace Platform",
	"erpnext": "OneSpace ERP",
	"hrms": "OneSpace HR",
	"crm": "OneSpace CRM",
	"helpdesk": "OneSpace Helpdesk",
	"insights": "OneSpace Insights",
	"lms": "OneSpace Learning",
	"payments": "OneSpace Payments",
	"builder": "OneSpace Builder",
	"drive": "OneSpace Drive",
	"wiki": "OneSpace Wiki",
	"print_designer": "OneSpace Print Designer",
	"lending": "OneSpace Lending",
	"education": "OneSpace Education",
	"healthcare": "OneSpace Healthcare",
}

# The settings' own defaults, for a site where the code is newer than the
# migrate (the DocType, or one of its fields, does not exist yet). They match
# the DocType JSON; a test keeps the two in step.
DEFAULTS = {
	"brand_name": "OneSpace",
	"brand_tagline": "Enterprise ERP",
	"enforce_branding": 1,
	"hide_vendor_help_links": 1,
	"app_icon_style": "Colour Tiles",
	"sidebar_style": "Match Theme",
	"density": "Comfortable",
	"use_launcher_home": 1,
	"show_quick_actions": 1,
	"show_recent_documents": 1,
	"show_activity_chart": 1,
	"show_system_health": 1,
	"quick_action_doctypes": "Quotation\nSales Invoice\nCustomer\nStock Entry",
	"recent_doctypes": (
		"Sales Order\nSales Invoice\nPurchase Order\nQuotation\n"
		"Purchase Invoice\nDelivery Note\nPurchase Receipt\nQuality Inspection"
	),
	"use_onespace_login": 1,
	"login_headline": "Run your whole business in one space.",
	"login_subheadline": "Sales, stock, accounts and people on one engine - with every number where you expect it.",
	"login_points": "Role-based access on every record\nAudit trail on every change\nReal-time ledgers and stock",
	"about_text": (
		"OneSpace is your business platform for sales, purchasing, stock, "
		"accounting, manufacturing and people."
	),
}


# ---------------------------------------------------------------------------
# Reading the settings
# ---------------------------------------------------------------------------


def get_settings() -> frappe._dict:
	"""OneSpace Settings as a dict, with a default for anything not stored.

	Never raises. A missing DocType (code deployed, migrate not yet run) or a
	field added by a later release reads as its default.
	"""
	out = frappe._dict(DEFAULTS)
	try:
		doc = frappe.get_cached_doc(SETTINGS)
	except Exception:
		return out
	for key, value in doc.as_dict().items():
		if key in DEFAULTS and value in (None, ""):
			continue
		out[key] = value
	return out


def brand(settings: dict | None = None) -> frappe._dict:
	"""The brand's name and artwork, falling back to what ships with the app."""
	s = settings or get_settings()
	return frappe._dict(
		name=(s.get("brand_name") or DEFAULTS["brand_name"]).strip(),
		tagline=(s.get("brand_tagline") or "").strip(),
		logo_light=s.get("logo_light") or SHIPPED["logo_light"],
		logo_dark=s.get("logo_dark") or SHIPPED["logo_dark"],
		icon=s.get("brand_icon") or SHIPPED["brand_icon"],
		favicon=s.get("favicon") or SHIPPED["favicon"],
		mark=SHIPPED["mark"],
		touch_icon=SHIPPED["touch_icon"],
	)


def app_titles(settings: dict | None = None) -> dict:
	"""{app_name: title}. The table in OneSpace Settings wins over the defaults."""
	s = settings or get_settings()
	titles = dict(DEFAULT_APP_TITLES)
	for row in s.get("app_titles") or []:
		app = (row.get("app_name") or "").strip()
		title = (row.get("title") or "").strip()
		if app and title:
			titles[app] = title
	return titles


def app_overrides(settings: dict | None = None) -> dict:
	"""{app_name: {title, glyph, hue}} from the Apps table, empty values dropped."""
	s = settings or get_settings()
	out = {}
	for row in s.get("app_titles") or []:
		app = (row.get("app_name") or "").strip().lower()
		if app:
			out[app] = {k: (row.get(k) or "").strip() or None for k in ("title", "glyph", "hue")}
	return out


def app_logo(app: str, title: str, settings: dict, marks: dict, overrides: dict | None = None) -> str | None:
	"""The logo an app should carry in the current style, or None to keep its own.

	`title` is the app's own title (before any renaming), which the generator
	reads for keywords and initials alongside the bench name.
	"""
	style = settings.get("app_icon_style") or app_icons.STYLE_COLOUR
	if style == app_icons.STYLE_ORIGINAL or not app:
		return None
	if style == app_icons.STYLE_ONESPACE:
		return marks.icon
	choice = (overrides or {}).get(app) or {}
	return app_icons.icon_uri(
		app, choice.get("title") or title or "", style, choice.get("glyph"), choice.get("hue")
	)


def doctype_lines(raw) -> list[str]:
	"""A Small Text of one DocType per line, cleaned and de-duplicated."""
	seen, out = set(), []
	for line in str(raw or "").replace(",", "\n").splitlines():
		name = line.strip()
		if name and name not in seen:
			seen.add(name)
			out.append(name)
	return out


# ---------------------------------------------------------------------------
# Boot
# ---------------------------------------------------------------------------


def extend_bootinfo(bootinfo) -> None:
	"""`extend_bootinfo` hook. Must never raise: a broken boot is a blank desk."""
	try:
		settings = get_settings()
		marks = brand(settings)
		_rebrand_apps(bootinfo, marks, settings)
		bootinfo["onespace"] = client_config(settings, marks)
		_apply_launcher_home(bootinfo, settings)
	except Exception:
		frappe.log_error(title="OneSpace: could not brand the desk")


def client_config(settings: dict, marks: dict) -> dict:
	"""What the desk scripts read, as frappe.boot.onespace."""
	return {
		"version": __version__,
		"brand": dict(marks),
		"sidebar_style": "carbon" if settings.get("sidebar_style") == "Carbon" else "match",
		"density": "compact" if settings.get("density") == "Compact" else "comfortable",
		"hide_vendor_help": cint(settings.get("hide_vendor_help_links")),
		"about_text": settings.get("about_text") or "",
		"support": {
			"url": settings.get("support_url") or "",
			"email": settings.get("support_email") or "",
		},
		"launcher": {
			"page": LAUNCHER_PAGE,
			"is_home": 0,  # set by _apply_launcher_home when it takes over
			"quick_actions": cint(settings.get("show_quick_actions")),
			"recent_documents": cint(settings.get("show_recent_documents")),
			"activity_chart": cint(settings.get("show_activity_chart")),
			"system_health": cint(settings.get("show_system_health")),
		},
	}


def _rebrand_apps(bootinfo, marks: dict, settings: dict) -> None:
	"""Rename the installed apps and give each one its OneSpace icon.

	Three places in boot name an app, and they have to agree or the name and
	icon change as you move around the desk:

	* `app_data` - the sidebar header and its app switcher;
	* `desktop_icons` rows of type App - the apps screen and the Launcher;
	* `apps_data.apps` - the apps list some v16 builds carry as well.

	Desktop icons are keyed by label: a module icon names its folder in
	`parent_icon` by the folder's label. So when an App icon is renamed, every
	`parent_icon` that pointed at its old label is renamed with it, and the old
	label is kept on the row as `onespace_label` for anything that needs it.

	Only App rows get a new icon. Module icons - Payroll, Leaves, Stock - each
	mean something, and turning them into copies of their app's tile would
	make a wall of identical squares.
	"""
	titles = app_titles(settings)
	overrides = app_overrides(settings)
	style = settings.get("app_icon_style") or app_icons.STYLE_COLOUR
	generated = style in app_icons.GENERATED_STYLES

	if style != app_icons.STYLE_ORIGINAL:
		# The site's own logo stays the brand, whatever the apps carry.
		bootinfo["app_logo_url"] = marks.icon

	for app in bootinfo.get("app_data") or []:
		name = app.get("app_name")
		logo = app_logo(name, app.get("app_title"), settings, marks, overrides)
		if name in titles:
			app["app_title"] = titles[name]
		if logo:
			app["app_logo_url"] = logo

	icons = bootinfo.get("desktop_icons") or []
	renamed = {}
	for icon in icons:
		if icon.get("icon_type") != "App":
			continue
		name = icon.get("app")
		logo = app_logo(name, icon.get("label"), settings, marks, overrides)
		title = titles.get(name)
		if title and icon.get("label") and icon.get("label") != title:
			renamed[icon["label"]] = title
			icon["onespace_label"] = icon["label"]
			icon["label"] = title
		if logo and (generated or icon.get("logo_url") or icon.get("icon_image")):
			icon["logo_url"] = logo
			if icon.get("icon_image"):
				icon["icon_image"] = logo
			icon["onespace_icon"] = 1 if generated else 0
	if renamed:
		for icon in icons:
			if icon.get("parent_icon") in renamed:
				icon["parent_icon"] = renamed[icon["parent_icon"]]

	apps_data = bootinfo.get("apps_data")
	for app in (apps_data.get("apps") if isinstance(apps_data, dict) else None) or []:
		name = app.get("name") or app.get("app_name")
		logo = app_logo(name, app.get("title") or app.get("app_title"), settings, marks, overrides)
		if name in titles:
			for field in ("title", "app_title"):
				if field in app:
					app[field] = titles[name]
		if logo and app.get("logo"):
			app["logo"] = logo


def _is_desk_user() -> bool:
	user = frappe.session.user
	if not user or user == "Guest":
		return False
	if user == "Administrator":
		return True
	return frappe.get_cached_value("User", user, "user_type") == "System User"


def _apply_launcher_home(bootinfo, settings: dict) -> None:
	"""Land the desk on the OneSpace Launcher, when that is switched on.

	Frappe's boot fills `home_page` from the `desktop:home_page` default and
	runs this hook afterwards, so replacing the value here is all it takes and
	nothing is stored. Never during setup: until the wizard is done, boot
	points home at "setup-wizard" and taking that over would strand the user
	outside it.
	"""
	if not cint(settings.get("use_launcher_home")):
		return
	if not _is_desk_user() or not frappe.is_setup_complete():
		return
	if bootinfo.get("home_page") == "setup-wizard":
		return
	if not frappe.db.exists("Page", LAUNCHER_PAGE):
		return
	bootinfo["onespace"]["launcher"]["frappe_home"] = bootinfo.get("home_page") or "desktop"
	bootinfo["home_page"] = LAUNCHER_PAGE
	bootinfo["onespace"]["launcher"]["is_home"] = 1


# ---------------------------------------------------------------------------
# Website pages
# ---------------------------------------------------------------------------


def update_website_context(context):
	"""`update_website_context` hook: tab icon, splash and footer on web pages."""
	try:
		settings = get_settings()
		if not cint(settings.get("enforce_branding")):
			return context
		marks = brand(settings)
		context["favicon"] = marks.favicon
		context["splash_image"] = marks.icon
		context["onespace_brand"] = dict(marks)
		# Frappe's footer prints this verbatim when it is set, in place of its
		# own "Powered by" link. Escaped: it is shown to every visitor.
		context["footer_powered"] = f"<span>{escape_html(marks.name)}</span>"
		_rebrand_apps_page(context, settings, marks)
	except Exception:
		frappe.log_error(title="OneSpace: could not brand a website page")
	return context


def _rebrand_apps_page(context, settings: dict, marks: dict) -> None:
	"""Frappe's /apps page lists the installed apps with their own logos; give
	them the same icons the desk shows. A page without that list is untouched."""
	apps = context.get("apps")
	if not isinstance(apps, list):
		return
	titles = app_titles(settings)
	overrides = app_overrides(settings)
	for app in apps:
		if not isinstance(app, dict):
			continue
		name = app.get("name") or app.get("app_name")
		logo = app_logo(name, app.get("title"), settings, marks, overrides)
		if logo:
			app["logo"] = logo
		if name in titles and "title" in app:
			app["title"] = titles[name]


# ---------------------------------------------------------------------------
# Site settings: apply and restore
# ---------------------------------------------------------------------------

# Labels and URLs of the help-menu entries that send users to the vendors.
VENDOR_HELP_LABELS = {
	"documentation",
	"user forum",
	"frappe school",
	"report an issue",
	"frappe support",
	"erpnext documentation",
	"frappe forum",
	"community forum",
	"frappe cloud",
}
VENDOR_HOSTS = (
	"frappe.io",
	"frappe.school",
	"erpnext.com",
	"frappeframework.com",
	"frappe.cloud",
	"discuss.frappe.io",
	"discuss.erpnext.com",
	"github.com/frappe",
)
SUPPORT_LABEL = "Support"


def _targets(settings: dict) -> list[tuple[str, str, object]]:
	"""(DocType, field, value) for every site setting the brand fills in."""
	marks = brand(settings)
	return [
		("System Settings", "app_name", marks.name),
		# "Sent via ERPNext" at the foot of every email.
		("System Settings", "disable_standard_email_footer", 1),
		# The "ERPNext v16.x is available" and change-log pop-ups.
		("System Settings", "disable_system_update_notification", 1),
		("System Settings", "disable_change_log_notification", 1),
		("Website Settings", "app_name", marks.name),
		("Website Settings", "app_logo", marks.logo_light),
		("Website Settings", "favicon", marks.favicon),
		("Website Settings", "splash_image", marks.icon),
		("Navbar Settings", "app_logo", marks.icon),
	]


def _originals() -> dict:
	try:
		return json.loads(frappe.db.get_default(ORIGINALS_KEY) or "{}") or {}
	except ValueError:
		return {}


def _save_originals(originals: dict) -> None:
	frappe.db.set_default(ORIGINALS_KEY, json.dumps(originals, sort_keys=True))


def _has_field(doctype: str, fieldname: str) -> bool:
	try:
		return frappe.get_meta(doctype).has_field(fieldname)
	except Exception:
		return False


def apply_site_branding(settings: dict | None = None) -> None:
	"""Write the brand into the site's own settings. Idempotent.

	A field's value is recorded the first time OneSpace replaces it and never
	again, so running this on every migrate cannot overwrite the true original
	with OneSpace's own value.
	"""
	settings = settings or get_settings()
	if not cint(settings.get("enforce_branding")):
		return

	originals = _originals()
	for doctype, field, value in _targets(settings):
		if not _has_field(doctype, field):
			continue
		key = f"{doctype}.{field}"
		current = frappe.db.get_single_value(doctype, field)
		if key not in originals:
			originals[key] = current
		if current != value:
			frappe.db.set_single_value(doctype, field, value)

	_apply_help_menu(settings, originals)
	_save_originals(originals)
	_clear_caches()


def restore_site_branding() -> None:
	"""Put back every value apply_site_branding() replaced."""
	originals = _originals()
	if not originals:
		return
	for key, value in originals.items():
		if key.startswith("help:"):
			continue
		doctype, _, field = key.partition(".")
		if _has_field(doctype, field):
			frappe.db.set_single_value(doctype, field, value)

	for row in originals.get("help:hidden") or []:
		if frappe.db.exists("Navbar Item", row):
			frappe.db.set_value("Navbar Item", row, "hidden", 0, update_modified=False)
	for row in originals.get("help:added") or []:
		if frappe.db.exists("Navbar Item", row):
			frappe.db.delete("Navbar Item", {"name": row})

	frappe.defaults.clear_default(key=ORIGINALS_KEY, parent="__default")
	_clear_caches()


def is_vendor_help_item(row) -> bool:
	label = (row.get("item_label") or "").strip().lower()
	target = " ".join(str(row.get(f) or "") for f in ("route", "action")).lower()
	return label in VENDOR_HELP_LABELS or any(host in target for host in VENDOR_HOSTS)


def _apply_help_menu(settings: dict, originals: dict) -> None:
	"""Hide the vendor help links and add the site's own Support entry.

	Rows are hidden, never deleted: Frappe re-syncs its standard help items on
	every migrate and would only put deleted ones back. Each row this hides is
	recorded so restoring unhides exactly those and nothing an admin hid.
	"""
	if not frappe.db.exists("DocType", "Navbar Settings"):
		return
	try:
		navbar = frappe.get_single("Navbar Settings")
	except Exception:
		return

	hidden = set(originals.get("help:hidden") or [])
	if cint(settings.get("hide_vendor_help_links")):
		for row in navbar.get("help_dropdown") or []:
			if is_vendor_help_item(row) and not cint(row.hidden):
				frappe.db.set_value("Navbar Item", row.name, "hidden", 1, update_modified=False)
				hidden.add(row.name)
	originals["help:hidden"] = sorted(hidden)

	added = list(originals.get("help:added") or [])
	url = (settings.get("support_url") or "").strip()
	existing = [r for r in navbar.get("help_dropdown") or [] if r.name in added]
	if url and not existing:
		row = navbar.append(
			"help_dropdown",
			{"item_label": SUPPORT_LABEL, "item_type": "Route", "route": url, "is_standard": 0},
		)
		row.db_insert()
		added.append(row.name)
	elif existing:
		for row in existing:
			if url and row.route != url:
				frappe.db.set_value("Navbar Item", row.name, "route", url, update_modified=False)
			elif not url:
				frappe.db.delete("Navbar Item", {"name": row.name})
				added.remove(row.name)
	originals["help:added"] = added


def _clear_caches() -> None:
	"""Drop the caches holding the old brand: every user's boot, the website."""
	try:
		frappe.clear_cache(doctype="Navbar Settings")
		frappe.clear_cache(doctype="Website Settings")
		frappe.clear_cache(doctype="System Settings")
		frappe.cache.delete_key("bootinfo")
		from frappe.website.utils import clear_website_cache

		clear_website_cache()
	except Exception:
		frappe.log_error(title="OneSpace: could not clear caches")
