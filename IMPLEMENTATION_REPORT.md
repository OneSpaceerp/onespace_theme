# OneSpace Theme — Phase 1 Discovery & Implementation Report

**Status:** Discovery complete. Implementation **blocked on one decision** (§8.1).
**Date:** 5 September 2026
**Scope audited:** `onespace/` app · `agent/skills/` (21 skills) · Stitch project `11292459283275273462` (12 screens + design system) · both OneSpace logos.

---

## 1. Existing architecture

The repo already contains a real Frappe app, not a stub. The bones are correct.

| Aspect | Finding | Verdict |
|---|---|---|
| App type | Standalone custom Frappe app `onespace`, flit-packaged, `required_apps = ["frappe"]` | ✅ Correct — no core fork |
| Asset pipeline | v16 esbuild bundler entries: `onespace.bundle.css` + `onespace.bundle.js` via `app_include_css/js` and `web_include_css/js` | ✅ Correct v16 pattern |
| SCSS source | `public/scss/onespace.bundle.scss` importing `_variables`, `_light`, `_dark`, `_desk_components` | ✅ Good structure |
| Branding hooks | `app_logo_url`, `website_context`, `add_to_apps_screen`, `default_mail_footer`, `extend_bootinfo` | ✅ Supported extension points |
| Install automation | `after_install` + `after_migrate` → System Settings, Website Settings, Print Settings, workspaces | ✅ Right idea, ⚠️ see §8 |
| Templates | `templates/includes/login/login.html`, `pages/404.html`, `pages/500.html`, `pages/open_source_notices.html` | ✅ Correct override paths |
| Tests | `tests/test_theme.py` | ❌ Tests assert on files that never load — see §1.2 |
| ERPNext | **Not declared as a dependency and not present in the repo.** `required_apps` lists only `frappe`. | ⚠️ See §8.6 |

### 1.1 What actually loads at runtime

`hooks.py` includes **only** `onespace.bundle.js` and `onespace.bundle.css`. Neither bundle imports the other files.

**Dead at runtime** (present, referenced only by README/tests/previews):

```
public/js/onespace.js          public/css/tokens.css
public/js/app_launcher.js      public/css/onespace.css
public/js/theme_switcher.js    public/css/onespace-dark.css
public/js/icons.js             public/css/onespace-web.css
public/js/about_override.js    public/css/icons.css
```

Two consequences, both material:

- **`tests/test_theme.py` is falsely green.** It asserts against files the browser never receives. The theme could be entirely broken and the suite would still pass.
- **`onespace.js` and `onespace.bundle.js` contain two divergent copies of the same scrubber**, and the safer copy is the one that *doesn't* load (see §8.1).

Exception: `login.css`, `tokens.css` and `onespace.css` *are* reached — the login template `<link>`s them directly from `/assets/onespace/css/…`, which works because they're static assets. That path is fine.

### 1.2 Duplication

`public/css/onespace.bundle.css` (11.8 KB) is a hand-maintained copy of what the SCSS compiles to. Two sources of truth for the same tokens. The SCSS should be the only source; the `.bundle.css` file should not exist alongside it.

---

## 2. Existing branding — what is done, what leaks

### Done correctly
- App title, logo URL, favicon, splash via hooks and Website Settings
- `disable_standard_email_footer` + `hide_footer_in_auto_email_reports`
- Custom `default_mail_footer` with OneSpace identity
- Custom login, 404, 500 templates
- `open_source_notices` page and route — **good instinct, keep it** (this is the GPLv3 §5 compliance surface)
- `extend_bootinfo` rewriting `app_name`, `app_title`, `app_data`, `apps_data`, `sidebar_pages`, `navbar_settings`
- Framework/Frappe Framework desktop icons and workspaces hidden; "ERPNext Settings" → "OneSpace Settings"

### Leaking or fragile
| Surface | Issue |
|---|---|
| Desk text | Handled by a runtime DOM scrubber, not by translation or boot data — see §8.1 |
| Top-left logo | Located by `getBoundingClientRect()` position guessing (`rect.top < 60 && rect.left < 80`), re-run 5×/second |
| Print formats | `configure_print_settings()` loads and saves Print Settings **without changing any field** — it is a no-op |
| App launcher | Module list is hard-coded in JS, including a `Framework` card the audit elsewhere hides |
| Notifications / user menu / onboarding | Not addressed |
| `app_license` | `hooks.py` says `MIT`; `license.txt` is MIT; product is described as commercial — consistent today, but decide deliberately before launch |

