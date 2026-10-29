(function () {
  'use strict';
  const titles = ['포식자와 피식자', '복숭아', '공포의 스모어', '산책', '공포의 실타래', '까칠한 연인', '우리의 작은 개, 프랭크', '차별', '도박꾼들'];
  let label;
  function resolveTitle(name) {
    const puzzleMatch = /^room([23])_puzzle_(\d+)$/.exec(name);
    if (puzzleMatch) {
      const data = window.PuzzleArtworks && window.PuzzleArtworks['Room' + puzzleMatch[1]];
      const index = Number(puzzleMatch[2]) - 1;
      return (data ? data[index][1] : titles[index]);
    }
    const viewMatch = /^room(\d+)_view_(\d+)$/.exec(name);
    if (viewMatch) {
      const data = window.ArtworkViewData && window.ArtworkViewData['Room' + viewMatch[1]];
      const entry = data && data[Number(viewMatch[2]) - 1];
      return entry && entry.title;
    }
    return '작가의 메시지';
  }
  window.Room2IconLabels = {
    attach(hotspot) {
      const sprite = hotspot.sprite;
      if (!sprite || sprite.dataset.labelBound) return;
      const title = resolveTitle(hotspot.name);
      if (!title) return;
      sprite.dataset.labelBound = 'true';
      sprite.setAttribute('aria-label', title);
      function hide() { if (label) label.hidden = true; }
      function show() {
        if (document.querySelector('.puzzle-overlay')) return;
        if (!label) {
          label = document.createElement('div');
          label.className = 'room2-icon-label';
          label.setAttribute('role', 'tooltip');
          document.body.appendChild(label);
        }
        label.textContent = title;
        label.hidden = false;
        const rect = sprite.getBoundingClientRect();
        const width = label.getBoundingClientRect().width;
        const x = Math.max(width / 2 + 12, Math.min(window.innerWidth - width / 2 - 12, rect.left + rect.width / 2));
        const y = rect.top - 18;
        // Hide rather than overlap the artwork when there is no space above it.
        if (y < label.getBoundingClientRect().height + 8) { hide(); return; }
        label.style.left = x + 'px';
        label.style.top = y + 'px';
        const iconCenter = rect.left + rect.width / 2;
        label.style.setProperty('--bubble-tail-x', Math.max(16, Math.min(width - 16, iconCenter - x + width / 2)) + 'px');
      }
      sprite.addEventListener('pointerenter', show);
      sprite.addEventListener('pointermove', show);
      sprite.addEventListener('pointerleave', hide);
      sprite.addEventListener('pointerdown', hide);
    },
    hide() { if (label) label.hidden = true; }
  };
})();
