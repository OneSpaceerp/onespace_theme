# OneSpace

The whitelabel brand and design layer for **Frappe 16** and **ERPNext 16**
(built against Frappe 16.51 / ERPNext 16.50). Install it and the product
your users see is OneSpace: the name, the logo, the sign-in page, the desk,
the apps view and the emails all carry the OneSpace brand. Uninstalling it
gives every setting back exactly as it was.

## Install

```bash
bench get-app onespace <path-or-git-url>
bench --site <site> install-app onespace
bench build --app onespace
bench --site <site> clear-cache
```

Then reload the browser. Settings live at **/desk/onespace-settings**
(System Manager only).

## What changes

| Where | What the user sees |
|---|---|
| Browser tab | "OneSpace" in every title, the OneSpace favicon |
| Sign-in (`/login`) | OneSpace's two-column sign-in page: form beside a carbon brand panel |
| Desk home | The **OneSpace Launcher**: greeting, every app as a coloured tile, quick actions, recent documents, weekly activity, system health |
| Sidebar | OneSpace icon and app titles, orange active pill, optional Carbon (dark) rail |
| Apps | ERPNext → *OneSpace ERP*, Frappe → *OneSpace Platform*, Frappe HR → *OneSpace HR*, … (editable) |
| App icons | Every installed app — Frappe HR, Helpdesk, Healthcare, CRM, LMS, your own — gets an icon generated in the OneSpace style |
| Help menu | Frappe/ERPNext docs, forum and school links hidden; your own Support link added |
| About | A OneSpace About dialog in place of Frappe's |
| Emails | The "Sent via ERPNext" footer is off |
| Pop-ups | "ERPNext v16.x is available" and the vendor change log are off |
| Website & portal | OneSpace favicon, splash, footer and styling |
| Whole desk | OneSpace light and dark themes, following the user's own Light / Dark / Automatic choice |

### How it does it

* **Site settings, reversibly.** System, Website and Navbar Settings already
  have fields for the product name, logo, favicon, splash image, email footer
  and help menu, and Frappe reads them everywhere. OneSpace fills them in —
  the supported way to rename the product — and records every value it
  replaces. Turning off *Apply Brand to Site Settings*, or uninstalling,
  writes the originals back.
* **Boot, without storing anything.** App titles, app logos and the Launcher
  as home are applied to each user's boot as it is built
  (`extend_bootinfo`). Turn a setting off and Frappe's own value is back on
  the next page load.
* **CSS tokens, no JavaScript needed for colour.** The theme is one stylesheet
  in `<head>` keyed off Frappe's own `data-theme`, so it is there for the
  first paint and never fights the user's Light/Dark choice.
* **No core files touched.** Everything attaches through hooks; `bench update`
  never overwrites it.

### What cannot be renamed

DocType names that contain the vendor's name (for example *ERPNext
Settings*), stack traces and developer tools, the `/api` URLs, and text inside
third-party apps' own pages. Those are code identifiers, not presentation;
renaming them would break upgrades.

## OneSpace Settings

* **Brand** — name, tagline, logos for light and dark backgrounds, app icon,
  favicon; whether to write the brand into site settings; whether to hide the
  vendor help links; app titles per installed app.
* **Desk** — sidebar style (*Match Theme* or *Carbon*), density
  (*Comfortable* / *Compact*), the Launcher as home and which of its panels
  show, which DocTypes feed Quick Actions and Recent Documents.
* **Sign-in** — turn the OneSpace page on or off, headline, sub-headline, up
  to six highlights, footnote, optional panel image.
* **Support** — support website and email (shown in the help menu and About),
  About text.

Leave any logo empty to use the artwork that ships with the app.

## App icons

Each installed app gets its own icon, drawn in one family so the site reads
as one product. Choose the family in **OneSpace Settings → Brand → App Icon
Style**:

| Style | Look |
|---|---|
| **Colour Tiles** (default) | The Launcher's rounded gradient tile with a white glyph |
| **Brand Tiles** | The OneSpace icon's charcoal tile with an orange glyph |
| **OneSpace Icon** | Every app carries the OneSpace app icon |
| **Original Logos** | Each app keeps its vendor's logo |

What each app's tile shows is decided in this order:

1. the glyph and colour chosen for it in the **Apps** table;
2. a built-in choice for about forty known apps (Frappe HR → people,
   Helpdesk → headset, Healthcare → stethoscope, CRM → handshake, LMS →
   graduation cap, Insights → chart, Drive → folder, Wiki → book, …);
3. a glyph matched from keywords in the app's name and title, so a custom
   app such as `ecs_cheques` gets a card and `nsd_itsm` a headset;
4. the app's initials, on a colour derived from its name.

Icons are generated on each boot as small inline SVGs (about 1.2 KB each):
nothing is written to disk, no `bench build` is needed, and a newly
installed app has its icon on the next page load. They appear in the
sidebar header and app switcher, Frappe's Apps screen, the Launcher and
Frappe's `/apps` page. Module icons (Selling, Stock, Payroll, …) keep their
own glyphs. **Add Installed Apps** fills the Apps table; the preview under
it shows every app as it will look, before you save. Glyphs are from
[Lucide](https://lucide.dev) (ISC License).

## The Launcher

`/desk/onespace-launcher`, and the desk's home while *Open the Desk on the
OneSpace Launcher* is ticked. Frappe's own Apps screen stays at
`/desk/desktop`.

Nothing on it decides what a user may see. The tiles are
`frappe.boot.desktop_icons`, already filtered by Frappe for app, workspace and
role permissions, in the user's own saved order. Quick actions are offered
only where the user may create; recent documents and the weekly chart are
read through `frappe.get_list`, so User Permissions apply. System Health is
shown to System Managers only. Search, notifications, the user menu and the
theme switch are Frappe's own.

## Design system

From the OneSpace Stitch design (`OneSpace ERP` light and `OneSpace Dark
Slate`), built as three token layers in
`onespace/public/css/onespace/_tokens.scss`:

* **Primitives** — the orange ramp from the mark, zinc for light, slate for dark.
* **Semantic** — canvas, surface, text, border, primary, ring, status; one
  set per mode.
* **Component** — Frappe's own variables (classic, v16 sidebar, Espresso,
  DataTable) pointed at the semantic layer.

Type: **Plus Jakarta Sans** for headings and navigation, **Manrope** for data,
forms and tables, with tabular numerals everywhere. Both are self-hosted
variable fonts (SIL OFL 1.1); nothing loads from a third party.

Accessibility: every text/background pair is checked against WCAG AA in
`onespace/tests/test_pure.py`. The signature orange `#FF3700` carries white
text at only 3.6:1, so it marks focus rings, active states and the logo,
while filled buttons use the deeper `#DE2F00` (4.7:1). Focus is always
visible; motion stops for anyone who has asked their system for less.

## Development

```bash
# Regenerate the icon, favicon and trimmed logos from the delivered artwork
python tools/build_brand_assets.py <folder with onespace_light.png, onespace_dark.png, onespace_icon.png>

# Tests without a site (tokens, assets, defaults, sign-in template)
python -m unittest discover -s onespace/tests -p "test_pure.py"

# Tests on a site
bench --site <site> run-tests --app onespace
```

The mark is drawn from four traced shapes (99.7% pixel overlap with the
artwork), so the SVG mark, the app icon and every favicon size come from one
source.

## Uninstall

```bash
bench --site <site> uninstall-app onespace
```

`before_uninstall` restores every site setting OneSpace replaced and unhides
the help links it hid.

## License

MIT. Fonts: SIL Open Font License 1.1 (see `onespace/public/fonts`).
