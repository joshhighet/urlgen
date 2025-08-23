const themeToggle = document.getElementById('themeToggle');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const providerContainer = document.getElementById('providerContainer');
const loading = document.getElementById('loading');
const providerFilter = document.getElementById('providerFilter');

let providers = [];
let activeCategory = '';
let categoryColors = {
  "ip": "#dbeafe",
  "email": "#fef3c7", 
  "bitcoin": "#d1fae5",
  "ethereum": "#e0e7ff",
  "url": "#ddd6fe",
  "domain": "#fce7f3",
  "string": "#f3e8ff"
};

let darkCategoryColors = {
  "ip": "#1e3a8a",
  "email": "#92400e", 
  "bitcoin": "#065f46",
  "ethereum": "#3730a3",
  "url": "#581c87",
  "domain": "#86198f",
  "string": "#6b21a8"
};

// Theme toggle functionality
themeToggle.addEventListener('click', function() {
  const body = document.body;
  const isDark = body.classList.contains('dark-theme');
  
  if (isDark) {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
    updateCategoryColors(categoryColors);
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
    updateCategoryColors(darkCategoryColors);
  }
});

// Load saved theme or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.classList.add(savedTheme + '-theme');
if (savedTheme === 'dark') {
  categoryColors = darkCategoryColors;
}

function updateCategoryColors(colors) {
  categoryColors = colors;
  populateCategoryFilter();
  displayProviders(activeCategory);
}

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
