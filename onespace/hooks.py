app_name = "onespace"
app_title = "OneSpace"
app_publisher = "OneSpace ERP Systems"
app_description = "OneSpace — the whitelabel brand and design layer for Frappe 16 and ERPNext 16."
app_email = "kelshiekh@gmail.com"
app_license = "MIT"
app_logo_url = "/assets/onespace/images/onespace-icon.svg"

# ---------------------------------------------------------------------------
# Desk
# ---------------------------------------------------------------------------
# One stylesheet and one script, both named *.bundle.* so Frappe gives them a
# content hash: a new release reaches every browser instead of the cached copy
# of the previous one. The stylesheet is in <head>, so the OneSpace palette is
# there for the first paint - it needs no script to switch it on.
app_include_css = ["onespace.bundle.css"]
app_include_js = ["onespace.bundle.js"]

# ---------------------------------------------------------------------------
# Website, portal and sign-in
# ---------------------------------------------------------------------------
web_include_css = ["onespace_web.bundle.css"]

# The sign-in page is OneSpace's own, at /login, while "Use OneSpace Sign-in"
# is ticked in OneSpace Settings. The renderer declines every other route,
# and with the switch off or on any error Frappe's own page is served.
page_renderer = ["onespace.login_page.OneSpaceLoginPage"]

# Tab icon, splash image and the "powered by" line on website pages.
update_website_context = "onespace.branding.update_website_context"

# ---------------------------------------------------------------------------
# Boot
# ---------------------------------------------------------------------------
# Brand, app titles, app logos and the OneSpace Launcher as the desk's home.
# Nothing here is stored: it is applied to each boot as it is built, so
# turning a setting off gives Frappe's own value back on the next load.
extend_bootinfo = "onespace.branding.extend_bootinfo"

# ---------------------------------------------------------------------------
# Apps screen
# ---------------------------------------------------------------------------
add_to_apps_screen = [
	{
		"name": "onespace",
		"logo": "/assets/onespace/images/onespace-icon.svg",
		"title": "OneSpace",
		"route": "/desk/onespace-settings",
		"has_permission": "onespace.api.has_app_permission",
	}
]

# ---------------------------------------------------------------------------
# Install / migrate / uninstall
# ---------------------------------------------------------------------------
# System, Website and Navbar Settings are pointed at the OneSpace brand. Every
# value replaced is remembered first, and uninstalling puts them all back.
after_install = "onespace.install.after_install"
after_migrate = "onespace.install.after_migrate"
before_uninstall = "onespace.install.before_uninstall"
