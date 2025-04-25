import type { ServiceRegistry } from "../service-registry";
import type { Tx } from "./db";

export class UserService {
  constructor(private readonly service: ServiceRegistry) {}

  static async create(
    tx: Tx,
    input: { name?: string; email?: string; image?: string }
  ) {
    const { name, email, image } = input;
    const res = await tx.user.create({
      data: {
        name,
        email,
        image,
      },
      select: {
        id: true,
      },
    });

    return res;
  }
}
