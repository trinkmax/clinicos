import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Panel de marca — gradiente celeste/azul, presente solo en desktop */}
      <aside className="from-primary via-primary relative hidden overflow-hidden bg-gradient-to-br to-[oklch(0.42_0.14_262)] lg:block">
        <div className="absolute inset-0 opacity-[0.14] [background:radial-gradient(40rem_40rem_at_20%_15%,white,transparent_60%),radial-gradient(36rem_36rem_at_85%_85%,white,transparent_55%)]" />
        <div className="absolute -top-32 -left-24 size-[34rem] rounded-full bg-white/10 blur-3xl" />
        <div className="text-primary-foreground relative flex h-full flex-col justify-between p-14">
          <div className="flex items-center gap-3">
            <div className="bg-primary-foreground/95 grid size-11 place-items-center rounded-xl shadow-lg">
              <span className="text-primary text-lg font-bold tracking-tight">
                CG
              </span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              clinicOS
            </span>
          </div>
          <div className="space-y-5">
            <h1 className="max-w-md text-4xl leading-[1.1] font-semibold tracking-tight text-balance">
              Toda la clínica, calculada al milímetro.
            </h1>
            <p className="text-primary-foreground/75 max-w-sm text-[15px] leading-relaxed">
              Turnero, historia clínica electrónica, gestión comercial y
              comunicación omnicanal — en un solo sistema, pensado para que cada
              día fluya.
            </p>
          </div>
          <p className="text-primary-foreground/60 text-xs">
            Control Group Salud · Medicina Sexual
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
