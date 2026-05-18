-- ════════════════════════════════════════════════════════════════════════
--  clinicOS · Fase 5 — Motor de automatización (controles/adherencia → WhatsApp)
--  Estado final: función privada SECURITY DEFINER en `clinicos`; RPC pública
--  SECURITY INVOKER que chequea rol y delega (advisors limpios).
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists pg_cron;

create or replace function clinicos.process_due_followups(p_tenant uuid default null)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  r record;
  v_contact uuid;
  v_conv uuid;
  v_text text;
  v_count int := 0;
begin
  for r in
    select f.*, p.telefono, p.nombres, p.apellido
    from public.follow_ups f
    join public.patients p on p.id = f.patient_id
    where f.estado = 'pendiente'
      and f.due_date <= current_date
      and (p_tenant is null or f.tenant_id = p_tenant)
      and coalesce(p.telefono,'') <> ''
    limit 500
  loop
    v_text := case r.tipo
      when 'control_15' then format('Hola %s, desde Control Group Salud: te recordamos tu control de los 15 días. ¿Cómo venís con el tratamiento?', r.nombres)
      when 'control_30' then format('Hola %s, control de los 30 días de Control Group Salud. Contanos tu evolución así ajustamos lo que haga falta.', r.nombres)
      when 'control_60' then format('Hola %s, control de los 60 días. En Control Group queremos saber cómo seguís para acompañarte mejor.', r.nombres)
      else format('Hola %s, te escribimos de Control Group para acompañar la adherencia a tu tratamiento. ¿Necesitás algo?', r.nombres)
    end;

    select id into v_contact from public.contacts
      where tenant_id = r.tenant_id and telefono = r.telefono limit 1;
    if v_contact is null then
      insert into public.contacts(tenant_id, patient_id, nombre, telefono, fuente, etapa, last_message_at)
      values (r.tenant_id, r.patient_id, r.apellido||', '||r.nombres, r.telefono, 'whatsapp', 'seguimiento', now())
      returning id into v_contact;
    end if;

    select id into v_conv from public.conversations
      where tenant_id = r.tenant_id and contact_id = v_contact and estado = 'abierta' limit 1;
    if v_conv is null then
      insert into public.conversations(tenant_id, contact_id, estado, last_message_at)
      values (r.tenant_id, v_contact, 'abierta', now())
      returning id into v_conv;
    else
      update public.conversations set last_message_at = now() where id = v_conv;
    end if;

    insert into public.messages(tenant_id, conversation_id, contact_id, direccion, tipo, contenido, estado)
    values (r.tenant_id, v_conv, v_contact, 'out', 'text', v_text, 'pendiente');

    update public.follow_ups
      set estado = 'hecho', resultado = 'Mensaje automático enviado',
          done_at = now(), canal = 'whatsapp'
      where id = r.id;

    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;
revoke execute on function clinicos.process_due_followups(uuid) from public;
grant execute on function clinicos.process_due_followups(uuid) to authenticated;

-- RPC pública SECURITY INVOKER: chequea rol y delega en la función privada
create or replace function public.run_followup_automations()
returns integer language plpgsql security invoker set search_path = '' as $$
declare v int;
begin
  if not clinicos.has_role('owner','admin','marketing') then
    raise exception 'No autorizado';
  end if;
  select clinicos.process_due_followups(clinicos.current_tenant_id()) into v;
  return v;
end;
$$;
revoke execute on function public.run_followup_automations() from public;
revoke execute on function public.run_followup_automations() from anon;
grant execute on function public.run_followup_automations() to authenticated;

-- Job diario 12:00 UTC (~09:00 AR) — todos los tenants
select cron.schedule(
  'clinicos-followups-diario',
  '0 12 * * *',
  $$ select clinicos.process_due_followups() $$
);
