// Copyright (c) 2026, OneSpace ERP Systems. MIT License.

/**
 * OneSpace Launcher — the desk's home and apps view.
 *
 * Nothing on this page decides what a user may see:
 *  - the apps are frappe.boot.desktop_icons, which Frappe has already filtered
 *    by app permission, by workspace access and by the roles on each icon;
 *  - quick actions, recent documents and the weekly chart come from
 *    onespace.api.get_launcher_data, which reads every list through
 *    frappe.get_list and offers only what frappe.has_permission allows.
 *
 * Every control in the command bar is the desk's own, reached the way the
 * desk reaches it - search is Frappe's awesome bar, the bell is the sidebar's
 * bell, the avatar opens Frappe's user menu - so there is no second set of
 * permission rules to keep in step.
 */

frappe.pages["onespace-launcher"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Launcher"),
		single_column: true,
		// The grid is the navigation here: the module sidebar and the dock would
		// only repeat it. The same two switches Frappe's own Apps screen sets.
		hide_sidebar: true,
		hide_dock: true,
	});
	wrapper.onespace_launcher = new OneSpaceLauncher(page);
};

frappe.pages["onespace-launcher"].on_page_show = function (wrapper) {
	const launcher = wrapper.onespace_launcher;
	if (launcher) launcher.on_show();
};

/* Lucide-style glyphs for the page's own chrome. Inline rather than from the
   desk sprite: a name missing from the sprite draws an empty button, and the
   sprite's names have changed between Frappe releases. */
const OS_ICONS = {
	search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
	plus: '<path d="M12 5v14M5 12h14"/>',
	bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
	help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
	sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
	moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
	clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
	zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
	history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
	activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
	server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
	file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
	back: '<path d="m15 18-6-6 6-6"/>',
	filter: '<path d="M3 6h18M7 12h10M10 18h4"/>',
	arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
	grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
	refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
};

function os_icon(name, cls) {
	return `<svg class="os-ico ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
		stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${
			OS_ICONS[name] || ""
		}</svg>`;
}

/* What a tile is, read from its label. The design gives every app its own
   coloured chip and a one-line description; the desk carries neither, so they
   are matched by keyword. An app nothing matches still gets a hue (from a hash
   of its label, so it keeps that colour between visits) and no category. */
const OS_APP_KINDS = [
	{ re: /health|clinic|hospital|patient|medical/i, hue: "cyan", sub: __("Patients & Clinics"), cat: "tools" },
	{ re: /\blms\b|learning|course|training|education|school/i, hue: "indigo", sub: __("Courses & Learning"), cat: "tools" },
	{ re: /itsm|service desk/i, hue: "blue", sub: __("Service Desk"), cat: "tools" },
	{ re: /cheque|check|payment|treasury|bank|lending|loan/i, hue: "emerald", sub: __("Payments & Banking"), cat: "finance" },
	{ re: /installment|instalment|expense/i, hue: "gold", sub: __("Installments & Billing"), cat: "finance" },
	{ re: /contract|agreement|compliance|zatca|e-?invoice/i, hue: "emerald", sub: __("Contracts & Compliance"), cat: "finance" },
	{ re: /trip|travel/i, hue: "sky", sub: __("Trips & Travel"), cat: "finance" },
	{ re: /career|recruit|job/i, hue: "indigo", sub: __("Jobs & Hiring"), cat: "finance" },
	{ re: /\bcrm\b|lead|opportunit|deal/i, hue: "teal", sub: __("Deals & Leads"), cat: "sales" },
	{ re: /point of sale|\bpos\b|retail/i, hue: "amber", sub: __("Retail Terminal"), cat: "sales" },
	{ re: /sell|sales/i, hue: "orange", sub: __("Orders & Quotes"), cat: "sales" },
	{ re: /buy|purchas|procure/i, hue: "violet", sub: __("Procurement"), cat: "supply" },
	{ re: /stock|inventory|warehouse/i, hue: "gold", sub: __("Inventory & Batch"), cat: "supply" },
	{ re: /manufactur|production|\bbom\b/i, hue: "indigo", sub: __("BOM & Production"), cat: "supply" },
	{ re: /subcontract/i, hue: "violet", sub: __("Job Work"), cat: "supply" },
	{ re: /quality/i, hue: "cyan", sub: __("Inspections & Goals"), cat: "supply" },
	{ re: /asset/i, hue: "emerald", sub: __("Asset Register"), cat: "finance" },
	{ re: /account|financ|ledger|invoic|bank|tax|budget/i, hue: "emerald", sub: __("General Ledger"), cat: "finance" },
	{ re: /payroll|salary/i, hue: "pink", sub: __("Salaries & Payslips"), cat: "finance" },
	{ re: /\bhr\b|human|employee|people|leave|attendance|recruit/i, hue: "pink", sub: __("HR & Payroll"), cat: "finance" },
	{ re: /project|task|timesheet/i, hue: "green", sub: __("Tasks & Timesheets"), cat: "tools" },
	{ re: /support|helpdesk|issue|ticket/i, hue: "blue", sub: __("Support Queue"), cat: "tools" },
	{ re: /website|portal|builder|blog/i, hue: "sky", sub: __("Web & Portal"), cat: "tools" },
	{ re: /setting|setup|system|framework|platform|integration|tool|build|user|data|automation|print|email/i, hue: "slate", sub: __("System Engine"), cat: "tools" },
];
/* The modules Frappe 16, ERPNext 16 and Frappe HR 16 ship, by name: what each
   one is for, and which tab it lives under. */
