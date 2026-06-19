
import { H as Hls } from './hls-vendor.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}

function normalize(value) {
  return (value || '').toString().toLowerCase().trim();
}

function createCardMarkup(movie, basePath = '../movies/') {
  const h1 = movie.h1 ?? ((Number(movie.id) * 37) % 360);
  const h2 = movie.h2 ?? ((h1 + 34) % 360);
  const href = movie.href || `${basePath}${movie.id}.html`;
  return `
    <a class="movie-card" href="${href}" data-card
       data-title="${escapeHtml(movie.title)}"
       data-region="${escapeHtml(movie.region)}"
       data-type="${escapeHtml(movie.type)}"
       data-year="${movie.year}"
       data-genre="${escapeHtml(movie.genre)}"
       data-tags="${escapeHtml(movie.tags)}"
       style="--h1:${h1};--h2:${h2};">
      <div class="movie-card__poster">
        <div class="movie-card__poster-inner">
          <div class="movie-card__initial">${escapeHtml(movie.title.slice(0, 1))}</div>
          <div class="movie-card__poster-meta">
            <span>${escapeHtml(movie.year)}</span>
            <span>${escapeHtml(movie.region)}</span>
            <span>${escapeHtml(movie.type)}</span>
          </div>
        </div>
      </div>
      <div class="movie-card__body">
        <div class="movie-card__title">${escapeHtml(movie.title)}</div>
        <div class="movie-card__desc">${escapeHtml(movie.oneLine || movie.summary || '')}</div>
        <div class="meta-row">
          <span class="chip chip--brand">${escapeHtml(movie.genre || '')}</span>
          <span class="chip">${escapeHtml((movie.tags || movie.tags_str || movie.region).split(/[，,、]/)[0] || movie.region)}</span>
        </div>
      </div>
    </a>
  `;
}

function escapeHtml(value) {
  return (value ?? '')
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function initMobileNav() {
  const toggle = $('[data-nav-toggle]');
  const panel = $('[data-nav-drawer]');
  if (!toggle || !panel) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    panel.classList.toggle('hidden');
  });

  $$('a', panel).forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        toggle.setAttribute('aria-expanded', 'false');
        panel.classList.add('hidden');
      }
    });
  });
}

function initCopyLink() {
  const button = $('[data-copy-link]');
  if (!button) return;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      button.textContent = '已复制';
      setTimeout(() => {
        button.textContent = '复制链接';
      }, 1500);
    } catch (error) {
      window.prompt('复制当前链接：', window.location.href);
    }
  });
}

function initPlayers() {
  $$('video[data-hls-src]').forEach((video) => {
    if (video.dataset.hlsInit) return;
    video.dataset.hlsInit = '1';
    const src = video.dataset.hlsSrc;
    if (!src) return;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.dataset.ready = '1';
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data || !data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      video._hls = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else {
      video.src = src;
    }
  });
}

function initStaticFilters() {
  const form = $('[data-filter-form]');
  const grid = $('[data-filter-grid]');
  if (!form || !grid) return;

  const inputs = {
    q: $('[data-filter-q]', form),
    region: $('[data-filter-region]', form),
    type: $('[data-filter-type]', form),
    sort: $('[data-filter-sort]', form)
  };
  const cards = $$('[data-card]', grid);

  function applyFilters() {
    const q = normalize(inputs.q?.value);
    const region = normalize(inputs.region?.value);
    const type = normalize(inputs.type?.value);
    const sort = normalize(inputs.sort?.value || 'year');

    const visible = cards.filter((card) => {
      const title = normalize(card.dataset.title);
      const cardRegion = normalize(card.dataset.region);
      const cardType = normalize(card.dataset.type);
      const genre = normalize(card.dataset.genre);
      const tags = normalize(card.dataset.tags);
      const year = normalize(card.dataset.year);

      const qMatch =
        !q ||
        title.includes(q) ||
        cardRegion.includes(q) ||
        cardType.includes(q) ||
        genre.includes(q) ||
        tags.includes(q) ||
        year.includes(q);

      const regionMatch = !region || region === 'all' || cardRegion === region;
      const typeMatch = !type || type === 'all' || cardType === type;
      return qMatch && regionMatch && typeMatch;
    });

    const sorted = [...visible].sort((a, b) => {
      if (sort === 'title') return a.dataset.title.localeCompare(b.dataset.title, 'zh-Hans-CN');
      if (sort === 'region') return a.dataset.region.localeCompare(b.dataset.region, 'zh-Hans-CN');
      return Number(b.dataset.year) - Number(a.dataset.year);
    });

    cards.forEach((card) => {
      card.classList.add('hidden');
    });

    sorted.forEach((card) => {
      card.classList.remove('hidden');
      grid.appendChild(card);
    });

    const empty = $('[data-empty-state]');
    if (empty) {
      empty.classList.toggle('hidden', sorted.length !== 0);
    }

    const counter = $('[data-result-count]');
    if (counter) counter.textContent = String(sorted.length);
  }

  ['input', 'change'].forEach((eventName) => {
    form.addEventListener(eventName, applyFilters);
  });
  applyFilters();
}

function renderSearchResults(list) {
  const mount = $('[data-search-results]');
  if (!mount || !window.MOVIES) return;
  const basePath = 'movies/';
  const html = list.slice(0, 60).map((movie) => createCardMarkup({
    ...movie,
    href: `${basePath}${movie.id}.html`
  }, 'movies/')).join('');
  mount.innerHTML = html || '<div class="empty-state">没有找到符合条件的影片。</div>';
  const counter = $('[data-search-count]');
  if (counter) counter.textContent = String(list.length);
}

function initSearchPage() {
  const form = $('[data-search-form]');
  const input = $('[data-search-input]');
  const chips = $$('[data-suggest-chip]');
  const resultsMount = $('[data-search-results]');
  if (!form || !input || !resultsMount || !window.MOVIES) return;

  const initial = getParam('q');
  if (initial) input.value = initial;

  function runSearch() {
    const keyword = normalize(input.value);
    const source = window.MOVIES || [];
    const filtered = !keyword
      ? source.slice(0, 36)
      : source.filter((movie) => {
          const haystack = [
            movie.title,
            movie.oneLine,
            movie.summary,
            movie.region,
            movie.type,
            movie.genre,
            movie.tags
          ].join(' ').toLowerCase();
          return haystack.includes(keyword);
        });

    renderSearchResults(filtered);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const keyword = input.value.trim();
    const url = new URL(window.location.href);
    if (keyword) {
      url.searchParams.set('q', keyword);
    } else {
      url.searchParams.delete('q');
    }
    history.replaceState({}, '', url);
    runSearch();
  });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.suggestChip || chip.textContent.trim();
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
  });

  runSearch();
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initPlayers();
  initStaticFilters();
  initSearchPage();
  initCopyLink();
});
