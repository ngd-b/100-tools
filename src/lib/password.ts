export type SecretFormat = "chars" | "hex" | "base64";

export function generateSecurePassword(length: number, charset: string): string {
  const chars = [...charset];
  const size = chars.length;
  if (size === 0) return "";
  // Rejection sampling avoids the modulo bias of `random % size`.
  const limit = Math.floor(4294967296 / size) * size;
  const buffer = new Uint32Array(1);
  const password: string[] = [];
  while (password.length < length) {
    crypto.getRandomValues(buffer);
    if (buffer[0] < limit) password.push(chars[buffer[0] % size]);
  }
  return password.join("");
}

export function randomBytes(count: number): Uint8Array {
  const bytes = new Uint8Array(count);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

// Matches the length of `openssl rand -base64 N`, padding included.
export function base64Length(bytes: number): number {
  return Math.ceil(bytes / 3) * 4;
}

// `openssl rand -base64` wraps its output at 64 columns, so longer results
// need the newline stripped to match the single-line value shown here.
export function opensslCommand(format: Exclude<SecretFormat, "chars">, bytes: number): string {
  const command = `openssl rand -${format} ${bytes}`;
  return format === "base64" && base64Length(bytes) > 64 ? `${command} | tr -d '\\n'` : command;
}

export function strengthScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  return score;
}

// Maps byte counts to the same 0–7 scale the password strength bar uses.
export function entropyScore(bytes: number): number {
  const bits = bytes * 8;
  if (bits >= 128) return 7;
  if (bits >= 96) return 6;
  if (bits >= 80) return 5;
  if (bits >= 64) return 4;
  if (bits >= 48) return 3;
  if (bits >= 32) return 2;
  return 1;
}
