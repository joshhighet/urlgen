const themeToggle = document.getElementById('themeToggle');
const helpToggle = document.getElementById('helpToggle');
const helpTooltip = document.getElementById('helpTooltip');
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

// Help tooltip toggle
helpToggle.addEventListener('click', function(e) {
  e.stopPropagation();
  helpTooltip.classList.toggle('hidden');
});

// Close tooltip when clicking outside
document.addEventListener('click', function() {
  if (!helpTooltip.classList.contains('hidden')) {
    helpTooltip.classList.add('hidden');
  }
});

// Check system preference
function getSystemPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply theme based on preference or saved override
function applyTheme(theme) {
  const body = document.body;
  body.classList.remove('light-theme', 'dark-theme');
  body.classList.add(theme + '-theme');
  
  if (theme === 'dark') {
    updateCategoryColors(darkCategoryColors);
  } else {
    updateCategoryColors(categoryColors);
  }
}

// Theme toggle functionality
themeToggle.addEventListener('click', function() {
  const body = document.body;
  const isDark = body.classList.contains('dark-theme');
  
  if (isDark) {
    localStorage.setItem('theme', 'light');
    applyTheme('light');
  } else {
    localStorage.setItem('theme', 'dark');
    applyTheme('dark');
  }
});

// Determine initial theme
const savedTheme = localStorage.getItem('theme');
const initialTheme = savedTheme || getSystemPreference();

// Apply initial theme
applyTheme(initialTheme);

// Listen for system theme changes (only if user hasn't manually set preference)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    const newTheme = e.matches ? 'dark' : 'light';
    applyTheme(newTheme);
    setTimeout(() => {
      highlightActiveCategory();
    }, 10);
  }
});

function updateCategoryColors(colors) {
  categoryColors = colors;
  populateCategoryFilter();
  displayProviders(activeCategory, providerFilter.value);
}

providerFilter.addEventListener('input', function() {
  const filter = providerFilter.value;
  displayProviders(activeCategory, filter);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Focus search input with '/'
  if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    searchInput.focus();
    return;
  }
  
  // Focus provider filter with Ctrl+F
  if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    providerFilter.focus();
    return;
  }
  
  // Clear filters with Backspace (when not in input)
  if (e.key === 'Backspace' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    // Clear all filters
    activeCategory = '';
    providerFilter.value = '';
    displayProviders('');
    highlightActiveCategory();
    return;
  }
  
  // Number keys 1-7 to select categories
  if (e.key >= '1' && e.key <= '7' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
    const categories = Object.keys(categoryColors);
    const categoryIndex = parseInt(e.key) - 1;
    if (categoryIndex < categories.length) {
      activeCategory = categories[categoryIndex];
      displayProviders(activeCategory, providerFilter.value);
      highlightActiveCategory();
    }
    return;
  }
  
  // Press '0' to show all
  if (e.key === '0' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
    activeCategory = '';
    displayProviders('', providerFilter.value);
    highlightActiveCategory();
    return;
  }
});

fetch('urlgen.json')
  .then(response => response.json())
  .then(data => {
    providers = data;
    loading.style.display = 'none';
    populateCategoryFilter();
    displayProviders();
  });

function populateCategoryFilter() {
  // Clear existing filters
  categoryFilter.innerHTML = '';
  
  // Add category filters
  for (const category in categoryColors) {
    const filterItem = document.createElement('div');
    filterItem.className = 'filter-item';
    filterItem.textContent = category;
    filterItem.style.backgroundColor = categoryColors[category];
    filterItem.addEventListener('click', function() {
      if (activeCategory === category) {
        // If clicking the active category, clear it
        activeCategory = '';
        displayProviders('', providerFilter.value);
      } else {
        // Set new active category
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
  const filteredProviders = providers.filter(p => (!category || p.category === category) && (!filter || p.provider.toLowerCase().includes(filter.toLowerCase())));
  
  // Update count
  if (providers.length > 0) {
    const totalCount = providers.length;
    const currentCount = filteredProviders.length;
    providerCount.textContent = currentCount === totalCount 
      ? `${totalCount} providers` 
      : `${currentCount} of ${totalCount} providers`;
  }
  
  filteredProviders.forEach((provider, index) => {
    const card = document.createElement('div');
    card.className = 'provider-card';
    card.textContent = provider.provider;
    card.style.backgroundColor = categoryColors[provider.category];
    card.style.animationDelay = `${index * 0.02}s`;
    card.onclick = function() {
      const searchTerm = searchInput.value.trim();
      let searchUrl;
      
      if (searchTerm === '') {
        // Extract just the root domain
        const url = new URL(provider.searchstring);
        searchUrl = url.origin;
      } else {
        if (provider.searchstring.includes('%b64')) {
          searchUrl = provider.searchstring.replace('%b64', btoa(searchTerm));
        } else {
          searchUrl = provider.searchstring.replace('%s', encodeURIComponent(searchTerm));
        }
      }
      
      window.open(searchUrl, '_blank');
    };
    
    providerContainer.appendChild(card);
  });
}
