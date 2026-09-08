// =====================================================
// LANÇAMENTO - página exclusiva para o usuário LANCAMENTO
// =====================================================

const CSV_CNPJ_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRMyFuaFKl2R0-OFChuvVRoEB04Z9ctGrAno08bsIxOFRFPPd9M_zBz3IQ4FQMbZv_gXdt-I-IsscZu/pub?gid=0&single=true&output=csv";

// Mapa: nome de exibição -> { imagem, cidades correspondentes na planilha }
const UNIDADES_CEEM = [
  { nome: "Ceem Porto Velho", img: "https://github.com/user-attachments/assets/89d07b12-60df-4984-a6be-d4382f229213", cidades: ["PORTO VELHO"] },
  { nome: "Ceem Vilhena", img: "https://github.com/user-attachments/assets/ec5d8ae2-cce1-4a3a-867c-4e5630579b94", cidades: ["VILHENA"] },
  { nome: "Ceem Ji-Paraná", img: "https://github.com/user-attachments/assets/419a0160-a303-4a86-a510-5e3ff36570f0", cidades: ["JI-PARANA", "JI PARANA"] },
  { nome: "Ceem Cacoal", img: "https://github.com/user-attachments/assets/0405b37b-a6ad-4f60-8dea-6b0e43645732", cidades: ["CACOAL"] },
  { nome: "Ceem Porto Alegre", img: "https://github.com/user-attachments/assets/083ba2c3-f2d9-445e-b0ba-adca26fb560a", cidades: ["PORTO ALEGRE"] },
  { nome: "Ceem Mato Grosso", img: "https://github.com/user-attachments/assets/b5d5c104-f1b5-4b3f-9dc3-76641b2f2cef", cidades: ["CUIABA"] },
  { nome: "Ceem São Paulo", img: "https://github.com/user-attachments/assets/bdd85974-af3f-471b-a584-0e603de4a228", cidades: ["SAO PAULO"] },
  { nome: "Ceem P. Prudente", img: "https://github.com/user-attachments/assets/cc5dcc41-af91-4ef9-bcc0-ba64003c8b66", cidades: ["PRESIDENTE PRUDENTE"] },
  { nome: "Ceem Campo Grande", img: "https://github.com/user-attachments/assets/5a3b9da8-868a-4f21-a0c0-eaabd6dc2d55", cidades: ["CAMPO GRANDE"] },
  { nome: "Ceem Cascavel", img: "https://github.com/user-attachments/assets/38a680b5-893b-4fad-a13b-36587cdfe7ec", cidades: ["CASCAVEL"] },
  { nome: "Ceem Rio Branco", img: "https://github.com/user-attachments/assets/442f633b-1c67-44e6-a4cb-65787a33e07c", cidades: ["RIO BRANCO"] },
  { nome: "Ceem Goiânia", img: "https://github.com/user-attachments/assets/06e53d10-506e-48d0-bf9b-53d00569c312", cidades: ["GOIANIA"] },
  { nome: "Ceem Curitiba", img: "https://github.com/user-attachments/assets/60455a1f-8922-4522-8224-6a66034ea934", cidades: ["CURITIBA"] }
];

let dadosCnpj = [];

