// 각 전시의 vrUrl만 이미 만든 VR 투어 주소로 교체하세요.
const tours = [
  { number: '01', title: '빛의 산책', place: 'MUSEUM OF LIGHT', style: 'v1', vrUrl: 'https://asdfasdf44.github.io/mandadoC/vtour/tour.html' },
  { number: '02', title: '경계의 감각', place: 'SEOUL ART SPACE', style: 'v2', vrUrl: 'https://asdfasdf44.github.io/mandadoC/popup-tour/' },
  { number: '03', title: '강남 팝업 2026', place: 'POP UP STORE 2026', style: 'v3', vrUrl: 'https://asdfasdf44.github.io/mandadoC/gangnam-popup/tour.html' }
];
const grid = document.querySelector('#tourGrid');
grid.innerHTML = tours.map(function(tour) {
  return '<article class="tour-card"><div class="visual ' + tour.style + '"></div><div class="card-top"><span>' + tour.number + ' / 03</span><span>VR TOUR</span></div><div class="card-bottom"><button class="enter-tour" data-url="' + tour.vrUrl + '" aria-label="' + tour.title + ' VR 투어 입장">→</button></div></article>';
}).join('');
document.querySelectorAll('.enter-tour').forEach(function(button) {
  button.addEventListener('click', function() {
    const url = button.dataset.url;
    if (url.includes('example.com')) { alert('app.js 파일의 vrUrl을 이미 제작하신 VR 투어 주소로 바꿔 주세요.'); return; }
    window.open(url, '_blank', 'noopener,noreferrer');
  });
});
const modal = document.querySelector('#loginModal');
if (modal && document.querySelector('#loginButton')) {
document.querySelector('#loginButton').addEventListener('click', function() { modal.showModal(); });
document.querySelector('#closeModal').addEventListener('click', function() { modal.close(); });
document.querySelector('#googleButton').addEventListener('click', function() {
  // 실제 서비스 전에는 Firebase Authentication 또는 Supabase Auth의 Google OAuth를 이 위치에 연결합니다.
  document.querySelector('#accountLabel').textContent = 'MY MEXPO';
  modal.close();
  alert('데모 로그인 상태입니다. 실제 Google 로그인을 위해서는 OAuth 설정이 필요합니다.');
});
}
const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) menuToggle.addEventListener('click', function() { document.querySelector('.nav').classList.toggle('open'); });
