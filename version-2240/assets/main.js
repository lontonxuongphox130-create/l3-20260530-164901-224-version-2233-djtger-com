(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('mainNav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
  var noResult = document.querySelector('[data-no-result]');

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilter(value) {
    var query = normalize(value);
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.type
      ].join(' '));
      var visible = !query || haystack.indexOf(query) !== -1;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount += 1;
      }
    });

    if (noResult) {
      noResult.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    filterInput.value = query;
    applyFilter(query);
    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });
  }

  var quickForm = document.querySelector('[data-quick-search]');
  if (quickForm) {
    quickForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = quickForm.querySelector('input');
      var value = input ? input.value.trim() : '';
      var target = quickForm.getAttribute('action') || 'latest.html';
      window.location.href = value ? target + '?q=' + encodeURIComponent(value) : target;
    });
  }
})();
