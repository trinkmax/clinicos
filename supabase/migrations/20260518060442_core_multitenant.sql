-- ════════════════════════════════════════════════════════════════════════
--  clinicOS · Núcleo multitenant  (Fase 0 · Fundaciones)
--
--  Convenciones del proyecto:
--   · public   = objetos clinicOS (esquema EXPUESTO al Data API)
--   · clinicos = helpers privados / SECURITY DEFINER (NO expuesto)
--   · workos   = sistema legado AISLADO del usuario → JAMÁS referenciar/tocar
--   · auth.users es COMPARTIDA: solo se referencia por FK, no se le agregan
--     triggers (la provisión de usuarios va por admin client, set app_metadata)
--   · Autorización SIEMPRE desde app_metadata del JWT, nunca user_metadata
-- ════════════════════════════════════════════════════════════════════════

create schema if not exists clinicos;
comment on schema clinicos is 'clinicOS: funciones privadas/SECURITY DEFINER (NO expuesto vía Data API).';

-- ── Helpers de identidad (leen el JWT app_metadata; jamás user_metadata) ──
create or replace function clinicos.current_tenant_id()
returns uuid language sql stable set search_path = '' as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'tenant_id', '')::uuid
$$;

create or replace function clinicos.current_app_role()
returns text language sql stable set search_path = '' as $$
  select auth.jwt() -> 'app_metadata' ->> 'role'
$$;

create or replace function clinicos.has_role(variadic roles text[])
returns boolean language sql stable set search_path = '' as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = any(roles)
$$;

-- ── Auditoría append-only (SECURITY DEFINER → escribe aunque el rol no pueda) ──
create or replace function clinicos.audit()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_tenant uuid;
  v_entity_id text;
begin
  if tg_op = 'DELETE' then
    v_tenant := nullif(to_jsonb(old) ->> 'tenant_id','')::uuid;
    v_entity_id := to_jsonb(old) ->> 'id';
  else
    v_tenant := nullif(to_jsonb(new) ->> 'tenant_id','')::uuid;
    v_entity_id := to_jsonb(new) ->> 'id';
  end if;
  if tg_table_name = 'tenants' then
    v_tenant := coalesce(v_tenant, v_entity_id::uuid);
  end if;

  insert into public.audit_log(
    tenant_id, actor_user_id, actor_role, action, entity_table, entity_id, diff
  ) values (
    v_tenant, auth.uid(), auth.jwt() -> 'app_metadata' ->> 'role',
    lower(tg_op), tg_table_schema || '.' || tg_table_name, v_entity_id,
    case
      when tg_op = 'INSERT' then jsonb_build_object('new', to_jsonb(new))
      when tg_op = 'UPDATE' then jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
      else jsonb_build_object('old', to_jsonb(old))
    end
  );
  return coalesce(new, old);
end;
$$;

-- ─────────────────────────── Tablas núcleo ───────────────────────────────
create table public.tenants (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9-]+$'),
  name        text not null,
  legal_name  text,
  branding    jsonb not null default '{}'::jsonb,   -- logos + overrides de tokens (theming por tenant)
  settings    jsonb not null default '{}'::jsonb,   -- horarios turnero, precios FIC, etc.
  timezone    text not null default 'America/Argentina/Buenos_Aires',
  locale      text not null default 'es-AR',
  status      text not null default 'active' check (status in ('active','suspended')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.tenants is 'Clínicas (tenants). Mono-clínica hoy, multitenant-ready.';

create table public.memberships (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('owner','admin','recepcion','profesional','asesor','comercial','marketing')),
  status      text not null default 'active' check (status in ('active','invited','disabled')),
  full_name   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, user_id)
);
create index memberships_user_idx   on public.memberships(user_id);
create index memberships_tenant_idx on public.memberships(tenant_id);
comment on table public.memberships is 'Vínculo usuario↔tenant↔rol. Fuente de verdad del rol; se replica a app_metadata al provisionar.';

create table public.audit_log (
  id             bigint generated always as identity primary key,
  tenant_id      uuid,
  actor_user_id  uuid,
  actor_role     text,
  action         text not null,
  entity_table   text not null,
  entity_id      text,
  summary        text,
  diff           jsonb,
  ip             inet,
  user_agent     text,
  created_at     timestamptz not null default now()
);
create index audit_log_tenant_created_idx on public.audit_log(tenant_id, created_at desc);
create index audit_log_entity_idx on public.audit_log(entity_table, entity_id);
comment on table public.audit_log is 'Bitácora inmutable (Ley 26.529). Solo escritura por trigger SECURITY DEFINER; sin UPDATE/DELETE.';

-- ─────────────────── updated_at (extensión moddatetime) ──────────────────
create trigger set_updated_at before update on public.tenants
  for each row execute function extensions.moddatetime(updated_at);
create trigger set_updated_at before update on public.memberships
  for each row execute function extensions.moddatetime(updated_at);

-- ─────────────────────────── Auditoría ───────────────────────────────────
create trigger audit_row after insert or update or delete on public.tenants
  for each row execute function clinicos.audit();
create trigger audit_row after insert or update or delete on public.memberships
  for each row execute function clinicos.audit();

-- ──────────────────────────────── RLS ────────────────────────────────────
alter table public.tenants     enable row level security;
alter table public.memberships enable row level security;
alter table public.audit_log   enable row level security;

create policy tenants_select on public.tenants for select to authenticated
  using (id = clinicos.current_tenant_id());
create policy tenants_update on public.tenants for update to authenticated
  using (id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'))
  with check (id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'));

create policy memberships_select on public.memberships for select to authenticated
  using (tenant_id = clinicos.current_tenant_id());
-- Escritura solo owner/admin — separada por acción (evita policies permisivas múltiples en SELECT)
create policy memberships_admin_insert on public.memberships for insert to authenticated
  with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'));
create policy memberships_admin_update on public.memberships for update to authenticated
  using  (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'))
  with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'));
create policy memberships_admin_delete on public.memberships for delete to authenticated
  using  (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'));

create policy audit_select on public.audit_log for select to authenticated
  using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'));

-- ─────────────────────────── Grants explícitos ───────────────────────────
-- (desde 2026-04-28 las tablas de `public` NO se exponen solas al Data API)
grant usage on schema clinicos to authenticated;
grant execute on all functions in schema clinicos to authenticated;

grant select, update on public.tenants to authenticated;                       -- insert/delete: solo sistema (admin client)
grant select, insert, update, delete on public.memberships to authenticated;   -- RLS limita escritura a owner/admin
grant select on public.audit_log to authenticated;
revoke insert, update, delete on public.audit_log from authenticated;
