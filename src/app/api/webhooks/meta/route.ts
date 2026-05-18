import { createHmac, timingSafeEqual } from "node:crypto";

import { ingestCloudInbound } from "@/lib/server/whatsapp-ingest";

/**
 * Webhook de WhatsApp Cloud API (Meta).
 *  GET  → handshake de verificación (hub.challenge)
 *  POST → mensajes entrantes (verifica X-Hub-Signature-256 con el app secret)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("forbidden", { status: 403 });
}

function validSignature(raw: string, header: string | null): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !header) return false;
  const expected =
    "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  return a.length === b.length && timingSafeEqual(a, b);
}

interface MetaValue {
  metadata?: { phone_number_id?: string };
  contacts?: { profile?: { name?: string }; wa_id?: string }[];
  messages?: {
    from?: string;
    id?: string;
    timestamp?: string;
    type?: string;
    text?: { body?: string };
  }[];
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("x-hub-signature-256"))) {
    return new Response("invalid signature", { status: 401 });
  }

  let body: { entry?: { changes?: { value?: MetaValue }[] }[] };
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("bad json", { status: 400 });
  }

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const v = change.value;
      const pnid = v?.metadata?.phone_number_id;
      if (!pnid || !v?.messages) continue;
      const name = v.contacts?.[0]?.profile?.name;
      for (const m of v.messages) {
        if (m.type !== "text" || !m.from || !m.text?.body) continue;
        try {
          await ingestCloudInbound({
            phoneNumberId: pnid,
            fromPhone: m.from,
            fromName: name,
            text: m.text.body,
            providerMsgId: m.id,
            at: m.timestamp
              ? new Date(Number(m.timestamp) * 1000).toISOString()
              : new Date().toISOString(),
          });
        } catch (e) {
          console.error("[webhook/meta] ingest fallido:", e);
        }
      }
    }
  }
  // Meta exige 200 rápido
  return new Response("ok", { status: 200 });
}
