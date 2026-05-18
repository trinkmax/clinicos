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

## Datos sensibles

`Info/` contiene **documentación clínica y comercial REAL** (HC, DNI, datos de salud
sexual). Está en `.gitignore` y **nunca** debe versionarse, subirse ni exponerse.
Es solo material de referencia local para el diseño del sistema.

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Desarrollo |
| `pnpm build` | Build de producción (correr antes de cerrar cada fase) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm db:types` | Regenerar tipos TS de Supabase |