---

## 3. Stitch design system — extracted

The Stitch project carries a full design spec. **Important: it contains two conflicting palettes.**

- The YAML frontmatter (`colors:`) is Stitch's auto-generated Material palette — `primary: #b22400`, `surface: #fbf8ff`, `on-surface-variant: #5e3f38`. Purple-tinted surfaces, muted brick primary.
- The prose "Brand & Style" section states the real intent — `#FF3700` primary, `#18181B` secondary, `#F4F4F5` tertiary, `#71717A` neutral, `#E4E4E7` gridlines, `#FAFAFA` canvas, `#FFFFFF` cards. These match `overridePrimaryColor` / `overrideSecondaryColor` / `overrideTertiaryColor` / `overrideNeutralColor` on the project record.

**Resolution: the prose spec + the `override*` fields are authoritative.** The frontmatter Material palette is generated noise and must be ignored. This is a **zinc** neutral ramp, not slate.

### The authoritative system

**Color**
| Role | Value | Use |
|---|---|---|
| Primary | `#FF3700` | Transactional buttons, active nav pills, focus rings, critical states. Never a large background fill. |
| Primary hover | `#FF4500` | Hover brightness lift |
| Secondary | `#18181B` | Primary text, deep headers, high-contrast rail |
| Tertiary | `#F4F4F5` | Secondary sidebars, table header rows, disabled containers |
| Neutral | `#71717A` | Metadata, breadcrumbs, placeholders |
| Gridline | `#E4E4E7` | Borders, table rules |
| Canvas | `#FAFAFA` | Level 0 app stage |
| Card | `#FFFFFF` | Level 1 surface |
| Success | `#ECFDF5` bg / `#047857` text | Submitted |
| Danger | `#FEF2F2` bg / `#B91C1C` text | Overdue, cancelled |
| Pending | `rgba(255,55,0,.08)` bg / `#FF3700` text | Action required |
| Draft | `#F4F4F5` bg / `#52525B` text | Neutral state |

**Type** — Plus Jakarta Sans for headings/nav, Manrope for body/forms/tables. Baseline body is **13px** (dense ERP). Ten defined roles: `display-lg` 32/40/700/-0.02em · `headline-lg` 24/32/700 · `headline-md` 20/28/600 · `headline-sm` 16/24/600 · `body-lg` 15/24 · `body-md` 13/20 · `body-sm` 12/18 · `label-lg` 13/18/600 · `label-md` 12/16/600/+0.02em · `label-sm` 11/14/700/+0.04em. `font-feature-settings: 'tnum'` mandatory on all ledger balances, quantities and currency.

**Spacing** — xxs .125 · xs .25 · sm .5 · md .75 · base 1 · lg 1.5 · xl 2 · 2xl 3 (rem). Rail 4.5rem/72px · sidebar 16rem/256px · header 3.5rem/56px · page margin 1.5rem · gutters .75/1.25rem.

**Radius** — sm 4px (`.25rem`) · base 8px · md 12px · lg 16px · xl 24px · full pill.

**Elevation** — L1 `0 1px 3px rgba(0,0,0,.04), 0 1px 2px -1px rgba(0,0,0,.02)` · L2 `0 10px 15px -3px rgba(0,0,0,.08), 0 4px 6px -4px rgba(0,0,0,.03)` · L3 `0 20px 25px -5px rgba(0,0,0,.12), 0 8px 10px -6px rgba(0,0,0,.06)`, backdrop `rgba(24,24,27,.4)`.

**Components** — Buttons 8px radius, `.75rem 1.25rem` padding. Inputs **38px** height, 8px radius, focus = 2px `#FF3700` ring + `rgba(255,55,0,.15)` outer tint, labels above at 12px/600/`#27272A`. Table header `#F4F4F5`, 11px uppercase `+0.04em` `#71717A`; rows **44px**, bottom border `#F4F4F5`, hover `#FAFAFA`, selected `rgba(255,55,0,.04)` + 3px left `#FF3700` marker. Badges pill, 22px tall, 11px bold.

**Layout** — four tiers: 72px global rail → 256px collapsible module sidebar → fluid canvas → 56px header command bar. Module sidebar becomes an off-canvas drawer below **1024px**.

### The 12 Stitch screens

