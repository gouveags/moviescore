const PASSWORD_ITERATIONS = 210_000;
const KEY_LENGTH = 32;

type RuntimeEnv = Record<string, string | undefined>;

const toBase64 = (input: Uint8Array): string => Buffer.from(input).toString("base64");

const fromBase64 = (input: string): Uint8Array => new Uint8Array(Buffer.from(input, "base64"));

const randomBytes = (size: number): Uint8Array => crypto.getRandomValues(new Uint8Array(size));

const toArrayBuffer = (input: Uint8Array): ArrayBuffer => {
  const copy = new Uint8Array(input.byteLength);
  copy.set(input);
  return copy.buffer;
};

const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const encodedPassword = new TextEncoder().encode(password);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encodedPassword,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: toArrayBuffer(salt),
      iterations: PASSWORD_ITERATIONS,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  const hash = new Uint8Array(bits);
  return `pbkdf2_sha256$${PASSWORD_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
};

const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  const [algorithm, iterationsRaw, saltRaw, hashRaw] = storedHash.split("$");
  if (algorithm !== "pbkdf2_sha256" || !iterationsRaw || !saltRaw || !hashRaw) {
    return false;
  }

  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations <= 0) {
    return false;
  }

  const salt = fromBase64(saltRaw);
  const expectedHash = fromBase64(hashRaw);
  const encodedPassword = new TextEncoder().encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encodedPassword,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: toArrayBuffer(salt),
      iterations,
    },
    keyMaterial,
    expectedHash.byteLength * 8,
  );
  const candidateHash = new Uint8Array(bits);

  if (candidateHash.length !== expectedHash.length) {
    return false;
  }

  let delta = 0;
  for (let index = 0; index < candidateHash.length; index += 1) {
    delta |= candidateHash[index] ^ expectedHash[index];
  }
  return delta === 0;
};

const hashOpaqueToken = async (token: string, pepper: string): Promise<string> => {
  const encoded = new TextEncoder().encode(`${token}:${pepper}`);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return toBase64(new Uint8Array(digest));
};

const generateOpaqueToken = (): string => toBase64(randomBytes(32));

const deriveTokenPepper = (env: RuntimeEnv): string => {
  if (env.AUTH_TOKEN_PEPPER) {
    return env.AUTH_TOKEN_PEPPER;
  }
  if (env.NODE_ENV === "production") {
    throw new Error("AUTH_TOKEN_PEPPER is required in production");
  }
  return "moviescore-dev-token-pepper";
};

const getEncryptionKey = async (env: RuntimeEnv): Promise<CryptoKey> => {
  const keySource = env.APP_ENCRYPTION_KEY;

  if (keySource) {
    const raw = fromBase64(keySource);
    if (raw.byteLength !== KEY_LENGTH) {
      throw new Error("APP_ENCRYPTION_KEY must be base64-encoded 32 bytes");
    }
    return crypto.subtle.importKey("raw", toArrayBuffer(raw), "AES-GCM", false, [
      "encrypt",
      "decrypt",
    ]);
  }

  if (env.NODE_ENV === "production") {
    throw new Error("APP_ENCRYPTION_KEY is required in production");
  }

  const fallbackDigest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode("moviescore-dev-encryption-key"),
  );
  return crypto.subtle.importKey(
    "raw",
    toArrayBuffer(new Uint8Array(fallbackDigest).slice(0, KEY_LENGTH)),
    "AES-GCM",
    false,
    ["encrypt", "decrypt"],
  );
};

const encryptAtRest = async (value: string, env: RuntimeEnv): Promise<string> => {
  const key = await getEncryptionKey(env);
  const iv = randomBytes(12);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    new TextEncoder().encode(value),
  );
  return `${toBase64(iv)}.${toBase64(new Uint8Array(ciphertext))}`;
};

const decryptAtRest = async (value: string, env: RuntimeEnv): Promise<string> => {
  const [ivRaw, ciphertextRaw] = value.split(".");
  if (!ivRaw || !ciphertextRaw) {
    throw new Error("Encrypted value has invalid format");
  }

  const key = await getEncryptionKey(env);
  const iv = fromBase64(ivRaw);
  const ciphertext = fromBase64(ciphertextRaw);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(ciphertext),
  );
  return new TextDecoder().decode(plaintext);
};

const createId = (): string =>
  Array.from(randomBytes(16))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");

export {
  createId,
  decryptAtRest,
  deriveTokenPepper,
  encryptAtRest,
  generateOpaqueToken,
  hashOpaqueToken,
  hashPassword,
  verifyPassword,
};
export type { RuntimeEnv };
