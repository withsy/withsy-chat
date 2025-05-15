import type { NextApiRequest } from "next";
import { createHash } from "node:crypto";
import type { ServiceRegistry } from "../service-registry";

export class NextAuthCsrfService {
  private cookieName: string;

  constructor(private readonly service: ServiceRegistry) {
    const url = new URL(service.env.nextauthUrl);
    const prefix = url.protocol === "https:" ? "__Host-" : "";
    this.cookieName = `${prefix}next-auth.csrf-token`;
  }

  createCsrfTokenHash(csrfToken: string): string {
    const csrfTokenHash = createHash("sha256")
      .update(`${csrfToken}${this.service.env.nextauthSecret}`)
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
