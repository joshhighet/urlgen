const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const providerContainer = document.getElementById('providerContainer');
const loading = document.getElementById('loading');
const providerFilter = document.getElementById('providerFilter');

let providers = [];
let activeCategory = '';

// Dark-appropriate category colors that work on #0d1117 backgrounds
const categoryColors = {
  "ip":       { bg: "rgba(30, 58, 138, 0.35)", border: "#1e3a8a", text: "#93c5fd" },
  "email":    { bg: "rgba(146, 64, 14, 0.35)",  border: "#92400e", text: "#fcd34d" },
  "bitcoin":  { bg: "rgba(6, 95, 70, 0.35)",    border: "#065f46", text: "#6ee7b7" },
  "ethereum": { bg: "rgba(55, 48, 163, 0.35)",  border: "#3730a3", text: "#a5b4fc" },
  "url":      { bg: "rgba(88, 28, 135, 0.35)",  border: "#581c87", text: "#c4b5fd" },
  "domain":   { bg: "rgba(134, 25, 143, 0.35)", border: "#86198f", text: "#f0abfc" },
  "string":   { bg: "rgba(107, 33, 168, 0.35)", border: "#6b21a8", text: "#d8b4fe" }
};

providerFilter.addEventListener('input', function() {
  displayProviders(activeCategory, providerFilter.value);
});


loading.style.display = 'block';

fetch('urlgen.json')
  .then(response => response.json())
  .then(data => {
    providers = data;
    loading.style.display = 'none';
    populateCategoryFilter();
    displayProviders();
  })
  .catch(() => {
    loading.style.display = 'none';
    providerContainer.innerHTML = '<p style="color:var(--text-secondary);padding:2rem">Failed to load providers.</p>';
  });

function populateCategoryFilter() {
  categoryFilter.innerHTML = '';

  for (const category in categoryColors) {
    const colors = categoryColors[category];
    const filterItem = document.createElement('div');
    filterItem.className = 'filter-item';
    filterItem.textContent = category;
    filterItem.style.backgroundColor = colors.bg;
    filterItem.style.borderColor = colors.border;
    filterItem.style.color = colors.text;
    filterItem.addEventListener('click', function() {
      if (activeCategory === category) {
        activeCategory = '';
        displayProviders('', providerFilter.value);
      } else {
        activeCategory = category;
        displayProviders(category, providerFilter.value);
      }
      highlightActiveCategory();
    });
    categoryFilter.appendChild(filterItem);
  }
}

function highlightActiveCategory() {
  const filterItems = document.querySelectorAll('#categoryFilter .filter-item');
  filterItems.forEach(item => {
    if (item.textContent === activeCategory) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function displayProviders(category = '', filter = '') {
  const providerCount = document.getElementById('providerCount');

  providerContainer.innerHTML = '';
  const filteredProviders = providers.filter(p =>
    (!category || p.category === category) &&
    (!filter || p.provider.toLowerCase().includes(filter.toLowerCase()))
  );

  if (providers.length > 0) {
    const totalCount = providers.length;
    const currentCount = filteredProviders.length;
    providerCount.textContent = currentCount === totalCount
      ? `${totalCount} providers`
      : `${currentCount} of ${totalCount} providers`;
  }

  filteredProviders.forEach((provider, index) => {
    const colors = categoryColors[provider.category] || { bg: 'var(--bg-secondary)', border: 'var(--border)', text: 'var(--text-primary)' };
    const card = document.createElement('div');
    card.className = 'provider-card';
    card.textContent = provider.provider;
    card.style.backgroundColor = colors.bg;
    card.style.borderColor = colors.border;
    card.style.color = colors.text;
    card.style.animationDelay = `${index * 0.02}s`;
    card.onclick = function() {
      const searchTerm = searchInput.value.trim();
      let searchUrl;

      if (searchTerm === '') {
        const url = new URL(provider.searchstring);
        searchUrl = url.origin;
      } else {
        if (provider.searchstring.includes('%b64')) {
          searchUrl = provider.searchstring.replace('%b64', btoa(searchTerm));
        } else {
          searchUrl = provider.searchstring.replaceAll('%s', encodeURIComponent(searchTerm));
        }
      }

      window.open(searchUrl, '_blank');
    };

    providerContainer.appendChild(card);
  });
}