const OS_MODULES = {
	// ERPNext
	"accounts setup": { sub: __("Chart & Fiscal Setup"), cat: "finance", hue: "emerald" },
	"account setup": { sub: __("Chart & Fiscal Setup"), cat: "finance", hue: "emerald" },
	accounting: { sub: __("General Ledger"), cat: "finance", hue: "emerald" },
	accounts: { sub: __("General Ledger"), cat: "finance", hue: "emerald" },
	assets: { sub: __("Asset Register"), cat: "finance", hue: "emerald" },
	banking: { sub: __("Bank & Reconciliation"), cat: "finance", hue: "emerald" },
	budget: { sub: __("Budgets & Variance"), cat: "finance", hue: "gold" },
	buying: { sub: __("Procurement"), cat: "supply", hue: "violet" },
	crm: { sub: __("Deals & Leads"), cat: "sales", hue: "teal" },
	"erpnext settings": { sub: __("System Defaults"), cat: "tools", hue: "slate" },
	"financial reports": { sub: __("Statements & Ledgers"), cat: "finance", hue: "emerald" },
	invoicing: { sub: __("Sales & Purchase Invoices"), cat: "finance", hue: "gold" },
	manufacturing: { sub: __("BOM & Production"), cat: "supply", hue: "indigo" },
	organization: { sub: __("Company & Branches"), cat: "tools", hue: "slate" },
	payments: { sub: __("Receipts & Payments"), cat: "finance", hue: "emerald" },
	projects: { sub: __("Tasks & Timesheets"), cat: "tools", hue: "green" },
	quality: { sub: __("Inspections & Goals"), cat: "supply", hue: "cyan" },
	selling: { sub: __("Orders & Quotes"), cat: "sales", hue: "orange" },
	"share management": { sub: __("Shareholders & Transfers"), cat: "finance", hue: "gold" },
	stock: { sub: __("Inventory & Batch"), cat: "supply", hue: "gold" },
	subcontracting: { sub: __("Job Work"), cat: "supply", hue: "violet" },
	subscription: { sub: __("Recurring Billing"), cat: "finance", hue: "gold" },
	support: { sub: __("Support Queue"), cat: "sales", hue: "blue" },
	taxes: { sub: __("Tax Rules & Templates"), cat: "finance", hue: "emerald" },
	"point of sale": { sub: __("Retail Terminal"), cat: "sales", hue: "amber" },
	// Frappe HR
	expenses: { sub: __("Claims & Advances"), cat: "finance", hue: "gold" },
	"hr setup": { sub: __("HR Defaults"), cat: "finance", hue: "pink" },
	leaves: { sub: __("Leave Management"), cat: "finance", hue: "pink" },
	payroll: { sub: __("Salaries & Payslips"), cat: "finance", hue: "pink" },
	performance: { sub: __("Appraisals & Goals"), cat: "finance", hue: "pink" },
	recruitment: { sub: __("Jobs & Hiring"), cat: "finance", hue: "pink" },
	"shift & attendance": { sub: __("Shifts & Check-ins"), cat: "finance", hue: "pink" },
	"tax & benefits": { sub: __("Exemptions & Benefits"), cat: "finance", hue: "pink" },
	tenure: { sub: __("Onboarding & Exits"), cat: "finance", hue: "pink" },
	// The framework
	automation: { sub: __("Rules & Assignments"), cat: "tools", hue: "slate" },
	build: { sub: __("DocTypes & Scripts"), cat: "tools", hue: "slate" },
	data: { sub: __("Import & Export"), cat: "tools", hue: "slate" },
	email: { sub: __("Accounts & Templates"), cat: "tools", hue: "slate" },
	integrations: { sub: __("Connectors & APIs"), cat: "tools", hue: "slate" },
	printing: { sub: __("Print Formats"), cat: "tools", hue: "slate" },
	system: { sub: __("Settings & Logs"), cat: "tools", hue: "slate" },
	users: { sub: __("Users & Roles"), cat: "tools", hue: "slate" },
	website: { sub: __("Pages & Portal"), cat: "tools", hue: "slate" },
};

/* A tab for whatever an app's modules are not named in OS_MODULES. */
const OS_APP_CATEGORY = {
	frappe: "tools",
	onespace: "tools",
	hrms: "finance",
	payroll: "finance",
	lending: "finance",
	crm: "sales",
	helpdesk: "sales",
};

const OS_HUES = ["teal", "orange", "violet", "gold", "emerald", "pink", "indigo", "green", "amber", "cyan", "blue", "slate"];
const OS_TABS = [
	{ key: "all", label: __("All Apps") },
	{ key: "sales", label: __("Sales & CRM") },
	{ key: "supply", label: __("Supply Chain") },
	{ key: "finance", label: __("Finance & HR") },
	{ key: "tools", label: __("Tools") },
];

