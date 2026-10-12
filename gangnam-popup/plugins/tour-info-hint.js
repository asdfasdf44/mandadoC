(function () {
  'use strict';
  var bubble = document.createElement('div');
  bubble.id = 'info-hint';
  bubble.textContent = '저를 읽어보세용';
  bubble.hidden = true;
  bubble.setAttribute('role', 'status');
  document.body.appendChild(bubble);
  var began = 0, fading = false;
  var interval = setInterval(function () {
    var viewer = window.tourViewer;
    if (!viewer || !viewer.webGL || !viewer.get('hotspot[day1_info]')) return;
    var blocked = ['landscape-gate','tutorial-popup','welcome-popup'].some(function (id) {
      var element = document.getElementById(id); return element && !element.hidden;
    });
    if (blocked) { bubble.hidden = true; return; }
    var point = viewer.actions.spheretoscreen(viewer.get('hotspot[day1_info].ath'), viewer.get('hotspot[day1_info].atv'));
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
    var rect = viewer.webGL.canvas.getBoundingClientRect();
    var x = rect.left + point.x * rect.width / viewer.get('stagewidth');
    var y = rect.top + point.y * rect.height / viewer.get('stageheight');
    if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) { bubble.hidden = true; return; }
    (document.fullscreenElement || document.body).appendChild(bubble);
    bubble.hidden = false;
    bubble.style.left = Math.max(8, Math.min(innerWidth - bubble.offsetWidth - 8, x - bubble.offsetWidth / 2)) + 'px';
    bubble.style.top = Math.max(12, y - Number(viewer.get('hotspot[day1_info].height')) / 2 - bubble.offsetHeight - 12) + 'px';
    if (!began) began = performance.now();
    if (!fading && performance.now() - began >= 3000) {
      fading = true; bubble.classList.add('fading');
      setTimeout(function () { clearInterval(interval); bubble.remove(); }, 1200);
    }
  }, 100);
})();
