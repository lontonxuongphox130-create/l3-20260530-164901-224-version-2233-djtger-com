import { H as Hls } from './hls-vendor-dru42stk.js';

const players = document.querySelectorAll('[data-player]');

players.forEach((player) => {
  const video = player.querySelector('video');
  const cover = player.querySelector('.player-cover');
  const source = player.dataset.src;
  let loaded = false;
  let hls = null;

  const load = () => {
    if (loaded || !video || !source) {
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    }

    loaded = true;
  };

  const play = () => {
    load();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    video.controls = true;
    const request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(() => {
        video.controls = true;
      });
    }
  };

  if (cover) {
    cover.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', () => {
      if (!loaded) {
        play();
      }
    });
  }

  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
});
