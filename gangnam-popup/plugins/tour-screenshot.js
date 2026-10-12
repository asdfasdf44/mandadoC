(function () {
    'use strict';
    var button = document.getElementById('screenshot-button');
    var status = document.getElementById('screenshot-status');
    var statusTimer;
    function notify(message) {
        clearTimeout(statusTimer);
        status.textContent = message;
        status.hidden = false;
        statusTimer = setTimeout(function () { status.hidden = true; }, 4000);
    }
    button.addEventListener('click', function () {
        var viewer = window.tourViewer;
        if (!viewer || !viewer.webGL) {
            notify('투어가 준비된 후 다시 눌러주세요.');
            return;
        }
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        notify('스크린샷 촬영 중…');
        requestAnimationFrame(function () {
            try {
                var canvas = viewer.webGL.makeScreenshot(0, 0, true, 'canvas');
                if (!canvas) throw new Error('Capture returned no image');
                if (window.tourSfx) window.tourSfx.play('shutter');
                // CSS-rendered icon hotspots are outside the WebGL capture.
                var context = canvas.getContext('2d');
                var viewport = viewer.webGL.canvas.getBoundingClientRect();
                var ratioX = canvas.width / viewport.width;
                var ratioY = canvas.height / viewport.height;
                for (var i = 0; i < viewer.hotspot.count; i++) {
                    var hotspot = viewer.hotspot.getItem(i);
                    if (!hotspot || hotspot.visible === false || hotspot.alpha === 0 || !hotspot.sprite) continue;
                    if (String(hotspot.renderer).toLowerCase() !== 'css3d') continue;
                    var sprite = hotspot.sprite;
                    var image = sprite.tagName === 'IMG' ? sprite : sprite.querySelector('img');
                    if (!image || !image.complete || !image.naturalWidth) continue;
                    var bounds = image.getBoundingClientRect();
                    if (!bounds.width || !bounds.height) continue;
                    context.save();
                    context.globalAlpha = hotspot.alpha == null ? 1 : Number(hotspot.alpha);
                    context.drawImage(image, (bounds.left - viewport.left) * ratioX, (bounds.top - viewport.top) * ratioY, bounds.width * ratioX, bounds.height * ratioY);
                    context.restore();
                }
                if (window.tourStickers) window.tourStickers.drawScreenshot(context, viewport, ratioX, ratioY);
                if (window.tourPuzzle) window.tourPuzzle.drawScreenshot(context, viewport, ratioX, ratioY);
                if (window.tourPaint) window.tourPaint.drawScreenshot(context, viewport, ratioX, ratioY);
                if (window.tourRunner) window.tourRunner.drawScreenshot(context, viewport, ratioX, ratioY);
                if (window.tourDifference) window.tourDifference.drawScreenshot(context, viewport, ratioX, ratioY);
                if (window.tourSteak) window.tourSteak.drawScreenshot(context, viewport, ratioX, ratioY);
                if (window.tourLadder) window.tourLadder.drawScreenshot(context, viewport, ratioX, ratioY);
                if (window.tourDodge) window.tourDodge.drawScreenshot(context, viewport, ratioX, ratioY);
                if (window.tourColor) window.tourColor.drawScreenshot(context, viewport, ratioX, ratioY);
                var scene = viewer.get('xml.scene') || 'tour';
                var name = String(scene).replace(/^scene_/, '').replace(/[^a-z0-9_-]/gi, '_');
                var now = new Date();
                var stamp = [now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()].map(function (part) { return String(part).padStart(2, '0'); }).join('-');
                canvas.toBlob(function (blob) {
                    try {
                        if (!blob) throw new Error('PNG encoding failed');
                        var url = URL.createObjectURL(blob);
                        var link = document.createElement('a');
                        link.href = url;
                        link.download = name + '_' + stamp + '.png';
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
                        notify('스크린샷 다운로드를 시작했습니다.');
                    } catch (error) {
                        console.error('Screenshot download failed', error);
                        notify('저장에 실패했습니다. 다시 시도해주세요.');
                    } finally {
                        button.disabled = false;
                        button.removeAttribute('aria-busy');
                    }
                }, 'image/png');
            } catch (error) {
                console.error('Screenshot capture failed', error);
                notify('촬영에 실패했습니다. 다시 시도해주세요.');
                button.disabled = false;
                button.removeAttribute('aria-busy');
            }
        });
    });
})();
