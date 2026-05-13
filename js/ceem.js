const API = "https://script.google.com/macros/s/AKfycbxd63CJEZFzY1qxQY9Q302DSHwd_FAW4QIKeXQuxbL6YVutJHHzup-JXKhcnscpUooBIw/exec";
let todosDados = [];

// 1. Inicializa a aplicação
async function inicializar() {
    try {
        const res = await fetch(API);
        todosDados = await res.json();
        
        // Define o ano atual dinamicamente (2026)
        const anoAtual = new Date().getFullYear();
        document.getElementById("labelAno").innerText = `Exercício: ${anoAtual}`;
        
        processarDados(anoAtual);
    } catch (error) {
        console.error("Erro ao carregar dados da API:", error);
    }
}

// 2. Processa, Ordena e Renderiza os Cards
function processarDados(anoAlvo) {
    const grid = document.getElementById("gridCards");
    grid.innerHTML = "";

    // Filtrar apenas dados do ano atual
    const dadosAno = todosDados.filter(item => {
        if (!item.data) return false;
        const dataItem = new Date(item.data);
        return dataItem.getFullYear() === anoAlvo;
    });

    // Agrupar por CEEM
    const agrupado = {};
    let somaGeral = 0;

    dadosAno.forEach(item => {
        const nomeCeem = item.ceemResponsavel || "Não Definido";
        const valor = parseFloat(item.valorNF) || 0;
        const data = new Date(item.data);
        const nomeMes = data.toLocaleString('pt-BR', { month: 'long' });

        if (!agrupado[nomeCeem]) {
            agrupado[nomeCeem] = { 
                nome: nomeCeem, 
                total: 0, 
                meses: {} 
            };
        }

        agrupado[nomeCeem].total += valor;
        // Soma por mês dentro do CEEM
        agrupado[nomeCeem].meses[nomeMes] = (agrupado[nomeCeem].meses[nomeMes] || 0) + valor;
        somaGeral += valor;
    });

    // --- ORDENAÇÃO: DO MAIOR PARA O MENOR ---
    const listaOrdenada = Object.values(agrupado).sort((a, b) => b.total - a.total);

    // 3. Gerar o HTML dos Cards
    listaOrdenada.forEach(info => {
        let mesesHtml = "";

        // Gerar linhas dos meses
        for (const mes in info.meses) {
            mesesHtml += `
                <div class="mes-linha">
                    <span>${mes.charAt(0).toUpperCase() + mes.slice(1)}</span>
                    <span>R$ ${info.meses[mes].toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
            `;
        }

        grid.innerHTML += `
            <div class="card">
                <h3>${info.nome}</h3>
                <span class="valor">R$ ${info.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                <div class="card-detalhes">
                    <strong>Detalhamento Mensal:</strong>
                    ${mesesHtml}
                </div>
            </div>
        `;
    });

    // Atualiza o resumo no topo
    document.getElementById("somaTotal").innerText = `R$ ${somaGeral.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

// Função para o botão voltar
function voltar() {
    window.location.href = "index.html";
}

// Inicia tudo
inicializar();