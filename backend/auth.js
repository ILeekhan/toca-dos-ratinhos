const database = require("./database");
const {
    hashPassword,
    verifyPassword,
    createSessionToken,
    hashToken,
    hashIdentifier
} = require("./security");

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILURES = 5;

class AuthError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function publicUser(row) {
    return {
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role
    };
}

async function createStudent({ username, email, password }) {
    const cleanUsername = String(username || "").trim();
    const cleanEmail = normalizeEmail(email);

    if (cleanUsername.length < 2 || cleanUsername.length > 40) {
        throw new AuthError("O usuário deve ter entre 2 e 40 caracteres.", 400);
    }

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
        cleanEmail.length > 254
    ) {
        throw new AuthError("Informe um e-mail válido.", 400);
    }

    if (typeof password !== "string" || password.length < 12 || password.length > 128) {
        throw new AuthError("A senha deve ter entre 12 e 128 caracteres.", 400);
    }

    const passwordHash = await hashPassword(password);

    try {
        const result = database.prepare(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, 'aluno')
    `).run(cleanUsername, cleanEmail, passwordHash);

        const user = database.prepare(`
      SELECT id, username, email, role
      FROM users
      WHERE id = ?
    `).get(Number(result.lastInsertRowid));

        return publicUser(user);
    } catch (error) {
        if (String(error.message).includes("UNIQUE")) {
            throw new AuthError("Esse usuário ou e-mail já está cadastrado.", 409);
        }
        throw error;
    }
}

function recordFailedLogin(attemptKey, now) {
    const existing = database.prepare(`
    SELECT failure_count, window_started_at
    FROM login_attempts
    WHERE attempt_key = ?
  `).get(attemptKey);

    if (!existing || now - existing.window_started_at >= LOGIN_WINDOW_MS) {
        database.prepare(`
      INSERT INTO login_attempts
        (attempt_key, failure_count, window_started_at, blocked_until)
      VALUES (?, 1, ?, 0)
      ON CONFLICT(attempt_key) DO UPDATE SET
        failure_count = 1,
        window_started_at = excluded.window_started_at,
        blocked_until = 0
    `).run(attemptKey, now);

        return 1;
    }

    const failures = existing.failure_count + 1;
    const blockedUntil =
        failures >= MAX_LOGIN_FAILURES ? now + LOGIN_WINDOW_MS : 0;

    database.prepare(`
    UPDATE login_attempts
    SET failure_count = ?, blocked_until = ?
    WHERE attempt_key = ?
  `).run(failures, blockedUntil, attemptKey);

    return failures;
}

async function login({ email, password }, ipAddress = "local") {
    const cleanEmail = normalizeEmail(email);
    const now = Date.now();
    const attemptKey = hashIdentifier(`${ipAddress}:${cleanEmail}`);

    const attempt = database.prepare(`
    SELECT blocked_until, window_started_at
    FROM login_attempts
    WHERE attempt_key = ?
  `).get(attemptKey);

    if (attempt && attempt.blocked_until > now) {
        throw new AuthError("Muitas tentativas. Aguarde 15 minutos e tente novamente.", 429);
    }

    const user = database.prepare(`
    SELECT id, username, email, password_hash, role
    FROM users
    WHERE email = ?
  `).get(cleanEmail);

    const validPassword =
        user &&
        typeof password === "string" &&
        await verifyPassword(password, user.password_hash);

    if (!validPassword) {
        recordFailedLogin(attemptKey, now);
        throw new AuthError("E-mail ou senha incorretos.", 401);
    }

    database.prepare(`
    DELETE FROM login_attempts
    WHERE attempt_key = ?
  `).run(attemptKey);

    const token = createSessionToken();
    const expiresAt = now + SESSION_DURATION_MS;

    database.prepare(`
    INSERT INTO sessions (token_hash, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(hashToken(token), user.id, expiresAt, now);

    return {
        token,
        user: publicUser(user),
        expiresAt
    };
}

function getSession(token) {
    if (!token) return null;

    const now = Date.now();

    database.prepare(`
    DELETE FROM sessions
    WHERE expires_at <= ?
  `).run(now);

    const row = database.prepare(`
    SELECT users.id, users.username, users.email, users.role
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ?
      AND sessions.expires_at > ?
  `).get(hashToken(token), now);

    return row ? publicUser(row) : null;
}

function logout(token) {
    if (!token) return;

    database.prepare(`
    DELETE FROM sessions
    WHERE token_hash = ?
  `).run(hashToken(token));
}

function listUsers() {
    return database.prepare(`
    SELECT id, username, email, role, created_at
    FROM users
    ORDER BY id DESC
  `).all();
}

module.exports = {
    AuthError,
    createStudent,
    login,
    getSession,
    logout,
    listUsers
};