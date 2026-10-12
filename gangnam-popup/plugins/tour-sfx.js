(function () {
    'use strict';
    var context, loops = {}, last = {};
    var putBuffer, putOffset = 0;
    var pencilTimer;
    function ready() {
        var AudioEngine = window.AudioContext || window.webkitAudioContext;
        if (!AudioEngine) return null;
        if (!context) {
            context = new AudioEngine();
            fetch('skin/put.mp3').then(function (response) { return response.arrayBuffer(); })
                .then(function (bytes) { return context.decodeAudioData(bytes); })
                .then(function (buffer) {
                    putBuffer = buffer;
                    var samples = buffer.getChannelData(0), first = 0;
                    for (var i=0;i<samples.length;i+=256) {
                        var peak = 0;
                        for(var j=i;j<Math.min(i+256,samples.length);j++) peak=Math.max(peak,Math.abs(samples[j]));
                        if(peak>.012){first=i;break;}
                    }
                    putOffset = Math.max(0,(first-64)/buffer.sampleRate);
                }).catch(function () {});
        }
        if (context.state === 'suspended') context.resume().catch(function () {});
        return context;
    }
    function tone(engine, frequency, endFrequency, duration, volume, delay) {
        var oscillator = engine.createOscillator(), gain = engine.createGain(), time = engine.currentTime + (delay || 0);
        oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, time);
        oscillator.frequency.exponentialRampToValueAtTime(endFrequency || frequency, time + duration);
        gain.gain.setValueAtTime(.0001, time); gain.gain.exponentialRampToValueAtTime(volume, time + .006);
        gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
        oscillator.connect(gain); gain.connect(engine.destination); oscillator.start(time); oscillator.stop(time + duration + .02);
        oscillator.onended = function () { oscillator.disconnect(); gain.disconnect(); };
    }
    function noise(engine, duration, volume, frequency, loop) {
        var buffer = engine.createBuffer(1, Math.ceil(engine.sampleRate * duration), engine.sampleRate), samples = buffer.getChannelData(0);
        for (var i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1);
        var source = engine.createBufferSource(), filter = engine.createBiquadFilter(), gain = engine.createGain();
        source.buffer = buffer; source.loop = !!loop; filter.type = 'bandpass'; filter.frequency.value = frequency; filter.Q.value = .7;
        source.connect(filter); filter.connect(gain); gain.connect(engine.destination);
        gain.gain.setValueAtTime(loop ? volume : .0001, engine.currentTime);
        if (!loop) { gain.gain.linearRampToValueAtTime(volume, engine.currentTime + .008); gain.gain.exponentialRampToValueAtTime(.0001, engine.currentTime + duration); }
        source.start(); if (!loop) source.stop(engine.currentTime + duration + .02);
        source.onended = function () { source.disconnect(); filter.disconnect(); gain.disconnect(); };
        return {source:source, gain:gain, filter:filter};
    }
    function play(name) {
        var engine = ready(); if (!engine) return;
        if (last[name] && engine.currentTime - last[name] < .08) return;
        last[name] = engine.currentTime;
        if (name === 'click') tone(engine, 850, 500, .045, .0385);
        else if (name === 'button') { tone(engine, 620, 850, .075, .077); tone(engine, 1050, 1050, .05, .0385, .04); }
        else if (name === 'jump') tone(engine, 270, 1000, .18, .07);
        else if (name === 'swap') { tone(engine, 430, 600, .09, .06); tone(engine, 720, 720, .07, .04, .055); }
        else if (name === 'correct') { tone(engine, 660, 660, .10, .055); tone(engine, 880, 880, .13, .055, .075); }
        else if (name === 'brush') noise(engine, .14, .045, 1900, false);
        else if (name === 'pencil') noise(engine, .10, .035, 3200, false);
        else if (name === 'move') noise(engine, .08, .025, 1100, false);
        else if (name === 'move-ping') { tone(engine,1100,850,.10,.07); tone(engine,1650,1400,.075,.025); }
        else if (name === 'mark') tone(engine, 520, 340, .065, .06);
        else if (name === 'shutter') {
            noise(engine,.055,.18,2400,false);
            tone(engine,190,90,.075,.09);
            setTimeout(function(){noise(engine,.045,.11,3100,false);},85);
        }
        else if (name === 'start') { tone(engine, 440, 440, .09, .05); tone(engine, 660, 660, .12, .05, .08); }
        else if (name === 'wind' || name === 'room-wind') {
            var breeze=noise(engine,.55,name === 'room-wind' ? .0675 : .045,500,false);
            breeze.filter.frequency.setValueAtTime(350,engine.currentTime);
            breeze.filter.frequency.exponentialRampToValueAtTime(1800,engine.currentTime+.22);
            breeze.filter.frequency.exponentialRampToValueAtTime(250,engine.currentTime+.55);
        }
    }
    function stopLoop(name) {
        var item = loops[name]; if (!item || !context) return;
        delete loops[name]; item.gain.gain.cancelScheduledValues(context.currentTime);
        item.gain.gain.setTargetAtTime(.0001, context.currentTime, .025); item.source.stop(context.currentTime + .12);
    }
    window.tourSfx = {
        play:play,
        strokePencil:function () {
            var engine=ready();if(!engine)return;
            clearTimeout(pencilTimer);
            if(!loops.pencil) loops.pencil=noise(engine,.7,.16,2200,true);
            pencilTimer=setTimeout(function(){stopLoop('pencil');},120);
        },
        stopPencil:function () { clearTimeout(pencilTimer);stopLoop('pencil'); },
        playPut:function () {
            var engine=ready();if(!engine)return false;
            if(!putBuffer){play('mark');return true;}
            var source=engine.createBufferSource(),gain=engine.createGain();
            source.buffer=putBuffer;gain.gain.value=.8;source.connect(gain);gain.connect(engine.destination);
            source.start(0,putOffset);source.onended=function(){source.disconnect();gain.disconnect();};return true;
        },
        startCooking:function () { var engine=ready(); if (!engine || loops.cooking) return; loops.cooking=noise(engine,.8,.028,2500,true); },
        stopCooking:function () { stopLoop('cooking'); }
    };
    var press;
    document.addEventListener('pointerdown', function (event) { ready(); press={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false}; }, true);
    document.addEventListener('pointermove', function (event) { if(press&&press.id===event.pointerId&&Math.hypot(event.clientX-press.x,event.clientY-press.y)>6)press.moved=true; }, true);
    document.addEventListener('pointerup', function (event) {
        if (!press || press.id !== event.pointerId) return;
        var moved=press.moved;press=null;if(moved)return;
        var target=event.target;
        if (target.closest('[id^="sticker-palette"], .tour-sticker, #paint-brush, #paint-canvas, #puzzle-board, #color-grid, #difference-canvas, #runner-canvas, #dodge-canvas')) return;
        var button=target.closest('button, a[href]');
        if(button&&button.disabled)return;
        if(button&&button.id==='screenshot-button')return;
        if(button&&/-reward$/.test(button.id))return;
        play(button?'button':'click');
    }, true);
    document.addEventListener('pointercancel',function(){press=null;},true);
    document.addEventListener('click',function(event){if(event.detail!==0)return;var button=event.target.closest('button, a[href]');if(button&&!button.disabled&&!/-reward$/.test(button.id)&&!button.closest('[id^="sticker-palette"],#puzzle-board,#color-grid'))play('button');},true);
    window.addEventListener('blur',function(){press=null;clearTimeout(pencilTimer);stopLoop('pencil');stopLoop('cooking');});
})();
