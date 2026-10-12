(function(){
    'use strict';
    var popup=document.getElementById('steak-popup'), image=document.getElementById('steak-image');
    var timer=document.getElementById('steak-timer'), status=document.getElementById('steak-status');
    var start=document.getElementById('steak-start'), stop=document.getElementById('steak-stop'), close=document.getElementById('steak-close');
    var running=false, startedAt=0, frame=null, previousView=null, previousFocus=null;
    var reward=document.getElementById('steak-reward'), cleared=false;
    reward.addEventListener('click',function(){if(!cleared)return;window.tourStickers.unlockSteak();reward.disabled=true;reward.textContent='이모티콘 획득 완료!';});
    ['pop1_2.jpg','pop1_3.jpg'].forEach(function(file){var preload=new Image();preload.src='skin/'+file;});
    function cancel(){window.tourSfx.stopCooking();running=false;if(frame)cancelAnimationFrame(frame);frame=null;stop.hidden=true;start.hidden=false;}
    function reset(){cancel();cleared=false;reward.hidden=true;image.src='skin/pop1_1.jpg';timer.textContent='0.00초';status.textContent='9.7~10.3초 사이에 멈추면 성공!';start.textContent='타이머 시작';}
    function update(){if(!running)return;timer.textContent=((performance.now()-startedAt)/1000).toFixed(2)+'초';frame=requestAnimationFrame(update);}
    start.addEventListener('click',function(){reset();running=true;window.tourSfx.play('start');window.tourSfx.startCooking();startedAt=performance.now();start.hidden=true;stop.hidden=false;status.textContent='10초에 맞춰 스탑 버튼을 눌러주세요!';stop.focus();frame=requestAnimationFrame(update);});
    stop.addEventListener('click',function(){
        if(!running)return;var milliseconds=performance.now()-startedAt;cancel();
        var won=milliseconds>=9700&&milliseconds<=10300;
        window.tourStickers.playEffect(won?'clear':'lose');
        if(won && window.matchMedia('(pointer: coarse)').matches){var bounds=image.getBoundingClientRect();window.tourStickers.celebrateAt(bounds.left+bounds.width/2,bounds.top+bounds.height/2);}
        cleared=won;reward.hidden=!won;reward.disabled=window.tourStickers.isSteakUnlocked();reward.textContent=reward.disabled?'이모티콘 획득 완료!':'이모티콘 획득';
        timer.textContent=(milliseconds/1000).toFixed(2)+'초';image.src=won?'skin/pop1_2.jpg':'skin/pop1_3.jpg';
        status.textContent=won?'클리어! 스테이크를 완벽하게 구웠어요!':milliseconds<9700?'조금 빨랐어요! 9.7~10.3초 사이에 멈추면 성공!':'조금 늦었어요! 9.7~10.3초 사이에 멈추면 성공!';
        start.textContent='다시 도전';start.focus();
    });
    window.rememberTourSteakView=function(){var v=window.tourViewer;previousView={h:v.get('view.hlookat'),v:v.get('view.vlookat'),fov:v.get('view.fov'),scene:v.get('xml.scene')};};
    window.openTourSteak=function(){previousFocus=document.activeElement;popup.hidden=false;reset();start.focus();};
    function dismiss(){cancel();popup.hidden=true;var v=window.tourViewer;if(previousView&&v.get('xml.scene')===previousView.scene)v.call('stoplookto(); stopmovements(); lookto('+[previousView.h,previousView.v,previousView.fov].join(',')+',tween(easeInOutSine,0.8),true,true);');previousView=null;if(previousFocus&&previousFocus.focus)previousFocus.focus();}
    close.addEventListener('click',dismiss);
    function pause(){if(!running)return;cancel();status.textContent='게임이 중단됐어요. 다시 시작해주세요.';start.textContent='다시 시작';}
    window.addEventListener('blur',pause);document.addEventListener('visibilitychange',function(){if(document.hidden)pause();});
    document.addEventListener('keydown',function(e){if(popup.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();}if(e.key==='Tab'){var buttons=Array.from(popup.querySelectorAll('button, a[href]')).filter(function(b){return !b.hidden;});buttons.push(document.getElementById('screenshot-button'));var i=buttons.indexOf(document.activeElement)+(e.shiftKey?-1:1);if(i<0||i>=buttons.length){e.preventDefault();buttons[e.shiftKey?buttons.length-1:0].focus();}}},true);
    window.tourSteak={drawScreenshot:function(ctx,viewport,rx,ry){if(popup.hidden||!image.complete||!image.naturalWidth)return;ctx.save();ctx.fillStyle='rgba(12,8,20,.45)';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);var rect=image.getBoundingClientRect();var scale=Math.min(rect.width/image.naturalWidth,rect.height/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,(rect.left+(rect.width-w)/2-viewport.left)*rx,(rect.top+(rect.height-h)/2-viewport.top)*ry,w*rx,h*ry);ctx.fillStyle='#fff';ctx.font=(22*ry)+'px Arial';ctx.fillText(timer.textContent,(rect.left-viewport.left)*rx,(rect.bottom-viewport.top+30)*ry);ctx.restore();}};
})();
