import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import cint

from onespace.branding import apply_site_branding, doctype_lines, restore_site_branding

MAX_LOGIN_POINTS = 6


class OneSpaceSettings(Document):
	def validate(self):
		self.brand_name = (self.brand_name or "").strip() or "OneSpace"
		self._validate_support_url()
		self._validate_app_titles()
		self._validate_doctype_lists()
		self._validate_login_points()

	def _validate_support_url(self):
		url = (self.support_url or "").strip()
		if url and not url.lower().startswith(("https://", "http://")):
			frappe.throw(_("Support Website must start with https:// or http://."))
		self.support_url = url

	def _validate_app_titles(self):
		seen = set()
		for row in self.app_titles or []:
			row.app_name = (row.app_name or "").strip().lower()
			row.title = (row.title or "").strip()
			if row.app_name in seen:
				frappe.throw(_("App {0} is listed twice in App Titles.").format(frappe.bold(row.app_name)))
			seen.add(row.app_name)

	def _validate_doctype_lists(self):
		"""Warn about names that are not DocTypes; they are skipped, not fatal."""
		for field in ("quick_action_doctypes", "recent_doctypes"):
			unknown = [dt for dt in doctype_lines(self.get(field)) if not frappe.db.exists("DocType", dt)]
			if unknown:
				frappe.msgprint(
					_("{0}: not found on this site and will be skipped: {1}").format(
						_(self.meta.get_label(field)), ", ".join(unknown)
					),
					indicator="orange",
					alert=True,
				)

	def _validate_login_points(self):
		points = [p.strip() for p in (self.login_points or "").splitlines() if p.strip()]
		if len(points) > MAX_LOGIN_POINTS:
			frappe.msgprint(
				_("Only the first {0} highlights are shown on the sign-in page.").format(MAX_LOGIN_POINTS),
				indicator="orange",
				alert=True,
			)

	def on_update(self):
		# Read back through get_settings in apply_site_branding, which uses the
		# cached doc - drop it first so the values just saved are the ones used.
		frappe.clear_document_cache(self.doctype, self.name)
		if cint(self.enforce_branding):
			apply_site_branding()
		elif self.has_value_changed("enforce_branding"):
			restore_site_branding()
		else:
			# Boot and website caches still carry the previous brand.
			frappe.cache.delete_key("bootinfo")
			from frappe.website.utils import clear_website_cache

			clear_website_cache()
