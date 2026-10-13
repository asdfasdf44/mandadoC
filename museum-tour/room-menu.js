(function () {
  'use strict';
  const destinations = [
    ['메인 전시관 이동', 'scene_room1_2', 'MAIN', 'cyan'],
    ['1 전시관 이동', 'scene_room2', '01', 'violet'],
    ['2 전시관 이동', 'scene_room3', '02', 'pink']
  ];
  let closeCurrent;
  window.openRoomNavigation = function (krpano, hotspot) {
    if (closeCurrent) {
      if (window.PuzzleEffects) window.PuzzleEffects.play('click');
      closeCurrent(); return;
    }
    if (document.querySelector('.puzzle-overlay')) return;
    const sprite = hotspot && hotspot.sprite;
    if (!sprite) return;
    const sourceScene = krpano.get('xml.scene');
    const choices = sourceScene === 'scene_room2' ? [
      ['로비', 'scene_room0', 'LOBBY', 'cyan'],
      ['메인전시관', 'scene_room1_2', 'MAIN', 'violet'],
      ['2전시관', 'scene_room3', '02', 'pink']
    ] : sourceScene === 'scene_room3' ? [
      ['로비', 'scene_room0', 'LOBBY', 'cyan'],
      ['메인전시관', 'scene_room1_2', 'MAIN', 'violet'],
      ['1 전시관', 'scene_room2', '01', 'pink']
    ] : destinations;
    if (window.PuzzleEffects) window.PuzzleEffects.play('open');
    const previous = document.activeElement;
    const menu = document.createElement('div');
    menu.className = 'room-radial-menu';
    menu.setAttribute('role', 'group'); menu.setAttribute('aria-label', '전시관 선택');
    const buttons = [];
    let frame, closed = false, closing = false, press = null, direction = null, lastTime;
    const positions = [];
    function finish(callback) {
      if (closed) return;
      closed = true; cancelAnimationFrame(frame);
      menu.remove(); sprite.classList.remove('navigation-open');
      hotspot.navigationopen = false;
      if (sprite.isConnected && krpano.get('xml.scene') === sourceScene) {
        krpano.call('callwith(hotspot[' + hotspot.name + '],room0_arrow_pulse());');
      }
      closeCurrent = null;
      if (previous && previous.isConnected) previous.focus();
      if (callback) callback();
    }
    function close(immediate, callback) {
      if (closed || closing) return;
      closing = true;
      document.removeEventListener('keydown', key);
      document.removeEventListener('pointerdown', down, true);
      document.removeEventListener('pointermove', move, true);
      document.removeEventListener('pointerup', up, true);
      document.removeEventListener('pointercancel', cancel, true);
      if (immediate === true || window.matchMedia('(prefers-reduced-motion: reduce)').matches) finish(callback);
      else {
        if (window.PuzzleEffects) window.PuzzleEffects.play('menuFold');
        menu.classList.add('closing');
        window.setTimeout(() => finish(callback), 420);
      }
    }
    choices.forEach(([title, scene, number, color], index) => {
      const button = document.createElement('button');
      button.className = 'room-radial-button ' + color;
      button.style.setProperty('--delay', index * 60 + 'ms');
      button.style.setProperty('--close-delay', (2 - index) * 45 + 'ms');
      const badge = document.createElement('span'); badge.className = 'room-radial-badge'; badge.textContent = number;
      const label = document.createElement('span'); label.textContent = title;
      button.appendChild(badge); button.appendChild(label);
      button.onclick = () => {
        if (closing) return;
        if (window.PuzzleEffects) window.PuzzleEffects.play('click');
        close(false, () => krpano.call('skin_loadscene(' + scene + ',BLEND(0.8));'));
      };
      menu.appendChild(button); buttons.push(button);
    });
    function position(time) {
      if (closed) return;
      if (!sprite.isConnected || krpano.get('xml.scene') !== sourceScene) { close(true); return; }
      const rect = sprite.getBoundingClientRect(), x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
      if (sourceScene === 'scene_room2' || sourceScene === 'scene_room3') {
        const style = window.getComputedStyle(sprite);
        const outOfView = rect.width < 1 || rect.height < 1 || rect.right <= 0 || rect.left >= window.innerWidth || rect.bottom <= 0 || rect.top >= window.innerHeight || style.visibility === 'hidden' || style.display === 'none';
        if (outOfView && !closing) { close(); return; }
      }
      menu.style.left = x + 'px'; menu.style.top = y + 'px';
      const middle = window.innerWidth / 2, compact = window.innerWidth < 600;
      if (direction === null) direction = x < middle ? 1 : -1;
      else if (x < middle - 70) direction = 1;
      else if (x > middle + 70) direction = -1;
      const now = time || performance.now();
      const elapsed = lastTime === undefined ? 16 : Math.min(50, now - lastTime);
      lastTime = now;
      const blend = 1 - Math.exp(-elapsed / 130);
      buttons.forEach((button, index) => {
        const dx = direction * (index === 1 ? (compact ? 132 : 190) : (compact ? 118 : 158));
        const dy = (index - 1) * (compact ? 74 : 92), halfWidth = compact ? 77 : 91;
        const px = Math.max(halfWidth + 12, Math.min(window.innerWidth - halfWidth - 12, x + dx));
        const py = Math.max(42, Math.min(window.innerHeight - 82, y + dy));
        const targetX = px - x, targetY = py - y;
        if (!positions[index]) positions[index] = { x: targetX, y: targetY };
        positions[index].x += (targetX - positions[index].x) * blend;
        positions[index].y += (targetY - positions[index].y) * blend;
        button.style.setProperty('--x', positions[index].x + 'px'); button.style.setProperty('--y', positions[index].y + 'px');
      });
      frame = requestAnimationFrame(position);
    }
    function isBackground(target) {
      return !menu.contains(target) && !sprite.contains(target) && !!target.closest('#krpanoSWFObject') && !target.closest('button,summary,a');
    }
    function down(event) {
      if (event.button !== 0 || !isBackground(event.target)) { press = null; return; }
      press = { id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false };
    }
    function move(event) {
      if (press && event.pointerId === press.id && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) press.dragged = true;
    }
    function up(event) {
      if (!press || event.pointerId !== press.id) return;
      const click = !press.dragged && Math.hypot(event.clientX - press.x, event.clientY - press.y) <= 6 && isBackground(event.target);
      press = null;
      if (click) close();
    }
    function cancel() { press = null; }
    function key(event) { if (event.key === 'Escape') { event.preventDefault(); close(); } }
    document.body.appendChild(menu);
    hotspot.navigationopen = true;
    krpano.call('stoptween(hotspot[' + hotspot.name + '].scale);');
    sprite.classList.add('navigation-open'); closeCurrent = close; position();
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', down, true);
    document.addEventListener('pointermove', move, true);
    document.addEventListener('pointerup', up, true);
    document.addEventListener('pointercancel', cancel, true);
    buttons[0].focus();
  };
})();
