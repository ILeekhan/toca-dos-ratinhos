const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");
const database = require("./database");

async function main() {
    const terminal = readline.createInterface({ input: stdin, output: stdout });

    try {
        const email = (await terminal.question("E-mail da conta: "))
            .trim()
            .toLowerCase();

        const confirmacao = await terminal.question(
            "Digite PROMOVER para tornar essa conta administradora: "
        );

        if (confirmacao !== "PROMOVER") {
            console.log("Operacao cancelada.");
            return;
        }

        const resultado = database.prepare(`
      UPDATE users SET role = 'admin' WHERE email = ?
    `).run(email);

        console.log(
            resultado.changes === 1
                ? "Conta promovida a administradora."
                : "Nao encontrei uma conta com esse e-mail."
        );
    } finally {
        terminal.close();
        database.close();
    }
}

main().catch((erro) => {
    console.error("Erro:", erro.message);
    process.exitCode = 1;
});