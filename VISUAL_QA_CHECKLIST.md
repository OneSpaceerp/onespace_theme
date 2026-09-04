# OneSpace ERP Systems v16 — Visual QA Checklist

This checklist guides manual and automated visual verification of the OneSpace visual identity layer against the primary design reference: **Google Stitch Project `11292459283275273462`**.

---

## Interactive Preview Hub
Interactive testbenches are available under `previews/`:
* **Visual QA Hub**: `previews/index.html`
* **Desktop / App Launcher**: `previews/desktop_app_launcher.html`
* **Customer List View**: `previews/customer_list_view.html`
* **Sales Quotation Form View**: `previews/customer_form_view.html`
* **Sign In / Auth**: `previews/login_experience.html`

---

## 1. Surface-by-Surface Verification Checklist

| Surface / Flow | Inspection Criteria | Status | Verified Against Stitch Screen |
|---|---|---|---|
| **1. Login Page** | Centered glass card, ambient orbs, OneSpace vector emblem, password reveal toggle, cluster status pill, responsive scaling | [x] Passed | `78124a4f88e946dfb4a7ddcd4e00d483` |
| **2. Desktop / Home** | Operational nexus status bar, live UTC clock, realtime sync pulse, quick workspace pills, clean grid | [x] Passed | `3bd844270a0a45e4af4aa259fd77bdad` |
| **3. App Launcher** | 6-column modular app grid, gradient tiles, notification badges, interactive hover lift, search filter | [x] Passed | `6f2dd016991a4ec28e922aab803075a9` |
| **4. Global Header** | OneSpace brand logo, `Ctrl+K` search pill, orange "Create" button, notification bell with active dot, avatar badge | [x] Passed | `6f2dd016991a4ec28e922aab803075a9` |
| **5. Navigation Sidebar** | 240px clean rail, active item in kinetic orange container, workspace quick-switchers, clean hierarchy | [x] Passed | `6f2dd016991a4ec28e922aab803075a9` |
| **6. Customer List View** | 44px rows, left 3px orange active marker, tabular numbers on outstanding balance, status capsules, view mode switcher | [x] Passed | `8ffb36eb37684741923dac683e1ab329` |
| **7. Customer / Sales Form** | Sticky action header, DocType title in orange, workflow lifecycle bar (1. Draft &rarr; 4. Invoiced), 38px inputs with orange ring | [x] Passed | `6ea244d88af240818f85fb4c9b668201` |
| **8. Dark Mode System** | Deep Space Carbon (`#0A0E17`), subtle borders (`#1E293B`, `#273248`), dark logo display, high-contrast text (`#F8FAFC`) | [x] Passed | `459eedfd45104f628722ee4906feed52` & `5e96426a7a004571a6352ee70ae20243` |
| **9. Icon Language** | Dedicated vector icons across all 40+ ERP domains, consistent optical stroke and 20px default sizing | [x] Passed | Custom OneSpace SVG Icon Sprite |
| **10. Mobile / Responsive** | Sidebar auto-collapses off-canvas, header search transitions to touch-friendly input, grid stacks cleanly on mobile | [x] Passed | CSS Media queries in `onespace.css` |
| **11. White-Label Compliance** | Zero customer-facing "ERPNext" or "Frappe" marks in navbar, login, or page titles. Dedicated `/open-source-notices` route | [x] Passed | `BRANDING_AUDIT_REPORT.md` |

---

## 2. Regression Testing Script
To re-run automated token and asset tests:
```bash
python -m unittest tests/test_theme.py
```
Expected output: `Ran 7 tests in ... OK`.
