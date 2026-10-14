(function () {
  'use strict';
  const exhibitionAudio = new Audio('paints/Room2/bgm.mp3');
  const jazzAudio = new Audio('skin/' + encodeURIComponent('Jazz Music #1 (No Copyright).mp3'));
  const tracks = [exhibitionAudio, jazzAudio];
  tracks.forEach(audio => { audio.loop = true; audio.preload = 'auto'; audio.volume = 0; });
  let currentAudio = null, currentScene = '', enabled = true, puzzle = false, button, fadeFrame = null;
  function volume() {
    if (currentScene === 'scene_room0') return 0.05;
    const normal = currentAudio === jazzAudio ? 0.12 : 0.22;
    return puzzle ? Math.min(normal, 0.12) : normal;
  }
  function label() {
    if (!button) return;
    button.hidden = !currentAudio;
    button.textContent = enabled ? '♫ BGM 끄기' : '♫ BGM 켜기';
    button.setAttribute('aria-pressed', String(enabled));
  }
  function cancelFade() {
    if (fadeFrame !== null) cancelAnimationFrame(fadeFrame);
    fadeFrame = null;
  }
  function stop() {
    cancelFade();
    tracks.forEach(audio => { audio.pause(); audio.volume = 0; });
  }
  function mix(duration) {
    cancelFade();
    if (!enabled || document.hidden) { stop(); return; }
    const incoming = currentAudio;
    const starts = tracks.map(audio => audio.volume);
    const targets = tracks.map(audio => audio === incoming ? volume() : 0);
    if (incoming) incoming.play().catch(() => {});
    const start = performance.now();
    function step(now) {
      const progress = Math.min(1, Math.max(0, (now - start) / duration));
      const eased = progress * progress * (3 - 2 * progress);
      tracks.forEach((audio, index) => {
        audio.volume = starts[index] + (targets[index] - starts[index]) * eased;
      });
      if (progress < 1) fadeFrame = requestAnimationFrame(step);
      else {
        fadeFrame = null;
        tracks.forEach(audio => {
          if (audio !== incoming) { audio.pause(); audio.currentTime = 0; }
        });
      }
    }
    fadeFrame = requestAnimationFrame(step);
  }
  function play() {
    if (!currentAudio || !enabled || document.hidden) return;
    // User gestures retry blocked playback without interrupting an active crossfade.
    if (fadeFrame !== null) {
      currentAudio.play().catch(() => {});
    } else if (currentAudio.paused) mix(450);
  }
  function scene(name) {
    const previous = currentAudio;
    currentScene = name;
    currentAudio = ['scene_room0', 'scene_room1_1', 'scene_room1_2'].includes(name)
      ? jazzAudio
      : ['scene_room2', 'scene_room3'].includes(name) ? exhibitionAudio : null;
    // Both tracks change volume on the same animation frames.
    mix(previous && previous !== currentAudio ? 1100 : 450);
    label();
  }
  document.addEventListener('DOMContentLoaded', () => {
    button = document.createElement('button');
    button.className = 'room2-bgm-button';
    button.type = 'button';
    button.onclick = () => {
      enabled = !enabled;
      if (enabled) mix(450); else stop();
      label();
    };
    document.body.appendChild(button);
    label();
  });
  document.addEventListener('pointerdown', play, { capture: true });
  document.addEventListener('keydown', play, { capture: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (enabled) mix(450);
  });
  window.Room2BGM = {
    scene,
    puzzle(active) { puzzle = active; mix(300); }
  };
})();
