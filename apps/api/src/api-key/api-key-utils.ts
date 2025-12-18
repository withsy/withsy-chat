import { randomBytes } from "node:crypto";

const PREFIX = "api-";

export function generateApiKey(): string {
  const random = randomBytes(32).toString("base64url");
  return `${PREFIX}${random}`;
}

export function getDevApiKey(): string {
  return `${PREFIX}development`;
}
