const API = "https://script.google.com/macros/s/AKfycbxd63CJEZFzY1qxQY9Q302DSHwd_FAW4QIKeXQuxbL6YVutJHHzup-JXKhcnscpUooBIw/exec";
const APIPROTHEUS = "https://script.google.com/macros/s/AKfycbydxxHLNSRXa7ypePzlM6OEOuANWOs6A0P0cN5wXQM1H9pYXZt21OCXm8Aj-Q1AnTd8Kw/exec"; // <-- Nova API aqui

const params = new URLSearchParams(window.location.search);
const tipo = params.get("tipo");

document.getElementById("tituloCategoria").innerText = tipo;
// Define a imagem de fundo do banner puxando a imagem correspondente da pasta img
const bannerElement = document.getElementById("categoryBanner");
if (bannerElement && tipo) {
  bannerElement.style.backgroundImage = `url('img/${tipo}.png')`;
}

async function carregarSolicitacoes() {
  try {
    // Chamas as duas APIs ao mesmo tempo de forma assíncrona
    const [resDados, resProtheus] = await Promise.all([
      fetch(API + "?tipo=" + tipo),
      fetch(APIPROTHEUS)
    ]);

    const dados = await resDados.json();
    const dadosProtheus = await resProtheus.json(); // Recebe o array de ocorrências marcadas

    const lista = document.getElementById("lista");
    lista.innerHTML = ""; // Limpa antes de renderizar

    if (!dados || dados.length === 0) {
      document.getElementById("marqueeRegistros").innerText = "Nenhum registro encontrado para esta categoria.";
      return;
    }

    let totalValorAnual = 0;

    // Ordena os dados por data decrescente (o primeiro do array será o mais recente)
    const dadosOrdenados = [...dados].sort((a, b) => new Date(b.data) - new Date(a.data));

    dados.forEach(item => {
      const dataFormatada = item.data ? new Date(item.data).toLocaleDateString('pt-BR') : "—";

      // Soma o valor para o bloco anual (garantindo que seja tratado como número)
      const valorNumerico = parseFloat(item.valorNF) || 0;
      totalValorAnual += valorNumerico;

      // Verifica se a ocorrência desse card específico está dentro do array da API do Protheus
      const estaLancadoNoProtheus = dadosProtheus.includes(String(item.ocorrencia));

      lista.innerHTML += `
        <div class="card ${estaLancadoNoProtheus ? 'com-tag-protheus' : ''}">
    ${estaLancadoNoProtheus ? `
      <div class="tag-protheus-topo">
        NOTA FISCAL LANÇADA NO PROTHEUS
      </div>
    ` : ""}

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <span class="tag-ceem">${item.ceemResponsavel || "Sem CEEM"}</span>
        <span class="card-date-badge">${dataFormatada}</span>
    </div>

    <h2 class="card-titulo">Ocorrência ${item.ocorrencia}</h2>
    <p class="card-info"><b>Número NF:</b> ${item.numeroNF || "—"}</p>
    <p class="card-info"><b>Valor:</b> R$ ${valorNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    
    <div class="card-actions">
      ${item.linkNF ? `<a href="${item.linkNF}" target="_blank" class="btn-documento">Ver Documento</a>` : ""}
      ${item.ocorrencia ? `<a href="https://fluig.consultoriaan.com:8443/portal/p/0700001/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=${item.ocorrencia}" target="_blank" class="btn-ocorrencia">Ver Ocorrência</a>` : ""}
    </div>
  </div>
`;
    });

    // Atualiza os blocos informativos da Header com base no registro mais recente
    const maisRecente = dadosOrdenados[0];
    const dataRecenteFormatada = maisRecente.data ? new Date(maisRecente.data).toLocaleDateString('pt-BR') : "—";
    const valorRecenteNumerico = parseFloat(maisRecente.valorNF) || 0;

    document.getElementById("valorAnual").innerText = totalValorAnual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById("ultimaCeem").innerText = maisRecente.ceemResponsavel || "—";

    // Alimenta a Marquee com a estrutura solicitada do último registro
    document.getElementById("marqueeRegistros").innerHTML = `
      <span class="marquee-item">
        Último Registro: 
        <span class="marquee-highlight">${maisRecente.ceemResponsavel || "Sem CEEM"}</span> | 
        ${dataRecenteFormatada} | 
        Ocorrência: ${maisRecente.ocorrencia} | 
        NF: ${maisRecente.numeroNF || "—"} | 
        <span class="marquee-highlight">R$ ${valorRecenteNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </span>
    `;

  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    document.getElementById("marqueeRegistros").innerText = "Erro ao carregar registros das APIs.";
  }
}

carregarSolicitacoes();

document.getElementById("search").addEventListener("input", () => {
  const txt = document.getElementById("search").value.toLowerCase();
  const cards = document.querySelectorAll(".card");

  cards.forEach(c => {
    c.style.display = c.innerText.toLowerCase().includes(txt) ? "block" : "none";
  });
});

function voltar() {
  window.location.href = "abaprc.html";
}