(function () {
    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var index = 0;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
            });
        });

        window.setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-category-select]");
    var grid = document.querySelector("[data-filter-grid]");
    var result = document.querySelector("[data-result-count]");
    var empty = document.querySelector("[data-empty-state]");

    if (input && grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-search-card]"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (query) {
            input.value = query;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function filterCards() {
            var keyword = normalize(input.value);
            var category = select ? normalize(select.value) : "";
            var shown = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.textContent
                ].join(" "));
                var cardCategory = normalize(card.getAttribute("data-category"));
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedCategory = !category || cardCategory === category;
                var matched = matchedKeyword && matchedCategory;

                card.style.display = matched ? "" : "none";
                if (matched) {
                    shown += 1;
                }
            });

            if (result) {
                result.textContent = "匹配 " + shown + " 部";
            }
            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }

        input.addEventListener("input", filterCards);
        if (select) {
            select.addEventListener("change", filterCards);
        }
        filterCards();
    }
}());
