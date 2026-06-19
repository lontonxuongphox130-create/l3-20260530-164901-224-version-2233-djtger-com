const menuButton = document.querySelector('[data-menu-toggle]');
const mobilePanel = document.querySelector('[data-mobile-panel]');

if (menuButton && mobilePanel) {
  menuButton.addEventListener('click', () => {
    mobilePanel.classList.toggle('is-open');
  });
}

const hero = document.querySelector('[data-hero-carousel]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('.hero-dot'));
  let current = 0;

  const showSlide = (index) => {
    current = index;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
  });

  if (slides.length > 1) {
    window.setInterval(() => {
      showSlide((current + 1) % slides.length);
    }, 5200);
  }
}
