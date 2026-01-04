import crypto from "crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;

// MUST be 32 bytes after decoding
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

if (KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
}

export const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGO, KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    content: encrypted,
    tag: cipher.getAuthTag().toString("hex"),
  };
};

export const decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(
    ALGO,
    KEY,
    Buffer.from(hash.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(hash.tag, "hex"));

  let decrypted = decipher.update(hash.content, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
