"""Data for the OneSpace Launcher.

Nothing here decides what a user may see. Every list is read through
frappe.get_list and every action is offered only where frappe.has_permission
says yes, so a User Permission on Company or Territory narrows the figures
without this module knowing such a thing exists. The apps grid itself is not
fetched here at all: it is drawn from frappe.boot.desktop_icons, which Frappe
has already filtered by app, workspace and role permissions.
"""

import json
from collections import Counter
from datetime import timedelta

import frappe
from frappe import _
from frappe.utils import add_to_date, cint, flt, getdate, now_datetime, today

from onespace import __version__
from onespace.branding import doctype_lines, get_settings

CACHE_SECONDS = 60
RECENT_LIMIT = 6
RECENT_PER_DOCTYPE = 3
# The weekly chart counts documents created in the last 14 days. One query per
# DocType, read through get_list, capped so a busy site never pays for it.
ACTIVITY_CAP_PER_DOCTYPE = 2000

AMOUNT_FIELDS = ("rounded_total", "grand_total", "total", "base_grand_total")


def has_app_permission() -> bool:
	"""The OneSpace tile on Frappe's apps screen opens OneSpace Settings."""
	return frappe.session.user == "Administrator" or "System Manager" in frappe.get_roles()


def _is_desk_user() -> bool:
	user = frappe.session.user
	if user == "Administrator":
		return True
	return user != "Guest" and frappe.get_cached_value("User", user, "user_type") == "System User"


def _usable_doctypes(raw, ptype: str) -> list[str]:
	"""DocTypes from a settings list that exist, are lists, and this user may `ptype`."""
	out = []
	for doctype in doctype_lines(raw):
		meta_row = frappe.db.get_value("DocType", doctype, ["istable", "issingle", "module"], as_dict=True)
		if not meta_row or meta_row.istable or meta_row.issingle:
			continue
		if not frappe.has_permission(doctype, ptype):
			continue
		out.append(doctype)
	return out


@frappe.whitelist()
def get_launcher_data(refresh: int = 0) -> dict:
	"""Everything the Launcher draws besides the apps grid.

	Cached per user and language for a minute: the Launcher is the desk's
	home and is opened many times an hour, and a count a minute old is fine
	for a dashboard. `refresh=1` skips the cache.
	"""
	if not _is_desk_user():
		frappe.throw(_("The Launcher is for desk users."), frappe.PermissionError)

	key = f"onespace:launcher:{frappe.session.user}:{frappe.local.lang or ''}"
	if not cint(refresh):
		try:
			cached = frappe.cache.get_value(key, expires=True)
			if isinstance(cached, dict):
				return cached
		except Exception:
			pass

	data = _build(get_settings())
	try:
		frappe.cache.set_value(key, data, expires_in_sec=CACHE_SECONDS)
	except Exception:
		pass
	return data


def _build(settings) -> dict:
	data = {"version": __version__, "company": _default_company(), "layout": _saved_layout()}

	sections = (
		("quick_actions", "show_quick_actions", _quick_actions),
		("recent", "show_recent_documents", _recent_documents),
		("activity", "show_activity_chart", _activity),
		("module_counts", None, _open_todo_counts),
	)
	for key, flag, builder in sections:
		if flag and not cint(settings.get(flag)):
			continue
		try:
			data[key] = builder(settings)
		except Exception:
			# One failing section must not take the page down with it.
			frappe.log_error(title=f"OneSpace Launcher: {key} failed")
			frappe.clear_last_message()

	if cint(settings.get("show_system_health")) and "System Manager" in frappe.get_roles():
		try:
			data["health"] = _system_health()
		except Exception:
			frappe.log_error(title="OneSpace Launcher: health failed")
			frappe.clear_last_message()
	return data


def _default_company() -> str | None:
	try:
		return frappe.defaults.get_user_default("Company") or frappe.defaults.get_global_default("company")
	except Exception:
		return None


def _saved_layout() -> list | None:
	"""The user's own app order and hidden tiles: the Desktop Layout document
	Frappe's apps screen writes, so an order saved there holds here too. Only
	ever the session user's own row."""
	if not frappe.db.exists("DocType", "Desktop Layout"):
		return None
	raw = frappe.db.get_value("Desktop Layout", frappe.session.user, "layout")
	if not raw:
		return None
	try:
		layout = json.loads(raw)
	except ValueError:
		return None
	return layout if isinstance(layout, list) else None


def _quick_actions(settings) -> list[dict]:
	out = []
	for doctype in _usable_doctypes(settings.get("quick_action_doctypes"), "create"):
		out.append(
			{
				"doctype": doctype,
				"label": _("New {0}").format(_(doctype)),
				"module": _(frappe.db.get_value("DocType", doctype, "module") or ""),
			}
		)
	return out


