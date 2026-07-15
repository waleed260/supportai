-- Reverse 003_seed_plans.sql
-- Deletes the three seeded plan rows by slug.
-- Skips if any subscription references them (FK will block the delete).

delete from subscription_plans where slug in ('starter', 'growth', 'pro');
