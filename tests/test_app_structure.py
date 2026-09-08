"""Structural checks that need no running site.

These exist because a missing file broke `bench migrate` on a live server:
OneSpace Theme Language had a .json and an __init__.py but no controller
module, and Frappe aborts the whole schema sync when it cannot import one.

Every assertion here maps to a specific way a Frappe app fails at migrate time
rather than at import time — the failures that only surface on the bench, which
is the expensive place to find them.

Run with:  python -m pytest tests/test_app_structure.py -q
       or: python tests/test_app_structure.py
"""

import json
import re
from pathlib import Path

APP = Path(__file__).resolve().parent.parent / "onespace"
DOCTYPE_ROOT = APP / "onespace" / "doctype"


def doctype_dirs():
    if not DOCTYPE_ROOT.is_dir():
        return []
    return [d for d in sorted(DOCTYPE_ROOT.iterdir()) if d.is_dir() and not d.name.startswith("_")]


def test_every_doctype_has_its_three_files():
    """json + __init__.py + controller, all named after the folder."""
    missing = []
    for d in doctype_dirs():
        for required in (f"{d.name}.json", "__init__.py", f"{d.name}.py"):
            if not (d / required).is_file():
                missing.append(f"{d.name}/{required}")
    assert not missing, "Missing DocType files (bench migrate will abort): " + ", ".join(missing)


def test_controller_class_name_matches_doctype():
    """Frappe derives the class name from the DocType name with spaces removed."""
    problems = []
    for d in doctype_dirs():
        controller = d / f"{d.name}.py"
        # A missing file is test_every_doctype_has_its_three_files's failure to
        # report. Reading it here would crash with a traceback and bury the
        # actual diagnosis.
        if not controller.is_file():
            continue
        meta = json.loads((d / f"{d.name}.json").read_text(encoding="utf-8"))
        expected = meta["name"].replace(" ", "").replace("-", "")
        source = controller.read_text(encoding="utf-8")
        if not re.search(rf"class\s+{re.escape(expected)}\s*\(", source):
            problems.append(f"{d.name}: expected `class {expected}(Document)`")
    assert not problems, "; ".join(problems)


def test_doctype_json_folder_and_module_agree():
    """The folder must be the scrubbed DocType name, and the module must exist."""
    modules = {
        m.strip()
        for m in (APP / "modules.txt").read_text(encoding="utf-8").splitlines()
        if m.strip()
    }
    problems = []
    for d in doctype_dirs():
        meta = json.loads((d / f"{d.name}.json").read_text(encoding="utf-8"))
        scrubbed = meta["name"].lower().replace(" ", "_").replace("-", "_")
        if scrubbed != d.name:
            problems.append(f"{d.name}: folder should be `{scrubbed}` for DocType '{meta['name']}'")
        if meta.get("module") not in modules:
            problems.append(f"{d.name}: module '{meta.get('module')}' not in modules.txt {sorted(modules)}")
    assert not problems, "; ".join(problems)


def test_link_fields_declare_a_target():
    """A Link field with no options is a silent broken reference in the UI."""
    problems = []
    for d in doctype_dirs():
        meta = json.loads((d / f"{d.name}.json").read_text(encoding="utf-8"))
        for f in meta.get("fields", []):
            if f.get("fieldtype") in ("Link", "Table", "Table MultiSelect") and not f.get("options"):
                problems.append(f"{d.name}.{f.get('fieldname')} ({f.get('fieldtype')}) has no options")
    assert not problems, "; ".join(problems)


def test_hooked_assets_exist_on_disk():
    """hooks.py must not reference an asset that was renamed or deleted."""
    hooks = (APP / "hooks.py").read_text(encoding="utf-8")
    problems = []
    for path in set(re.findall(r"/assets/onespace/([A-Za-z0-9_./-]+)", hooks)):
        if not (APP / "public" / path).is_file():
            problems.append(f"hooks.py references missing asset: {path}")
    assert not problems, "; ".join(problems)


def test_scss_font_urls_resolve():
    """@font-face must point at files that are actually committed."""
    scss = (APP / "public" / "scss" / "_typography.scss").read_text(encoding="utf-8")
    problems = []
    for name in set(re.findall(r"\$os-font-path\}/([A-Za-z0-9_.-]+\.woff2)", scss)):
        if not (APP / "public" / "fonts" / name).is_file():
            problems.append(f"missing font: {name}")
    assert not problems, "; ".join(problems)


if __name__ == "__main__":
    failures = 0
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print(f"  PASS  {name}")
            except AssertionError as e:
                failures += 1
                print(f"  FAIL  {name}\n        {e}")
    print("\nOK" if not failures else f"\n{failures} failed")
    raise SystemExit(1 if failures else 0)
