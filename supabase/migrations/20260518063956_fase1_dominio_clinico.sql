-- ════════════════════════════════════════════════════════════════════════
--  clinicOS · Fase 1 — Dominio clínico / HCE legal (Ley 26.529)
--  Modelo fiel a los formularios físicos. Contenido clínico profundo en
--  jsonb (validado por Zod en la app); campos consultables como columnas.
--  Append-only: una vez firmado/cerrado, solo addenda (nunca overwrite).
-- ════════════════════════════════════════════════════════════════════════

-- ── unaccent IMMUTABLE (para índice GIN trigram de búsqueda) ──
create or replace function clinicos.f_unaccent(text)
returns text language sql immutable parallel safe strict
set search_path = '' as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, $1)
$$;

-- ── Enums ──
create type public.doc_type as enum (
  'ficha_ingreso','test_psicologico','historia_clinica','consentimiento',
  'datos_comerciales','receta','comprobante_pago','estudio','otro');
create type public.doc_status as enum (
  'uploaded','extracting','extracted','in_review','validated','archived','failed');
create type public.patient_status as enum ('activo','en_tratamiento','alta','inactivo');
create type public.episode_status as enum (
  'intake','evaluacion','diagnostico','tratamiento','seguimiento','alta','baja');
create type public.clinical_status as enum ('draft','signed','closed','amended');
create type public.condicion as enum (
  'disfuncion_erectil','eyaculacion_precoz','deficit_testosterona','peyronie');

-- ── Inmutabilidad clínica (append-only legal) ──
create or replace function clinicos.enforce_immutability()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Registro clínico inmutable: no se puede eliminar (Ley 26.529). Use addenda.';
  end if;
  if old.status <> 'draft' then
    raise exception 'Registro clínico firmado/cerrado: inmutable. Use addenda.';
  end if;
  return new;
end;
$$;

create or replace function clinicos.enforce_append_only()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  raise exception 'Tabla append-only (Ley 26.529): operación % no permitida.', tg_op;
end; $$;

-- ── Pacientes ──
create table public.patients (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete restrict,
  apellido        text not null,
  nombres         text not null,
  dni             text,
  fecha_nacimiento date,
  sexo            text not null default 'M',
  estado_civil    text,
  domicilio       jsonb not null default '{}'::jsonb,
  telefono        text,
  email           text,
  ocupacion       text,
  status          public.patient_status not null default 'activo',
  notas           text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (tenant_id, dni)
);
create index patients_tenant_idx on public.patients(tenant_id);
create index patients_search_idx on public.patients using gin (
  clinicos.f_unaccent(lower(
    coalesce(apellido,'')||' '||coalesce(nombres,'')||' '||
    coalesce(dni,'')||' '||coalesce(telefono,'')
  )) extensions.gin_trgm_ops
);
comment on table public.patients is 'Pacientes (datos personales de la Ficha de Ingreso). PHI sensible.';

