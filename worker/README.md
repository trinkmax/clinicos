# clinicOS · WhatsApp Worker (Baileys)

Servicio **Node always-on separado** (NO corre en Vercel/serverless: Baileys
necesita un WebSocket persistente). Desplegar en **Railway** o **Fly.io**.

## Cómo funciona

- Descubre canales `channels` con `tipo='whatsapp_baileys'` y abre un socket
  Baileys por canal.
- **Entrantes**: cada mensaje → upsert de `contacts` + `conversations` +
  `messages` (vía service key, siempre filtrando por `tenant_id` del canal).
  El inbox de clinicOS los muestra al instante por Supabase Realtime.
- **Salientes**: poll de `messages` con `estado='pendiente'` y
  `direccion='out'` → los envía por WhatsApp → marca `enviado`/`fallido` +
  `provider_msg_id`.
- **Auth state** persistido en `channels.session` (jsonb, serializado con
  BufferJSON). Reconexión automática salvo logout.
- Abstracción `ChannelProvider` (`src/types.ts`): Meta Cloud API / Facebook
  se enchufan creando otro provider sin tocar el orquestador.

## Setup local

```bash
cd worker
cp .env.example .env            # NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY
pnpm install
pnpm dev
```

Crear el canal una vez (SQL / Ajustes):

```sql
insert into public.channels (tenant_id, tipo, nombre, estado)
values ('<TENANT_ID>', 'whatsapp_baileys', 'WhatsApp principal', 'pendiente');
```

Al arrancar, el worker genera un **QR** (lo loguea y lo guarda en
`channels.config.qr` como data URL para mostrarlo en Ajustes). Escanealo con
el WhatsApp del número de la clínica. Queda `estado='conectado'`.

## Deploy (Railway / Fly)

- Railway: nuevo servicio desde este subdirectorio, start `pnpm start`,
  variables `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY`.
- Mantener **1 instancia** (no escalar horizontal: una sesión Baileys por
  número). Reinicio seguro: el auth state está en la DB.

## Próximo (Meta Cloud API)

Implementar `MetaCloudProvider implements ChannelProvider` y registrarlo en
`index.ts` para canales `tipo='whatsapp_cloud'`. La ingestión/salida usa el
mismo `store.ts`; no cambia el resto del sistema.
