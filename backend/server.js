const http = require("node:http");
const {
    AuthError,
    createStudent,
    login,
    getSession,
    logout,
    listUsers
} = require("./auth");

const HOST = "127.0.0.1";
const PORT = 3333;
const MAX_BODY_SIZE = 16 * 1024;
const COOKIE_NAME = "cantinho_session";

const ALLOWED_ORIGINS = new Set([
    "http://localhost:4173",
    "http://127.0.0.1:4173"
]);

const cursos = [
    { nome: "C", categoria: "Programação", descricao: "Lógica e fundamentos da linguagem C." },
    { nome: "C#", categoria: "Programação", descricao: "Fundamentos de C# e criação de programas." },
    { nome: "C++", categoria: "Programação", descricao: "Lógica e conceitos fundamentais de C++." },
    { nome: "Python", categoria: "Programação", descricao: "Introdução à programação com Python." },
    { nome: "JavaScript", categoria: "Programação", descricao: "Fundamentos de JavaScript para a web." },
    { nome: "TypeScript", categoria: "Programação", descricao: "Tipos e organização de projetos TypeScript." },
    { nome: "Linux", categoria: "Sistemas", descricao: "Sistema Linux, terminal e comandos básicos." },
    { nome: "Kali Linux", categoria: "Segurança", descricao: "Introdução ao Kali em estudos autorizados." }
];

function sendJson(response, status, data) {
    response.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer"
    });

    response.end(JSON.stringify(data));
}

function setCors(request, response) {
    const origin = request.headers.origin;
    response.setHeader("Vary", "Origin");

    if (ALLOWED_ORIGINS.has(origin)) {
        response.setHeader("Access-Control-Allow-Origin", origin);
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
}

function checkOrigin(request) {
    const origin = request.headers.origin;

    if (!origin || !ALLOWED_ORIGINS.has(origin)) {
        throw new AuthError("Origem não permitida.", 403);
    }
}

async function readJson(request) {
    const contentType = request.headers["content-type"] || "";
    const mediaType = contentType.split(";")[0].trim().toLowerCase();

    if (mediaType !== "application/json") {
        throw new AuthError("Envie os dados como JSON.", 415);
    }

    let body = "";

    for await (const chunk of request) {
        body += chunk.toString("utf8");

        if (Buffer.byteLength(body, "utf8") > MAX_BODY_SIZE) {
            throw new AuthError("A solicitação é muito grande.", 413);
        }
    }

    try {
        return JSON.parse(body || "{}");
    } catch {
        throw new AuthError("O JSON enviado não é válido.", 400);
    }
}

function readCookie(request, name) {
    const cookies = request.headers.cookie || "";

    for (const item of cookies.split(";")) {
        const [key, ...value] = item.trim().split("=");

        if (key === name) {
            return value.join("=");
        }
    }

    return null;
}

function sessionCookie(token) {
    const secure =
        process.env.NODE_ENV === "production" ? "; Secure" : "";

    return `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${secure}`;
}

function clearSessionCookie() {
    const secure =
        process.env.NODE_ENV === "production" ? "; Secure" : "";

    return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`;
}

async function handleRequest(request, response) {
    setCors(request, response);

    if (request.method === "OPTIONS") {
        const origin = request.headers.origin;

        if (!origin || !ALLOWED_ORIGINS.has(origin)) {
            return sendJson(response, 403, {
                erro: "Origem não permitida."
            });
        }

        response.writeHead(204);
        return response.end();
    }

    try {
        const url = new URL(request.url, "http://localhost");
        const route = `${request.method} ${url.pathname}`;

        if (route === "GET /api/health") {
            return sendJson(response, 200, {
                status: "ok",
                servico: "cantinho-do-codigo"
            });
        }

        if (route === "GET /api/cursos") {
            return sendJson(response, 200, cursos);
        }

        if (route === "POST /api/auth/register") {
            checkOrigin(request);

            const body = await readJson(request);

            // O cadastro público cria somente uma conta de aluno.
            await createStudent(body);

            // Após o cadastro, cria a sessão para permitir o acesso aos estudos.
            const session = await login(
                {
                    email: body.email,
                    password: body.password
                },
                request.socket.remoteAddress || "local"
            );

            response.setHeader(
                "Set-Cookie",
                sessionCookie(session.token)
            );

            return sendJson(response, 201, {
                usuario: session.user
            });
        }

        if (route === "POST /api/auth/login") {
            checkOrigin(request);

            const body = await readJson(request);
            const session = await login(
                body,
                request.socket.remoteAddress || "local"
            );

            response.setHeader(
                "Set-Cookie",
                sessionCookie(session.token)
            );

            return sendJson(response, 200, {
                usuario: session.user
            });
        }

        if (route === "POST /api/auth/logout") {
            checkOrigin(request);

            logout(readCookie(request, COOKIE_NAME));
            response.setHeader(
                "Set-Cookie",
                clearSessionCookie()
            );

            return sendJson(response, 200, {
                mensagem: "Sessão encerrada."
            });
        }

        if (route === "GET /api/auth/me") {
            const user = getSession(
                readCookie(request, COOKIE_NAME)
            );

            if (!user) {
                return sendJson(response, 401, {
                    erro: "Faça login para continuar."
                });
            }

            return sendJson(response, 200, {
                usuario: user
            });
        }

        if (route === "GET /api/admin/users") {
            const user = getSession(
                readCookie(request, COOKIE_NAME)
            );

            if (!user) {
                return sendJson(response, 401, {
                    erro: "Faça login para continuar."
                });
            }

            if (user.role !== "admin") {
                return sendJson(response, 403, {
                    erro: "Acesso restrito à administração."
                });
            }

            return sendJson(response, 200, {
                usuarios: listUsers()
            });
        }

        return sendJson(response, 404, {
            erro: "Rota não encontrada."
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return sendJson(response, error.status, {
                erro: error.message
            });
        }

        console.error("Erro no backend:", error);

        return sendJson(response, 500, {
            erro: "Erro interno do servidor."
        });
    }
}

const server = http.createServer(handleRequest);

server.listen(PORT, HOST, () => {
    console.log(`Backend rodando em http://${HOST}:${PORT}`);
});