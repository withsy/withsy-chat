import { z } from "zod";
import type { zInfer } from "./common";

// NOTE: Define it at this location to avoid circular references.
export const ChatId = z.string().uuid();
export type ChatId = zInfer<typeof ChatId>;
