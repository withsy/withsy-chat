import z from "zod";
import { createListSchemas } from "../common-schemas";

export const MessageId = z.uuid();
export type MessageId = z.infer<typeof MessageId>;

export const MessageData = z.object({
  get id() {
    return MessageId;
  },
});
export type MessageData = z.infer<typeof MessageData>;

const { list, listOutput } = createListSchemas(MessageData);

export const MessageList = list;
export type MessageList = z.infer<typeof MessageList>;

export const MessageListOutput = listOutput;
export type MessageListOutput = z.infer<typeof MessageListOutput>;
