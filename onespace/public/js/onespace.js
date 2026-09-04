/**
 * OneSpace ERP Systems v16 — Master Desk Theme & White-Label Controller
 * Grounded in Stitch Project 11292459283275273462
 * Dynamically enforces OneSpace branding across Frappe Framework & ERPNext v16 Desk UI
 */

(function() {
  'use strict';

  window.OneSpace = window.OneSpace || {};

  // --- 1. Immediate In-Memory Boot Scrubber ---
  function scrubBootInfo() {
    try {
      if (window.frappe && frappe.boot) {
        const b = frappe.boot;
        b.app_name = "OneSpace";
        b.app_title = "OneSpace ERP Systems";
        b.app_logo_url = "/assets/onespace/images/onespace_light.png";

        if (b.sysdefaults) {
          b.sysdefaults.app_name = "OneSpace";
          b.sysdefaults.app_title = "OneSpace ERP Systems";
        }

        if (b.app_data && typeof b.app_data === 'object') {
          Object.keys(b.app_data).forEach(k => {
            if (b.app_data[k].app_title) {
              if (['ERPNext', 'Frappe Framework', 'Frappe'].includes(b.app_data[k].app_title)) {
                b.app_data[k].app_title = 'OneSpace';
              }
            }
          });
        }

        if (b.apps_data && typeof b.apps_data === 'object') {
          Object.keys(b.apps_data).forEach(k => {
            if (b.apps_data[k].title) {
              if (['ERPNext', 'Frappe Framework', 'Frappe'].includes(b.apps_data[k].title)) {
                b.apps_data[k].title = 'OneSpace';
              }
            }
            if (b.apps_data[k].app_title) {
              if (['ERPNext', 'Frappe Framework', 'Frappe'].includes(b.apps_data[k].app_title)) {
                b.apps_data[k].app_title = 'OneSpace';
              }
            }
          });
        }

        if (b.sidebar_pages && Array.isArray(b.sidebar_pages.pages)) {
          b.sidebar_pages.pages.forEach(p => {
            if (['ERPNext', 'Frappe Framework', 'Frappe'].includes(p.header)) {
              p.header = 'OneSpace';
            }
            if (['ERPNext', 'Frappe Framework', 'Frappe'].includes(p.app_title)) {
              p.app_title = 'OneSpace';
            }
          });
        }
      }
    } catch (e) {
      // Ignore boot access errors
    }
  }

  // --- 2. Browser Title Scrubbing ---
  function scrubTitle() {
    if (document.title && (document.title.includes('ERPNext') || document.title.includes('Frappe'))) {
      document.title = document.title
        .replace(/ERPNext/g, 'OneSpace')
        .replace(/Frappe Framework/g, 'OneSpace')
        .replace(/Frappe/g, 'OneSpace');
    }
  }

  // --- 3. Universal DOM Text Scrubber ---
  const ignoredTags = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT']);

  function scrubAllTextNodes() {
    if (!document.body) return;
    try {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
            const parent = node.parentElement;
            if (!parent || ignoredTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
            if (node.nodeValue.includes('ERPNext') || node.nodeValue.includes('Frappe')) {
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
  }

  // --- 4. Sidebar Header White-Labeling (/desk/:workspace) ---
  function scrubSidebarHeader() {
    const sidebar = document.querySelector('aside, [class*="sidebar"], nav');
    if (!sidebar) return;

    // Scan all elements in the sidebar for ERPNext / Frappe
    const elements = sidebar.querySelectorAll('button, div, span, a, p');
    elements.forEach(el => {
      // Inspect direct child nodes (handles text sitting alongside SVGs/chevrons)
      el.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE && child.nodeValue) {
          if (child.nodeValue.includes('ERPNext') || child.nodeValue.includes('Frappe')) {
            child.nodeValue = child.nodeValue
              .replace(/Frappe Framework/g, 'OneSpace')
              .replace(/ERPNext/g, 'OneSpace')
              .replace(/Frappe/g, 'OneSpace');
          }
        }
      });
    });
  }

  // --- 5. Top-Left Logo Overhaul (Header & Desk) ---
  function overhaulTopLogo() {
    // 1. Legacy Desk navbar brand
    const legacyBrand = document.querySelector('.navbar-brand, .app-logo');
    if (legacyBrand && !legacyBrand.dataset.onespaceBranded) {
      legacyBrand.dataset.onespaceBranded = 'true';
      legacyBrand.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="/assets/onespace/images/onespace_light.png" alt="OneSpace" class="onespace-brand-logo onespace-logo-light" style="height: 28px; width: auto;">
          <img src="/assets/onespace/images/onespace_dark.png" alt="OneSpace" class="onespace-brand-logo onespace-logo-dark" style="height: 28px; width: auto; display: none;">
          <span style="font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: var(--os-brand-primary-tint, rgba(255, 55, 0, 0.1)); color: #FF3700;">v16</span>
        </div>
      `;
    }

    // 2. Frappe v16 Vue Desk top-left icon button (Cube replacer)
    const topElements = document.querySelectorAll('header button, header a, nav button, nav a, #app button, #app a');
    topElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < 60 && rect.left < 80 && rect.width >= 20 && rect.height >= 20) {
        const svg = el.querySelector('svg');
        if (svg && !el.dataset.onespaceLogoReplaced) {
          el.dataset.onespaceLogoReplaced = 'true';
          svg.style.display = 'none';
          el.style.backgroundImage = "url('/assets/onespace/images/onespace_icon.svg')";
          el.style.backgroundSize = "28px 28px";
          el.style.backgroundPosition = "center";
          el.style.backgroundRepeat = "no-repeat";
          el.style.borderRadius = "8px";
        }
      }
    });
  }

  // --- 6. Desktop Launcher Grid Scrubbing (/desk) ---
  function overhaulDesktopLauncher() {
    // Hide developer/framework icon cards
    const launcherItems = document.querySelectorAll('a, button, [role="button"], [class*="desktop-icon"]');
    launcherItems.forEach(item => {
      const txt = (item.textContent || '').trim();
      if (txt === 'Framework' || txt === 'Frappe Framework') {
        const card = item.closest('[class*="col"], [class*="grid"], div') || item;
        card.style.setProperty('display', 'none', 'important');
      }
      if (txt.includes('ERPNext Settings')) {
        item.childNodes.forEach(c => {
          if (c.nodeType === Node.TEXT_NODE && c.nodeValue.includes('ERPNext Settings')) {
            c.nodeValue = c.nodeValue.replace(/ERPNext Settings/g, 'OneSpace Settings');
          }
        });
      }
    });
  }

  // --- 7. Navbar Theme Switcher Injection ---
  function injectNavbarThemeToggle() {
    if (document.getElementById('onespace-navbar-theme-toggle')) return;

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
    scrubBootInfo();
    scrubTitle();
    scrubAllTextNodes();
    scrubSidebarHeader();
    overhaulTopLogo();
    overhaulDesktopLauncher();
    injectNavbarThemeToggle();
  }

  // --- Lifecycle Bootstrapping ---
  runAllBrandingPasses();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllBrandingPasses);
  }

  // High-frequency scan during first 3 seconds of page load to beat async Vue hydration
  let fastPassCount = 0;
  const fastPassInterval = setInterval(() => {
    runAllBrandingPasses();
    fastPassCount++;
    if (fastPassCount > 30) clearInterval(fastPassInterval);
  }, 100);

  // Continuous background reconciliation every 250ms
  setInterval(runAllBrandingPasses, 250);

  // MutationObserver with characterData support for Vue reactivity updates
  const observer = new MutationObserver(() => {
    runAllBrandingPasses();
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    });
  }

  // Title observer
  const titleEl = document.querySelector('title');
  if (titleEl) {
    new MutationObserver(scrubTitle).observe(titleEl, {
      subtree: true,
      characterData: true,
      childList: true
    });
  }

  // Router listener
  if (window.frappe && frappe.router) {
    frappe.router.on('change', () => {
      setTimeout(runAllBrandingPasses, 50);
    });
  }
})();
