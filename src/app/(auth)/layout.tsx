import type { ReactNode } from "react";
import Image from "next/image";
import { CalendarClock, ShieldCheck, MessagesSquare } from "lucide-react";

const PROOF = [
  {
    icon: CalendarClock,
    title: "Turnero en vivo",
    desc: "Agenda por profesional, en tiempo real.",
  },
  {
    icon: ShieldCheck,
    title: "HCE legal",
    desc: "Append-only y auditable (Ley 26.529).",
  },
  {
    icon: MessagesSquare,
    title: "WhatsApp omnicanal",
    desc: "Conversaciones y campañas, unificadas.",
  },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Panel de marca — celeste/azul, calmo, con prueba de producto */}
      <aside className="from-primary to-brand-azul relative hidden overflow-hidden bg-gradient-to-br lg:block">
        <div className="absolute inset-0 opacity-[0.16] [background:radial-gradient(42rem_42rem_at_18%_12%,white,transparent_60%),radial-gradient(34rem_34rem_at_88%_88%,white,transparent_55%)]" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:34px_34px]"
        />
        <div className="animate-sheen absolute -top-32 -left-24 size-[34rem] rounded-full bg-white/10 blur-3xl" />

        <div className="text-primary-foreground relative flex h-full flex-col justify-between p-14">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-white/95 shadow-lg">
              <Image
                src="/brand/logo-short.png"
                alt="Control Group"
                width={28}
                height={28}
                className="size-7 object-contain"
                priority
              />
            </div>
            <div className="leading-tight">
              <p className="text-lg font-semibold tracking-tight">
                clinicOS
              </p>
              <p className="text-primary-foreground/60 text-[11px]">
                Control Group Salud
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="max-w-md text-4xl leading-[1.1] font-semibold tracking-tight text-balance">
                Toda la clínica, calculada al milímetro.
              </h1>
              <p className="text-primary-foreground/75 max-w-sm text-[15px] leading-relaxed">
                Turnero, historia clínica electrónica legal, gestión comercial
                y comunicación omnicanal — en un solo sistema, pensado para que
                cada día fluya.
              </p>
            </div>
            <ul className="space-y-3">
              {PROOF.map((p) => (
                <li key={p.title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white/12 ring-1 ring-white/15">
                    <p.icon className="size-4 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-primary-foreground/65 text-xs">
                      {p.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-primary-foreground/55 text-xs">
            Control Group Salud · Medicina Sexual · Argentina
          </p>
        </div>
      </aside>

      <main className="bg-aurora relative flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
