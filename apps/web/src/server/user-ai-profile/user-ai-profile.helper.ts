import type { UserId } from "@/types/user";

export class UserAiProfileHelper {
  createImagePath(input: { userId: UserId; fileName: string }): string {
    const { userId, fileName } = input;
    return `${userId}/${fileName}`;
  }

  createImageSource(input: { imagePath: string }): string {
    const { imagePath } = input;
    const parts = imagePath.split("/"); // e.g.) <userId>/<fileName>
    const fileName = parts.at(1) ?? "";
    const imageSource = fileName ? `/api/ai-profiles/${fileName}` : "";
    return imageSource;
  }
}
