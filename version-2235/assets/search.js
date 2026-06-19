import { movies } from './search-data.js';

const form = document.querySelector('[data-search-form]');
const input = document.querySelector('[data-search-input]');
const results = document.querySelector('[data-search-results]');
const note = document.querySelector('[data-search-note]');

const params = new URLSearchParams(window.location.search);
const initialQuery = params.get('q') || '';

if (input) {
  input.value = initialQuery;
}

const normalize = (value) => String(value || '').toLowerCase().trim();

const renderCard = (movie) => `
  <a class="movie-card" href="${movie.href}">
    <div class="card-poster">
      <img src="${movie.image}" alt="${movie.title}" loading="lazy">
      <span class="badge badge-left">${movie.region}</span>
      <span class="badge badge-right">${movie.type}</span>
      <span class="badge badge-year">${movie.year}</span>
      <span class="play-chip">▶</span>
    </div>
    <div class="card-body">
      <h3 class="card-title">${movie.title}</h3>
      <p class="card-text">${movie.oneLine}</p>
      <div class="card-meta"><span>${movie.genre}</span></div>
    </div>
  </a>
`;

const search = (query) => {
  const keyword = normalize(query);
  const matched = keyword
    ? movies.filter((movie) => normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' ')).includes(keyword))
    : movies.slice(0, 48);

  if (note) {
    note.textContent = keyword ? `“${query}” 的相关结果` : '输入片名、类型、地区或标签查找内容';
  }

  if (results) {
    results.innerHTML = matched.slice(0, 96).map(renderCard).join('');
  }
};

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input ? input.value.trim() : '';
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState(null, '', url);
    search(query);
  });
}

search(initialQuery);
