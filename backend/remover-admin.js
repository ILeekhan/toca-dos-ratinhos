const readline = require("node:readline/promises");
const database = require("./database");

const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    const email = (await terminal.question(
        "E-mail da conta admin que deseja remover: "
    )).trim().toLowerCase();

    const user = database.prepare(`
        SELECT id, email, role
        FROM users
        WHERE lower(email) = ?
    `).get(email);

    if (!user) {
        throw new Error("Não encontrei uma conta com esse e-mail.");
    }

    if (user.role !== "admin") {
        throw new Error("A conta encontrada não é administradora.");
    }

    const admins = database.prepare(`
        SELECT COUNT(*) AS total
        FROM users
        WHERE role = 'admin'
    `).get().total;

    if (admins <= 1) {
        throw new Error(
            "Essa é a última conta admin. Promova e teste a conta da dona primeiro."
        );
    }

    const confirmacao = (await terminal.question(
        `Digite REMOVER para apagar a conta ${user.email}: `
    )).trim();

    if (confirmacao !== "REMOVER") {
        console.log("Operação cancelada.");
        return;
    }

    database.exec("BEGIN IMMEDIATE");

    try {
        database.prepare(`
            DELETE FROM sessions
            WHERE user_id = ?
        `).run(user.id);

        database.prepare(`
            DELETE FROM users
            WHERE id = ?
        `).run(user.id);

        database.exec("COMMIT");
        console.log("Conta admin e sessões removidas.");
    } catch (error) {
        database.exec("ROLLBACK");
        throw error;
    }
}

main()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => {
        terminal.close();
        database.close?.();
    });