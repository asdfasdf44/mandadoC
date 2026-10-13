const productOptions = [
  { name: '악어와 생일케이크 파티 에코백', original: '7,500원', sale: '5,500원', alt: '악어와 생일케이크 파티 에코백' },
  { name: '악어와 생일케이크 키링', original: '5,500원', sale: '3,500원', alt: '악어와 생일케이크 키링' }
];

const galleryImages = Array.from(document.querySelectorAll('.product-gallery-image'));
const productButtons = Array.from(document.querySelectorAll('.product-toggle-button'));
const priceCard = document.querySelector('.product-price');
const productName = document.querySelector('.product-name');
const originalPrice = document.querySelector('.original-price');
const salePrice = document.querySelector('.price-row strong');
const purchaseButton = document.querySelector('.purchase-button');

function showProduct(index) {
  const product = productOptions[index];
  if (!product || galleryImages[index].classList.contains('is-active')) return;

  galleryImages.forEach((image, imageIndex) => image.classList.toggle('is-active', imageIndex === index));
  productButtons.forEach((button, buttonIndex) => {
    const active = buttonIndex === index;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
  });

  priceCard.classList.add('is-changing');
  window.setTimeout(() => {
    productName.textContent = product.name;
    originalPrice.textContent = product.original;
    salePrice.textContent = product.sale;
    priceCard.setAttribute('aria-label', `${product.name} 할인 가격: ${product.original}에서 ${product.sale}`);
    purchaseButton.setAttribute('aria-label', `${product.name} 구매하기`);
    priceCard.classList.remove('is-changing');
  }, 300);
}

productButtons.forEach((button) => button.addEventListener('click', () => showProduct(Number(button.dataset.product))));
