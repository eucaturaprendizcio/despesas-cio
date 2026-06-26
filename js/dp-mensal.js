const API = "https://script.google.com/macros/s/AKfycbxd63CJEZFzY1qxQY9Q302DSHwd_FAW4QIKeXQuxbL6YVutJHHzup-JXKhcnscpUooBIw/exec";
let todosDados = [];

// Versão para quando os arquivos de imagem TÊM acento e espaços na pasta
function tratarNomeFoto(nomeCategoria) {
  if (!nomeCategoria) return 'default';
  
  // Limpa apenas espaços inúteis no começo/fim e codifica para formato de URL válida
  return encodeURIComponent(nomeCategoria.trim());
}

// Inicializa o carregamento dos dados da API
async function inicializarDashboard() {
  try {
    const res = await fetch(API);
    todosDados = await res.json();

    // Define o mês e ano corrente no seletor HTML (Formato YYYY-MM)
    const hoje = new Date();
    const mesAtual = hoje.toISOString().substring(0, 7);
    document.getElementById("filtroMes").value = mesAtual;

    renderizarPainelMensal();
  } catch (error) {
    console.error("Erro ao conectar com a API de despesas:", error);
  }
}

// Filtra os dados e gera o total mensal acumulado por despesa
function renderizarPainelMensal() {
  const mesSelecionado = document.getElementById("filtroMes").value;
  const gridDespesas = document.getElementById("gridDespesas");
  gridDespesas.innerHTML = ""; // Reseta o container antes do novo loop

  let totalGeralDoMes = 0;

  // 1. Filtra registros que batem com o ano e mês do input
  const dadosFiltrados = todosDados.filter(item => {
    if (!item.data) return false;
    const dataItem = new Date(item.data);
    const anoMesItem = dataItem.toISOString().substring(0, 7);
    return anoMesItem === mesSelecionado;
  });

  // 2. Agrupa e calcula as somas de forma única por Tipo de Despesa
  const despesasAgrupadas = {};

  dadosFiltrados.forEach(item => {
    const tipo = item.tipo || "Outros";
    const valorNumerico = parseFloat(item.valorNF) || 0;

    totalGeralDoMes += valorNumerico;

    if (!despesasAgrupadas[tipo]) {
      despesasAgrupadas[tipo] = {
        somaTotal: 0,
        qtdDocumentos: 0
      };
    }
    despesasAgrupadas[tipo].somaTotal += valorNumerico;
    despesasAgrupadas[tipo].qtdDocumentos += 1;
  });

  // 3. Monta dinamicamente a estrutura dos cards na tela
  const listaCategorias = Object.keys(despesasAgrupadas);

  listaCategorias.forEach(categoria => {
    const informacoes = despesasAgrupadas[categoria];
    const nomeFotoTratada = tratarNomeFoto(categoria);

    // Força o caminho a subir um nível para achar a pasta img corretamente
    const pathFoto = `./img/${nomeFotoTratada}.png`;

    gridDespesas.innerHTML += `
      <div class="expense-card">
        <div class="card-thumb">
          <img src="${pathFoto}" alt="${categoria}" onerror="this.onerror=null; this.src='../img/default.png';">
        </div>
        <div class="card-details">
          <span class="card-tag">Despesa Mensal</span>
          <h3 class="card-name">${categoria}</h3>
          
          <div class="card-financials">
            <span class="financial-label">Total Gasto</span>
            <span class="financial-amount">R$ ${informacoes.somaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="card-summary-footer">
            ${informacoes.qtdDocumentos} nota(s) processada(s)
          </div>
        </div>
      </div>
    `;
  });

  // Atualiza os seletores de KPI do Topo da Página
  document.getElementById("kpiCategorias").innerText = listaCategorias.length;
  document.getElementById("kpiTotalGeral").innerText = `R$ ${totalGeralDoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

// Eventos ouvintes da página
document.getElementById("filtroMes").addEventListener("change", renderizarPainelMensal);
document.getElementById("btnVoltar").addEventListener("click", () => {
  window.location.href = "abaprc.html";
});

// Start
inicializarDashboard();