Toca dos Ratinhos
Site de apoio às aulas de programação da professora. O projeto usa HTML, CSS e JavaScript no front-end e Node.js com SQLite no back-end, mantendo a estrutura simples e leve.
Estrutura

site-professora/

├── dist/                         # Arquivos do front-end

│   ├── index.html                # Apresentação pública do site

│   ├── estudos.html              # Painel de estudos do aluno

│   ├── login.html                # Login de aluno e administrador

│   ├── cadastro.html             # Cadastro público de aluno

│   ├── admin.html                # Painel administrativo

│   ├── app.js                    # Busca, chatbot e contatos

│   ├── login.js                  # Envio do login e redirecionamento por perfil

│   ├── cadastro.js               # Envio do cadastro

│   ├── admin.js                  # Verificações e ações da área admin

│   ├── styles.css                # Estilos do painel de estudos

│   ├── landing.css               # Estilos da página de apresentação

│   └── imagens/                  # Imagens das aulas e dos ratinhos

└── backend/                      # API, autenticação e banco de dados

├── server.js                 # Servidor HTTP e rotas da API
    
  ├── auth.js                   # Cadastro, login, sessão e usuários
    
  ├── security.js               # Hash de senhas e tokens de sessão
  
  ├── database.js               # Configuração e consultas SQLite
    
  └── data/
    
  └── cantinho.sqlite       # Banco local de usuários e sessões

A página inicial está sendo reorganizada: o painel que hoje está em index.html deve ser preservado como estudos.html; o novo index.html será a apresentação pública. Os arquivos devem ficar todos dentro de dist.

Requisitos
- Node.js instalado para iniciar o back-end.
- Python instalado para servir os arquivos estáticos do front-end com http.server.
- O SQLite é usado pelo back-end para armazenar contas e sessões.

Como executar no Windows PowerShell
Abra dois terminais no VS Code e mantenha ambos abertos.
Terminal 1 — back-end

cd "$HOME\Desktop\Programação\Site_Ming\site-professora\backend"
node .\server.js

O servidor deve informar que está rodando em http://127.0.0.1:3333.

Terminal 2 — front-end

cd "$HOME\Desktop\Programação\Site_Ming\site-professora\dist"
py -m http.server 4173

Abra no navegador:
- Site: http://127.0.0.1:4173
- Verificação da API: http://127.0.0.1:3333/api/health
- 
Fluxo de acesso
1. index.html apresenta o site e oferece os links de login e cadastro.
2. Contas criadas pelo cadastro público recebem o perfil aluno.
3. Depois de autenticar, alunos devem ir para estudos.html.
4. Contas com perfil admin devem ir para admin.html.
5. O servidor verifica a sessão e exige perfil admin nas rotas administrativas.
O redirecionamento após o cadastro depende da versão atualizada de server.js, que cria a sessão junto com a conta. Depois de aplicar a alteração, teste o cadastro em uma conta de teste antes de usar a conta principal

Segurança implementada e revisão pendente
- O cadastro público define o perfil como aluno; ele não recebe um perfil administrativo enviado pelo formulário.
- As consultas SQLite de autenticação usam parâmetros.
- As senhas são armazenadas com hash, e o banco guarda o hash do token de sessão.
- O cookie de sessão usa HttpOnly e SameSite=Lax, além de Secure quando NODE_ENV=production.
- O login bloqueia novas tentativas por 15 minutos após cinco falhas dentro da janela configurada.
- A API limita o tamanho do corpo, aceita JSON e permite as origens locais configuradas.
- O painel administrativo verifica a sessão e o perfil antes de listar usuários.
- No front-end, mensagens do chatbot e avisos devem ser inseridos como texto com textContent, sem montar HTML a partir de dados do usuário.
- Links de contato devem aceitar somente HTTPS nos domínios permitidos de WhatsApp e Instagram.
A revisão ainda não está concluída. É necessário testar as alterações no navegador e conferir login.js, cadastro.js, admin.js e as rotas do back-end para validar redirecionamentos e os pontos onde dados de usuários são exibidos. Não use este servidor local como publicação de produção.
Conteúdos e funções deixados para depois
- A professora poderá criar e publicar os PDFs e os materiais informativos de hacking ético.
- A seção de loja é apenas uma estrutura visual; checkout e pagamentos ainda não estão conectados.
- O chatbot atual responde perguntas frequentes e direciona para os contatos; ele não é um assistente de IA conectado a um serviço externo.
- O painel administrativo atual não gerencia todas as aulas, produtos ou conteúdos do site.
