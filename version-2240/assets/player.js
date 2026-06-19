(function () {
  function startPlayer(frame) {
    var video = frame.querySelector('video');
    var cover = frame.querySelector('[data-player-cover]');
    var status = frame.querySelector('[data-player-status]');

    if (!video) {
      return;
    }

    var src = video.dataset.src;
    if (!src) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function hideCover() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function play() {
      hideCover();

      if (window.Hls && window.Hls.isSupported()) {
        if (!video._hlsReady) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          video._hlsReady = true;
          video._hls = hls;
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('正在播放');
            video.play().catch(function () {
              setStatus('点击画面继续播放');
            });
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('正在重新连接');
              hls.startLoad();
              return;
            }
            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('正在恢复播放');
              hls.recoverMediaError();
              return;
            }
            setStatus('请稍后重试');
          });
        } else {
          video.play().catch(function () {
            setStatus('点击画面继续播放');
          });
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', src);
        }
        video.play().then(function () {
          setStatus('正在播放');
        }).catch(function () {
          setStatus('点击画面继续播放');
        });
      } else {
        setStatus('请稍后重试');
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      hideCover();
      setStatus('正在播放');
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player-frame]')).forEach(startPlayer);
})();
