"""The OneSpace sign-in page at /login.

Frappe resolves a web route by asking each renderer in turn whether it can
handle it, and the `page_renderer` hook puts this one first. It claims only
the `login` route and only while "Use OneSpace Sign-in" is ticked; with the
switch off, the template missing or anything at all raising, it declines and
Frappe renders its own page. A sign-in page is the one screen that must never
break.

The behaviour is Frappe's own. Its login controller fills the context
(providers, LDAP, sign-up, email link, the "already signed in" redirect) and
its login.js is included unchanged, so password sign-in, two-factor, forgot
password and the rest work exactly as they do on the stock page. Only the
layout and the brand panel are OneSpace's.
"""

import os
from datetime import date

import frappe
from frappe.utils import cint
from frappe.website.page_renderers.template_page import TemplatePage

from onespace.branding import brand, get_settings

APP = "onespace"
TEMPLATE = os.path.join("templates", "onespace_login", "onespace_login.html")
ROUTES = ("login",)
MAX_POINTS = 6


def is_enabled() -> bool:
	try:
		return bool(cint(get_settings().get("use_onespace_login")))
	except Exception:
		return False


class OneSpaceLoginPage(TemplatePage):
	def set_template_path(self):
		"""Point at our template, or leave template_path empty to decline.

		Runs for every website request, so the cheap path check comes first
		and nothing touches the database for any route but /login.
		"""
		if self.path not in ROUTES:
			return
		try:
			if not is_enabled():
				return
			app_path = frappe.get_app_path(APP)
			file_path = os.path.join(app_path, TEMPLATE)
			if not os.path.isfile(file_path):
				return
		except Exception:
			return

		self.app = APP
		self.app_path = app_path
		self.file_dir = os.path.dirname(TEMPLATE)
		self.basename = os.path.splitext(file_path)[0]
		self.template_path = TEMPLATE
		self.basepath = os.path.dirname(file_path)
		self.filename = os.path.basename(file_path)
		self.name = os.path.splitext(self.filename)[0]

	def update_context(self):
		super().update_context()
		self.context.no_cache = 1

		from frappe.www import login as frappe_login

		frappe_login.get_context(self.context)
		self.context.update(login_context())


def login_context() -> dict:
	"""The values the template adds on top of Frappe's login context."""
	settings = get_settings()
	marks = brand(settings)
	points = [p.strip() for p in (settings.get("login_points") or "").splitlines() if p.strip()]
	footnote = (settings.get("login_footnote") or "").strip() or f"© {date.today().year} {marks.name}"
	background = (settings.get("login_background") or "").strip()
	return {
		"title": marks.name,
		"body_class": "os-login-body",
		"os_brand": marks,
		"os_headline": (settings.get("login_headline") or "").strip(),
		"os_subheadline": (settings.get("login_subheadline") or "").strip(),
		"os_points": points[:MAX_POINTS],
		"os_footnote": footnote,
		# A private file answers 403 to a visitor who is not signed in.
		"os_background": "" if background.startswith("/private/") else background,
	}
