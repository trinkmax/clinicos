import type { Metadata } from "next";

import { listChannels } from "@/lib/data/channels";
import { Connections } from "@/components/settings/connections";

export const metadata: Metadata = { title: "Ajustes · Integraciones" };

export default async function AjustesIntegracionesPage() {
  const channels = await listChannels();

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "https://tu-dominio.com"
  ).replace(/\/$/, "");
  const webhookUrl = `${appUrl}/api/webhooks/meta`;
  const verifyTokenSet = Boolean(process.env.META_VERIFY_TOKEN);

  return (
    <Connections
      channels={channels}
      webhookUrl={webhookUrl}
      verifyTokenSet={verifyTokenSet}
    />
  );
}
