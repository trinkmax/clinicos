-- ════════════════════════════════════════════════════════════════════════
--  clinicOS · Maxsex catalog  (Línea OTC de suplementos)
--
--  Dominio separado del FIC clínico: los productos Maxsex son OTC, se venderán
--  vía e-commerce externo (otra consultora desarrolla la storefront y nos pasa
--  la API). clinicOS = source-of-truth interno (catálogo, stock, regulatoria),
--  con campos external_id / synced_at preparados para sincronización futura.
--
--  Patrón heredado: RLS por tenant+rol, audit clinicos.audit(),
--  updated_at via extensions.moddatetime.
-- ════════════════════════════════════════════════════════════════════════

create type public.maxsex_audiencia as enum ('hombre','mujer','unisex');
create type public.maxsex_linea as enum ('active','active_fem','action','action_plus','control');

-- ── Catálogo de productos ─────────────────────────────────────────────────
create table public.maxsex_products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,

  -- Identidad y SEO
  slug text not null,                                       -- url-friendly (active, active-fem…)
  sku  text,                                                -- código interno corto (MXS-ACT-30)
  external_id text,                                         -- ID en la API externa de e-commerce

  -- Línea de marca
  linea public.maxsex_linea not null,
  nombre_corto    text not null,                            -- "MAXSEX ACTIVE"
  nombre_completo text,                                     -- "MAXSEX ACTIVE · POTENCIA TU INTIMIDAD"
  tagline text not null default 'POTENCIA TU INTIMIDAD',

  -- Color de la línea (paleta refinada, no el chillón del folleto)
  color_hex   text not null,                                -- "#1E5BC6"
  color_oklch text not null,                                -- "oklch(0.55 0.18 255)"

  -- Audiencia y problema clínico que resuelve
  audiencia public.maxsex_audiencia not null default 'unisex',
  indicacion_titulo text,                                   -- "Disfunción eréctil"
  indicacion_descripcion text,                              -- texto del folleto

  -- Copy comercial
  descripcion_corta text not null,                          -- card del catálogo (1-2 líneas)
  descripcion_larga text,                                   -- ficha PDP completa
  beneficios text[] not null default '{}',                  -- ["Energía","Vitalidad","Rendimiento"]

  -- Presentación física
  presentacion         text not null default '30 cápsulas',
  unidades_por_envase  int  not null default 30,
  composicion text,                                         -- ingredientes
  modo_uso    text,                                         -- posología
  advertencias text,                                        -- contraindicaciones/disclaimer

  -- Regulatoria ANMAT
  rnpa text,                                                -- registro RNPA cuando lo tengan

  -- Pricing & stock
  precio       numeric(12,2) not null default 0,
  precio_promo numeric(12,2),
  moneda       text not null default 'ARS',
  stock_actual int  not null default 0 check (stock_actual >= 0),
  stock_minimo int  not null default 5  check (stock_minimo >= 0),

  -- Media (URL principal; galería en tabla hermana)
  imagen_principal_url text,

  -- Estado y ordenamiento manual
  activo    boolean not null default true,
  destacado boolean not null default false,
  orden     int     not null default 0,

  -- Sync con e-commerce externo
  synced_at timestamptz,

  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (tenant_id, slug),
  unique (tenant_id, sku)
);
comment on table public.maxsex_products is 'Catálogo OTC línea Maxsex. Source-of-truth interno; se sincroniza al e-commerce externo vía API.';

create index maxsex_prod_tenant_idx     on public.maxsex_products(tenant_id, orden);
create index maxsex_prod_linea_idx      on public.maxsex_products(tenant_id, linea);
create index maxsex_prod_activo_idx     on public.maxsex_products(tenant_id) where activo;
create index maxsex_prod_slug_idx       on public.maxsex_products(slug);
create index maxsex_prod_created_by_idx on public.maxsex_products(created_by);

-- ── Galería de imágenes ──────────────────────────────────────────────────
create table public.maxsex_product_images (
  id uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete restrict,
  product_id uuid not null references public.maxsex_products(id) on delete cascade,
  url text not null,
  alt text,
  orden int not null default 0,
  created_at timestamptz not null default now()
);
create index maxsex_img_product_idx on public.maxsex_product_images(product_id, orden);
create index maxsex_img_tenant_idx  on public.maxsex_product_images(tenant_id);

-- ── updated_at + audit + RLS ─────────────────────────────────────────────
create trigger set_updated_at before update on public.maxsex_products
  for each row execute function extensions.moddatetime(updated_at);

alter table public.maxsex_products       enable row level security;
alter table public.maxsex_product_images enable row level security;

create trigger audit_row after insert or update or delete on public.maxsex_products
  for each row execute function clinicos.audit();
create trigger audit_row after insert or update or delete on public.maxsex_product_images
  for each row execute function clinicos.audit();

grant select, insert, update, delete on public.maxsex_products       to authenticated;
grant select, insert, update, delete on public.maxsex_product_images to authenticated;

-- ── Policies ─────────────────────────────────────────────────────────────
-- Lectura: todo el staff (comercial, marketing, recepción y profesionales informan)
-- Escritura: owner/admin/comercial/marketing
-- Borrado de productos: owner/admin (la imagen sí puede borrarla comercial/marketing)

