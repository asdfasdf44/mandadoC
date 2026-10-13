(function () {
  'use strict';
  const artworks = [
    ['1.png', '포식자와 피식자', '맛집이네'],
    ['2.png', '복숭아', '이게 진정한 내 모습일까?'],
    ['3.jpg', '공포의 스모어', '빨리 여기로 와, 빨리...'],
    ['4.jpg', '산책', '우리 개는 안 물어요, 호호'],
    ['5.png', '공포의 실타래', '보기보다 안 아파'],
    ['6.png', '까칠한 연인', '나 달라진거 없어?'],
    ['7.png', '우리의 작은 개, 프랭크', '오 프랭크...'],
    ['8.jpg', '차별', '이것 참 난감하네'],
    ['9.png', '도박꾼들', '걸렸다! 전부 튀어!']
  ];
  const room3Artworks = [
    ['1.png', '박쥐와 동굴', '이제야 좀 밝은 걸?'],
    ['2.png', '폰 스타쉬', '면도좀 해야겠어'],
    ['3.jpg', '새로운 삶으로 점프!', '자신감을 가져! 넌 할 수 있어!'],
    ['4.jpg', '첫 출근', '제 업무가 뭐라고요?'],
    ['5.jpg', '화가', '예술은 고통이다'],
    ['6.jpg', '마릴린 먼로', '어이쿠!'],
    ['7.jpg', '마지막 작품', '...'],
    ['8.jpg', '진짜 얼굴', '그 가면을 벗으시지?'],
    ['9.png', '면도', '누가 면도하라고 해서...']
  ];
  const artworksByRoom = { Room2: artworks, Room3: room3Artworks };
  window.PuzzleArtworks = artworksByRoom;
  let closeCurrent = null;
  let cameraSession = null;
  function sound(name) { if (window.PuzzleEffects) window.PuzzleEffects.play(name); }
  window.startRoom2Puzzle = function (krpano, hotspot, number) {
    const room = krpano.get('xml.scene') === 'scene_room3' ? 'Room3' : 'Room2';
    if (cameraSession || !artworksByRoom[room][Number(number) - 1]) return;
    sound('open');
    krpano.call('stopmovements();');
    const saved = {
      h: Number(krpano.get('view.hlookat')),
      v: Number(krpano.get('view.vlookat')),
      fov: Number(krpano.get('view.fov')),
      scene: krpano.get('xml.scene'),
      usercontrol: krpano.get('control.usercontrol'),
      gyro: krpano.get('plugin[skin_gyro].enabled')
    };
    const h = Number(hotspot.artcenterh ?? hotspot.ath), v = Number(hotspot.artcenterv ?? hotspot.atv);
    if (![saved.h, saved.v, saved.fov, h, v].every(Number.isFinite)) return;
    cameraSession = { krpano, saved, number, room };
    krpano.set('control.usercontrol', 'off');
    if (saved.gyro !== null && saved.gyro !== undefined) krpano.set('plugin[skin_gyro].enabled', false);
    const minimum = Number(krpano.get('view.fovmin')) || 1;
    const zoom = Math.max(minimum, saved.fov * 0.82);
    krpano.call('lookto(' + h + ',' + v + ',' + zoom + ',tween(easeInOutQuad,0.85),true);js(window.finishRoom2Puzzle());');
  };
  window.finishRoom2Puzzle = function () {
    if (!cameraSession) return;
    const session = cameraSession;
    window.openRoom2Puzzle(session.number, function () {
      const { krpano, saved } = session;
      // Restore the view only in the scene where the game was opened.
      if (krpano.get('xml.scene') === saved.scene) {
        krpano.call('lookto(' + saved.h + ',' + saved.v + ',' + saved.fov + ',tween(easeInOutQuad,0.85),true);js(window.finishRoom2PuzzleReturn());');
      } else window.finishRoom2PuzzleReturn();
    }, session.room);
  };
  window.finishRoom2PuzzleReturn = function () {
    if (!cameraSession) return;
    const { krpano, saved } = cameraSession;
    krpano.set('control.usercontrol', saved.usercontrol);
    if (saved.gyro !== null && saved.gyro !== undefined) krpano.set('plugin[skin_gyro].enabled', saved.gyro);
    cameraSession = null;
  };
  window.openRoom2Puzzle = function (number, onClose, room = 'Room2') {
    const artwork = artworksByRoom[room] && artworksByRoom[room][Number(number) - 1];
    if (!artwork) return;
    const size = room === 'Room3' && Number(number) >= 7 ? 4 : 3;
    const pieceCount = size * size;
    if (closeCurrent) closeCurrent(true);
    const previousFocus = document.activeElement;
    const overlay = document.createElement('div');
    overlay.className = 'puzzle-overlay';
    overlay.innerHTML = '<section class="puzzle-dialog" role="dialog" aria-modal="true" aria-labelledby="puzzle-title"><button class="puzzle-close" aria-label="퍼즐 닫기">×</button><div class="puzzle-layout"><div class="puzzle-loading">작품을 불러오는 중…</div><aside class="puzzle-info"><p>ROOM 2 · 3 × 3 퍼즐</p><h2 id="puzzle-title"></h2><p class="puzzle-quote"></p><p class="puzzle-help">조각을 드래그해 다른 조각 위에 놓으면 위치가 바뀝니다. 9개 조각을 맞춰 작품을 완성하세요.</p><p class="puzzle-status" role="status" aria-live="polite"></p><button class="puzzle-shuffle" disabled>다시 섞기</button><details><summary>원본 작품 보기</summary><img class="puzzle-preview" alt="" /></details></aside></div></section>';
    document.body.appendChild(overlay);
    overlay.querySelector('.puzzle-info > p').textContent = room.toUpperCase().replace('ROOM', 'ROOM ') + ' · ' + size + ' × ' + size + ' 퍼즐';
    overlay.querySelector('.puzzle-help').textContent = '조각을 드래그해 다른 조각 위에 놓으면 위치가 바뀝니다. ' + pieceCount + '개 조각을 맞춰 작품을 완성하세요.';
    if (window.Room2BGM) window.Room2BGM.puzzle(true);
    let stopCelebration = () => {};
    const soundButton = document.createElement('button');
    soundButton.className = 'puzzle-sound';
    function updateSoundButton() {
      const muted = window.PuzzleEffects && window.PuzzleEffects.muted;
      soundButton.textContent = muted ? '효과음 켜기' : '효과음 끄기';
      soundButton.setAttribute('aria-pressed', String(!muted));
    }
    soundButton.onclick = () => {
      if (window.PuzzleEffects) window.PuzzleEffects.toggle();
      updateSoundButton();
    };
    overlay.querySelector('.puzzle-info').appendChild(soundButton);
    updateSoundButton();
    overlay.querySelector('details').ontoggle = () => sound('click');
    overlay.querySelector('h2').textContent = artwork[1];
    overlay.querySelector('.puzzle-quote').textContent = '“' + artwork[2] + '”';
    const url = 'paints/' + room + '/' + artwork[0];
    const preview = overlay.querySelector('.puzzle-preview');
    preview.src = url;
    preview.alt = artwork[1] + ' 원본';
    const closeButton = overlay.querySelector('.puzzle-close');
    let closing = false;
    function close(immediate) {
      if (!overlay.isConnected || closing) return;
      closing = true;
      stopCelebration();
      sound('close');
      document.removeEventListener('keydown', onKey);
      closeCurrent = null;
      function finishClose() {
        overlay.remove();
        if (window.Room2BGM) window.Room2BGM.puzzle(false);
        if (previousFocus && previousFocus.isConnected) previousFocus.focus();
        if (onClose) onClose();
      }
      if (immediate === true) finishClose();
      else {
        overlay.classList.add('leaving');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.setTimeout(finishClose, reduced ? 0 : 450);
      }
    }
    function onKey(event) {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key === 'Tab') {
        const focusables = Array.from(overlay.querySelectorAll('button:not(:disabled),summary'));
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    closeCurrent = close;
    closeButton.onclick = close;
    overlay.onclick = event => { if (event.target === overlay) close(); };
    document.addEventListener('keydown', onKey);
    closeButton.focus();
    const source = new Image();
    source.onload = function () {
      if (!overlay.isConnected) return;
      const board = overlay.querySelector('.puzzle-loading');
      board.className = 'puzzle-board';
      board.textContent = '';
      board.style.aspectRatio = source.naturalWidth + ' / ' + source.naturalHeight;
      // Constrain portrait images by height without cropping the artwork.
      board.style.setProperty('--art-ratio', source.naturalWidth / source.naturalHeight);
      board.style.gridTemplateColumns = 'repeat(' + size + ',1fr)';
      board.style.gridTemplateRows = 'repeat(' + size + ',1fr)';
      let order, selected = null, moves = 0, solved = false, celebrated = false;
      const status = overlay.querySelector('.puzzle-status');
      const tiles = Array.from({ length: pieceCount }, (_, index) => {
        const tile = document.createElement('button');
        tile.className = 'puzzle-tile';
        tile.style.setProperty('--piece-delay', (320 + index * 45) + 'ms');
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          // Original landing: 320ms delay + 650ms animation; play 600ms earlier.
          window.setTimeout(() => {
            if (overlay.isConnected && !closing) sound('landing');
          }, 370 + index * 45);
        }
        tile.style.backgroundImage = 'url("' + url + '")';
        tile.style.backgroundSize = (size * 100) + '% ' + (size * 100) + '%';
        tile.onpointerdown = event => {
          if (solved || event.button !== 0 || drag) return;
          event.preventDefault();
          sound('pickup');
          selected = null;
          const rect = tile.getBoundingClientRect();
          const ghost = tile.cloneNode(false);
          ghost.className = 'puzzle-drag-ghost';
          Object.assign(ghost.style, { width: rect.width + 'px', height: rect.height + 'px', left: rect.left + 'px', top: rect.top + 'px' });
          overlay.appendChild(ghost);
          drag = { index, pointerId: event.pointerId, ghost, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
          tile.setPointerCapture(event.pointerId);
          tile.classList.add('dragging');
          render();
        };
        tile.onpointermove = event => {
          if (!drag || drag.pointerId !== event.pointerId) return;
          drag.ghost.style.left = event.clientX - drag.offsetX + 'px';
          drag.ghost.style.top = event.clientY - drag.offsetY + 'px';
          const target = document.elementFromPoint(event.clientX, event.clientY);
          tiles.forEach(t => t.classList.toggle('drop-target', t === target && t !== tile));
        };
        tile.onpointerup = event => {
          if (!drag || drag.pointerId !== event.pointerId) return;
          const target = document.elementFromPoint(event.clientX, event.clientY);
          const destination = tiles.indexOf(target);
          if (destination !== -1 && destination !== index) {
            [order[index], order[destination]] = [order[destination], order[index]];
            moves++;
            sound('swap');
            solved = order.every((value, position) => value === position);
          }
          cancelDrag();
          render();
        };
        tile.onpointercancel = tile.onlostpointercapture = () => { cancelDrag(); render(); };
        tile.onclick = () => {
          if (solved) return;
          sound('pickup');
          if (selected === null) selected = index;
          else if (selected === index) selected = null;
          else {
            [order[selected], order[index]] = [order[index], order[selected]];
            selected = null;
            moves++;
            sound('swap');
            solved = order.every((value, position) => value === position);
          }
          render();
        };
        board.appendChild(tile);
        return tile;
      });
      let drag = null;
      function cancelDrag() {
        if (!drag) return;
        const active = drag;
        drag = null;
        active.ghost.remove();
        tiles.forEach(tile => tile.classList.remove('dragging', 'drop-target'));
        if (tiles[active.index].hasPointerCapture(active.pointerId)) tiles[active.index].releasePointerCapture(active.pointerId);
      }
      // Pointer input uses dragging; keyboard activation retains a two-piece swap.
      tiles.forEach(tile => {
        const keyboardSwap = tile.onclick;
        tile.onclick = event => { if (event.detail === 0) keyboardSwap(); };
      });
      function render() {
        board.classList.toggle('completed', solved);
        board.style.backgroundImage = solved ? 'url("' + url + '")' : '';
        tiles.forEach((tile, index) => {
          const piece = order[index];
          tile.style.backgroundPosition = (piece % size * 100 / (size - 1)) + '% ' + (Math.floor(piece / size) * 100 / (size - 1)) + '%';
          tile.classList.toggle('selected', selected === index);
          tile.setAttribute('aria-pressed', String(selected === index));
          tile.setAttribute('aria-label', (index + 1) + '번 칸, 작품 조각 ' + (piece + 1));
          tile.disabled = solved;
        });
        status.textContent = solved ? '완성했습니다! ' + moves + '번 만에 작품을 맞췄어요.' : '이동 ' + moves + '회 · ' + (selected === null ? '조각을 드래그해 옮기세요.' : '바꿀 조각을 선택하세요.');
        if (solved && !celebrated) {
          celebrated = true;
          if (window.PuzzleEffects) stopCelebration = window.PuzzleEffects.celebrate(overlay);
        }
      }
      function shuffle() {
        cancelDrag();
        stopCelebration();
        order = Array.from({ length: pieceCount }, (_, index) => index);
        for (let i = pieceCount - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [order[i], order[j]] = [order[j], order[i]];
        }
        if (order.every((value, index) => value === index)) [order[0], order[1]] = [order[1], order[0]];
        selected = null; moves = 0; solved = false; celebrated = false;
        render();
      }
      const shuffleButton = overlay.querySelector('.puzzle-shuffle');
      shuffleButton.disabled = false;
      shuffleButton.onclick = () => { sound('shuffle'); shuffle(); };
      shuffle();
    };
    source.onerror = () => {
      if (overlay.isConnected) overlay.querySelector('.puzzle-loading').textContent = '작품 이미지를 불러오지 못했습니다. 닫고 다시 시도해 주세요.';
    };
    source.src = url;
  };
})();
