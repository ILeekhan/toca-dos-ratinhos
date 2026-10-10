const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");
const database = require("./database");

async function main() {
    const terminal = readline.createInterface({ input: stdin, output: stdout });

    try {
        const confirmacao = await terminal.question(
            "Isso apagará todas as contas. Digite APAGAR-CONTAS para confirmar: "
        );

        if (confirmacao !== "APAGAR-CONTAS") {
            console.log("Operacao cancelada.");
            return;
        }

        database.exec("BEGIN");

        try {
            database.exec("DELETE FROM sessions");
            database.exec("DELETE FROM login_attempts");
            database.exec("DELETE FROM users");
            database.exec("DELETE FROM sqlite_sequence WHERE name = 'users'");
            database.exec("COMMIT");

            console.log("Contas e bloqueios apagados.");
        } catch (erro) {
            database.exec("ROLLBACK");
            throw erro;
        }
    } finally {
        terminal.close();
        database.close();
    }
}

main().catch((erro) => {
    console.error("Erro ao limpar as contas:", erro.message);
    process.exitCode = 1;
});