-- CreateTable
CREATE TABLE "api_keys" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_token_key" ON "api_keys"("token");

-- CreateIndex
CREATE INDEX "api_keys_token_idx" ON "api_keys"("token");
