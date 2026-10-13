(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.createElement('div');
    cursor.className = 'room2-floor-marker on-wall tour-cursor';
    cursor.innerHTML = '<span></span>';
    cursor.hidden = true;
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
    document.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      document.documentElement.classList.add('tour-custom-cursor');
      cursor.hidden = false;
      cursor.style.left = event.clientX + 'px'; cursor.style.top = event.clientY + 'px';
      cursor.classList.toggle('interactive', !!event.target.closest('button,summary,a,.room2-art-icon,.room0-navigation-icon'));
    }, true);
    document.addEventListener('pointerdown', event => { if (event.pointerType !== 'touch') cursor.classList.add('pressed'); }, true);
    document.addEventListener('pointerup', () => cursor.classList.remove('pressed'), true);
    document.documentElement.addEventListener('pointerleave', () => { cursor.hidden = true; document.documentElement.classList.remove('tour-custom-cursor'); });
    window.addEventListener('blur', () => { cursor.hidden = true; });
  });
})();
