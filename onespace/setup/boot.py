"""
OneSpace Boot Session Hook
Deeply white-labels all boot data sent to the Frappe Desk frontend.
Ensures zero leaks of 'ERPNext' or 'Frappe' in the Desk client state.
"""

import frappe

def boot_session(bootinfo):
    """
    Hooked via extend_bootinfo in hooks.py.
    Injected into frappe.boot on every Desk session initialization.
    """
    try:
        # 1. Global Brand Identifiers
        bootinfo.app_name = "OneSpace"
        bootinfo.app_title = "OneSpace ERP Systems"
        bootinfo.app_logo_url = "/assets/onespace/images/onespace_light.png"

        if hasattr(bootinfo, "sysdefaults") and isinstance(bootinfo.sysdefaults, dict):
            bootinfo.sysdefaults["app_name"] = "OneSpace"
            bootinfo.sysdefaults["app_title"] = "OneSpace ERP Systems"

        # 2. App Data Dictionary (Used by Desk launcher and sidebar header dropdown)
        if hasattr(bootinfo, "app_data") and isinstance(bootinfo.app_data, dict):
            for app_name, data in bootinfo.app_data.items():
                if isinstance(data, dict):
                    if data.get("app_title") in ("ERPNext", "Frappe Framework", "Frappe"):
                        data["app_title"] = "OneSpace"
                    if data.get("title") in ("ERPNext", "Frappe Framework", "Frappe"):
                        data["title"] = "OneSpace"

        # 3. Apps Data Dictionary (Desk v16 app navigation registry)
        if hasattr(bootinfo, "apps_data") and isinstance(bootinfo.apps_data, dict):
            for app_name, data in bootinfo.apps_data.items():
                if isinstance(data, dict):
                    if data.get("title") in ("ERPNext", "Frappe Framework", "Frappe"):
                        data["title"] = "OneSpace"
                    if data.get("app_title") in ("ERPNext", "Frappe Framework", "Frappe"):
                        data["app_title"] = "OneSpace"

        # 4. Sidebar Pages / Workspaces in Boot
        if hasattr(bootinfo, "sidebar_pages") and isinstance(bootinfo.sidebar_pages, dict):
            pages = bootinfo.sidebar_pages.get("pages", [])
            if isinstance(pages, list):
                for page in pages:
                    if isinstance(page, dict):
                        if page.get("header") in ("ERPNext", "Frappe Framework", "Frappe"):
                            page["header"] = "OneSpace"
                        if page.get("app_title") in ("ERPNext", "Frappe Framework", "Frappe"):
                            page["app_title"] = "OneSpace"

        # 5. Navbar Settings
        if hasattr(bootinfo, "navbar_settings") and isinstance(bootinfo.navbar_settings, dict):
            bootinfo.navbar_settings["app_logo"] = "/assets/onespace/images/onespace_light.png"

    except Exception as e:
        frappe.log_error(f"OneSpace boot_session hook error: {e}")
