const API = "https://script.google.com/macros/s/AKfycbxd63CJEZFzY1qxQY9Q302DSHwd_FAW4QIKeXQuxbL6YVutJHHzup-JXKhcnscpUooBIw/exec";
let todosDados = [];

// Ao carregar a página
async function inicializar() {
    const res = await fetch(API); // Puxa tudo sem filtro de tipo inicialmente
    todosDados = await res.json();
    
    // Define o mês atual no input como padrão
    const hoje = new Date();
    const mesAtual = hoje.toISOString().substring(0, 7); // Formato YYYY-MM
    document.getElementById("mesFiltro").value = mesAtual;
    
    filtrarPorMes();
}

function filtrarPorMes() {
    const mesSelecionado = document.getElementById("mesFiltro").value; // Formato "2024-03"
    const corpoTabela = document.getElementById("corpoTabela");
    corpoTabela.innerHTML = "";
    
    let somaTotal = 0;
    let contador = 0;

    const filtrados = todosDados.filter(item => {
        if (!item.data) return false;
        const dataItem = new Date(item.data);
        const anoMesItem = dataItem.toISOString().substring(0, 7);
        return anoMesItem === mesSelecionado;
    });

    filtrados.forEach(item => {
        const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR');
        const valorNumerico = parseFloat(item.valorNF) || 0;
        
        somaTotal += valorNumerico;
        contador++;

        corpoTabela.innerHTML += `
            <tr>
                <td>${dataFormatada}</td>
                <td><span class="tag-ceem-table">${item.ceemResponsavel || "—"}</span></td>
                <td>${item.tipo}</td>
                <td>${item.ocorrencia}</td>
                <td>${item.numeroNF || "—"}</td>
                <td>R$ ${valorNumerico.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td>
                    ${item.linkNF ? `<a href="${item.linkNF}" target="_blank" class="btn-documento">Ver Doc</a>` : "—"}
                </td>
            </tr>
        `;
    });

    document.getElementById("totalItens").innerText = contador;
    document.getElementById("somaTotal").innerText = `R$ ${somaTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

// Escuta a mudança no input de mês
document.getElementById("mesFiltro").addEventListener("change", filtrarPorMes);

function voltar() {
    window.location.href = "index.html";
}

inicializar();