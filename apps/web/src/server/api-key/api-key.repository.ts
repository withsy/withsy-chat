import { randomBytes } from "node:crypto";
import { isExpectedUniqueConstraintViolation } from "../error";
import { retry } from "../retry";
import type { Tx } from "../services/db";

function generateApiKey() {
  const random = randomBytes(32).toString("base64url");
  return `apikey-${random}`;
}

export class ApiKeyRepo {
  constructor(private readonly tx: Tx) {}

  async createApiKey() {
    return retry(
      async () => {
        const res = await this.tx.apiKey.create({
          data: {
            apiKey: generateApiKey(),
          },
        });
        return res;
      },
      {
        condition: (e) => isExpectedUniqueConstraintViolation(e, ["api_key"]),
      }
    );
  }

  async validateApiKey(input: { apiKey: string }) {
    const { apiKey } = input;
    const count = await this.tx.apiKey.count({
      where: {
        apiKey,
        isEnabled: true,
      },
    });
    return count > 0;
  }
}
