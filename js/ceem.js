const API = "https://script.google.com/macros/s/AKfycbxd63CJEZFzY1qxQY9Q302DSHwd_FAW4QIKeXQuxbL6YVutJHHzup-JXKhcnscpUooBIw/exec";
let todosDados = [];

// Inicialização
async function inicializar() {
    try {
        const res = await fetch(API);
        todosDados = await res.json();
        
        // Define o ano atual dinamicamente
        const anoAtual = new Date().getFullYear();
        document.getElementById("labelAno").innerText = `Exercício: ${anoAtual}`;
        
        processarDados(anoAtual);
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

// Função para tratar o nome do CEEM e encontrar a imagem na pasta img-band
function gerarCaminhoImagem(nomeCeem) {
    // 1. LIMPEZA INICIAL: Remove a palavra "CEEM" e espaços extras para comparar
    let nomeBase = nomeCeem.replace(/CEEM/i, "").trim();

    // 2. MAPEAMENTO DE EXCEÇÕES: Forçamos o caminho exato para nomes difíceis
    const excecoes = {
        "P. Prudente": "p-prudente",
        "Jí-Paraná": "ji-parana",
        "Goiânia": "goiania"
    };

    // Se o nome (sem a palavra CEEM) for uma exceção, usa o valor do mapa
    if (excecoes[nomeBase]) {
        return `img-band/${excecoes[nomeBase]}.png`;
    }

    // 3. REGRA GERAL (para os outros nomes):
    let nomeLimpo = nomeBase.toLowerCase()
        .normalize("NFD")               // Remove acentos
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/[.\-]/g, "")          // Remove pontos ou hifens soltos
        .replace(/\s+/g, '-')           // Troca espaços por um único hífen
        .replace(/-+/g, '-');           // Evita hifens duplos (-- )

    return `img-band/${nomeLimpo}.png`;
}

function processarDados(anoAlvo) {
    const grid = document.getElementById("gridCards");
    grid.innerHTML = "";

    // 1. Filtrar dados do ano atual
    const dadosAno = todosDados.filter(item => {
        if (!item.data) return false;
        return new Date(item.data).getFullYear() === anoAlvo;
    });

    // 2. Agrupar por CEEM
    const agrupado = {};
    let somaGeral = 0;

    dadosAno.forEach(item => {
        const nomeCeem = item.ceemResponsavel || "Não Definido";
        const valor = parseFloat(item.valorNF) || 0;
        const data = new Date(item.data);
        const nomeMes = data.toLocaleString('pt-BR', { month: 'long' });

        if (!agrupado[nomeCeem]) {
            agrupado[nomeCeem] = { nome: nomeCeem, total: 0, meses: {} };
        }

        agrupado[nomeCeem].total += valor;
        agrupado[nomeCeem].meses[nomeMes] = (agrupado[nomeCeem].meses[nomeMes] || 0) + valor;
        somaGeral += valor;
    });

    // 3. ORDENAÇÃO: Do maior valor para o menor
    const listaOrdenada = Object.values(agrupado).sort((a, b) => b.total - a.total);

    // 4. Renderizar Cards
    listaOrdenada.forEach(info => {
        let mesesHtml = "";
        const caminhoImg = gerarCaminhoImagem(info.nome);

        // Criar linhas de meses
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
                <div class="card-header-img">
                    <img src="${caminhoImg}" alt="${info.nome}" onerror="this.src='img-band/default.png'">
                </div>
                <div class="card-body">
                    <span class="tag-ano">SISTEMA DE DESPESAS</span>
                    <h3>${info.nome}</h3>
                    <span class="valor">R$ ${info.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    <div class="card-detalhes">
                        <strong>Resumo por Mês</strong>
                        ${mesesHtml}
                    </div>
                </div>
            </div>
        `;
    });

    document.getElementById("somaTotal").innerText = `R$ ${somaGeral.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

function voltar() {
    window.location.href = "index.html";
}

inicializar();