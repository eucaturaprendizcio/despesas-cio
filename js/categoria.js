const API = "https://script.google.com/macros/s/AKfycbxd63CJEZFzY1qxQY9Q302DSHwd_FAW4QIKeXQuxbL6YVutJHHzup-JXKhcnscpUooBIw/exec";
const params = new URLSearchParams(window.location.search);
const tipo = params.get("tipo");

document.getElementById("tituloCategoria").innerText = "Despesas: " + tipo;

async function carregarSolicitacoes() {
  const res = await fetch(API + "?tipo=" + tipo);
  const dados = await res.json();

  const lista = document.getElementById("lista");

  dados.forEach(item => {
    const dataFormatada = item.data ? new Date(item.data).toLocaleDateString('pt-BR') : "—";

    lista.innerHTML += `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <span class="tag-ceem">${item.ceemResponsavel || "Sem CEEM"}</span>
            <span class="card-date">${dataFormatada}</span>
        </div>
        <h3>Ocorrência ${item.ocorrencia}</h3>
        <p><b>Número NF:</b> ${item.numeroNF || "—"}</p>
        <p><b>Valor:</b> R$ ${item.valorNF}</p>
        ${item.linkNF ? `<a href="${item.linkNF}" target="_blank" class="btn-documento">Ver Documento</a>` : ""}
      </div>
    `;
  });
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
  window.location.href = "index.html";
}

