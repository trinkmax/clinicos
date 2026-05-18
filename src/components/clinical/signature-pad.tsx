"use client";

import { useRef, useEffect, useCallback } from "react";
import { Eraser } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Pad de firma manuscrita (canvas puro). Emite el dataURL PNG en cada trazo.
 * Usado para la firma electrónica avanzada del profesional al cerrar la HC.
 */
export function SignaturePad({
  onChange,
}: {
  onChange: (dataUrl: string | null) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1f2937";
  }, []);

  const pos = (e: PointerEvent | React.PointerEvent) => {
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * c.width,
      y: ((e.clientY - r.top) / r.height) * c.height,
    };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    const ctx = ref.current!.getContext("2d")!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = ref.current!.getContext("2d")!;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    dirty.current = true;
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (dirty.current) onChange(ref.current!.toDataURL("image/png"));
  };

  const clear = useCallback(() => {
    const c = ref.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    dirty.current = false;
    onChange(null);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <div className="bg-background relative rounded-lg border">
        <canvas
          ref={ref}
          width={560}
          height={180}
          className="h-[180px] w-full touch-none rounded-lg"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        <span className="text-muted-foreground pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px]">
          Firmá con el dedo o el mouse
        </span>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={clear}>
        <Eraser className="size-3.5" />
        Limpiar
      </Button>
    </div>
  );
}
