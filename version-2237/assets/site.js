
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMobileNav() {
    const toggles = document.querySelectorAll('[data-nav-toggle]');
    const panels = document.querySelectorAll('[data-mobile-panel]');
    if (!toggles.length || !panels.length) return;

    toggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
        panels.forEach((panel) => {
          panel.classList.toggle('is-open');
          const expanded = panel.classList.contains('is-open');
          toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });
      });
    });
  }

  function filterCardGrid(form) {
    const grid = form.closest('.section-card, .detail-wrap, .search-panel, .filter-bar, main, body')?.querySelector('[data-card-grid]');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('[data-search]'));
    const query = normalize(form.querySelector('[data-filter-search]')?.value || '');
    const type = normalize(form.querySelector('[data-filter-type]')?.value || '');
    const year = normalize(form.querySelector('[data-filter-year]')?.value || '');
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize(card.getAttribute('data-search'));
      const cardType = normalize(card.getAttribute('data-type'));
      const cardYear = normalize(card.getAttribute('data-year'));

      const matchQuery = !query || haystack.includes(query);
      const matchType = !type || cardType.includes(type);
      const matchYear = !year || cardYear === year;

      const show = matchQuery && matchType && matchYear;
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });

    const counter = form.querySelector('[data-filter-count]');
    if (counter) {
      counter.textContent = String(visible);
    }

    const empty = grid.parentElement?.querySelector('[data-empty-state]');
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  function setupGridFilters() {
    document.querySelectorAll('[data-filter-form]').forEach((form) => {
      const inputs = form.querySelectorAll('[data-filter-search], [data-filter-type], [data-filter-year]');
      inputs.forEach((input) => input.addEventListener('input', () => filterCardGrid(form)));
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        filterCardGrid(form);
      });
      form.addEventListener('reset', () => {
        setTimeout(() => filterCardGrid(form), 0);
      });
      filterCardGrid(form);
    });
  }

  function setupPlayButtons() {
    document.querySelectorAll('[data-play-trigger]').forEach((button) => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        const video = targetId ? document.getElementById(targetId) : button.closest('.player-shell, .player')?.querySelector('video');
        if (!video) return;
        try {
          const play = video.play();
          if (play && typeof play.catch === 'function') {
            play.catch(() => {});
          }
          video.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (err) {
          // no-op
        }
      });
    });
  }

  function setupBackTop() {
    const button = document.querySelector('[data-back-top]');
    if (!button) return;

    const update = () => {
      const show = window.scrollY > 520;
      button.classList.toggle('is-visible', show);
    };

    window.addEventListener('scroll', update, { passive: true });
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    update();
  }

  function renderSearchResults(query) {
    const index = window.SEARCH_INDEX || [];
    const resultsWrap = document.querySelector('[data-global-search-results]');
    const counter = document.querySelector('[data-global-search-count]');
    if (!resultsWrap) return;

    const q = normalize(query);
    const scored = [];

    if (!q) {
      const sorted = index.slice().sort((a, b) => (b.score || 0) - (a.score || 0));
      sorted.slice(0, 24).forEach((item) => scored.push(item));
    } else {
      index.forEach((item) => {
        const hay = normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre_raw,
          item.tags_raw,
          item.one_line,
          item.summary
        ].join(' '));

        if (hay.includes(q)) {
          scored.push(item);
        }
      });
      scored.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    if (counter) {
      counter.textContent = String(scored.length);
    }

    if (!scored.length) {
      resultsWrap.innerHTML = '<div class="empty-state">没有找到匹配结果，请尝试更短的关键词、影片名称、地区或年份。</div>';
      return;
    }

    const html = scored.slice(0, 48).map((item) => `
      <article class="film-card" style="--hue:${item.hue};">
        <a href="video/${item.id}.html" class="film-link">
          <div class="film-poster">
            <span class="film-no">No.${item.id}</span>
            <div class="film-kicker">${item.cat_title}</div>
            <h3>${item.title}</h3>
            <p>${item.year} · ${item.region} · ${item.type}</p>
          </div>
          <div class="film-body">
            <div class="film-meta">
              <span>${item.year}</span>
              <span>${item.region}</span>
              <span>${item.type}</span>
            </div>
            <p class="film-desc">${item.one_line || item.summary || ''}</p>
            <div class="film-tags">
              ${(item.tags || []).slice(0, 3).map((t) => `<span class="tag">${t}</span>`).join('')}
            </div>
          </div>
        </a>
      </article>
    `).join('');

    resultsWrap.innerHTML = html;
  }

  function setupGlobalSearch() {
    const form = document.querySelector('[data-global-search-form]');
    const input = document.querySelector('[data-global-search-input]');
    if (!form || !input) return;

    const handle = () => renderSearchResults(input.value);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      handle();
    });
    input.addEventListener('input', handle);

    const clearBtn = document.querySelector('[data-global-search-clear]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        handle();
        input.focus();
      });
    }
    handle();
  }

  ready(() => {
    setupMobileNav();
    setupGridFilters();
    setupPlayButtons();
    setupBackTop();
    setupGlobalSearch();
  });
})();
