INSERT INTO users(id)
  VALUES ('b24c885e-a501-4882-938b-f5fb16cbd395');

INSERT INTO user_link_accounts(user_id, provider, provider_account_id)
  VALUES ('b24c885e-a501-4882-938b-f5fb16cbd395', 'credentials', 'withsy-dev');

INSERT INTO user_usage_limits(user_id, daily_remaining, daily_reset_at, minute_remaining, minute_reset_at) 
  VALUES ('b24c885e-a501-4882-938b-f5fb16cbd395', 10, date_trunc('day', NOW() + interval '1 day'), 15, NOW() + interval '1 minute');
