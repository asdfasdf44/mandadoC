(function () {
    'use strict';
    var popup=document.getElementById('runner-popup'), canvas=document.getElementById('runner-canvas');
    var ctx=canvas.getContext('2d'), status=document.getElementById('runner-status');
    var start=document.getElementById('runner-start'), jumpButton=document.getElementById('runner-jump'), close=document.getElementById('runner-close');
    var reward=document.getElementById('runner-reward');
    var horse=new Image(), block=new Image(), assets=0, horseCrop=null;
    var state='idle', elapsed=0, distance=0, y=0, velocity=0, obstacles=[], nextSpawn=0;
    var lastTime=0, frame=null, previousView=null, previousFocus=null;
    var ground=350, horseX=150, horseWidth=110, horseHeight=86, speed=265;
    function loaded(){assets++;if(assets===2){start.disabled=false;draw();}}
    horse.onload=function(){
        var buffer=document.createElement('canvas');buffer.width=horse.naturalWidth;buffer.height=horse.naturalHeight;
        var c=buffer.getContext('2d');c.drawImage(horse,0,0);var data=c.getImageData(0,0,buffer.width,buffer.height).data;
        var left=buffer.width,top=buffer.height,right=0,bottom=0;
        for(var py=0;py<buffer.height;py++)for(var px=0;px<buffer.width;px++)if(data[(py*buffer.width+px)*4+3]>30){left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);}
        horseCrop=right>=left?{x:left,y:top,w:right-left+1,h:bottom-top+1}:{x:0,y:0,w:buffer.width,h:buffer.height};loaded();
    };
    block.onload=loaded;
    function assetError(){status.textContent='게임 이미지를 불러오지 못했습니다. 새로고침해주세요.';start.disabled=true;}
    horse.onerror=block.onerror=assetError;start.disabled=true;
    horse.src='skin/pop4_horse.png';block.src='skin/pop4_block.png';
    function jump(){if(state==='running'&&elapsed<15&&y===0){velocity=650;window.tourSfx.play('jump');}}
    function draw(){
        var sky=ctx.createLinearGradient(0,0,0,ground);sky.addColorStop(0,'#d7c9ff');sky.addColorStop(1,'#fff3df');ctx.fillStyle=sky;ctx.fillRect(0,0,900,440);
        for(var i=0;i<6;i++){var x=i*220-(distance*.3)%220;ctx.fillStyle=i%2?'#c6b7dc':'#b9b6d0';ctx.beginPath();ctx.moveTo(x-100,ground);ctx.lineTo(x+60,190);ctx.lineTo(x+230,ground);ctx.fill();}
        ctx.fillStyle='#6d665a';ctx.fillRect(0,ground,900,90);ctx.fillStyle='#d7ba84';ctx.fillRect(0,ground,900,5);
        ctx.fillStyle='#e8d9b3';for(var mark=0;mark<18;mark++)ctx.fillRect(mark*60-distance%60,ground+45,25,3);
        if(assets===2){
            var bob=state==='running'&&y===0?Math.sin(elapsed*25)*3:0;
            ctx.drawImage(horse,horseCrop.x,horseCrop.y,horseCrop.w,horseCrop.h,horseX,ground-horseHeight-y+bob,horseWidth,horseHeight);
            obstacles.forEach(function(o){for(var n=0;n<o.stack;n++)ctx.drawImage(block,o.x,ground-(n+1)*38,44,38);});
        }
        ctx.fillStyle='#40235c';ctx.font='bold 24px Arial';ctx.textAlign='left';ctx.fillText('남은 시간 '+Math.max(0,15-elapsed).toFixed(1)+'초',24,40);
        if(state!=='running'){
            ctx.fillStyle='rgba(35,20,50,.65)';ctx.fillRect(245,110,410,105);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 30px Arial';
            ctx.fillText(state==='won'?'클리어!':state==='lost'?'장애물에 부딪혔어요!':state==='paused'?'잠시 멈췄어요':'15초 동안 버티세요!',450,154);
            ctx.font='18px Arial';ctx.fillText(state==='won'?'15초 동안 잘 달렸어요!':'스페이스바 또는 점프 버튼',450,189);ctx.textAlign='left';
        }
    }
    function finish(result){
        window.tourStickers.playEffect(result==='won'?'clear':'lose');
        state=result;jumpButton.disabled=true;start.hidden=false;start.textContent=result==='won'?'다시 플레이':'다시 시작';
        status.textContent=result==='won'?'클리어! 15초 동안 장애물을 피했어요.':'충돌했어요. 다시 시작해보세요!';
        reward.hidden=result!=='won';
        reward.disabled=window.tourStickers.isRunnerUnlocked();
        reward.textContent=reward.disabled?'이모티콘 획득 완료!':'이모티콘 획득';
    }
    function tick(time){
        frame=null;if(state!=='running')return;
        var dt=lastTime?Math.min((time-lastTime)/1000,.04):0;lastTime=time;
        var travelTime=Math.min(dt,Math.max(0,15-elapsed));
        elapsed=Math.min(15,elapsed+dt);distance+=speed*travelTime;
        if(velocity!==0||y>0){y+=velocity*dt;velocity-=1200*dt;if(y<=0){y=0;velocity=0;}}
        nextSpawn-=travelTime;
        if(elapsed<15&&nextSpawn<=0){obstacles.push({x:940,stack:1+Math.floor(Math.random()*3)});nextSpawn=1.65+Math.random()*.4;}
        obstacles.forEach(function(o){o.x-=speed*travelTime;});obstacles=obstacles.filter(function(o){return o.x>-60;});
        var hit=obstacles.some(function(o){return horseX+18<o.x+40&&horseX+horseWidth-20>o.x+4&&ground-y-9>ground-o.stack*38+5;});
        if(elapsed<15&&hit)finish('lost');else if(elapsed>=15&&y===0)finish('won');
        draw();if(state==='running')frame=requestAnimationFrame(tick);
    }
    function begin(){
        if(assets!==2)return;
        reward.hidden=true;
        if(state!=='paused'){elapsed=0;distance=0;y=0;velocity=0;obstacles=[];nextSpawn=.25;}
        state='running';start.hidden=true;jumpButton.disabled=false;status.textContent='스페이스바로 점프! 15초 동안 버티세요.';lastTime=0;frame=requestAnimationFrame(tick);canvas.focus();
    }
    canvas.tabIndex=0;start.addEventListener('click',begin);jumpButton.addEventListener('click',jump);canvas.addEventListener('pointerdown',jump);
    function pause(){if(state!=='running')return;state='paused';if(frame)cancelAnimationFrame(frame);frame=null;start.hidden=false;start.textContent='계속하기';jumpButton.disabled=true;status.textContent='잠시 멈췄어요. 계속하기를 눌러주세요.';draw();}
    window.addEventListener('blur',pause);document.addEventListener('visibilitychange',function(){if(document.hidden)pause();});
    window.rememberTourRunnerView=function(){var viewer=window.tourViewer;previousView={h:viewer.get('view.hlookat'),v:viewer.get('view.vlookat'),fov:viewer.get('view.fov'),scene:viewer.get('xml.scene')};};
    window.openTourRunner=function(){previousFocus=document.activeElement;popup.hidden=false;reward.hidden=true;state='idle';elapsed=0;distance=0;y=0;velocity=0;obstacles=[];start.hidden=false;start.textContent='게임시작';jumpButton.disabled=true;status.textContent='스페이스바로 점프! 15초 동안 버티세요.';draw();start.focus();};
    reward.addEventListener('click',function(){if(state!=='won')return;window.tourStickers.unlockRunner();reward.disabled=true;reward.textContent='이모티콘 획득 완료!';});
    function dismiss(){pause();popup.hidden=true;var viewer=window.tourViewer;if(previousView&&viewer.get('xml.scene')===previousView.scene)viewer.call('stoplookto(); stopmovements(); lookto('+[previousView.h,previousView.v,previousView.fov].join(',')+',tween(easeInOutSine,0.8),true,true);');previousView=null;if(previousFocus&&previousFocus.focus)previousFocus.focus();}
    close.addEventListener('click',dismiss);
    popup.addEventListener('pointerdown',function(event){if(!event.target.closest('button, a'))jump();});
    
    document.addEventListener('keydown',function(event){
        if(popup.hidden)return;
        if(event.code==='Space'){event.preventDefault();event.stopPropagation();if(!event.repeat)jump();}
        if(event.key==='Escape'){event.preventDefault();event.stopPropagation();}
        if(event.key==='Tab'){var buttons=Array.from(popup.querySelectorAll('button, a[href]')).filter(function(b){return !b.hidden&&!b.disabled;});buttons.push(document.getElementById('screenshot-button'));var index=buttons.indexOf(document.activeElement)+(event.shiftKey?-1:1);if(index<0||index>=buttons.length){event.preventDefault();buttons[event.shiftKey?buttons.length-1:0].focus();}}
    },true);
    window.tourRunner={drawScreenshot:function(context,viewport,rx,ry){if(popup.hidden)return;context.save();context.fillStyle='rgba(12,8,20,.45)';context.fillRect(0,0,context.canvas.width,context.canvas.height);var rect=canvas.getBoundingClientRect();context.drawImage(canvas,(rect.left-viewport.left)*rx,(rect.top-viewport.top)*ry,rect.width*rx,rect.height*ry);context.restore();}};
})();
