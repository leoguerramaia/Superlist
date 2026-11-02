create table if not exists public.app_settings (
  setting_key text primary key,
  setting_value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.app_settings enable row level security;
revoke all on table public.app_settings from anon, authenticated;
grant all on table public.app_settings to service_role;

insert into public.app_settings (setting_key, setting_value)
values ('ai_provider_order', '["openai","gemini","groq"]'::jsonb)
on conflict (setting_key) do nothing;
