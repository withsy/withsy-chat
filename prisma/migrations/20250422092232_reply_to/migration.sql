/*
  Warnings:

  - You are about to drop the `chat_chunks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "chat_chunks" DROP CONSTRAINT "chat_chunks_chat_message_id_fkey";

-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_parent_message_id_fkey";

-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "reply_to_id" INTEGER;

-- DropTable
DROP TABLE "chat_chunks";

-- CreateTable
CREATE TABLE "chat_message_chunks" (
    "chat_message_id" INTEGER NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "raw_data" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_chunks_pkey" PRIMARY KEY ("chat_message_id","chunk_index")
);

-- CreateIndex
CREATE INDEX "chat_messages_reply_to_id_idx" ON "chat_messages"("reply_to_id");

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_parent_message_id_fkey" FOREIGN KEY ("parent_message_id") REFERENCES "chat_messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "chat_messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chat_message_chunks" ADD CONSTRAINT "chat_message_chunks_chat_message_id_fkey" FOREIGN KEY ("chat_message_id") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
