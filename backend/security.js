const {
    randomBytes,
    scrypt,
    timingSafeEqual,
    createHash
} = require("node:crypto");
const { promisify } = require("node:util");

const scryptAsync = promisify(scrypt);
const SCRYPT_OPTIONS = {
    N: 32768,
    r: 8,
    p: 3,
    maxmem: 128 * 1024 * 1024
};

async function hashPassword(password) {
    const salt = randomBytes(16);
    const derivedKey = await scryptAsync(
        password,
        salt,
        64,
        SCRYPT_OPTIONS
    );

    return [
        "scrypt",
        SCRYPT_OPTIONS.N,
        SCRYPT_OPTIONS.r,
        SCRYPT_OPTIONS.p,
        salt.toString("hex"),
        derivedKey.toString("hex")
    ].join("$");
}

async function verifyPassword(password, storedHash) {
    try {
        const parts = storedHash.split("$");

        if (parts.length !== 6 || parts[0] !== "scrypt") {
            return false;
        }

        const [, n, r, p, saltHex, keyHex] = parts;

        if (
            Number(n) !== SCRYPT_OPTIONS.N ||
            Number(r) !== SCRYPT_OPTIONS.r ||
            Number(p) !== SCRYPT_OPTIONS.p
        ) {
            return false;
        }

        const salt = Buffer.from(saltHex, "hex");
        const expectedKey = Buffer.from(keyHex, "hex");

        if (salt.length !== 16 || expectedKey.length !== 64) {
            return false;
        }

        const actualKey = await scryptAsync(
            password,
            salt,
            expectedKey.length,
            SCRYPT_OPTIONS
        );

        return timingSafeEqual(actualKey, expectedKey);
    } catch {
        return false;
    }
}

function createSessionToken() {
    return randomBytes(32).toString("base64url");
}

function hashToken(token) {
    return createHash("sha256").update(token).digest("hex");
}

function hashIdentifier(value) {
    return createHash("sha256").update(value).digest("hex");
}

module.exports = {
    hashPassword,
    verifyPassword,
    createSessionToken,
    hashToken,
    hashIdentifier
};