import type { Metadata } from "next";
import { ScrollText } from "lucide-react";

import { recentAudit } from "@/lib/data/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Ajustes · Bitácora" };

export default async function AjustesBitacoraPage() {
  const audit = await recentAudit(60);

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <ScrollText className="text-muted-foreground size-4" />
        Bitácora de auditoría (Ley 26.529)
      </h2>
      <Card className="overflow-hidden p-0">
        {audit.length === 0 ? (
          <p className="text-muted-foreground p-8 text-center text-sm">
            Sin eventos auditados todavía.
          </p>
        ) : (
          <ul className="divide-y text-sm">
            {audit.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2.5"
              >
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {a.action}
                </Badge>
                <span className="text-muted-foreground font-mono text-xs">
                  {a.entity_table}
                </span>
                <span className="flex-1" />
                <span className="text-muted-foreground text-xs tabular-nums">
                  {new Date(a.created_at).toLocaleString("es-AR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
