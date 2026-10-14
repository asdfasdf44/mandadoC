(function () {
  'use strict';
  let edge;
  window.LobbyEdgeBlur = {
    scene(name) {
      if (!edge) {
        edge = document.createElement('div');
        edge.className = 'lobby-edge-blur';
        edge.setAttribute('aria-hidden', 'true');
        document.body.appendChild(edge);
      }
      edge.hidden = name !== 'scene_room0';
    }
  };
})();
