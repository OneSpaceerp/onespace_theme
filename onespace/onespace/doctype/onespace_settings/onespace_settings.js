frappe.ui.form.on("OneSpace Settings", {
	refresh(frm) {
		frm.add_custom_button(__("Open Launcher"), () => frappe.set_route("onespace-launcher"));
		frm.add_custom_button(__("Preview Sign-in"), () => window.open("/login", "_blank", "noopener"));
		frm.add_custom_button(__("Add Installed Apps"), () => add_installed_apps(frm), __("Apps"));

		frm.set_intro(
			__("Changes reach other users on their next page load. Reload this tab to see them yourself."),
			"blue"
		);
		preview_icons(frm);
	},

	app_icon_style(frm) {
		preview_icons(frm);
	},

	app_titles_remove(frm) {
		preview_icons(frm);
	},

	after_save() {
		frappe.show_alert({ message: __("OneSpace settings saved"), indicator: "green" });
	},
});

frappe.ui.form.on("OneSpace App Title", {
	app_name: (frm) => preview_icons(frm),
	title: (frm) => preview_icons(frm),
	glyph: (frm) => preview_icons(frm),
	hue: (frm) => preview_icons(frm),
});

function rows(frm) {
	return (frm.doc.app_titles || []).map((r) => ({
		app_name: r.app_name,
		title: r.title,
		glyph: r.glyph,
		hue: r.hue,
	}));
}

/* Every installed app as it will look, from the form's unsaved values -
   so a style or a glyph can be tried before it is saved. Debounced: typing
   a title should not fire a request per key. */
function preview_icons(frm) {
	const field = frm.get_field("app_icon_preview");
	if (!field) return;
	clearTimeout(frm.__os_preview_timer);
	frm.__os_preview_timer = setTimeout(() => {
		frappe
			.xcall("onespace.api.preview_app_icons", {
				style: frm.doc.app_icon_style,
				apps: JSON.stringify(rows(frm)),
			})
			.then((apps) => render_preview(field, apps || [], frm.doc.app_icon_style));
	}, 250);
}

function render_preview(field, apps, style) {
	const esc = (v) => frappe.utils.escape_html(v == null ? "" : String(v));
	if (style === "Original Logos") {
		field.$wrapper.html(
			`<p class="text-muted small">${esc(__("Each app keeps the logo its vendor ships."))}</p>`
		);
		return;
	}
	const tiles = apps
		.map(
			(a) => `
			<figure class="os-icon-preview-item" title="${esc(a.app_name)}">
				${a.logo ? `<img src="${esc(a.logo)}" alt="" width="56" height="56">` : ""}
				<figcaption>
					<strong>${esc(a.title)}</strong>
					<span>${esc(a.app_name)}${a.glyph ? " · " + esc(a.glyph) : ""}${a.hue ? " · " + esc(a.hue) : ""}</span>
				</figcaption>
			</figure>`
		)
		.join("");
	field.$wrapper.html(`
		<div class="os-icon-preview">
			<div class="os-icon-preview-head">${esc(__("How each installed app will look"))}</div>
			<div class="os-icon-preview-grid">${tiles}</div>
		</div>
	`);
}

/* One row per installed app that has none yet, with everything left empty:
   empty means "choose automatically", so adding the rows changes nothing
   until the admin picks something in them. */
function add_installed_apps(frm) {
	frappe.xcall("onespace.api.preview_app_icons", { style: frm.doc.app_icon_style }).then((apps) => {
		const have = new Set((frm.doc.app_titles || []).map((r) => (r.app_name || "").toLowerCase()));
		let added = 0;
		(apps || []).forEach((a) => {
			if (have.has(a.app_name)) return;
			frm.add_child("app_titles", { app_name: a.app_name });
			added++;
		});
		frm.refresh_field("app_titles");
		preview_icons(frm);
		frappe.show_alert({
			message: added ? __("Added {0} app(s)", [added]) : __("Every installed app is already listed"),
			indicator: added ? "green" : "blue",
		});
	});
}
