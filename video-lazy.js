// Keep popup videos off the network until the shop is near the viewport.
const lazyShopVideos = Array.from(document.querySelectorAll('.lazy-shop-video'));

function loadAndPlayVideo(video) {
  if (!video.dataset.loaded) {
    const source = document.createElement('source');
    source.src = video.dataset.src;
    source.type = 'video/mp4';
    video.append(source);
    video.dataset.loaded = 'true';
    video.load();
  }

  video.play().catch(() => {
    // Browsers can still refuse autoplay in exceptional power-saving modes.
  });
}

function handleVideoVisibility(entries) {
  entries.forEach((entry) => {
    const video = entry.target;
    if (entry.isIntersecting) loadAndPlayVideo(video);
    else video.pause();
  });
}

if ('IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver(handleVideoVisibility, {
    rootMargin: '300px 0px',
    threshold: 0.01
  });
  lazyShopVideos.forEach((video) => videoObserver.observe(video));
} else {
  lazyShopVideos.forEach(loadAndPlayVideo);
}
