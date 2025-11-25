import type { NextApiRequest } from "next";
import { createHash } from "node:crypto";

export class NextAuthCsrfService {
  private cookieName: string;

  constructor() {
    const { NEXTAUTH_URL } = process.env;
    if (!NEXTAUTH_URL) {
      throw new Error("Invalid NEXTAUTH_URL.");
    }

    const url = new URL(NEXTAUTH_URL);
    const prefix = url.protocol === "https:" ? "__Host-" : "";
    this.cookieName = `${prefix}next-auth.csrf-token`;
  }

  createCsrfTokenHash(csrfToken: string): string {
    const { NEXTAUTH_SECRET } = process.env;
    if (!NEXTAUTH_SECRET) {
      throw new Error("Invalid NEXTAUTH_SECRET.");
    }

    const csrfTokenHash = createHash("sha256")
      .update(`${csrfToken}${NEXTAUTH_SECRET}`)
      .digest("hex");

    return csrfTokenHash;
  }

  parseCsrfCookie(csrfCookie: string) {
    const [csrfToken, csrfTokenHash] = csrfCookie.split("|");
    if (!csrfToken || !csrfTokenHash)
      throw new Error("Invalid CSRF cookie value");
    return { csrfToken, csrfTokenHash };
  }

  validateCsrfToken(input: { csrfToken: string; csrfCookie: string }) {
    const { csrfToken, csrfCookie } = input;
    const parsedCookie = this.parseCsrfCookie(csrfCookie);
    const expectedCsrfTokenHash = this.createCsrfTokenHash(csrfToken);
    if (parsedCookie.csrfTokenHash !== expectedCsrfTokenHash)
      throw new Error("Invalid CSRF cookie token hash");
    if (csrfToken !== parsedCookie.csrfToken)
      throw new Error("Invalid CSRF token");
  }

  validateCsrfTokenWithReq(input: { csrfToken: string; req: NextApiRequest }) {
    const { csrfToken, req } = input;
    const csrfCookie = req.cookies[this.cookieName] ?? "";
    this.validateCsrfToken({ csrfToken, csrfCookie });
  }
}
