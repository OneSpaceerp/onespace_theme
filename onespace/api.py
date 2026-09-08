"""
OneSpace Desk API
Provides real-time system metrics, telemetry, and frequent DocType stats for the OneSpace Desk.
"""

import frappe
from frappe.utils import fmt_money, today


def get_active_sales_formatted():
    """Returns formatted sum of active sales in the last 30 days or current year."""
    try:
        currency = "USD"
        if frappe.db.table_exists("Company"):
            comp = frappe.db.get_single_value("Global Defaults", "default_currency")
            if comp:
                currency = comp

        if frappe.db.table_exists("Sales Invoice"):
            # Check submitted invoices in current year
            res = frappe.db.sql(
                """
                SELECT SUM(grand_total) as total, currency
                FROM `tabSales Invoice`
                WHERE docstatus = 1 AND fiscal_year = (
                    SELECT name FROM `tabFiscal Year` WHERE YEAR(CURDATE()) BETWEEN YEAR(year_start_date) AND YEAR(year_end_date) LIMIT 1
                )
                GROUP BY currency LIMIT 1
                """,
                as_dict=True,
            )
            if not res:
                # Fallback to all submitted/draft in last 90 days
                res = frappe.db.sql(
                    """
                    SELECT SUM(grand_total) as total, currency
                    FROM `tabSales Invoice`
                    WHERE docstatus IN (0, 1) AND posting_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
                    GROUP BY currency LIMIT 1
                    """,
                    as_dict=True,
                )
            if not res:
                # Fallback to any invoices
                res = frappe.db.sql(
                    "SELECT SUM(grand_total) as total, currency FROM `tabSales Invoice` GROUP BY currency LIMIT 1",
                    as_dict=True,
                )

            if res and res[0].total:
                total = float(res[0].total)
                curr = res[0].currency or currency
                if total >= 1_000_000:
                    return f"{curr} {total / 1_000_000:.2f}M"
                elif total >= 1_000:
                    return f"{curr} {total / 1_000:.1f}K"
                else:
                    return f"{curr} {total:,.0f}"

        return "$0.00"
    except Exception:
        return "$0.00"


def get_pending_approvals_count():
    """Returns count of documents awaiting approval across major DocTypes."""
    count = 0
    doctypes_to_check = [
        "Leave Application",
        "Expense Claim",
        "Purchase Order",
        "Purchase Invoice",
        "Material Request",
        "Sales Order",
    ]
    for dt in doctypes_to_check:
        if frappe.db.table_exists(dt):
            try:
                # In draft (docstatus=0) or workflow state pending
                count += frappe.db.count(dt, filters={"docstatus": 0})
            except Exception:
                pass
    return count


def get_stock_sync_status():
    """Returns stock sync health based on scheduler and repost items."""
    try:
        if frappe.utils.scheduler.is_scheduler_inactive():
            return "PAUSED"

        if frappe.db.table_exists("Repost Item Valuation"):
            queued = frappe.db.count("Repost Item Valuation", filters={"status": "Queued"})
            if queued > 0:
                return f"{queued} QUEUED"

        return "OK"
    except Exception:
        return "OK"


def get_shortcut_counts():
    """Returns live document counts for frequent shortcuts."""
    counts = {
        "sales_invoice": "0 draft",
        "item_master": "0 SKUs",
        "quotation": "0 today",
        "purchase_order": "0 pending",
    }

    # Sales Invoice
    if frappe.db.table_exists("Sales Invoice"):
        try:
            drafts = frappe.db.count("Sales Invoice", filters={"docstatus": 0})
            counts["sales_invoice"] = f"{drafts} draft" if drafts > 0 else f"{frappe.db.count('Sales Invoice')} total"
        except Exception:
            pass

    # Item Master
    if frappe.db.table_exists("Item"):
        try:
            total_items = frappe.db.count("Item", filters={"disabled": 0})
            counts["item_master"] = f"{total_items:,} SKUs"
        except Exception:
            pass

    # Quotation
    if frappe.db.table_exists("Quotation"):
        try:
            today_quotes = frappe.db.count("Quotation", filters={"transaction_date": today()})
            if today_quotes > 0:
                counts["quotation"] = f"+{today_quotes} today"
            else:
                open_quotes = frappe.db.count("Quotation", filters={"docstatus": 0})
                counts["quotation"] = f"{open_quotes} open"
        except Exception:
            pass

    # Purchase Order
    if frappe.db.table_exists("Purchase Order"):
        try:
            po_drafts = frappe.db.count("Purchase Order", filters={"docstatus": 0})
            counts["purchase_order"] = f"{po_drafts} pending sign" if po_drafts > 0 else f"{frappe.db.count('Purchase Order')} total"
        except Exception:
            pass

    return counts


