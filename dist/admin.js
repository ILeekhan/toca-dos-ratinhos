const API_BASE = `http://${window.location.hostname}:3333`;

const statusAdmin = document.querySelector("#status-admin");
const conteudoAdmin = document.querySelector("#conteudo-admin");
const mensagemUsuarios = document.querySelector("#mensagem-usuarios");
const listaUsuarios = document.querySelector("#lista-usuarios");

async function verificarAcesso() {
    try {
        const resposta = await fetch(`${API_BASE}/api/auth/me`, {
            credentials: "include"
        });

        if (resposta.status === 401) {
            window.location.href = "login.html";
            return false;
        }

        const resultado = await resposta.json();

        if (!resposta.ok || resultado.usuario.role !== "admin") {
            statusAdmin.textContent = "Acesso restrito à administração.";
            return false;
        }

        statusAdmin.textContent = `Bem-vinda, ${resultado.usuario.username}.`;
        conteudoAdmin.hidden = false;
        return true;
    } catch {
        statusAdmin.textContent =
            "Não foi possível conectar ao backend. Confira se ele está rodando.";
        return false;
    }
}

async function carregarUsuarios() {
    mensagemUsuarios.textContent = "Carregando usuários...";
    listaUsuarios.replaceChildren();

    try {
        const resposta = await fetch(`${API_BASE}/api/admin/users`, {
            credentials: "include"
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Não foi possível carregar os usuários.");
        }

        if (resultado.usuarios.length === 0) {
            mensagemUsuarios.textContent = "Ainda não há contas cadastradas.";
            return;
        }

        for (const usuario of resultado.usuarios) {
            const linha = document.createElement("tr");

            for (const valor of [
                usuario.username,
                usuario.email,
                usuario.role,
                usuario.created_at
            ]) {
                const celula = document.createElement("td");
                celula.textContent = valor || "";
                linha.appendChild(celula);
            }

            listaUsuarios.appendChild(linha);
        }

        mensagemUsuarios.textContent = "";
    } catch (erro) {
        mensagemUsuarios.textContent = erro.message;
    }
}

document.querySelector("#botao-atualizar").addEventListener("click", carregarUsuarios);

document.querySelector("#botao-sair").addEventListener("click", async () => {
    await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: "{}"
    });

    window.location.href = "login.html";
});

(async () => {
    if (await verificarAcesso()) {
        await carregarUsuarios();
    }
})();