| Screen | Light | Dark | Switcher |
|---|---|---|---|
| Desk / App Launcher | ✅ | ✅ | ✅ |
| ERPNext v16 App Launcher (Home) | ✅ | | |
| Customers List View | ✅ | ✅ | ✅ |
| Customers Kanban View | | | ✅ + interactive drag/drop |
| Sales Quotation Form View | ✅ | ✅ | ✅ |
| Executive Selling Workspace | ✅ | ✅ | ✅ |
| Sign In | | | ✅ |

Every screen ships downloadable HTML — these are the pixel source of truth and I will extract exact values from them per surface rather than working from the prose alone.

**Gap:** no Stitch screens exist for **notifications, user menu, settings, onboarding, reports, or mobile**. Those surfaces will be derived from the system rather than copied, and flagged as such in the QA checklist.

---

## 4. Relevant skills discovered

Read: `router`, `code-style`, `ui-design`, plus the index of all 21. Binding conventions extracted:

**`code-style`** — small functions; **files under 300 lines**; prefer OO over scattered functions; public/high-order functions at top, utilities at bottom; terse comments explaining *why*; no abstraction until repeated concrete use.

> The current `onespace.bundle.js` is **1,000+ lines in a single IIFE** with a hard-coded data table, an SVG dictionary, DOM builders and a scrubber all in one file. It violates this skill directly.

**`ui-design`** — minimalist, remove before adding; information on surfaces not boxes; one primary action per page; **product work optimises for clarity, not impressiveness**; muted text used sparingly; px for size/line-height, em for letter-spacing; flexbox + gap, avoid margins; **vertical lane alignment** with fixed-width `flex-shrink: 0` slots for icons and trailing actions in repeated rows; SVG icons never emoji; realistic content never "Item 1".

> The lane-alignment rule is directly applicable to the list view and launcher grid and is currently not respected.

Also relevant and to be read before their phases: `desk-customization` + `references/js-api.md` (Desk extension points), `frontend-development` + `references/frappe-ui.md` (v16 Vue surfaces), `ui-patterns` + `references/app-shell-patterns.md`, `component-patterns.md`, `mobile-patterns.md`, `printing-templates` (print formats), `testing` + `references/test-patterns.md`, `quality-code-review` (pre-delivery gate).

---

## 5. Extension points to use (and the order to prefer them)

1. **`hooks.py`** — `app_logo_url`, `app_title`, `website_context`, `app_include_css/js`, `web_include_css/js`, `app_include_icons`, `add_to_apps_screen`, `default_mail_footer`, `extend_bootinfo`, `website_route_rules`, `jinja` filters, `navbar_settings`
2. **`extend_bootinfo`** — server-side rewrite of boot payload *before* it reaches the client. This is where identity belongs, not in a DOM sweep.
3. **Translations** — a `onespace` translation layer is the *supported* mechanism for renaming framework-supplied strings per-site. This replaces most of what the scrubber does today, at zero runtime cost.
4. **CSS custom properties** — Frappe v16 exposes `--primary`, `--bg-color`, `--fg-color`, `--card-bg`, `--sidebar-bg`, `--text-color`, `--border-color`, `--control-bg`, `--btn-*`. Theme through these, never through DOM-shape selectors.
5. **Template overrides** — `templates/includes/login/login.html`, error pages, portal.
6. **Fixtures** — Workspace, Navbar Settings, Print Format, Letter Head, Email Template.
7. **Client scripts / `frappe.ui.toolbar` overrides** — for the About dialog and help menu, targeted and idempotent.
8. **`after_install` / `after_migrate`** — settings enforcement, re-applied after every migrate.

---

## 6. Files that must NOT be modified

- Anything under `frappe/` or `erpnext/` — no exceptions
- `agent/skills/**` — read-only convention source
- `license.txt` and the open-source notices page content — legal surface
- `onespace_light.png` / `onespace_dark.png` at repo root — the official logo masters (derivatives go in `public/images/`)

---

## 7. Files to be created / modified

**Delete (dead or duplicated):** `public/css/onespace.bundle.css` (hand-copy of SCSS output) · `public/js/onespace.js`, `app_launcher.js`, `theme_switcher.js`, `icons.js`, `about_override.js` (superseded, unreferenced) · `public/css/onespace.css`, `onespace-dark.css`, `onespace-web.css`, `icons.css` (folded into SCSS; `tokens.css` and `login.css` retained as static assets for the login template).

