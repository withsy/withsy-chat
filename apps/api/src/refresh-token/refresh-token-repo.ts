import { Tx } from "src/db/db.service";

export class RefreshTokenRepo {
  constructor(private readonly tx: Tx) {}

  async upsert(input: {
    provider: string;
    providerAccountId: string;
    refreshToken: string;
  }) {
    const { provider, providerAccountId, refreshToken } = input;

    await this.tx.$executeRaw`
INSERT INTO refresh_tokens (
  provider, provider_account_id, refresh_token, updated_at
) VALUES (
  ${provider}, ${providerAccountId}, ${refreshToken}, NOW()
) ON CONFLICT (
  provider, provider_account_id
) DO UPDATE
    refresh_token = EXCLUDED.refresh_token,
    updated_at = NOW();
`;
  }
}
