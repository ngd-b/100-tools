import assert from "node:assert/strict";
import test from "node:test";
import {
  base64Length,
  bytesToBase64,
  bytesToHex,
  entropyScore,
  generateSecurePassword,
  opensslCommand,
  randomBytes,
} from "../src/lib/password.ts";

test("hex encoding is lowercase, zero-padded and two characters per byte", () => {
  assert.equal(bytesToHex(new Uint8Array([0, 15, 255])), "000fff");
  assert.equal(bytesToHex(randomBytes(32)).length, 64);
  assert.match(bytesToHex(randomBytes(32)), /^[0-9a-f]{64}$/);
});

test("base64 encoding and length match openssl rand -base64 output", () => {
  assert.equal(bytesToBase64(new TextEncoder().encode("Open")), "T3Blbg==");
  const bytes = randomBytes(32);
  assert.equal(bytesToBase64(bytes), Buffer.from(bytes).toString("base64"));
  for (const bytes of [1, 2, 3, 32, 48, 49, 64]) {
    assert.equal(base64Length(bytes) % 4, 0);
    assert.equal(bytesToBase64(randomBytes(bytes)).length, base64Length(bytes));
  }
});

test("openssl commands match the selected format and unwrap wrapped base64", () => {
  assert.equal(opensslCommand("hex", 32), "openssl rand -hex 32");
  assert.equal(opensslCommand("base64", 32), "openssl rand -base64 32");
  assert.equal(opensslCommand("base64", 48), "openssl rand -base64 48");
  assert.equal(opensslCommand("base64", 49), "openssl rand -base64 49 | tr -d '\\n'");
});

test("character passwords keep the requested length and charset", () => {
  const charset = "abcXYZ019!?";
  const password = generateSecurePassword(24, charset);
  assert.equal(password.length, 24);
  assert.ok([...password].every((char) => charset.includes(char)));
});

test("entropy score rises with byte length and saturates at 128 bits", () => {
  const scores = [1, 6, 8, 12, 16, 24, 32, 64].map((bytes) => entropyScore(bytes));
  assert.deepEqual(scores, [...scores].sort((a, b) => a - b));
  assert.equal(entropyScore(16), 7);
  assert.equal(entropyScore(32), 7);
  assert.equal(entropyScore(64), 7);
  assert.equal(entropyScore(6), 3);
});