**Rewrite:** `public/scss/_variables.scss` → full `--os-*` token set on the Stitch zinc ramp · `_light.scss` / `_dark.scss` → mapped to both `--os-*` and Frappe's own variables · `_desk_components.scss` → split by surface (shell, list, form, dashboard, controls) to respect the 300-line rule.

**Create:** `public/scss/_tokens.scss`, `_typography.scss`, `_shell.scss`, `_listview.scss`, `_formview.scss`, `_dashboard.scss`, `_controls.scss`, `_dialogs.scss`, `_mobile.scss` · `public/js/` split into `branding.js`, `launcher.js`, `theme.js`, `icons.js` re-imported by a thin `onespace.bundle.js` · `public/fonts/` self-hosted Manrope + Plus Jakarta Sans · `onespace/translations/` · `onespace/fixtures/` · `OVERRIDE_MAP.md` · `INSTALL.md`.

**Keep as-is:** `hooks.py` (extended, not replaced) · `setup/boot.py` (extended) · templates · `pyproject.toml`.

---

## 8. Risks and compatibility concerns

### 8.1 🛑 BLOCKING — the runtime DOM text scrubber must go

`onespace.bundle.js` (the file that actually loads) ends with:

```js
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
while ((node = walker.nextNode())) {
  if (node.nodeValue.includes('ERPNext') || node.nodeValue.includes('Frappe')) {
    node.nodeValue = node.nodeValue.replace(/ERPNext/g, 'OneSpace').replace(/Frappe/g, 'OneSpace');
  }
}
...
setInterval(tick, 200);
new MutationObserver(tick).observe(document.body, { childList: true, subtree: true, characterData: true });
```

Four separate defects:

1. **It corrupts customer data on screen.** It walks *every* text node in `<body>` with **no tag filter at all** — `null` is passed where `onespace.js` passes an `ignoredTags` guard. A Customer named "Frappe Technologies" renders as "OneSpace Technologies". An Item description, a Comment, an email body, a search result, a value the user just typed into a `<textarea>` — all silently rewritten. The user sees data that is not what is stored. This is a correctness and trust defect, not a cosmetic one, and it is exactly the kind of thing an ERP customer will find in their first week.
2. **Infinite mutation feedback loop.** The MutationObserver watches `characterData`; the callback *writes* `characterData`. Every pass schedules the next.
3. **Permanent 5 Hz full-tree walk.** `setInterval(tick, 200)` never clears. On a 500-row list view this walks tens of thousands of nodes five times a second, forever, in every open tab — plus `enhanceTopNavbar()` calls `getBoundingClientRect()` inside the same tick, forcing synchronous layout.
4. **It is the wrong layer.** Everything it achieves legitimately is achievable in `extend_bootinfo` (already present) plus a translation layer plus CSS — server-side, once per session, zero runtime cost, and upgrade-safe.

**Recommendation:** delete the scrubber entirely. Replace with (a) the existing boot rewrite, extended; (b) a OneSpace translation layer for framework-supplied UI strings; (c) targeted, idempotent overrides for the About dialog and help menu; (d) CSS for anything visual.

**The decision I need from you:** this approach removes branding from *product surfaces* — menus, titles, dialogs, workspace headers, emails, print — but it will **not** rewrite the word "Frappe" or "ERPNext" if it appears inside a customer's own data, inside a doctype name a developer sees in the URL, or inside an error trace. My position is that this is correct: those are categories B and C in your own §23, and rewriting them is what causes the data-corruption bug above.

If you require literal removal from *every* pixel including customer data, say so and I will implement a strictly bounded version — a fixed allowlist of DOM regions, no interval, no characterData observation — but I want that to be a deliberate choice with the trade-off stated, not something I do silently.

### 8.2 Palette drift from the Stitch source of truth
`_light.scss` / `_dark.scss` use a Tailwind **slate** ramp (`#F8FAFC`, `#0F172A`, `#E2E8F0`, `#0A0E17`, `#151D2F`). Stitch specifies **zinc** (`#FAFAFA`, `#18181B`, `#E4E4E7`, `#71717A`, `#F4F4F5`). Slate is blue-tinted and fights the orange; zinc is neutral and is what the spec and the logo call for. **Fix in Phase 2.** The invented navy dark palette (`#0A0E17`/`#151D2F`) will be replaced with values extracted from the actual Stitch dark screens.