-- ── Episodios clínicos ──
create table public.clinical_episodes (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete restrict,
  patient_id    uuid not null references public.patients(id) on delete restrict,
  condiciones   public.condicion[] not null default '{}',
  status        public.episode_status not null default 'intake',
  profesional_id uuid references auth.users(id),
  opened_at     timestamptz not null default now(),
  closed_at     timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index episodes_patient_idx on public.clinical_episodes(tenant_id, patient_id);

-- ── Documentos escaneados (originales inmutables) ──
create table public.patient_documents (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete restrict,
  patient_id    uuid references public.patients(id) on delete set null,
  episode_id    uuid references public.clinical_episodes(id) on delete set null,
  doc_type      public.doc_type not null,
  storage_path  text not null,
  sha256        text not null,
  mime          text not null default 'application/pdf',
  page_count    int,
  bytes         bigint,
  scan_session  uuid,
  status        public.doc_status not null default 'uploaded',
  uploaded_by   uuid references auth.users(id),
  created_at    timestamptz not null default now()
);
create index docs_patient_idx on public.patient_documents(tenant_id, patient_id);
create index docs_status_idx on public.patient_documents(tenant_id, status);
create index docs_episode_idx on public.patient_documents(episode_id);

-- ── Extracciones IA ──
create table public.document_extractions (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete restrict,
  document_id   uuid not null references public.patient_documents(id) on delete cascade,
  doc_type      public.doc_type not null,
  model         text,
  prompt_version text,
  data          jsonb not null default '{}'::jsonb,
  confidence    numeric(4,3),
  field_meta    jsonb not null default '{}'::jsonb,
  status        public.doc_status not null default 'extracting',
  error         text,
  reviewed_by   uuid references auth.users(id),
  reviewed_at   timestamptz,
  validated_by  uuid references auth.users(id),
  validated_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index extractions_doc_idx on public.document_extractions(document_id);
create index extractions_tenant_idx on public.document_extractions(tenant_id);

-- ── Registros clínicos profundos ──
create table public.intake_forms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  episode_id uuid references public.clinical_episodes(id) on delete set null,
  document_id uuid references public.patient_documents(id) on delete set null,
  fecha date,
  sintomas jsonb not null default '{}'::jsonb,
  condiciones jsonb not null default '{}'::jsonb,
  diagnostico text, tratamiento text,
  status public.clinical_status not null default 'draft',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index intake_patient_idx on public.intake_forms(tenant_id, patient_id);
create index intake_episode_idx on public.intake_forms(episode_id);
create index intake_doc_idx on public.intake_forms(document_id);

create table public.psych_tests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  episode_id uuid references public.clinical_episodes(id) on delete set null,
  document_id uuid references public.patient_documents(id) on delete set null,
  fecha date,
  respuestas jsonb not null default '{}'::jsonb,
  asesor_id uuid references auth.users(id),
  status public.clinical_status not null default 'draft',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index psych_patient_idx on public.psych_tests(tenant_id, patient_id);
create index psych_episode_idx on public.psych_tests(episode_id);
create index psych_doc_idx on public.psych_tests(document_id);

create table public.clinical_histories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  episode_id uuid references public.clinical_episodes(id) on delete set null,
  document_id uuid references public.patient_documents(id) on delete set null,
  profesional_id uuid references auth.users(id),
  fecha date,
  datos_personales jsonb not null default '{}'::jsonb,
  motivo_consulta jsonb not null default '{}'::jsonb,
  disfuncion_erectil jsonb not null default '{}'::jsonb,
  eyaculacion_precoz jsonb not null default '{}'::jsonb,
  deseo_sexual jsonb not null default '{}'::jsonb,
  antecedentes jsonb not null default '{}'::jsonb,
  examen_fisico jsonb not null default '{}'::jsonb,
  ecodoppler jsonb not null default '{}'::jsonb,
  estudios jsonb not null default '{}'::jsonb,
  diagnostico text, plan text,
  tratamiento jsonb not null default '[]'::jsonb,
  seguimiento jsonb not null default '[]'::jsonb,
  status public.clinical_status not null default 'draft',
  signed_by uuid references auth.users(id),
  signed_at timestamptz, closed_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index hc_patient_idx on public.clinical_histories(tenant_id, patient_id);
create index hc_episode_idx on public.clinical_histories(episode_id);
create index hc_doc_idx on public.clinical_histories(document_id);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  episode_id uuid references public.clinical_episodes(id) on delete set null,
  document_id uuid references public.patient_documents(id) on delete set null,
  tipo text not null default 'disfuncion_erectil',
  signer_name text, signer_dni text, signed_at timestamptz,
  signature_method text not null default 'wet_ink_scanned',
  sha256 text,
  trazabilidad jsonb not null default '{}'::jsonb,
  status public.clinical_status not null default 'draft',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index consents_patient_idx on public.consents(tenant_id, patient_id);
create index consents_episode_idx on public.consents(episode_id);
create index consents_doc_idx on public.consents(document_id);

create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  episode_id uuid references public.clinical_episodes(id) on delete set null,
  document_id uuid references public.patient_documents(id) on delete set null,
  fecha date,
  contenido jsonb not null default '{}'::jsonb,
  profesional_id uuid references auth.users(id),
  pdf_path text,
  entregada boolean not null default false,
  status public.clinical_status not null default 'draft',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index rx_patient_idx on public.prescriptions(tenant_id, patient_id);
create index rx_episode_idx on public.prescriptions(episode_id);
create index rx_doc_idx on public.prescriptions(document_id);

create table public.clinical_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  episode_id uuid references public.clinical_episodes(id) on delete set null,
  fecha date not null default current_date,
  tipo text not null default 'nota',
  ref_table text, ref_id uuid,
  contenido text not null,
  profesional_id uuid references auth.users(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index notes_patient_idx on public.clinical_notes(tenant_id, patient_id, fecha desc);
create index notes_episode_idx on public.clinical_notes(episode_id);

create table public.signatures (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  entity_table text not null, entity_id uuid not null,
  signer_type text not null, signer_user_id uuid references auth.users(id),
  signer_name text, method text not null,
  payload_sha256 text not null,
  document_id uuid references public.patient_documents(id) on delete set null,
  ip inet, user_agent text, geo jsonb, otp_ref text,
  signed_at timestamptz not null default now()
);
create index signatures_entity_idx on public.signatures(tenant_id, entity_table, entity_id);
create index signatures_doc_idx on public.signatures(document_id);

-- ── Triggers ──
do $$
declare t text;
begin
  foreach t in array array['intake_forms','psych_tests','clinical_histories','consents','prescriptions'] loop
    execute format('create trigger immutability before update or delete on public.%I for each row execute function clinicos.enforce_immutability()', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function extensions.moddatetime(updated_at)', t);
    execute format('create trigger audit_row after insert or update or delete on public.%I for each row execute function clinicos.audit()', t);
  end loop;
  foreach t in array array['clinical_notes','signatures'] loop
    execute format('create trigger append_only before update or delete on public.%I for each row execute function clinicos.enforce_append_only()', t);
    execute format('create trigger audit_row after insert on public.%I for each row execute function clinicos.audit()', t);
  end loop;
  foreach t in array array['patients','clinical_episodes','patient_documents','document_extractions'] loop
    execute format('create trigger audit_row after insert or update or delete on public.%I for each row execute function clinicos.audit()', t);
  end loop;
  foreach t in array array['patients','clinical_episodes','document_extractions'] loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function extensions.moddatetime(updated_at)', t);
  end loop;
end $$;

-- ── RLS + grants ──
do $$
declare t text;
begin
  foreach t in array array['patients','clinical_episodes','patient_documents','document_extractions',
    'intake_forms','psych_tests','clinical_histories','consents','prescriptions','clinical_notes','signatures'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;

  -- Grupo A (operativo): SELECT clínicos+recepción+comercial; escritura clínicos+recepción
  foreach t in array array['patients','clinical_episodes','patient_documents','document_extractions'] loop
    execute format($p$create policy %1$s_select on public.%1$I for select to authenticated
      using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','recepcion','profesional','asesor','comercial'))$p$, t);
    execute format($p$create policy %1$s_insert on public.%1$I for insert to authenticated
      with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','recepcion','profesional','asesor'))$p$, t);
    execute format($p$create policy %1$s_update on public.%1$I for update to authenticated
      using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','recepcion','profesional','asesor'))
      with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','recepcion','profesional','asesor'))$p$, t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;

  -- Grupo B (clínico profundo): solo owner/admin/profesional/asesor
  foreach t in array array['intake_forms','psych_tests','clinical_histories','consents','prescriptions'] loop
    execute format($p$create policy %1$s_select on public.%1$I for select to authenticated
      using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','profesional','asesor'))$p$, t);
    execute format($p$create policy %1$s_insert on public.%1$I for insert to authenticated
      with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','profesional','asesor'))$p$, t);
    execute format($p$create policy %1$s_update on public.%1$I for update to authenticated
      using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','profesional','asesor'))
      with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','profesional','asesor'))$p$, t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
  foreach t in array array['clinical_notes','signatures'] loop
    execute format($p$create policy %1$s_select on public.%1$I for select to authenticated
      using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','profesional','asesor'))$p$, t);
    execute format($p$create policy %1$s_insert on public.%1$I for insert to authenticated
      with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','profesional','asesor'))$p$, t);
    execute format('grant select, insert on public.%I to authenticated', t);
  end loop;
end $$;

-- ── Storage: bucket privado e inmutable para escaneos (PHI) ──
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('patient-documents','patient-documents', false, 31457280,
  array['application/pdf','image/jpeg','image/png','image/webp','image/heic','image/tiff'])
on conflict (id) do update set
  public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists patient_docs_select on storage.objects;
drop policy if exists patient_docs_insert on storage.objects;
create policy patient_docs_select on storage.objects for select to authenticated
using (bucket_id = 'patient-documents'
  and (storage.foldername(name))[1] = clinicos.current_tenant_id()::text
  and clinicos.has_role('owner','admin','recepcion','profesional','asesor'));
create policy patient_docs_insert on storage.objects for insert to authenticated
with check (bucket_id = 'patient-documents'
  and (storage.foldername(name))[1] = clinicos.current_tenant_id()::text
  and clinicos.has_role('owner','admin','recepcion','profesional','asesor'));
