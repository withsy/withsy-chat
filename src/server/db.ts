import { Chats } from "./db/chats";
import { Users } from "./db/users";

export const db = {
  user: new Users(),
  chat: new Chats(),
};