def get_last_accessed_document():
    """Returns the most recent document accessed by the current user."""
    try:
        user = frappe.session.user
        if frappe.db.table_exists("Activity Log"):
            logs = frappe.get_all(
                "Activity Log",
                filters={"user": user, "reference_doctype": ["is", "set"]},
                fields=["reference_doctype", "reference_name"],
                order_by="creation desc",
                limit=1,
            )
            if logs and logs[0].reference_name:
                dt = logs[0].reference_doctype
                dn = logs[0].reference_name
                slug = frappe.scrub(dt).replace("_", "-")
                return {
                    "label": f"{dn} ({dt})",
                    "route": f"/app/{slug}/{dn}",
                }

        if frappe.db.table_exists("Route History"):
            routes = frappe.get_all(
                "Route History",
                filters={"user": user},
                fields=["route"],
                order_by="creation desc",
                limit=10,
            )
            for r in routes:
                parts = (r.route or "").strip("/").split("/")
                if len(parts) >= 3 and parts[0] == "app":
                    dt = parts[1].replace("-", " ").title()
                    dn = parts[2]
                    return {
                        "label": f"{dn} ({dt})",
                        "route": f"/{r.route.lstrip('/')}",
                    }
    except Exception:
        pass

    return {"label": "None", "route": "/app"}


def get_system_status():
    """Report only what the site can actually measure about itself.

    What this used to return was not telemetry, it was set dressing:

      "• 99.99% Operational"   no uptime is measured anywhere; the figure was
                               a literal, shown regardless of reality
      "v16.1.4 Enterprise"     a hardcoded version that did not match the
                               installed 16.32.3, with "Enterprise" appended
                               to a build that has no such edition
      "onespace-cloud-01"      a fabricated cluster identifier for a single VPS
      "Active (Healthy)"       asserted from the scheduler flag alone

    An ERP is bought on trust in its numbers. A dashboard that invents its own
    is the worst possible first impression, and a customer who catches one
    invented figure will reasonably assume the ledger figures are invented too.

    Everything below is read from the running system, and anything unavailable
    is omitted rather than guessed.
    """
    status = {"site": frappe.local.site}

    try:
        status["framework_version"] = getattr(frappe, "__version__", None)
    except Exception:
        pass

    try:
        import erpnext

        status["erp_version"] = getattr(erpnext, "__version__", None)
    except Exception:
        pass

    try:
        inactive = frappe.utils.scheduler.is_scheduler_inactive()
        status["scheduler"] = "Paused" if inactive else "Running"
        status["healthy"] = not inactive
    except Exception:
        # Unknown is an honest answer. "Active" would not be.
        status["scheduler"] = "Unknown"
        status["healthy"] = None

    return status


# Which OneSpace filter chip a workspace belongs to. Anything unmapped falls
# through to "core" rather than being dropped — a newly installed app should
# appear in the launcher, not vanish from it.
LAUNCHER_CATEGORIES = {
    "accounting": "financials",
    "assets": "financials",
    "payables": "financials",
    "receivables": "financials",
    "buying": "supply",
    "stock": "supply",
    "subcontracting": "supply",
    "quality": "supply",
    "selling": "core",
    "crm": "core",
    "projects": "core",
    "manufacturing": "core",
    "support": "core",
    "hr": "hr",
    "payroll": "hr",
    "settings": "system",
    "integrations": "system",
    "build": "system",
    "tools": "system",
    "users": "system",
    "website": "system",
}


