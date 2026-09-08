"""OneSpace Theme Settings — the single source of brand and appearance config.

Saving pushes the new configuration to every open Desk session over the
realtime channel, so branding changes take effect without a rebuild or a
reload. This is the pattern the v16 theming guide recommends for exactly this
case: static SCSS carries the design system, a Single DocType carries the few
values a site administrator legitimately needs to change.
"""

import frappe
from frappe.model.document import Document

DEFAULT_LOGO_LIGHT = "/assets/onespace/images/onespace_light.png"
DEFAULT_LOGO_DARK = "/assets/onespace/images/onespace_dark.png"
DEFAULT_FAVICON = "/assets/onespace/images/favicon.svg"
DEFAULT_PRIMARY = "#FF3700"

# Frappe's User.desk_theme Select only validates Light / Dark / Automatic.
# Adding a fourth option here would break saving a User document, so the
# corner-style and colour choices below deliberately layer on top of those
# three states rather than introducing a named theme of our own.
RADIUS_PRESETS = {
    "Sharp": "0px",
    "Rounded": "8px",
    "Soft": "16px",
}


class OneSpaceThemeSettings(Document):
    def validate(self):
        self.primary_color = (self.primary_color or DEFAULT_PRIMARY).strip()
        if not self.primary_color.startswith("#"):
            frappe.throw(
                frappe._("Primary Colour must be a hex value, for example #FF3700.")
            )

    def on_update(self):
        frappe.clear_cache()
        # Push to open sessions so a colour or logo change is visible without a
        # reload. Payload only — never markup, never anything a template will
        # render unescaped.
        frappe.publish_realtime(
            "onespace_theme_settings_changed",
            get_theme_config(),
            after_commit=True,
        )


def get_theme_config():
    """Serialise the settings for the Desk client.

    Returns defaults when the Single has never been saved, so a fresh install
    renders correctly before anyone opens the settings page.
    """
    try:
        doc = frappe.get_cached_doc("OneSpace Theme Settings")
    except Exception:
        doc = None

    if not doc:
        return _defaults()

    return {
        "app_name": doc.app_name or "OneSpace",
        "app_title": doc.app_title or "OneSpace ERP Systems",
        "logo_light": doc.logo_light or DEFAULT_LOGO_LIGHT,
        "logo_dark": doc.logo_dark or DEFAULT_LOGO_DARK,
        "favicon": doc.favicon or DEFAULT_FAVICON,
        "primary_color": doc.primary_color or DEFAULT_PRIMARY,
        "default_theme": (doc.default_theme or "Light").lower(),
        "border_radius": RADIUS_PRESETS.get(doc.border_radius or "Rounded", "8px"),
        "allow_user_theme_choice": bool(doc.allow_user_theme_choice),
        "show_shortcuts": bool(doc.show_shortcuts),
        "show_system_status": bool(doc.show_system_status),
        "enable_language_switcher": bool(doc.enable_language_switcher),
        "default_language": doc.default_language or "",
        "languages": get_offered_languages(doc),
    }


def get_offered_languages(doc=None):
    """Languages for the Desk switcher.

    An explicit list on the settings wins. Otherwise every Language record the
    site actually has is offered — never an invented list, so the switcher can
    only ever show a language the site can genuinely render.
    """
    try:
        if doc and doc.get("languages"):
            codes = [row.language for row in doc.languages if row.language]
            if codes:
                rows = frappe.get_all(
                    "Language",
                    filters={"name": ["in", codes]},
                    fields=["name", "language_name"],
                    order_by="language_name asc",
                )
                return [
                    {"code": r.name, "label": r.language_name or r.name} for r in rows
                ]

        rows = frappe.get_all(
            "Language",
            filters={"enabled": 1},
            fields=["name", "language_name"],
            order_by="language_name asc",
        )
        return [{"code": r.name, "label": r.language_name or r.name} for r in rows]
    except Exception:
        return []


def _defaults():
    return {
        "app_name": "OneSpace",
        "app_title": "OneSpace ERP Systems",
        "logo_light": DEFAULT_LOGO_LIGHT,
        "logo_dark": DEFAULT_LOGO_DARK,
        "favicon": DEFAULT_FAVICON,
        "primary_color": DEFAULT_PRIMARY,
        "default_theme": "light",
        "border_radius": "8px",
        "allow_user_theme_choice": True,
        "show_shortcuts": True,
        "show_system_status": False,
        "enable_language_switcher": True,
        "default_language": "",
        "languages": get_offered_languages(),
    }
