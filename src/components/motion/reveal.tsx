"use client";

import { type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";

import { cn } from "@/lib/utils";

const EASE = [0.2, 0, 0, 1] as const;

/**
 * Aparición sobria: opacidad + leve elevación. Acompaña, no distrae.
 * Respeta prefers-reduced-motion (motion es JS → lo desactivamos a mano).
 */
export function Reveal({
  children,
  delay = 0,
  y = 12,
  className,
  ...props
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
} & Omit<HTMLMotionProps<"div">, "children">) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.46, ease: EASE, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Contenedor que escalona la entrada de sus hijos <StaggerItem>.
 * Ideal para grillas de KPIs / listas — sensación de orden y cuidado.
 */
export function Stagger({
  children,
  className,
  gap = 0.055,
  delay = 0.04,
  ...props
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
} & Omit<HTMLMotionProps<"div">, "children">) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : "hidden"}
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: reduce ? 0 : gap, delayChildren: delay },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 14,
  ...props
}: {
  children: ReactNode;
  className?: string;
  y?: number;
} & Omit<HTMLMotionProps<"div">, "children">) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: reduce ? { opacity: 0 } : { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: EASE },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
