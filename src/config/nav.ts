import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarClock,
  Users,
  Wallet,
  MessagesSquare,
  Megaphone,
  Workflow,
  BarChart3,
  Settings,
} from "lucide-react";

import { ROLES, type Role } from "@/lib/auth/roles";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Roles que ven el módulo. Marketing nunca ve datos clínicos. */
  roles: readonly Role[];
  /** Fase del roadmap en que se habilita (placeholder hasta entonces). */
  phase: number;
  description: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const ALL = Object.values(ROLES) as Role[];
const OPS: Role[] = [
  ROLES.owner,
  ROLES.admin,
  ROLES.recepcion,
  ROLES.profesional,
  ROLES.asesor,
  ROLES.comercial,
];
const CLIN: Role[] = [
  ROLES.owner,
  ROLES.admin,
  ROLES.recepcion,
  ROLES.profesional,
  ROLES.asesor,
  ROLES.comercial,
];
const COM: Role[] = [ROLES.owner, ROLES.admin, ROLES.comercial];
const CRM: Role[] = [
  ROLES.owner,
  ROLES.admin,
  ROLES.marketing,
  ROLES.comercial,
  ROLES.recepcion,
];
const MKT: Role[] = [ROLES.owner, ROLES.admin, ROLES.marketing];
const ADMIN: Role[] = [ROLES.owner, ROLES.admin];

export const NAV: NavGroup[] = [
  {
    label: "Operación",
    items: [
      {
        title: "Inicio",
        href: "/",
        icon: LayoutDashboard,
        roles: ALL,
        phase: 0,
        description: "Resumen del día y accesos rápidos",
      },
      {
        title: "Turnero",
        href: "/turnero",
        icon: CalendarClock,
        roles: OPS,
        phase: 2,
        description: "Agenda, check-in y turnos virtuales flexibles",
      },
      {
        title: "Pacientes",
        href: "/pacientes",
        icon: Users,
        roles: CLIN,
        phase: 1,
        description: "Historia clínica electrónica, ficha, estudios",
      },
      {
        title: "Comercial",
        href: "/comercial",
        icon: Wallet,
        roles: COM,
        phase: 3,
        description: "Productos, planes, pagos, saldos y entregas",
      },
    ],
  },
  {
    label: "Comunicación",
    items: [
      {
        title: "Inbox",
        href: "/inbox",
        icon: MessagesSquare,
        roles: CRM,
        phase: 4,
        description: "WhatsApp y Facebook unificados",
      },
      {
        title: "Marketing",
        href: "/marketing",
        icon: Megaphone,
        roles: MKT,
        phase: 5,
        description: "Campañas, segmentos y atribución",
      },
      {
        title: "Automatizaciones",
        href: "/automatizaciones",
        icon: Workflow,
        roles: MKT,
        phase: 5,
        description: "Controles 15/30/60, adherencia, post-servicio",
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        title: "Reportes",
        href: "/reportes",
        icon: BarChart3,
        roles: [ROLES.owner, ROLES.admin, ROLES.comercial],
        phase: 6,
        description: "Indicadores clínicos, comerciales y de marketing",
      },
      {
        title: "Ajustes",
        href: "/ajustes",
        icon: Settings,
        roles: ADMIN,
        phase: 0,
        description: "Equipo, roles, marca y parámetros de la clínica",
      },
    ],
  },
];

/** Aplana y filtra la navegación según el rol del usuario. */
export function navForRole(role: Role | null): NavGroup[] {
  if (!role) return [];
  return NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.roles.includes(role)),
  })).filter((g) => g.items.length > 0);
}

export const ALL_NAV_ITEMS: NavItem[] = NAV.flatMap((g) => g.items);
