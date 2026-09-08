"""Child row for the languages offered by the OneSpace Desk switcher.

Frappe loads a controller module for every DocType, child tables included, via
load_doctype_module(). A missing module is not a soft failure — it aborts
`bench migrate` partway through the schema sync:

    ImportError: Module import failed for OneSpace Theme Language
    No module named 'onespace.onespace.doctype.onespace_theme_language
                     .onespace_theme_language'

The class name is derived from the DocType name with spaces removed, so it must
stay OneSpaceThemeLanguage if the DocType is renamed.
"""

from frappe.model.document import Document


class OneSpaceThemeLanguage(Document):
	pass
