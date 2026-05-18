# clinicOS

Sistema integral de gestión clínica y comunicación para **Control Group Salud**
(medicina sexual). Turnero, Historia Clínica Electrónica legal, comercial/FIC,
CRM omnicanal y automatizaciones de marketing — en un solo sistema.

Stack: **Next.js 16** · **Supabase** (Postgres+RLS multitenant) · TS · Tailwind v4 ·
shadcn (base-nova) · motion. Worker Baileys (Fase 4). Extracción IA con Claude (Fase 1).

> Contexto, decisiones y restricciones del proyecto: ver **`AGENTS.md`**.

## Requisitos

- Node ≥ 22, pnpm 9, Supabase CLI ≥ 2.9
- Proyecto Supabase `xxpyblnhedtjtvbhljcy` (compartido; schema `workos` intocable)

## Setup

```bash
pnpm install
cp .env.example .env.local   # ya viene precargado con URL + publishable key
```

Completar en `.env.local`:

- `SUPABASE_SECRET_KEY` — **obligatorio** para provisión de usuarios.
  Dashboard → Project Settings → API keys → *secret*.
- `ANTHROPIC_API_KEY` — Fase 1 (extracción de documentos).
- `WHATSAPP_WORKER_WEBHOOK_SECRET` — Fase 4.

```bash
pnpm dev    # http://localhost:3000
```

## Base de datos

El schema núcleo (Fase 0) **ya está aplicado** en el proyecto remoto y versionado en
`supabase/migrations/20260518060442_core_multitenant.sql`.

Al linkear el CLI por primera vez, reconciliar el historial (la migración se aplicó
vía MCP `execute_sql`, no por `db push`):

```bash
supabase link --project-ref xxpyblnhedtjtvbhljcy
supabase migration repair --status applied 20260518060442
pnpm db:types     # regenera tipos TS desde el schema vivo
```

## Bootstrap inicial (crear clínica + dueño)

Sin un tenant y un usuario con `app_metadata`, nadie puede pasar `requireTenant`.
Con `SUPABASE_SECRET_KEY` seteada:

```bash
pnpm tsx scripts/bootstrap.ts "Control Group Salud" controlgroup dueño@controlgroup.com
```

Crea el tenant, el usuario `owner` (con `app_metadata = { tenant_id, role:'owner',
app:'clinicos' }`) y su `membership`. Imprime la contraseña temporal.

## Pasos manuales en el Dashboard (verificar)

- [ ] **Auth → Exposed schemas**: `public, workos` (quitar `pm`/`laceleste` si están).
- [ ] **Auth → Password security**: activar *Leaked password protection*
      (advisor `auth_leaked_password_protection`).
- [ ] Borrar bucket de Storage `negros-receipts` (legado, bloqueado por
      `storage.protect_delete()` — hacerlo desde el dashboard).
- [ ] Borrar la edge function `laceleste-signup` (legado).

## Deploy

**Un solo repo, dos destinos.** No hace falta dividir en dos repos: la app Next.js
va a **Vercel** desde la raíz; el worker WhatsApp va a **Railway/Fly** desde
`worker/`. `.vercelignore` excluye `worker/`, `Info/`, `supabase/`, etc. del bundle
de Vercel.

### 1) App → Vercel

**Vía Git (recomendado):** subí el repo a GitHub → vercel.com → *Add New Project* →
importá el repo. Vercel detecta Next.js 16 + pnpm automáticamente.

- **Root Directory:** `.` (la raíz — **no** `worker`).
- **Framework:** Next.js (auto). Build `next build` (auto). Node ≥ 22 (default 24 LTS OK).
- Cada push a `main` = producción; cada PR = preview.

**Vía CLI:**

```bash
pnpm add -g vercel@latest   # la CLI local está desactualizada
vercel login
vercel link                 # UN proyecto Vercel (NO --repo: el worker no es proyecto Vercel)
vercel --prod
```

**Variables de entorno** (Vercel → Settings → Environment Variables, Production +
Preview). Las que NO llevan `NEXT_PUBLIC_` son **solo server**, nunca al browser:

| Variable | Notas |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | público |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | público |
| `SUPABASE_SECRET_KEY` | **server-only** (service_role) |
| `SUPABASE_PROJECT_REF` | server |
| `NEXT_PUBLIC_APP_URL` | el dominio final, p.ej. `https://clinicos.vercel.app` |
| `ANTHROPIC_API_KEY` | **server-only** (extracción IA) |
| `META_VERIFY_TOKEN` / `META_APP_SECRET` | **server-only** (webhook Meta) |
| `LEADS_INGEST_SECRET` | **server-only** |
| `WHATSAPP_WORKER_WEBHOOK_SECRET` | **server-only** |
| `ANTHROPIC_EXTRACTION_MODEL` | opcional (default `claude-sonnet-4-6`) |

### 2) Worker WhatsApp → Railway (o Fly)

Servicio Node **always-on, 1 sola instancia** (Baileys = 1 socket por número; el
auth state vive en `channels.session`, así que reiniciar es seguro).

- Railway → *New Project* → *Deploy from GitHub repo* → **Root Directory: `worker`**.
- Start command: `pnpm start`. Sin escalado horizontal.
- Variables: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY`, opcional
  `OUTBOUND_POLL_MS`.

### 3) Post-deploy

1. Poné `NEXT_PUBLIC_APP_URL` con el dominio real y redeploy.
2. **WhatsApp por QR:** con el worker corriendo, andá a *Ajustes → Conexiones* →
   *Conectar WhatsApp (QR)* y escaneá.
3. **WhatsApp API (Meta):** en Meta, webhook =
   `https://<dominio>/api/webhooks/meta`, campo `messages`, verify token = el valor
   de `META_VERIFY_TOKEN`. La pantalla *Conexiones* muestra la URL lista para copiar.
4. Completar los **pasos manuales del Dashboard de Supabase** (sección de abajo).

> Supabase ya está provisionado (proyecto remoto, migraciones aplicadas). No se
> deploya nada de DB con la app; solo apuntá las env vars al proyecto.

## Datos sensibles

`Info/` contiene **documentación clínica y comercial REAL** (HC, DNI, datos de salud
sexual). Está en `.gitignore` (+ `.vercelignore`) y **nunca** debe versionarse,
subirse ni exponerse. Es solo material de referencia local para el diseño del
sistema.

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Desarrollo |
| `pnpm build` | Build de producción (correr antes de cerrar cada fase) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm db:types` | Regenerar tipos TS de Supabase |
