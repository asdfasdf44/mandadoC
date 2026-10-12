(function(){
    'use strict';
    var popup=document.getElementById('dodge-popup'),canvas=document.getElementById('dodge-canvas'),ctx=canvas.getContext('2d');
    var start=document.getElementById('dodge-start'),close=document.getElementById('dodge-close'),status=document.getElementById('dodge-status');
    var reward=document.getElementById('dodge-reward'),rewardReady=false,rewardImage=new Image();
    rewardImage.onload=function(){rewardReady=true;if(window.tourStickers)refreshReward();};rewardImage.src='skin/p6i.png';
    function refreshReward(){reward.hidden=state!=='won';reward.disabled=!rewardReady||window.tourStickers.isDodgeUnlocked();reward.textContent=window.tourStickers.isDodgeUnlocked()?'이모티콘 획득 완료!':'이모티콘 획득';reward.title=rewardReady?'':'p6i.png가 준비되면 획득할 수 있어요';}
    reward.addEventListener('click',function(){if(state!=='won'||!rewardReady)return;window.tourStickers.unlockDodge();refreshReward();});
    var assets=[],loaded=0,failed=false,state='idle',elapsed=0,playerX=312,objects=[],spawn=.8,frame=null,lastTime=0;
    var left=false,right=false,pointer=null,pointerDirection=0,pulseUntil=0,previousView=null,previousFocus=null;
    var speeds=[140,235,350],playerY=408,playerSize=76;
    var nextTargetDrop=3;
    for(var i=1;i<=4;i++)(function(index){
        var image=new Image();var asset={image:image,crop:null};assets[index-1]=asset;
        image.onload=function(){
            var buffer=document.createElement('canvas');buffer.width=image.naturalWidth;buffer.height=image.naturalHeight;
            var c=buffer.getContext('2d');c.drawImage(image,0,0);var data=c.getImageData(0,0,buffer.width,buffer.height).data;
            var x0=buffer.width,y0=buffer.height,x1=0,y1=0;
            for(var y=0;y<buffer.height;y++)for(var x=0;x<buffer.width;x++)if(data[(y*buffer.width+x)*4+3]>30){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
            asset.crop=x1>=x0?{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1}:{x:0,y:0,w:buffer.width,h:buffer.height};
            loaded++;if(loaded===4&&!failed){start.disabled=false;draw();}
        };
        image.onerror=function(){failed=true;start.disabled=true;status.textContent='게임 이미지를 불러오지 못했습니다. 새로고침해주세요.';};image.src='skin/pop6_'+index+'.png';
    })(i);
    function sprite(index,x,y,w,h){var a=assets[index];if(a&&a.crop){var scale=Math.min(w/a.crop.w,h/a.crop.h),width=a.crop.w*scale,height=a.crop.h*scale;ctx.drawImage(a.image,a.crop.x,a.crop.y,a.crop.w,a.crop.h,x+(w-width)/2,y+h-height,width,height);}}
    function draw(){
        var gradient=ctx.createLinearGradient(0,0,0,500);gradient.addColorStop(0,'#c9caff');gradient.addColorStop(1,'#fff0d7');ctx.fillStyle=gradient;ctx.fillRect(0,0,700,500);
        ctx.fillStyle='#ffffff88';for(var i=0;i<6;i++){ctx.beginPath();ctx.arc(i*140+30,80+i%2*50,35,0,Math.PI*2);ctx.fill();}
        ctx.fillStyle='#b5a3c8';ctx.fillRect(0,484,700,16);objects.forEach(function(o){sprite(o.type,o.x,o.y,52,52);});sprite(3,playerX,playerY,playerSize,playerSize);
        ctx.fillStyle='#40235c';ctx.font='bold 24px Arial';ctx.textAlign='left';ctx.fillText('남은 시간 '+Math.max(0,20-elapsed).toFixed(1)+'초',20,34);
        if(state!=='running'){ctx.fillStyle='#20152bbb';ctx.fillRect(140,155,420,100);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 27px Arial';ctx.fillText(state==='won'?'클리어!':state==='lost'?'장애물에 맞았어요!':state==='paused'?'잠시 멈췄어요':'20초 동안 버티세요!',350,197);ctx.font='17px Arial';ctx.fillText(state==='won'?'보상 이모티콘을 획득하세요!':'← → 또는 캐릭터 왼쪽·오른쪽 누르기',350,231);ctx.textAlign='left';}
    }
    function clearInput(){left=false;right=false;pointer=null;pointerDirection=0;pulseUntil=0;}
    function finish(result){window.tourStickers.playEffect(result==='won'?'clear':'lose');state=result;clearInput();start.hidden=false;start.textContent='다시 시작';refreshReward();status.textContent=result==='won'?'클리어!':'충돌했어요. 다시 도전해보세요.';if(result==='won'){var r=canvas.getBoundingClientRect();window.tourStickers.celebrateAt(r.left+r.width/2,r.top+r.height/2);}}
    function tick(time){
        frame=null;if(state!=='running')return;var dt=lastTime?Math.min((time-lastTime)/1000,.04):0;lastTime=time;elapsed=Math.min(20,elapsed+dt);
        var direction=pointer!==null||time<pulseUntil?pointerDirection:(right?1:0)-(left?1:0);playerX=Math.max(0,Math.min(700-playerSize,playerX+direction*400*dt));
        spawn-=dt;if(spawn<=0){objects.push({x:Math.random()*(700-52),y:-60,type:Math.floor(Math.random()*3)});spawn=.45+Math.random()*.18;}
        if(elapsed>=nextTargetDrop&&elapsed<20){
            objects.push({x:Math.max(0,Math.min(648,playerX+playerSize/2-26)),y:-60,type:2});
            nextTargetDrop+=3;
        }
        objects.forEach(function(o){o.y+=speeds[o.type]*(1+elapsed*.012)*dt;});objects=objects.filter(function(o){return o.y<550;});
        var hit=objects.some(function(o){return playerX+14<o.x+44&&playerX+playerSize-14>o.x+8&&playerY+12<o.y+44&&playerY+playerSize-8>o.y+8;});
        if(hit)finish('lost');else if(elapsed>=20)finish('won');draw();if(state==='running')frame=requestAnimationFrame(tick);
    }
    start.addEventListener('click',function(){if(loaded!==4||failed)return;if(state!=='paused'){elapsed=0;playerX=312;objects=[];spawn=.8;nextTargetDrop=3;}clearInput();state='running';reward.hidden=true;start.hidden=true;lastTime=0;status.textContent='← → 또는 캐릭터의 왼쪽·오른쪽을 눌러 이동하세요.';canvas.focus();frame=requestAnimationFrame(tick);});
    document.addEventListener('keydown',function(e){if(popup.hidden)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();if(state==='running'&&!e.repeat&&!(e.key==='ArrowLeft'?left:right))window.tourSfx.play('move-ping');if(e.key==='ArrowLeft')left=true;else right=true;}if(e.key==='Escape'){e.preventDefault();e.stopPropagation();}if(e.key==='Tab'){var buttons=Array.from(popup.querySelectorAll('button, a[href]')).filter(function(b){return !b.hidden&&!b.disabled;});buttons.push(document.getElementById('screenshot-button'));var i=buttons.indexOf(document.activeElement)+(e.shiftKey?-1:1);if(i<0||i>=buttons.length){e.preventDefault();buttons[e.shiftKey?buttons.length-1:0].focus();}}},true);
    document.addEventListener('keyup',function(e){if(e.key==='ArrowLeft')left=false;if(e.key==='ArrowRight')right=false;});
    function pointerSide(e){var r=canvas.getBoundingClientRect();var clickedX=(e.clientX-r.left)*canvas.width/r.width;pointerDirection=clickedX<playerX+playerSize/2?-1:1;}
    canvas.addEventListener('pointerdown',function(e){if(state!=='running'||e.button!==0)return;e.preventDefault();window.tourSfx.play('move-ping');pointer=e.pointerId;pointerSide(e);pulseUntil=performance.now()+160;canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointermove',function(e){if(pointer===e.pointerId){var before=pointerDirection;pointerSide(e);if(before!==pointerDirection)window.tourSfx.play('move-ping');}});
    canvas.addEventListener('pointerup',function(e){if(pointer===e.pointerId)pointer=null;});canvas.addEventListener('pointercancel',clearInput);canvas.addEventListener('lostpointercapture',function(){pointer=null;});
    function pause(){clearInput();if(state!=='running')return;state='paused';if(frame)cancelAnimationFrame(frame);frame=null;start.hidden=false;start.textContent='계속하기';status.textContent='잠시 멈췄어요. 계속하기를 눌러주세요.';draw();}
    window.addEventListener('blur',pause);document.addEventListener('visibilitychange',function(){if(document.hidden)pause();});
    window.rememberTourDodgeView=function(){var v=window.tourViewer;previousView={h:v.get('view.hlookat'),v:v.get('view.vlookat'),fov:v.get('view.fov'),scene:v.get('xml.scene')};};
    window.openTourDodge=function(){previousFocus=document.activeElement;popup.hidden=false;clearInput();state='idle';reward.hidden=true;elapsed=0;nextTargetDrop=3;playerX=312;objects=[];start.hidden=false;start.textContent='게임 시작';draw();start.focus();};
    function dismiss(){pause();popup.hidden=true;var v=window.tourViewer;if(previousView&&v.get('xml.scene')===previousView.scene)v.call('stoplookto(); stopmovements(); lookto('+[previousView.h,previousView.v,previousView.fov].join(',')+',tween(easeInOutSine,0.8),true,true);');previousView=null;if(previousFocus&&previousFocus.focus)previousFocus.focus();}
    close.addEventListener('click',dismiss);
    window.tourDodge={drawScreenshot:function(context,viewport,rx,ry){if(popup.hidden)return;context.save();context.fillStyle='rgba(12,8,20,.45)';context.fillRect(0,0,context.canvas.width,context.canvas.height);var r=canvas.getBoundingClientRect();context.drawImage(canvas,(r.left-viewport.left)*rx,(r.top-viewport.top)*ry,r.width*rx,r.height*ry);context.restore();}};
})();
