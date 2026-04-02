function voltar() {
    window.location.href = "index.html"; 
}

// CONFIGURE SUA API GOOGLE SHEETS AQUI
const SHEET_ID = "14xO5yA8ho4Fzz-IBaGaYnogcpLwG0IkzY2L3BeMkBIQ";
const API_KEY = "AIzaSyDiOkjJKTsv8NJdeX_DGgv812e_e2ajOB0";
const RANGE = "dashboardDados!A1:Z200";

async function carregarDados() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.values;
}

function getValor(celula) {
  return celula ? Number(celula.replace(/[^0-9,-]/g, '').replace(',', '.')) : 0;
}

carregarDados().then(linhas => {

  // ================= TOTAL MENSAL =================
  // Valor em A5
  document.getElementById("totalMensal").innerHTML =
    `Total Mensal: ${linhas[4][0]}`;

  // ================= SOMA POR DESPESAS =================
  // Valores: D6:F15
  let tabela = document.getElementById("tabelaDespesas");
  tabela.innerHTML = `
    <tr>
      <th>DESPESAS</th>
      <th>QNTD. DE OCORRÊNCIAS</th>
      <th>VALOR (R$)</th>
    </tr>
  `;

  for (let i = 5; i <= 14; i++) { // linhas 6 a 15
    tabela.innerHTML += `
      <tr>
        <td>${linhas[i][3]}</td>
        <td>${linhas[i][4]}</td>
        <td>${linhas[i][5]}</td>
      </tr>
    `;
  }

  // ================= GRÁFICO PIZZA =================
  // Valores: A8:B18
  const despesasPizza = linhas.slice(8, 18).map(l => l[0]);
  const percentPizza = linhas.slice(8, 18).map(l => getValor(l[1]));

  new Chart(document.getElementById("graficoPizza"), {
    type: "pie",
    data: {
      labels: despesasPizza,
      datasets: [{ data: percentPizza }]
    }
  });

  // ================= GRÁFICO DE BARRAS =================
  // Valores: D19:E28
  const despesasBar = linhas.slice(18, 28).map(l => l[3]);
  const valoresBar = linhas.slice(18, 28).map(l => getValor(l[4]));

  new Chart(document.getElementById("graficoBarras"), {
    type: "bar",
    data: {
      labels: despesasBar,
      datasets: [{ data: valoresBar }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
});


// === BOTÃO PARA GERAR PDF DO DASHBOARD === //
document.getElementById("btnPDF").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;

  // captura a div principal
  const areaDashboard = document.body;

  // tira print da tela
  const canvas = await html2canvas(areaDashboard, { scale: 2 });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let position = 0;

  // Se a imagem for maior que uma página, divide automaticamente
  while (position < imgHeight) {
    pdf.addImage(imgData, "PNG", 0, -position, imgWidth, imgHeight);
    position += pdfHeight;
    if (position < imgHeight) pdf.addPage();
  }

  pdf.save("dashboard_cio.pdf");
});
