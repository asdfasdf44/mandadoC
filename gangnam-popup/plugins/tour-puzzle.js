(function () {
    'use strict';
    var board = document.getElementById('puzzle-board');
    var popup = document.getElementById('puzzle-popup');
    var message = document.getElementById('puzzle-message');
    var pieces = [0, 1, 2, 3];
    var selected = null;
    var drag = null;
    var moves = 0;
    var stage = 0;
    var states = [null, null, null];
    var stages = ['skin/pop2.png', 'skin/pop2_2.png', 'skin/pop2_3.png'].map(function (url) {
        var image = new Image();
        image.src = url;
        image.onload = function () { if (stages[stage] === image) updateSize(); };
        return image;
    });
    var previous = document.getElementById('puzzle-previous');
    var next = document.getElementById('puzzle-next');
    var reward = document.getElementById('puzzle-reward');
    function gridSize() { return stage === 2 ? 3 : 2; }
    function piecePosition(piece) {
        var size = gridSize();
        return ((piece % size) * 100 / (size - 1)) + '% ' + (Math.floor(piece / size) * 100 / (size - 1)) + '%';
    }
    function updateSize() {
        var image = stages[stage];
        if (!image.naturalWidth) return;
        var ratio = image.naturalWidth / image.naturalHeight;
        board.style.aspectRatio = image.naturalWidth + ' / ' + image.naturalHeight;
        board.style.width = 'min(520px, calc(100vw - 64px), ' + (65 * ratio) + 'vh)';
    }
    function saveStage() { states[stage] = {pieces:pieces.slice(), moves:moves}; }
    function goStage(target) {
        if (target < 0 || target >= stages.length || (target > stage && !solved())) return;
        cancelDrag(); clearCelebration(); saveStage(); stage = target;
        selected = null;
        if (states[stage]) { pieces = states[stage].pieces.slice(); moves = states[stage].moves; render(); }
        else shuffle();
        document.getElementById('puzzle-shuffle').focus();
    }
    var sparkleTimer;
    var sparkles;
    function clearCelebration() {
        clearTimeout(sparkleTimer);
        if (sparkles) sparkles.remove();
        sparkles = null;
    }
    function celebrate() {
        clearCelebration();
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        sparkles = document.createElement('div');
        sparkles.className = 'puzzle-sparkles';
        sparkles.setAttribute('aria-hidden', 'true');
        board.style.position = 'relative';
        var colors = ['#ffe89a', '#ead9ff', '#b58aff', '#ff9fdb', '#91efff'];
        var radius = Math.min(board.clientWidth * 0.42, 160);
        for (var burst = 0; burst < 2; burst++) {
            var ring = document.createElement('span');
            ring.className = 'puzzle-burst-ring';
            ring.style.animationDelay = (burst * 0.28) + 's';
            sparkles.appendChild(ring);
            for (var particle = 0; particle < 24; particle++) {
                var dot = document.createElement('span');
                var angle = particle * Math.PI * 2 / 24 + burst * 0.12;
                var distance = radius * (0.65 + Math.random() * 0.35);
                dot.className = 'puzzle-firework';
                dot.style.setProperty('--burst-color', colors[particle % colors.length]);
                dot.style.setProperty('--burst-x', (Math.cos(angle) * distance) + 'px');
                dot.style.setProperty('--burst-y', (Math.sin(angle) * distance + 25) + 'px');
                dot.style.animationDelay = (burst * 0.28) + 's';
                sparkles.appendChild(dot);
            }
        }
        for (var i = 0; i < 16; i++) {
            var spark = document.createElement('span');
            spark.className = 'puzzle-spark';
            spark.textContent = i % 3 === 0 ? '✦' : '·';
            spark.style.left = (5 + Math.random() * 90) + '%';
            spark.style.top = (5 + Math.random() * 90) + '%';
            spark.style.animationDelay = (Math.random() * 0.35) + 's';
            spark.style.setProperty('--spark-x', (Math.random() * 60 - 30) + 'px');
            spark.style.setProperty('--spark-y', (-20 - Math.random() * 45) + 'px');
            sparkles.appendChild(spark);
        }
        board.appendChild(sparkles);
        sparkleTimer = setTimeout(clearCelebration, 1800);
    }
    function solved() { return pieces.every(function (piece, slot) { return piece === slot; }); }
    function render() {
        board.replaceChildren();
        board.classList.toggle('solved', solved());
        updateSize();
        var size = gridSize();
        board.style.gridTemplateColumns = 'repeat(' + size + ', 1fr)';
        board.style.gridTemplateRows = 'repeat(' + size + ', 1fr)';
        board.setAttribute('aria-label', pieces.length + '조각 이미지 퍼즐');
        previous.hidden = stage === 0;
        next.hidden = stage === stages.length - 1 || !solved();
        reward.hidden = stage !== stages.length - 1 || !solved();
        reward.disabled = window.tourStickers.isUnlocked();
        reward.textContent = reward.disabled ? '이모티콘 획득 완료!' : '이모티콘 획득';
        pieces.forEach(function (piece, slot) {
            var tile = document.createElement('button');
            tile.type = 'button';
            tile.className = 'puzzle-piece';
            tile.dataset.slot = slot;
            tile.style.backgroundPosition = piecePosition(piece);
            tile.style.backgroundSize = (size * 100) + '% ' + (size * 100) + '%';
            tile.style.backgroundImage = 'url("' + stages[stage].getAttribute('src') + '")';
            tile.setAttribute('aria-label', (slot + 1) + '번 칸의 조각. 다른 칸으로 드래그하거나 두 칸을 차례로 눌러 교환');
            tile.setAttribute('aria-pressed', String(selected === slot));
            tile.classList.toggle('selected', selected === slot);
            board.appendChild(tile);
        });
        message.textContent = (stage + 1) + ' / ' + stages.length + ' 단계 · ' + (solved() ? (stage === stages.length - 1 ? '모든 단계 클리어! ' : '완성! ') + moves + '회' : '조각을 드래그해 맞춰주세요. (' + moves + '회)');
        saveStage();
    }
    function swap(from, to) {
        if (from === to) return;
        window.tourSfx.play('swap');
        clearCelebration();
        var piece = pieces[from]; pieces[from] = pieces[to]; pieces[to] = piece;
        moves++;
        selected = null;
        render();
        board.children[to].focus({preventScroll:true});
        if (solved()) { celebrate(); window.tourStickers.playEffect('clear'); }
    }
    function cancelDrag() {
        if (!drag) return;
        drag.tile.classList.remove('dragging');
        if (drag.preview) drag.preview.remove();
        board.querySelectorAll('.drop-target').forEach(function (tile) { tile.classList.remove('drop-target'); });
        drag = null;
    }
    function shuffle() {
        cancelDrag();
        clearCelebration();
        pieces = Array.from({length:gridSize() * gridSize()}, function (_, index) { return index; });
        for (var i = pieces.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var item = pieces[i]; pieces[i] = pieces[j]; pieces[j] = item;
        }
        if (solved()) { var first = pieces[0]; pieces[0] = pieces[1]; pieces[1] = first; }
        selected = null; moves = 0; render();
    }
    board.addEventListener('pointerdown', function (event) {
        var tile = event.target.closest('.puzzle-piece');
        if (!tile || event.button !== 0 || drag) return;
        if (solved()) return;
        event.preventDefault();
        tile.focus({preventScroll:true});
        drag = {tile:tile, slot:Number(tile.dataset.slot), id:event.pointerId, x:event.clientX, y:event.clientY};
        tile.setPointerCapture(event.pointerId);
    });
    board.addEventListener('pointermove', function (event) {
        if (!drag || drag.id !== event.pointerId) return;
        if (!drag.preview && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 5) return;
        if (!drag.preview) {
            var bounds = drag.tile.getBoundingClientRect();
            drag.preview = document.createElement('div');
            drag.preview.className = 'puzzle-piece puzzle-drag-preview';
            drag.preview.style.backgroundPosition = drag.tile.style.backgroundPosition;
            drag.preview.style.backgroundImage = drag.tile.style.backgroundImage;
            drag.preview.style.backgroundSize = drag.tile.style.backgroundSize;
            drag.preview.style.width = bounds.width + 'px';
            drag.preview.style.height = bounds.height + 'px';
            drag.offsetX = drag.x - bounds.left; drag.offsetY = drag.y - bounds.top;
            popup.appendChild(drag.preview);
            drag.tile.classList.add('dragging');
        }
        drag.preview.style.left = (event.clientX - drag.offsetX) + 'px';
        drag.preview.style.top = (event.clientY - drag.offsetY) + 'px';
        var target = document.elementFromPoint(event.clientX, event.clientY);
        var tile = target && target.closest('.puzzle-piece');
        board.querySelectorAll('.puzzle-piece').forEach(function (item) { item.classList.toggle('drop-target', item === tile && item !== drag.tile); });
    });
    board.addEventListener('pointerup', function (event) {
        if (!drag || drag.id !== event.pointerId) return;
        var from = drag.slot;
        var moved = !!drag.preview;
        var target = document.elementFromPoint(event.clientX, event.clientY);
        var tile = target && target.closest('.puzzle-piece');
        var to = tile && board.contains(tile) ? Number(tile.dataset.slot) : null;
        cancelDrag();
        if (moved && to !== null) swap(from, to);
    });
    board.addEventListener('pointercancel', cancelDrag);
    board.addEventListener('lostpointercapture', cancelDrag);
    // Keyboard users can select two tiles with Enter or Space.
    board.addEventListener('click', function (event) {
        if (event.detail !== 0) return;
        if (solved()) return;
        var tile = event.target.closest('.puzzle-piece');
        if (!tile) return;
        var slot = Number(tile.dataset.slot);
        if (selected !== null && selected !== slot) swap(selected, slot);
        else { selected = selected === slot ? null : slot; render(); board.children[slot].focus(); }
    });
    document.getElementById('puzzle-shuffle').addEventListener('click', shuffle);
    previous.addEventListener('click', function () { goStage(stage - 1); });
    next.addEventListener('click', function () { goStage(stage + 1); });
    reward.addEventListener('click', function () {
        if (stage !== stages.length - 1 || !solved()) return;
        window.tourStickers.unlock();
        reward.disabled = true; reward.textContent = '이모티콘 획득 완료!';
    });
    window.addEventListener('blur', cancelDrag);
    function drawScreenshot(context, viewport, ratioX, ratioY) {
        if (popup.hidden) return;
        cancelDrag();
        var image = stages[stage];
        if (!image.complete || !image.naturalWidth) throw new Error('Puzzle image not ready');
        context.save();
        // Blur and dim the panorama behind the puzzle.
        var background = document.createElement('canvas');
        background.width = context.canvas.width; background.height = context.canvas.height;
        background.getContext('2d').drawImage(context.canvas, 0, 0);
        context.filter = 'blur(4px)';
        context.drawImage(background, 0, 0);
        context.filter = 'none';
        context.fillStyle = 'rgba(12,8,20,.38)';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        Array.from(board.querySelectorAll('button')).forEach(function (tile, slot) {
            var rect = tile.getBoundingClientRect();
            var piece = pieces[slot];
            var size = gridSize();
            context.drawImage(image, (piece % size) * image.naturalWidth / size, Math.floor(piece / size) * image.naturalHeight / size, image.naturalWidth / size, image.naturalHeight / size,
                (rect.left - viewport.left) * ratioX, (rect.top - viewport.top) * ratioY, rect.width * ratioX, rect.height * ratioY);
        });
        var controls = document.getElementById('puzzle-controls').getBoundingClientRect();
        context.fillStyle = '#20152b';
        context.fillRect((controls.left - viewport.left) * ratioX, (controls.top - viewport.top) * ratioY, controls.width * ratioX, controls.height * ratioY);
        context.fillStyle = '#fff'; context.font = (14 * ratioY) + 'px Arial';
        context.fillText(message.textContent, (controls.left - viewport.left + 10) * ratioX, (controls.top - viewport.top + controls.height / 2 + 5) * ratioY);
        ['puzzle-shuffle', 'puzzle-previous', 'puzzle-next', 'puzzle-buy', 'puzzle-reward', 'puzzle-close'].forEach(function (id) {
            var button = document.getElementById(id);
            if (button.hidden) return;
            var rect = button.getBoundingClientRect();
            var x = (rect.left - viewport.left) * ratioX;
            var y = (rect.top - viewport.top) * ratioY;
            context.fillStyle = id === 'puzzle-close' ? '#fff' : '#684489';
            if (id === 'puzzle-close') {
                context.beginPath(); context.ellipse(x + rect.width * ratioX / 2, y + rect.height * ratioY / 2, rect.width * ratioX / 2, rect.height * ratioY / 2, 0, 0, Math.PI * 2); context.fill();
            } else context.fillRect(x, y, rect.width * ratioX, rect.height * ratioY);
            context.fillStyle = id === 'puzzle-close' ? '#301541' : '#fff';
            context.font = ((id === 'puzzle-close' ? 36 : 14) * ratioY) + 'px Arial';
            context.textAlign = 'center'; context.textBaseline = 'middle';
            context.fillText(button.textContent, x + rect.width * ratioX / 2, y + rect.height * ratioY / 2);
        });
        context.restore();
    }
    window.tourPuzzle = {shuffle:shuffle, open:function () { cancelDrag(); clearCelebration(); stage = 0; selected = null; if (states[0]) {pieces = states[0].pieces.slice(); moves = states[0].moves; render();} else shuffle(); }, drawScreenshot:drawScreenshot, cancelDrag:function () { cancelDrag(); clearCelebration(); }};
    shuffle();
})();
