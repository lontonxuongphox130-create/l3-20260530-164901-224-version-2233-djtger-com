(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function markMissingImages() {
        qsa("img").forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("is-missing");
            }, { once: true });
        });
    }

    function initMobileNav() {
        var toggle = qs("[data-mobile-toggle]");
        var links = qs("[data-nav-links]");
        if (!toggle || !links) {
            return;
        }

        toggle.addEventListener("click", function () {
            links.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = qs("[data-hero]");
        if (!hero || !window.HERO_ITEMS || !window.HERO_ITEMS.length) {
            return;
        }

        var bg = qs("[data-hero-bg]", hero);
        var title = qs("[data-hero-title]", hero);
        var line = qs("[data-hero-line]", hero);
        var meta = qs("[data-hero-meta]", hero);
        var poster = qs("[data-hero-poster]", hero);
        var link = qs("[data-hero-link]", hero);
        var detail = qs("[data-hero-detail]", hero);
        var dots = qs("[data-hero-dots]", hero);
        var index = 0;

        function render(i) {
            var item = window.HERO_ITEMS[i];
            if (!item) {
                return;
            }

            if (bg) {
                bg.style.backgroundImage = "url('" + item.cover + "')";
            }

            if (title) {
                title.textContent = item.title;
            }

            if (line) {
                line.textContent = item.oneLine;
            }

            if (meta) {
                meta.innerHTML = [
                    "<span>" + escapeHtml(item.year) + "</span>",
                    "<span>" + escapeHtml(item.region) + "</span>",
                    "<span>" + escapeHtml(item.category) + "</span>"
                ].join("");
            }

            if (poster) {
                poster.src = item.cover;
                poster.alt = item.title;
                poster.classList.remove("is-missing");
            }

            if (link) {
                link.href = item.url;
            }

            if (detail) {
                detail.href = item.url;
            }

            if (dots) {
                qsa("button", dots).forEach(function (button, buttonIndex) {
                    button.classList.toggle("active", buttonIndex === i);
                });
            }
        }

        if (dots) {
            dots.innerHTML = window.HERO_ITEMS.map(function (_, i) {
                return "<button type=\"button\" aria-label=\"切换推荐 " + (i + 1) + "\"></button>";
            }).join("");

            qsa("button", dots).forEach(function (button, i) {
                button.addEventListener("click", function () {
                    index = i;
                    render(index);
                });
            });
        }

        render(index);

        window.setInterval(function () {
            index = (index + 1) % window.HERO_ITEMS.length;
            render(index);
        }, 5200);
    }

    function filmCard(item) {
        return [
            "<a class=\"card\" href=\"" + escapeHtml(item.url) + "\">",
            "    <div class=\"card-cover cover-shell\">",
            "        <img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
            "        <div class=\"missing-cover\">" + escapeHtml(item.title) + "</div>",
            "        <span class=\"year-badge\">" + escapeHtml(item.year) + "</span>",
            "        <span class=\"play-badge\">▶</span>",
            "    </div>",
            "    <div class=\"card-body\">",
            "        <h3 class=\"card-title\">" + escapeHtml(item.title) + "</h3>",
            "        <p class=\"card-line\">" + escapeHtml(item.oneLine) + "</p>",
            "        <div class=\"card-meta\">",
            "            <span>" + escapeHtml(item.region) + "</span>",
            "            <span>" + escapeHtml(item.category) + "</span>",
            "        </div>",
            "    </div>",
            "</a>"
        ].join("");
    }

    function initSearch() {
        var forms = qsa("[data-search-form]");
        var results = qs("[data-search-results]");
        var grid = qs("[data-search-grid]");
        var title = qs("[data-search-title]");

        function runSearch(keyword) {
            var query = String(keyword || "").trim().toLowerCase();

            if (!query || !results || !grid || !window.SEARCH_INDEX) {
                if (results) {
                    results.classList.remove("active");
                }
                return;
            }

            var matches = window.SEARCH_INDEX.filter(function (item) {
                return [
                    item.title,
                    item.region,
                    item.category,
                    item.genre,
                    item.oneLine,
                    (item.tags || []).join(" ")
                ].join(" ").toLowerCase().indexOf(query) !== -1;
            }).slice(0, 40);

            results.classList.add("active");

            if (title) {
                title.textContent = "搜索结果：" + query + "（" + matches.length + "）";
            }

            if (!matches.length) {
                grid.innerHTML = "<div class=\"empty-state\">没有找到匹配内容，可尝试更换关键词。</div>";
            } else {
                grid.innerHTML = matches.map(filmCard).join("");
                markMissingImages();
            }

            results.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = qs("input", form);
                var value = input ? input.value : "";

                if (!results || !grid) {
                    var action = form.getAttribute("action") || "index.html";
                    window.location.href = action + "?q=" + encodeURIComponent(value);
                    return;
                }

                runSearch(value);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var keyword = params.get("q");
        if (keyword) {
            var firstInput = qs("[data-search-form] input");
            if (firstInput) {
                firstInput.value = keyword;
            }
            runSearch(keyword);
        }
    }

    function initFilters() {
        var filter = qs("[data-filter]");
        if (!filter) {
            return;
        }

        var keywordInput = qs("[data-filter-keyword]", filter);
        var yearSelect = qs("[data-filter-year]", filter);
        var regionSelect = qs("[data-filter-region]", filter);
        var cards = qsa("[data-film-card]");

        function apply() {
            var keyword = (keywordInput && keywordInput.value || "").trim().toLowerCase();
            var year = yearSelect && yearSelect.value || "";
            var region = regionSelect && regionSelect.value || "";

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-text") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var cardRegion = card.getAttribute("data-region") || "";

                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (year && cardYear !== year) {
                    ok = false;
                }
                if (region && cardRegion !== region) {
                    ok = false;
                }

                card.style.display = ok ? "" : "none";
            });
        }

        [keywordInput, yearSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    function loadScript(src, callback) {
        var existing = document.querySelector("script[src=\"" + src + "\"]");
        if (existing) {
            existing.addEventListener("load", callback);
            callback();
            return;
        }

        var script = document.createElement("script");
        script.src = src;
        script.onload = callback;
        document.head.appendChild(script);
    }

    function attachHls(video, src) {
        if (!src) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }

        loadScript("https://cdn.jsdelivr.net/npm/hls.js@latest", function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            }
        });
    }

    function initPlayers() {
        qsa("[data-player]").forEach(function (box) {
            var video = qs("video", box);
            var button = qs("[data-play-button]", box);
            var overlay = qs("[data-player-overlay]", box);
            var source = box.getAttribute("data-src");

            function play() {
                if (!video) {
                    return;
                }

                if (!video.getAttribute("data-loaded")) {
                    video.setAttribute("data-loaded", "true");
                    attachHls(video, source);
                } else {
                    video.play().catch(function () {});
                }

                if (overlay) {
                    overlay.classList.add("hidden");
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        markMissingImages();
        initMobileNav();
        initHero();
        initSearch();
        initFilters();
        initPlayers();
    });
})();
