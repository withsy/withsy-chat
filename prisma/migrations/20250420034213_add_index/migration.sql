-- CreateIndex
CREATE INDEX "chats_parent_message_id_idx" ON "chats"("parent_message_id");

-- CreateIndex
CREATE INDEX "user_link_accounts_user_id_idx" ON "user_link_accounts"("user_id");