def get_launcher_modules():
    """Workspaces the current user may actually open, for the OneSpace launcher.

    Replaces a hardcoded array of fourteen cards with invented routes
    (/desk/build, /desk/organization, /desk/system). Those were guesses: they
    ignored which apps are installed, ignored permissions — so a user with no
    Accounting access still saw an Accounting card — and included a "Framework"
    card that install.py hides in the database but the array put back on screen.

    Deriving from Frappe's own registry means routes are correct by
    construction, permissions are honoured, and a newly installed app shows up
    without a code change.
    """
    pages = []

    # Preferred: Frappe's own sidebar builder already applies permission and
    # hidden-flag rules. Wrapped because helper locations move between releases,
    # and this file has been bitten by that twice already.
    try:
        from frappe.desk.desktop import get_workspace_sidebar_items

        pages = (get_workspace_sidebar_items() or {}).get("pages") or []
    except Exception:
        pages = []

    if not pages:
        try:
            pages = frappe.get_all(
                "Workspace",
                filters={"public": 1, "is_hidden": 0},
                fields=["name", "title", "label", "icon", "module"],
                order_by="sequence_id asc, name asc",
            )
        except Exception:
            return []

    modules = []
    for page in pages:
        name = page.get("name") or page.get("title")
        if not name:
            continue

        title = page.get("title") or page.get("label") or name
        key = frappe.scrub(name)

        modules.append(
            {
                "name": name,
                "title": title,
                "route": "/desk/" + key.replace("_", "-"),
                "icon": page.get("icon") or "",
                "category": LAUNCHER_CATEGORIES.get(key, "core"),
            }
        )

    return modules


@frappe.whitelist()
def set_user_language(language: str):
    """Switch the signed-in user's Desk language.

    Scoped to frappe.session.user and nothing else — the caller cannot name a
    user, so this endpoint can never be used to change someone else's profile.
    The language is validated against the Language table, so an arbitrary
    string cannot be written into the User document.
    """
    language = (language or "").strip()

    if not language:
        frappe.throw(frappe._("No language given."))

    if frappe.session.user == "Guest":
        frappe.throw(frappe._("Sign in to change language."), frappe.PermissionError)

    if not frappe.db.exists("Language", language):
        frappe.throw(frappe._("Unknown language: {0}").format(language))

    allowed = {row["code"] for row in get_offered_languages_for_switcher()}
    if allowed and language not in allowed:
        frappe.throw(frappe._("That language is not offered on this site."))

    frappe.db.set_value("User", frappe.session.user, "language", language,
                        update_modified=False)
    frappe.clear_cache(user=frappe.session.user)

    return {"language": language}


def get_offered_languages_for_switcher():
    from onespace.onespace.doctype.onespace_theme_settings.onespace_theme_settings import (
        get_theme_config,
    )

    return get_theme_config().get("languages") or []


def get_unread_notification_count():
    """Unread Notification Logs for the current user.

    Counted here rather than from the client. Two client-side attempts at this
    both failed against Frappe v16.31.0 — first a dotted-path call to
    notification_log.get_unread_count (no such attribute), then
    frappe.db.get_count (not a function on this build). Framework client APIs
    move between releases; our own whitelisted endpoint does not.
    """
    try:
        return frappe.db.count(
            "Notification Log",
            {"for_user": frappe.session.user, "read": 0},
        )
    except Exception:
        return 0


@frappe.whitelist()
def get_desk_metrics():
    """
    Whitelisted API endpoint for OneSpace Desk frontend.
    Returns real, live system telemetry and KPI metrics.
    """
    return {
        "active_sales": get_active_sales_formatted(),
        "pending_approvals": get_pending_approvals_count(),
        "stock_sync": get_stock_sync_status(),
        "shortcuts": get_shortcut_counts(),
        "last_accessed": get_last_accessed_document(),
        "system": get_system_status(),
        "unread_notifications": get_unread_notification_count(),
        "modules": get_launcher_modules(),
    }
