<div align="center">

# 🐭 Toca dos Ratinhos

*Site de apoio às aulas de programação da professora*

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)
![Front-end](https://img.shields.io/badge/Front--end-HTML%20%7C%20CSS%20%7C%20JS-orange?style=for-the-badge)
![Back-end](https://img.shields.io/badge/Back--end-Node.js-green?style=for-the-badge)
![Database](https://img.shields.io/badge/Database-SQLite-blue?style=for-the-badge)

---

### 🛠️ Tecnologias e Ferramentas Utilizadas

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)

</div>

---

## 📖 Sobre o Projeto

O **Toca dos Ratinhos** é um site de apoio às aulas de programação, desenvolvido para a professora e seus alunos. O projeto mantém uma estrutura **simples e leve**, com foco em aprendizado e funcionalidade.

- **Front-end:** HTML, CSS e JavaScript puros
- **Back-end:** Node.js com API REST e autenticação por sessão
- **Banco de dados:** SQLite local

> ⚠️ **Atenção:** Este é um servidor local de desenvolvimento. **Não utilize em produção.**

---

## 📁 Estrutura do Projeto

```
site-professora/
├── 📂 dist/                          # Arquivos do front-end
│   ├── 📄 index.html                 # Apresentação pública do site
│   ├── 📄 estudos.html               # Painel de estudos do aluno
│   ├── 📄 login.html                 # Login de aluno e administrador
│   ├── 📄 cadastro.html              # Cadastro público de aluno
│   ├── 📄 admin.html                 # Painel administrativo
│   ├── 📜 app.js                     # Busca, chatbot e contatos
│   ├── 📜 login.js                   # Envio do login e redirecionamento por perfil
│   ├── 📜 cadastro.js                # Envio do cadastro
│   ├── 📜 admin.js                   # Verificações e ações da área admin
│   ├── 🎨 styles.css                 # Estilos do painel de estudos
│   ├── 🎨 landing.css                # Estilos da página de apresentação
│   └── 🖼️ imagens/                   # Imagens das aulas e dos ratinhos
│
└── 📂 backend/                       # API, autenticação e banco de dados
    ├── 📜 server.js                  # Servidor HTTP e rotas da API
    ├── 📜 auth.js                    # Cadastro, login, sessão e usuários
    ├── 📜 security.js                # Hash de senhas e tokens de sessão
    ├── 📜 database.js                # Configuração e consultas SQLite
    └── 📂 data/
        └── 💾 cantinho.sqlite        # Banco local de usuários e sessões
```

> 📌 **Nota de reorganização:** A página inicial está sendo reorganizada. O painel que hoje está em `index.html` deve ser preservado como `estudos.html`; o novo `index.html` será a apresentação pública. Todos os arquivos devem ficar dentro de `dist`.

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

| Ferramenta | Finalidade |
| :--- | :--- |
| 🟢 **Node.js** | Iniciar o back-end (API e autenticação) |
| 🐍 **Python** | Servir os arquivos estáticos do front-end com `http.server` |
| 💾 **SQLite** | Banco de dados local (embutido no back-end) |

---

## 🚀 Como Executar (Windows PowerShell)

Abra **dois terminais** no VS Code e mantenha ambos abertos.

### 🖥️ Terminal 1 — Back-end

```powershell
cd "$HOME\Desktop\Programação\Site_Ming\site-professora\backend"
node .\server.js
```

✅ O servidor deve informar que está rodando em **`http://127.0.0.1:3333`**

### 🌐 Terminal 2 — Front-end

```powershell
cd "$HOME\Desktop\Programação\Site_Ming\site-professora\dist"
py -m http.server 4173
```

### 🔗 Acesse no navegador

| Endereço | Descrição |
| :--- | :--- |
| 🌐 `http://127.0.0.1:4173` | Site principal |
| 💚 `http://127.0.0.1:3333/api/health` | Verificação da API |

---

## 🔐 Fluxo de Acesso

```
index.html  ──►  Login / Cadastro  ──►  Perfil aluno  ──►  estudos.html
                                          Perfil admin  ──►  admin.html
```

- 📢 `index.html` apresenta o site e oferece os links de **login** e **cadastro**.
- 🎓 Contas criadas pelo cadastro público recebem automaticamente o perfil **aluno**.
- 👨‍🎓 Após autenticar, alunos são redirecionados para `estudos.html`.
- 👑 Contas com perfil **admin** são redirecionadas para `admin.html`.
- 🛡️ O servidor verifica a sessão e exige perfil admin nas rotas administrativas.

> 💡 **Dica:** O redirecionamento após o cadastro depende da versão atualizada de `server.js`, que cria a sessão junto com a conta. Depois de aplicar a alteração, teste o cadastro em uma **conta de teste** antes de usar a conta principal.

---

## 📡 Rotas da API

| Método | Rota | Uso |
| :---: | :--- | :--- |
| `GET` | `/api/health` | ✅ Verificar se o servidor está ativo |
| `GET` | `/api/cursos` | 📚 Listar cursos |
| `POST` | `/api/auth/register` | 📝 Criar conta de aluno |
| `POST` | `/api/auth/login` | 🔑 Entrar |
| `POST` | `/api/auth/logout` | 🚪 Encerrar sessão |
| `GET` | `/api/auth/me` | 👤 Consultar a conta da sessão atual |
| `GET` | `/api/admin/users` | 👑 Listar usuários (admin autenticado) |

---

## 🔒 Segurança Implementada

- ✅ O cadastro público define o perfil como **aluno** — não aceita perfil administrativo enviado pelo formulário.
- ✅ As consultas SQLite de autenticação usam **parâmetros** (prevenção contra SQL Injection).
- ✅ Senhas armazenadas com **hash**; o banco guarda o hash do token de sessão.
- ✅ Cookie de sessão com `HttpOnly`, `SameSite=Lax` e `Secure` quando `NODE_ENV=production`.
- ✅ **Rate limit:** login bloqueia novas tentativas por 15 minutos após 5 falhas.
- ✅ API limita o tamanho do corpo, aceita apenas JSON e permite origens locais configuradas (CORS).
- ✅ Painel administrativo verifica sessão e perfil antes de listar usuários.
- ✅ Front-end usa `textContent` para mensagens do chatbot e avisos (sem montar HTML a partir de dados do usuário — prevenção contra XSS).
- ✅ Links de contato aceitam somente **HTTPS** nos domínios permitidos de WhatsApp e Instagram.

### ⚠️ Revisão Pendente

A revisão de segurança **ainda não está concluída**. É necessário:
- 🧪 Testar as alterações no navegador.
- 👀 Conferir `login.js`, `cadastro.js`, `admin.js` e as rotas do back-end.
- ✔️ Validar redirecionamentos e os pontos onde dados de usuários são exibidos.

---

## 🗺️ Conteúdos e Funções — Próximos Passos

| Funcionalidade | Status |
| :--- | :---: |
| 📄 PDFs e materiais informativos de **hacking ético** (criados pela professora) | 🕐 Planejado |
| 🛒 Seção de loja — checkout e pagamentos conectados | 🕐 Planejado |
| 🤖 Chatbot com IA conectada a serviço externo | 🕐 Planejado |
| ⚙️ Painel admin completo (aulas, produtos e conteúdos) | 🕐 Planejado |

> 🤖 O chatbot atual responde perguntas frequentes e direciona para os contatos — ele **não** é um assistente de IA conectado a um serviço externo.
>
> 🛒 A seção de loja é atualmente apenas uma **estrutura visual**.

---

<div align="center">

Feito com 🧀 por alunos e professora — **Toca dos Ratinhos** 🐭

</div>
