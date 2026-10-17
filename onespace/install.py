"""Install, migrate and uninstall.

All three are idempotent and none of them may abort the bench command that
runs them: a branding step that fails costs the site its look, never its
install or its migrate. The failure is in the Error Log either way.
"""

import frappe

from onespace.branding import apply_site_branding, restore_site_branding


def after_install() -> None:
	_safely(apply_site_branding, "apply the brand")
	# bench, new-site and hosted provisioners each commit at a different
	# point; the brand is the first thing every user sees, so make sure it
	# is written whichever drove the install.
	frappe.db.commit()  # nosemgrep: frappe-manual-commit


def after_migrate() -> None:
	# Frappe re-syncs its standard help items on migrate, which can bring a
	# hidden vendor link back. Re-applying is cheap and puts it away again.
	_safely(apply_site_branding, "re-apply the brand")


def before_uninstall() -> None:
	_safely(restore_site_branding, "restore the original site settings")


def _safely(fn, what: str) -> None:
	try:
		fn()
	except Exception:
		frappe.log_error(title=f"OneSpace: could not {what}")
