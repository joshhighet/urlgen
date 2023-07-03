const themeToggle = document.getElementById('themeToggle');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const providerContainer = document.getElementById('providerContainer');
const loading = document.getElementById('loading');
const providerFilter = document.getElementById('providerFilter');

let providers = [];
let activeCategory = '';
let categoryColors = {
  "ip": "#ffd1dc",
  "email": "#ffd6a5",
  "bitcoin": "#caffbf",
  "ethereum": "#bdb2ff",
  "url": "#a0c4ff",
  "domain": "#ffadad",
  "string": "#ffc6ff"
};

providerFilter.addEventListener('input', function() {
  const filter = providerFilter.value;
  displayProviders(activeCategory, filter);
});

fetch('https://raw.githubusercontent.com/joshhighet/urlgen/main/docs/urlgen.json')
  .then(response => response.json())
  .then(data => {
    providers = data;
    loading.style.display = 'none';
    populateCategoryFilter();
    displayProviders();
  });

function populateCategoryFilter() {
  for (const category in categoryColors) {
    const filterItem = document.createElement('div');
    filterItem.className = 'filter-item';
    filterItem.textContent = category;
    filterItem.style.backgroundColor = categoryColors[category];
    filterItem.addEventListener('click', function() {
      activeCategory = category;
      displayProviders(category);
      highlightActiveCategory();
    });
    categoryFilter.appendChild(filterItem);
  }
}

function highlightActiveCategory() {
  const filterItems = document.querySelectorAll('.filter-item');
  filterItems.forEach(item => {
    if (item.textContent === activeCategory) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function displayProviders(category = '', filter = '') {
  providerContainer.innerHTML = '';
  const filteredProviders = providers.filter(p => (!category || p.category === category) && (!filter || p.provider.toLowerCase().includes(filter.toLowerCase())));
  for (const provider of filteredProviders) {
    const card = document.createElement('div');
    card.className = 'provider-card';
    card.textContent = provider.provider;
    card.style.backgroundColor = categoryColors[provider.category];
    card.onclick = function() {
      const searchTerm = encodeURIComponent(searchInput.value);
      const searchUrl = provider.searchstring.replace('%s', searchTerm);
      window.open(searchUrl, '_blank');
    };
    
    providerContainer.appendChild(card);
  }
}
