/*
  Warnings:

  - Added the required column `is_public` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "is_public" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "image" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "language" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Buddy',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "prompts" (
    "id" SERIAL NOT NULL,
    "chat_id" UUID NOT NULL,
    "prompt_template_id" UUID,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_templates" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "is_starred" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "prompt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gratitude_journal" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "chat_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gratitude_journal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prompts_chat_id_idx" ON "prompts"("chat_id");

-- CreateIndex
CREATE INDEX "prompts_prompt_template_id_idx" ON "prompts"("prompt_template_id");

-- CreateIndex
CREATE INDEX "prompt_templates_user_id_idx" ON "prompt_templates"("user_id");

-- CreateIndex
CREATE INDEX "gratitude_journal_user_id_idx" ON "gratitude_journal"("user_id");

-- CreateIndex
CREATE INDEX "gratitude_journal_chat_id_idx" ON "gratitude_journal"("chat_id");

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_prompt_template_id_fkey" FOREIGN KEY ("prompt_template_id") REFERENCES "prompt_templates"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prompt_templates" ADD CONSTRAINT "prompt_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gratitude_journal" ADD CONSTRAINT "gratitude_journal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gratitude_journal" ADD CONSTRAINT "gratitude_journal_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
