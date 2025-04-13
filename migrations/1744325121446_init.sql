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

CREATE TABLE users(
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  preferences jsonb NOT NULL DEFAULT '{}' ::jsonb,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_users_update_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE PROCEDURE fn_update_updated_at();

CREATE TABLE chats(
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New chat',
  is_starred boolean NOT NULL DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chats_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER trg_chats_update_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW
  EXECUTE PROCEDURE fn_update_updated_at();

CREATE TABLE chat_messages(
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chat_id uuid NOT NULL,
  role text NOT NULL,
  model text,
  text text,
  status text NOT NULL,
  is_bookmarked boolean NOT NULL DEFAULT FALSE,
  parent_id integer,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_messages_chat_id FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  CONSTRAINT chk_chat_messages_status CHECK (status IN ('pending', 'processing', 'succeeded', 'failed'))
);

CREATE TRIGGER trg_chat_messages_update_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE PROCEDURE fn_update_updated_at();

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

CREATE TRIGGER trg_chat_chunks_update_updated_at
  BEFORE UPDATE ON chat_chunks
  FOR EACH ROW
  EXECUTE PROCEDURE fn_update_updated_at();

CREATE TABLE idempotency_keys(
  key uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

