import { Injectable } from "@nestjs/common";
import { DbService } from "../db/db-service.js";
import { IdempotencyKeyRepo } from "../idempotency-key/idempotency-key-repo.js";
import { UserLinkAccountRepo } from "../user-link-account/user-link-account-repo.js";
import { UserEntityMapper } from "./user-entity-mapper.js";
import { UserRepo } from "./user-repo.js";
import {
  UserData,
  UserGet,
  UserId,
  UserSignUpIn,
  UserSignUpInOutput,
  UserUpdate,
} from "./user-schemas.js";

@Injectable()
export class UserService {
  constructor(
    private readonly dbService: DbService,
    private readonly userEntityMapper: UserEntityMapper,
  ) {}

  async signUpIn(input: UserSignUpIn): Promise<UserSignUpInOutput> {
    const { idempotencyKey, provider, providerAccountId } = input;

    return await this.dbService.db.$transaction(async (tx) => {
      const idempotencyKeyRepo = new IdempotencyKeyRepo(tx);
      await idempotencyKeyRepo.create({
        idempotencyKey,
      });

      const userLinkAccountRepo = new UserLinkAccountRepo(tx);
      let userLinkAccount = await userLinkAccountRepo.getByProviderData({
        provider,
        providerAccountId,
      });

      if (!userLinkAccount) {
        const userRepo = new UserRepo(tx);
        const user = await userRepo.create();

        userLinkAccount = await userLinkAccountRepo.create({
          userId: user.id,
          provider,
          providerAccountId,
        });
      }

      const { userId } = userLinkAccount;

      return {
        userId,
      };
    });
  }

  async get(input: UserGet): Promise<UserData> {
    const userRepo = new UserRepo(this.dbService.db);
    const entity = await userRepo.get(input);
    const data = this.userEntityMapper.toData(entity);

    return data;
  }

  async update(userId: UserId, input: UserUpdate): Promise<UserData> {
    const userRepo = new UserRepo(this.dbService.db);
    const entity = await userRepo.update(userId, input);
    const data = this.userEntityMapper.toData(entity);

    return data;
  }
}
