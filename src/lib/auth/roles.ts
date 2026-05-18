/**
 * Modelo de roles de clinicOS — derivado de los carriles funcionales reales
 * del diagrama de procesos de Control Group (Recepción, Médico, Asesor, Comercial)
 * más administración y marketing.
 *
 * El rol vive en `app_metadata.role` del JWT (NO en user_metadata: user_metadata
 * es editable por el usuario y jamás debe usarse para autorización). Las políticas
 * RLS y estos helpers leen siempre `app_metadata`.
 */
export const ROLES = {
  /** Dueño de la clínica/tenant. Acceso total, incluida configuración y facturación. */
  owner: "owner",
  /** Administrador operativo. Gestiona usuarios, ajustes y todos los módulos. */
  admin: "admin",
  /** Recepción (4 personas). Turnero, check-in, carga/validación de documentos. */
  recepcion: "recepcion",
  /** Profesional médico. Historia clínica, diagnóstico, plan, estudios, controles. */
  profesional: "profesional",
  /** Asesor (consultoría psicológica). Acompaña test psicológico, notas clínicas acotadas. */
  asesor: "asesor",
  /** Área comercial. Productos y planes, pagos/saldos, entregas, recordatorios de adherencia. */
  comercial: "comercial",
  /** Marketing. CRM omnicanal, campañas, automatizaciones. SIN acceso a datos clínicos. */
  marketing: "marketing",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES = Object.values(ROLES) as Role[];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ALL_ROLES as string[]).includes(value);
}

/** Roles con poder administrativo pleno. */
export const ADMIN_ROLES: readonly Role[] = [ROLES.owner, ROLES.admin];

/** Roles con acceso a datos clínicos (HC, ficha, test, consentimiento). */
export const CLINICAL_ROLES: readonly Role[] = [
  ROLES.owner,
  ROLES.admin,
  ROLES.profesional,
  ROLES.asesor,
];

/** Roles con acceso al módulo comercial (productos, planes, pagos, entregas). */
export const COMMERCIAL_ROLES: readonly Role[] = [
  ROLES.owner,
  ROLES.admin,
  ROLES.comercial,
];

/** Roles con acceso al CRM/Marketing (NUNCA ven la HC). */
export const MARKETING_ROLES: readonly Role[] = [
  ROLES.owner,
  ROLES.admin,
  ROLES.marketing,
  ROLES.comercial,
];

export function hasAnyRole(
  role: Role | null | undefined,
  allowed: readonly Role[],
): boolean {
  return role != null && allowed.includes(role);
}

/** Etiquetas en español para UI. */
export const ROLE_LABELS: Record<Role, string> = {
  owner: "Dueño",
  admin: "Administrador",
  recepcion: "Recepción",
  profesional: "Profesional médico",
  asesor: "Asesor",
  comercial: "Comercial",
  marketing: "Marketing",
};
