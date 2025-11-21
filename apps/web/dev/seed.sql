ALTER DATABASE postgres SET timezone TO 'UTC';

-- TODO: fix encrypted
INSERT INTO users(id, name_encrypted, email_encrypted, image_url_encrypted)
  VALUES ('b24c885e-a501-4882-938b-f5fb16cbd395', 'eyJhbGdvcml0aG0iOiJhZXMtMjU2LWdjbSIsIml2RW5jb2RlZCI6IkpNdTdFSW5pd3lEclJEMFQiLCJhdXRoVGFnRW5jb2RlZCI6Ii9EZ2dzanp4RnlvNW9ReEt1YjZjRGc9PSIsImVuY3J5cHRlZEVuY29kZWQiOiJPdVo0SERJPSJ9', 'eyJhbGdvcml0aG0iOiJhZXMtMjU2LWdjbSIsIml2RW5jb2RlZCI6Im0vQjMyU0ZxUk5aejBUY3giLCJhdXRoVGFnRW5jb2RlZCI6Ik9TKysrOWl4NVhwVE5rNnZJZGFxN0E9PSIsImVuY3J5cHRlZEVuY29kZWQiOiIifQ==', 'eyJhbGdvcml0aG0iOiJhZXMtMjU2LWdjbSIsIml2RW5jb2RlZCI6Im0vQjMyU0ZxUk5aejBUY3giLCJhdXRoVGFnRW5jb2RlZCI6Ik9TKysrOWl4NVhwVE5rNnZJZGFxN0E9PSIsImVuY3J5cHRlZEVuY29kZWQiOiIifQ==');

INSERT INTO user_link_accounts(user_id, provider, provider_account_id)
  VALUES ('b24c885e-a501-4882-938b-f5fb16cbd395', 'credentials', 'withsy-dev');

INSERT INTO user_usage_limits(user_id, type, period, allowed_amount, remaining_amount, reset_at) 
  VALUES ('b24c885e-a501-4882-938b-f5fb16cbd395', 'message', 'daily', 30, 30, date_trunc('day', NOW() + interval '1 day'));

INSERT INTO user_usage_limits(user_id, type, period, allowed_amount, remaining_amount, reset_at) 
  VALUES ('b24c885e-a501-4882-938b-f5fb16cbd395', 'message', 'perMinute', 6, 6, date_trunc('minute', NOW() + interval '1 minute'));

INSERT INTO user_usage_limits(user_id, type, period, allowed_amount, remaining_amount, reset_at) 
  VALUES ('b24c885e-a501-4882-938b-f5fb16cbd395', 'aiProfileImage', 'monthly', 10, 10, date_trunc('month', NOW() + interval '1 month'));
