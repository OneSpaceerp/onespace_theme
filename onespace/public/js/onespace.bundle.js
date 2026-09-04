/**
 * OneSpace ERP Systems v16 — Master JS Bundle
 * Grounded in Stitch Project 11292459283275273462 (OneSpace Desk - App Launcher)
 * Seamlessly mounts the Stitch Desk Interface onto Frappe / ERPNext v16
 */

(function () {
  'use strict';

  window.OneSpace = window.OneSpace || {};

  const MODULES = [
    { id: 'build', category: 'system', title: 'Framework', subtitle: 'DocTypes & Core', icon: 'cube', bg: '#334155', route: '/desk/build', badge: null },
    { id: 'organization', category: 'core', title: 'Organization', subtitle: 'Branches & Units', icon: 'building', bg: '#0284C7', route: '/desk/organization', badge: null },
    { id: 'accounting', category: 'financials', title: 'Accounting', subtitle: 'GL, Invoices & Tax', icon: 'calculator', bg: '#059669', route: '/desk/accounting', badge: '2 audit', badgeBg: '#FEF3C7', badgeColor: '#92400E' },
    { id: 'assets', category: 'financials', title: 'Assets', subtitle: 'Maintenance & Logs', icon: 'archive', bg: '#4F46E5', route: '/desk/assets', badge: null },
    { id: 'buying', category: 'supply', title: 'Buying', subtitle: 'Supplier PO & RFQ', icon: 'shopping-bag', bg: '#0284C7', route: '/desk/buying', badge: null },
    { id: 'manufacturing', category: 'core', title: 'Manufacturing', subtitle: 'BOM & Work Orders', icon: 'flask', bg: '#0D9488', route: '/desk/manufacturing', badge: null },
    { id: 'selling', category: 'core', title: 'Selling', subtitle: 'CRM & Quotations', icon: 'chart-bar', bg: '#EA580C', route: '/desk/selling', badge: '4 new', badgeBg: '#FF3700', badgeColor: '#FFFFFF', featured: true },
    { id: 'projects', category: 'core', title: 'Projects', subtitle: 'Tasks & Timesheet', icon: 'clipboard-check', bg: '#7C3AED', route: '/desk/projects', badge: null },
    { id: 'quality', category: 'core', title: 'Quality', subtitle: 'Inspection & Goals', icon: 'shield-check', bg: '#059669', route: '/desk/quality', badge: null },
    { id: 'stock', category: 'supply', title: 'Stock', subtitle: 'Items & Warehouses', icon: 'inbox', bg: '#2563EB', route: '/desk/stock', badge: null },
    { id: 'subcontracting', category: 'supply', title: 'Subcontracting', subtitle: 'Vendor Jobs', icon: 'refresh', bg: '#0891B2', route: '/desk/subcontracting', badge: null },
    { id: 'users', category: 'hr', title: 'HR & Payroll', subtitle: 'Staff, Leaves & Salary', icon: 'user-group', bg: '#DB2777', route: '/desk/users', badge: null },
    { id: 'crm', category: 'core', title: 'CRM Leads', subtitle: 'Opportunities', icon: 'pie-chart', bg: '#D97706', route: '/desk/selling', badge: null },
    { id: 'system', category: 'system', title: 'OneSpace Settings', subtitle: 'Integrations & API', icon: 'cog', bg: '#334155', route: '/desk/system', badge: null },
  ];

  const SVGS = {
    'cube': '<path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zm-8 7.2v6.6l8 4.2v-6.6L4 9.2zm10 10.8l8-4.2V9.2l-8 4.2v6.6z"/>',
    'building': '<path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H7v-2h4v2zm0-4H7v-2h4v2zm0-4H7V7h4v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z"/>',
    'calculator': '<path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z"/><circle cx="8" cy="8" r="1" fill="#FFF"/><circle cx="12" cy="8" r="1" fill="#FFF"/><circle cx="16" cy="8" r="1" fill="#FFF"/><circle cx="8" cy="12" r="1" fill="#FFF"/><circle cx="12" cy="12" r="1" fill="#FFF"/><circle cx="16" cy="12" r="1" fill="#FFF"/>',
    'archive': '<path fill="currentColor" d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-1 18H5V9h14v11zm1-13H4V4h16v3z"/><path fill="currentColor" d="M9 12h6v2H9z"/>',
    'shopping-bag': '<path fill="currentColor" d="M16 6V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6h-6zm-6-2h4v2h-4V4zm10 15H4V8h16v11z"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/>',
    'flask': '<path fill="currentColor" d="M19 20L14 11V5h1c.55 0 1-.45 1-1s-.45-1-1-1H9c-.55 0-1 .45-1 1s.45 1 1 1h1v6l-5 9c-.63 1.14.19 2.55 1.49 2.55h11.02c1.3 0 2.12-1.41 1.49-2.55zM7.34 18l3.16-5.69V5h3v7.31L16.66 18H7.34z"/>',
    'chart-bar': '<path fill="currentColor" d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/>',
    'clipboard-check': '<path fill="currentColor" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>',
    'shield-check': '<path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>',
    'inbox': '<path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14h-4c0 1.1-.9 2-2 2s-2-.9-2-2H5V5h14v12z"/>',
    'refresh': '<path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>',
    'user-group': '<path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
    'pie-chart': '<path fill="currentColor" d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2 0v8.99H22c-.47-4.74-4.24-8.52-9-8.99zm0 11.01V22c4.76-.47 8.53-4.25 9-8.99H13z"/>',
    'cog': '<path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>'
  };

  function wireStitchEvents(mount) {
    const tabs = mount.querySelectorAll('.os-filter-tab');
    const cards = mount.querySelectorAll('.os-app-card');
    tabs.forEach(tab => {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const cat = this.getAttribute('data-cat');
        cards.forEach(c => {
          if (cat === 'all' || c.getAttribute('data-cat') === cat) {
            c.style.display = 'flex';
          } else {
            c.style.display = 'none';
          }
        });
      });
    });

    // Top Bar Search Click & Keyboard
    const searchBox = mount.querySelector('#onespace-topbar-search-box');
    const searchInput = mount.querySelector('#onespace-topbar-search-input');
    function triggerFrappeSearch(query) {
      if (window.frappe && frappe.search && typeof frappe.search.show === 'function') {
        frappe.search.show(query || undefined);
      } else if (window.frappe && frappe.ui && frappe.ui.toolbar && frappe.ui.toolbar.search) {
        frappe.ui.toolbar.search.show();
      } else {
        const nativeInput = document.querySelector('header input, nav input, input#navbar-search, input[placeholder*="Search"]');
        if (nativeInput && nativeInput !== searchInput) {
          nativeInput.focus();
          nativeInput.click();
        }
      }
    }

    if (searchBox && searchInput) {
      searchBox.addEventListener('click', function () {
        searchInput.focus();
      });
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          triggerFrappeSearch(this.value.trim());
        }
      });
    }

    // Top Bar Notifications Click
    const notifBtn = mount.querySelector('#onespace-notifications-top');
    if (notifBtn) {
      notifBtn.addEventListener('click', function () {
        const nativeBell = document.querySelector('.navbar .notifications-icon, [title*="Notification" i], button:has(svg [d*="M12 22"])');
        if (nativeBell) {
          nativeBell.click();
        } else if (window.frappe && frappe.ui && frappe.ui.notifications) {
          frappe.ui.notifications.show();
        }
      });
    }

    // Top Bar User Profile Click
    const userBtn = mount.querySelector('#onespace-user-profile-top');
    if (userBtn) {
      userBtn.addEventListener('click', function () {
        const nativeUser = document.querySelector('.navbar .dropdown-navbar-user, .user-avatar, [title*="User" i], button:has(.avatar)');
        if (nativeUser) {
          nativeUser.click();
        } else {
          window.location.href = '/app/user';
        }
      });
    }

    // Keyboard shortcuts
    if (!window._osKeyboardBound) {
      window._osKeyboardBound = true;
      document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
          e.preventDefault();
          const sInput = document.getElementById('onespace-topbar-search-input');
          if (sInput) {
            sInput.focus();
            sInput.select();
          }
          triggerFrappeSearch();
        }
        if (e.ctrlKey && e.key === '1') { e.preventDefault(); window.location.href = '/app/sales-invoice'; }
        if (e.ctrlKey && e.key === '2') { e.preventDefault(); window.location.href = '/app/item'; }
        if (e.ctrlKey && e.key === '3') { e.preventDefault(); window.location.href = '/app/quotation'; }
        if (e.ctrlKey && e.key === '4') { e.preventDefault(); window.location.href = '/app/purchase-order'; }
      });
    }
  }

  function handleDeskRouting() {
    const pathname = (window.location.pathname || '').replace(/\/+$/, '') || '/';
    const isDeskHome = (pathname === '/desk' || pathname === '/desk/home' || pathname === '/' || pathname === '/app');
    const existingMount = document.getElementById('onespace-desk-container');

    // 1. When NOT on desk home (e.g. user is in /desk/accounting, /desk/buying, /app/item):
    if (!isDeskHome) {
      if (existingMount) {
        if (existingMount.parentElement) {
          // Restore visibility of all workspace elements
          Array.from(existingMount.parentElement.children).forEach(child => {
            if (child !== existingMount) {
              child.style.removeProperty('display');
            }
          });
        }
        existingMount.remove();
        document.querySelectorAll('[data-page-route="desk"] > *').forEach(el => {
          el.style.removeProperty('display');
        });
      }
      return;
    }

    // 2. When ON desk home (/desk):
    // Find the proper container
    let container = document.querySelector('[data-page-route="desk"], main, .layout-main-section');
    if (!container) {
      const app = document.getElementById('app');
      if (app) {
        container = app.querySelector('.flex-1, [class*="content"]') || app.lastElementChild;
      }
    }
    if (!container) container = document.body;

    let mount = existingMount;
    if (!mount) {
      // Get user name and initials
      let userName = 'Khaled';
      let userInitials = 'KH';
      if (window.frappe && frappe.session && frappe.session.user_fullname) {
        const parts = frappe.session.user_fullname.trim().split(/\s+/);
        userName = parts[0] || 'Khaled';
        userInitials = parts.length > 1
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : parts[0].substring(0, 2).toUpperCase();
      }

      mount = document.createElement('div');
      mount.id = 'onespace-desk-container';
      mount.className = 'onespace-desk-mounted';

      mount.innerHTML = `
        <!-- Stitch Minimal Top Navigation Bar -->
        <header class="onespace-top-navbar" style="display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 28px; background: var(--navbar-bg, #FFFFFF); border-bottom: 1px solid var(--border-color, #E2E8F0); position: sticky; top: 0; z-index: 1000; box-sizing: border-box; width: 100%;">
          <!-- Left: OneSpace Logo -->
          <a href="/desk" style="display: flex; align-items: center; text-decoration: none; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: #0F172A; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <img src="/assets/onespace/images/onespace_icon.svg" alt="OneSpace" style="width: 26px; height: 26px; object-fit: contain;">
            </div>
            <span style="font-family: var(--theme-font-display, inherit); font-size: 17px; font-weight: 800; color: var(--text-color, #0F172A); letter-spacing: -0.02em;">One<span style="color: #FF3700;">Space</span></span>
          </a>

          <!-- Center: Search Bar -->
          <div id="onespace-topbar-search-box" style="position: relative; width: 440px; max-width: 45vw; cursor: pointer;">
            <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; color: #94A3B8; pointer-events: none;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input type="text" id="onespace-topbar-search-input" placeholder="Search (Ctrl + K)..." autocomplete="off" style="width: 100%; height: 38px; padding: 0 62px 0 38px; border-radius: 10px; border: 1px solid var(--border-color, #E2E8F0); background: var(--control-bg, #F8FAFC); color: var(--text-color, #0F172A); font-size: 13px; font-family: inherit; outline: none; box-sizing: border-box; transition: all 0.2s;">
            <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); display: flex; gap: 3px; pointer-events: none;">
              <kbd style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: #FFFFFF; color: #64748B; border: 1px solid #CBD5E1; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Ctrl+K</kbd>
            </div>
          </div>

          <!-- Right: Notifications & User Avatar -->
          <div style="display: flex; align-items: center; gap: 14px;">
            <div id="onespace-notifications-top" title="Notifications" style="position: relative; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-muted, #64748B); cursor: pointer; transition: background 0.2s;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>
              <span style="position: absolute; top: 6px; right: 6px; width: 7px; height: 7px; border-radius: 50%; background: #FF3700; border: 1.5px solid #FFFFFF;"></span>
            </div>
            <div id="onespace-user-profile-top" title="User Menu" style="width: 36px; height: 36px; border-radius: 50%; background: #EA580C; color: #FFFFFF; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 4px rgba(234, 88, 12, 0.25);">
              ${userInitials}
            </div>
          </div>
        </header>

        <div class="onespace-desk-wrapper">
          <!-- Hero Header -->
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 20px; margin-bottom: 28px;">
            <div>
              <div class="os-hero-pretitle">
                <span class="dot"></span>
                <span>ENTERPRISE GLOBAL WORKSPACE</span>
                <span>&bull;</span>
                <span>PRODUCTION INSTANCE</span>
              </div>
              <h1 class="os-hero-title">
                Welcome back, <span class="highlight">${userName}</span> 👋
              </h1>
              <p class="os-hero-desc">
                Select an ERP module to launch, or access pinned shortcuts and live analytics below.
              </p>
            </div>

            <!-- Status Indicators -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
              <div class="os-status-pill" style="background: #F0FDF4; border-color: #DCFCE7; color: #166534;">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: #16A34A;"></span>
                <span>Active Sales: <strong>$1.42M</strong></span>
              </div>
              <div class="os-status-pill" style="background: #FEFCE8; border-color: #FEF08A; color: #854D0E;">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: #CA8A04;"></span>
                <span>Pending Approvals: <strong>6</strong></span>
              </div>
              <div class="os-status-pill" style="background: #F0FDFA; border-color: #CCFBF1; color: #115E59;">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: #0D9488;"></span>
                <span>Stock Sync: <strong>OK</strong></span>
              </div>
            </div>
          </div>

          <!-- Filter Tabs & View Controls -->
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px;">
            <div style="display: flex; flex-wrap: wrap; gap: 8px;" id="os-filter-container">
              <button class="os-filter-tab active" data-cat="all">All Apps (${MODULES.length})</button>
              <button class="os-filter-tab" data-cat="core">Core Operations</button>
              <button class="os-filter-tab" data-cat="financials">Financials</button>
              <button class="os-filter-tab" data-cat="supply">Supply Chain</button>
              <button class="os-filter-tab" data-cat="hr">HR &amp; Payroll</button>
              <button class="os-filter-tab" data-cat="system">System &amp; Tools</button>
            </div>

            <div style="display: flex; align-items: center; gap: 6px; background: var(--card-bg, #FFF); border: 1px solid var(--border-color, #E2E8F0); padding: 4px; border-radius: 10px;">
              <button style="padding: 4px 8px; border-radius: 6px; background: #FF3700; color: #FFF; border: none; cursor: pointer;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/></svg>
              </button>
              <button style="padding: 4px 8px; border-radius: 6px; background: transparent; color: #64748B; border: none; cursor: pointer;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
              </button>
            </div>
          </div>

          <!-- 14 App Cards Grid -->
          <div class="onespace-app-grid" id="os-app-grid">
            ${MODULES.map(m => `
              <a href="${m.route}" class="os-app-card ${m.featured ? 'featured' : ''}" data-cat="${m.category}" id="card-${m.id}">
                ${m.badge ? `<span class="os-card-badge" style="background: ${m.badgeBg}; color: ${m.badgeColor};">${m.badge}</span>` : ''}
                <div class="os-icon-tile" style="background-color: ${m.bg};">
                  <svg width="26" height="26" viewBox="0 0 24 24">${SVGS[m.icon] || SVGS.cog}</svg>
                </div>
                <span class="os-card-title">${m.title}</span>
                <span class="os-card-subtitle">${m.subtitle}</span>
              </a>
            `).join('')}
          </div>

          <!-- Bottom Bento Grid (Shortcuts & Telemetry) -->
          <div class="os-bento-grid">
            <!-- Bento Left: Frequent DocTypes & Shortcuts -->
            <div class="os-bento-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF3700"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                  <span style="font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-color);">FREQUENT DOCTYPES &amp; SHORTCUTS</span>
                </div>
                <a href="/desk" style="font-size: 12px; font-weight: 600; color: #FF3700; text-decoration: none;">Customize Desk</a>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 18px;">
                <a href="/app/sales-invoice" class="os-shortcut-item">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#64748B"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    <span style="font-size: 10px; font-weight: 600; background: var(--border-color); padding: 1px 5px; border-radius: 4px; color: var(--text-muted);">Ctrl+1</span>
                  </div>
                  <span style="font-size: 13px; font-weight: 700; color: var(--text-color); margin-bottom: 2px;">Sales Invoice</span>
                  <span style="font-size: 11px; color: var(--text-muted);">18 draft</span>
                </a>

                <a href="/app/item" class="os-shortcut-item">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#64748B"><path d="M12 2L2 7l10 5 10-5-10-5zm-8 7.2v6.6l8 4.2v-6.6L4 9.2zm10 10.8l8-4.2V9.2l-8 4.2v6.6z"/></svg>
                    <span style="font-size: 10px; font-weight: 600; background: var(--border-color); padding: 1px 5px; border-radius: 4px; color: var(--text-muted);">Ctrl+2</span>
                  </div>
                  <span style="font-size: 13px; font-weight: 700; color: var(--text-color); margin-bottom: 2px;">Item Master</span>
                  <span style="font-size: 11px; color: var(--text-muted);">4,120 SKUs</span>
                </a>

                <a href="/app/quotation" class="os-shortcut-item">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#64748B"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                    <span style="font-size: 10px; font-weight: 600; background: var(--border-color); padding: 1px 5px; border-radius: 4px; color: var(--text-muted);">Ctrl+3</span>
                  </div>
                  <span style="font-size: 13px; font-weight: 700; color: var(--text-color); margin-bottom: 2px;">Quotation</span>
                  <span style="font-size: 11px; color: #EA580C; font-weight: 600;">+12 today</span>
                </a>

                <a href="/app/purchase-order" class="os-shortcut-item">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#64748B"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    <span style="font-size: 10px; font-weight: 600; background: var(--border-color); padding: 1px 5px; border-radius: 4px; color: var(--text-muted);">Ctrl+4</span>
                  </div>
                  <span style="font-size: 13px; font-weight: 700; color: var(--text-color); margin-bottom: 2px;">Purchase Order</span>
                  <span style="font-size: 11px; color: var(--text-muted);">8 pending sign</span>
                </a>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-muted);">
                <span>&bull; Last document accessed: <strong>SO-2026-00481 (Al-Ahli Supplies)</strong></span>
                <a href="/app/audit-trail" style="color: var(--text-muted); text-decoration: none; font-weight: 600;">View Audit Log &rarr;</a>
              </div>
            </div>

            <!-- Bento Right: System Telemetry -->
            <div class="os-bento-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <span style="font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-color);">SYSTEM TELEMETRY</span>
                <span style="font-size: 11px; font-weight: 700; background: #F0FDF4; color: #16A34A; padding: 2px 8px; border-radius: 9999px; border: 1px solid #DCFCE7;">&bull; 99.99% Operational</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Cluster Pod</span>
                  <code style="font-family: monospace; color: var(--text-color);">lcs-east-prod-01</code>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">OneSpace Core</span>
                  <code style="font-family: monospace; color: var(--text-color);">v16.2.0 (Stable)</code>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">OneSpace Modules</span>
                  <code style="font-family: monospace; color: var(--text-color);">v16.1.4 Enterprise</code>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Background Workers</span>
                  <strong style="color: #16A34A;">Active (4/4 Healthy)</strong>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border-color); font-size: 12px;">
                <span style="color: var(--text-muted);">OneSpace Managed Cloud</span>
                <a href="/desk/system" style="color: #FF3700; text-decoration: none; font-weight: 700;">Diagnostics &rsaquo;</a>
              </div>
            </div>
          </div>

          <!-- Stitch Footer -->
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; padding-top: 24px; border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-muted);">
            <div>
              <strong>OneSpace ERP Systems</strong> &bull; Powered by OneSpace &amp; OneSpace v16
            </div>
            <div style="display: flex; gap: 20px;">
              <a href="https://onespace.sh/status" target="_blank" style="color: inherit; text-decoration: none;">Cluster Status</a>
              <a href="https://onespace.sh/docs" target="_blank" style="color: inherit; text-decoration: none;">API Documentation</a>
              <a href="https://onespace.sh/support" target="_blank" style="color: inherit; text-decoration: none;">Enterprise Support</a>
            </div>
          </div>
        </div>
      `;

      container.insertBefore(mount, container.firstChild);
      wireStitchEvents(mount);
    }

    // Hide all other children/siblings in the container so the old interface at the bottom is 100% GONE!
    Array.from(container.children).forEach(child => {
      if (child !== mount) {
        child.style.setProperty('display', 'none', 'important');
      }
    });

    // Also defensively hide any other native desk app grid or desk header outside mount
    document.querySelectorAll('[data-page-route="desk"] > *:not(#onespace-desk-container)').forEach(el => {
      if (!mount.contains(el) && !el.closest('#onespace-desk-container') && !el.closest('aside') && !el.closest('.desk-sidebar')) {
        el.style.setProperty('display', 'none', 'important');
      }
    });
  }

  // --- Stitch Top Navigation Bar Controller (for inner workspace pages) ---
  function enhanceTopNavbar() {
    const navbar = document.querySelector('header:not(.onespace-top-navbar), nav:not(.onespace-top-navbar), #app header:not(.onespace-top-navbar), .navbar:not(.onespace-top-navbar)');
    if (!navbar) return;

    navbar.classList.add('onespace-top-navbar');

    // 1. Top-Left Logo Button
    const headerButtons = Array.from(navbar.querySelectorAll('button, a'));
    const logoBtn = headerButtons.find(b => {
      const r = b.getBoundingClientRect();
      return r.top < 60 && r.left < 200 && r.width >= 20 && r.height >= 20;
    }) || navbar.querySelector('a[href="/desk"], button:first-child, a:first-child');

    if (logoBtn) {
      const svg = logoBtn.querySelector('svg');
      if (svg) svg.style.setProperty('display', 'none', 'important');
      logoBtn.style.setProperty('background-image', "url('/assets/onespace/images/onespace_icon.svg')", 'important');
      logoBtn.style.setProperty('background-size', '28px 28px', 'important');
      logoBtn.style.setProperty('background-position', 'center', 'important');
      logoBtn.style.setProperty('background-repeat', 'no-repeat', 'important');
      logoBtn.style.setProperty('width', '36px', 'important');
      logoBtn.style.setProperty('height', '36px', 'important');
      logoBtn.style.setProperty('min-width', '36px', 'important');
      logoBtn.style.setProperty('border-radius', '8px', 'important');
      logoBtn.style.setProperty('cursor', 'pointer', 'important');

      if (!logoBtn.dataset.osBound) {
        logoBtn.dataset.osBound = 'true';
        logoBtn.addEventListener('click', (e) => {
          if (window.location.pathname !== '/desk') {
            window.location.href = '/desk';
          }
        });
      }
    }

    // 2. Search Bar Enhancement
    const searchInput = navbar.querySelector('input[type="text"], input[type="search"], input');
    if (searchInput) {
      searchInput.setAttribute('placeholder', 'Search (Ctrl + K)...');
    }

    // 3. Notification Bell (Add active red dot)
    const bellBtn = navbar.querySelector('button:has(svg [d*="M12 22"]), button:has(svg path), [title*="Notification" i]');
    if (bellBtn && !bellBtn.querySelector('.os-bell-dot')) {
      const dot = document.createElement('span');
      dot.className = 'os-bell-dot';
      dot.style.cssText = 'position: absolute; top: 6px; right: 6px; width: 7px; height: 7px; border-radius: 50%; background: #FF3700; border: 1.5px solid #FFFFFF; pointer-events: none;';
      bellBtn.style.position = 'relative';
      bellBtn.appendChild(dot);
    }
  }

  // --- Universal Top-Left Logo & Text Scrubber ---
  function scrubBranding() {
    if (!document.body) return;

    // TreeWalker text replacement
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && (node.nodeValue.includes('ERPNext') || node.nodeValue.includes('Frappe'))) {
        node.nodeValue = node.nodeValue
          .replace(/Frappe Framework/g, 'OneSpace')
          .replace(/ERPNext Settings/g, 'OneSpace Settings')
          .replace(/ERPNext/g, 'OneSpace')
          .replace(/Frappe/g, 'OneSpace');
      }
    }
  }

  // Lifecycle execution
  function tick() {
    enhanceTopNavbar();
    scrubBranding();
    handleDeskRouting();
  }

  tick();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  }

  if (window.$) {
    $(document).on('app_ready', tick);
  }

  setInterval(tick, 200);

  const observer = new MutationObserver(tick);
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  if (window.frappe && frappe.router) {
    frappe.router.on('change', () => setTimeout(tick, 50));
  }
})();