### 8.3 Render-blocking font import
`_variables.scss` and `onespace.bundle.css` both start with `@import url('https://fonts.googleapis.com/…')`. A CSS `@import` blocks rendering, adds a third-party dependency on every Desk load, and fails on air-gapped or restricted-network deployments — a real scenario for ERP customers. **Self-host Manrope and Plus Jakarta Sans** in `public/fonts/` with `font-display: swap`.

### 8.4 Hard-coded launcher module list
The `MODULES` array hard-codes 14 cards with fixed titles, routes, colours and badges — including a `Framework` card the install script hides elsewhere. It ignores which apps are installed and **ignores user permissions**, so a user without Accounting access still sees the Accounting card. Replace with a boot-supplied, permission-filtered list derived from Frappe's own workspace/module registry, styled by OneSpace.

### 8.5 Raw SQL against framework tables
`install.py` issues `UPDATE tabWorkspace`, `tabDesktop Icon`, `tabWorkspace Sidebar` directly. This bypasses the ORM (no cache invalidation, no hooks) and is overwritten by `bench migrate` re-sync — which is why `after_migrate` re-runs it. Workable, but it is fighting the framework and each v16 patch can change those schemas. It also does `DESC \`tabWorkspace Sidebar\`` to probe columns, which is a sign the schema isn't known. Prefer fixtures and ORM writes; keep SQL only where no supported path exists, and record each one in `OVERRIDE_MAP.md`.

### 8.6 ERPNext is not actually in this repo or declared
`required_apps = ["frappe"]` and no ERPNext source is present. The theme therefore cannot be verified against real ERPNext v16 DocType markup from this repo alone. **I need to know where a running v16 bench is** — local, Docker, or a remote server — or Phase 6 (DocType coverage) and all visual QA can only be done against the Stitch HTML, not against the real thing. If you want `required_apps` to include `erpnext`, that is a deliberate coupling decision.

### 8.7 Falsely-green test suite
`tests/test_theme.py` asserts on unloaded files. It must be rewritten to assert on what `hooks.py` actually ships and on compiled bundle output, or it provides negative value.

### 8.8 Google Doc research not accessible
`docs.google.com/document/d/1E794wh…` did not fetch — the export endpoint timed out, which normally means it requires authentication. Please either set link-sharing to "anyone with the link", export it to `ERPNext_theme/docs/`, or paste the content. I don't want to build the v16 theming approach without checking it against research you've already done.

### 8.9 Deferred, lower severity
`configure_print_settings()` is a no-op · `public/css/onespace.bundle.css` duplicates SCSS output · `onespace.bundle.js` is a 1,000-line single IIFE against the `code-style` 300-line rule · `theme_switcher` writes `localStorage` without try/catch (throws in private-mode and in some embedded contexts) · no `prefers-reduced-motion` handling yet · no focus-visible states defined yet.

---

## 9. Proposed sequence

| Phase | Work | Gate |
|---|---|---|
| 1 ✅ | This report | Delivered |
| 2 | Token layer on the Stitch zinc ramp; self-hosted fonts; typography scale; light + dark from the real Stitch dark screens | Tokens render correctly in both themes with no hardcoded hex outside `_tokens.scss` |
| 3 | Remove scrubber; boot + translations + targeted overrides; logo, favicon, browser identity | No interval, no characterData observer; branding still correct on every surface |
| 4 | Shell — rail, sidebar, header, launcher (permission-driven) | Matches Stitch launcher screens light + dark |
| 5 | Controls — buttons, inputs, dropdowns, dialogs, tabs, badges, status | 38px inputs, 8px radius, correct focus ring |
| 6 | List + form views | Matches Stitch Customer List and Sales Quotation screens |
| 7 | Dashboards, reports, kanban | Matches Executive Selling Workspace |
| 8 | Login, onboarding, portal, email, print | Matches Stitch Sign In |
| 9 | Dark mode pass across every surface | Parity checklist complete |
| 10 | Responsive — 1024px sidebar drawer, mobile tables/forms | Usable on 375px |
| 11 | Branding audit, tests rewritten, visual QA | Real tests green; QA checklist signed |
| 12 | `README`, `OVERRIDE_MAP.md`, `INSTALL.md` | Documentation complete |

---

## 10. What I need from you before Phase 2

1. **§8.1 — the scrubber decision.** Product-surface branding via supported mechanisms (my recommendation), or a strictly bounded allowlist scrubber?
2. **§8.6 — where is the running v16 bench?** Without one, visual QA is against Stitch HTML only.
3. **§8.8 — access to the Google Doc research.**

Everything else I will decide and implement autonomously per your §33.