create policy maxsex_products_select on public.maxsex_products for select to authenticated
  using (tenant_id = clinicos.current_tenant_id()
         and clinicos.has_role('owner','admin','recepcion','profesional','asesor','comercial','marketing'));
create policy maxsex_products_insert on public.maxsex_products for insert to authenticated
  with check (tenant_id = clinicos.current_tenant_id()
              and clinicos.has_role('owner','admin','comercial','marketing'));
create policy maxsex_products_update on public.maxsex_products for update to authenticated
  using (tenant_id = clinicos.current_tenant_id()
         and clinicos.has_role('owner','admin','comercial','marketing'))
  with check (tenant_id = clinicos.current_tenant_id()
              and clinicos.has_role('owner','admin','comercial','marketing'));
create policy maxsex_products_delete on public.maxsex_products for delete to authenticated
  using (tenant_id = clinicos.current_tenant_id()
         and clinicos.has_role('owner','admin'));

create policy maxsex_images_select on public.maxsex_product_images for select to authenticated
  using (tenant_id = clinicos.current_tenant_id()
         and clinicos.has_role('owner','admin','recepcion','profesional','asesor','comercial','marketing'));
create policy maxsex_images_insert on public.maxsex_product_images for insert to authenticated
  with check (tenant_id = clinicos.current_tenant_id()
              and clinicos.has_role('owner','admin','comercial','marketing'));
create policy maxsex_images_update on public.maxsex_product_images for update to authenticated
  using (tenant_id = clinicos.current_tenant_id()
         and clinicos.has_role('owner','admin','comercial','marketing'))
  with check (tenant_id = clinicos.current_tenant_id()
              and clinicos.has_role('owner','admin','comercial','marketing'));
create policy maxsex_images_delete on public.maxsex_product_images for delete to authenticated
  using (tenant_id = clinicos.current_tenant_id()
         and clinicos.has_role('owner','admin','comercial','marketing'));

-- Realtime para refrescar stock/precio en vivo en el catálogo admin
alter publication supabase_realtime add table public.maxsex_products;

-- ── Vista overview (KPI Row del catálogo) ────────────────────────────────
create or replace view public.v_maxsex_overview with (security_invoker = true) as
  select
    tenant_id,
    count(*)::bigint                                       as productos_totales,
    count(*) filter (where activo)::bigint                 as productos_activos,
    coalesce(sum(stock_actual), 0)::bigint                 as stock_total,
    coalesce(sum(stock_actual * precio), 0)::numeric       as valor_inventario,
    count(*) filter (where stock_actual <= stock_minimo)::bigint as productos_bajo_stock,
    count(distinct linea)::bigint                          as lineas_activas
  from public.maxsex_products
  group by tenant_id;
grant select on public.v_maxsex_overview to authenticated;

