(function () {
  'use strict';
  var mobile = window.matchMedia('(pointer: coarse)');
  var portrait = window.matchMedia('(orientation: portrait)');
  var started = false;
  var busy = false;
  var style = document.createElement('style');
  style.textContent = '#landscape-gate{position:fixed;inset:0;z-index:2147483647;background:#21152f;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;box-sizing:border-box;font-family:Arial,sans-serif}#landscape-gate[hidden]{display:none}#landscape-gate img{width:110px;height:110px;object-fit:contain;margin-bottom:20px}#landscape-gate p{font-size:18px;line-height:1.7;margin:0 0 22px}#landscape-gate button{font:700 18px Arial,sans-serif;padding:15px 26px;border:0;border-radius:12px;background:#b58aff;color:#21152f}#landscape-gate button:focus-visible{outline:3px solid white;outline-offset:4px}';
  document.head.appendChild(style);
  var gate = document.createElement('div');
  gate.id = 'landscape-gate';
  gate.hidden = true;
  gate.setAttribute('role', 'dialog');
  gate.setAttribute('aria-modal', 'true');
  gate.setAttribute('aria-label', '가로 화면으로 투어 시작');
  gate.innerHTML = '<img src="skin/rotate_device.png" alt=""><p role="status" aria-live="polite">가로 화면으로 즐기는 투어입니다.<br>시작 버튼을 눌러주세요.</p><button type="button">가로 화면으로 시작</button>';
  document.body.appendChild(gate);
  var message = gate.querySelector('p');
  var button = gate.querySelector('button');
  function update() {
    gate.hidden = !mobile.matches || (started && !portrait.matches);
    if (!gate.hidden) {
      (document.fullscreenElement || document.body).appendChild(gate);
    }
  }
  button.addEventListener('click', async function () {
    if (busy) return;
    busy = true;
    button.disabled = true;
    started = true;
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (_) { /* Rotation guidance also works without fullscreen. */ }
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape');
      }
    } catch (_) { /* Some mobile browsers require manual rotation. */ }
    message.innerHTML = '휴대폰을 가로로 돌려주세요.<br>가로 화면이 되면 투어가 시작됩니다.';
    button.textContent = '가로 화면 다시 시도';
    busy = false;
    button.disabled = false;
    update();
  });
  portrait.addEventListener('change', update);
  mobile.addEventListener('change', update);
  window.addEventListener('resize', update);
  document.addEventListener('fullscreenchange', update);
  update();
})();