class OneSpaceLauncher {
	constructor(page) {
		this.page = page;
		this.cfg = (frappe.boot && frappe.boot.onespace) || {};
		this.brand = this.cfg.brand || { name: "OneSpace" };
		this.tab = "all";
		this.query = "";
		this.parent_key = null;
		this.data = {};
		this.loaded_at = 0;

		this.$root = $('<div class="os-launcher"></div>').appendTo(page.main);
		this.render_shell();
		this.render_command_bar();
		this.render_hero();
		this.render_apps();
		this.load();
	}

	on_show() {
		this.update_mode_button();
		this.paint_unread();
		if (Date.now() - this.loaded_at > 60 * 1000) this.load();
	}

	esc(value) {
		return frappe.utils.escape_html(value == null ? "" : String(value));
	}

	render_shell() {
		this.$root.html(`
			<header class="os-cmdbar"></header>
			<section class="os-hero"></section>
			<section class="os-apps-card">
				<div class="os-filterbar">
					<label class="os-filter">
						${os_icon("filter")}
						<input type="search" class="os-filter-input" autocomplete="off"
							placeholder="${this.esc(__("Filter apps (e.g. Selling, Stock, Accounts)…"))}"
							aria-label="${this.esc(__("Filter apps"))}">
					</label>
					<div class="os-tabs" role="tablist"></div>
				</div>
				<div class="os-apps"></div>
			</section>
			<section class="os-panels">
				<div class="os-col-main">
					<div class="os-card os-quick" hidden></div>
					<div class="os-card os-activity" hidden></div>
				</div>
				<div class="os-col-side">
					<div class="os-card os-recent" hidden></div>
					<div class="os-card os-health" hidden></div>
				</div>
			</section>
		`);
		this.$apps = this.$root.find(".os-apps");
		this.$tabs = this.$root.find(".os-tabs");
		this.$root.find(".os-filter-input").on("input", (e) => {
			this.query = (e.target.value || "").trim().toLowerCase();
			this.render_apps();
		});
	}

	/* ---------------- command bar ---------------- */

	render_command_bar() {
		const mac = frappe.utils.is_mac && frappe.utils.is_mac();
		const kbd = mac ? "⌘K" : "Ctrl+K";
		const $bar = this.$root.find(".os-cmdbar");
		$bar.html(`
			<button type="button" class="os-search" aria-label="${this.esc(__("Search"))}">
				${os_icon("search")}
				<span class="os-search-text">${this.esc(__("Search in {0}…", [this.brand.name]))}</span>
				<kbd>${kbd}</kbd>
			</button>
			<div class="os-cmd-actions">
				<div class="os-create-wrap">
					<button type="button" class="os-btn os-btn-primary os-create" aria-haspopup="menu" aria-expanded="false">
						${os_icon("plus")}<span>${__("Create")}</span>
					</button>
					<div class="os-menu os-create-menu" role="menu" hidden></div>
				</div>
				<span class="os-divider" aria-hidden="true"></span>
				<button type="button" class="os-chip os-mode"></button>
				<button type="button" class="os-icon-btn os-bell" aria-label="${this.esc(__("Notifications"))}">
					${os_icon("bell")}<span class="os-dot" hidden></span>
				</button>
				<button type="button" class="os-icon-btn os-help" aria-label="${this.esc(__("About"))}">
					${os_icon("help")}
				</button>
				<button type="button" class="os-user" aria-label="${this.esc(__("User Menu"))}"></button>
			</div>
		`);

		$bar.find(".os-search").on("click", () => this.open_search());
		this.setup_create($bar);
		$bar.find(".os-mode").on("click", () => this.toggle_mode());
		this.update_mode_button();

		$bar.find(".os-bell").on("click", (e) => {
			// Frappe closes its notification panel on any document click whose
			// target is not its own bell; forward the click to that bell and keep
			// ours from reaching the document.
			e.stopPropagation();
			const own = document.querySelector(".body-sidebar .sidebar-notification");
			if (own) own.click();
			else frappe.set_route("List", "Notification Log");
		});
		this.paint_unread();
		if (frappe.realtime && frappe.realtime.on) {
			frappe.realtime.on("notification", () => this.paint_unread(true));
		}

		$bar.find(".os-help").on("click", () => {
			if (frappe.ui.misc && frappe.ui.misc.about) frappe.ui.misc.about();
		});

		this.render_user($bar.find(".os-user"));
	}

	open_search(prefill) {
		const bar = frappe.app && frappe.app.awesome_bar;
		const btn = document.querySelector("#navbar-modal-search, .navbar-modal-search-mobile");
		if (bar && typeof bar.open === "function") bar.open();
		else if (btn) btn.click();
		else return;
		if (!prefill) return;
		setTimeout(() => {
			const input = document.querySelector("#navbar-search");
			if (!input) return;
			input.value = prefill;
			$(input).trigger("input").trigger("keyup");
		}, 80);
	}

	setup_create($bar) {
		const $btn = $bar.find(".os-create");
		const $menu = $bar.find(".os-create-menu");
		const close = () => {
			$menu.attr("hidden", true);
			$btn.attr("aria-expanded", "false");
		};
		$btn.on("click", (e) => {
			e.stopPropagation();
			const opening = $menu.is("[hidden]");
			if (!opening) return close();
			this.fill_create_menu($menu, close);
			$menu.removeAttr("hidden");
			$btn.attr("aria-expanded", "true");
			$menu.find("button").first().trigger("focus");
		});
		$(document).on("click.os-create", (e) => {
			if (!$(e.target).closest(".os-create-wrap").length) close();
		});
		$menu.on("keydown", (e) => {
			if (e.key === "Escape") {
				close();
				$btn.trigger("focus");
			}
		});
	}

