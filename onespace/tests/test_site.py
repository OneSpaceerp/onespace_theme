"""Behaviour that needs a site: `bench --site <site> run-tests --app onespace`."""

import json

import frappe
from frappe.tests import IntegrationTestCase

from onespace import branding
from onespace.api import get_launcher_data
from onespace.login_page import OneSpaceLoginPage

SETTINGS = "OneSpace Settings"


def set_settings(**values):
	doc = frappe.get_single(SETTINGS)
	doc.update(values)
	doc.save(ignore_permissions=True)
	frappe.clear_document_cache(SETTINGS, SETTINGS)
	return doc


def fake_boot(**extra):
	boot = frappe._dict(
		home_page="desktop",
		app_logo_url="/assets/frappe/images/frappe-framework-logo.svg",
		app_data=[
			{
				"app_name": "erpnext",
				"app_title": "ERPNext",
				"app_logo_url": "/assets/erpnext/erpnext-logo.svg",
			},
			{"app_name": "custom_app", "app_title": "Custom", "app_logo_url": "/c.svg"},
		],
		desktop_icons=[
			{"label": "Frappe HR", "icon_type": "App", "app": "hrms", "logo_url": "/assets/hrms/logo.svg"},
			{"label": "Employees", "icon_type": "Link", "parent_icon": "Frappe HR", "logo_url": "/m.svg"},
			{"label": "Selling", "icon_type": "Link", "icon": "sell"},
		],
	)
	boot.update(extra)
	return boot


class TestBoot(IntegrationTestCase):
	def setUp(self):
		set_settings(app_icon_style="OneSpace Icon", use_launcher_home=1, app_titles=[])

	def test_apps_are_renamed_and_children_follow(self):
		boot = fake_boot()
		branding.extend_bootinfo(boot)

		titles = {a["app_name"]: a["app_title"] for a in boot.app_data}
		self.assertEqual(titles["erpnext"], "OneSpace ERP")
		self.assertEqual(titles["custom_app"], "Custom", "an app with no title mapping keeps its own")

		icons = {i["label"]: i for i in boot.desktop_icons}
		self.assertIn("OneSpace HR", icons)
		self.assertEqual(icons["OneSpace HR"]["onespace_label"], "Frappe HR")
		self.assertEqual(icons["Employees"]["parent_icon"], "OneSpace HR", "children must follow the rename")

	def test_only_app_logos_are_replaced(self):
		boot = fake_boot()
		branding.extend_bootinfo(boot)
		icon = branding.brand().icon
		icons = {i["label"]: i for i in boot.desktop_icons}
		self.assertEqual(icons["OneSpace HR"]["logo_url"], icon)
		self.assertEqual(icons["Employees"]["logo_url"], "/m.svg", "module icons mean something; keep them")
		self.assertEqual(boot.app_logo_url, icon)

	def test_settings_table_overrides_default_titles(self):
		set_settings(app_titles=[{"app_name": "erpnext", "title": "Acme ERP"}])
		boot = fake_boot()
		branding.extend_bootinfo(boot)
		self.assertEqual(boot.app_data[0]["app_title"], "Acme ERP")

	def test_logos_left_alone_when_switched_off(self):
		set_settings(app_icon_style="Original Logos")
		boot = fake_boot()
		branding.extend_bootinfo(boot)
		self.assertEqual(boot.app_logo_url, "/assets/frappe/images/frappe-framework-logo.svg")

	def test_launcher_becomes_home(self):
		frappe.set_user("Administrator")
		boot = fake_boot()
		branding.extend_bootinfo(boot)
		if frappe.is_setup_complete():
			self.assertEqual(boot.home_page, branding.LAUNCHER_PAGE)
			self.assertEqual(boot.onespace["launcher"]["frappe_home"], "desktop")

	def test_launcher_never_takes_over_the_setup_wizard(self):
		boot = fake_boot(home_page="setup-wizard")
		branding.extend_bootinfo(boot)
		self.assertEqual(boot.home_page, "setup-wizard")

	def test_launcher_home_can_be_turned_off(self):
		set_settings(use_launcher_home=0)
		boot = fake_boot()
		branding.extend_bootinfo(boot)
		self.assertEqual(boot.home_page, "desktop")

	def test_a_malformed_boot_never_raises(self):
		branding.extend_bootinfo(frappe._dict(desktop_icons=None, app_data=None, apps_data="nonsense"))


