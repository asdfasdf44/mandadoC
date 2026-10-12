(function () {
    'use strict';
    var popup=document.getElementById('difference-popup'), panel=document.getElementById('difference-panel');
    var canvas=document.getElementById('difference-canvas'), context=canvas.getContext('2d');
    var grade=document.getElementById('difference-grade'), reset=document.getElementById('difference-reset'), close=document.getElementById('difference-close'), status=document.getElementById('difference-status');
    var image=new Image(), ready=false, cleared=false, points=[], previousView=null, previousFocus=null;
    var reward=document.getElementById('difference-reward');
    function updateReward(){reward.hidden=!cleared;reward.disabled=window.tourStickers.isDifferenceUnlocked();reward.textContent=reward.disabled?'이모티콘 획득 완료!':'이모티콘 획득';}
    // Centers from the supplied green-marked 1122 x 1402 answer sheet.
    // Ellipse radii include a small allowance around each marked region.
    var answers=[{x:642/1122,y:620/1402,rx:75/1122,ry:78/1402},{x:1055/1122,y:950/1402,rx:102/1122,ry:102/1402},{x:386/1122,y:1077/1402,rx:120/1122,ry:108/1402}];
    function inside(point,answer){return Math.pow((point.x-answer.x)/answer.rx,2)+Math.pow((point.y-answer.y)/answer.ry,2)<=1;}
    function score(selected){
        // Match each selected circle to a distinct answer region.
        var best=0;
        function match(index,used,count){if(index===selected.length){best=Math.max(best,count);return;}match(index+1,used,count);answers.forEach(function(answer,i){if(!(used&(1<<i))&&inside(selected[index],answer))match(index+1,used|(1<<i),count+1);});}
        match(0,0,0);return best;
    }
    function draw(){
        if(!ready)return;context.drawImage(image,0,0);
        points.forEach(function(point,i){context.beginPath();context.arc(point.x*canvas.width,point.y*canvas.height,canvas.width*.035,0,Math.PI*2);context.strokeStyle='#f12736';context.lineWidth=6;context.stroke();context.fillStyle='#f12736';context.font='bold 28px Arial';context.fillText(String(i+1),point.x*canvas.width+canvas.width*.025,point.y*canvas.height-canvas.width*.025);});
    }
    image.onload=function(){canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;ready=true;draw();};
    image.onerror=function(){status.textContent='그림을 불러오지 못했습니다. 새로고침해주세요.';};image.src='skin/pop5_2.jpg';
    canvas.addEventListener('click',function(event){
        if(!ready||cleared)return;
        var rect=canvas.getBoundingClientRect(), point={x:(event.clientX-rect.left)/rect.width,y:(event.clientY-rect.top)/rect.height};
        var existing=points.findIndex(function(p){return Math.hypot((p.x-point.x)*rect.width,(p.y-point.y)*rect.height)<=rect.width*.04;});
        window.tourSfx.play('mark');if(existing>=0)points.splice(existing,1);
        else if(points.length<3)points.push(point);
        else {status.textContent='3곳을 선택했어요. 원을 다시 클릭해 취소하거나 채점해주세요.';return;}
        status.textContent='선택 '+points.length+' / 3 · 원을 다시 클릭하면 취소됩니다.';grade.disabled=points.length!==3;draw();
    });
    grade.addEventListener('click',function(){
        if(points.length!==3||cleared)return;var count=score(points);
        if(count===3){
            window.tourStickers.playEffect('clear');
            cleared=true;panel.classList.add('cleared');grade.disabled=true;status.textContent='클리어! 다른 부분 3개를 모두 찾았어요!';
            var rect=canvas.getBoundingClientRect();
            window.tourStickers.celebrateAt(rect.left+rect.width/2,rect.top+rect.height/2);
        }
        else { window.tourStickers.playEffect('lose'); status.textContent=count+' / 3 정답입니다. 선택을 수정하고 다시 채점해보세요.'; }
        updateReward();
    });
    function restart(){points=[];cleared=false;panel.classList.remove('cleared');grade.disabled=true;status.textContent='선택 0 / 3';updateReward();draw();}
    reset.addEventListener('click',restart);
    window.rememberTourDifferenceView=function(){var viewer=window.tourViewer;previousView={h:viewer.get('view.hlookat'),v:viewer.get('view.vlookat'),fov:viewer.get('view.fov'),scene:viewer.get('xml.scene')};};
    window.openTourDifference=function(){previousFocus=document.activeElement;popup.hidden=false;updateReward();if(!ready)status.textContent='그림을 불러오는 중…';close.focus();};
    reward.addEventListener('click',function(){if(!cleared)return;window.tourStickers.unlockDifference();updateReward();});
    function dismiss(){popup.hidden=true;var viewer=window.tourViewer;if(previousView&&viewer.get('xml.scene')===previousView.scene)viewer.call('stoplookto(); stopmovements(); lookto('+[previousView.h,previousView.v,previousView.fov].join(',')+',tween(easeInOutSine,0.8),true,true);');previousView=null;if(previousFocus&&previousFocus.focus)previousFocus.focus();}
    close.addEventListener('click',dismiss);
    document.addEventListener('keydown',function(event){if(popup.hidden)return;if(event.key==='Escape'){event.preventDefault();event.stopPropagation();}if(event.key==='Tab'){var buttons=Array.from(popup.querySelectorAll('button, a[href]')).filter(function(b){return !b.disabled&&!b.hidden;});buttons.push(document.getElementById('screenshot-button'));var index=buttons.indexOf(document.activeElement)+(event.shiftKey?-1:1);if(index<0||index>=buttons.length){event.preventDefault();buttons[event.shiftKey?buttons.length-1:0].focus();}}},true);
    window.tourDifference={drawScreenshot:function(ctx,viewport,rx,ry){
        if(popup.hidden||!ready)return;ctx.save();ctx.fillStyle='rgba(12,8,20,.45)';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
        [document.getElementById('difference-original'),canvas].forEach(function(element){var rect=element.getBoundingClientRect();ctx.drawImage(element,(rect.left-viewport.left)*rx,(rect.top-viewport.top)*ry,rect.width*rx,rect.height*ry);});ctx.restore();
    }};
})();
