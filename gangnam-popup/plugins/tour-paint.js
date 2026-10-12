(function () {
    'use strict';
    var popup = document.getElementById('paint-popup');
    var canvas = document.getElementById('paint-canvas');
    var context = canvas.getContext('2d');
    var gray = document.createElement('canvas');
    var grayContext = gray.getContext('2d', {willReadFrequently:true});
    var brush = document.getElementById('paint-brush');
    var reward = document.getElementById('paint-reward');
    var status = document.getElementById('paint-status');
    var close = document.getElementById('paint-close');
    var image = new Image();
    var ready = false, cleared = false, active = false;
    var stroke = null, previousView = null, previousFocus = null;
    var covered = new Set();
    var preview = document.createElement('div');
    preview.id = 'paint-brush-preview'; preview.innerHTML = brush.querySelector('svg').outerHTML; preview.hidden = true;
    document.body.appendChild(preview);
    function draw() {
        context.clearRect(0,0,canvas.width,canvas.height);
        context.drawImage(image,0,0,canvas.width,canvas.height);
        if (!cleared) context.drawImage(gray,0,0);
    }
    image.onload = function () {
        canvas.width = gray.width = image.naturalWidth;
        canvas.height = gray.height = image.naturalHeight;
        grayContext.filter = 'grayscale(1)'; grayContext.drawImage(image,0,0); grayContext.filter = 'none';
        ready = true; draw();
    };
    image.onerror = function () { status.textContent = '그림을 불러오지 못했습니다. 새로고침해주세요.'; };
    image.src = 'skin/pop3.png';
    function paint(x,y) {
        var rect = canvas.getBoundingClientRect();
        if (x<rect.left || x>rect.right || y<rect.top || y>rect.bottom) { window.tourSfx.stopPencil(); if (stroke) stroke.last = null; return; }
        var point = {x:(x-rect.left)*canvas.width/rect.width,y:(y-rect.top)*canvas.height/rect.height};
        var radius = 28 * canvas.width / rect.width;
        var last = stroke.last || point;
        if (!stroke.last || Math.hypot(point.x-last.x,point.y-last.y)>1) window.tourSfx.strokePencil();
        grayContext.save(); grayContext.globalCompositeOperation = 'destination-out';
        grayContext.lineWidth = radius * 2; grayContext.lineCap = 'round'; grayContext.strokeStyle = '#000';
        grayContext.beginPath(); grayContext.moveTo(last.x,last.y); grayContext.lineTo(point.x,point.y); grayContext.stroke();
        grayContext.beginPath(); grayContext.arc(point.x,point.y,radius,0,Math.PI*2); grayContext.fill(); grayContext.restore();
        // Sample a regular grid along the entire stroke, including its rounded ends.
        var steps = Math.max(1,Math.ceil(Math.hypot(point.x-last.x,point.y-last.y)/(radius/3)));
        for (var step=0;step<=steps;step++) {
            var cx=last.x+(point.x-last.x)*step/steps, cy=last.y+(point.y-last.y)*step/steps;
            for(var gy=Math.max(0,Math.floor((cy-radius)/canvas.height*60));gy<Math.min(60,Math.ceil((cy+radius)/canvas.height*60));gy++) {
                for(var gx=Math.max(0,Math.floor((cx-radius)/canvas.width*60));gx<Math.min(60,Math.ceil((cx+radius)/canvas.width*60));gx++) {
                    if(Math.hypot((gx+.5)*canvas.width/60-cx,(gy+.5)*canvas.height/60-cy)<=radius) covered.add(gy*60+gx);
                }
            }
        }
        stroke.last = point;
        var progress = covered.size / 3600;
        status.textContent = '색칠 진행 ' + Math.floor(progress*100) + '% · 붓으로 그림을 문질러주세요.';
        if (progress >= .98) {
            cleared = true; canvas.classList.add('cleared');
            window.tourStickers.playEffect('clear');
            if (window.matchMedia('(pointer: coarse)').matches) {
                var bounds = canvas.getBoundingClientRect();
                window.tourStickers.celebrateAt(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
            }
            reward.hidden = false; reward.disabled = window.tourStickers.isPaintUnlocked();
            reward.textContent = reward.disabled ? '이모티콘 획득 완료!' : '이모티콘 획득';
            status.textContent = '클리어! 그림을 모두 색칠했어요.';
        }
        draw();
    }
    function stop() { window.tourSfx.stopPencil(); stroke=null; active=false; brush.classList.remove('active'); preview.hidden=true; }
    function begin(event, fromBrush) {
        if (!ready || cleared || (!active && !fromBrush) || event.button!==0) return;
        event.preventDefault(); event.stopPropagation();
        window.tourSfx.play('brush');
        active=true; brush.classList.add('active'); stroke={id:event.pointerId,last:null};
        event.currentTarget.setPointerCapture(event.pointerId);
        (document.fullscreenElement||document.body).appendChild(preview);
        preview.hidden=false; preview.style.left=event.clientX+'px'; preview.style.top=event.clientY+'px';
        paint(event.clientX,event.clientY);
    }
    brush.addEventListener('pointerdown',function(event){begin(event,true);});
    document.addEventListener('pointermove',function(event){
        if(!stroke||stroke.id!==event.pointerId||cleared)return;
        preview.style.left=event.clientX+'px';preview.style.top=event.clientY+'px';paint(event.clientX,event.clientY);
    });
    document.addEventListener('pointerup',stop); document.addEventListener('pointercancel',stop); window.addEventListener('blur',stop);
    window.rememberTourPaintView=function(){
        var viewer=window.tourViewer;
        previousView={h:viewer.get('view.hlookat'),v:viewer.get('view.vlookat'),fov:viewer.get('view.fov'),scene:viewer.get('xml.scene')};
    };
    window.openTourPaint=function(){
        previousFocus=document.activeElement;popup.hidden=false;close.focus();
        if(!ready)status.textContent='그림을 불러오는 중…';
        else if(!cleared)status.textContent='붓을 그림으로 드래그한 뒤 문질러 색칠하세요.';
        if(cleared){reward.disabled=window.tourStickers.isPaintUnlocked();reward.textContent=reward.disabled?'이모티콘 획득 완료!':'이모티콘 획득';}
    };
    function dismiss(){
        stop();popup.hidden=true;
        var viewer=window.tourViewer;
        if(previousView&&viewer.get('xml.scene')===previousView.scene)viewer.call('stoplookto(); stopmovements(); lookto('+[previousView.h,previousView.v,previousView.fov].join(',')+',tween(easeInOutSine,0.8),true,true);');
        previousView=null;if(previousFocus&&previousFocus.focus)previousFocus.focus();
    }
    close.addEventListener('click',dismiss);
    popup.addEventListener('keydown',function(event){
        if(event.key==='Escape'){event.preventDefault();event.stopPropagation();}
        if(event.key==='Tab'){
            var buttons=Array.from(popup.querySelectorAll('button, a[href]')).filter(function(button){return !button.hidden&&!button.disabled;});buttons.push(document.getElementById('screenshot-button'));
            var index=buttons.indexOf(document.activeElement)+(event.shiftKey?-1:1);
            if(index<0||index>=buttons.length){event.preventDefault();buttons[event.shiftKey?buttons.length-1:0].focus();}
        }
    });
    reward.addEventListener('click',function(){if(!cleared)return;window.tourStickers.unlockPaint();reward.disabled=true;reward.textContent='이모티콘 획득 완료!';});
    window.tourPaint={drawScreenshot:function(ctx,viewport,rx,ry){
        if(popup.hidden||!ready)return;
        ctx.save();ctx.fillStyle='rgba(12,8,20,.45)';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
        var rect=canvas.getBoundingClientRect();ctx.drawImage(canvas,(rect.left-viewport.left)*rx,(rect.top-viewport.top)*ry,rect.width*rx,rect.height*ry);
        var text=status.getBoundingClientRect();ctx.fillStyle='#20152b';ctx.fillRect((text.left-viewport.left)*rx,(text.top-viewport.top)*ry,text.width*rx,text.height*ry);
        ctx.fillStyle='#fff';ctx.font=(14*ry)+'px Arial';ctx.fillText(status.textContent,(text.left-viewport.left+10)*rx,(text.top-viewport.top+22)*ry);ctx.restore();
    }};
})();