class TestGeneratedIcons(IntegrationTestCase):
	def tearDown(self):
		set_settings(app_icon_style="Colour Tiles", app_titles=[])

	def test_each_app_gets_its_own_generated_tile(self):
		set_settings(app_icon_style="Colour Tiles", app_titles=[])
		boot = fake_boot()
		branding.extend_bootinfo(boot)
		erpnext = boot.app_data[0]["app_logo_url"]
		custom = boot.app_data[1]["app_logo_url"]
		self.assertTrue(erpnext.startswith("data:image/svg+xml,"))
		self.assertNotEqual(erpnext, custom, "every app is drawn its own icon")
		hr = next(i for i in boot.desktop_icons if i.get("app") == "hrms")
		self.assertEqual(hr["onespace_icon"], 1)
		module = next(i for i in boot.desktop_icons if i["label"] == "Employees")
		self.assertEqual(module["logo_url"], "/m.svg", "module icons are left alone")
		self.assertEqual(boot.app_logo_url, branding.brand().icon, "the site logo stays the brand")

	def test_settings_choice_of_glyph_and_colour_wins(self):
		set_settings(
			app_icon_style="Colour Tiles",
			app_titles=[{"app_name": "erpnext", "glyph": "factory", "hue": "blue"}],
		)
		boot = fake_boot()
		branding.extend_bootinfo(boot)
		from urllib.parse import unquote

		svg = unquote(boot.app_data[0]["app_logo_url"])
		self.assertIn("#2563eb", svg)
		self.assertIn("M2 20a2 2 0 0 0 2 2h16", svg, "the factory glyph")
		self.assertEqual(
			boot.app_data[0]["app_title"], "OneSpace ERP", "a row without a title keeps the default"
		)

	def test_brand_tiles_are_orange_on_charcoal(self):
		set_settings(app_icon_style="Brand Tiles")
		boot = fake_boot()
		branding.extend_bootinfo(boot)
		from urllib.parse import unquote

		self.assertIn("#FF3301", unquote(boot.app_data[0]["app_logo_url"]))

	def test_preview_lists_every_installed_app(self):
		from onespace.api import preview_app_icons

		frappe.set_user("Administrator")
		apps = {a["app_name"]: a for a in preview_app_icons(style="Colour Tiles")}
		self.assertEqual(set(apps), set(frappe.get_installed_apps()))
		self.assertTrue(all(a["logo"].startswith("data:image/svg+xml,") for a in apps.values()))

	def test_preview_is_for_system_managers(self):
		from onespace.api import preview_app_icons

		frappe.set_user("Guest")
		try:
			self.assertRaises(frappe.PermissionError, preview_app_icons)
		finally:
			frappe.set_user("Administrator")


class TestSiteSettings(IntegrationTestCase):
	def tearDown(self):
		branding.restore_site_branding()
		set_settings(enforce_branding=1)

	def test_apply_then_restore_round_trips(self):
		branding.restore_site_branding()
		frappe.db.set_single_value("Website Settings", "app_name", "Before OneSpace")

		branding.apply_site_branding()
		self.assertEqual(frappe.db.get_single_value("Website Settings", "app_name"), branding.brand().name)
		originals = json.loads(frappe.db.get_default(branding.ORIGINALS_KEY))
		self.assertEqual(originals["Website Settings.app_name"], "Before OneSpace")

		# A second run must not record OneSpace's own value as the original.
		branding.apply_site_branding()
		originals = json.loads(frappe.db.get_default(branding.ORIGINALS_KEY))
		self.assertEqual(originals["Website Settings.app_name"], "Before OneSpace")

		branding.restore_site_branding()
		self.assertEqual(frappe.db.get_single_value("Website Settings", "app_name"), "Before OneSpace")
		self.assertFalse(frappe.db.get_default(branding.ORIGINALS_KEY))

	def test_vendor_help_links_are_hidden_and_restored(self):
		branding.restore_site_branding()
		navbar = frappe.get_single("Navbar Settings")
		row = navbar.append(
			"help_dropdown",
			{"item_label": "OneSpace Test Forum", "item_type": "Route", "route": "https://discuss.frappe.io"},
		)
		row.db_insert()
		try:
			branding.apply_site_branding()
			self.assertEqual(frappe.db.get_value("Navbar Item", row.name, "hidden"), 1)
			branding.restore_site_branding()
			self.assertEqual(frappe.db.get_value("Navbar Item", row.name, "hidden"), 0)
		finally:
			frappe.db.delete("Navbar Item", {"name": row.name})

	def test_vendor_detection(self):
		self.assertTrue(branding.is_vendor_help_item({"item_label": "Documentation"}))
		self.assertTrue(
			branding.is_vendor_help_item({"item_label": "X", "route": "https://erpnext.com/docs"})
		)
		self.assertFalse(
			branding.is_vendor_help_item(
				{"item_label": "Keyboard Shortcuts", "action": "frappe.ui.toolbar.show_shortcuts(event)"}
			)
		)


class TestSettingsValidation(IntegrationTestCase):
	def test_support_url_must_be_http(self):
		doc = frappe.get_single(SETTINGS)
		doc.support_url = "javascript:alert(1)"
		self.assertRaises(frappe.ValidationError, doc.save, ignore_permissions=True)

	def test_app_titles_must_be_unique(self):
		doc = frappe.get_single(SETTINGS)
		doc.set("app_titles", [{"app_name": "erpnext", "title": "A"}, {"app_name": "ERPNext", "title": "B"}])
		self.assertRaises(frappe.ValidationError, doc.save, ignore_permissions=True)


class TestLauncherApi(IntegrationTestCase):
	def tearDown(self):
		frappe.set_user("Administrator")

	def test_guest_is_refused(self):
		frappe.set_user("Guest")
		self.assertRaises(frappe.PermissionError, get_launcher_data)

	def test_system_manager_gets_every_section(self):
		frappe.set_user("Administrator")
		data = get_launcher_data(refresh=1)
		for key in ("version", "quick_actions", "recent", "activity", "health"):
			self.assertIn(key, data)
		self.assertEqual(len(data["activity"]["counts"]), 7)
		for action in data["quick_actions"]:
			self.assertTrue(frappe.has_permission(action["doctype"], "create"))


class TestLoginRenderer(IntegrationTestCase):
	def tearDown(self):
		set_settings(use_onespace_login=1)

	def test_claims_login_when_enabled(self):
		set_settings(use_onespace_login=1)
		self.assertTrue(OneSpaceLoginPage("login").can_render())

	def test_declines_when_disabled(self):
		set_settings(use_onespace_login=0)
		self.assertFalse(OneSpaceLoginPage("login").can_render())

	def test_never_claims_another_route(self):
		self.assertFalse(OneSpaceLoginPage("about").can_render())