	fill_create_menu($menu, close) {
		const actions = this.data.quick_actions || [];
		$menu.empty();
		actions.forEach((a) => {
			$(`<button type="button" role="menuitem" class="os-menu-item">
				${os_icon("plus")}<span>${this.esc(a.label)}</span>
				<small>${this.esc(a.module)}</small>
			</button>`)
				.on("click", () => {
					close();
					frappe.new_doc(a.doctype);
				})
				.appendTo($menu);
		});
		// Anything else this user may create: Frappe's own palette lists
		// exactly the DocTypes they have create rights on.
		$(`<button type="button" role="menuitem" class="os-menu-item os-menu-more">
			${os_icon("search")}<span>${this.esc(__("Create something else…"))}</span>
		</button>`)
			.on("click", () => {
				close();
				this.open_search(__("New") + " ");
			})
			.appendTo($menu);
	}

	current_mode() {
		return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
	}

	update_mode_button() {
		const dark = this.current_mode() === "dark";
		this.$root
			.find(".os-mode")
			.html(`${os_icon(dark ? "moon" : "sun")}<span>${dark ? __("Dark") : __("Light")}</span>`)
			.attr("aria-label", dark ? __("Switch to light mode") : __("Switch to dark mode"));
	}

	/* The same switch Frappe's own Toggle Theme dialog makes: saved on the
	   user, then applied to the page. Automatic users become explicit by
	   clicking this; Frappe's dialog is still there to go back. */
	toggle_mode() {
		const next = this.current_mode() === "dark" ? "Light" : "Dark";
		frappe
			.xcall("frappe.core.doctype.user.user.switch_theme", { theme: next })
			.then(() => {
				if (frappe.ui.set_theme) frappe.ui.set_theme(next.toLowerCase());
				else document.documentElement.setAttribute("data-theme", next.toLowerCase());
				document.documentElement.setAttribute("data-theme-mode", next.toLowerCase());
				if (frappe.boot) frappe.boot.desk_theme = next;
				this.update_mode_button();
				if (this.data.activity) this.render_activity(this.data.activity);
			})
			.catch(() => {
				if (frappe.ui.ThemeSwitcher) new frappe.ui.ThemeSwitcher().show();
			});
	}

	paint_unread(bump) {
		let n = cint((frappe.boot && frappe.boot.notification_unread_count) || 0);
		if (bump) n = Math.max(n, 1);
		this.$root.find(".os-bell .os-dot").attr("hidden", n > 0 ? null : true);
	}

	render_user($btn) {
		const user = frappe.session.user;
		const full = frappe.session.user_fullname || (frappe.boot.user && frappe.boot.user.full_name) || user;
		const roles = frappe.user_roles || [];
		const role = user === "Administrator" ? __("Administrator") : roles.includes("System Manager") ? __("System Manager") : __("User");
		$btn.html(`
			${frappe.avatar(user, "avatar-medium")}
			<span class="os-user-text">
				<span class="os-user-name">${this.esc(full)}</span>
				<span class="os-user-role">${this.esc(role)}</span>
			</span>
		`);
		// Frappe 16.50+ builds its user menu in one place for the sidebar and
		// the dock; reuse it so Settings, Reload and Logout are exactly Frappe's.
		const sidebar = frappe.app && frappe.app.sidebar;
		if (sidebar && typeof sidebar.create_user_menu === "function") {
			try {
				sidebar.create_user_menu({ parent: $btn, button: $btn, side: "bottom", align: "end" });
				return;
			} catch (e) {
				/* fall through to the plain menu */
			}
		}
		$btn.on("click", () => frappe.set_route("Form", "User", user));
	}

	/* ---------------- hero ---------------- */

	render_hero() {
		const hour = new Date().getHours();
		const greet = hour < 12 ? __("Good morning") : hour < 17 ? __("Good afternoon") : __("Good evening");
		const full = frappe.session.user_fullname || (frappe.boot.user && frappe.boot.user.full_name) || "";
		const first = (full || frappe.session.user).split(/\s+/)[0];
		const count = this.tiles().length;
		this.$root.find(".os-hero").html(`
			<div class="os-hero-text">
				<div class="os-eyebrow">
					<span class="os-eyebrow-pill">${this.esc(this.brand.name)}</span>
					<span class="os-eyebrow-meta os-company"></span>
				</div>
				<h1 class="os-hero-title">${this.esc(greet)}, ${this.esc(first)}<span class="os-hero-hq"> | ${this.esc(
			this.brand.tagline || this.brand.name
		)}</span></h1>
				<p class="os-hero-sub">${this.esc(
					count === 1 ? __("1 application ready.") : __("{0} applications ready.", [count])
				)}</p>
			</div>
			<div class="os-hero-meta">
				<div class="os-clock">${os_icon("clock")}<div><strong class="os-clock-time"></strong><span class="os-clock-date"></span></div></div>
			</div>
		`);
		this.tick();
		if (!this._clock) this._clock = setInterval(() => this.tick(), 30 * 1000);
	}

