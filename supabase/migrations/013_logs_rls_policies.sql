-- RLS select policies for audit_logs and analytics_events
-- so the Log Explorer panels can read real log data.

-- audit_logs: super_admin sees all; org admins/team see their own org's logs
create policy "audit_logs_select_super_admin" on audit_logs for select using (
  is_super_admin()
);
create policy "audit_logs_select_org" on audit_logs for select using (
  organization_id in (select get_user_organizations())
);

-- analytics_events: super_admin sees all; org members see their own org's events
create policy "analytics_events_select_super_admin" on analytics_events for select using (
  is_super_admin()
);
create policy "analytics_events_select_org" on analytics_events for select using (
  organization_id in (select get_user_organizations())
);
