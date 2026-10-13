(function () {
  'use strict';
  const paragraphs = [
    '제가 일상의 사물들을 주의 깊게 여러 각도에서 관찰하고 그사물에 의미를 부여하는\n작업에 몰두하는 이유가 있습니다. 사물은 우리가 누구인지, 무언을 원하는지를\n이해하느데 도움을 줍니다. 삶의 지혜와 통찰력, 인생의 교훈을 얻게 됩니다.',
    '제 작품은 우리가 잘 아는 일상 속 사물들의 숨겨진 이야기들을 담고 있습니다.\n우리는 사물을 볼 때 그 사물이 우리에게 주는 의미를 생각하죠\n저는 제 작업을 즐깁니다. 사람들에게 웃음을 줄 수 있도록 노력하죠. 그리고\n제 작업의 가장 큰 장점은 사진을 찍고 난 후에 그것들을 맛있게 먹을 수 있다는 거죠.',
    '즐겁게 재밌게 작업하세요. 당신의 머릿속으로 상상하는 이미지들은\n당신이 작업을 하며 자연스럽게 그 테크닉과 방법을 모색하게\n될것입니다. 당신을 즐겁게 하는 어떤 것을 만들고 나면 어떤 것이든\n당신이 느끼는 감정이 당신의 것임을 알 수 있을 겁니다.\n당신이 사진 속의 당신을 바라보는 것처럼 말입니다.'
  ];
  window.openRoom2Artist = function (krpano) {
    if (document.querySelector('.puzzle-overlay')) return;
    const focus = document.activeElement;
    const usercontrol = krpano.get('control.usercontrol');
    krpano.call('stopmovements();');
    krpano.set('control.usercontrol', 'off');
    if (window.Room2Floor) window.Room2Floor.hide();
    if (window.PuzzleEffects) window.PuzzleEffects.play('open');
    if (window.Room2BGM) window.Room2BGM.puzzle(true);
    const overlay = document.createElement('div');
    overlay.className = 'puzzle-overlay artist-overlay';
    overlay.innerHTML = '<section class="artist-dialog" role="dialog" aria-modal="true" aria-labelledby="artist-title"><button class="artist-close" aria-label="작가 메시지 닫기">×</button><div class="artist-portrait"><img src="paints/Room2/0.png" alt="작가의 초상 사진" /></div><div class="artist-letter"><div class="artist-caption">A MESSAGE FROM THE ARTIST</div><h2 id="artist-title">작가의 메시지</h2><div class="artist-divider" aria-hidden="true">◆</div><div class="artist-text"></div></div></section>';
    const text = overlay.querySelector('.artist-text');
    paragraphs.forEach(value => { const p = document.createElement('p'); p.textContent = value; text.appendChild(p); });
    document.body.appendChild(overlay);
    const closeButton = overlay.querySelector('.artist-close');
    let closing = false;
    function close() {
      if (closing) return;
      closing = true;
      document.removeEventListener('keydown', key);
      if (window.PuzzleEffects) window.PuzzleEffects.play('close');
      overlay.classList.add('leaving');
      window.setTimeout(() => {
        overlay.remove();
        krpano.set('control.usercontrol', usercontrol);
        if (window.Room2BGM) window.Room2BGM.puzzle(false);
        if (focus && focus.isConnected) focus.focus();
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450);
    }
    function key(event) {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key === 'Tab') { event.preventDefault(); closeButton.focus(); }
    }
    closeButton.onclick = close;
    overlay.onclick = event => { if (event.target === overlay) close(); };
    document.addEventListener('keydown', key);
    closeButton.focus();
  };
})();
