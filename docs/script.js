const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const providerFilter = document.getElementById('providerFilter');
const providerContainer = document.getElementById('providerContainer');
const loading = document.getElementById('loading');
const statsBar = document.getElementById('statsBar');
const statProviders = document.getElementById('statProviders');
const statCategories = document.getElementById('statCategories');
const providerCount = document.getElementById('providerCount');

let providers = [];
let activeCategory = '';

const categoryColors = {
  "ip":       { bg: "rgba(30, 58, 138, 0.35)", border: "#1e3a8a", text: "#93c5fd" },
  "email":    { bg: "rgba(146, 64, 14, 0.35)",  border: "#92400e", text: "#fcd34d" },
  "bitcoin":  { bg: "rgba(6, 95, 70, 0.35)",    border: "#065f46", text: "#6ee7b7" },
  "ethereum": { bg: "rgba(55, 48, 163, 0.35)",  border: "#3730a3", text: "#a5b4fc" },
  "url":      { bg: "rgba(88, 28, 135, 0.35)",  border: "#581c87", text: "#c4b5fd" },
  "domain":   { bg: "rgba(134, 25, 143, 0.35)", border: "#86198f", text: "#f0abfc" },
  "string":   { bg: "rgba(107, 33, 168, 0.35)", border: "#6b21a8", text: "#d8b4fe" }
};

const searchHint = document.getElementById('searchHint');

searchInput.addEventListener('input', function() {
  const hasValue = searchInput.value.length > 0;
  searchClear.style.display = hasValue ? '' : 'none';
  searchHint.style.display = hasValue ? 'none' : '';
});

searchClear.addEventListener('click', function() {
  searchInput.value = '';
  searchClear.style.display = 'none';
  searchHint.style.display = '';
  searchInput.focus();
});

providerFilter.addEventListener('input', function() {
  displayProviders(activeCategory, providerFilter.value);
});

// Load data
loading.style.display = 'block';

fetch('urlgen.json')
  .then(r => r.json())
  .then(data => {
    providers = data;
    loading.style.display = 'none';

    const cats = new Set(providers.map(p => p.category));
    statProviders.textContent = providers.length;
    statCategories.textContent = cats.size;
    statsBar.style.display = '';

    populateCategoryFilter();
    displayProviders();
  })
  .catch(() => {
    loading.style.display = 'none';
    providerContainer.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem">failed to load providers.</p>';
  });

function populateCategoryFilter() {
  categoryFilter.innerHTML = '';

  // "all" chip
  const all = document.createElement('span');
  all.className = 'cat-chip active';
  all.textContent = 'all';
  all.style.backgroundColor = 'var(--bg-tertiary)';
  all.style.color = 'var(--text-secondary)';
  all.addEventListener('click', function() {
    activeCategory = '';
    displayProviders('', providerFilter.value);
    highlightActiveCategory();
  });
  categoryFilter.appendChild(all);

  for (const cat in categoryColors) {
    const c = categoryColors[cat];
    const chip = document.createElement('span');
    chip.className = 'cat-chip';
    chip.textContent = cat;
    chip.dataset.category = cat;
    chip.style.backgroundColor = c.bg;
    chip.style.color = c.text;
    chip.addEventListener('click', function() {
      activeCategory = activeCategory === cat ? '' : cat;
      displayProviders(activeCategory, providerFilter.value);
      highlightActiveCategory();
    });
    categoryFilter.appendChild(chip);
  }
}

function highlightActiveCategory() {
  document.querySelectorAll('#categoryFilter .cat-chip').forEach(chip => {
    const cat = chip.dataset.category || '';
    const isActive = (activeCategory === '' && cat === '') || cat === activeCategory;
    chip.classList.toggle('active', isActive);
  });
}

function displayProviders(category = '', filter = '') {
  providerContainer.innerHTML = '';

  const filtered = providers.filter(p =>
    (!category || p.category === category) &&
    (!filter || p.provider.toLowerCase().includes(filter.toLowerCase()))
  );

  // Update inline count
  if (providers.length > 0) {
    providerCount.textContent = filtered.length === providers.length
      ? ''
      : filtered.length + ' of ' + providers.length;
  }

  filtered.forEach((provider, i) => {
    const c = categoryColors[provider.category] || { bg: 'var(--bg-secondary)', border: 'var(--border)', text: 'var(--text-primary)' };
    const card = document.createElement('div');
    card.className = 'provider-card';
    const label = document.createElement('span');
    label.textContent = provider.provider;
    card.appendChild(label);
    card.title = provider.provider;
    card.style.backgroundColor = c.bg;
    card.style.borderColor = c.border;
    card.style.color = c.text;
    card.style.animationDelay = `${i * 0.02}s`;
    card.onclick = function() {
      const term = searchInput.value.trim();
      let url;
      if (term === '') {
        url = new URL(provider.searchstring).origin;
      } else if (provider.searchstring.includes('%b64')) {
        url = provider.searchstring.replace('%b64', btoa(term));
      } else {
        url = provider.searchstring.replaceAll('%s', encodeURIComponent(term));
      }
      window.open(url, '_blank');
    };
    providerContainer.appendChild(card);
  });
}
