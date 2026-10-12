(function () {
  'use strict';
  var button = document.createElement('button');
  button.id = 'mobile-fullscreen-button';
  button.type = 'button';
  var expanded = false;
  var pending = false;
  var expandIcon = '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>';
  var shrinkIcon = '<path d="M3 8h5V3M21 8h-5V3M8 21v-5H3M16 21v-5h5"/>';
  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement ||
      (window.tourViewer && window.tourViewer.get('fullscreen')));
  }
  function update() {
    expanded = isFullscreen();
    var label = expanded ? '전체화면 나가기' : '전체화면 보기';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(expanded));
    button.title = label;
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (expanded ? shrinkIcon : expandIcon) + '</svg>';
    (document.fullscreenElement || document.webkitFullscreenElement || document.body).appendChild(button);
  }
  button.addEventListener('click', async function () {
    if (pending) return;
    pending = true;
    try {
      if (isFullscreen()) {
        if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (window.tourViewer) window.tourViewer.set('fullscreen', false);
      } else {
        var root = document.documentElement;
        if (root.requestFullscreen) await root.requestFullscreen();
        else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen();
        else if (window.tourViewer) window.tourViewer.set('fullscreen', true);
        if (screen.orientation && screen.orientation.lock) {
          try { await screen.orientation.lock('landscape'); } catch (_) {}
        }
      }
    } catch (_) {
      if (window.tourViewer) window.tourViewer.set('fullscreen', !isFullscreen());
    } finally {
      pending = false;
      update();
      setTimeout(update, 150);
    }
  });
  document.addEventListener('fullscreenchange', update);
  document.addEventListener('webkitfullscreenchange', update);
  window.addEventListener('resize', update);
  update();
})();