def _recent_documents(settings) -> list[dict]:
	rows = []
	for doctype in _usable_doctypes(settings.get("recent_doctypes"), "read"):
		meta = frappe.get_meta(doctype)
		fields = ["name", "modified", "docstatus"]
		title_field = meta.get_title_field()
		if title_field and title_field != "name" and meta.has_field(title_field):
			fields.append(title_field)
		if meta.has_field("status"):
			fields.append("status")
		amount_field = next((f for f in AMOUNT_FIELDS if meta.has_field(f)), None)
		if amount_field:
			fields.append(amount_field)
		if meta.has_field("currency"):
			fields.append("currency")

		for row in frappe.get_list(
			doctype, fields=fields, order_by="modified desc", limit_page_length=RECENT_PER_DOCTYPE
		):
			title = row.get(title_field) if title_field else None
			rows.append(
				{
					"doctype": doctype,
					"doctype_label": _(doctype),
					"name": row.name,
					"title": title if title and title != row.name else None,
					"status": row.get("status") or _docstatus_label(row.docstatus),
					"amount": flt(row.get(amount_field)) if amount_field else None,
					"currency": row.get("currency"),
					"modified": str(row.modified),
				}
			)
	rows.sort(key=lambda r: r["modified"], reverse=True)
	return rows[:RECENT_LIMIT]


def _docstatus_label(docstatus) -> str:
	return {0: _("Draft"), 1: _("Submitted"), 2: _("Cancelled")}.get(cint(docstatus), _("Draft"))


def _activity(settings) -> dict:
	"""Documents created per day over the last 7 days, and the 7 before."""
	end = getdate(today())
	start = end - timedelta(days=13)
	per_day = Counter()
	for doctype in _usable_doctypes(settings.get("recent_doctypes"), "read"):
		for row in frappe.get_list(
			doctype,
			filters={"creation": [">=", str(start)]},
			fields=["creation"],
			limit_page_length=ACTIVITY_CAP_PER_DOCTYPE,
			order_by="creation desc",
		):
			per_day[getdate(row.creation)] += 1

	days = [start + timedelta(days=i) for i in range(14)]
	counts = [per_day.get(d, 0) for d in days]
	this_week, last_week = sum(counts[7:]), sum(counts[:7])
	change = None
	if last_week:
		change = round((this_week - last_week) * 100.0 / last_week, 1)
	return {
		"days": [str(d) for d in days[7:]],
		"counts": counts[7:],
		"total": this_week,
		"previous_total": last_week,
		"change": change,
	}


def _open_todo_counts(settings) -> dict:
	"""Open to-dos assigned to this user, per module - the badges on the tiles.

	Only the user's own assignments, so there is nothing here they could not
	already see in their to-do list.
	"""
	rows = frappe.get_all(
		"ToDo",
		filters={"allocated_to": frappe.session.user, "status": "Open", "reference_type": ["is", "set"]},
		fields=["reference_type"],
		limit_page_length=1000,
	)
	by_doctype = Counter(r.reference_type for r in rows)
	if not by_doctype:
		return {}
	modules = {
		d.name: d.module
		for d in frappe.get_all(
			"DocType", filters={"name": ["in", list(by_doctype)]}, fields=["name", "module"]
		)
	}
	by_module = Counter()
	for doctype, n in by_doctype.items():
		if modules.get(doctype):
			by_module[modules[doctype]] += n
	return dict(by_module)


def _system_health() -> dict:
	"""A System Manager's at-a-glance view. Counts only - no record contents."""
	from frappe.utils.scheduler import is_scheduler_inactive

	since = add_to_date(now_datetime(), hours=-24)
	return {
		"scheduler_active": 0 if is_scheduler_inactive() else 1,
		"email_queue": frappe.db.count("Email Queue", {"status": ["in", ["Not Sent", "Sending"]]}),
		"errors_24h": frappe.db.count("Error Log", {"creation": [">=", since]}),
		"version": __version__,
	}


# ---------------------------------------------------------------------------
# App icons - the preview in OneSpace Settings
# ---------------------------------------------------------------------------


def _app_title(app: str) -> str:
	try:
		return (frappe.get_hooks("app_title", app_name=app) or [app])[0]
	except Exception:
		return app


@frappe.whitelist()
def preview_app_icons(style: str | None = None, apps: str | list | None = None) -> list[dict]:
	"""Every installed app with the icon it gets, for the Settings preview.

	`style` and `apps` are the form's unsaved values, so the preview follows
	the admin's edits before they save; nothing is stored. System Manager
	only, like the Settings it serves.
	"""
	from onespace import app_icons
	from onespace.branding import app_logo, app_titles, brand

	frappe.only_for("System Manager")

	settings = get_settings()
	if style in app_icons.STYLES:
		settings["app_icon_style"] = style
	if apps is not None:
		rows = json.loads(apps) if isinstance(apps, str) else apps
		settings["app_titles"] = [r for r in rows or [] if isinstance(r, dict)]

	marks = brand(settings)
	titles = app_titles(settings)
	overrides = {}
	for row in settings.get("app_titles") or []:
		name = (row.get("app_name") or "").strip().lower()
		if name:
			overrides[name] = {k: (row.get(k) or "").strip() or None for k in ("title", "glyph", "hue")}

	out = []
	for app in frappe.get_installed_apps():
		own_title = _app_title(app)
		glyph, hue = app_icons.choose(
			app,
			(overrides.get(app) or {}).get("title") or own_title,
			(overrides.get(app) or {}).get("glyph"),
			(overrides.get(app) or {}).get("hue"),
		)
		out.append(
			{
				"app_name": app,
				"original_title": own_title,
				"title": titles.get(app) or own_title,
				"logo": app_logo(app, own_title, settings, marks, overrides),
				"glyph": glyph or "",
				"hue": hue,
			}
		)
	return out
