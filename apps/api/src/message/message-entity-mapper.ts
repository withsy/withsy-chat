import { Injectable } from "@nestjs/common";
import { MessageModel } from "../generated/prisma/models";
import { MessageData } from "./message-schemas";

@Injectable()
export class MessageEntityMapper {
  toData(entity: MessageModel): MessageData {
    const data: MessageData = {
      id: entity.id,
    };

    return data;
  }
}
