-- Reverse 004_approval_system.sql

drop policy if exists "org_approve" on organizations;

alter table organizations drop column if exists approved_by;
alter table organizations drop column if exists approved_at;
