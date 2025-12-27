import { Injectable } from "@nestjs/common";
import { RawUserPreferences } from "@repo/common";
import { UserModel } from "../generated/prisma/models.js";
import { UserData } from "./user-schemas.js";

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
