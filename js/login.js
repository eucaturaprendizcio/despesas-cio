const API_URL = "https://script.google.com/macros/s/AKfycbwlqmke_n2dtWC4mzvsdcvsaqrDjegWHttz1ZdxNWs0Pl1hmyY_jqEGAYv5F-m2OooCYg/exec";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const btn = document.getElementById("btnEntrar");
  const msgErro = document.getElementById("mensagemErro");
  
  // Efeito visual de carregando
  btn.innerText = "Verificando...";
  btn.disabled = true;
  msgErro.innerText = "";

  try {
    // Monta a URL passando a acao de login e as credenciais digitadas
    const url = `${API_URL}?acao=login&usuario=${encodeURIComponent(usuario)}&senha=${encodeURIComponent(senha)}`;
    
    const res = await fetch(url);
    const dados = await res.json();
    
    if (dados.autenticado === true) {
      // Salva uma flag temporária de login ativo no navegador
      localStorage.setItem("logado", "true");

      // Usuário especial: vai direto pra tela de lançamentos e não navega pelo resto do sistema
      if (usuario.toUpperCase() === "LANCAMENTO") {
        window.location.href = "lancamento.html";
        return;
      }

      // Redireciona para a página principal (mude para index.html ou o nome da sua página de ocorrências)
      window.location.href = "abaprc.html"; 
    } else {
      msgErro.innerText = "Usuário ou senha incorretos.";
      btn.innerText = "Entrar";
      btn.disabled = false;
    }
  } catch (error) {
    console.error(error);
    msgErro.innerText = "Erro ao conectar com o servidor de autenticação.";
    btn.innerText = "Entrar";
    btn.disabled = false;
  }
});

// -----------------------------------------------------
// Olhinho de mostrar/ocultar senha
// -----------------------------------------------------
const inputSenha = document.getElementById("senha");
const btnToggleSenha = document.getElementById("toggleSenha");

btnToggleSenha.addEventListener("click", () => {
  const visivel = inputSenha.type === "text";
  inputSenha.type = visivel ? "password" : "text";
  btnToggleSenha.setAttribute("aria-pressed", String(!visivel));
  btnToggleSenha.setAttribute("aria-label", visivel ? "Mostrar senha" : "Ocultar senha");
});