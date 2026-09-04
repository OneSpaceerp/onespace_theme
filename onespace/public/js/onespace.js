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

    function universalBrandScrub() {
      // Direct TreeWalker across the entire DOM tree
      try {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: function(node) {
              if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
              const parent = node.parentElement;
              if (!parent || ignoredTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
              if (node.nodeValue.includes('Frappe') || node.nodeValue.includes('ERPNext')) {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_SKIP;
            }
          }
        );

        let textNode;
        while ((textNode = walker.nextNode())) {
          textNode.nodeValue = textNode.nodeValue
            .replace(/Frappe Framework/g, 'OneSpace')
            .replace(/ERPNext Settings/g, 'OneSpace Settings')
            .replace(/ERPNext/g, 'OneSpace')
            .replace(/Frappe/g, 'OneSpace');
        }
      } catch (e) {
        // Fallback
      }

      // Universal sweep for exact matching text in leaf elements (e.g. sidebar headers)
      const allLeaves = document.querySelectorAll('button, div, span, p, a, h1, h2, h3, h4');
      allLeaves.forEach(el => {
        if (el.children.length === 0) {
          const trimmed = el.textContent.trim();
          if (trimmed === 'Frappe Framework' || trimmed === 'ERPNext' || trimmed === 'Frappe') {
            el.textContent = 'OneSpace';
          }
        }
      });
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

      // Frappe v16 Vue Desk top-left icon button with Frappe cube
      const allTopElements = document.querySelectorAll('header button, nav button, header a, nav a, #app button, #app a');
      allTopElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Top-left 100px area
        if (rect.top < 60 && rect.left < 100 && rect.width > 20 && rect.height > 20) {
          const svg = el.querySelector('svg');
          if (svg && !el.dataset.onespaceLogoReplaced) {
            el.dataset.onespaceLogoReplaced = 'true';
            el.innerHTML = `
              <img src="/assets/onespace/images/onespace_icon.svg" alt="OneSpace" style="height: 32px; width: 32px; border-radius: 8px; object-fit: contain; vertical-align: middle;">
            `;
          }
        }
      });
    }

    // --- 4. Sidebar Header & Navigation Scrubbing ---
    function overhaulSidebar() {
      // Find elements containing "Frappe Framework" or "ERPNext"
      const candidates = document.querySelectorAll('[class*="sidebar"], aside, nav, div');
      candidates.forEach(container => {
        const textElements = container.querySelectorAll('span, p, div, a, button');
        textElements.forEach(el => {
          if (el.children.length === 0) {
            const trimmed = el.textContent.trim();
            if (trimmed === 'Frappe Framework' || trimmed === 'ERPNext' || trimmed === 'Frappe') {
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
      universalBrandScrub();
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

