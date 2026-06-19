(function () {
  function initializePlayer(container) {
    var video = container.querySelector('video');
    var overlay = container.querySelector('.video-overlay');
    var stream = container.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;

    if (!video || !stream) {
      return;
    }

    function attachStream() {
      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.controls = true;
    }

    function playVideo() {
      attachStream();
      container.classList.add('playing');

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          container.classList.remove('playing');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      container.classList.add('playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        container.classList.remove('playing');
      }
    });

    video.addEventListener('ended', function () {
      container.classList.remove('playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initializePlayer);
})();
