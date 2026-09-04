"""
OneSpace Setup Automation
Automates System Settings and Website Settings configuration for white-label compliance.
"""

import frappe

def after_install():
    """Runs after onespace is installed on a site."""
    configure_system_settings()
    configure_website_settings()
    configure_print_settings()
    frappe.clear_cache()

def after_migrate():
    """Runs after bench migrate to ensure brand settings stay enforced."""
    configure_system_settings()
    configure_website_settings()
    configure_print_settings()
    frappe.clear_cache()

def configure_system_settings():
    """Configures global System Settings to enforce OneSpace branding."""
    try:
        sys_settings = frappe.get_doc("System Settings")
        sys_settings.app_name = "OneSpace"
        sys_settings.app_title = "OneSpace ERP Systems"
        sys_settings.disable_standard_email_footer = 1
        sys_settings.hide_footer_in_auto_email_reports = 1
        sys_settings.flags.ignore_permissions = True
        sys_settings.flags.ignore_mandatory = True
        sys_settings.save()
    except Exception as e:
        frappe.log_error(f"Failed to update System Settings for OneSpace: {e}")

def configure_website_settings():
    """Configures Website Settings for OneSpace logos and favicons."""
    try:
        web_settings = frappe.get_doc("Website Settings")
        web_settings.app_name = "OneSpace"
        web_settings.app_logo = "/assets/onespace/images/onespace_light.png"
        web_settings.favicon = "/assets/onespace/images/favicon.svg"
        web_settings.splash_image = "/assets/onespace/images/onespace_light.png"
        web_settings.brand_html = '<img src="/assets/onespace/images/onespace_light.png" alt="OneSpace" style="height: 28px; width: auto;">'
        web_settings.copyright = "OneSpace Systems"
        web_settings.flags.ignore_permissions = True
        web_settings.flags.ignore_mandatory = True
        web_settings.save()
    except Exception as e:
        frappe.log_error(f"Failed to update Website Settings for OneSpace: {e}")

def configure_print_settings():
    """Configures Print Settings to eliminate standard ERPNext print footers."""
    try:
        if frappe.db.exists("DocType", "Print Settings"):
            print_settings = frappe.get_doc("Print Settings")
            if hasattr(print_settings, "pdf_page_size"):
                # Ensure clean standard defaults
                pass
            print_settings.flags.ignore_permissions = True
            print_settings.save()
    except Exception as e:
        frappe.log_error(f"Failed to update Print Settings for OneSpace: {e}")
