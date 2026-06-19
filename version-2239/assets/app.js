(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", mobilePanel.classList.contains("is-open"));
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll('form[action="./search.html"]'), function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : "";
        if (value) {
          event.preventDefault();
          window.location.href = "./search.html?q=" + encodeURIComponent(value);
        }
      });
    });

    initHero();
    initFilters();
    initPlayer();
  });

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var scope = document.querySelector("[data-filter-scope]");
    if (!scope) {
      return;
    }

    var searchInput = scope.querySelector("[data-filter-text]");
    var regionSelect = scope.querySelector("[data-filter-region]");
    var typeSelect = scope.querySelector("[data-filter-type]");
    var yearSelect = scope.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var status = scope.querySelector("[data-filter-status]");
    var empty = scope.querySelector("[data-filter-empty]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (searchInput && initial) {
      searchInput.value = initial;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function apply() {
      var query = normalize(searchInput ? searchInput.value : "");
      var region = normalize(regionSelect ? regionSelect.value : "");
      var type = normalize(typeSelect ? typeSelect.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year")
        ].join(" "));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (region && cardRegion.indexOf(region) === -1) {
          matched = false;
        }
        if (type && cardType.indexOf(type) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = visible > 0 ? "匹配影片：" + visible : "暂无匹配影片";
      }
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function initPlayer() {
    var shell = document.querySelector("[data-player]");
    var video = document.querySelector("[data-player-video]");
    if (!shell || !video) {
      return;
    }

    var source = shell.getAttribute("data-video-url");
    var cover = document.querySelector("[data-player-cover]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-play-button]"));
    var loaded = false;
    var hls = null;

    function attach() {
      if (loaded || !source) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {});
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", start);
    });

    if (cover) {
      cover.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
