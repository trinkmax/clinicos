"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Transición sutil entre vistas. Acompaña la navegación sin distraer.
 * Respeta prefers-reduced-motion (motion lo desactiva automáticamente vía CSS global).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
