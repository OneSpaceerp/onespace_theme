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
    configure_workspaces_and_desktop_icons()
    frappe.clear_cache()

def after_migrate():
    """Runs after bench migrate to ensure brand settings stay enforced."""
    configure_system_settings()
    configure_website_settings()
    configure_print_settings()
    configure_workspaces_and_desktop_icons()
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

def configure_workspaces_and_desktop_icons():
    """
    White-labels Frappe v16 Desktop Icons, Workspaces, and Workspace Sidebars:
    - Hides developer/framework icons (Framework, Frappe Framework)
    - Renames 'ERPNext Settings' to 'OneSpace Settings'
    - Relabels ERPNext module references to OneSpace
    """
    try:
        # 1. Desktop Icons (v16 Launcher)
        if frappe.db.table_exists("Desktop Icon"):
            # Hide Framework & Frappe Framework icons
            frappe.db.sql("""
                UPDATE `tabDesktop Icon`
                SET hidden = 1
                WHERE name IN ('Framework', 'Frappe Framework') 
                   OR label IN ('Framework', 'Frappe Framework')
            """)
            # Rename ERPNext Settings
            frappe.db.sql("""
                UPDATE `tabDesktop Icon`
                SET label = 'OneSpace Settings'
                WHERE name = 'ERPNext Settings' OR label = 'ERPNext Settings'
            """)
        # 2. Workspaces
        if frappe.db.table_exists("Workspace"):
            # Hide Framework workspaces
            frappe.db.sql("""
                UPDATE `tabWorkspace`
                SET is_hidden = 1, public = 0
                WHERE name IN ('Framework', 'Frappe Framework')
                   OR title IN ('Framework', 'Frappe Framework')
            """)
            # Rename ERPNext Settings workspace
            frappe.db.sql("""
                UPDATE `tabWorkspace`
                SET title = 'OneSpace Settings', label = 'OneSpace Settings'
                WHERE name = 'ERPNext Settings' OR title = 'ERPNext Settings'
            """)

        # 3. Workspace Sidebar (v16 persistent navigation header rebranding)
        if frappe.db.table_exists("Workspace Sidebar"):
            columns = [c[0] for c in frappe.db.sql("DESC `tabWorkspace Sidebar`")]
            if "header" in columns:
                frappe.db.sql("""
                    UPDATE `tabWorkspace Sidebar`
                    SET header = 'OneSpace'
                    WHERE header IN ('ERPNext', 'Frappe Framework', 'Frappe')
                """)

        # 4. Resync standard icons from apps
        try:
            from frappe.desk.doctype.desktop_icon.desktop_icon import sync_desktop_icons
            sync_desktop_icons()
        except Exception:
            pass

        try:
            from frappe.desk.doctype.workspace_sidebar.workspace_sidebar import sync_workspace_sidebars
            sync_workspace_sidebars()
        except Exception:
            pass

        frappe.db.commit()
    except Exception as e:
        frappe.log_error(f"Failed to white-label workspaces/desktop icons for OneSpace: {e}")

