-- Reverse 005_crm_integrations.sql

drop policy if exists "integrations_update" on org_integrations;
drop policy if exists "integrations_insert" on org_integrations;
drop policy if exists "integrations_select" on org_integrations;

drop table if exists org_integrations;
drop type if exists integration_provider;
