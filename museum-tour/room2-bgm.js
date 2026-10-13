(function () {
  'use strict';
  const audio = new Audio('paints/Room2/bgm.mp3');
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.22;
  let inRoom = false, enabled = true, puzzle = false, button;
  function label() {
    if (!button) return;
    button.hidden = !inRoom;
    button.textContent = enabled ? '♫ BGM 끄기' : '♫ BGM 켜기';
    button.setAttribute('aria-pressed', String(enabled));
  }
  function play() {
    if (!inRoom || !enabled || document.hidden) return;
    audio.volume = puzzle ? 0.12 : 0.22;
    audio.play().catch(() => {});
  }
  function scene(name) {
    inRoom = name === 'scene_room2' || name === 'scene_room3';
    if (inRoom) play();
    else { audio.pause(); audio.currentTime = 0; }
    label();
  }
  document.addEventListener('DOMContentLoaded', () => {
    button = document.createElement('button');
    button.className = 'room2-bgm-button';
    button.type = 'button';
    button.onclick = () => {
      enabled = !enabled;
      if (enabled) play(); else audio.pause();
      label();
    };
    document.body.appendChild(button);
    label();
  });
  // Retry after a user gesture if the browser blocked autoplay.
  document.addEventListener('pointerdown', play, { capture: true });
  document.addEventListener('keydown', play, { capture: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) audio.pause(); else play(); });
  window.Room2BGM = {
    scene,
    puzzle(active) { puzzle = active; audio.volume = active ? 0.12 : 0.22; }
  };
})();
