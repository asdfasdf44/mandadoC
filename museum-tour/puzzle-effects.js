(function () {
  'use strict';
  const files = { open: 'ui-click.wav', pickup: 'click_003.wav', swap: 'drop_002.wav', success: 'confirmation_002.wav', close: 'ui-close.wav', shuffle: 'back_001.wav', click: 'ui-click.wav' };
  const pools = {};
  let muted = false, audioContext;
  let landingCount = 0, landingNoise;
  Object.entries(files).forEach(([name, file]) => {
    pools[name] = Array.from({ length: 3 }, () => {
      const audio = new Audio(name === 'success' ? 'paints/Room2/clear.mp3' : 'sounds/' + file);
      audio.preload = 'auto';
      audio.volume = name === 'pickup' ? 0.3 : ['open', 'close', 'click'].includes(name) ? 0.35 : 0.5;
      return audio;
    });
  });
  function unlock() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (Context && !audioContext) audioContext = new Context();
    if (audioContext && audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  }
  function play(name) {
    unlock();
    if (name === 'menuFold') { menuFold(); return; }
    if (name === 'landing') { landing(); return; }
    if (muted || !pools[name]) return;
    const audio = pools[name].find(sound => sound.paused || sound.ended);
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
  function landing() {
    if (muted || !audioContext || audioContext.state !== 'running') return;
    const context = audioContext, now = context.currentTime;
    // A brief wooden impact: a low body tone and a dry, filtered click.
    if (!landingNoise) {
      landingNoise = context.createBuffer(1, Math.ceil(context.sampleRate * 0.065), context.sampleRate);
      const data = landingNoise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (context.sampleRate * 0.012));
    }
    const body = context.createOscillator(), bodyGain = context.createGain();
    body.type = 'triangle';
    body.frequency.setValueAtTime(390 + (landingCount++ % 3) * 24, now);
    body.frequency.exponentialRampToValueAtTime(180, now + 0.055);
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.linearRampToValueAtTime(0.11, now + 0.002);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
    body.connect(bodyGain); bodyGain.connect(context.destination);
    body.onended = () => { body.disconnect(); bodyGain.disconnect(); };
    body.start(now); body.stop(now + 0.08);
    const click = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
    click.buffer = landingNoise;
    filter.type = 'bandpass'; filter.frequency.value = 1700; filter.Q.value = 0.7;
    gain.gain.value = 0.17;
    click.connect(filter); filter.connect(gain); gain.connect(context.destination);
    click.onended = () => { click.disconnect(); filter.disconnect(); gain.disconnect(); };
    click.start(now);
  }
  function menuFold() {
    if (muted || !audioContext || audioContext.state !== 'running') return;
    const context = audioContext, now = context.currentTime, duration = 0.36;
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.7;
    const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
    source.buffer = buffer;
    filter.type = 'bandpass'; filter.Q.value = 1.3;
    filter.frequency.setValueAtTime(2300, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter); filter.connect(gain); gain.connect(context.destination);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start(now); source.stop(now + duration);
  }
  function boom() {
    if (muted || !audioContext || audioContext.state !== 'running') return;
    const context = audioContext, duration = 0.7;
    const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
    source.buffer = buffer;
    filter.type = 'lowpass'; filter.frequency.value = 1800;
    gain.gain.setValueAtTime(0.18, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    source.connect(filter); filter.connect(gain); gain.connect(context.destination);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start();
  }
  function celebrate(parent) {
    play('success');
    const canvas = document.createElement('canvas');
    canvas.className = 'puzzle-fireworks';
    canvas.setAttribute('aria-hidden', 'true');
    parent.appendChild(canvas);
    const context = canvas.getContext('2d');
    if (!context) { canvas.remove(); return () => {}; }
    let width, height, frame, stopped = false;
    const particles = [], reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function resize() {
      width = window.innerWidth; height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = width * ratio; canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    const start = performance.now();
    let previous = start, nextBurst = 0, burst = 0;
    function stop() {
      if (stopped) return;
      stopped = true; cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize); canvas.remove();
    }
    function draw(now) {
      if (stopped || !parent.isConnected) { stop(); return; }
      const elapsed = now - start, dt = Math.min((now - previous) / 1000, 0.04);
      previous = now;
      if (elapsed >= nextBurst && burst < (reduced ? 1 : 4)) {
        const x = width * (0.18 + Math.random() * 0.64), y = height * (0.18 + Math.random() * 0.38);
        const hue = [40, 190, 320, 120, 260][burst % 5];
        const count = reduced ? 40 : 150;
        for (let i = 0; i < count; i++) {
          const angle = Math.PI * 2 * i / count, speed = (90 + Math.random() * 210) * Math.min(width / 850, 1.4);
          particles.push({ x, y, px: x, py: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1.5 + Math.random(), age: 0, hue: hue + Math.random() * 24 });
        }
        boom(); burst++; nextBurst += 420;
      }
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; p.age += dt;
        if (p.age > p.life) { particles.splice(i, 1); continue; }
        p.px = p.x; p.py = p.y; p.vy += 65 * dt;
        p.vx *= Math.exp(-0.6 * dt); p.vy *= Math.exp(-0.3 * dt);
        p.x += p.vx * dt; p.y += p.vy * dt;
        context.globalAlpha = Math.pow(1 - p.age / p.life, 0.6);
        context.strokeStyle = 'hsl(' + p.hue + ',100%,70%)';
        context.lineWidth = 2.5; context.shadowColor = context.strokeStyle; context.shadowBlur = reduced ? 0 : 12;
        context.beginPath(); context.moveTo(p.px, p.py); context.lineTo(p.x, p.y); context.stroke();
      }
      if (elapsed > (reduced ? 2200 : 3500)) stop();
      else frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return stop;
  }
  window.PuzzleEffects = {
    play, celebrate,
    get muted() { return muted; },
    toggle() {
      muted = !muted;
      if (muted) Object.values(pools).flat().forEach(audio => { audio.pause(); audio.currentTime = 0; });
      else play('click');
      return muted;
    }
  };
})();