-- ── Seed: 5 productos línea Maxsex (copy del folleto 2026) ───────────────
do $seed$
declare v_tenant_id uuid;
begin
  select id into v_tenant_id from public.tenants order by created_at limit 1;
  if v_tenant_id is null then return; end if;

  insert into public.maxsex_products (
    tenant_id, slug, sku, linea, nombre_corto, nombre_completo, tagline,
    color_hex, color_oklch, audiencia,
    indicacion_titulo, indicacion_descripcion,
    descripcion_corta, descripcion_larga, beneficios,
    presentacion, unidades_por_envase, composicion, modo_uso, advertencias,
    precio, stock_actual, stock_minimo, activo, destacado, orden
  ) values
  (v_tenant_id,'active','MXS-ACT-30','active','MAXSEX ACTIVE','MAXSEX ACTIVE · Potencia tu intimidad','POTENCIA TU INTIMIDAD',
    '#1E5BC6','oklch(0.55 0.18 255)','unisex',
    'Energía y vitalidad cotidiana',
    'El estilo de vida diario que nos somete a situaciones de estrés y cansancio puede incidir negativamente en nuestro organismo y desempeño íntimo.',
    'Combinación de nutrientes, aminoácidos y vitaminas para sostener la energía y vitalidad sexual diaria en el hombre y la mujer.',
    'MAXSEX ACTIVE es una asociación de nutrientes, aminoácidos, vitaminas y extractos naturales de primera calidad que ayuda a mantener la energía, vitalidad y potencia sexual en el hombre y la mujer; evitando el desgaste producido por la rutina.',
    array['Energía','Vitalidad','Rendimiento'],
    '30 cápsulas',30,
    'Suplemento dietario a base de aminoácidos, vitaminas, minerales y extractos vegetales seleccionados.',
    '1 cápsula diaria con las comidas. Consultar a un profesional de la salud antes de comenzar la suplementación.',
    'Este producto no es un medicamento. Los suplementos dietarios no reemplazan una alimentación variada. No debe consumirse en caso de embarazo, lactancia o tratamiento médico sin consulta previa.',
    18900,24,5,true,true,10),
  (v_tenant_id,'active-fem','MXS-ACTFEM-30','active_fem','MAXSEX ACTIVE FEM','MAXSEX ACTIVE FEM · Potencia tu intimidad','POTENCIA TU INTIMIDAD',
    '#C9295E','oklch(0.55 0.19 0)','mujer',
    'Bienestar femenino integral',
    'El estrés, la dieta deficiente, la vida sedentaria y la ansiedad generan estragos en el bienestar femenino.',
    'Cuidadosa combinación de nutrientes y extractos vegetales pensada para la energía, el deseo y el estado de ánimo en la mujer.',
    'MAXSEX ACTIVE FEM es una cuidadosa combinación de nutrientes, extractos naturales y minerales que contribuye a mejorar la energía, el deseo sexual, el estado de ánimo y el bienestar general de la mujer.',
    array['Energía','Bienestar','Vitalidad'],
    '30 cápsulas',30,
    'Suplemento dietario a base de vitaminas, minerales y extractos vegetales formulado específicamente para mujeres.',
    '1 cápsula diaria con las comidas. Consultar a un profesional de la salud antes de comenzar la suplementación.',
    'No debe consumirse durante el embarazo o la lactancia. Los suplementos dietarios no reemplazan una alimentación variada.',
    18900,18,5,true,false,20),
  (v_tenant_id,'action','MXS-ACTN-30','action','MAXSEX ACTION','MAXSEX ACTION · Potencia tu intimidad','POTENCIA TU INTIMIDAD',
    '#E37A2B','oklch(0.7 0.16 50)','hombre',
    'Disfunción eréctil',
    'La disfunción eréctil se define como la incapacidad persistente o recurrente para lograr y mantener una erección suficiente para una actividad sexual satisfactoria.',
    'Para mejorar el flujo sanguíneo, la energía y potenciar el deseo en hombres con dificultades de erección.',
    'MAXSEX ACTION es una combinación de nutrientes, extractos y minerales seleccionados por su capacidad para mejorar el flujo de sangre, aumentar la energía y potenciar el deseo sexual, favoreciendo el rendimiento tanto en la actividad física como mental.',
    array['Energía','Potencia','Líbido'],
    '30 cápsulas',30,
    'Suplemento dietario a base de aminoácidos, vitaminas, minerales y extractos vegetales con afinidad vascular.',
    '1 cápsula diaria con las comidas, preferentemente por la mañana. Consultar a un profesional de la salud antes de iniciar la suplementación.',
    'No reemplaza el tratamiento médico de la disfunción eréctil. Consultar si toma medicación cardiovascular o nitratos.',
    21900,22,5,true,true,30),
  (v_tenant_id,'action-plus','MXS-ACTNPLUS-30','action_plus','MAXSEX ACTION PLUS','MAXSEX ACTION PLUS · Potencia tu intimidad','POTENCIA TU INTIMIDAD',
    '#B8911E','oklch(0.7 0.13 85)','hombre',
    'Máximo desempeño sexual',
    'Para hombres que buscan llevar el rendimiento un paso más allá: erección más firme, mayor resistencia y un desempeño consistente.',
    'Fórmula avanzada con aminoácidos y vitaminas para circulación, erección y resistencia sexual prolongada.',
    'Esta combinación de aminoácidos y vitaminas es esencial para ayudar a mantener una adecuada circulación sanguínea, mayor erección y resistencia sexual, ayudando a mejorar la acción y desempeño para una vida sexual más plena y satisfactoria.',
    array['Circulación','Rendimiento','Desempeño'],
    '30 cápsulas',30,
    'Suplemento dietario a base de aminoácidos, vitaminas, minerales y extractos vegetales de alta concentración.',
    '1 cápsula diaria, preferentemente con la comida principal. Consultar a un profesional de la salud antes de iniciar la suplementación.',
    'No reemplaza tratamientos médicos. Si toma medicación cardiovascular, antihipertensivos o anticoagulantes, consulte antes de usar.',
    26900,16,5,true,false,40),
  (v_tenant_id,'control','MXS-CTRL-30','control','MAXSEX CONTROL','MAXSEX CONTROL · Potencia tu intimidad','POTENCIA TU INTIMIDAD',
    '#C42B36','oklch(0.55 0.21 25)','hombre',
    'Eyaculación precoz',
    'La eyaculación precoz es la incapacidad persistente y recurrente de controlar la eyaculación cuando se quiere durante la relación sexual.',
    'Alternativa natural para mejorar el control de la eyaculación y aumentar la resistencia.',
    'MAXSEX CONTROL es una excelente alternativa natural que ayuda a mejorar el control de la eyaculación y aumentar la resistencia sexual; permitiendo disfrutar plenamente cada encuentro.',
    array['Control','Resistencia','Confianza'],
    '30 cápsulas',30,
    'Suplemento dietario a base de extractos vegetales, vitaminas y minerales con efecto modulador.',
    '1 cápsula diaria con las comidas. Consultar a un profesional de la salud antes de iniciar la suplementación.',
    'No reemplaza el tratamiento médico. Consultar antes de usar si toma antidepresivos u otros psicofármacos.',
    21900,20,5,true,false,50)
  on conflict (tenant_id, slug) do nothing;
end
$seed$;
