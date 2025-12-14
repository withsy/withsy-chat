import { randomBytes } from "node:crypto";
import type { Tx } from "../db/db";
import { isExpectedUniqueConstraintViolation } from "../error";
import type { ApiKeyModel } from "../generated/prisma/models";
import { retry } from "../retry";

function generateApiKey() {
  const random = randomBytes(32).toString("base64url");
  return `apikey-${random}`;
}

export class ApiKeyRepo {
  constructor(private readonly tx: Tx) {}

  async create(): Promise<ApiKeyModel> {
    return retry(
      async () => {
        const entity = await this.tx.apiKey.create({
          data: {
            apiKey: generateApiKey(),
          },
        });
        return entity;
      },
      {
        condition: (e) => isExpectedUniqueConstraintViolation(e, ["api_key"]),
      }
    );
  }

  async validate(input: { apiKey: string }) {
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
