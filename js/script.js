const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const clearBtn = document.getElementById("clear-btn");
const resultButtons = document.getElementById("result-buttons");
const mpfBtn = document.getElementById("mpf-btn");
const infolegBtn = document.getElementById("infoleg-btn");
const cijBtn = document.getElementById("cij-btn");
const boBtn = document.getElementById("bo-btn");
const historyDiv = document.getElementById("history");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const toggleModeBtn = document.getElementById("toggle-mode");
const messagesDiv = document.getElementById("messages");
const autocompleteList = document.getElementById("autocomplete-list");
const categoryFilter = document.getElementById("category-filter");

let isDarkMode = false;
let laws = [];

// ✅ Load laws.json (ahora async y seguro)
async function loadLaws() {
  try {
    const response = await fetch("js/laws.json");
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    laws = data;

    populateCategories(data);

    console.log("✅ laws.json cargado:", laws);
  } catch (error) {
    console.error("❌ No se pudo cargar laws.json:", error);
    showMessage("error", "Error al cargar la base de datos de leyes.");
  }
}

// ✅ Populate category filter
function populateCategories(data) {
  data.forEach(section => {
    const option = document.createElement("option");
    option.value = section.category;
    option.textContent = section.category;
    categoryFilter.appendChild(option);
  });
}

// ✅ Dark mode toggle
toggleModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  isDarkMode = !isDarkMode;
  toggleModeBtn.textContent = isDarkMode ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
});

// ✅ Search click
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim().toUpperCase();
  const category = categoryFilter.value;

  messagesDiv.innerHTML = "";
  resultButtons.classList.remove("show");

  if (query === "") {
    showMessage("error", "Por favor ingresá una palabra clave.");
    return;
  }

  let matched = false;

  laws.forEach(section => {
    if (category === "Todas" || category === section.category) {
      section.items.forEach(item => {
        if (item.name.toUpperCase().includes(query)) {
          matched = true;
        }
      });
    }
  });

  if (matched) {
    showMessage("success", "Búsqueda generada con éxito.");
    resultButtons.classList.add("show");
    saveToHistory(query);
  } else {
    showMessage("error", "No se encontraron resultados para tu búsqueda.");
  }
});

// ✅ Clear input
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  resultButtons.classList.remove("show");
  messagesDiv.innerHTML = "";
  autocompleteList.classList.add("hidden");
});

// ✅ Result buttons search
const openSearch = (url) => {
  const query = encodeURIComponent(searchInput.value.trim());
  if (query) window.open(url + query, "_blank");
};

mpfBtn.addEventListener("click", () => openSearch("https://www.mpf.gob.ar/?s="));
infolegBtn.addEventListener("click", () => openSearch("https://www.infoleg.gob.ar/?s="));
cijBtn.addEventListener("click", () => openSearch("https://www.cij.gov.ar/buscador.html?texto_buscar="));
boBtn.addEventListener("click", () => openSearch("https://www.boletinoficial.gob.ar/busqueda/avanzada?q="));

// ✅ History management
function saveToHistory(query) {
  let history = JSON.parse(localStorage.getItem("history")) || {};
  history[query] = (history[query] || 0) + 1;
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("history")) || {};
  const sorted = Object.entries(history).sort((a, b) => b[1] - a[1]);

  historyDiv.innerHTML = "";
  sorted.forEach(([item]) => {
    const div = document.createElement("div");
    div.textContent = item;
    div.classList.add("history-item");
    div.addEventListener("click", () => {
      searchInput.value = item;
      searchBtn.click();
    });
    historyDiv.appendChild(div);
  });
}

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("history");
  renderHistory();
});

// ✅ Show messages
function showMessage(type, text) {
  const div = document.createElement("div");
  div.className = type === "success" ? "success-message" : "error-message";
  div.textContent = text;
  messagesDiv.appendChild(div);

  div.offsetHeight;
  div.classList.add("show");

  setTimeout(() => {
    div.classList.remove("show");
  }, 4000);
}

// ✅ Autocomplete logic
searchInput.addEventListener("input", () => {
  const val = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  autocompleteList.innerHTML = "";

  if (!val || laws.length === 0) {
    autocompleteList.classList.add("hidden");
    return;
  }

  let hasResults = false;

  laws.forEach(section => {
    if (category === "Todas" || category === section.category) {
      const matchedItems = section.items.filter(item =>
        item.name.toLowerCase().includes(val)
      );

      if (matchedItems.length > 0) {
        const catItem = document.createElement("li");
        catItem.textContent = section.category;
        catItem.classList.add("category");
        autocompleteList.appendChild(catItem);

        matchedItems.forEach(item => {
          const li = document.createElement("li");
          li.textContent = item.name;
          li.addEventListener("click", () => {
            searchInput.value = item.name;
            autocompleteList.classList.add("hidden");
          });
          autocompleteList.appendChild(li);
        });

        hasResults = true;
      }
    }
  });

  if (hasResults) {
    autocompleteList.classList.remove("hidden");
    const rect = searchInput.getBoundingClientRect();
    autocompleteList.style.top = `${rect.bottom + window.scrollY}px`;
    autocompleteList.style.left = `${rect.left + window.scrollX}px`;
  } else {
    autocompleteList.classList.add("hidden");
  }
});

// ✅ Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadLaws();
  renderHistory();
  resultButtons.classList.remove("show");
});