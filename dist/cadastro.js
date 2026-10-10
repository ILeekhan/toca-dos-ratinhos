const API_BASE = `http://${window.location.hostname}:3333`;
const mensagem = document.querySelector("#mensagem");

document.querySelector("#form-cadastro").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const formulario = evento.currentTarget;
    const dados = Object.fromEntries(new FormData(formulario));

    try {
        const resposta = await fetch(`${API_BASE}/api/auth/register`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Não foi possível criar a conta.");
        }

        mensagem.textContent = "Conta criada! Agora você pode entrar.";
        mensagem.className = "mensagem sucesso";
        formulario.reset();
    } catch (erro) {
        mensagem.textContent = erro.message;
        mensagem.className = "mensagem erro";
    }
});