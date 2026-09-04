# OneSpace ERP Systems v16 — Theme & Visual Identity Layer

OneSpace is a commercial SaaS visual identity and theme layer for **Frappe Framework v16** and **ERPNext v16**. It transforms standard ERPNext into a distinctive, high-polish SaaS product inspired by the design quality and operational usability of Odoo and modern enterprise suites, while maintaining 100% technical compatibility and upgrade safety with upstream Frappe.

---

## 1. Design Reference
Built directly from the Google Stitch OneSpace project:
* **Stitch Project ID**: `projects/11292459283275273462` ("OneSpace ERPNext Theme Design")
* **Official Vector Marks**: `onespace_light.png` and `onespace_dark.png`

---

## 2. Technical Architecture
The theme is packaged as a standard, self-contained custom Frappe app named `onespace`:

```
c:\dev\SaaS_ERP\ERPNext_theme\
├── pyproject.toml
├── license.txt
├── README.md
├── BRANDING_AUDIT_REPORT.md
├── VISUAL_QA_CHECKLIST.md
├── onespace/
│   ├── __init__.py
│   ├── hooks.py                      # Central Frappe hook wiring
│   ├── setup/
│   │   ├── __init__.py
│   │   └── install.py                # Automated System & Website Settings setup
│   ├── public/
│   │   ├── images/                   # Brand logos, favicons, vector emblems
│   │   ├── icons/                    # onespace-icons.svg symbol sprite
│   │   ├── css/
│   │   │   ├── tokens.css            # Kinetic orange, light & dark token scales
│   │   │   ├── icons.css             # Icon classes and sizing scales
│   │   │   ├── onespace.css          # Desk global theme overrides
│   │   │   ├── onespace-dark.css     # Deep space carbon dark mode
│   │   │   ├── login.css             # Standalone login styles
│   │   │   └── onespace-web.css      # Portal and website rebranding
│   │   └── js/
│   │       ├── theme_switcher.js     # Light/Dark/System live switcher
│   │       ├── icons.js              # SVG icon sprite injector & mapper
│   │       ├── app_launcher.js       # Odoo/SaaS-inspired modular app grid
│   │       ├── about_override.js     # White-label About modal
│   │       └── onespace.js           # Master Desk runtime controller
│   ├── templates/
│   │   ├── includes/login/login.html # Complete login page override
│   │   └── pages/                    # 404, 500, and open_source_notices.html
│   └── fixtures/                     # System & Website Settings fixtures
├── tests/
│   └── test_theme.py                 # Automated asset & token test suite
└── previews/                         # Interactive Visual QA testbenches
```

---

## 3. Design Tokens & Color System
Defined in `onespace/public/css/tokens.css` and mapped directly into Frappe v16 core CSS variables:
* **Kinetic Orange Core**: `--os-brand-primary: #FF3700`, `--os-brand-primary-hover: #E03000`, Container `#DE2F00`, Focus Ring `rgba(255, 55, 0, 0.15)`.
* **Light Canvas**: Base `#FBF8FF`, Cards `#FFFFFF`, Surface Low `#F4F2FD`, Containers `#EEEDF7` / `#E8E7F1`, Borders `#E4E4E7`.
* **Dark Canvas**: Base `#0A0E17`, Rail `#0E1424`, Card `#151D2F`, Elevated `#1B2438`, Hover `#1F2C44`, Borders `#1E293B` / `#273248`.
* **Typography**: **Plus Jakarta Sans** (Headlines & Brand) and **Manrope** (Body, Controls, Tabular Figures).

---

## 4. Icon Architecture
* Built as an SVG `<symbol>` sprite (`onespace/public/icons/onespace-icons.svg`) covering 40+ ERP domains and reusable action verbs.
* Rendered cleanly via `<svg class="os-icon os-icon-md"><use href="#os-icon-{name}"></use></svg>`.
* Runtime helper `OneSpace.getIconHtml(name)` and automatic module mapper in `icons.js`.

---

## 5. Upgrade Strategy & Maintenance
1. **Zero Core Modifications**: No files in `apps/frappe` or `apps/erpnext` are touched.
2. **Semantic CSS Variable Mapping**: Rather than targeting fragile internal selectors, OneSpace binds to Frappe v16 standard CSS variables (`--primary`, `--bg-color`, `--card-bg`, `--border-color`, `--control-bg`). This guarantees compatibility across Frappe v16 minor releases and patch updates.
3. **Automated Re-application**: The `after_migrate` hook in `hooks.py` re-applies brand settings, favicons, and footer suppressions automatically whenever `bench migrate` is run.

---

## 6. Installation & Deployment Instructions

### On a Frappe Bench
```bash
# 1. Clone or link the app into your bench
bench get-app onespace https://github.com/onespace-erp/onespace_theme

# 2. Install on the tenant site
bench --site <site-name> install-app onespace

# 3. Build public assets and clear cache
bench build --app onespace
bench --site <site-name> clear-cache
```

### Running Automated Tests
```bash
python -m unittest tests/test_theme.py
```

### Visual QA Verification
Open `previews/index.html` in any browser to inspect the interactive live previews for Desktop, List View, Form View, and Sign In.
