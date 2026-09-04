# OneSpace ERP Systems v16 — Branding Audit Report

## 1. Audit Scope & Executive Summary
This branding audit assesses customer-visible touchpoints across Frappe Framework v16 and ERPNext v16 to verify complete replacement of standard promotional marks with the **OneSpace** identity, while preserving all legally required copyright notices and open source license attributions.

---

## 2. Branding Touchpoints Analysis

### 2.1 FOUND (Default Identity Surfaces in Vanilla ERPNext v16)
1. **Browser Titles**: Default page titles formatted as `<DocType> - ERPNext` or `<DocType> - Frappe`.
2. **Favicons**: Frappe standard blue favicon (`frappe-favicon.svg`).
3. **Desk Top Navbar**: Default Frappe "E" logo mark and "ERPNext" brand label text.
4. **Login Experience**: "Login to Frappe", Frappe blue buttons (`#0089FF`), and default login card.
5. **Help / About Modals**: Default dialog linking to Frappe School, Frappe Forum, and Frappe Cloud.
6. **Email Footers**: Automated email footer text reading `"Sent via ERPNext"`.
7. **Print Layouts**: Standard print format footer reading `"Printed using ERPNext"`.
8. **App Launcher / Home Workspace**: Default Frappe desk workspaces with standard grey-blue tiles.
9. **Website & Portal**: Standard `/login`, `/contact`, 404, and 500 pages carrying Frappe branding.

---

### 2.2 REPLACED (Customized to OneSpace ERP Systems)
| Surface | Replacement Method | OneSpace Value |
|---|---|---|
| **App Title** | `System Settings` & `hooks.py` | `OneSpace` / `OneSpace ERP Systems` |
| **Desk Navbar Logo** | `onespace.js` + `app_logo_url` | Vector OneSpace Light & Dark brand marks (`onespace_light.png`, `onespace_dark.png`) |
| **Browser Title** | `onespace.js` title observer | `<DocType> - OneSpace` |
| **Favicon** | `website_context` in `hooks.py` | OneSpace kinetic orange SVG favicon (`favicon.svg`) |
| **Desk Color System** | `tokens.css` + `onespace.css` | Kinetic Orange (`#FF3700`), Structured Light (`#FBF8FF`), Deep Space Carbon (`#0A0E17`) |
| **Login Experience** | `templates/includes/login/login.html` | Centered glass card, ambient glow, light/dark switcher, cluster node status |
| **About Dialog** | `about_override.js` | OneSpace ERP Systems v16 SaaS About Dialog |
| **App Launcher** | `app_launcher.js` | Odoo/SaaS-inspired modular 6-column grid with live clock and sync status |
| **Standard Icons** | `onespace-icons.svg` + `icons.css` | 40+ custom geometric vector icons covering all core ERP domains |
| **Email Footers** | `System Settings` fixture | `"Sent via OneSpace ERP Systems • onespace.sh"` |
| **Error Pages** | `404.html` & `500.html` | Custom OneSpace branded error pages with return-to-desk action |

---

### 2.3 INTENTIONALLY RETAINED (Legal & Compliance Preservation)
To comply with the MIT License of Frappe Framework and the GNU General Public License v3 (GPLv3) of ERPNext:
1. **Source Code Copyright Headers**: Copyright notices inside python files (`apps/frappe/...`, `apps/erpnext/...`) remain intact.
2. **License Text Files**: `license.txt` in upstream repositories remain preserved.
3. **Dedicated Open Source Notices**: An accessible `/open-source-notices` route is provided in OneSpace to openly acknowledge Frappe Framework and ERPNext contributors.

---

### 2.4 NOT SAFE TO REPLACE (Internal Technical Identifiers)
The following internal names must remain untouched to prevent breaking database queries, foreign keys, and API schemas:
1. **DocType Database Names**: `DocType`, `DocField`, `User`, `Customer`, `Sales Invoice`, `Company`.
2. **Frappe Python APIs**: `frappe.db`, `frappe.get_doc`, `frappe.whitelist`, `frappe.throw`.
3. **Core Database Table Prefixes**: `tabCustomer`, `tabSales Invoice`.
4. **Site Directory Paths**: `sites/`, `apps/frappe/`, `apps/erpnext/`.
