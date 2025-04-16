CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE FUNCTION fn_update_updated_at()
  RETURNS TRIGGER
  AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- alias: u
CREATE TABLE users(
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  preferences jsonb NOT NULL DEFAULT '{}' ::jsonb,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trigger_users_update_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE PROCEDURE fn_update_updated_at();

-- alias: ula
CREATE TABLE user_link_accounts(
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL,
  provider text NOT NULL,
  provider_account_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_link_accounts_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_link_accounts_provider UNIQUE (provider, provider_account_id)
);

-- alias: c
CREATE TABLE chats(
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New chat',
  is_starred boolean NOT NULL DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chats_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER trigger_chats_update_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW
  EXECUTE PROCEDURE fn_update_updated_at();

-- alias: cm
CREATE TABLE chat_messages(
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chat_id uuid NOT NULL,
  role text NOT NULL,
  model text,
  text text,
  status text NOT NULL,
  is_bookmarked boolean NOT NULL DEFAULT FALSE,
  parent_id integer,
  reply_to_id integer,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_messages_chat_id FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  CONSTRAINT check_chat_messages_status CHECK (status IN ('pending', 'processing', 'succeeded', 'failed'))
);

CREATE TRIGGER trigger_chat_messages_update_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE PROCEDURE fn_update_updated_at();

-- alias: cmf
CREATE TABLE chat_message_files(
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chat_message_id integer NOT NULL,
  file_uri text NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_message_files_chat_message_id FOREIGN KEY (chat_message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
);

-- alias: cc
CREATE TABLE chat_chunks(
  chat_message_id integer NOT NULL,
  chunk_index integer NOT NULL,
  text text NOT NULL,
  raw_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (chat_message_id, chunk_index),
  CONSTRAINT fk_chat_chunks_chat_message_id FOREIGN KEY (chat_message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
);

CREATE TRIGGER trigger_chat_chunks_update_updated_at
  BEFORE UPDATE ON chat_chunks
  FOR EACH ROW
  EXECUTE PROCEDURE fn_update_updated_at();

-- alias: ik
CREATE TABLE idempotency_keys(
  key uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

