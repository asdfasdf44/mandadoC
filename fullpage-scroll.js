// Desktop uses one smooth section transition per input. Mobile keeps native scrolling.
const sections = Array.from(document.querySelectorAll('.hero, .tour-section, .manifesto, .shop-section, footer'));
let moving = false;
let touchStartY = 0;
const desktopScrollQuery = window.matchMedia('(min-width: 701px)');

function isFullPageScrollEnabled() {
  return desktopScrollQuery.matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function moveToSection(direction) {
  if (moving || !isFullPageScrollEnabled()) return;
  const currentY = window.scrollY;
  const currentIndex = sections.reduce(function(best, section, index) {
    return Math.abs(section.offsetTop - currentY) < Math.abs(sections[best].offsetTop - currentY) ? index : best;
  }, 0);
  const nextIndex = Math.max(0, Math.min(sections.length - 1, currentIndex + direction));
  if (nextIndex === currentIndex) return;

  moving = true;
  const startY = currentY;
  const destinationY = sections[nextIndex].offsetTop;
  const duration = 900;
  const startTime = performance.now();

  function animate(now) {
    const elapsed = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + (destinationY - startY) * easeInOutCubic(elapsed));
    if (elapsed < 1) requestAnimationFrame(animate);
    else moving = false;
  }
  requestAnimationFrame(animate);
}

window.addEventListener('wheel', function(event) {
  const loginModal = document.querySelector('#loginModal');
  if (!isFullPageScrollEnabled() || event.deltaY === 0 || loginModal?.open) return;
  event.preventDefault();
  if (!moving) moveToSection(event.deltaY > 0 ? 1 : -1);
}, { passive: false });

window.addEventListener('touchstart', function(event) {
  if (!isFullPageScrollEnabled()) return;
  touchStartY = event.changedTouches[0].screenY;
}, { passive: true });

window.addEventListener('touchend', function(event) {
  if (!isFullPageScrollEnabled()) return;
  const distance = touchStartY - event.changedTouches[0].screenY;
  if (Math.abs(distance) > 45) moveToSection(distance > 0 ? 1 : -1);
}, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener('click', function(event) {
    const target = document.querySelector(link.getAttribute('href'));
    if (!isFullPageScrollEnabled() || !target || moving) return;
    event.preventDefault();
    moving = true;
    const startY = window.scrollY;
    const destinationY = target.offsetTop;
    const duration = 1000;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, startY + (destinationY - startY) * easeInOutCubic(elapsed));
      if (elapsed < 1) requestAnimationFrame(animate);
      else moving = false;
    }
    requestAnimationFrame(animate);
  });
});
