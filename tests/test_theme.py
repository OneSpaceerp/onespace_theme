"""
OneSpace Theme Layer — Automated Test Suite
Verifies asset integrity, token coverage, and hooks.py configuration.
"""

import os
import sys
import unittest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class TestOneSpaceTheme(unittest.TestCase):

    def setUp(self):
        self.app_dir = os.path.join(BASE_DIR, "onespace")

    def test_core_directories_exist(self):
        """Ensure all required custom app directories exist."""
        required_dirs = [
            os.path.join(self.app_dir, "public", "css"),
            os.path.join(self.app_dir, "public", "js"),
            os.path.join(self.app_dir, "public", "images"),
            os.path.join(self.app_dir, "public", "icons"),
            os.path.join(self.app_dir, "templates", "includes", "login"),
            os.path.join(self.app_dir, "templates", "pages"),
            os.path.join(self.app_dir, "setup"),
        ]
        for d in required_dirs:
            self.assertTrue(os.path.isdir(d), f"Missing required directory: {d}")

    def test_css_assets_exist(self):
        """Verify all stylesheet files exist and are non-empty."""
        css_files = [
            "tokens.css",
            "icons.css",
            "onespace.css",
            "onespace-dark.css",
            "login.css",
            "onespace-web.css",
        ]
        for f in css_files:
            path = os.path.join(self.app_dir, "public", "css", f)
            self.assertTrue(os.path.isfile(path), f"Missing CSS file: {f}")
            self.assertGreater(os.path.getsize(path), 100, f"CSS file {f} is unexpectedly empty")

    def test_js_assets_exist(self):
        """Verify all JavaScript runtime files exist and are non-empty."""
        js_files = [
            "theme_switcher.js",
            "icons.js",
            "about_override.js",
            "app_launcher.js",
            "onespace.js",
        ]
        for f in js_files:
            path = os.path.join(self.app_dir, "public", "js", f)
            self.assertTrue(os.path.isfile(path), f"Missing JS file: {f}")
            self.assertGreater(os.path.getsize(path), 100, f"JS file {f} is unexpectedly empty")

    def test_image_and_icon_assets(self):
        """Verify all brand logos, vector emblems, and icon sprites exist."""
        assets = [
            os.path.join("public", "images", "onespace_light.png"),
            os.path.join("public", "images", "onespace_dark.png"),
            os.path.join("public", "images", "onespace_icon.svg"),
            os.path.join("public", "images", "favicon.svg"),
            os.path.join("public", "icons", "onespace-icons.svg"),
        ]
        for a in assets:
            path = os.path.join(self.app_dir, a)
            self.assertTrue(os.path.isfile(path), f"Missing asset: {a}")

    def test_templates_exist(self):
        """Verify all white-label templates exist."""
        templates = [
            os.path.join("templates", "includes", "login", "login.html"),
            os.path.join("templates", "pages", "open_source_notices.html"),
            os.path.join("templates", "pages", "404.html"),
            os.path.join("templates", "pages", "500.html"),
        ]
        for t in templates:
            path = os.path.join(self.app_dir, t)
            self.assertTrue(os.path.isfile(path), f"Missing template: {t}")

    def test_hooks_configuration(self):
        """Verify hooks.py is syntactically valid and defines key extension points."""
        hooks_path = os.path.join(self.app_dir, "hooks.py")
        self.assertTrue(os.path.isfile(hooks_path), "Missing hooks.py")

        # Execute hooks.py in a clean namespace
        hooks_namespace = {}
        with open(hooks_path, "r", encoding="utf-8") as f:
            exec(f.read(), hooks_namespace)

        self.assertEqual(hooks_namespace.get("app_name"), "onespace")
        self.assertEqual(hooks_namespace.get("app_title"), "OneSpace")
        self.assertIn("app_include_css", hooks_namespace)
        self.assertIn("app_include_js", hooks_namespace)
        self.assertIn("website_context", hooks_namespace)
        self.assertIn("after_install", hooks_namespace)

    def test_tokens_css_content(self):
        """Verify that tokens.css defines the canonical OneSpace Kinetic Orange."""
        tokens_path = os.path.join(self.app_dir, "public", "css", "tokens.css")
        with open(tokens_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("#FF3700", content, "Kinetic Orange #FF3700 missing in tokens.css")
        self.assertIn("Plus Jakarta Sans", content, "Display font Plus Jakarta Sans missing in tokens.css")
        self.assertIn("Manrope", content, "Body font Manrope missing in tokens.css")

if __name__ == "__main__":
    unittest.main()
