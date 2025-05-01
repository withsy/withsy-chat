import type { UserAiProfile } from "@/types";
import type { UserId } from "@/types/user";
import type { ServiceRegistry } from "../service-registry";

export class UserAiProfileService {
  constructor(private readonly service: ServiceRegistry) {}

  async update(userId: UserId, input: UserAiProfile.Update) {
    console.log("@", "userId:", userId, "input:", input);
  }
}
