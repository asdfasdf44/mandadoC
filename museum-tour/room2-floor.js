(function () {
  'use strict';
  let marker, down = null, dragged = false, moving = false;
  document.addEventListener('DOMContentLoaded', () => {
    marker = document.createElement('div');
    marker.className = 'room2-floor-marker';
    marker.hidden = true;
    marker.innerHTML = '<span>⌃</span>';
    marker.setAttribute('aria-hidden', 'true');
    document.body.appendChild(marker);
  });
  document.addEventListener('pointerdown', event => { down = { x: event.clientX, y: event.clientY }; dragged = false; }, true);
  document.addEventListener('pointermove', event => {
    if (down && event.buttons && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) dragged = true;
    if (event.target.closest && event.target.closest('button,.puzzle-overlay')) hide();
  }, true);
  document.addEventListener('pointerleave', hide);
  function hide() {
    if (moving) return;
    if (marker) marker.hidden = true;
    document.documentElement.classList.remove('room2-wall-hover');
  }
  function floor(krpano, h, v) {
    // Include wall and floor directions, excluding the ceiling and nadir.
    return ['scene_room2', 'scene_room3'].includes(krpano.get('xml.scene')) && Number.isFinite(h) && v >= -35 && v <= 82 &&
      !document.querySelector('.puzzle-overlay,.room-radial-menu') && !krpano.get('plugin[webvr].isenabled') && !moving;
  }
  window.Room2Floor = {
    init(krpano) {
      const container = document.getElementById('krpanoSWFObject');
      if (!container) return;
      function point(event) {
        const rect = container.getBoundingClientRect();
        krpano.set('room2_floor_mouse_x', (event.clientX - rect.left) * Number(krpano.get('stagewidth')) / rect.width);
        krpano.set('room2_floor_mouse_y', (event.clientY - rect.top) * Number(krpano.get('stageheight')) / rect.height);
        krpano.call('screentosphere(room2_floor_mouse_x,room2_floor_mouse_y,room2_floor_h,room2_floor_v);');
        return { h: Number(krpano.get('room2_floor_h')), v: Number(krpano.get('room2_floor_v')) };
      }
      container.addEventListener('pointermove', event => {
        if (moving && marker) {
          marker.style.left = event.clientX + 'px';
          marker.style.top = event.clientY + 'px';
          return;
        }
        if (event.buttons || event.target.closest('button,img,.room2-art-icon,.room0-navigation-icon,.puzzle-overlay') || event.clientY > window.innerHeight - 90) { hide(); return; }
        const p = point(event);
        window.Room2Floor.hover(krpano, p.h, p.v, event.clientX, event.clientY);
      });
      container.addEventListener('pointerleave', hide);
      container.addEventListener('pointerup', event => {
        if (event.button !== 0 || dragged || event.target.closest('button,img,.room2-art-icon,.room0-navigation-icon,.puzzle-overlay') || event.clientY > window.innerHeight - 90) return;
        const p = point(event);
        window.Room2Floor.click(krpano, p.h, p.v);
      });
    },
    hover(krpano, h, v, x, y) {
      h = Number(h); v = Number(v);
      if (!marker || !floor(krpano, h, v) || y > window.innerHeight - 90) { hide(); return; }
      marker.hidden = false;
      marker.classList.toggle('on-wall', v < 25);
      document.documentElement.classList.toggle('room2-wall-hover', v < 25);
      marker.style.left = x + 'px'; marker.style.top = y + 'px';
    },
    click(krpano, h, v) {
      h = Number(h); v = Number(v);
      if (dragged || !floor(krpano, h, v) || !marker || marker.hidden) return;
      moving = true;
      marker.classList.add('moving');
      document.documentElement.classList.add('room2-wall-hover');
      if (window.PuzzleEffects) window.PuzzleEffects.play('click');
      const fov = Number(krpano.get('view.fov'));
      const height = Number(krpano.get('view.vlookat'));
      // A single panorama supports turning/zooming toward a point, not physical walking.
      krpano.call('stopmovements();lookto(' + h + ',' + height + ',' + fov + ',tween(easeInOutQuad,0.7),true);js(window.Room2Floor.done());');
    },
    done() {
      moving = false;
      if (marker) marker.classList.remove('moving');
      document.documentElement.classList.toggle('room2-wall-hover', !!marker && !marker.hidden && marker.classList.contains('on-wall'));
    },
    hide
  };
})();
