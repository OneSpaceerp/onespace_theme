/**
 * OneSpace ERP Systems v16 — Master Desk Theme & White-Label Controller
 * Dynamically enforces OneSpace branding across Frappe Framework & ERPNext v16 Desk UI
 */

(function() {
  'use strict';

  window.OneSpace = window.OneSpace || {};

  function initOneSpaceBrand() {
    // --- 1. Browser Title Scrubbing ---
    function scrubTitle() {
      if (document.title && (document.title.includes('ERPNext') || document.title.includes('Frappe'))) {
        document.title = document.title
          .replace(/ERPNext/g, 'OneSpace')
          .replace(/Frappe/g, 'OneSpace');
      }
    }
    scrubTitle();

    const titleEl = document.querySelector('title');
    if (titleEl) {
      new MutationObserver(scrubTitle).observe(titleEl, {
        subtree: true,
        characterData: true,
        childList: true
      });
    }

    // --- 2. Universal DOM Text Scrubber ---
    const ignoredTags = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT']);

    function scrubNodeText(node) {
      if (!node) return;

      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.nodeValue;
        if (text && (text.includes('ERPNext') || text.includes('Frappe'))) {
          node.nodeValue = text
            .replace(/ERPNext Settings/g, 'OneSpace Settings')
            .replace(/ERPNext/g, 'OneSpace')
            .replace(/Frappe Framework/g, 'OneSpace Platform')
            .replace(/Frappe/g, 'OneSpace');
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (ignoredTags.has(node.tagName)) return;

        // Scrub user-facing attributes
        ['title', 'placeholder', 'aria-label', 'alt'].forEach(attr => {
          const val = node.getAttribute(attr);
          if (val && (val.includes('ERPNext') || val.includes('Frappe'))) {
            node.setAttribute(attr, val
              .replace(/ERPNext Settings/g, 'OneSpace Settings')
              .replace(/ERPNext/g, 'OneSpace')
              .replace(/Frappe Framework/g, 'OneSpace Platform')
              .replace(/Frappe/g, 'OneSpace')
            );
          }
        });

        // Recurse child nodes
        for (let i = 0; i < node.childNodes.length; i++) {
          scrubNodeText(node.childNodes[i]);
        }
      }
    }

    // --- 3. Top-Left Logo Overhaul (Desk & Header) ---
    function overhaulTopLogo() {
      // Legacy Desk navbar brand
      const legacyBrand = document.querySelector('.navbar-brand, .app-logo');
      if (legacyBrand && !legacyBrand.dataset.onespaceBranded) {
        legacyBrand.dataset.onespaceBranded = 'true';
        legacyBrand.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="/assets/onespace/images/onespace_light.png" alt="OneSpace" class="onespace-brand-logo onespace-logo-light" style="height: 28px; width: auto;">
            <img src="/assets/onespace/images/onespace_dark.png" alt="OneSpace" class="onespace-brand-logo onespace-logo-dark" style="height: 28px; width: auto; display: none;">
            <span style="font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: var(--os-brand-primary-tint); color: var(--os-brand-primary);">v16</span>
          </div>
        `;
      }

      // Frappe v16 Vue Desk header button with Frappe logo
      const headerLogos = document.querySelectorAll(
        'header button:first-child, nav button:first-child, header a:first-child, nav a:first-child, [class*="app-logo"], [class*="home-button"]'
      );

      headerLogos.forEach(logoEl => {
        const svg = logoEl.querySelector('svg');
        if (svg && !logoEl.dataset.onespaceLogoReplaced) {
          // Check if this is the desk home logo button
          const isTopLeft = logoEl.getBoundingClientRect().left < 200 && logoEl.getBoundingClientRect().top < 100;
          if (isTopLeft) {
            logoEl.dataset.onespaceLogoReplaced = 'true';
            logoEl.innerHTML = `
              <img src="/assets/onespace/images/onespace_icon.svg" alt="OneSpace" style="height: 32px; width: 32px; border-radius: 8px; object-fit: contain; vertical-align: middle;">
            `;
          }
        }
      });
    }

    // --- 4. Sidebar Header & Navigation Scrubbing ---
    function overhaulSidebar() {
      // Look for sidebar headers with "ERPNext"
      const sidebars = document.querySelectorAll('aside, .desk-sidebar, [class*="sidebar"]');
      sidebars.forEach(sidebar => {
        const textElements = sidebar.querySelectorAll('span, p, div, a, button');
        textElements.forEach(el => {
          if (el.children.length === 0) {
            const trimmed = el.textContent.trim();
            if (trimmed === 'ERPNext') {
              el.textContent = 'OneSpace';
            } else if (trimmed === 'Frappe' || trimmed === 'Frappe Framework') {
              el.textContent = 'OneSpace';
            }
          }
        });
      });
    }

    // --- 5. Desktop Launcher Grid Scrubbing (/desk) ---
    function overhaulDesktopLauncher() {
      // Find all interactive items in the desktop grid
      const launcherItems = document.querySelectorAll(
        'a, button, [role="button"], [class*="desktop-icon"], [class*="grid-item"], [class*="workspace-card"]'
      );

      launcherItems.forEach(item => {
        const labelEl = item.querySelector('span, p, div:not(:has(*))') || item;
        const text = (labelEl.textContent || '').trim();

        // Hide Framework & Frappe Framework icons
        if (text === 'Framework' || text === 'Frappe Framework') {
          const card = item.closest('[class*="col"], [class*="grid"], [class*="card"]') || item;
          card.style.setProperty('display', 'none', 'important');
        }

        // Rename ERPNext Settings
        if (text === 'ERPNext Settings' || text.includes('ERPNext Settings')) {
          labelEl.textContent = text.replace(/ERPNext Settings/g, 'OneSpace Settings');
        }
      });
    }

    // --- 6. Navbar Theme Switcher Injection ---
    function injectNavbarThemeToggle() {
      if (document.getElementById('onespace-navbar-theme-toggle')) return;

      // Find the right header actions container (search, bell, avatar)
      const navContainer = document.querySelector(
        '.navbar-collapse .navbar-nav, .nav-right, header .flex:has(button), nav .flex:has(button)'
      );
      if (!navContainer) return;

      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'onespace-navbar-theme-toggle';
      toggleBtn.type = 'button';
      toggleBtn.title = 'Toggle OneSpace Theme (Light / Dark)';
      toggleBtn.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        width: 32px;
        border-radius: 8px;
        border: 1px solid var(--os-border, #E4E4E7);
        background: var(--os-surface, #FFFFFF);
        color: var(--os-text, #09090B);
        cursor: pointer;
        margin-right: 8px;
        transition: all 0.2s ease;
      `;
      toggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;

      toggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.OneSpace && OneSpace.toggleTheme) {
          OneSpace.toggleTheme();
        }
      });

      navContainer.insertBefore(toggleBtn, navContainer.firstChild);
    }

    // --- Master Pass ---
    function runAllBrandingPasses() {
      scrubTitle();
      scrubNodeText(document.body);
      overhaulTopLogo();
      overhaulSidebar();
      overhaulDesktopLauncher();
      injectNavbarThemeToggle();
      if (window.OneSpace && OneSpace.autoMountLauncher) {
        OneSpace.autoMountLauncher();
      }
    }

    // Initial Execution
    runAllBrandingPasses();

    // Debounced MutationObserver for dynamic Vue / Desk re-renders
    let debounceTimer = null;
    const observer = new MutationObserver(mutations => {
      let shouldRun = false;
      for (let mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldRun = true;
          break;
        }
      }
      if (shouldRun) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(runAllBrandingPasses, 50);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Listen for Frappe router changes
    if (window.frappe && frappe.router) {
      frappe.router.on('change', () => {
        setTimeout(runAllBrandingPasses, 100);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOneSpaceBrand);
  } else {
    initOneSpaceBrand();
  }
})();

