(function () {
  "use strict";
  const room1Artworks = [
    {
      file: "1.png",
      title: "꽃을 건네는 마음",
      year: "2010",
      medium: "C-print",
      size: "114 × 124cm",
    },
    {
      file: "2.png",
      title: "I Love you",
      year: "2010",
      medium: "C-print",
      size: "110 × 93cm",
    },
    {
      file: "3.png",
      title: "너무 늦은 만남",
      year: "2007",
      medium: "C-print",
      size: "110 × 147cm",
    },
    {
      file: "4.png",
      title: "모래시계 가족",
      year: "2009",
      medium: "C-print",
      size: "110 × 83cm",
    },
    {
      file: "5.png",
      title: "해변의 연인들",
      year: "2015",
      medium: "C-print",
      size: "110 × 73cm",
    },
    {
      file: "6.png",
      title: "여드름 짜기",
      year: "2011",
      medium: "C-print",
      size: "110 × 140cm",
    },
    {
      file: "7.png",
      title: "씨리얼 킬러",
      year: "2007",
      medium: "C-print",
      size: "110 × 74cm",
    },
    {
      file: "8.png",
      title: "사랑은 시간을 멈추게 한다",
      year: "2012",
      medium: "C-print",
      size: "110 × 93cm",
    },
    {
      file: "9.png",
      title: "사랑의 건배",
      year: "2010",
      medium: "C-print",
      size: "110 × 79cm",
    },
  ];
  const room2Artworks = [
    {
      file: "10.png",
      title: "피눈물을 흘리다",
      year: "2009",
      medium: "C-print",
      size: "110 × 88cm",
    },
  ];
  const artworksByRoom = { Room1: room1Artworks, Room2: room2Artworks };
  window.ArtworkViewData = artworksByRoom;
  let closeCurrent = null;
  let cameraSession = null;
  function sound(name) {
    if (window.PuzzleEffects) window.PuzzleEffects.play(name);
  }

  window.startArtworkView = function (krpano, hotspot, number) {
    const room = krpano.get("xml.scene") === "scene_room2" ? "Room2" : "Room1";
    if (cameraSession || !artworksByRoom[room][Number(number) - 1]) return;
    sound("open");
    krpano.call("stopmovements();");
    const saved = {
      h: Number(krpano.get("view.hlookat")),
      v: Number(krpano.get("view.vlookat")),
      fov: Number(krpano.get("view.fov")),
      scene: krpano.get("xml.scene"),
      usercontrol: krpano.get("control.usercontrol"),
      gyro: krpano.get("plugin[skin_gyro].enabled"),
    };
    const h = Number(hotspot.artcenterh ?? hotspot.ath),
      v = Number(hotspot.artcenterv ?? hotspot.atv);
    if (![saved.h, saved.v, saved.fov, h, v].every(Number.isFinite)) return;
    cameraSession = { krpano, saved, number, room };
    krpano.set("control.usercontrol", "off");
    if (saved.gyro !== null && saved.gyro !== undefined)
      krpano.set("plugin[skin_gyro].enabled", false);
    const minimum = Number(krpano.get("view.fovmin")) || 1;
    const zoom = Math.max(minimum, saved.fov * 0.82);
    krpano.call(
      "lookto(" +
        h +
        "," +
        v +
        "," +
        zoom +
        ",tween(easeInOutQuad,0.85),true);js(window.finishArtworkView());",
    );
  };

  window.finishArtworkView = function () {
    if (!cameraSession) return;
    const session = cameraSession;
    window.openArtworkView(
      session.number,
      function () {
        const { krpano, saved } = session;
        if (krpano.get("xml.scene") === saved.scene) {
          krpano.call(
            "lookto(" +
              saved.h +
              "," +
              saved.v +
              "," +
              saved.fov +
              ",tween(easeInOutQuad,0.85),true);js(window.finishArtworkViewReturn());",
          );
        } else window.finishArtworkViewReturn();
      },
      session.room,
    );
  };

  window.finishArtworkViewReturn = function () {
    if (!cameraSession) return;
    const { krpano, saved } = cameraSession;
    krpano.set("control.usercontrol", saved.usercontrol);
    if (saved.gyro !== null && saved.gyro !== undefined)
      krpano.set("plugin[skin_gyro].enabled", saved.gyro);
    cameraSession = null;
  };

  window.openArtworkView = function (number, onClose, room = "Room1") {
    const artwork =
      artworksByRoom[room] && artworksByRoom[room][Number(number) - 1];
    if (!artwork) return;
    if (closeCurrent) closeCurrent(true);
    const previousFocus = document.activeElement;
    const overlay = document.createElement("div");
    overlay.className = "puzzle-overlay aview-overlay";
    overlay.innerHTML =
      '<section class="aview-dialog" role="dialog" aria-modal="true" aria-labelledby="aview-title">' +
      '<button class="aview-close" aria-label="작품 보기 닫기">×</button>' +
      '<div class="aview-layout">' +
      '<div class="aview-image-wrap"><img class="aview-image" alt="" /></div>' +
      '<aside class="aview-info">' +
      '<h2 class="aview-title" id="aview-title"></h2>' +
      '<div class="aview-meta"><p class="aview-year"></p><p class="aview-medium"></p><p class="aview-size"></p></div>' +
      "</aside>" +
      "</div>" +
      "</section>";
    document.body.appendChild(overlay);
    if (window.Room2BGM) window.Room2BGM.puzzle(true);
    const url = "paints/" + room + "/" + artwork.file;
    const img = overlay.querySelector(".aview-image");
    img.src = url;
    img.alt = artwork.title;
    overlay.querySelector(".aview-title").textContent = artwork.title;
    overlay.querySelector(".aview-year").textContent = artwork.year;
    overlay.querySelector(".aview-medium").textContent = artwork.medium;
    overlay.querySelector(".aview-size").textContent = artwork.size;
    const closeButton = overlay.querySelector(".aview-close");
    let closing = false;
    function close(immediate) {
      if (!overlay.isConnected || closing) return;
      closing = true;
      sound("close");
      document.removeEventListener("keydown", onKey);
      closeCurrent = null;
      function finishClose() {
        overlay.remove();
        if (window.Room2BGM) window.Room2BGM.puzzle(false);
        if (previousFocus && previousFocus.isConnected) previousFocus.focus();
        if (onClose) onClose();
      }
      if (immediate === true) finishClose();
      else {
        overlay.classList.add("leaving");
        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        window.setTimeout(finishClose, reduced ? 0 : 450);
      }
    }
    function onKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "Tab") {
        event.preventDefault();
        closeButton.focus();
      }
    }
    closeCurrent = close;
    closeButton.onclick = close;
    overlay.onclick = (event) => {
      if (event.target === overlay) close();
    };
    document.addEventListener("keydown", onKey);
    closeButton.focus();
  };
})();
