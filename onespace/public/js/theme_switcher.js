/**
 * OneSpace ERP Systems v16 — Theme Switcher
 * Supports Light, Dark, and System modes with instant live switching
 */

(function() {
  'use strict';

  window.OneSpace = window.OneSpace || {};

  const STORAGE_KEY = 'onespace_theme';

  OneSpace.getTheme = function() {
    return localStorage.getItem(STORAGE_KEY) || 'light';
  };

  OneSpace.setTheme = function(theme) {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem(STORAGE_KEY, theme);

    // Trigger Frappe theme change event if available
    if (window.frappe && frappe.ui && frappe.ui.set_theme) {
      frappe.ui.set_theme(theme === 'dark' ? 'dark' : 'light');
    }

    // Dispatch custom event for UI listeners (e.g. logo, charts)
    window.dispatchEvent(new CustomEvent('onespace-theme-changed', { detail: { theme } }));
  };

  OneSpace.toggleTheme = function() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    OneSpace.setTheme(next);
  };

  // Immediate initialization to avoid flash of unstyled content
  const initialTheme = OneSpace.getTheme();
  OneSpace.setTheme(initialTheme);

  // Listen to OS color scheme changes if set to system
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem(STORAGE_KEY) === 'system') {
      OneSpace.setTheme('system');
    }
  });
})();
