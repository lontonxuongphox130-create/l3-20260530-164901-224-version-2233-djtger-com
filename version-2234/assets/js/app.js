(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('[data-slide-dot]', hero);
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide-dot')) || 0);
        startTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var panel = document.querySelector('[data-filter-panel]');
  var grid = document.querySelector('[data-filter-grid]');

  if (panel && grid) {
    var cards = selectAll('.movie-card', grid);
    var searchInput = panel.querySelector('[data-filter-search]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var counter = panel.querySelector('[data-filter-count]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);

    if (searchInput && params.get('q')) {
      searchInput.value = params.get('q');
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
    }

    function applyFilters() {
      var query = normalize(searchInput && searchInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var shown = 0;

      cards.forEach(function (card) {
        var text = cardText(card);
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
        var matchesType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
        var matchesYear = !year || normalize(card.getAttribute('data-year')).indexOf(year) !== -1;
        var visible = matchesQuery && matchesRegion && matchesType && matchesYear;

        card.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });

      if (counter) {
        counter.textContent = '当前显示 ' + shown + ' 部影片';
      }

      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
