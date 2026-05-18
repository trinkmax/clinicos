import { createLead } from "@/lib/server/whatsapp-ingest";

/**
 * Ingesta de leads de Facebook Lead Ads / Google Lead Forms / genérico.
 *  GET  → handshake (reusa META_VERIFY_TOKEN para suscripción de FB)
 *  POST → crea contacto + atribución. Protegido por LEADS_INGEST_SECRET.
 *
 * Body genérico:
 *  { tenant: "<slug>", source: "facebook"|"google"|"otro",
 *    nombre?, telefono?, email?, utm?: {...} }
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (
    url.searchParams.get("hub.mode") === "subscribe" &&
    url.searchParams.get("hub.verify_token") === process.env.META_VERIFY_TOKEN
  ) {
    return new Response(url.searchParams.get("hub.challenge") ?? "", {
      status: 200,
    });
  }
  return new Response("forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const secret = process.env.LEADS_INGEST_SECRET;
  if (!secret || req.headers.get("x-clinicos-secret") !== secret) {
    return new Response("unauthorized", { status: 401 });
  }

  let body: {
    tenant?: string;
    source?: string;
    nombre?: string;
    telefono?: string;
    email?: string;
    utm?: Record<string, string>;
  };
  try {
    body = await req.json();
  } catch {
    return new Response("bad json", { status: 400 });
  }

  if (!body.tenant) {
    return new Response("falta tenant", { status: 400 });
  }
  const source =
    body.source === "facebook" || body.source === "google"
      ? body.source
      : "otro";

  try {
    const r = await createLead({
      tenantSlug: body.tenant,
      source,
      nombre: body.nombre,
      telefono: body.telefono,
      email: body.email,
      utm: body.utm,
    });
    if (!r.ok) {
      console.error("[webhook/leads] no creado:", r.reason);
      return new Response(r.reason ?? "error", { status: 422 });
    }
  } catch (e) {
    console.error("[webhook/leads] error:", e);
    return new Response("error", { status: 500 });
  }
  return new Response("ok", { status: 200 });
}
