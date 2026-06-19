(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var sliders = document.querySelectorAll(".hero-slider");

  sliders.forEach(function (slider) {
    var slides = slider.querySelectorAll(".hero-slide");
    var dots = slider.querySelectorAll(".hero-dot");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function next() {
      show(current + 1);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(next, 5200);
      });
    });

    show(0);

    if (slides.length > 1) {
      timer = window.setInterval(next, 5200);
    }
  });

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters(scope) {
    var root = scope || document;
    var input = root.querySelector("[data-filter-input]");
    var category = root.querySelector("[data-filter-category]");
    var year = root.querySelector("[data-filter-year]");
    var region = root.querySelector("[data-filter-region]");
    var cards = root.querySelectorAll(".filter-card");

    if (!cards.length) {
      return;
    }

    function apply() {
      var term = normalize(input ? input.value : "");
      var cat = normalize(category ? category.value : "");
      var y = normalize(year ? year.value : "");
      var reg = normalize(region ? region.value : "");

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.year
        ].join(" "));
        var matched = true;

        if (term && haystack.indexOf(term) === -1) {
          matched = false;
        }

        if (cat && normalize(card.dataset.category) !== cat) {
          matched = false;
        }

        if (y && normalize(card.dataset.year) !== y) {
          matched = false;
        }

        if (reg && normalize(card.dataset.region) !== reg) {
          matched = false;
        }

        card.classList.toggle("hidden-card", !matched);
      });
    }

    [input, category, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  setupFilters(document);
})();

function setupMoviePlayer(url) {
  var video = document.getElementById("movie-player");
  var cover = document.querySelector(".play-cover");
  var shell = document.querySelector(".player-shell");
  var instance = null;
  var ready = false;

  if (!video || !url) {
    return;
  }

  function attach() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      instance = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      instance.loadSource(url);
      instance.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  function play() {
    attach();

    if (shell) {
      shell.classList.add("is-playing");
    }

    video.controls = true;

    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (cover) {
          cover.classList.remove("hidden-card");
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener("pagehide", function () {
    if (instance && typeof instance.destroy === "function") {
      instance.destroy();
    }
  });
}
