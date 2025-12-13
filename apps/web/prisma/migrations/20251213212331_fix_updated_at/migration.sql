/*
  Warnings:

  - You are about to drop the `gratitude_journals` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `api_keys` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `chats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `user_usage_limits` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `period` on the `user_usage_limits` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "gratitude_journals" DROP CONSTRAINT "gratitude_journals_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "gratitude_journals" DROP CONSTRAINT "gratitude_journals_user_id_fkey";

-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "chat_prompts" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "chats" 
ALTER COLUMN "type" DROP DEFAULT;

ALTER TABLE "chats" 
ALTER COLUMN "type" TYPE TEXT USING ("type"::text),
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "idempotency_infos" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "message_chunks" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "supabase_activities" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;
DROP SEQUENCE "supabase_activities_id_seq";

-- AlterTable
ALTER TABLE "user_ai_profiles" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user_default_prompts" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user_link_accounts" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user_prompts" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user_usage_limits" 
ALTER COLUMN "type" TYPE TEXT USING ("type"::text),
ALTER COLUMN "period" TYPE TEXT USING ("period"::text),
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropTable
DROP TABLE "gratitude_journals";

-- DropEnum
DROP TYPE "ChatType";

-- DropEnum
DROP TYPE "UserUsageLimitPeriod";

-- DropEnum
DROP TYPE "UserUsageLimitType";

-- CreateIndex
DROP INDEX IF EXISTS "user_usage_limits_user_id_type_idx";
CREATE INDEX "user_usage_limits_user_id_type_idx" ON "user_usage_limits"("user_id", "type");

-- CreateIndex
DROP INDEX IF EXISTS "user_usage_limits_user_id_type_period_key";
CREATE UNIQUE INDEX "user_usage_limits_user_id_type_period_key" ON "user_usage_limits"("user_id", "type", "period");

-- AlterTable
ALTER TABLE "user_usage_limits" DROP COLUMN "allowed_amount";
