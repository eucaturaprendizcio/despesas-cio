const API = "https://script.google.com/macros/s/AKfycbxqZ-T43eqzijcVYaOTDjXGQAWIVSwLaKVruhOnYyVSXKr7XFRE0qG2O5x5C2ZVhHpdLA/exec";

/* SIDEBAR */
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
  document.body.classList.toggle("sidebar-open");
}

/* CATEGORIAS */
async function carregarCategorias() {
  const res = await fetch(API + "?tipo=categorias");
  const categorias = await res.json();
  const container = document.getElementById("categorias");

  container.innerHTML = "";

  categorias.forEach(cat => {
    container.innerHTML += `
      <div class="card" onclick="abrirCategoria('${cat}')">
        <img src="img/${cat}.png" alt="${cat}">
        <h3>${cat}</h3>
        <span class="tag">Ver despesas</span>
      </div>
    `;
  });
}

function abrirCategoria(tipo) {
  window.location.href = `categoria.html?tipo=${tipo}`;
}

carregarCategorias();

/* PESQUISA */
document.getElementById("search").addEventListener("input", () => {
  const txt = document.getElementById("search").value.toLowerCase();
  document.querySelectorAll(".card").forEach(c => {
    c.style.display = c.innerText.toLowerCase().includes(txt) ? "block" : "none";
  });
});


/* DASHBOARD */
function dashboard() {
  window.location.href = "dashboard.html";
}

function filtroDespesas() {
  window.location.href = "filtro.html";
}

// --- FUNÇÕES DO BANNER DE ATUALIZAÇÕES ---

const BANNER_VIEWED_KEY = 'updateBannerViewed'; // Chave para armazenar no localStorage

function showUpdateBanner() {
  const banner = document.getElementById('updateBanner');
  // Se o usuário ainda não viu (ou a chave não existe)
  if (!localStorage.getItem(BANNER_VIEWED_KEY)) {
    banner.classList.add('show');
  }
}

function closeUpdateBanner() {
  const banner = document.getElementById('updateBanner');
  banner.classList.remove('show');
  localStorage.setItem(BANNER_VIEWED_KEY, 'true'); // Marca como visto
}

// Chame esta função quando a página for totalmente carregada
document.addEventListener('DOMContentLoaded', showUpdateBanner);
