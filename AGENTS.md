<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (or the official docs) before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# clinicOS — Guía del proyecto

Sistema integral para **Control Group Salud**, clínica de **medicina sexual** en Argentina
(pacientes hombres 60–90, captados por Facebook/WhatsApp). Trata disfunción eréctil,
eyaculación precoz, déficit de testosterona y Síndrome de Peyronie. Producto core
**FIC** (inyección intracavernosa) en paquetes x1/x3/x6 con plan de pagos.

## Decisiones bloqueadas (no re-preguntar)

1. **Alcance**: construir el sistema completo, en fases, criterio senior.
2. **WhatsApp**: worker Node dedicado always-on (Baileys) en Railway/Fly, con
   abstracción `ChannelProvider` (Meta Cloud API/Facebook después). No en Vercel.
3. **Multitenant-ready, mono-clínica**: `tenant_id` + RLS por tenant + tokens de
   marca por tenant desde el día 1.
4. **HC = registro legal** (Ley 26.529): append-only, auditable, inmutable.
5. **El papel se mantiene**: el paciente/staff llena papel → se **escanea + extrae
   con IA (Claude visión, structured output, humano en el loop)** → autocompleta la
   HCE; el staff corrige lo no detectado. Pilar central, no accesorio.
6. **Firma electrónica avanzada + trazabilidad** (escaneo wet-ink + SHA-256 + ts +
   IP + device + audit append-only; e-sign profesional al cerrar HC).
7. **Arranca de cero**, sin migración, sin deadline duro.

## Roadmap (fases)

`0` Fundaciones ✅ · `1` Pacientes+HCE+Scan-IA · `2` Turnero · `3` Comercial/FIC ·
`4` CRM omnicanal · `5` Marketing/Automatización · `6` Analytics/hardening.

## Arquitectura

- **Next.js 16** (App Router, Server Components, `proxy.ts` con `export const config` —
  NO `proxyConfig`: Next 16.2.6 solo reconoce `config`, con otro nombre el matcher se
  ignora y el proxy corre en TODOS los requests. Cache
  Components donde aplique) · TS strict · Tailwind v4 · shadcn **base-nova (Base UI)** ·
  motion. Deploy → Vercel.
- **Supabase** Postgres+RLS, Auth (invite-only), Storage inmutable, Realtime,
  `pgmq`, `pg_cron`, `pg_net`, `vault`. Proyecto `xxpyblnhedtjtvbhljcy`.
- **Worker** Baileys (Fase 4) en `worker/` — separado, always-on.
- **Claude API** extracción de documentos (Fase 1).

## Restricciones DURAS

- **`workos` schema = INTOCABLE.** Sistema legado aislado del usuario. Nunca leer,
  referenciar ni modificar. clinicOS vive en `public` (+ helpers privados en `clinicos`).
- **`auth.users` es COMPARTIDA.** Solo FK; **no** agregar triggers. Provisión de
  usuarios por **admin client** (service key) seteando `app_metadata`
  `{ tenant_id, role, app:'clinicos' }`. Los signups de clinicOS **nunca** llevan
  `app='workos'`.
- **Autorización siempre desde `app_metadata`** del JWT (helpers
  `clinicos.current_tenant_id()`, `clinicos.current_app_role()`, `clinicos.has_role()`).
  **Jamás `user_metadata`** (editable por el usuario).
- **Datos clínicos append-only.** Correcciones por addendum, nunca overwrite. Todo
  auditado en `public.audit_log` (sin UPDATE/DELETE).
- **Marketing nunca accede a datos clínicos.** Segregación por rol en RLS.
- Tablas de `public` requieren **GRANT explícito** a `authenticated` (desde
  2026-04-28 no se exponen solas). RLS en toda tabla de `public`.
- Funciones SECURITY DEFINER → schema `clinicos` (no expuesto), `set search_path=''`.
- Tras cada DDL: correr **advisors** (security+performance) y arreglar lo propio.
  Iterar con `execute_sql` (MCP); persistir como migración en `supabase/migrations/`.
- `Info/` contiene **PHI/PII real** (HC, DNI). Gitignored. Nunca commitear ni exponer.

## Roles

`owner` `admin` `recepcion` `profesional` `asesor` `comercial` `marketing`
(`src/lib/auth/roles.ts`). Guards: `requireAuth` / `requireTenant` / `requireRole`.

## Convenciones

- Server Components por defecto; `"use client"` solo si hay interactividad.
- shadcn **base-nova usa Base UI**: prop **`render={<X/>}`** (no `asChild`),
  Tooltip usa `delay` (no `delayDuration`).
- `@supabase/ssr`: `auth.getClaims()` (no `getSession()` en server). Env:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_SECRET_KEY` (server-only).
- Zod compartido UI/server/IA. Español (es-AR) en UI y dominio.
- Diseño: blanco + celeste/azul, OKLCH, tokens en `globals.css`, animación con
  propósito, `prefers-reduced-motion` respetado. UX obsesiva = requisito duro.

## Comandos

```bash
pnpm dev            # desarrollo
pnpm build          # build prod (verificar antes de cerrar fase)
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm db:types       # regenerar src/lib/db/database.types.ts (requiere supabase link)
```

Detalles de setup y pasos manuales pendientes → `README.md`.
