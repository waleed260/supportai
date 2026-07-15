alter table channel_connections
  add column if not exists config jsonb default '{}';

-- Backfill: extract routing identifiers from credentials JSON for any existing rows
-- where credentials is stored as unencrypted JSON (dev mode). Encrypted credentials
-- cannot be backfilled via SQL; those connections must be reconnected.
update channel_connections
  set config = jsonb_build_object(
    'phone_number_id', credentials->>'phone_number_id',
    'page_id', credentials->>'page_id',
    'business_account_id', credentials->>'business_account_id'
  )
  where credentials is not null
    and credentials->>'phone_number_id' is not null
    and (config is null or config = '{}'::jsonb);
