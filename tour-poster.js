[
  { card: 1, file: 'poster_1.png', alt: '첫 번째 전시 포스터' },
  { card: 2, file: 'poster_2.png', alt: 'CORETIK 제몽 온라인 팝업 포스터' },
  { card: 3, file: 'poster_3.svg', alt: '강남 팝업 2026 VR 투어' }
].forEach(function(item) {
  const tourVisual = document.querySelector('.tour-card:nth-child(' + item.card + ') .visual');
  const poster = document.createElement('img');
  poster.src = item.file;
  poster.alt = item.alt;
  poster.className = 'tour-poster';
  if (item.card === 3) {
    const link = document.createElement('a');
    link.href = 'https://asdfasdf44.github.io/mandadoC/gangnam-popup/tour.html';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'tour-poster-link';
    link.setAttribute('aria-label', '강남 팝업 2026 VR 투어 입장');
    link.appendChild(poster);
    tourVisual.appendChild(link);
  } else {
    tourVisual.appendChild(poster);
  }
});
