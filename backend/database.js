const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const dataDirectory = path.join(__dirname, "data");
fs.mkdirSync(dataDirectory, { recursive: true });

const database = new DatabaseSync(
    path.join(dataDirectory, "cantinho.sqlite")
);

database.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL COLLATE NOCASE UNIQUE,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'aluno'
      CHECK (role IN ('aluno', 'admin')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS login_attempts (
    attempt_key TEXT PRIMARY KEY,
    failure_count INTEGER NOT NULL DEFAULT 0,
    window_started_at INTEGER NOT NULL,
    blocked_until INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS sessions_user_id
    ON sessions(user_id);

  CREATE INDEX IF NOT EXISTS sessions_expires_at
    ON sessions(expires_at);
`);

module.exports = database;