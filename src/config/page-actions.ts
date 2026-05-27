import type { LucideIcon } from "lucide-react";
import {
  CalendarPlus,
  FileSignature,
  Megaphone,
  Receipt,
  UserPlus,
  Workflow,
} from "lucide-react";

import type { Role } from "@/lib/auth/roles";
import { ROLES } from "@/lib/auth/roles";

export interface PageAction {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: readonly Role[];
}

/**
 * Mapping ruta → acción primaria contextual mostrada en el topbar.
 * Si el rol del usuario no está en `roles`, la acción no se muestra
 * (el topbar deja el espacio en blanco). El `href` se resuelve como
 * link; los modales (Nuevo paciente, Registrar pago) viven dentro de
 * cada página y aceptan abrir vía `?nuevo=1` query si fuera necesario.
 */
const PAGE_ACTIONS: { pattern: RegExp; action: PageAction }[] = [
  {
    pattern: /^\/pacientes$/,
    action: {
      label: "Nuevo paciente",
      href: "/pacientes?nuevo=1",
      icon: UserPlus,
      roles: [
        ROLES.owner,
        ROLES.admin,
        ROLES.recepcion,
        ROLES.profesional,
      ],
    },
  },
  {
    pattern: /^\/turnero/,
    action: {
      label: "Nuevo turno",
      href: "/turnero?nuevo=1",
      icon: CalendarPlus,
      roles: [
        ROLES.owner,
        ROLES.admin,
        ROLES.recepcion,
        ROLES.profesional,
      ],
    },
  },
  {
    pattern: /^\/comercial/,
    action: {
      label: "Nuevo plan",
      href: "/comercial?nuevo=1",
      icon: Receipt,
      roles: [ROLES.owner, ROLES.admin, ROLES.comercial],
    },
  },
  {
    pattern: /^\/marketing/,
    action: {
      label: "Nueva campaña",
      href: "/marketing?nuevo=1",
      icon: Megaphone,
      roles: [ROLES.owner, ROLES.admin, ROLES.marketing],
    },
  },
  {
    pattern: /^\/automatizaciones/,
    action: {
      label: "Nueva automatización",
      href: "/automatizaciones?nuevo=1",
      icon: Workflow,
      roles: [ROLES.owner, ROLES.admin, ROLES.marketing],
    },
  },
  {
    pattern: /^\/ajustes\/equipo/,
    action: {
      label: "Invitar miembro",
      href: "/ajustes/equipo?nuevo=1",
      icon: UserPlus,
      roles: [ROLES.owner, ROLES.admin],
    },
  },
  {
    pattern: /^\/pacientes\/[^/]+\/hce/,
    action: {
      label: "Firmar HC",
      href: "",
      icon: FileSignature,
      roles: [ROLES.owner, ROLES.admin, ROLES.profesional],
    },
  },
];

export function pageActionFor(
  pathname: string,
  role: Role | null,
): PageAction | null {
  if (!role) return null;
  for (const { pattern, action } of PAGE_ACTIONS) {
    if (pattern.test(pathname) && action.roles.includes(role)) {
      return action;
    }
  }
  return null;
}
