(function () {
    'use strict';
    var palette = document.getElementById('sticker-palette');
    var palette3 = document.getElementById('sticker-palette-3');
    var palette4 = document.getElementById('sticker-palette-4');
    var palette5 = document.getElementById('sticker-palette-5');
    var palette10 = document.getElementById('sticker-palette-10');
    var palette1 = document.getElementById('sticker-palette-1');
    var palette6 = document.getElementById('sticker-palette-6');
    var palette7 = document.getElementById('sticker-palette-7');
    var layer = document.getElementById('sticker-layer');
    var trash = document.getElementById('sticker-trash');
    var reset = document.getElementById('tour-reset');
    var key = 'vtour-p2i-reward-v1';
    var unlocked = false;
    var unlocked3 = false;
    var unlocked4 = false;
    var unlocked5 = false;
    var unlocked10 = false;
    var unlocked1 = false;
    var unlocked6 = false;
    var unlocked7 = false;
    var stickers = [];
    var drag = null;
    var uiPress = null;
    var effectSounds = {};
    ['put','get','clear','lose'].forEach(function (name) {
        var sound = new Audio('skin/' + name + '.mp3');
        sound.preload = 'auto'; sound.volume = name === 'lose' ? .4 : .8; sound.load(); effectSounds[name] = sound;
    });
    var sceneReady = false;
    var transitionInitialized = false;
    function hideForTransition() {
        transitionInitialized = true; sceneReady = false;
        cancel(); layer.style.transition = 'none'; layer.style.opacity = '0'; layer.style.visibility = 'hidden';
    }
    function showAfterTransition() {
        transitionInitialized = true; sceneReady = true;
        layer.style.visibility = 'visible';
        void layer.offsetWidth;
        layer.style.transition = 'opacity .3s ease'; layer.style.opacity = '1';
    }
    try {
        var saved = JSON.parse(localStorage.getItem(key) || '{}');
        unlocked = saved.unlocked === true;
        unlocked3 = saved.unlocked3 === true;
        unlocked4 = saved.unlocked4 === true;
        unlocked5 = saved.unlocked5 === true; unlocked10 = saved.unlocked10 === true;
        unlocked1 = saved.unlocked1 === true;
        unlocked6 = saved.unlocked6 === true;
        unlocked7 = saved.unlocked7 === true;
        if (Array.isArray(saved.stickers)) saved.stickers.forEach(function (item) {
            if (isTypeUnlocked(item.type) && /^scene_day_[123]$/.test(item.scene) && Number.isFinite(item.h) && Number.isFinite(item.v)) add(item);
        });
    } catch (_) {}
    function isTypeUnlocked(type) { return ({p1i:unlocked1,p2i:unlocked,p3i:unlocked3,p4i:unlocked4,p5i:unlocked5,p6i:unlocked6,p7i:unlocked7,p10i:unlocked10})[type || 'p2i'] === true; }
    function persist() {
        try { localStorage.setItem(key, JSON.stringify({unlocked:unlocked, unlocked1:unlocked1, unlocked6:unlocked6, unlocked7:unlocked7, unlocked3:unlocked3, unlocked4:unlocked4, unlocked5:unlocked5, unlocked10:unlocked10, stickers:stickers.map(function (item) { return {type:item.type,scene:item.scene,h:item.h,v:item.v,baseFov:item.baseFov,baseViewport:item.baseViewport}; })})); } catch (_) {}
    }
    function updatePalette() {
        palette.disabled = !unlocked;
        palette.title = unlocked ? '드래그해서 원하는 곳에 놓으세요' : '퍼즐 3단계를 클리어하면 사용할 수 있어요';
        palette.setAttribute('aria-label', unlocked ? '이모티콘 드래그해서 배치' : '잠긴 이모티콘');
        palette3.disabled = !unlocked3;
        palette3.title = unlocked3 ? '드래그해서 원하는 곳에 놓으세요' : '색칠 게임을 클리어하면 사용할 수 있어요';
        palette3.setAttribute('aria-label', unlocked3 ? '색칠 보상 이모티콘 드래그해서 배치' : '잠긴 색칠 보상 이모티콘');
        palette4.disabled = !unlocked4;
        palette4.title = unlocked4 ? '드래그해서 원하는 곳에 놓으세요' : '점프 게임을 클리어하면 사용할 수 있어요';
        palette4.setAttribute('aria-label', unlocked4 ? '점프 보상 이모티콘 드래그해서 배치' : '잠긴 점프 보상 이모티콘');
        palette5.disabled = !unlocked5;
        palette5.title = unlocked5 ? '드래그해서 원하는 곳에 놓으세요' : '틀린그림찾기를 클리어하면 사용할 수 있어요';
        palette5.setAttribute('aria-label', unlocked5 ? '틀린그림찾기 보상 이모티콘 드래그해서 배치' : '잠긴 틀린그림찾기 보상 이모티콘');
        palette10.disabled = !unlocked10;
        palette10.title = unlocked10 ? '드래그해서 원하는 곳에 놓으세요' : '사다리 게임에서 성공하면 사용할 수 있어요';
        palette10.setAttribute('aria-label', unlocked10 ? '사다리 보상 이모티콘 드래그해서 배치' : '잠긴 사다리 보상 이모티콘');
        palette1.disabled = !unlocked1;
        palette1.title = unlocked1 ? '드래그해서 원하는 곳에 놓으세요' : '파인 다이닝 게임을 클리어하면 사용할 수 있어요';
        palette1.setAttribute('aria-label', unlocked1 ? '파인 다이닝 보상 이모티콘 드래그해서 배치' : '잠긴 파인 다이닝 보상 이모티콘');
        palette6.disabled = !unlocked6;
        palette6.title = unlocked6 ? '드래그해서 원하는 곳에 놓으세요' : '럭키참스 게임을 클리어하면 사용할 수 있어요';
        palette6.setAttribute('aria-label', unlocked6 ? '럭키참스 보상 이모티콘 드래그해서 배치' : '잠긴 럭키참스 보상 이모티콘');
        palette7.disabled = !unlocked7;
        palette7.title = unlocked7 ? '드래그해서 원하는 곳에 놓으세요' : '색감 테스트를 클리어하면 사용할 수 있어요';
        palette7.setAttribute('aria-label', unlocked7 ? '색감 테스트 보상 이모티콘 드래그해서 배치' : '잠긴 색감 테스트 보상 이모티콘');
        [palette,palette1,palette3,palette4,palette5,palette6,palette7,palette10].forEach(function(button){if(button.disabled)button.title='';});
    }
    function add(data) {
        var item = {scene:data.scene,h:data.h,v:data.v,baseFov:Number.isFinite(data.baseFov) && data.baseFov > 0 && data.baseFov < 179 ? data.baseFov : null,baseViewport:Number.isFinite(data.baseViewport) && data.baseViewport > 0 ? data.baseViewport : null};
        item.type = ['p1i','p2i','p3i','p4i','p5i','p6i','p7i','p10i'].includes(data.type) ? data.type : 'p2i';
        item.image = document.createElement('img');
        item.image.src = 'skin/' + item.type + '.png'; item.image.alt = '배치된 이모티콘';
        item.image.draggable = false; item.image.className = 'tour-sticker';
        item.image.dataset.stickerType = item.type;
        item.image.style.setProperty('--float-delay', (-Math.random() * 3.2) + 's');
        item.image.addEventListener('pointerdown', function (event) { start(event, item); });
        layer.appendChild(item.image); stickers.push(item); return item;
    }
    function modalOpen() {
        return !document.getElementById('puzzle-popup').hidden || !document.getElementById('welcome-popup').hidden || !document.getElementById('paint-popup').hidden || !document.getElementById('runner-popup').hidden || !document.getElementById('difference-popup').hidden || !document.getElementById('steak-popup').hidden || !document.getElementById('ladder-popup').hidden || !document.getElementById('dodge-popup').hidden || !document.getElementById('color-popup').hidden || !document.getElementById('tutorial-popup').hidden;
    }
    function playEffect(name) {
        if (name === 'put' && window.tourSfx && window.tourSfx.playPut()) return;
        var sound = effectSounds[name];
        if (!sound) return;
        sound.currentTime = 0;
        var playback = sound.play();
        if (playback && playback.catch) playback.catch(function () {});
    }
    function flyReward(type, target, sourceId) {
        playEffect('get');
        var source = document.getElementById(sourceId);
        var destination = target.getBoundingClientRect();
        function arrive() { updatePalette(); burstAt(destination.left + destination.width / 2, destination.top + destination.height / 2); }
        if (!source || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { arrive(); return; }
        var origin = source.getBoundingClientRect();
        var image = document.createElement('img'); image.src = 'skin/' + type + '.png';
        image.alt = ''; image.setAttribute('aria-hidden', 'true');
        image.style.cssText = 'position:fixed;width:96px;height:96px;object-fit:contain;pointer-events:none;z-index:40003;filter:drop-shadow(0 0 14px #ead9ff);';
        image.style.left = (origin.left + origin.width / 2 - 48) + 'px';
        image.style.top = (origin.top + origin.height / 2 - 48) + 'px';
        (document.fullscreenElement || document.body).appendChild(image);
        var dx = destination.left + destination.width / 2 - origin.left - origin.width / 2;
        var dy = destination.top + destination.height / 2 - origin.top - origin.height / 2;
        var animation = image.animate([
            {transform:'translate(0,0) scale(.2)',opacity:0,offset:0},
            {transform:'translate(0,-20px) scale(1.15)',opacity:1,offset:.2},
            {transform:'translate(' + (dx * .45) + 'px,' + (dy * .45 - 70) + 'px) scale(1)',opacity:1,offset:.55},
            {transform:'translate(' + dx + 'px,' + dy + 'px) scale(.8)',opacity:1,offset:1}
        ], {duration:1050,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'});
        animation.onfinish = function () { image.remove(); arrive(); };
        animation.oncancel = function () { image.remove(); updatePalette(); };
    }
    function burstAt(x, y) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        var root = document.fullscreenElement || document.body;
        var bounds = root.getBoundingClientRect();
        var burst = document.createElement('div');
        burst.className = 'sticker-burst'; burst.setAttribute('aria-hidden', 'true');
        burst.style.left = (x - (document.fullscreenElement ? bounds.left : 0)) + 'px';
        burst.style.top = (y - (document.fullscreenElement ? bounds.top : 0)) + 'px';
        var colors = ['#ffe89a','#ff94d2','#b58aff','#91efff','#ffffff'];
        for (var wave = 0; wave < 2; wave++) {
            var ring = document.createElement('span'); ring.className = 'sticker-burst-ring';
            ring.style.animationDelay = (wave * .2) + 's'; burst.appendChild(ring);
            for (var i = 0; i < 32; i++) {
                var dot = document.createElement('span'); dot.className = 'sticker-burst-dot';
                var angle = i * Math.PI * 2 / 32 + wave * .1;
                var distance = Math.min(window.innerWidth * .35, 230) * (.65 + Math.random() * .35);
                dot.style.setProperty('--x', (Math.cos(angle) * distance) + 'px');
                dot.style.setProperty('--y', (Math.sin(angle) * distance + 40) + 'px');
                dot.style.setProperty('--spin', (Math.random() * 540) + 'deg');
                dot.style.setProperty('--color', colors[i % colors.length]);
                dot.style.animationDelay = (wave * .2) + 's'; burst.appendChild(dot);
            }
        }
        root.appendChild(burst);
        setTimeout(function () { burst.remove(); }, 1800);
    }
    function start(event, item, type) {
        var viewer = window.tourViewer;
        type = item ? item.type : (type || 'p2i');
        if (!isTypeUnlocked(type) || !sceneReady || !viewer || event.button !== 0 || modalOpen() || drag) return;
        event.preventDefault(); event.stopPropagation();
        viewer.call('stoplookto(); stopmovements();');
        var image = document.createElement('img'); image.src = 'skin/' + type + '.png'; image.className = 'tour-sticker';
        if (item) { image.style.width = item.image.style.width; image.style.height = item.image.style.height; }
        image.style.pointerEvents = 'none'; image.style.zIndex = '30001';
        (document.fullscreenElement || document.body).appendChild(image);
        drag = {type:type,item:item,image:image,id:event.pointerId,scene:viewer.get('xml.scene'),x:event.clientX,y:event.clientY};
        if (item) item.image.style.visibility = 'hidden';
        image.style.left = event.clientX + 'px'; image.style.top = event.clientY + 'px';
        event.currentTarget.setPointerCapture(event.pointerId);
    }
    function cancel() {
        if (!drag) return;
        trash.classList.remove('drop-active');
        if (drag.item) drag.item.image.style.visibility = '';
        drag.image.remove(); drag = null;
    }
    palette.addEventListener('pointerdown', function (event) { start(event, null); });
    palette3.addEventListener('pointerdown', function (event) { start(event, null, 'p3i'); });
    palette4.addEventListener('pointerdown', function (event) { start(event, null, 'p4i'); });
    palette5.addEventListener('pointerdown', function (event) { start(event, null, 'p5i'); });
    palette10.addEventListener('pointerdown', function (event) { start(event, null, 'p10i'); });
    palette1.addEventListener('pointerdown', function (event) { start(event, null, 'p1i'); });
    palette6.addEventListener('pointerdown', function (event) { start(event, null, 'p6i'); });
    palette7.addEventListener('pointerdown', function (event) { start(event, null, 'p7i'); });
    [palette, palette1, palette3, palette4, palette5, palette6, palette7, palette10].forEach(function (button) {
        button.addEventListener('pointerdown', function (event) {
            if (!button.disabled && event.button === 0) uiPress = {id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
        });
        button.addEventListener('click', function (event) { if (!button.disabled && event.detail === 0) playEffect('put'); });
    });
    var rewardHints = [
        [palette,'유연랩'], [palette1,'파인 다이닝'], [palette3,'콘알트'],
        [palette4,'아트핏'], [palette5,'유어 네스트'], [palette6,'럭키참스'],
        [palette7,'수이과슈'], [palette10,'내일은 뽑기왕!!']
    ];
    var hoveredReward = null;
    rewardHints.forEach(function (entry) {
        var button=entry[0];
        button.addEventListener('pointerenter',function () {
            if(!button.disabled)return;
            hoveredReward=button;
            window.showTourIconLabel(entry[1]+'에서 게임을 클리어하고 이모티콘을 획득하세요!');
        });
        button.addEventListener('pointerleave',function () {
            if(hoveredReward===button){hoveredReward=null;window.hideTourIconLabel();}
        });
        button.title='';
    });
    var deleteDialog = document.createElement('div');
    deleteDialog.id = 'sticker-delete-dialog'; deleteDialog.hidden = true;
    deleteDialog.setAttribute('role', 'dialog'); deleteDialog.setAttribute('aria-modal', 'true');
    deleteDialog.setAttribute('aria-labelledby', 'sticker-delete-message');
    deleteDialog.innerHTML = '<div><p id="sticker-delete-message">모든 이모티콘을 제거할까요?</p><button id="sticker-delete-yes" type="button">예</button><button id="sticker-delete-no" type="button">아니오</button></div>';
    document.body.appendChild(deleteDialog);
    var deleteYes = deleteDialog.querySelector('#sticker-delete-yes');
    var deleteNo = deleteDialog.querySelector('#sticker-delete-no');
    var confirmationAction = 'delete';
    function closeDeleteDialog() { deleteDialog.hidden = true; (confirmationAction === 'reset' ? reset : trash).focus(); }
    trash.addEventListener('click', function () {
        confirmationAction = 'delete';
        deleteDialog.querySelector('#sticker-delete-message').textContent = '모든 이모티콘을 제거할까요?';
        (document.fullscreenElement || document.body).appendChild(deleteDialog);
        deleteDialog.hidden = false; deleteNo.focus();
    });
    reset.addEventListener('click', function () {
        confirmationAction = 'reset';
        deleteDialog.querySelector('#sticker-delete-message').textContent = '처음부터 다시 시작할까요?';
        (document.fullscreenElement || document.body).appendChild(deleteDialog);
        deleteDialog.hidden = false; deleteNo.focus();
    });
    deleteNo.addEventListener('click', closeDeleteDialog);
    deleteDialog.addEventListener('click', function (event) { if (event.target === deleteDialog) closeDeleteDialog(); });
    deleteDialog.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeDeleteDialog(); }
        if (event.key === 'Tab') { event.preventDefault(); (document.activeElement === deleteYes ? deleteNo : deleteYes).focus(); }
    });
    deleteYes.addEventListener('click', function () {
        cancel();
        if (confirmationAction === 'reset') {
            unlocked = false;
            unlocked3 = false;
            unlocked4 = false;
            unlocked5 = false; unlocked10 = false;
            unlocked1 = false;
            unlocked6 = false;
            unlocked7 = false;
            stickers.forEach(function (item) { item.image.remove(); });
            stickers = [];
            updatePalette();
            try { localStorage.removeItem(key); } catch (_) {}
            window.location.reload();
            return;
        }
        stickers.forEach(function (item) { item.image.remove(); });
        stickers = [];
        persist();
        closeDeleteDialog();
    });
    document.addEventListener('pointermove', function (event) {
        if (uiPress && uiPress.id === event.pointerId && Math.hypot(event.clientX-uiPress.x,event.clientY-uiPress.y)>6) uiPress.moved=true;
        if (!drag || event.pointerId !== drag.id) return;
        drag.x = event.clientX; drag.y = event.clientY;
        drag.image.style.left = drag.x + 'px'; drag.image.style.top = drag.y + 'px';
        var hit = document.elementFromPoint(event.clientX, event.clientY);
        trash.classList.toggle('drop-active', !!(drag.item && hit && hit.closest('#sticker-trash')));
    });
    document.addEventListener('pointerup', function (event) {
        if (uiPress && uiPress.id === event.pointerId) {
            if (!uiPress.moved && Math.hypot(event.clientX-uiPress.x,event.clientY-uiPress.y)<=6) playEffect('put');
            uiPress = null;
        }
        if (!drag || event.pointerId !== drag.id) return;
        var viewer = window.tourViewer;
        var rect = viewer.webGL.canvas.getBoundingClientRect();
        var hit = document.elementFromPoint(event.clientX,event.clientY);
        if (hit && hit.closest('#sticker-trash')) {
            if (drag.item) {
                drag.item.image.remove();
                stickers = stickers.filter(function (item) { return item !== drag.item; });
                persist();
            }
            cancel();
            return;
        }
        var blocked = hit && hit.closest('#sticker-palette, #sticker-palette-1, #sticker-palette-3, #sticker-palette-4, #sticker-palette-5, #sticker-palette-6, #sticker-palette-7, #sticker-palette-10, #sticker-trash, #tour-reset, #screenshot-button, #puzzle-popup, #welcome-popup, #paint-popup, #runner-popup, #difference-popup, #steak-popup, #ladder-popup, #dodge-popup, #color-popup, #tutorial-popup');
        if (!blocked && drag.scene === viewer.get('xml.scene') && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) {
            var point = viewer.actions.screentosphere((event.clientX - rect.left) * viewer.get('stagewidth') / rect.width, (event.clientY - rect.top) * viewer.get('stageheight') / rect.height);
            if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) {
                if (drag.item) { drag.item.h = point.x; drag.item.v = point.y; }
                else add({type:drag.type,scene:drag.scene,h:point.x,v:point.y,baseFov:Number(viewer.get('view.fov')),baseViewport:Math.min(rect.width,rect.height)});
                persist();
                playEffect('put');
            }
        }
        cancel();
    });
    document.addEventListener('pointercancel', function () { uiPress = null; cancel(); });
    window.addEventListener('blur', cancel);
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') cancel(); });
    function update() {
        var viewer = window.tourViewer;
        if (viewer && viewer.webGL) {
            if (!transitionInitialized && Number(viewer.get('image.loadstate')) === 3) showAfterTransition();
            var rect = viewer.webGL.canvas.getBoundingClientRect();
            var root = layer.getBoundingClientRect();
            var migrated = false;
            stickers.forEach(function (item) {
                var point = item.scene === viewer.get('xml.scene') ? viewer.actions.spheretoscreen(item.h,item.v) : null;
                item.image.hidden = !point || !Number.isFinite(point.x) || !Number.isFinite(point.y);
                if (!item.image.hidden) {
                    var fov = Number(viewer.get('view.fov'));
                    if (!item.baseFov || !item.baseViewport) {
                        item.baseFov = fov; item.baseViewport = Math.min(rect.width,rect.height); migrated = true;
                    }
                    var size = 100 * Math.tan(item.baseFov * Math.PI / 360) / Math.tan(fov * Math.PI / 360) * Math.min(rect.width,rect.height) / item.baseViewport;
                    item.image.style.width = size + 'px';
                    item.image.style.height = size + 'px';
                    item.image.style.left = (rect.left-root.left + point.x * rect.width / viewer.get('stagewidth')) + 'px';
                    item.image.style.top = (rect.top-root.top + point.y * rect.height / viewer.get('stageheight')) + 'px';
                }
            });
            if (migrated) persist();
        }
        requestAnimationFrame(update);
    }
    window.tourStickers = {
        hideForTransition:hideForTransition,
        showAfterTransition:showAfterTransition,
        celebrateAt:burstAt,
        playEffect:playEffect,
        isUnlocked:function () { return unlocked; },
        isPaintUnlocked:function () { return unlocked3; },
        isRunnerUnlocked:function () { return unlocked4; },
        isDifferenceUnlocked:function () { return unlocked5; },
        isLadderUnlocked:function () { return unlocked10; },
        isSteakUnlocked:function () { return unlocked1; },
        isDodgeUnlocked:function () { return unlocked6; },
        isColorUnlocked:function () { return unlocked7; },
        unlockColor:function () {
            if (unlocked7) return;
            unlocked7 = true; persist(); flyReward('p7i',palette7,'color-reward');
        },
        unlockDodge:function () {
            if (unlocked6) return;
            unlocked6 = true; persist(); flyReward('p6i',palette6,'dodge-reward');
        },
        unlockSteak:function () {
            if (unlocked1) return;
            unlocked1 = true; persist(); flyReward('p1i',palette1,'steak-reward');
        },
        unlockLadder:function () {
            if (unlocked10) return;
            unlocked10 = true; persist(); flyReward('p10i',palette10,'ladder-reward');
        },
        unlockDifference:function () {
            if (unlocked5) return;
            unlocked5 = true; persist(); flyReward('p5i',palette5,'difference-reward');
        },
        unlockRunner:function () {
            if (unlocked4) return;
            unlocked4 = true; persist(); flyReward('p4i',palette4,'runner-reward');
        },
        unlockPaint:function () {
            if (unlocked3) return;
            unlocked3 = true; persist(); flyReward('p3i',palette3,'paint-reward');
        },
        unlock:function () {
            if (unlocked) return;
            unlocked = true; persist(); flyReward('p2i',palette,'puzzle-reward');
        },
        drawScreenshot:function (context, viewport, ratioX, ratioY) {
            if (!sceneReady) return;
            stickers.forEach(function (item) {
                if (item.image.hidden || !item.image.complete || !item.image.naturalWidth) return;
                var rect = item.image.getBoundingClientRect();
                context.drawImage(item.image,(rect.left-viewport.left)*ratioX,(rect.top-viewport.top)*ratioY,rect.width*ratioX,rect.height*ratioY);
            });
        }
    };
    updatePalette(); update();
})();
