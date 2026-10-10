const API_BASE = `http://${window.location.hostname}:3333`;
const mensagem = document.querySelector("#mensagem");
const formularioLogin = document.querySelector("#form-login");

formularioLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const formulario = evento.currentTarget;
    const dados = Object.fromEntries(new FormData(formulario));

    try {
        const resposta = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Não foi possível entrar.");
        }

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Não foi possível entrar.");
        }

        if (resultado.usuario.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "estudos.html";
        }

        mensagem.textContent = `Login feito. Olá, ${resultado.usuario.username}!`;
        mensagem.className = "mensagem sucesso";
        formulario.reset();
    } catch (erro) {
        mensagem.textContent = erro.message;
        mensagem.className = "mensagem erro";
    }
});