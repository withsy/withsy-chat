import { Injectable } from "@nestjs/common";
import { RawUserPreferences } from "@repo/api-shared";
import { UserModel } from "../generated/prisma/models";
import { UserData } from "./user-schemas";

@Injectable()
export class UserEntityMapper {
  toData(entity: UserModel): UserData {
    const preferences = RawUserPreferences.parse(entity.preferences);

    const data: UserData = {
      id: entity.id,
      preferences,
    };

    return data;
  }
}
