import { randomBytes } from "node:crypto";
import type { Tx } from "../services/db";
import { isExpectedUniqueConstraintViolation } from "../error";
import { retry } from "../retry";

function generateApiKeyToken() {
  const random = randomBytes(32).toString("base64url");
  return `apikey-${random}`;
}

export class ApiKeyRepository {
  constructor(private readonly tx: Tx) {}

  async create() {
    return retry(
      async () => {
        const res = await this.tx.apiKey.create({
          data: {
            token: generateApiKeyToken(),
          },
        });
        return res;
      },
      {
        condition: (e) => isExpectedUniqueConstraintViolation(e, ["token"]),
      }
    );
  }

  async validate(input: { token: string }) {
    const { token } = input;
    const count = await this.tx.apiKey.count({
      where: {
        token,
        isEnabled: true,
      },
    });
    return count > 0;
  }
}
