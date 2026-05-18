"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * Conteo ascendente al entrar en viewport. La cifra "cobra vida" una vez,
 * con desaceleración elegante. Cae a valor final si se reduce el movimiento.
 */
export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString("es-AR"),
  duration = 1.1,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(() => format(0));

  // Mantiene el formateador fresco sin reiniciar la animación cada render.
  const fmt = useRef(format);
  useEffect(() => {
    fmt.current = format;
  });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: reduce ? 0 : duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(fmt.current(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduce, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
