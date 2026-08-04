-- Reverse 015_escalation_columns.sql

alter table escalations
  drop column if exists assigned_to,
  drop column if exists status;
