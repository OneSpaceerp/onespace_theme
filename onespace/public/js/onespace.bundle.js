/**
 * OneSpace ERP Systems v16 — Master JS Bundle
 * Grounded in Frappe v16 Theming Architecture Guide & Google Stitch 11292459283275273462
 * Compiled via esbuild into dist/js/onespace.bundle.[hash].js
 */

(function () {
  'use strict';

  const STYLE_TAG_ID = "onespace-runtime-theme-styles";

  // --- 1. Dynamic Runtime Style Injection ---
  function applyOneSpaceRuntimeTheme(cfg) {
    const primary = (cfg && cfg.primary_color) || "#FF3700";
    const darkPrimary = (cfg && cfg.dark_primary_color) || "#FF3700";
    const bg = (cfg && cfg.bg_color) || "#F8FAFC";
    const darkBg = (cfg && cfg.dark_bg_color) || "#0A0E17";

    const cssContent = `
      :root, :root[data-theme="light"], [data-theme="light"] {
        --primary: ${primary} !important;
        --primary-color: ${primary} !important;
        --primary-hover: #E03000 !important;
        --primary-light: rgba(255, 55, 0, 0.10) !important;
        --color-primary: ${primary} !important;
        --color-primary-500: ${primary} !important;
        --bg-color: ${bg} !important;
        --fg-color: #FFFFFF !important;
        --card-bg: #FFFFFF !important;
        --navbar-bg: rgba(255, 255, 255, 0.92) !important;
        --sidebar-bg: #FFFFFF !important;
        --sidebar-select-color: rgba(255, 55, 0, 0.10) !important;
        --text-color: #0F172A !important;
        --text-muted: #64748B !important;
        --border-color: #E2E8F0 !important;
        --border-radius: 8px !important;
        --border-radius-sm: 4px !important;
        --border-radius-md: 8px !important;
        --border-radius-lg: 16px !important;
      }
      :root[data-theme="dark"], [data-theme="dark"], .dark {
        --primary: ${darkPrimary} !important;
        --primary-color: ${darkPrimary} !important;
        --primary-hover: #E03000 !important;
        --primary-light: rgba(255, 55, 0, 0.18) !important;
        --color-primary: ${darkPrimary} !important;
        --color-primary-500: ${darkPrimary} !important;
        --bg-color: ${darkBg} !important;
        --fg-color: #151D2F !important;
        --card-bg: #151D2F !important;
        --navbar-bg: rgba(14, 20, 36, 0.95) !important;
        --sidebar-bg: #0E1424 !important;
        --sidebar-select-color: rgba(255, 55, 0, 0.18) !important;
        --text-color: #F8FAFC !important;
        --text-muted: #94A3B8 !important;
        --border-color: #273248 !important;
      }
      /* Top-left Frappe Cube Logo Replacer */
      header button:first-child svg,
      header a[href="/desk"] svg,
      nav button:first-child svg,
      nav a[href="/desk"] svg,
      #app header button:first-child svg,
      #app nav button:first-child svg,
      [data-page-route="desk"] button:first-child svg {
        display: none !important;
      }
      header button:first-child,
      header a[href="/desk"],
      nav button:first-child,
      nav a[href="/desk"],
      #app header button:first-child,
      #app nav button:first-child,
      [data-page-route="desk"] button:first-child {
        background-image: url('/assets/onespace/images/onespace_icon.svg') !important;
        background-size: 28px 28px !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
        min-width: 36px !important;
        min-height: 36px !important;
        border-radius: 8px !important;
      }
      /* Hide Framework Icons on /desk */
      [data-name="Framework"], [data-name="Frappe Framework"],
      [title="Framework"], [title="Frappe Framework"],
      a[href*="/desk/Framework"], a[href*="/desk/Frappe%20Framework"],
      div:has(> a[href*="/desk/Framework"]), div:has(> a[href*="/desk/Frappe%20Framework"]) {
        display: none !important;
      }
    `;

    let styleTag = document.getElementById(STYLE_TAG_ID);
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = STYLE_TAG_ID;
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = cssContent;
  }

  // --- 2. Universal Real-Time DOM Text Scrubber ---
  const ignoredTags = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT']);

  function scrubAllBrandingText() {
    if (!document.body) return;

    // A. TreeWalker across all text nodes
    try {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function (node) {
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
    } catch (e) {}

    // B. Direct check on all clickable/interactive containers (handles sidebar buttons with SVG chevrons)
    const targets = document.querySelectorAll('button, div, span, a, p');
    targets.forEach(el => {
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

    // C. Browser Title
    if (document.title && (document.title.includes('ERPNext') || document.title.includes('Frappe'))) {
      document.title = document.title
        .replace(/Frappe Framework/g, 'OneSpace')
        .replace(/ERPNext/g, 'OneSpace')
        .replace(/Frappe/g, 'OneSpace');
    }
  }

  // --- 3. Top-Left Logo Rebranding ---
  function overhaulLogos() {
    // 1. Navbar brand logo
    const appLogo = document.querySelector('.app-logo');
    if (appLogo && !appLogo.dataset.osBranded) {
      appLogo.dataset.osBranded = 'true';
      appLogo.src = '/assets/onespace/images/onespace_light.png';
    }

    // 2. Frappe v16 Vue Desk top-left cube button
    const topCandidates = document.querySelectorAll('header button, header a, nav button, nav a, #app button, #app a');
    topCandidates.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < 60 && rect.left < 80 && rect.width >= 20 && rect.height >= 20) {
        const svg = el.querySelector('svg');
        if (svg && !el.dataset.osLogoReplaced) {
          el.dataset.osLogoReplaced = 'true';
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

  // --- 4. Desktop Launcher Enhancements (/desk) ---
  function overhaulDeskLauncher() {
    const launcherItems = document.querySelectorAll('a, button, [role="button"], [class*="desktop-icon"]');
    launcherItems.forEach(item => {
      const txt = (item.textContent || '').trim();
      if (txt === 'Framework' || txt === 'Frappe Framework') {
        const card = item.closest('[class*="col"], [class*="grid"], div') || item;
        card.style.setProperty('display', 'none', 'important');
      }
    });
  }

  // --- 5. Navbar Theme Switcher Injection ---
  function injectThemeToggle() {
    if (document.getElementById('onespace-navbar-theme-toggle')) return;

    const navContainer = document.querySelector(
      '.navbar-collapse .navbar-nav, .nav-right, header .flex:has(button), nav .flex:has(button)'
    );
    if (!navContainer) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'onespace-navbar-theme-toggle';
    toggleBtn.type = 'button';
    toggleBtn.title = 'Toggle OneSpace Theme';
    toggleBtn.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 32px;
      width: 32px;
      border-radius: 8px;
      border: 1px solid var(--border-color, #E4E4E7);
      background: var(--card-bg, #FFFFFF);
      color: var(--text-color, #09090B);
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
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      if (document.body) document.body.setAttribute('data-theme', next);
      localStorage.setItem('onespace_theme', next);
    });

    navContainer.insertBefore(toggleBtn, navContainer.firstChild);
  }

  // --- Master Pass ---
  function runAllPasses() {
    scrubAllBrandingText();
    overhaulLogos();
    overhaulDeskLauncher();
    injectThemeToggle();
  }

  // --- Lifecycle Bootstrapping (Grounded in Guide) ---
  // 1. Immediate execution
  applyOneSpaceRuntimeTheme();
  runAllPasses();

  // 2. DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllPasses);
  }

  // 3. Frappe app_ready event (from research guide)
  if (window.$) {
    $(document).on("app_ready", function () {
      if (window.frappe && frappe.boot) {
        if (frappe.boot.custom_theme_config) {
          applyOneSpaceRuntimeTheme(frappe.boot.custom_theme_config);
        }
      }
      runAllPasses();
    });
  }

  // 4. Fast hydration loop for first 3 seconds
  let count = 0;
  const fastInterval = setInterval(() => {
    runAllPasses();
    count++;
    if (count > 30) clearInterval(fastInterval);
  }, 100);

  // 5. Steady reconciliation loop
  setInterval(runAllPasses, 250);

  // 6. MutationObserver watching childList & characterData
  const observer = new MutationObserver(runAllPasses);
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
  }

  // 7. Frappe router listener
  if (window.frappe && frappe.router) {
    frappe.router.on('change', () => setTimeout(runAllPasses, 50));
  }
})();
