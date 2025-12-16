import { randomBytes } from "node:crypto";
import { Tx } from "src/db/db.host";
import { retry } from "src/retry";
import { isExpectedUniqueConstraintViolation } from "../error";
import type { ApiKeyModel } from "../generated/prisma/models";

function generateApiKey() {
  const random = randomBytes(32).toString("base64url");
  return `apikey-${random}`;
}

export class ApiKeyRepo {
  constructor(private readonly tx: Tx) {}

  async create(): Promise<ApiKeyModel> {
    return await retry(
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

  async validate(input: { apiKey: string }): Promise<boolean> {
    const { apiKey } = input;

    const entity = await this.tx.apiKey.findUnique({
      where: {
        apiKey,
      },
      select: {
        isEnabled: true,
      },
    });

    return !!entity && entity.isEnabled;
  }
}
