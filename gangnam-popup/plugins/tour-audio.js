(function () {
    'use strict';
    var tracks = {
        tour:new Audio('skin/bgm.mp3'),
        day2:new Audio('skin/game_2.mp3'),
        day3:new Audio('skin/game_bgm1.mp3')
    };
    var games = {
        'puzzle-popup':'day2', 'paint-popup':'day2', 'runner-popup':'day2',
        'difference-popup':'day2', 'steak-popup':'day2',
        'ladder-popup':'day3', 'dodge-popup':'day3', 'color-popup':'day3'
    };
    var active = 'tour', pending = {};
    Object.keys(tracks).forEach(function (name) {
        tracks[name].loop = true; tracks[name].preload = 'auto'; tracks[name].volume = name === 'tour' ? .2975 : .26775;
    });
    function selectedTrack() {
        var ids = Object.keys(games);
        for (var i=0;i<ids.length;i++) {
            var popup = document.getElementById(ids[i]);
            if (popup && !popup.hidden) return games[ids[i]];
        }
        return 'tour';
    }
    function syncMusic() {
        var viewer=window.tourViewer;
        tracks.tour.volume=viewer && viewer.get('xml.scene')==='scene_day_1' ? .14875 : .2975;
        var next = selectedTrack();
        if (next !== active) {
            tracks[active].pause();
            active = next;
            if (next !== 'tour') tracks[next].currentTime = 0;
        }
        Object.keys(tracks).forEach(function (name) { if (name !== active) tracks[name].pause(); });
        var name = active, music = tracks[name];
        if (!music.paused || pending[name]) return;
        pending[name] = true;
        var playback = music.play();
        if (playback && playback.then) {
            playback.then(function () {
                pending[name] = false;
                if (active !== name) music.pause();
            }, function () { pending[name] = false; });
        } else pending[name] = false;
    }
    function watchGames() {
        var observer = new MutationObserver(function (changes) {
            if (changes.some(function (change) { return games[change.target.id]; })) syncMusic();
        });
        observer.observe(document.body, {attributes:true, subtree:true, attributeFilter:['hidden']});
        syncMusic();
    }
    document.addEventListener('pointerdown', syncMusic, true);
    document.addEventListener('keydown', syncMusic, true);
    // Unlock every mobile track during the first gesture, then sync after button handlers.
    var mobileTracksUnlocked = false;
    document.addEventListener('pointerdown', function () {
        if (!window.matchMedia('(pointer: coarse)').matches || mobileTracksUnlocked) return;
        mobileTracksUnlocked = true;
        Object.keys(tracks).forEach(function (name) {
            var music = tracks[name];
            if (name === active) return;
            music.muted = true;
            var attempt = music.play();
            Promise.resolve(attempt).then(function () {
                if (name !== active) music.pause();
                music.muted = false;
            }, function () { music.muted = false; mobileTracksUnlocked = false; });
        });
    }, true);
    document.addEventListener('click', function () {
        if (window.matchMedia('(pointer: coarse)').matches) syncMusic();
    });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchGames);
    else watchGames();
    window.tourBackgroundMusic = tracks.tour;
    window.syncTourMusic = syncMusic;
    syncMusic();
})();
