/** Render legible y recursivo de un registro clínico jsonb. Presentacional. */

function prettyKey(k: string) {
  return k
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

function Value({ v }: { v: unknown }) {
  if (v == null || v === "")
    return <span className="text-muted-foreground/60">—</span>;
  if (typeof v === "boolean")
    return <span>{v ? "Sí" : "No"}</span>;
  if (typeof v === "object")
    return <RecordTree data={v as Record<string, unknown>} nested />;
  return <span>{String(v)}</span>;
}

export function RecordTree({
  data,
  nested,
}: {
  data: unknown;
  nested?: boolean;
}) {
  if (Array.isArray(data)) {
    if (data.length === 0)
      return <span className="text-muted-foreground/60">—</span>;
    return (
      <ul className="space-y-1.5">
        {data.map((item, i) => (
          <li
            key={i}
            className="bg-muted/40 rounded-md px-2.5 py-1.5 text-sm"
          >
            <Value v={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (data && typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>).filter(
      ([k]) => k !== "_meta",
    );
    if (entries.length === 0)
      return <span className="text-muted-foreground/60">—</span>;
    return (
      <dl
        className={
          nested
            ? "space-y-1.5"
            : "grid gap-x-6 gap-y-2.5 sm:grid-cols-2"
        }
      >
        {entries.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
              {prettyKey(k)}
            </dt>
            <dd className="mt-0.5 text-sm break-words">
              <Value v={v} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  return <Value v={data} />;
}
