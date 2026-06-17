-- Add approval system for organizations
alter table organizations add column if not exists approved_at timestamptz;
alter table organizations add column if not exists approved_by uuid references users(id);

-- Only super admins can approve orgs
create policy "org_approve" on organizations for update using (
  auth.uid() in (select user_id from memberships where role = 'super_admin')
);

-- Seed a default super admin (run manually after first user registers)
-- insert into memberships (user_id, organization_id, role) values ('<user-uuid>', '<org-uuid>', 'super_admin');
