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

  function applyMetrics(mount, data) {
    if (!data) return;

    // 1. Status Indicators
    const salesEl = mount.querySelector('#os-metric-sales-val');
    if (salesEl && data.active_sales) salesEl.textContent = data.active_sales;

    const apprvEl = mount.querySelector('#os-metric-approvals-val');
    if (apprvEl && data.pending_approvals !== undefined) apprvEl.textContent = data.pending_approvals;

    const stockEl = mount.querySelector('#os-metric-stock-val');
    if (stockEl && data.stock_sync) stockEl.textContent = data.stock_sync;

    // 2. Shortcuts Counts
    if (data.shortcuts) {
      const si = mount.querySelector('#os-sc-sales-invoice-count');
      if (si && data.shortcuts.sales_invoice) si.textContent = data.shortcuts.sales_invoice;

      const itm = mount.querySelector('#os-sc-item-count');
      if (itm && data.shortcuts.item_master) itm.textContent = data.shortcuts.item_master;

      const qt = mount.querySelector('#os-sc-quotation-count');
      if (qt && data.shortcuts.quotation) qt.textContent = data.shortcuts.quotation;

      const po = mount.querySelector('#os-sc-po-count');
      if (po && data.shortcuts.purchase_order) po.textContent = data.shortcuts.purchase_order;
    }

    // 3. Last Accessed Doc
    if (data.last_accessed && data.last_accessed.label && data.last_accessed.label !== 'None') {
      const lastDocLink = mount.querySelector('#os-last-doc-link');
      if (lastDocLink) {
        lastDocLink.textContent = data.last_accessed.label;
        lastDocLink.href = data.last_accessed.route;
      }
    }

    // 4. Telemetry
    if (data.telemetry) {
      const pod = mount.querySelector('#os-telem-pod');
      if (pod && data.telemetry.cluster_pod) pod.textContent = data.telemetry.cluster_pod;

      const core = mount.querySelector('#os-telem-core');
      if (core && data.telemetry.core_version) core.textContent = data.telemetry.core_version;

      const mod = mount.querySelector('#os-telem-modules');
      if (mod && data.telemetry.modules_version) mod.textContent = data.telemetry.modules_version;

      const wrk = mount.querySelector('#os-telem-workers');
      if (wrk && data.telemetry.workers_status) {
        wrk.textContent = data.telemetry.workers_status;
        wrk.style.color = data.telemetry.is_healthy ? '#16A34A' : '#CA8A04';
      }

      const bdg = mount.querySelector('#os-telem-badge');
      if (bdg && data.telemetry.operational_badge) {
        bdg.textContent = data.telemetry.operational_badge;
        bdg.style.background = data.telemetry.is_healthy ? '#F0FDF4' : '#FEFCE8';
        bdg.style.color = data.telemetry.is_healthy ? '#16A34A' : '#854D0E';
        bdg.style.borderColor = data.telemetry.is_healthy ? '#DCFCE7' : '#FEF08A';
      }
    }
  }

  function fetchLiveMetrics(mount) {
    // A. Apply from boot immediately if available
    if (window.frappe && frappe.boot && frappe.boot.onespace_metrics) {
      applyMetrics(mount, frappe.boot.onespace_metrics);
    }

    // B. Check client-side route history for instant last accessed document
    if (window.frappe && frappe.route_history && frappe.route_history.length) {
      for (let i = frappe.route_history.length - 1; i >= 0; i--) {
        const r = frappe.route_history[i];
        if (r && r.length >= 3 && r[0] === 'Form') {
          const dt = r[1];
          const dn = r[2];
          const lastDocLink = mount.querySelector('#os-last-doc-link');
          if (lastDocLink) {
            lastDocLink.textContent = `${dn} (${dt})`;
            const slug = (dt || '').toLowerCase().replace(/\s+/g, '-');
            lastDocLink.href = `/app/${slug}/${dn}`;
          }
          break;
        }
      }
    }

    // C. Make live API call for real-time fresh counts
    if (window.frappe && typeof frappe.call === 'function') {
      frappe.call({
        method: 'onespace.api.get_desk_metrics',
        callback: function (r) {
          if (r && r.message) {
            applyMetrics(mount, r.message);
          }
        }
      });

      showUnreadNotificationDot(mount);
    }
  }

  /**
   * Unread-notification dot.
   *
   * The previous implementation called
   * frappe.desk.doctype.notification_log.notification_log.get_unread_count,
   * which does not exist in Frappe v16.31.0 — every Desk load threw a
   * ValidationError dialog in the user's face:
   *
   *   Failed to get method for command ... has no attribute 'get_unread_count'
   *
   * Never call a framework internal by dotted path from the client. Use the
   * public data API, and fail silently: a missing dot is a cosmetic loss, a
   * modal error dialog is not.
   */
  function showUnreadNotificationDot(mount) {
    const dot = mount.querySelector('#onespace-notifications-dot');
    if (!dot || !window.frappe || !frappe.db || !frappe.session) return;

    Promise.resolve(
      frappe.db.get_count('Notification Log', {
        for_user: frappe.session.user,
        read: 0
      })
    )
      .then(function (count) {
        dot.style.display = Number(count) > 0 ? 'block' : 'none';
      })
      .catch(function () {
        dot.style.display = 'none';
      });
  }

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
        if (window.frappe && frappe.ui && frappe.ui.notifications && typeof frappe.ui.notifications.show === 'function') {
          frappe.ui.notifications.show();
        } else {
          const nativeBell = document.querySelector('.navbar .notifications-icon, [title*="Notification" i], button:has(svg [d*="M12 22"])');
          if (nativeBell) {
            nativeBell.click();
          } else {
            window.location.href = '/app/notification-log';
          }
        }
      });
    }

    // Top Bar User Profile Click & Dropdown Toggle
    const userBtn = mount.querySelector('#onespace-user-profile-top');
    const userDropdown = mount.querySelector('#onespace-user-dropdown');
    if (userBtn && userDropdown) {
      userBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = userDropdown.style.display === 'block';
        userDropdown.style.display = isOpen ? 'none' : 'block';
      });

      document.addEventListener('click', function (e) {
        if (userDropdown && !userDropdown.contains(e.target) && e.target !== userBtn) {
          userDropdown.style.display = 'none';
        }
      });
    }

    const reloadBtn = mount.querySelector('#os-btn-reload');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', function () {
        if (window.frappe && frappe.ui && frappe.ui.toolbar && frappe.ui.toolbar.clear_cache) {
          frappe.ui.toolbar.clear_cache();
        } else {
          window.location.reload();
        }
      });
    }

    // Fetch and populate live real data across all components
    fetchLiveMetrics(mount);

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

    // Ancestor width reset is CSS's job now — see the `:has(#onespace-desk-container)`
    // rule in _desk_components.scss. The previous version walked the ancestor
    // chain here writing inline !important styles, which only held until Frappe
    // re-rendered the page wrappers on the next client-side navigation. That is
    // why the desk appeared "divided" with dead space on the right: the reset
    // was applied once and then silently lost. CSS re-applies on every render.

    let mount = existingMount;
    if (!mount) {
      // Get real user session details
      let userName = 'Khaled';
      let userFullName = 'Khaled';
      let userEmail = 'Administrator';
      let userInitials = 'KH';
      let userImg = null;

      if (window.frappe && frappe.session) {
        userEmail = frappe.session.user || 'Administrator';
        if (frappe.session.user_fullname) {
          userFullName = frappe.session.user_fullname;
          const parts = frappe.session.user_fullname.trim().split(/\s+/);
          userName = parts[0] || 'Khaled';
          userInitials = parts.length > 1
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : parts[0].substring(0, 2).toUpperCase();
        }
      }

      if (window.frappe && frappe.boot && frappe.boot.user_info && frappe.session && frappe.boot.user_info[frappe.session.user]) {
        userImg = frappe.boot.user_info[frappe.session.user].image || null;
      }

      mount = document.createElement('div');
      mount.id = 'onespace-desk-container';
      mount.className = 'onespace-desk-mounted';
      mount.style.cssText = 'width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; box-sizing: border-box !important;';

      mount.innerHTML = `
        <!-- Stitch Minimal Top Navigation Bar (Full Width) -->
        <header class="onespace-top-navbar" style="display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 28px; background: var(--navbar-bg, #FFFFFF); border-bottom: 1px solid var(--border-color, #E2E8F0); position: sticky; top: 0; z-index: 1000; box-sizing: border-box; width: 100%; margin: 0;">
          <!-- Left: OneSpace Logo -->
          <a href="/desk" style="display: flex; align-items: center; text-decoration: none; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: #0F172A; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <img src="/assets/onespace/images/onespace_icon.svg" alt="OneSpace" style="width: 26px; height: 26px; object-fit: contain;">
            </div>
            <span style="font-family: var(--theme-font-display, inherit); font-size: 17px; font-weight: 800; color: var(--text-color, #0F172A); letter-spacing: -0.02em;">One<span style="color: #FF3700;">Space</span></span>
          </a>

          <!-- Center: Search Bar -->
          <div id="onespace-topbar-search-box" style="position: relative; width: 500px; max-width: 50vw; cursor: pointer;">
            <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; color: #94A3B8; pointer-events: none;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input type="text" id="onespace-topbar-search-input" placeholder="Search (Ctrl + K)..." autocomplete="off" style="width: 100%; height: 38px; padding: 0 62px 0 38px; border-radius: 10px; border: 1px solid var(--border-color, #E2E8F0); background: var(--control-bg, #F8FAFC); color: var(--text-color, #0F172A); font-size: 13px; font-family: inherit; outline: none; box-sizing: border-box; transition: all 0.2s;">
            <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); display: flex; gap: 3px; pointer-events: none;">
              <kbd style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: #FFFFFF; color: #64748B; border: 1px solid #CBD5E1; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Ctrl+K</kbd>
            </div>
          </div>

          <!-- Right: Notifications & User Avatar -->
          <div style="display: flex; align-items: center; gap: 14px; position: relative;">
            <div id="onespace-notifications-top" title="Notifications" style="position: relative; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-muted, #64748B); cursor: pointer; transition: background 0.2s;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>
              <span id="onespace-notifications-dot" style="position: absolute; top: 6px; right: 6px; width: 7px; height: 7px; border-radius: 50%; background: #FF3700; border: 1.5px solid #FFFFFF; display: none;"></span>
            </div>
            <div id="onespace-user-profile-top" title="User Menu" style="width: 36px; height: 36px; border-radius: 50%; background: #EA580C; color: #FFFFFF; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 4px rgba(234, 88, 12, 0.25); overflow: hidden;">
              ${userImg ? `<img src="${userImg}" alt="${userName}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : userInitials}
            </div>

            <!-- Sleek User Dropdown Menu -->
            <div id="onespace-user-dropdown" style="display: none; position: absolute; top: 48px; right: 0; width: 230px; background: var(--card-bg, #FFFFFF); border: 1px solid var(--border-color, #E2E8F0); border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); z-index: 1001; padding: 6px; font-family: inherit;">
              <div style="padding: 10px 12px; border-bottom: 1px solid var(--border-color, #F1F5F9); margin-bottom: 4px;">
                <div style="font-weight: 700; font-size: 13px; color: var(--text-color, #0F172A);">${userFullName}</div>
                <div style="font-size: 11px; color: var(--text-muted, #64748B); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${userEmail}</div>
              </div>
              <a href="/app/user-profile" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; font-size: 12px; color: var(--text-color, #334155); text-decoration: none;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>My Settings</span>
              </a>
              <a href="/app/session-default" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; font-size: 12px; color: var(--text-color, #334155); text-decoration: none;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <span>Session Defaults</span>
              </a>
              <div id="os-btn-reload" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; font-size: 12px; color: var(--text-color, #334155); cursor: pointer;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                <span>Reload Desk</span>
              </div>
              <div style="border-top: 1px solid var(--border-color, #F1F5F9); margin: 4px 0;"></div>
              <a href="/?cmd=web_logout" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; font-size: 12px; color: #DC2626; text-decoration: none;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span>Log out</span>
              </a>
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

            <!-- Status Indicators (Real Connected Live Data) -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
              <a href="/app/sales-invoice" class="os-status-pill" style="background: #F0FDF4; border-color: #DCFCE7; color: #166534; text-decoration: none; cursor: pointer;">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: #16A34A;"></span>
                <span>Active Sales: <strong id="os-metric-sales-val">$0.00</strong></span>
              </a>
              <a href="/app/purchase-order" class="os-status-pill" style="background: #FEFCE8; border-color: #FEF08A; color: #854D0E; text-decoration: none; cursor: pointer;">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: #CA8A04;"></span>
                <span>Pending Approvals: <strong id="os-metric-approvals-val">0</strong></span>
              </a>
              <a href="/app/stock-ledger" class="os-status-pill" style="background: #F0FDFA; border-color: #CCFBF1; color: #115E59; text-decoration: none; cursor: pointer;">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: #0D9488;"></span>
                <span>Stock Sync: <strong id="os-metric-stock-val">OK</strong></span>
              </a>
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
                <a href="/app/workspace" style="font-size: 12px; font-weight: 600; color: #FF3700; text-decoration: none;">Customize Desk</a>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 18px;">
                <a href="/app/sales-invoice" class="os-shortcut-item">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#64748B"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    <span style="font-size: 10px; font-weight: 600; background: var(--border-color); padding: 1px 5px; border-radius: 4px; color: var(--text-muted);">Ctrl+1</span>
                  </div>
                  <span style="font-size: 13px; font-weight: 700; color: var(--text-color); margin-bottom: 2px;">Sales Invoice</span>
                  <span id="os-sc-sales-invoice-count" style="font-size: 11px; color: var(--text-muted);">...</span>
                </a>

                <a href="/app/item" class="os-shortcut-item">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#64748B"><path d="M12 2L2 7l10 5 10-5-10-5zm-8 7.2v6.6l8 4.2v-6.6L4 9.2zm10 10.8l8-4.2V9.2l-8 4.2v6.6z"/></svg>
                    <span style="font-size: 10px; font-weight: 600; background: var(--border-color); padding: 1px 5px; border-radius: 4px; color: var(--text-muted);">Ctrl+2</span>
                  </div>
                  <span style="font-size: 13px; font-weight: 700; color: var(--text-color); margin-bottom: 2px;">Item Master</span>
                  <span id="os-sc-item-count" style="font-size: 11px; color: var(--text-muted);">...</span>
                </a>

                <a href="/app/quotation" class="os-shortcut-item">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#64748B"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                    <span style="font-size: 10px; font-weight: 600; background: var(--border-color); padding: 1px 5px; border-radius: 4px; color: var(--text-muted);">Ctrl+3</span>
                  </div>
                  <span style="font-size: 13px; font-weight: 700; color: var(--text-color); margin-bottom: 2px;">Quotation</span>
                  <span id="os-sc-quotation-count" style="font-size: 11px; color: #EA580C; font-weight: 600;">...</span>
                </a>

                <a href="/app/purchase-order" class="os-shortcut-item">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#64748B"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    <span style="font-size: 10px; font-weight: 600; background: var(--border-color); padding: 1px 5px; border-radius: 4px; color: var(--text-muted);">Ctrl+4</span>
                  </div>
                  <span style="font-size: 13px; font-weight: 700; color: var(--text-color); margin-bottom: 2px;">Purchase Order</span>
                  <span id="os-sc-po-count" style="font-size: 11px; color: var(--text-muted);">...</span>
                </a>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-muted);">
                <span id="os-last-doc-wrap">&bull; Last document accessed: <strong><a id="os-last-doc-link" href="/app" style="color: #FF3700; text-decoration: none;">Loading...</a></strong></span>
                <a href="/app/activity-log" style="color: var(--text-muted); text-decoration: none; font-weight: 600;">View Audit Log &rarr;</a>
              </div>
            </div>

            <!-- Bento Right: System Telemetry (Real Connected Data) -->
            <div class="os-bento-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <span style="font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-color);">SYSTEM TELEMETRY</span>
                <span id="os-telem-badge" style="font-size: 11px; font-weight: 700; background: #F0FDF4; color: #16A34A; padding: 2px 8px; border-radius: 9999px; border: 1px solid #DCFCE7;">&bull; 99.99% Operational</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Cluster Pod</span>
                  <code id="os-telem-pod" style="font-family: monospace; color: var(--text-color);">onespace-prod-01</code>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">OneSpace Core</span>
                  <code id="os-telem-core" style="font-family: monospace; color: var(--text-color);">v16.0.0 (Stable)</code>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">OneSpace Modules</span>
                  <code id="os-telem-modules" style="font-family: monospace; color: var(--text-color);">v16.0.0 Enterprise</code>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Background Workers</span>
                  <strong id="os-telem-workers" style="color: #16A34A;">Active (Healthy)</strong>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border-color); font-size: 12px;">
                <span style="color: var(--text-muted);">OneSpace Managed Cloud</span>
                <a href="/app/system-settings" style="color: #FF3700; text-decoration: none; font-weight: 700;">Diagnostics &rsaquo;</a>
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

  /**
   * Wire up the OneSpace navbar.
   *
   * Only ever touches the navbar OneSpace itself rendered. The previous version
   * did `document.querySelector('header, nav, .navbar')` and then ADDED the
   * .onespace-top-navbar class to whatever came first in document order. On
   * /desk/user that was Frappe's own list-view header — which is why the column
   * headers duplicated, a 320px search input appeared inside the filter row,
   * and the OneSpace logo got stamped onto a list control via
   * getBoundingClientRect() position guessing.
   *
   * If OneSpace has not rendered a navbar on this route, we do nothing. Frappe's
   * own chrome is Frappe's to style, through CSS variables, not through JS.
   */
  function enhanceTopNavbar() {
    const navbar = document.querySelector('header.onespace-top-navbar');
    if (!navbar) return;

    // Appearance is CSS's job (.onespace-top-navbar .os-topbar-logo). This only
    // binds behaviour, once.
    const logoBtn = navbar.querySelector('.os-topbar-logo');
    if (logoBtn && !logoBtn.dataset.osBound) {
      logoBtn.dataset.osBound = 'true';
      logoBtn.addEventListener('click', function () {
        if (window.location.pathname !== '/desk') {
          window.location.href = '/desk';
        }
      });
    }

    const searchInput = navbar.querySelector('#onespace-topbar-search-input');
    if (searchInput && !searchInput.getAttribute('placeholder')) {
      searchInput.setAttribute('placeholder', 'Search (Ctrl + K)…');
    }
  }

  /* --------------------------------------------------------------------------
     Lifecycle

     The DOM text scrubber that used to live here has been removed. It walked
     every text node in <body> with no tag filter and replaced /Frappe/g and
     /ERPNext/g, on setInterval(200ms), plus a MutationObserver watching
     characterData whose own callback wrote characterData — a self-feeding loop.

     Two things were wrong with it:

       1. It rewrote customer data on screen. A Customer named "Frappe
          Technologies" rendered as "OneSpace Technologies"; so did item
          descriptions, comments, email bodies and text a user had just typed
          into a textarea. The screen stopped agreeing with the database.

       2. It never stopped. A 5 Hz full-tree walk on a 500-row list view, in
          every open tab, forever — with getBoundingClientRect() calls inside
          the same tick forcing synchronous layout.

     Branding now lives where the framework supports it: extend_bootinfo on the
     server (setup/boot.py), the OneSpace translation layer, and CSS. This file
     is only responsible for mounting and wiring OneSpace's own UI, and it runs
     on navigation rather than on a timer.
     ----------------------------------------------------------------------- */
  function render() {
    handleDeskRouting();
    enhanceTopNavbar();
  }

  /**
   * Render once Frappe has actually built the desk page.
   *
   * router:change fires when the route changes, which is BEFORE the new page
   * exists in the DOM. Rendering there is a race: sometimes we mounted into a
   * container Frappe was about to replace (the desk came out "divided"), and
   * sometimes the container was not there at all so nothing mounted and the
   * native desktop showed through.
   *
   * The old code hid this behind setInterval(200ms) — it simply retried five
   * times a second forever until it happened to win. That is not a fix, it is a
   * permanent busy-wait.
   *
   * Instead: render immediately, and if the desk container is not ready yet,
   * watch for it with an observer that is scoped to #app, ignores attributes and
   * character data, and disconnects the moment it succeeds or after 3 seconds.
   * Bounded work, no polling.
   */
  function renderWhenReady() {
    render();

    const onDeskHome = /^\/(desk|app)?\/?(home)?$/.test(window.location.pathname);
    if (!onDeskHome || document.getElementById('onespace-desk-container')) return;

    const root = document.getElementById('app') || document.body;
    if (!root || typeof MutationObserver !== 'function') return;

    let settled = false;
    const stop = function () {
      if (settled) return;
      settled = true;
      observer.disconnect();
      clearTimeout(timer);
    };

    const observer = new MutationObserver(function () {
      render();
      if (document.getElementById('onespace-desk-container')) stop();
    });

    observer.observe(root, { childList: true, subtree: true });
    const timer = setTimeout(stop, 3000);
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  onReady(renderWhenReady);

  if (window.$) {
    // page-change fires after frappe.container swaps the page in — the earliest
    // point at which the new DOM is real.
    $(document).on('app_ready page-change', renderWhenReady);
  }

  if (window.frappe && frappe.router && typeof frappe.router.on === 'function') {
    frappe.router.on('change', function () {
      window.requestAnimationFrame(renderWhenReady);
    });
  }
})();
