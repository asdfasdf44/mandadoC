(function () {
  const buttons = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-category]');
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => { const selected = item === button; item.classList.toggle('active', selected); item.setAttribute('aria-pressed', String(selected)); });
    let count = 0;
    cards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; if (!card.hidden) count++; });
    document.querySelector('.result-count').textContent = count + '개의 공간';
  }));
})();
