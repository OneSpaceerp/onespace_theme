"""
OneSpace ERP Systems v16 — Hooks Configuration
Integrated theme and white-label layer for Frappe Framework & ERPNext v16
"""

app_name = "onespace"
app_title = "OneSpace"
app_publisher = "OneSpace Systems"
app_description = "Commercial SaaS Visual Identity and Theme Layer for Frappe & ERPNext v16"
app_version = "16.0.0"
app_license = "MIT"
required_apps = ["frappe"]

# --- Includes in <head> for Desk (Admin UI) via esbuild Bundler ---
app_include_css = ["onespace.bundle.css"]
app_include_js = ["onespace.bundle.js"]

app_include_icons = "/assets/onespace/icons/onespace-icons.svg"

# --- Frappe v16 Apps Screen Registration ---
add_to_apps_screen = [
    {
        "name": "onespace",
        "logo": "/assets/onespace/images/onespace_icon.svg",
        "title": "OneSpace",
        "route": "/desk",
    }
]

# --- Includes in <head> for Web / Portal Pages ---
web_include_css = ["onespace.bundle.css"]
web_include_js = ["onespace.bundle.js"]


# --- Brand Identity & Splash Screens ---
app_logo_url = "/assets/onespace/images/onespace_light.png"

website_context = {
    "favicon": "/assets/onespace/images/favicon.svg",
    "splash_image": "/assets/onespace/images/onespace_light.png",
    "brand_html": '<img src="/assets/onespace/images/onespace_light.png" alt="OneSpace" style="height: 28px; width: auto; vertical-align: middle;">',
    "app_name": "OneSpace",
    "app_title": "OneSpace ERP Systems",
}

# --- Email Notifications ---
default_mail_footer = """
<div style="padding-top: 16px; border-top: 1px solid #E4E4E7; font-size: 11px; color: #71717A; font-family: 'Manrope', -apple-system, sans-serif;">
  Sent via <strong>OneSpace ERP Systems</strong> &bull; <a href="https://onespace.sh" style="color: #FF3700; text-decoration: none;">onespace.sh</a>
</div>
"""

# --- Boot & Session Hooks ---
extend_bootinfo = "onespace.setup.boot.boot_session"

# --- Lifecycle Hooks ---
after_install = "onespace.setup.install.after_install"
after_migrate = "onespace.setup.install.after_migrate"

# --- Website Route Overrides ---
website_route_rules = [
    {"from_route": "/open-source-notices", "to_route": "open_source_notices"},
]