// -----------------------------------------------------
// Utilidades
// -----------------------------------------------------
function normalizar(texto) {
  return (texto || "")
    .toString()
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Parser simples de CSV (lida com campos entre aspas)
function parseCSV(texto) {
  const linhas = texto.replace(/\r/g, "").split("\n").filter(l => l.trim() !== "");
  if (linhas.length === 0) return [];

  const cabecalho = dividirLinhaCSV(linhas[0]);
  const registros = [];

  for (let i = 1; i < linhas.length; i++) {
    const campos = dividirLinhaCSV(linhas[i]);
    const registro = {};
    cabecalho.forEach((chave, idx) => {
      registro[chave.trim()] = (campos[idx] || "").trim();
    });
    registros.push(registro);
  }
  return registros;
}

function dividirLinhaCSV(linha) {
  const resultado = [];
  let atual = "";
  let dentroAspas = false;

  for (let i = 0; i < linha.length; i++) {
    const char = linha[i];
    if (char === '"') {
      dentroAspas = !dentroAspas;
    } else if (char === ',' && !dentroAspas) {
      resultado.push(atual);
      atual = "";
    } else {
      atual += char;
    }
  }
  resultado.push(atual);
  return resultado;
}

// -----------------------------------------------------
// Carregamento dos dados de CNPJ
// -----------------------------------------------------
async function carregarCnpj() {
  try {
    const res = await fetch(CSV_CNPJ_URL, { cache: "no-store" });
    const texto = await res.text();
    dadosCnpj = parseCSV(texto);
  } catch (erro) {
    console.error("Erro ao carregar planilha de CNPJ:", erro);
    dadosCnpj = [];
  }
}

function buscarRegistrosPorUnidade(unidade) {
  const cidadesAlvo = unidade.cidades.map(normalizar);
  return dadosCnpj.filter(registro => cidadesAlvo.includes(normalizar(registro["CIDADE"])));
}

// -----------------------------------------------------
// Renderização do banner de bandeirinhas
// -----------------------------------------------------
function renderizarBandeiras() {
  const grid = document.getElementById("bandeiraGrid");
  grid.innerHTML = "";

  UNIDADES_CEEM.forEach(unidade => {
    const item = document.createElement("div");
    item.className = "bandeira";
    item.innerHTML = `
      <img src="${unidade.img}" alt="${unidade.nome}" loading="lazy">
      <div class="bandeira-nome">${unidade.nome}</div>
    `;
    item.addEventListener("click", () => abrirDetalheUnidade(unidade));
    grid.appendChild(item);
  });
}

function abrirDetalheUnidade(unidade) {
  const registros = buscarRegistrosPorUnidade(unidade);
  document.getElementById("detalheTitulo").innerText = unidade.nome;

  const container = document.getElementById("detalheConteudo");

  if (registros.length === 0) {
    container.innerHTML = `<div class="detalhe-vazio">Nenhum CNPJ cadastrado para esta unidade até o momento.</div>`;
  } else {
    container.innerHTML = registros.map(reg => `
      <div class="detalhe-item">
        <div class="detalhe-linha"><span>Razão Social</span><span>${reg["NOME / RAZÃO SOCIAL"] || "-"}</span></div>
        <div class="detalhe-linha"><span>CNPJ</span><span>${reg["CNPJ"] || "-"}</span></div>
        <div class="detalhe-linha"><span>Inscrição Estadual</span><span>${reg["INSCRIÇÃO ESTADUAL"] || "-"}</span></div>
        <div class="detalhe-linha"><span>Cidade</span><span>${reg["CIDADE"] || "-"}</span></div>
        <div class="detalhe-linha"><span>Estado</span><span>${reg["ESTADO"] || "-"}</span></div>
        <div class="detalhe-linha"><span>Observação</span><span>${reg["OBSERVAÇÃO"] || "-"}</span></div>
      </div>
    `).join("");
  }

  abrirModal("modalDetalhe");
}

// -----------------------------------------------------
// Controle de modais
// -----------------------------------------------------
function abrirModal(id) {
  document.getElementById(id).classList.add("aberto");
}

function fecharModal(id) {
  document.getElementById(id).classList.remove("aberto");
}

document.querySelectorAll("[data-fechar]").forEach(botao => {
  botao.addEventListener("click", () => fecharModal(botao.dataset.fechar));
});

document.querySelectorAll(".modal-overlay").forEach(overlay => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) fecharModal(overlay.id);
  });
});

// Botão: Lançamento de Nota Fiscal -> agora é um link normal (target="_blank"),
// não precisa de JS para abrir.

// Botão: Verificar CNPJ
document.getElementById("btnCnpj").addEventListener("click", async () => {
  abrirModal("modalCnpj");
  if (dadosCnpj.length === 0) {
    await carregarCnpj();
  }
  renderizarBandeiras();
});

// -----------------------------------------------------
// Sair (único jeito de deixar a página)
// -----------------------------------------------------
document.getElementById("btnSair").addEventListener("click", () => {
  localStorage.removeItem("logado");
  window.location.href = "index.html";
});

// -----------------------------------------------------
// Trava de navegação: usuário LANCAMENTO não sai por aqui
// (impede voltar para o login/dashboard pelo botão "voltar" do navegador)
// -----------------------------------------------------
history.pushState(null, "", window.location.href);
window.addEventListener("popstate", () => {
  history.pushState(null, "", window.location.href);
});