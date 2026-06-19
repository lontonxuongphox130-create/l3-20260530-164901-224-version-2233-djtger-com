(function () {
    var player = document.querySelector('[data-player]');
    if (!player) {
        return;
    }

    var video = player.querySelector('video');
    var playButton = player.querySelector('[data-play-button]');
    var streamUrl = player.getAttribute('data-stream');
    var isAttached = false;
    var hlsInstance = null;

    function attachStream() {
        if (!video || !streamUrl || isAttached) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        isAttached = true;
    }

    function startPlayback() {
        attachStream();
        if (playButton) {
            playButton.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (playButton) {
                    playButton.classList.remove('is-hidden');
                }
            });
        }
    }

    if (playButton) {
        playButton.addEventListener('click', startPlayback);
    }

    if (video) {
        video.addEventListener('play', function () {
            if (playButton) {
                playButton.classList.add('is-hidden');
            }
        });

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
