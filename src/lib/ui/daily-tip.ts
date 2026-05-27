/**
 * Mensajes operativos / motivacionales del día. Selección determinista
 * por fecha (mismo tip para todos los usuarios un mismo día). No usa
 * Math.random — evita hydration mismatches y permite cachear el render.
 */

export interface DailyTip {
  /** Frase corta visible como título de la card. */
  title: string;
  /** Cuerpo más extenso — máx 2 líneas. */
  body: string;
  /** Categoría — informa el color/ícono al render. */
  kind: "motivacion" | "operativo" | "salud" | "habito";
}

const TIPS: DailyTip[] = [
  {
    title: "Pequeños gestos importan",
    body: "Llamar al paciente por su nombre y mirarlo a los ojos al saludar baja la ansiedad de la primera consulta.",
    kind: "motivacion",
  },
  {
    title: "Revisá el stock antes de las 11",
    body: "El proveedor de FIC tarda 48 h. Si algún insumo está bajo, pedilo temprano para no frenar la operación.",
    kind: "operativo",
  },
  {
    title: "El control 15 cierra la fuga",
    body: "Pacientes contactados al día 15 tienen 3× más adherencia. Una llamada de 2 minutos hace diferencia real.",
    kind: "operativo",
  },
  {
    title: "Hidratate y respirá",
    body: "La consulta médica drena más de lo que parece. 2 minutos sin pantallas cada hora suben el foco al doble.",
    kind: "salud",
  },
  {
    title: "Documentá mientras está fresco",
    body: "Una nota clínica de 30 segundos al cerrar el turno evita 20 minutos de reconstruir después. Append-only protege.",
    kind: "habito",
  },
  {
    title: "Una buena pregunta vale por diez",
    body: "Antes de proponer plan, escuchá la expectativa del paciente. Te ahorra fricción comercial al cerrar.",
    kind: "motivacion",
  },
  {
    title: "El no-show se previene por WhatsApp",
    body: "Un recordatorio 24 h antes baja ausentismo del 18 % al 6 %. La automatización ya lo hace — verificá que esté activa.",
    kind: "operativo",
  },
  {
    title: "El equipo se hace mirándose",
    body: "Una vuelta de 15 minutos al inicio del día con recepción y médico alinea expectativas y previene quejas.",
    kind: "motivacion",
  },
  {
    title: "Cerrar el día sin saldos pendientes",
    body: "Antes de irte, mirá Cobranzas. Cada llamada del día siguiente cierra cuentas más rápido.",
    kind: "operativo",
  },
  {
    title: "Sumar ≠ apurar",
    body: "Tener turnos cada 15 minutos no es eficiencia — es agotamiento. Cuidá ritmos para sostener calidad.",
    kind: "habito",
  },
];

/** Devuelve el tip correspondiente al día actual en huso Argentina. */
export function todaysTip(now: Date = new Date()): DailyTip {
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(now);
  // Hash super simple — suma de char codes mod array.length. Determinista.
  let h = 0;
  for (let i = 0; i < iso.length; i++) h = (h * 31 + iso.charCodeAt(i)) | 0;
  return TIPS[Math.abs(h) % TIPS.length]!;
}

export interface DayBriefing {
  /** Texto principal del bloque clima/momento. */
  title: string;
  /** Subtexto: recomendación operativa por franja horaria. */
  hint: string;
  /** Emoji o lucide icon name. */
  vibe: "morning" | "noon" | "evening" | "night";
}

/** Briefing del día por franja horaria (deterministic, sin API externa). */
export function dayBriefing(now: Date = new Date()): DayBriefing {
  const h = Number(
    new Intl.DateTimeFormat("es-AR", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(now),
  );
  if (h < 7) {
    return {
      title: "Antes del amanecer",
      hint: "Tomate el café antes de abrir la primera ficha. El primer paciente va a notar la diferencia.",
      vibe: "night",
    };
  }
  if (h < 12) {
    return {
      title: "Mañana clara",
      hint: "Energía alta del equipo: ideal para resolver lo pesado — cobranzas, controles, validar documentos.",
      vibe: "morning",
    };
  }
  if (h < 15) {
    return {
      title: "Mediodía operativo",
      hint: "Post-almuerzo: día perfecto para llamar a los seguimientos 15/30. Conversaciones más cortas, más cierres.",
      vibe: "noon",
    };
  }
  if (h < 19) {
    return {
      title: "Tarde productiva",
      hint: "Hora pico de pacientes 60+. Bajá un poco el ritmo, escuchá más, escribí menos: la HCE puede esperar 2 minutos.",
      vibe: "noon",
    };
  }
  if (h < 22) {
    return {
      title: "Cierre del día",
      hint: "Antes de irte: cerrá las notas pendientes y revisá saldos. Mañana arranca limpio.",
      vibe: "evening",
    };
  }
  return {
    title: "Modo nocturno",
    hint: "Aplazá las decisiones críticas a mañana. Si abriste el sistema, mirá lo urgente y andá a descansar.",
    vibe: "night",
  };
}
