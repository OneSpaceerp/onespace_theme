/* OneSpace — the brand on the desk.

   The palette needs no script: onespace.bundle.css is in <head> and keyed off
   Frappe's own data-theme, so light, dark and automatic all paint OneSpace
   from the first frame. This file only does what CSS cannot:

   * marks <html> with the two layout choices from OneSpace Settings - sidebar
     style and density - as early as it can run;
   * points the tab icon at the brand when the desk has painted Frappe's;
   * replaces Frappe's About dialog, which names Frappe and links its site.

   Nothing here patches Frappe beyond frappe.ui.misc.about, a leaf function
   the desk calls only to open that dialog. */

const html = document.documentElement;

function config() {
	return (window.frappe && frappe.boot && frappe.boot.onespace) || null;
}

function mark_html() {
	const cfg = config();
	if (!cfg) return;
	html.setAttribute("data-os-sidebar", cfg.sidebar_style === "carbon" ? "carbon" : "match");
	html.setAttribute("data-os-density", cfg.density === "compact" ? "compact" : "comfortable");
}

function brand_favicon() {
	const cfg = config();
	const href = cfg && cfg.brand && cfg.brand.favicon;
	if (!href) return;
	let link = document.querySelector("link[rel~='icon']");
	if (!link) {
		link = document.createElement("link");
		link.rel = "icon";
		document.head.appendChild(link);
	}
	if (link.getAttribute("href") !== href) link.setAttribute("href", href);
}

function esc(value) {
	return frappe.utils.escape_html(value == null ? "" : String(value));
}

function about() {
	const cfg = config() || {};
	const brand = cfg.brand || { name: "OneSpace" };
	const support = cfg.support || {};
	const links = [];
	if (support.url) {
		links.push(
			`<a href="${esc(support.url)}" target="_blank" rel="noopener noreferrer">${esc(__("Support website"))}</a>`
		);
	}
	if (support.email) {
		links.push(`<a href="mailto:${esc(support.email)}">${esc(support.email)}</a>`);
	}

	const dialog = new frappe.ui.Dialog({ title: __("About {0}", [brand.name]) });
	$(dialog.body).html(`
		<div class="os-about">
			<img class="os-logo-on-light" src="${esc(brand.logo_light)}" alt="${esc(brand.name)}">
			<img class="os-logo-on-dark" src="${esc(brand.logo_dark)}" alt="" aria-hidden="true">
			${cfg.about_text ? `<p class="os-about-text">${esc(__(cfg.about_text))}</p>` : ""}
			<dl class="os-about-meta">
				<dt>${esc(__("Version"))}</dt><dd>${esc(cfg.version || "")}</dd>
				<dt>${esc(__("Signed in as"))}</dt><dd>${esc(frappe.session.user)}</dd>
			</dl>
			${links.length ? `<p class="os-about-links">${links.join(" · ")}</p>` : ""}
			<p class="os-about-copy">© ${new Date().getFullYear()} ${esc(brand.name)}</p>
		</div>
	`);
	dialog.show();
}

mark_html();

if (window.frappe) {
	$(document).on("app_ready", () => {
		mark_html();
		brand_favicon();
	});
	if (frappe.after_ajax) frappe.after_ajax(brand_favicon);

	frappe.provide("frappe.ui.misc");
	frappe.ui.misc.about = about;
	frappe.provide("onespace");
	onespace.about = about;
}
