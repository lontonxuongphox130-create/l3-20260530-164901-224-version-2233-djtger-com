(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-header-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                input && input.focus();
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startHero() {
            stopHero();
            timer = setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5600);
        }

        function stopHero() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        startHero();
    }

    var filterInput = document.querySelector('[data-page-filter-input]');
    if (filterInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var emptyState = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || params.get('search') || '';

        if (filterInput.hasAttribute('data-autofill-query') && query) {
            filterInput.value = query;
        }

        function applyFilter() {
            var value = filterInput.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
                var matched = !value || text.indexOf(value) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        filterInput.addEventListener('input', applyFilter);
        applyFilter();
    }
})();
