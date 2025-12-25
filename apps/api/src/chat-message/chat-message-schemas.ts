import z from "zod";
import { createListSchemas } from "../common-schemas";

export const ChatMessageId = z.uuid();
export type ChatMessageId = z.infer<typeof ChatMessageId>;

export const ChatMessageData = z.object({
  get id() {
    return ChatMessageId;
  },
});
export type ChatMessageData = z.infer<typeof ChatMessageData>;

const chatMessageListSchemas = createListSchemas(ChatMessageData);

export const ChatMessageList = chatMessageListSchemas.list;
export type ChatMessageList = z.infer<typeof ChatMessageList>;

export const ChatMessageListOutput = chatMessageListSchemas.listOutput;
export type ChatMessageListOutput = z.infer<typeof ChatMessageListOutput>;
