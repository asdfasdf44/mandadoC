(function(){
    'use strict';
    var popup=document.getElementById('color-popup'),grid=document.getElementById('color-grid'),stageLabel=document.getElementById('color-stage'),timer=document.getElementById('color-timer');
    var status=document.getElementById('color-status'),start=document.getElementById('color-start'),close=document.getElementById('color-close');
    var layouts=[[1,3],[2,2],[3,3],[4,4],[5,5],[5,5],[5,5]],stage=0,answer=0,state='idle',startedAt=0,frame=null,previousView=null,previousFocus=null;
    var reward=document.getElementById('color-reward');
    function refreshReward(){reward.hidden=state!=='won';reward.disabled=window.tourStickers.isColorUnlocked();reward.textContent=reward.disabled?'이모티콘 획득 완료!':'이모티콘 획득';}
    reward.addEventListener('click',function(){if(state!=='won')return;window.tourStickers.unlockColor();refreshReward();});
    function render(){
        var layout=layouts[stage],count=layout[0]*layout[1];answer=Math.floor(Math.random()*count);
        var hue=Math.floor(Math.random()*360),lightness=42+Math.random()*12,difference=[20,15,11,8,6,5,4][stage];
        grid.replaceChildren();grid.style.gridTemplateRows='repeat('+layout[0]+',1fr)';grid.style.gridTemplateColumns='repeat('+layout[1]+',1fr)';stageLabel.textContent=(stage+1)+' / 7 단계';
        for(var i=0;i<count;i++){var tile=document.createElement('button');tile.type='button';tile.dataset.index=i;tile.style.backgroundColor='hsl('+hue+',65%,'+(lightness+(i===answer?difference:0))+'%)';tile.setAttribute('aria-label',(i+1)+'번 타일');tile.disabled=state!=='running';if(state==='idle'&&i===answer){tile.textContent='다른 색깔을 찾으세요';tile.className='color-example';}grid.appendChild(tile);}
    }
    function finish(result,message){window.tourStickers.playEffect(result==='won'?'clear':'lose');state=result;refreshReward();if(frame)cancelAnimationFrame(frame);frame=null;grid.querySelectorAll('button').forEach(function(tile){tile.disabled=true;});start.hidden=false;start.textContent='다시 도전';status.textContent=message;if(result==='won'){var r=grid.getBoundingClientRect();window.tourStickers.celebrateAt(r.left+r.width/2,r.top+r.height/2);}}
    function remaining(){return 20000-(performance.now()-startedAt);}
    function tick(){if(state!=='running')return;var left=remaining();timer.textContent=(Math.max(0,left)/1000).toFixed(1)+'초';if(left<=0){finish('lost','시간 초과! 20초 안에 모두 맞춰야 해요.');return;}frame=requestAnimationFrame(tick);}
    start.addEventListener('click',function(){if(frame)cancelAnimationFrame(frame);stage=0;state='running';reward.hidden=true;startedAt=performance.now();start.hidden=true;status.textContent='다른 색 타일을 고르세요. 틀리면 바로 패배!';render();grid.querySelector('button').focus();tick();});
    grid.addEventListener('click',function(event){
        if(state!=='running')return;var tile=event.target.closest('button');if(!tile||!grid.contains(tile))return;
        if(remaining()<=0){timer.textContent='0.0초';finish('lost','시간 초과! 20초 안에 모두 맞춰야 해요.');return;}
        if(Number(tile.dataset.index)!==answer){finish('lost','다른 색 타일이 아니에요. 다시 도전해보세요!');return;}
        if(stage===layouts.length-1){finish('won','클리어! 한 번도 틀리지 않고 7단계를 맞췄어요!');return;}
        window.tourSfx.play('correct');stage++;status.textContent='정답! 다음 단계입니다.';render();
    });
    window.rememberTourColorView=function(){var v=window.tourViewer;previousView={h:v.get('view.hlookat'),v:v.get('view.vlookat'),fov:v.get('view.fov'),scene:v.get('xml.scene')};};
    window.openTourColor=function(){previousFocus=document.activeElement;popup.hidden=false;if(frame)cancelAnimationFrame(frame);frame=null;state='idle';reward.hidden=true;stage=0;start.hidden=false;start.textContent='게임 시작';timer.textContent='20.0초';status.textContent='한 번이라도 틀리면 패배합니다.';render();start.focus();};
    function dismiss(){if(frame)cancelAnimationFrame(frame);frame=null;state='idle';popup.hidden=true;var v=window.tourViewer;if(previousView&&v.get('xml.scene')===previousView.scene)v.call('stoplookto(); stopmovements(); lookto('+[previousView.h,previousView.v,previousView.fov].join(',')+',tween(easeInOutSine,0.8),true,true);');previousView=null;if(previousFocus&&previousFocus.focus)previousFocus.focus();}
    close.addEventListener('click',dismiss);
    document.addEventListener('keydown',function(e){if(popup.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();}if(e.key==='Tab'){var buttons=Array.from(popup.querySelectorAll('button, a[href]')).filter(function(b){return !b.hidden&&!b.disabled;});buttons.push(document.getElementById('screenshot-button'));var i=buttons.indexOf(document.activeElement)+(e.shiftKey?-1:1);if(i<0||i>=buttons.length){e.preventDefault();buttons[e.shiftKey?buttons.length-1:0].focus();}}},true);
    window.tourColor={drawScreenshot:function(ctx,viewport,rx,ry){if(popup.hidden)return;ctx.save();ctx.fillStyle='rgba(12,8,20,.45)';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);grid.querySelectorAll('button').forEach(function(tile){var r=tile.getBoundingClientRect();ctx.fillStyle=tile.style.backgroundColor;ctx.fillRect((r.left-viewport.left)*rx,(r.top-viewport.top)*ry,r.width*rx,r.height*ry);});ctx.restore();}};
})();
