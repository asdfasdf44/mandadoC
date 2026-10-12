(function () {
  'use strict';
  if (!window.matchMedia('(pointer: coarse) and (max-width: 1366px)').matches) return;
  window.applyTourMobileIconSize = function () {
    var viewer = window.tourViewer;
    if (!viewer) return;
    var count = Number(viewer.get('hotspot.count'));
    for (var i = 0; i < count; i++) {
      var key = 'hotspot[' + i + ']';
      var url = String(viewer.get(key + '.url') || '');
      var info = /(?:^|\/)info(?:-cutout)?\.png(?:\?|$)/.test(url);
      if ((!info && !/(?:^|\/)icon\.png(?:\?|$)/.test(url)) || viewer.get(key + '.mobile_scaled')) continue;
      var width = Number(viewer.get(key + '.width'));
      var height = Number(viewer.get(key + '.height'));
      if (width > 0) viewer.set(key + '.width', width * (info ? .8 : .9));
      if (height > 0) viewer.set(key + '.height', height * (info ? .8 : .9));
      viewer.set(key + '.mobile_scaled', true);
    }
  };
  window.setupTourMobileIcons = function () {
    var viewer = window.tourViewer;
    if (!viewer) return;
    viewer.call('set(events[mobile_icon_sizes].keep,true); set(events[mobile_icon_sizes].onnewscene,js(window.applyTourMobileIconSize())); set(events[mobile_icon_sizes].onloadcomplete,js(window.applyTourMobileIconSize()));');
    window.applyTourMobileIconSize();
  };
  window.setupTourMobileIcons();
  function group(panel, media, extraBoard) {
    var aside = document.createElement('div');
    aside.className = 'mobile-game-aside';
    var children = Array.from(panel.children);
    children.forEach(function (child) {
      if (child === media || child === extraBoard || child.id.endsWith('-close')) return;
      aside.appendChild(child);
    });
    if (extraBoard) {
      var board = document.createElement('div');
      board.className = 'mobile-game-board';
      board.appendChild(extraBoard); board.appendChild(media); panel.appendChild(board);
    }
    panel.appendChild(aside);
  }
  group(document.getElementById('puzzle-panel'), document.getElementById('puzzle-board'));
  group(document.querySelector('#paint-panel > div'), document.getElementById('paint-canvas'));
  group(document.getElementById('runner-panel'), document.getElementById('runner-screen'));
  group(document.getElementById('difference-panel'), document.getElementById('difference-images'));
  group(document.getElementById('steak-panel'), document.getElementById('steak-image'));
  group(document.getElementById('ladder-panel'), document.getElementById('ladder-canvas'), document.getElementById('ladder-choices'));
  group(document.getElementById('dodge-panel'), document.getElementById('dodge-canvas'));
  group(document.getElementById('color-panel'), document.getElementById('color-grid'));
  document.querySelector('#steak-panel h2').textContent = '스테이크를 10초 맞춰\n완벽하게 구워보세요!';
  document.querySelector('#dodge-panel h2').textContent = '럭키참스\n20초간\n살아남으세요!';
  document.querySelector('#ladder-panel .mobile-game-aside > p:not(#ladder-status)').textContent = '세 개중 하나를 골라보세요\n성공은 딱하나!';
  function formatInstructions() {
    var puzzle = document.getElementById('puzzle-message');
    var text = puzzle.textContent;
    if (text.includes('조각을 드래그해')) {
      var formatted = text.replace(/(\d+)\s*\/\s*(\d+)\s*단계\s*·\s*/, '$1/$2단계-').replace(/조각을 드래그해\s*맞춰주세요\.?\s*/, '조각을 드래그해\n맞춰주세요 ');
      if (formatted !== text) puzzle.textContent = formatted;
    }
    var paint = document.getElementById('paint-status');
    if (/^붓을 그림으로 드래그/.test(paint.textContent)) {
      var instruction = '붓을 그림으로 드래그한 뒤\n문질러 색칠하세요';
      if (paint.textContent !== instruction) paint.textContent = instruction;
    }
  }
  formatInstructions();
  var textObserver = new MutationObserver(formatInstructions);
  ['puzzle-message','paint-status'].forEach(function (id) {
    textObserver.observe(document.getElementById(id), { childList: true, characterData: true, subtree: true });
  });
  var links = ['puzzle-buy','paint-more','runner-gift','difference-buy','steak-more','dodge-watch','color-more'];
  var observer = new MutationObserver(function (changes) {
    changes.forEach(function (change) {
      if (!change.target.id.endsWith('-popup') || change.target.hidden) return;
      links.forEach(function (id) {
        var link = document.getElementById(id);
        if (!change.target.contains(link)) return;
        link.classList.remove('mobile-link-enter');
        void link.offsetWidth;
        link.classList.add('mobile-link-enter');
      });
    });
  });
  observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
})();
