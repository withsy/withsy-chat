/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `user_usage_limits` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `is_public` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ChatType" ADD VALUE 'gratitudeJournal';

-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "user_prompt_id" UUID;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "is_public" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ai_language" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "image" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Buddy',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "user_prompts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_default_prompts" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "user_prompt_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_default_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_prompts" (
    "id" SERIAL NOT NULL,
    "chat_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gratitude_journals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "chat_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gratitude_journals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_prompts_user_id_idx" ON "user_prompts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_default_prompts_user_id_key" ON "user_default_prompts"("user_id");

-- CreateIndex
CREATE INDEX "user_default_prompts_user_id_idx" ON "user_default_prompts"("user_id");

-- CreateIndex
CREATE INDEX "user_default_prompts_user_prompt_id_idx" ON "user_default_prompts"("user_prompt_id");

-- CreateIndex
CREATE INDEX "chat_prompts_chat_id_idx" ON "chat_prompts"("chat_id");

-- CreateIndex
CREATE INDEX "gratitude_journals_user_id_idx" ON "gratitude_journals"("user_id");

-- CreateIndex
CREATE INDEX "gratitude_journals_chat_id_idx" ON "gratitude_journals"("chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_usage_limits_user_id_key" ON "user_usage_limits"("user_id");

-- AddForeignKey
ALTER TABLE "user_prompts" ADD CONSTRAINT "user_prompts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_default_prompts" ADD CONSTRAINT "user_default_prompts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_default_prompts" ADD CONSTRAINT "user_default_prompts_user_prompt_id_fkey" FOREIGN KEY ("user_prompt_id") REFERENCES "user_prompts"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_prompt_id_fkey" FOREIGN KEY ("user_prompt_id") REFERENCES "user_prompts"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chat_prompts" ADD CONSTRAINT "chat_prompts_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gratitude_journals" ADD CONSTRAINT "gratitude_journals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gratitude_journals" ADD CONSTRAINT "gratitude_journals_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
