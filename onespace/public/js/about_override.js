/**
 * OneSpace ERP Systems v16 — About Dialog Override
 * Cleanly replaces Frappe School / Forum links with OneSpace support and legal notices.
 */

(function() {
  'use strict';

  function overrideAboutModal() {
    if (!window.frappe || !frappe.ui || !frappe.ui.toolbar) return;

    // Override the standard About dialog
    frappe.ui.toolbar.show_about = function() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const logoSrc = isDark ? '/assets/onespace/images/onespace_dark.png' : '/assets/onespace/images/onespace_light.png';

      const d = new frappe.ui.Dialog({
        title: __('About OneSpace'),
        fields: []
      });

      const html = `
        <div class="text-center py-3" style="font-family: var(--os-font-body);">
          <div style="margin-bottom: 16px;">
            <img src="${logoSrc}" alt="OneSpace" style="max-height: 48px; width: auto; object-fit: contain;">
          </div>
          <h4 style="font-family: var(--os-font-display); font-weight: 700; margin: 0 0 4px 0; color: var(--os-text);">
            OneSpace ERP Systems
          </h4>
          <p style="font-size: 13px; color: var(--os-brand-primary); font-weight: 600; margin-bottom: 12px;">
            Version 16.0 Enterprise SaaS
          </p>
          <p style="font-size: 13px; color: var(--os-text-muted); max-width: 360px; margin: 0 auto 20px;">
            Modern, high-velocity enterprise resource planning built for modern operational teams.
          </p>

          <div style="padding: 12px; border-radius: var(--os-radius-md); background: var(--os-surface-low); border: 1px solid var(--os-border); font-size: 12px; color: var(--os-text-muted); text-align: left; margin-bottom: 20px;">
            <div style="font-weight: 600; color: var(--os-text); margin-bottom: 4px;">Platform Architecture</div>
            <div>Powered by Frappe Framework v16 &amp; ERPNext v16 engines.</div>
            <div style="margin-top: 6px;">
              <a href="/open-source-notices" target="_blank" style="color: var(--os-brand-primary); text-decoration: underline;">
                View Open Source Licenses &amp; Attributions
              </a>
            </div>
          </div>

          <div style="font-size: 11px; color: var(--os-text-muted);">
            &copy; ${new Date().getFullYear()} OneSpace Systems. All rights reserved.
          </div>
        </div>
      `;

      d.set_title(__('About'));
      d.$wrapper.find('.modal-body').html(html);
      d.$wrapper.find('.modal-footer').hide();
      d.show();
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', overrideAboutModal);
  } else {
    overrideAboutModal();
  }
})();
