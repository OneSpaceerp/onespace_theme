/**
 * OneSpace ERP Systems v16 — Icon Registry & Injector
 */

(function() {
  'use strict';

  window.OneSpace = window.OneSpace || {};

  const SPRITE_URL = '/assets/onespace/icons/onespace-icons.svg';

  // Injects the SVG symbol sprite into the document body
  function injectIconSprite() {
    if (document.getElementById('onespace-icon-sprite')) return;

    fetch(SPRITE_URL)
      .then(response => {
        if (!response.ok) throw new Error('Failed to load OneSpace icons sprite');
        return response.text();
      })
      .then(svgContent => {
        const div = document.createElement('div');
        div.id = 'onespace-icon-sprite';
        div.style.display = 'none';
        div.innerHTML = svgContent;
        document.body.insertBefore(div, document.body.firstChild);
      })
      .catch(err => {
        // Fallback: silent fail or log
        console.warn('OneSpace Icon Sprite:', err.message);
      });
  }

  // Returns SVG HTML string for a given icon name
  OneSpace.getIconHtml = function(name, sizeClass = 'os-icon-md', extraClass = '') {
    return `<svg class="os-icon ${sizeClass} ${extraClass}" aria-hidden="true"><use href="#os-icon-${name}"></use></svg>`;
  };

  // Maps standard ERPNext module names to OneSpace icons
  OneSpace.moduleIconMap = {
    'home': 'home',
    'desk': 'dashboard',
    'accounting': 'accounting',
    'accounts': 'accounting',
    'selling': 'sales',
    'sales': 'sales',
    'crm': 'crm',
    'buying': 'buying',
    'purchase': 'purchase',
    'stock': 'stock',
    'inventory': 'inventory',
    'manufacturing': 'manufacturing',
    'projects': 'projects',
    'project': 'projects',
    'hr': 'hr',
    'human resources': 'hr',
    'payroll': 'payments',
    'assets': 'assets',
    'pos': 'pos',
    'point of sale': 'pos',
    'reports': 'reports',
    'settings': 'settings',
    'setup': 'settings',
    'users': 'users',
    'integrations': 'integrations',
    'support': 'help',
    'help': 'help'
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectIconSprite);
  } else {
    injectIconSprite();
  }
})();
