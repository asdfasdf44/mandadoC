(function () {
    'use strict';
    var popup=document.getElementById('tutorial-popup'),title=document.getElementById('tutorial-title'),image=document.getElementById('tutorial-image'),description=document.getElementById('tutorial-description');
    var counter=document.getElementById('tutorial-page'),previous=document.getElementById('tutorial-previous'),next=document.getElementById('tutorial-next'),close=document.getElementById('tutorial-close');
    var pages=[
        {title:'POP UP STORE 2026\n아트쇼케이스에 오신 것을\n환영합니다!',text:'다양한 부스를 둘러보고,\n미니게임과 함께\n나만의 팝업 스토어를 즐겨보세요.'},
        {title:'부스를 둘러보며\n미니게임에 도전해요.',image:'skin/tuto1.png',text:'부스의 아이콘을 클릭하면\n미니게임이 열립니다.\n각 게임의 안내에 따라 도전해보세요.'},
        {title:'게임을 클리어하고\n이모티콘을 획득해요!',image:'skin/tuto2.png',text:'클리어 후 ‘이모티콘 획득’을 누르면\n오른쪽 이모티콘 목록에서\n획득한 이모티콘을 사용할 수 있어요.'},
        {title:'이모티콘을 배치하고\n사진을 찍어요!',image:'skin/tuto3.png',text:'획득한 이모티콘을 원하는 곳으로\n드래그해 꾸며보세요.\n카메라 버튼을 누르면\n사진을 다운로드할 수 있어요.'}
    ];
    var index=0,returnFocus;
    pages.forEach(function(page){if(!page.image)return;page.preloaded=new Image();page.preloaded.id='tutorial-image';page.preloaded.alt=page.title;page.preloaded.decoding='sync';page.preloaded.src=page.image;if(page.preloaded.decode)page.preloaded.decode().catch(function(){});});
    function render(){var page=pages[index];if(page.preloaded&&image!==page.preloaded){image.replaceWith(page.preloaded);image=page.preloaded;}title.textContent=page.title;description.textContent=page.text;counter.textContent=(index+1)+' / 4';image.hidden=!page.image;previous.disabled=index===0;next.textContent=index===3?'시작하기':'다음';}
    function dismiss(){popup.hidden=true;if(returnFocus&&returnFocus.focus)returnFocus.focus();}
    previous.addEventListener('click',function(){if(index>0){index--;render();}});
    next.addEventListener('click',function(){if(index===3){dismiss();return;}index++;render();});
    close.addEventListener('click',dismiss);popup.addEventListener('click',function(event){if(event.target===popup)dismiss();});
    document.addEventListener('keydown',function(event){if(popup.hidden)return;if(event.key==='Escape'){event.preventDefault();event.stopPropagation();dismiss();}if(event.key==='Tab'){var buttons=[previous,next,close].filter(function(button){return !button.disabled;});var target=buttons.indexOf(document.activeElement)+(event.shiftKey?-1:1);if(target<0||target>=buttons.length){event.preventDefault();buttons[event.shiftKey?buttons.length-1:0].focus();}}},true);
    window.tourTutorial={open:function(){returnFocus=document.activeElement;index=0;render();popup.hidden=false;next.focus();}};
})();
