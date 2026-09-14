import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

/**
 * Criptografia das senhas guardadas em "Senhas". Roda SÓ no servidor (Server
 * Actions) — a chave nunca é exposta ao navegador. Se CREDENTIALS_ENCRYPTION_KEY
 * mudar ou se perder, tudo que já foi salvo fica permanentemente ilegível.
 */

function getKey(): Buffer {
  const secret = process.env.CREDENTIALS_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("CREDENTIALS_ENCRYPTION_KEY não configurada nas variáveis de ambiente.");
  }
  // Deriva uma chave de 32 bytes (AES-256) a partir do segredo configurado.
  return scryptSync(secret, "roko-tarefas-credentials-v1", 32);
}

/** Retorna base64(iv + authTag + ciphertext). */
export function encryptSecret(plainText: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptSecret(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
