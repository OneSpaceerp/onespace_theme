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
        frappe.db.set_single_value("System Settings", "app_name", "OneSpace")
        frappe.db.set_single_value("System Settings", "app_title", "OneSpace ERP Systems")
        frappe.db.set_single_value("System Settings", "disable_standard_email_footer", 1)
        frappe.db.set_single_value("System Settings", "hide_footer_in_auto_email_reports", 1)
    except Exception as e:
        frappe.log_error(f"Failed to update System Settings for OneSpace: {e}")

def configure_website_settings():
    """Configures Website Settings for OneSpace logos and favicons."""
    try:
        frappe.db.set_single_value("Website Settings", "app_name", "OneSpace")
        frappe.db.set_single_value("Website Settings", "app_logo", "/assets/onespace/images/onespace_light.png")
        frappe.db.set_single_value("Website Settings", "favicon", "/assets/onespace/images/favicon.svg")
        frappe.db.set_single_value("Website Settings", "splash_image", "/assets/onespace/images/onespace_light.png")
        frappe.db.set_single_value("Website Settings", "brand_html", '<img src="/assets/onespace/images/onespace_light.png" alt="OneSpace" style="height: 28px; width: auto;">')
        frappe.db.set_single_value("Website Settings", "copyright", "OneSpace Systems")
    except Exception as e:
        frappe.log_error(f"Failed to update Website Settings for OneSpace: {e}")

def configure_print_settings():
    """Configures Print Settings to eliminate standard ERPNext print footers."""
    try:
        if frappe.db.exists("DocType", "Print Settings"):
            print_settings = frappe.get_doc("Print Settings")
            print_settings.flags.ignore_permissions = True
            print_settings.flags.ignore_mandatory = True
            print_settings.save()
    except Exception as e:
        frappe.log_error(f"Failed to update Print Settings for OneSpace: {e}")
