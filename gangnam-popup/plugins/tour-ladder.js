(function(){
    'use strict';
    var popup=document.getElementById('ladder-popup'), canvas=document.getElementById('ladder-canvas'), ctx=canvas.getContext('2d');
    var choices=Array.from(document.querySelectorAll('#ladder-choices button')), retry=document.getElementById('ladder-retry'), close=document.getElementById('ladder-close'), status=document.getElementById('ladder-status');
    var panel=document.getElementById('ladder-panel');
    var reward=document.getElementById('ladder-reward');
    reward.addEventListener('click',function(){if(!reveal||reward.hidden)return;window.tourStickers.unlockLadder();reward.disabled=true;reward.textContent='이모티콘 획득 완료!';});
    function shakeMiss(){panel.classList.remove('ladder-miss');void panel.offsetWidth;panel.classList.add('ladder-miss');}
    panel.addEventListener('animationend',function(event){if(event.animationName==='ladder-miss-shake')panel.classList.remove('ladder-miss');});
    var xs=[75,225,375], rungs=[], winning=0, path=[], progress=0, reveal=false, running=false, frame=null, previousView=null, previousFocus=null;
    function trace(start){
        var column=start, points=[{x:xs[column],y:16}];
        rungs.forEach(function(rung){if(column===rung.left||column===rung.left+1){points.push({x:xs[column],y:rung.y});column=column===rung.left?column+1:column-1;points.push({x:xs[column],y:rung.y});}});
        points.push({x:xs[column],y:360});return {column:column,points:points};
    }
    function draw(){
        ctx.clearRect(0,0,450,420);ctx.strokeStyle='#bca3d4';ctx.lineWidth=5;ctx.lineCap='round';
        xs.forEach(function(x){ctx.beginPath();ctx.moveTo(x,16);ctx.lineTo(x,360);ctx.stroke();});
        rungs.forEach(function(r){ctx.beginPath();ctx.moveTo(xs[r.left],r.y);ctx.lineTo(xs[r.left+1],r.y);ctx.stroke();});
        ctx.font='bold 22px Arial';ctx.textAlign='center';xs.forEach(function(x,i){ctx.fillStyle=reveal&&i===winning?'#a5f3b0':'#ead9ff';ctx.fillText(reveal?(i===winning?'성공!':'꽝'):'?',x,400);});
        if(!path.length)return;
        var lengths=[],total=0;for(var i=1;i<path.length;i++){var len=Math.hypot(path[i].x-path[i-1].x,path[i].y-path[i-1].y);lengths.push(len);total+=len;}
        var remaining=progress*total,position=path[0];ctx.strokeStyle='#ffd982';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(position.x,position.y);
        for(var j=1;j<path.length;j++){var length=lengths[j-1],fraction=Math.min(1,remaining/length);position={x:path[j-1].x+(path[j].x-path[j-1].x)*fraction,y:path[j-1].y+(path[j].y-path[j-1].y)*fraction};ctx.lineTo(position.x,position.y);remaining-=length;if(remaining<=0)break;}
        ctx.stroke();ctx.beginPath();ctx.arc(position.x,position.y,10,0,Math.PI*2);ctx.fillStyle='#fff2bf';ctx.fill();
    }
    function reset(){reward.hidden=true;panel.classList.remove('ladder-miss');if(frame)cancelAnimationFrame(frame);frame=null;running=false;reveal=false;path=[];progress=0;winning=Math.floor(Math.random()*3);rungs=[];for(var i=0;i<10;i++)rungs.push({left:Math.floor(Math.random()*2),y:40+i*30});choices.forEach(function(b){b.disabled=false;});retry.disabled=false;status.textContent='출발점을 선택하세요.';draw();}
    function select(index){
        if(running||reveal)return;var route=trace(index);path=route.points;running=true;choices.forEach(function(b){b.disabled=true;});retry.disabled=true;status.textContent=(index+1)+'번 사다리를 따라가는 중…';var began=performance.now();
        function animate(time){progress=Math.min(1,(time-began)/2400);draw();if(progress<1){frame=requestAnimationFrame(animate);return;}frame=null;running=false;reveal=true;window.tourStickers.playEffect(route.column===winning?'clear':'lose');retry.disabled=false;status.textContent=route.column===winning?'성공! 오늘의 뽑기왕입니다!':'꽝! 다시 한번 도전해보세요.';draw();if(route.column===winning){var rect=canvas.getBoundingClientRect();window.tourStickers.celebrateAt(rect.left+rect.width/2,rect.top+rect.height/2);}else shakeMiss();reward.hidden=route.column!==winning;reward.disabled=window.tourStickers.isLadderUnlocked();reward.textContent=reward.disabled?'이모티콘 획득 완료!':'이모티콘 획득';}
        frame=requestAnimationFrame(animate);
    }
    choices.forEach(function(button){button.addEventListener('click',function(){select(Number(button.dataset.choice));});});retry.addEventListener('click',reset);
    window.rememberTourLadderView=function(){var v=window.tourViewer;previousView={h:v.get('view.hlookat'),v:v.get('view.vlookat'),fov:v.get('view.fov'),scene:v.get('xml.scene')};};
    window.openTourLadder=function(){previousFocus=document.activeElement;popup.hidden=false;reset();choices[0].focus();};
    function dismiss(){if(frame)cancelAnimationFrame(frame);frame=null;running=false;popup.hidden=true;var v=window.tourViewer;if(previousView&&v.get('xml.scene')===previousView.scene)v.call('stoplookto(); stopmovements(); lookto('+[previousView.h,previousView.v,previousView.fov].join(',')+',tween(easeInOutSine,0.8),true,true);');previousView=null;if(previousFocus&&previousFocus.focus)previousFocus.focus();}
    close.addEventListener('click',dismiss);
    document.addEventListener('keydown',function(e){if(popup.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();}if(e.key==='Tab'){var buttons=Array.from(popup.querySelectorAll('button')).filter(function(b){return !b.disabled&&!b.hidden;});buttons.push(document.getElementById('screenshot-button'));var i=buttons.indexOf(document.activeElement)+(e.shiftKey?-1:1);if(i<0||i>=buttons.length){e.preventDefault();buttons[e.shiftKey?buttons.length-1:0].focus();}}},true);
    window.tourLadder={drawScreenshot:function(context,viewport,rx,ry){if(popup.hidden)return;context.save();context.fillStyle='rgba(12,8,20,.45)';context.fillRect(0,0,context.canvas.width,context.canvas.height);var rect=canvas.getBoundingClientRect();context.drawImage(canvas,(rect.left-viewport.left)*rx,(rect.top-viewport.top)*ry,rect.width*rx,rect.height*ry);context.restore();}};
})();
