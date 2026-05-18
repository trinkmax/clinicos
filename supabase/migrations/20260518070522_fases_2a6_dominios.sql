-- ════════════════════════════════════════════════════════════════════════
--  clinicOS · Fases 2–6  (Turnero · Comercial/FIC · CRM · Marketing · Vistas)
--  Patrones: RLS por tenant+rol, audit clinicos.audit(), updated_at moddatetime.
--  Políticas de escritura separadas por acción (sin FOR ALL → sin solापe SELECT).
-- ════════════════════════════════════════════════════════════════════════

-- ── Enums ──
create type public.appt_tipo as enum ('primera_vez','control','segunda_mas');
create type public.appt_modalidad as enum ('presencial','videollamada');
create type public.appt_estado as enum ('programado','confirmado','presente','atendido','ausente','cancelado');
create type public.plan_estado as enum ('activo','completado','cancelado','en_mora');
create type public.followup_tipo as enum ('control_15','control_30','control_60','adherencia');
create type public.followup_estado as enum ('pendiente','hecho','omitido','reprogramado');
create type public.stock_mov as enum ('entrada','salida','ajuste');
create type public.channel_tipo as enum ('whatsapp_baileys','whatsapp_cloud','facebook','instagram','manual');
create type public.channel_estado as enum ('conectado','desconectado','error','pendiente');
create type public.contact_fuente as enum ('facebook','whatsapp','google','referido','walk_in','otro');
create type public.contact_etapa as enum ('lead','contactado','consulta_agendada','paciente','en_tratamiento','seguimiento','alta','reactivacion','perdido');
create type public.msg_dir as enum ('in','out');
create type public.msg_estado as enum ('pendiente','enviado','entregado','leido','fallido');
create type public.conv_estado as enum ('abierta','pendiente','cerrada');
create type public.campaign_estado as enum ('borrador','programada','enviando','enviada','pausada','cancelada');

-- ── Fase 2 · Turnero ──
create table public.availability_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  profesional_id uuid references auth.users(id),
  dia_semana int not null check (dia_semana between 0 and 6),
  hora_inicio time not null, hora_fin time not null,
  slot_min int not null default 45, activo boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index avail_tenant_idx on public.availability_templates(tenant_id, dia_semana);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  patient_id uuid references public.patients(id) on delete set null,
  episode_id uuid references public.clinical_episodes(id) on delete set null,
  profesional_id uuid references auth.users(id),
  fecha date not null, hora time not null, duracion_min int not null default 45,
  tipo public.appt_tipo not null default 'primera_vez',
  modalidad public.appt_modalidad not null default 'presencial',
  estado public.appt_estado not null default 'programado',
  abono boolean not null default false, virtual_flexible boolean not null default false,
  nombre_contacto text, telefono_contacto text, notas text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index appt_tenant_fecha_idx on public.appointments(tenant_id, fecha);
create index appt_prof_fecha_idx on public.appointments(tenant_id, profesional_id, fecha);
create index appt_patient_idx on public.appointments(patient_id);
create index appt_episode_idx on public.appointments(episode_id);

