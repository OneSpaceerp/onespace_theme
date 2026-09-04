/**
 * OneSpace ERP Systems v16 — App Launcher Redesign
 * Grounded in Stitch Project 11292459283275273462 (OneSpace Desk - App Launcher)
 */

(function() {
  'use strict';

  window.OneSpace = window.OneSpace || {};

  // Embedded SVG icon definitions for zero-latency rendering
  const ICONS = {
    crm: '<path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
    sales: '<path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>',
    buying: '<path fill="currentColor" d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>',
    inventory: '<path fill="currentColor" d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-1 18H5V9h14v11zm1-13H4V4h16v3z"/><path fill="currentColor" d="M9 12h6v2H9z"/>',
    accounting: '<path fill="currentColor" d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
    manufacturing: '<path fill="currentColor" d="M22 22H2V10l7-3v2l5-2v3h3l1-8h4v18zM12 9.95l-5 2.14V20h10v-6.43l-5-3.62z"/>',
    hr: '<path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
    projects: '<path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>',
    assets: '<path fill="currentColor" d="M4 6h16v2H4zm2 4h12v2H6zm3 4h6v2H9zm-7 6h20v2H2z"/>',
    pos: '<path fill="currentColor" d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>',
    reports: '<path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>',
    settings: '<path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>'
  };

  // Standard modules for Frappe v16 Desk Launcher
  const ONESPACE_MODULES = [
    { id: 'selling', title: 'Selling', subtitle: 'Orders & Quotes', icon: 'sales', gradient: 'os-gradient-selling', count: '14', route: '/desk/selling' },
    { id: 'buying', title: 'Buying', subtitle: 'Purchase & RFQ', icon: 'buying', gradient: 'os-gradient-buying', count: null, route: '/desk/buying' },
    { id: 'stock', title: 'Stock', subtitle: 'Inventory & Items', icon: 'inventory', gradient: 'os-gradient-stock', count: '184', route: '/desk/stock' },
    { id: 'accounting', title: 'Accounting', subtitle: 'Ledger & Taxes', icon: 'accounting', gradient: 'os-gradient-accounts', count: null, route: '/desk/accounting' },
    { id: 'organization', title: 'Organization', subtitle: 'Company & Setup', icon: 'crm', gradient: 'os-gradient-crm', count: null, route: '/desk/organization' },
    { id: 'manufacturing', title: 'Manufacturing', subtitle: 'BOM & Orders', icon: 'manufacturing', gradient: 'os-gradient-manufacturing', count: null, route: '/desk/manufacturing' },
    { id: 'projects', title: 'Projects', subtitle: 'Tasks & Timesheets', icon: 'projects', gradient: 'os-gradient-projects', count: '12', route: '/desk/projects' },
    { id: 'assets', title: 'Assets', subtitle: 'Depreciation & Equip', icon: 'assets', gradient: 'os-gradient-assets', count: null, route: '/desk/assets' },
    { id: 'quality', title: 'Quality', subtitle: 'Inspections & Goals', icon: 'pos', gradient: 'os-gradient-pos', count: null, route: '/desk/quality' },
    { id: 'users', title: 'Users & Roles', subtitle: 'Access & Permissions', icon: 'hr', gradient: 'os-gradient-hr', count: '4', route: '/desk/users' },
    { id: 'reports', title: 'Reports', subtitle: 'Analytics & Insights', icon: 'reports', gradient: 'os-gradient-buying', count: null, route: '/desk/financial-reports' },
    { id: 'settings', title: 'OneSpace Settings', subtitle: 'System Configuration', icon: 'settings', gradient: 'os-gradient-settings', count: null, route: '/desk/system' }
  ];

  OneSpace.renderAppLauncher = function(container) {
    if (!container) return;

    const html = `
      <div class="onespace-launcher-wrapper" style="max-width: 1200px; margin: 0 auto; padding: 24px 20px 60px;">
        <!-- System Status Header -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 28px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 3px 10px; border-radius: 9999px; background: rgba(255, 55, 0, 0.12); color: #FF3700;">
                Operational Nexus
              </span>
              <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #10B981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);"></span>
              <span style="font-size: 12px; color: var(--os-text-muted, #71717A);">OneSpace Production Cluster</span>
            </div>
            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; font-weight: 800; color: var(--os-text, #09090B); margin: 0; letter-spacing: -0.02em;">
              OneSpace Workspace Launcher
            </h1>
            <p style="font-size: 13px; color: var(--os-text-muted, #71717A); margin: 4px 0 0 0;">
              ${ONESPACE_MODULES.length} enterprise modules active. Realtime business sync engaged.
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; background: var(--os-surface, #FFFFFF); border: 1px solid var(--os-border, #E4E4E7); padding: 8px 16px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#FF3700"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path fill="currentColor" d="M12 6v6l4 2"/></svg>
              <span id="os-live-clock" style="font-family: 'Manrope', monospace; font-variant-numeric: tabular-nums; font-weight: 600; font-size: 13px;">--:--:-- UTC</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); padding: 8px 14px; border-radius: 12px; font-size: 12px; font-weight: 600; color: #10B981;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: #10B981;"></span>
              <span>Sync: Realtime</span>
            </div>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px; background: var(--os-surface, #FFFFFF); border: 1px solid var(--os-border, #E4E4E7); border-radius: 14px; padding: 10px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#71717A" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="os-app-filter" placeholder="Quick search modules (e.g. Selling, Stock, Accounting, Organization)..." style="flex: 1; border: none; background: transparent; font-family: 'Manrope', sans-serif; font-size: 14px; color: var(--os-text, #09090B); outline: none;">
        </div>

        <!-- 4-6 Column Responsive App Grid -->
        <div class="onespace-app-grid" id="os-app-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 20px;">
          ${ONESPACE_MODULES.map(m => `
            <a href="${m.route}" class="onespace-app-card" data-name="${m.title.toLowerCase()} ${m.subtitle.toLowerCase()}" style="
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              padding: 24px 16px 20px;
              background: var(--os-surface, #FFFFFF);
              border: 1px solid var(--os-border, #E4E4E7);
              border-radius: 16px;
              text-decoration: none;
              color: inherit;
              box-shadow: 0 2px 6px rgba(0,0,0,0.03);
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              position: relative;
            ">
              <div class="os-icon-tile ${m.gradient}" style="
                width: 64px;
                height: 64px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 14px;
                position: relative;
                box-shadow: 0 8px 16px rgba(0,0,0,0.12);
              ">
                <svg viewBox="0 0 24 24" width="30" height="30" style="color: #FFFFFF;">
                  ${ICONS[m.icon] || ICONS.settings}
                </svg>
                ${m.count ? `<span style="position: absolute; top: -4px; right: -4px; background: #FF3700; color: #FFF; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 9999px; box-shadow: 0 2px 5px rgba(255, 55, 0, 0.4);">${m.count}</span>` : ''}
              </div>
              <span class="onespace-app-card-title" style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 14px; color: var(--os-text, #09090B); margin-bottom: 4px;">${m.title}</span>
              <span class="onespace-app-card-subtitle" style="font-size: 11px; color: var(--os-text-muted, #71717A);">${m.subtitle}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Filter functionality
    const filterInput = container.querySelector('#os-app-filter');
    if (filterInput) {
      filterInput.addEventListener('input', function(e) {
        const val = e.target.value.toLowerCase().trim();
        const cards = container.querySelectorAll('.onespace-app-card');
        cards.forEach(card => {
          const text = card.getAttribute('data-name') || '';
          card.style.display = text.includes(val) ? 'flex' : 'none';
        });
      });
    }

    // Live Clock functionality
    function updateClock() {
      const clockEl = container.querySelector('#os-live-clock');
      if (clockEl) {
        const now = new Date();
        clockEl.textContent = now.toUTCString().split(' ')[4] + ' UTC';
      }
    }
    updateClock();
    if (!window._osClockInterval) {
      window._osClockInterval = setInterval(updateClock, 1000);
    }
  };

  // Automatically detects /desk route and mounts the Stitch Launcher
  OneSpace.autoMountLauncher = function() {
    const path = window.location.pathname;
    if (path !== '/desk' && path !== '/desk/' && path !== '/desk/home') {
      return;
    }

    if (document.querySelector('.onespace-launcher-wrapper')) return;

    // Find the main content area in Frappe v16 Desk
    const mainTarget = document.querySelector('main, .layout-main-section, .desk-page, [data-page-route="desk"]');
    if (!mainTarget) return;

    // Hide any solitary default icons
    const existingIcons = mainTarget.querySelectorAll('a, button, [role="button"]');
    existingIcons.forEach(el => {
      const text = (el.textContent || '').trim();
      if (text === 'OneSpace' || text === 'Framework' || text === 'Frappe Framework') {
        const parent = el.closest('div:not(main):not(.desk-page):not(#app)') || el;
        parent.style.setProperty('display', 'none', 'important');
      }
    });

    let mount = document.getElementById('onespace-launcher-mount');
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'onespace-launcher-mount';
      mainTarget.appendChild(mount);
    }

    OneSpace.renderAppLauncher(mount);
  };

  // Hook into router and DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(OneSpace.autoMountLauncher, 100));
  } else {
    setTimeout(OneSpace.autoMountLauncher, 100);
  }
})();

