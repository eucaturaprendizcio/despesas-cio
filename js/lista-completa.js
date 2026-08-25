const API = "https://script.google.com/macros/s/AKfycbxd63CJEZFzY1qxQY9Q302DSHwd_FAW4QIKeXQuxbL6YVutJHHzup-JXKhcnscpUooBIw/exec";

// Mapa: nome do tipo (como vem da planilha) -> { id, descricao, codigo, cor }
// Baseado na tabela de identificação (Id 001 a 011)
const MAPA_TAGS = {
  "combustível":                 { id: "001", descricao: "Combustível",                 codigo: "COMB", cor: "#E8792F" },
  "alimentação":                 { id: "002", descricao: "Alimentação",                 codigo: "ALIM", cor: "#4CAF50" },
  "pedágio":                     { id: "003", descricao: "Pedágio",                     codigo: "PEDG", cor: "#29B6F6" },
  "hospedagem":                  { id: "004", descricao: "Hospedagem",                  codigo: "HOSP", cor: "#1A3C6E" },
  "ferramentas e equipamentos":  { id: "005", descricao: "Ferramentas e Equipamentos",  codigo: "FRRE", cor: "#C9A227" },
  "mecânica":                    { id: "006", descricao: "Mecânica",                    codigo: "MECA", cor: "#00695C" },
  "fretamentos":                 { id: "007", descricao: "Fretamentos",                 codigo: "FRET", cor: "#7B4B94" },
  "pgto. de passagens":          { id: "008", descricao: "Pgto. de Passagens",          codigo: "PASS", cor: "#C62828" },
  "guincho":                     { id: "009", descricao: "Guincho",                     codigo: "GUIH", cor: "#757575" },
  "borracharia":                 { id: "010", descricao: "Borracharia",                 codigo: "BOCH", cor: "#6D4C33" },
  "outros":                      { id: "011", descricao: "Outros",                      codigo: "OUTR", cor: "#9E9E9E" }
};

function getTag(tipo) {
  const chave = (tipo || "").toString().trim().toLowerCase();
  return MAPA_TAGS[chave] || { codigo: (tipo || "—").toString().toUpperCase().slice(0, 4), cor: "#455A64" };
}

let todosDados = [];

async function inicializar() {
  const res = await fetch(API); // Puxa TUDO, sem filtro de tipo
  todosDados = await res.json();

  // Ordena por data decrescente (mais recente primeiro)
  todosDados.sort((a, b) => new Date(b.data) - new Date(a.data));

  renderizarLista(todosDados);
}

function renderizarLista(lista) {
  const corpoTabela = document.getElementById("corpoTabela");
  corpoTabela.innerHTML = "";

  let somaTotal = 0;

  lista.forEach(item => {
    const dataFormatada = item.data ? new Date(item.data).toLocaleDateString('pt-BR') : "—";
    const valorNumerico = parseFloat(item.valorNF) || 0;
    somaTotal += valorNumerico;

    const tag = getTag(item.tipo);

    corpoTabela.innerHTML += `
      <tr>
        <td>${dataFormatada}</td>
        <td><span class="tag-ceem-table">${item.ceemResponsavel || "—"}</span></td>
        <td><span class="tag-codigo" style="background-color: ${tag.cor};">${tag.codigo}</span></td>
        <td>${item.ocorrencia || "—"}</td>
        <td>${item.numeroNF || "—"}</td>
        <td>R$ ${valorNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td>
          ${item.linkNF ? `<a href="${item.linkNF}" target="_blank" class="btn-documento">Ver Doc</a>` : "—"}
        </td>
      </tr>
    `;
  });

  document.getElementById("totalItens").innerText = lista.length;
  document.getElementById("somaTotal").innerText = `R$ ${somaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

// ---------- BANNER DE TAGS ----------
function renderizarBannerTags() {
  const body = document.getElementById("tagsBannerBody");
  body.innerHTML = "";

  Object.values(MAPA_TAGS).forEach(tag => {
    body.innerHTML += `
      <div class="tags-banner-row">
        <span class="tags-banner-id">${tag.id}</span>
        <span class="tags-banner-desc">${tag.descricao}</span>
        <span class="tag-codigo" style="background-color: ${tag.cor};">${tag.codigo}</span>
      </div>
    `;
  });
}

function abrirTags() {
  renderizarBannerTags();
  document.getElementById("tagsOverlay").classList.add("show");
}

function fecharTags() {
  document.getElementById("tagsOverlay").classList.remove("show");
}

// Busca em tempo real (filtra em todosDados, não só no DOM)
document.getElementById("buscaLista").addEventListener("input", () => {
  const txt = document.getElementById("buscaLista").value.toLowerCase();

  const filtrados = todosDados.filter(item => {
    const tag = getTag(item.tipo);
    const textoBusca = `
      ${item.ceemResponsavel || ""} 
      ${tag.codigo} 
      ${item.tipo || ""} 
      ${item.ocorrencia || ""} 
      ${item.numeroNF || ""}
    `.toLowerCase();
    return textoBusca.includes(txt);
  });

  renderizarLista(filtrados);
});

function voltar() {
  window.location.href = "abaprc.html";
}

inicializar();