-- ── Fase 3 · Comercial / FIC ──
create table public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  codigo text not null, nombre text not null,
  precio numeric(12,2) not null default 0, aplicaciones int not null default 1,
  activo boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (tenant_id, codigo)
);
create table public.treatment_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  episode_id uuid references public.clinical_episodes(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  descripcion text, costo_total numeric(12,2) not null default 0,
  cant_aplicaciones int not null default 0, inicio date, fin date,
  profesional_id uuid references auth.users(id),
  estado public.plan_estado not null default 'activo', notas text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index plans_patient_idx on public.treatment_plans(tenant_id, patient_id);
create index plans_product_idx on public.treatment_plans(product_id);
create index plans_episode_idx on public.treatment_plans(episode_id);
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  plan_id uuid not null references public.treatment_plans(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete restrict,
  fecha date not null default current_date, importe numeric(12,2) not null,
  medio text, comprobante_doc_id uuid references public.patient_documents(id) on delete set null,
  notas text, created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index pay_plan_idx on public.payments(plan_id);
create index pay_patient_idx on public.payments(tenant_id, patient_id);
create index pay_comprobante_idx on public.payments(comprobante_doc_id);
create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  plan_id uuid references public.treatment_plans(id) on delete set null,
  patient_id uuid not null references public.patients(id) on delete restrict,
  fecha date not null default current_date, cantidad int not null default 1,
  detalle text, created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index del_plan_idx on public.deliveries(plan_id);
create index del_patient_idx on public.deliveries(tenant_id, patient_id);
create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  product_id uuid references public.products(id) on delete set null,
  nombre text not null, unidad text not null default 'aplicación',
  stock numeric(12,2) not null default 0, minimo numeric(12,2) not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index inv_tenant_idx on public.inventory_items(tenant_id);
create index inv_product_idx on public.inventory_items(product_id);
create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  tipo public.stock_mov not null, cantidad numeric(12,2) not null,
  ref_delivery_id uuid references public.deliveries(id) on delete set null,
  motivo text, created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index sm_item_idx on public.stock_movements(item_id, created_at desc);
create index sm_tenant_idx on public.stock_movements(tenant_id);
create index sm_delivery_idx on public.stock_movements(ref_delivery_id);
create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  episode_id uuid references public.clinical_episodes(id) on delete set null,
  plan_id uuid references public.treatment_plans(id) on delete set null,
  tipo public.followup_tipo not null, due_date date not null,
  estado public.followup_estado not null default 'pendiente',
  canal text, resultado text, done_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index fu_tenant_due_idx on public.follow_ups(tenant_id, due_date) where estado = 'pendiente';
create index fu_patient_idx on public.follow_ups(tenant_id, patient_id);
create index fu_plan_idx on public.follow_ups(plan_id);
create index fu_episode_idx on public.follow_ups(episode_id);

-- ── Fase 4 · CRM omnicanal ──
create table public.channels (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  tipo public.channel_tipo not null, nombre text not null,
  estado public.channel_estado not null default 'pendiente',
  config jsonb not null default '{}'::jsonb, session jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index channels_tenant_idx on public.channels(tenant_id);
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  patient_id uuid references public.patients(id) on delete set null,
  nombre text, telefono text, email text,
  fuente public.contact_fuente not null default 'whatsapp',
  etapa public.contact_etapa not null default 'lead',
  tags text[] not null default '{}', asignado_a uuid references auth.users(id),
  notas text, last_message_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index contacts_tenant_idx on public.contacts(tenant_id, etapa);
create index contacts_patient_idx on public.contacts(patient_id);
create index contacts_phone_idx on public.contacts(tenant_id, telefono);
create index contacts_asignado_idx on public.contacts(asignado_a);
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete set null,
  estado public.conv_estado not null default 'abierta',
  asignado_a uuid references auth.users(id), unread int not null default 0,
  last_message_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index conv_tenant_idx on public.conversations(tenant_id, estado, last_message_at desc);
create index conv_contact_idx on public.conversations(contact_id);
create index conv_channel_idx on public.conversations(channel_id);
create index conv_asignado_idx on public.conversations(asignado_a);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  direccion public.msg_dir not null, tipo text not null default 'text',
  contenido text, media_path text, provider_msg_id text,
  estado public.msg_estado not null default 'enviado',
  sent_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index msg_conv_idx on public.messages(conversation_id, created_at);
create index msg_tenant_idx on public.messages(tenant_id, created_at desc);
create index msg_contact_idx on public.messages(contact_id);
create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  nombre text not null, categoria text not null default 'respuesta_rapida',
  cuerpo text not null, variables jsonb not null default '[]'::jsonb,
  activo boolean not null default true, created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index tpl_tenant_idx on public.message_templates(tenant_id, categoria);

-- ── Fase 5 · Marketing & Automatización ──
create table public.segments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  nombre text not null, descripcion text, definicion jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index seg_tenant_idx on public.segments(tenant_id);
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  nombre text not null, segment_id uuid references public.segments(id) on delete set null,
  template_id uuid references public.message_templates(id) on delete set null,
  canal public.channel_tipo not null default 'whatsapp_baileys',
  estado public.campaign_estado not null default 'borrador',
  scheduled_at timestamptz, stats jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index camp_tenant_idx on public.campaigns(tenant_id, estado);
create index camp_segment_idx on public.campaigns(segment_id);
create index camp_template_idx on public.campaigns(template_id);
create table public.automations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  nombre text not null, trigger jsonb not null default '{}'::jsonb,
  acciones jsonb not null default '[]'::jsonb, activo boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index auto_tenant_idx on public.automations(tenant_id) where activo;
create table public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  automation_id uuid not null references public.automations(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  patient_id uuid references public.patients(id) on delete set null,
  estado text not null default 'pendiente', log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index ar_auto_idx on public.automation_runs(automation_id, created_at desc);
create index ar_tenant_idx on public.automation_runs(tenant_id);
create index ar_contact_idx on public.automation_runs(contact_id);
create index ar_patient_idx on public.automation_runs(patient_id);
create table public.ad_sources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  plataforma text not null, nombre text not null,
  config jsonb not null default '{}'::jsonb, activo boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index ads_tenant_idx on public.ad_sources(tenant_id);
create table public.attribution (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  contact_id uuid references public.contacts(id) on delete set null,
  patient_id uuid references public.patients(id) on delete set null,
  fuente public.contact_fuente not null, utm jsonb not null default '{}'::jsonb,
  costo numeric(12,2) not null default 0, ingreso numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);
create index attr_tenant_idx on public.attribution(tenant_id, fuente);
create index attr_contact_idx on public.attribution(contact_id);
create index attr_patient_idx on public.attribution(patient_id);

-- ── updated_at + audit + RLS enable ──
do $$ declare t text; begin
  foreach t in array array['availability_templates','appointments','products','treatment_plans',
    'inventory_items','follow_ups','channels','contacts','conversations','message_templates',
    'segments','campaigns','automations','ad_sources'] loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function extensions.moddatetime(updated_at)', t);
  end loop;
  foreach t in array array['availability_templates','appointments','products','treatment_plans',
    'payments','deliveries','inventory_items','stock_movements','follow_ups','channels','contacts',
    'conversations','messages','message_templates','segments','campaigns','automations',
    'automation_runs','ad_sources','attribution'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create trigger audit_row after insert or update or delete on public.%I for each row execute function clinicos.audit()', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- ── RLS policies (SELECT + INSERT/UPDATE/DELETE separados) ──
-- Turnero: lectura op+comercial; gestión owner/admin/recepción/profesional
create policy avail_select on public.availability_templates for select to authenticated
  using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','recepcion','profesional','asesor','comercial'));
create policy avail_insert on public.availability_templates for insert to authenticated
  with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'));
create policy avail_update on public.availability_templates for update to authenticated
  using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'))
  with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'));
create policy avail_delete on public.availability_templates for delete to authenticated
  using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'));

create policy appt_select on public.appointments for select to authenticated
  using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','recepcion','profesional','asesor','comercial'));
create policy appt_insert on public.appointments for insert to authenticated
  with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','recepcion','profesional'));
create policy appt_update on public.appointments for update to authenticated
  using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','recepcion','profesional'))
  with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','recepcion','profesional'));

-- Comercial: lectura owner/admin/comercial/profesional/recepción; escritura owner/admin/comercial
do $$ declare t text; begin
  foreach t in array array['products','treatment_plans','payments','deliveries','inventory_items','stock_movements','follow_ups'] loop
    execute format($p$create policy %1$s_select on public.%1$I for select to authenticated
      using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','comercial','profesional','recepcion'))$p$, t);
    execute format($p$create policy %1$s_insert on public.%1$I for insert to authenticated
      with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','comercial'))$p$, t);
    execute format($p$create policy %1$s_update on public.%1$I for update to authenticated
      using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','comercial'))
      with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','comercial'))$p$, t);
    execute format($p$create policy %1$s_delete on public.%1$I for delete to authenticated
      using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','comercial'))$p$, t);
  end loop;
end $$;

-- CRM: owner/admin/marketing/comercial/recepción
do $$ declare t text; begin
  foreach t in array array['contacts','conversations','messages','message_templates'] loop
    execute format($p$create policy %1$s_select on public.%1$I for select to authenticated
      using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','marketing','comercial','recepcion'))$p$, t);
    execute format($p$create policy %1$s_insert on public.%1$I for insert to authenticated
      with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','marketing','comercial','recepcion'))$p$, t);
    execute format($p$create policy %1$s_update on public.%1$I for update to authenticated
      using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','marketing','comercial','recepcion'))
      with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','marketing','comercial','recepcion'))$p$, t);
  end loop;
end $$;
create policy channels_select on public.channels for select to authenticated
  using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','marketing'));
create policy channels_insert on public.channels for insert to authenticated
  with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'));
create policy channels_update on public.channels for update to authenticated
  using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'))
  with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'));
create policy channels_delete on public.channels for delete to authenticated
  using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'));

-- Marketing: lectura owner/admin/marketing/comercial; escritura owner/admin/marketing; delete owner/admin
do $$ declare t text; begin
  foreach t in array array['segments','campaigns','automations','automation_runs','ad_sources','attribution'] loop
    execute format($p$create policy %1$s_select on public.%1$I for select to authenticated
      using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','marketing','comercial'))$p$, t);
    execute format($p$create policy %1$s_insert on public.%1$I for insert to authenticated
      with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','marketing'))$p$, t);
    execute format($p$create policy %1$s_update on public.%1$I for update to authenticated
      using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','marketing'))
      with check (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin','marketing'))$p$, t);
    execute format($p$create policy %1$s_delete on public.%1$I for delete to authenticated
      using (tenant_id = clinicos.current_tenant_id() and clinicos.has_role('owner','admin'))$p$, t);
  end loop;
end $$;

-- Realtime (tableros en vivo)
alter publication supabase_realtime add table public.appointments;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;

-- ── Fase 6 · Vistas analytics (security_invoker → respeta RLS) ──
create or replace view public.v_patient_funnel with (security_invoker = true) as
  select tenant_id, status, count(*)::bigint as total
  from public.patients group by tenant_id, status;
create or replace view public.v_revenue_by_product with (security_invoker = true) as
  select tp.tenant_id, pr.codigo as producto, count(distinct tp.id)::bigint as planes,
         coalesce(sum(pay.importe),0)::numeric as cobrado,
         coalesce(sum(tp.costo_total),0)::numeric as facturado
  from public.treatment_plans tp
  left join public.products pr on pr.id = tp.product_id
  left join public.payments pay on pay.plan_id = tp.id
  group by tp.tenant_id, pr.codigo;
create or replace view public.v_followups_pendientes with (security_invoker = true) as
  select tenant_id, tipo, count(*)::bigint as total,
         count(*) filter (where due_date < current_date)::bigint as vencidos
  from public.follow_ups where estado = 'pendiente' group by tenant_id, tipo;
grant select on public.v_patient_funnel, public.v_revenue_by_product,
  public.v_followups_pendientes to authenticated;
