/**
 * OneSpace ERP Systems v16 — Master Desk Theme Controller
 */

(function() {
  'use strict';

  window.OneSpace = window.OneSpace || {};

  function initOneSpaceBrand() {
    // 1. Browser Title Scrubbing & Replacement
    function scrubTitle() {
      if (document.title && (document.title.includes('ERPNext') || document.title.includes('Frappe'))) {
        document.title = document.title.replace(/ERPNext/g, 'OneSpace').replace(/Frappe/g, 'OneSpace');
      }
    }
    scrubTitle();

    // Observe document title changes
    const titleObserver = new MutationObserver(scrubTitle);
    const titleEl = document.querySelector('title');
    if (titleEl) {
      titleObserver.observe(titleEl, { subtree: true, characterData: true, childList: true });
    }

    // 2. Desk Navbar Brand Overhaul
    function updateNavbarBrand() {
      const navbar = document.querySelector('.navbar-brand, .app-logo');
      if (!navbar || navbar.dataset.onespaceBranded) return;

      navbar.dataset.onespaceBranded = 'true';
      navbar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="/assets/onespace/images/onespace_light.png" alt="OneSpace" class="onespace-brand-logo onespace-logo-light" style="height: 28px; width: auto;">
          <img src="/assets/onespace/images/onespace_dark.png" alt="OneSpace" class="onespace-brand-logo onespace-logo-dark" style="height: 28px; width: auto; display: none;">
          <span style="font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: var(--os-brand-primary-tint); color: var(--os-brand-primary);">v16</span>
        </div>
      `;
    }

    // 3. Navbar Theme Switcher Injection
    function injectNavbarThemeToggle() {
      const navContainer = document.querySelector('.navbar-collapse .navbar-nav, .nav-right');
      if (!navContainer || document.getElementById('onespace-navbar-theme-toggle')) return;

      const toggleItem = document.createElement('li');
      toggleItem.className = 'nav-item';
      toggleItem.id = 'onespace-navbar-theme-toggle';
      toggleItem.innerHTML = `
        <button class="nav-link btn btn-sm" type="button" title="Toggle OneSpace Theme" style="display: flex; align-items: center; padding: 6px 8px; border-radius: 8px;">
          <svg class="os-icon os-icon-sm" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </button>
      `;

      toggleItem.querySelector('button').addEventListener('click', function(e) {
        e.preventDefault();
        if (window.OneSpace && OneSpace.toggleTheme) {
          OneSpace.toggleTheme();
        }
      });

      navContainer.insertBefore(toggleItem, navContainer.firstChild);
    }

    // 4. Desk Workspace Interception for App Launcher
    function checkWorkspaceRoute() {
      if (window.frappe && frappe.get_route) {
        const route = frappe.get_route();
        if (route && (route.length === 0 || (route.length === 1 && route[0] === 'app') || (route.length === 2 && route[0] === 'app' && route[1] === 'home'))) {
          // If viewing home workspace, inject the OneSpace App Launcher if present
          const workspaceArea = document.querySelector('.layout-main-section, .workspace-page');
          if (workspaceArea && !workspaceArea.querySelector('.onespace-launcher-wrapper') && window.OneSpace.renderAppLauncher) {
            // Optional enhancement hook
          }
        }
      }
    }

    // Initial pass
    updateNavbarBrand();
    injectNavbarThemeToggle();

    // DOM Mutation observer to ensure dynamic Desk rerenders keep OneSpace branding
    const observer = new MutationObserver(() => {
      updateNavbarBrand();
      injectNavbarThemeToggle();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    if (window.frappe && frappe.router) {
      frappe.router.on('change', () => {
        scrubTitle();
        setTimeout(checkWorkspaceRoute, 200);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOneSpaceBrand);
  } else {
    initOneSpaceBrand();
  }
})();
