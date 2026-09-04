/**
 * OneSpace ERP Systems v16 — App Launcher Redesign
 * Grounded in Stitch Project 11292459283275273462 (OneSpace Desk - App Launcher)
 */

(function() {
  'use strict';

  window.OneSpace = window.OneSpace || {};

  // Standard modules with gradients and icons for the App Launcher
  const ONESPACE_MODULES = [
    { id: 'crm', title: 'CRM', subtitle: 'Deals & Leads', icon: 'crm', gradient: 'os-gradient-crm', count: '32', route: '/app/crm' },
    { id: 'selling', title: 'Selling', subtitle: 'Orders & Quotes', icon: 'sales', gradient: 'os-gradient-selling', count: '14', route: '/app/selling' },
    { id: 'buying', title: 'Buying', subtitle: 'Purchase & RFQ', icon: 'buying', gradient: 'os-gradient-buying', count: null, route: '/app/buying' },
    { id: 'stock', title: 'Stock', subtitle: 'Inventory & Items', icon: 'inventory', gradient: 'os-gradient-stock', count: '184', route: '/app/stock' },
    { id: 'accounts', title: 'Accounts', subtitle: 'Ledger & Taxes', icon: 'accounting', gradient: 'os-gradient-accounts', count: null, route: '/app/accounts' },
    { id: 'manufacturing', title: 'Manufacturing', subtitle: 'BOM & Orders', icon: 'manufacturing', gradient: 'os-gradient-manufacturing', count: null, route: '/app/manufacturing' },
    { id: 'hr', title: 'Human Resources', subtitle: 'Payroll & Leaves', icon: 'hr', gradient: 'os-gradient-hr', count: '6', route: '/app/hr' },
    { id: 'projects', title: 'Projects', subtitle: 'Tasks & Timesheets', icon: 'projects', gradient: 'os-gradient-projects', count: '12', route: '/app/project' },
    { id: 'assets', title: 'Assets', subtitle: 'Depreciation & Equip', icon: 'assets', gradient: 'os-gradient-assets', count: null, route: '/app/assets' },
    { id: 'pos', title: 'Point of Sale', subtitle: 'Retail Terminals', icon: 'pos', gradient: 'os-gradient-pos', count: null, route: '/app/point-of-sale' },
    { id: 'reports', title: 'Reports', subtitle: 'Analytics & Insights', icon: 'reports', gradient: 'os-gradient-buying', count: null, route: '/app/query-report' },
    { id: 'settings', title: 'Settings', subtitle: 'System & Users', icon: 'settings', gradient: 'os-gradient-settings', count: null, route: '/app/settings' }
  ];

  OneSpace.renderAppLauncher = function(container) {
    if (!container) return;

    const html = `
      <div class="onespace-launcher-wrapper" style="padding: var(--os-space-md) 0 var(--os-space-2xl);">
        <!-- System Pulse & Shift Status Strip -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 8px; border-radius: 9999px; background: var(--os-brand-primary-tint); color: var(--os-brand-primary);">
                Operational Nexus
              </span>
              <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--os-brand-primary);"></span>
              <span style="font-size: 12px; color: var(--os-text-muted);">Cluster East-01</span>
            </div>
            <h1 style="font-family: var(--os-font-display); font-size: 26px; font-weight: 700; color: var(--os-text); margin: 0; letter-spacing: -0.02em;">
              OneSpace Workspace Launcher
            </h1>
            <p style="font-size: 13px; color: var(--os-text-muted); margin: 4px 0 0 0;">
              ${ONESPACE_MODULES.length} core business modules ready. Enterprise sync active.
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; background: var(--os-surface); border: 1px solid var(--os-border); padding: 6px 14px; border-radius: var(--os-radius-lg); box-shadow: var(--os-shadow-ambient);">
              <svg class="os-icon os-icon-sm" style="color: var(--os-brand-primary);" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 13H11v-6h1.5v6zm0-8H11V5h1.5v2z"/></svg>
              <span id="os-live-clock" style="font-family: var(--os-font-body); font-variant-numeric: tabular-nums; font-weight: 600; font-size: 13px;">--:--:-- UTC</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 6px 12px; border-radius: var(--os-radius-lg); font-size: 12px; font-weight: 600; color: #10B981;">
              <span class="onespace-pulse-dot"></span>
              <span>Sync: Realtime</span>
            </div>
          </div>
        </div>

        <!-- Filter & Search Strip -->
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; background: var(--os-surface); border: 1px solid var(--os-border); border-radius: var(--os-radius-xl); padding: 6px 12px; box-shadow: var(--os-shadow-ambient);">
          <svg class="os-icon os-icon-sm" style="color: var(--os-text-muted);" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input type="text" id="os-app-filter" placeholder="Filter workspace modules (e.g. Sales, CRM, Stock)..." style="flex: 1; border: none; background: transparent; font-family: var(--os-font-body); font-size: 13px; color: var(--os-text); outline: none;">
        </div>

        <!-- 6-Column Responsive Grid -->
        <div class="onespace-app-grid" id="os-app-grid" style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));">
          ${ONESPACE_MODULES.map(m => `
            <a href="${m.route}" class="onespace-app-card os-interactive-scale" data-name="${m.title.toLowerCase()} ${m.subtitle.toLowerCase()}">
              <div class="os-icon-tile os-icon-tile-lg ${m.gradient}">
                <svg class="os-icon os-icon-xl" style="color: #FFFFFF;"><use href="#os-icon-${m.icon}"></use></svg>
                ${m.count ? `<span style="position: absolute; top: 4px; right: 4px; background: var(--os-brand-primary); color: #FFF; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 9999px; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">${m.count}</span>` : ''}
              </div>
              <span class="onespace-app-card-title">${m.title}</span>
              <span class="onespace-app-card-subtitle">${m.subtitle}</span>
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
    setInterval(updateClock, 1000);
  };
})();