	tick() {
		const now = new Date();
		const lang = frappe.boot.lang || undefined;
		try {
			this.$root.find(".os-clock-time").text(now.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" }));
			this.$root
				.find(".os-clock-date")
				.text(now.toLocaleDateString(lang, { weekday: "long", day: "numeric", month: "short" }));
		} catch (e) {
			this.$root.find(".os-clock-time").text(now.toTimeString().slice(0, 5));
		}
	}

	/* ---------------- apps ----------------

	   The grid is built from what Frappe 16 already resolved for this user, in
	   whichever of its two desktop modes the site runs (Desktop Settings ->
	   Desktop Page):

	   * Apps (the default since 16.50): boot.module_sidebars - every module
	     shell this user may open, permission-filtered by Frappe - grouped by
	     their app in the order of the apps screen (app_data, sequence_id).
	     A desk app's modules are tiles of their own; an app with its own UI
	     outside the desk (Helpdesk, CRM, Insights) is one tile into that UI;
	     the framework's own modules sit together in one folder.
	   * Desktop Icons: boot.desktop_icons, in the user's saved Desktop Layout.

	   Every tile is drawn with the app's own 16.50 desktop icon when it ships
	   one (public/icons/desktop_icons/<solid|subtle>/<module>.svg, in the style
	   Desktop Settings -> Icon Style chose), then the OneSpace icon generated
	   for its app, then the module's glyph on a OneSpace tile. */

	tiles() {
		if (this._tiles) return this._tiles;
		const icons = (frappe.boot && frappe.boot.desktop_icons) || [];
		this._tiles = icons.length ? this.tiles_from_icons() : this.tiles_from_apps();
		return this._tiles;
	}

	/* The 16.50 icon an app ships for this label, if it ships one. */
	v16_icon(app, label) {
		if (!app || !label || !frappe.scrub) return null;
		const style = String((frappe.boot && frappe.boot.desktop_icon_style) || "Subtle").toLowerCase();
		const urls = ((frappe.boot && frappe.boot.desktop_icon_urls) || {})[app] || {};
		const rel = `assets/${app}/icons/desktop_icons/${style}/${frappe.scrub(label)}.svg`;
		return (urls[style] || []).includes(rel) ? "/" + rel : null;
	}

	app_logo(app) {
		const url = Array.isArray(app.app_logo_url) ? app.app_logo_url[0] : app.app_logo_url;
		return url || null;
	}

	module_tile(shell) {
		const sidebar = frappe.app && frappe.app.sidebar;
		const label = shell.label || shell.name;
		return {
			key: "m:" + shell.name,
			label,
			module: shell.module || shell.name,
			app: shell.app,
			glyph: shell.header_icon,
			icon_url: this.v16_icon(shell.app, label) || this.v16_icon(shell.app, shell.name),
			route: (sidebar && sidebar.module_landing_route && sidebar.module_landing_route(shell.name)) || null,
		};
	}

	app_tile(app, children) {
		const sidebar = frappe.app && frappe.app.sidebar;
		const logo = this.app_logo(app);
		return {
			key: "a:" + app.app_name,
			label: app.app_title || app.app_name,
			app: app.app_name,
			logo,
			generated: !!(logo && (logo.startsWith("data:image/svg") || logo === this.brand.icon)),
			route:
				(sidebar && sidebar.app_landing_route && sidebar.app_landing_route(app)) || app.app_route || "/desk",
			children: children && children.length ? children : null,
		};
	}

	tiles_from_apps() {
		const boot = frappe.boot || {};
		const sidebar = frappe.app && frappe.app.sidebar;
		const apps = (boot.app_data || []).slice().sort((a, b) => (a.sequence_id ?? 100) - (b.sequence_id ?? 100));
		const by_app = {};
		Object.values(boot.module_sidebars || {}).forEach((shell) => {
			(by_app[shell.app] = by_app[shell.app] || []).push(shell);
		});
		const names = [...new Set([...apps.map((a) => a.app_name), ...Object.keys(by_app)])];
		const out = [];

		names.forEach((name) => {
			const app = apps.find((a) => a.app_name === name) || { app_name: name, app_title: name };
			const modules = (by_app[name] || []).map((s) => this.module_tile(s)).filter((t) => t.route);
			const outside_desk =
				app.app_route && sidebar && sidebar.is_desk_route && !sidebar.is_desk_route(app.app_route);

			// OneSpace's own settings: one tile, for whoever may open them.
			if (name === "onespace") {
				if (modules.length) {
					out.push(
						Object.assign(this.app_tile(app), {
							logo: this.brand.icon,
							generated: true,
							route: "/desk/onespace-settings",
						})
					);
				}
				return;
			}
			if (outside_desk) {
				if (app.on_apps_screen !== false) out.push(this.app_tile(app));
				return;
			}
			if (!modules.length) return;
			// The framework's modules are administration; together they are one
			// folder rather than nine tiles among the business apps.
			if (name === "frappe") {
				out.push(this.app_tile(app, modules));
				return;
			}
			out.push(...modules);
		});
		return out;
	}

	/* Desktop Icons mode: the user's own Desktop Layout, merged against boot.
	   Boot is the permission filter, so a saved entry boot no longer offers is
	   dropped and anything boot gained since (a newly installed app) is
	   appended. */
	tiles_from_icons() {
		const boot = frappe.boot.desktop_icons || [];
		const layout = this.data.layout;
		let icons = boot;
		if (Array.isArray(layout) && layout.length) {
			const by_label = new Map(boot.map((i) => [i.label, i]));
			const seen = new Set();
			icons = [];
			layout.forEach((saved) => {
				const live = saved && by_label.get(saved.label);
				if (!live || seen.has(saved.label)) return;
				seen.add(saved.label);
				icons.push(Object.assign({}, live, { hidden: cint(saved.hidden) }));
			});
			boot.forEach((i) => {
				if (!seen.has(i.label)) icons.push(i);
			});
		}
		const hidden = new Set(icons.filter((i) => cint(i.hidden)).map((i) => i.label));
		const visible = icons.filter((i) => !cint(i.hidden));
		const to_tile = (icon) => {
			const own = icon.onespace_label || icon.label;
			const kids = visible.filter((i) => i.parent_icon === icon.label);
			const folder = kids.length > 0 || icon.icon_type === "Folder";
			return {
				key: "i:" + icon.label,
				label: icon.label,
				module: icon.module || own,
				app: icon.app,
				glyph: icon.icon,
				logo: icon.icon_image || icon.logo_url || null,
				generated: !!cint(icon.onespace_icon),
				icon_url: icon.icon_type === "Folder" ? null : this.v16_icon(icon.app, own),
				route: folder ? null : this.route_for(icon),
				children: folder ? kids.map(to_tile) : null,
			};
		};
		// Not simply "icons without a parent": Frappe hides the icon of the app the
		// desk belongs to and hangs its modules beneath it. A child whose parent is
		// hidden is a destination of its own, as the sidebar treats it.
		return visible.filter((i) => !i.parent_icon || hidden.has(i.parent_icon)).map(to_tile);
	}

	all_tiles() {
		const flat = [];
		this.tiles().forEach((t) => {
			if (t.children) flat.push(...t.children);
			else flat.push(t);
		});
		return flat;
	}

	/* What a tile is: its subtitle and its tab. Exact module names first - the
	   ones the framework, ERPNext and HR ship - then keywords, then its app. */
	kind_of(tile) {
		const exact =
			OS_MODULES[String(tile.module || "").toLowerCase()] || OS_MODULES[String(tile.label || "").toLowerCase()];
		const text = `${tile.label || ""} ${tile.module || ""} ${tile.app || ""}`;
		const kind = exact || OS_APP_KINDS.find((k) => k.re.test(text));
		let h = 0;
		const label = tile.label || "";
		for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
		return {
			hue: (kind && kind.hue) || OS_HUES[h % OS_HUES.length],
			sub: (kind && kind.sub) || "",
			cat: (exact && exact.cat) || OS_APP_CATEGORY[tile.app] || (kind && kind.cat) || null,
		};
	}

	render_tabs(items) {
		const counts = { all: items.length };
		items.forEach((i) => {
			const cat = this.kind_of(i).cat;
			if (cat) counts[cat] = (counts[cat] || 0) + 1;
		});
		if (this.tab !== "all" && !counts[this.tab]) this.tab = "all";
		this.$tabs.html(
			OS_TABS.filter((t) => counts[t.key])
				.map(
					(t) => `<button type="button" role="tab" class="os-tab${t.key === this.tab ? " is-active" : ""}"
						aria-selected="${t.key === this.tab}" data-tab="${t.key}">${this.esc(t.label)}</button>`
				)
				.join("")
		);
		this.$tabs.find(".os-tab").on("click", (e) => {
			this.tab = e.currentTarget.dataset.tab;
			this.render_apps();
		});
	}

	render_apps() {
		const q = this.query;
		const folder = this.parent_key && this.tiles().find((t) => t.key === this.parent_key);
		if (this.parent_key && !folder) this.parent_key = null;
		// A search looks inside folders too: a module should be findable by name
		// wherever it sits.
		const base = folder ? folder.children : q ? this.all_tiles() : this.tiles();
		this.render_tabs(base);
		const items = base.filter((tile) => {
			const kind = this.kind_of(tile);
			if (this.tab !== "all" && kind.cat !== this.tab) return false;
			if (!q) return true;
			return `${__(tile.label || "")} ${kind.sub}`.toLowerCase().includes(q);
		});

		this.$apps.empty();
		if (folder) {
			$(`<button type="button" class="os-back">${os_icon("back")}<span>${this.esc(__(folder.label))}</span></button>`)
				.on("click", () => {
					this.parent_key = null;
					this.render_apps();
				})
				.appendTo(this.$apps);
		}
		if (!items.length) {
			this.$apps.append(`<div class="os-empty">${this.esc(__("No apps match."))}</div>`);
			return;
		}

		const counts = this.data.module_counts || {};
		const $grid = $('<div class="os-grid" role="list"></div>').appendTo(this.$apps);
		items.forEach((tile) => {
			const kind = this.kind_of(tile);
			const is_folder = Array.isArray(tile.children);
			const badge = cint(counts[tile.module] || counts[tile.label] || 0);
			const sub = is_folder ? __("{0} apps", [tile.children.length]) : kind.sub;
			const route = is_folder ? "#" : tile.route || "#";
			const external = /^https?:\/\//i.test(route) && !route.startsWith(window.location.origin);
			const full_tile = !!(tile.icon_url || tile.generated);

			const $tile = $(`
				<a class="os-app" role="listitem" href="${this.esc(route)}"
					${external ? 'target="_blank" rel="noopener noreferrer"' : ""}>
					<span class="os-app-icon os-hue-${kind.hue}${full_tile ? " is-tile" : tile.logo ? " has-logo" : ""}">
						${this.icon_html(tile)}
						${badge ? `<span class="os-app-badge">${badge > 99 ? "99+" : badge}</span>` : ""}
					</span>
					<span class="os-app-label">${this.esc(__(tile.label || ""))}</span>
					${sub ? `<span class="os-app-sub">${this.esc(sub)}</span>` : ""}
				</a>
			`).appendTo($grid);
			$tile.attr("title", __(tile.label || ""));
			if (is_folder) {
				$tile.on("click", (e) => {
					e.preventDefault();
					this.parent_key = tile.key;
					this.render_apps();
					this.$apps[0].scrollIntoView({ block: "nearest", behavior: "smooth" });
				});
			}
		});
	}

	icon_html(tile) {
		const src = tile.icon_url || tile.logo;
		if (src) return `<img src="${this.esc(src)}" alt="" loading="lazy">`;
		if (tile.glyph && frappe.utils.icon) {
			return frappe.utils.icon(tile.glyph, "lg", "", "", "", true);
		}
		return `<span class="os-app-letter">${this.esc(__(tile.label || "?").charAt(0).toUpperCase())}</span>`;
	}

	/* Desktop Icons mode: where an icon goes, resolved as Frappe's own grid does. */
	route_for(icon) {
		if (icon.link_type === "External" && icon.link) return icon.link;
		const shell =
			frappe.utils.sidebar_for_module &&
			frappe.utils.sidebar_for_module(icon.module || icon.onespace_label || icon.label);
		const sidebar = frappe.app && frappe.app.sidebar;
		const landing = shell && sidebar && sidebar.module_landing_route && sidebar.module_landing_route(shell.name);
		if (landing) return landing;
		const first_link = frappe.utils.get_route_for_icon && frappe.utils.get_route_for_icon(icon);
		if (first_link) return first_link;
		if (icon.link) return icon.link;
		if (icon.link_to) return "/desk/" + frappe.router.slug(icon.link_to);
		return "#";
	}

	/* ---------------- data panels ---------------- */

	load(force) {
		return frappe
			.xcall("onespace.api.get_launcher_data", { refresh: force ? 1 : 0 })
			.then((data) => {
				this.data = data || {};
				this.loaded_at = Date.now();
				this._tiles = null; // re-merge against the saved layout
				this.render_hero();
				if (this.data.company) this.$root.find(".os-company").text(this.data.company);
				this.render_apps();
				this.render_quick(this.data.quick_actions);
				this.render_recent(this.data.recent);
				this.render_activity(this.data.activity);
				this.render_health(this.data.health);
			})
			.catch(() => {
				/* the grid is already drawn from boot; the panels just stay hidden */
			});
	}

	card_head(icon, title, aside) {
		return `<div class="os-card-head">
			<h2 class="os-card-title">${os_icon(icon, "os-card-ico")}${this.esc(title)}</h2>
			${aside || ""}
		</div>`;
	}

	render_quick(actions) {
		const $card = this.$root.find(".os-quick");
		if (!actions || !actions.length) return $card.attr("hidden", true);
		$card.removeAttr("hidden").html(
			this.card_head("zap", __("Quick Actions"), `<span class="os-card-kicker">${this.esc(__("Fast lane"))}</span>`) +
				`<div class="os-quick-grid"></div>`
		);
		const $grid = $card.find(".os-quick-grid");
		actions.forEach((a) => {
			$(`<button type="button" class="os-quick-item">
				<span class="os-quick-ico">${os_icon("plus")}</span>
				<span class="os-quick-label">${this.esc(a.label)}</span>
				<span class="os-quick-module">${this.esc(a.module)}</span>
			</button>`)
				.on("click", () => frappe.new_doc(a.doctype))
				.appendTo($grid);
		});
	}

	status_tone(status) {
		// Order matters: ERPNext's "To Deliver and Bill" is waiting on someone,
		// not done, even though it names a finished-sounding step.
		const s = String(status || "").toLowerCase();
		if (/overdue|cancel|reject|fail|lost|expired|return/.test(s)) return "danger";
		if (/draft/.test(s)) return "neutral";
		if (/^to |pending|unpaid|partly|hold|review|open|request|ordered|in progress/.test(s)) return "pending";
		if (/paid|complete|submitted|confirm|deliver|received|closed|approved|accepted|converted|active/.test(s))
			return "success";
		return "neutral";
	}

	render_recent(rows) {
		const $card = this.$root.find(".os-recent");
		if (!rows || !rows.length) return $card.attr("hidden", true);
		$card.removeAttr("hidden").html(this.card_head("history", __("Recent Documents")) + `<ul class="os-recent-list"></ul>`);
		const $list = $card.find(".os-recent-list");
		rows.forEach((r) => {
			const kind = this.kind_of({ label: r.doctype });
			const parts = [r.title || r.doctype_label];
			if (r.amount && typeof format_currency === "function") parts.push(format_currency(r.amount, r.currency));
			const $li = $(`
				<li>
					<a class="os-recent-row" href="#">
						<span class="os-recent-ico os-tone-${kind.hue}">${os_icon("file")}</span>
						<span class="os-recent-text">
							<strong>${this.esc(r.name)}</strong>
							<span>${parts.map((p) => this.esc(p)).join(" · ")}</span>
						</span>
						<span class="os-pill os-pill-${this.status_tone(r.status)}">${this.esc(__(r.status))}</span>
					</a>
				</li>
			`).appendTo($list);
			$li.find("a").on("click", (e) => {
				e.preventDefault();
				frappe.set_route("Form", r.doctype, r.name);
			});
		});
	}

	render_activity(activity) {
		const $card = this.$root.find(".os-activity");
		if (!activity || !activity.days || !activity.days.length) return $card.attr("hidden", true);
		const change = activity.change;
		const trend =
			change === null || change === undefined
				? ""
				: `<span class="os-pill ${change >= 0 ? "os-pill-success" : "os-pill-danger"}">${change >= 0 ? "+" : ""}${this.esc(
						change
				  )}% ${this.esc(__("vs last week"))}</span>`;
		$card.removeAttr("hidden").html(
			this.card_head("activity", __("Weekly Transaction Momentum"), trend) +
				`<p class="os-card-sub">${this.esc(
					__("{0} documents created in the last 7 days", [activity.total || 0])
				)}</p><div class="os-chart"></div>`
		);
		$card.find(".os-chart").html(this.chart_svg(activity));
	}

	/* A smooth area chart in plain SVG: seven points through a Catmull-Rom
	   spline. Small enough not to need a charting library, and drawn in the
	   theme's own colours so it follows light and dark. */
	chart_svg(activity) {
		const W = 640,
			H = 200,
			PAD = 16,
			BASE = H - 28;
		const counts = activity.counts.map((n) => cint(n));
		const max = Math.max(1, ...counts);
		const step = (W - PAD * 2) / Math.max(1, counts.length - 1);
		const pts = counts.map((n, i) => [PAD + i * step, BASE - (n / max) * (BASE - PAD * 2)]);
		const path = pts.reduce((d, p, i, a) => {
			if (!i) return `M${p[0]},${p[1]}`;
			const p0 = a[i - 2] || a[i - 1],
				p1 = a[i - 1],
				p3 = a[i + 1] || p;
			const c1 = [p1[0] + (p[0] - p0[0]) / 6, p1[1] + (p[1] - p0[1]) / 6];
			const c2 = [p[0] - (p3[0] - p1[0]) / 6, p[1] - (p3[1] - p1[1]) / 6];
			return `${d} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p[0]},${p[1]}`;
		}, "");
		const area = `${path} L${pts[pts.length - 1][0]},${BASE} L${pts[0][0]},${BASE} Z`;
		const lang = frappe.boot.lang || undefined;
		const labels = activity.days.map((d, i) => {
			if (i === activity.days.length - 1) return __("Today");
			try {
				return new Date(`${d}T12:00:00`).toLocaleDateString(lang, { weekday: "short" });
			} catch (e) {
				return d.slice(5);
			}
		});
		const dots = pts
			.map(
				(p, i) =>
					`<circle class="os-chart-dot" cx="${p[0]}" cy="${p[1]}" r="4"><title>${this.esc(labels[i])}: ${counts[i]}</title></circle>`
			)
			.join("");
		const ticks = pts
			.map(
				(p, i) =>
					`<text class="os-chart-label${i === pts.length - 1 ? " is-today" : ""}" x="${p[0]}" y="${H - 6}" text-anchor="${
						i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle"
					}">${this.esc(labels[i])}</text>`
			)
			.join("");
		return `<svg viewBox="0 0 ${W} ${H}" class="os-chart-svg" role="img"
			aria-label="${this.esc(__("Documents created per day, last 7 days"))}" preserveAspectRatio="none">
			<defs><linearGradient id="os-area" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="currentColor" stop-opacity="0.22"/>
				<stop offset="1" stop-color="currentColor" stop-opacity="0"/>
			</linearGradient></defs>
			<path class="os-chart-area" d="${area}" fill="url(#os-area)"/>
			<path class="os-chart-line" d="${path}" fill="none"/>
			${dots}${ticks}
		</svg>`;
	}

	render_health(health) {
		const $card = this.$root.find(".os-health");
		if (!health) return $card.attr("hidden", true);
		const row = (label, value, tone) =>
			`<div class="os-health-row"><span>${this.esc(label)}</span><span class="os-pill os-pill-${tone}">${this.esc(value)}</span></div>`;
		$card.removeAttr("hidden").html(
			this.card_head(
				"server",
				__("System Health"),
				`<span class="os-card-kicker">${this.esc(this.brand.name)} v${this.esc(health.version)}</span>`
			) +
				row(
					__("Background scheduler"),
					health.scheduler_active ? __("Running") : __("Paused"),
					health.scheduler_active ? "success" : "danger"
				) +
				row(__("Emails waiting to send"), health.email_queue, health.email_queue > 50 ? "pending" : "neutral") +
				row(__("Errors in the last 24 hours"), health.errors_24h, health.errors_24h ? "danger" : "success") +
				`<a class="os-card-link" href="/desk/error-log">${this.esc(__("Open Error Log"))}${os_icon("arrow")}</a>`
		);
	}
}
