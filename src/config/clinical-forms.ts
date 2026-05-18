/**
 * Configuración de los formularios clínicos nativos (fiel a los formularios
 * físicos de Control Group). Un motor (`ClinicalFormEditor`) los renderiza.
 *
 * Cada field: `col` = columna de la tabla; `sub` = clave dentro de esa
 * columna jsonb (si falta, el valor ES la columna, p.ej. text plano).
 */
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "sino"
  | "select";

export interface FormField {
  col: string;
  sub?: string;
  label: string;
  type: FieldType;
  options?: string[];
}
export interface FormSection {
  title: string;
  fields: FormField[];
}
export interface ClinicalFormConfig {
  table: "intake_forms" | "clinical_histories" | "psych_tests" | "consents";
  label: string;
  sections: FormSection[];
}

const SINO = ["", "si", "no", "no_se"];

const SINTOMAS = [
  ["enfermedad_cardiovascular", "Enfermedad cardiovascular"],
  ["lesiones_nervios", "Lesiones en nervios"],
  ["lesiones_vasos", "Lesiones en vasos sanguíneos"],
  ["obesidad", "Obesidad"],
  ["tiroides", "Tiroides"],
  ["diabetes", "Diabetes"],
  ["hipertension", "Hipertensión arterial"],
  ["anemia_coagulacion", "Anemia / trastornos de coagulación"],
  ["alcohol", "Consumo de alcohol"],
  ["tabaquismo", "Tabaquismo"],
  ["drogas", "Consumo de drogas recreativas"],
  ["trastornos_hormonales", "Trastornos hormonales"],
  ["falta_deseo", "Falta de deseo"],
  ["estres", "Estrés"],
  ["ansiedad", "Ansiedad"],
  ["depresion", "Depresión"],
  ["problemas_relacion", "Problemas de relación"],
  ["trauma_emocional", "Trauma emocional"],
  ["hipersensibilidad_pene", "Hipersensibilidad del pene"],
  ["dolor_ereccion", "Dolor en la erección"],
  ["dolor_penetracion", "Dolor en la penetración"],
  ["cirugias_urogenitales", "Cirugías urogenitales/abdominales"],
] as const;

export const CLINICAL_FORMS: Record<string, ClinicalFormConfig> = {
  ficha_ingreso: {
    table: "intake_forms",
    label: "Ficha de Ingreso",
    sections: [
      {
        title: "Síntomas y/o enfermedades",
        fields: SINTOMAS.map(([k, l]) => ({
          col: "sintomas",
          sub: k,
          label: l,
          type: "sino" as FieldType,
        })),
      },
      {
        title: "Condiciones",
        fields: [
          { col: "condiciones", sub: "disfuncion_erectil", label: "Disfunción eréctil", type: "boolean" },
          { col: "condiciones", sub: "eyaculacion_precoz", label: "Eyaculación precoz", type: "boolean" },
          { col: "condiciones", sub: "deficit_testosterona", label: "Déficit de testosterona", type: "boolean" },
          { col: "condiciones", sub: "peyronie", label: "Síndrome de Peyronie", type: "boolean" },
        ],
      },
      {
        title: "Diagnóstico y tratamiento",
        fields: [
          { col: "diagnostico", label: "Diagnóstico", type: "textarea" },
          { col: "tratamiento", label: "Tratamiento", type: "textarea" },
        ],
      },
    ],
  },

  historia_clinica: {
    table: "clinical_histories",
    label: "Historia Clínica",
    sections: [
      {
        title: "Datos personales",
        fields: [
          { col: "datos_personales", sub: "nombre_apellido", label: "Nombre y apellido", type: "text" },
          { col: "datos_personales", sub: "dni", label: "DNI / LE", type: "text" },
          { col: "datos_personales", sub: "edad", label: "Edad", type: "text" },
          { col: "datos_personales", sub: "estado_civil", label: "Estado civil", type: "text" },
          { col: "datos_personales", sub: "actividad", label: "Actividad / Profesión", type: "text" },
        ],
      },
      {
        title: "Motivo de la consulta",
        fields: [
          { col: "motivo_consulta", sub: "detalle", label: "Motivo", type: "textarea" },
        ],
      },
      {
        title: "Disfunción eréctil",
        fields: [
          { col: "disfuncion_erectil", sub: "aparicion", label: "Aparición (brusca/gradual)", type: "text" },
          { col: "disfuncion_erectil", sub: "evolucion", label: "Evolución", type: "text" },
          { col: "disfuncion_erectil", sub: "situaciones", label: "Ante qué situaciones", type: "text" },
          { col: "disfuncion_erectil", sub: "rigidez_pct", label: "Rigidez obtenida (%)", type: "text" },
          { col: "disfuncion_erectil", sub: "permite_penetracion", label: "Permite penetración", type: "sino" },
          { col: "disfuncion_erectil", sub: "erecciones_matinales", label: "Erecciones matinales", type: "sino" },
          { col: "disfuncion_erectil", sub: "erecciones_nocturnas", label: "Erecciones nocturnas", type: "sino" },
          { col: "disfuncion_erectil", sub: "medicacion_previa", label: "Tomó medicación", type: "sino" },
        ],
      },
      {
        title: "Eyaculación precoz",
        fields: [
          { col: "eyaculacion_precoz", sub: "aparicion", label: "Aparición", type: "text" },
          { col: "eyaculacion_precoz", sub: "tiempo_penetracion_eyaculacion", label: "Tiempo penetración→eyaculación", type: "text" },
          { col: "eyaculacion_precoz", sub: "segundo_coito", label: "Realiza segundo coito", type: "text" },
        ],
      },
      {
        title: "Deseo sexual / relaciones",
        fields: [
          { col: "deseo_sexual", sub: "deseo", label: "Deseo sexual", type: "select", options: ["", "ausente", "reducido", "presente"] },
          { col: "deseo_sexual", sub: "ultima_relacion", label: "Última relación satisfactoria", type: "text" },
          { col: "deseo_sexual", sub: "frecuencia_coital", label: "Frecuencia coital", type: "text" },
          { col: "deseo_sexual", sub: "relacion_vincular", label: "Relación vincular", type: "text" },
        ],
      },
      {
        title: "Antecedentes",
        fields: [
          { col: "antecedentes", sub: "diabetes", label: "Diabetes", type: "sino" },
          { col: "antecedentes", sub: "hipercolesterolemia", label: "Hipercolesterolemia", type: "sino" },
          { col: "antecedentes", sub: "hipertension", label: "Hipertensión arterial", type: "sino" },
          { col: "antecedentes", sub: "cardiopatias", label: "Cardiopatías", type: "sino" },
          { col: "antecedentes", sub: "prostatismo", label: "Prostatismo", type: "sino" },
          { col: "antecedentes", sub: "cirugias", label: "Intervenciones quirúrgicas", type: "textarea" },
          { col: "antecedentes", sub: "farmacologicos", label: "Tratamientos farmacológicos", type: "textarea" },
          { col: "antecedentes", sub: "alergias", label: "Alergias", type: "text" },
          { col: "antecedentes", sub: "habitos", label: "Hábitos (café/tabaco/alcohol/ejercicio)", type: "textarea" },
        ],
      },
      {
        title: "Examen físico",
        fields: [
          { col: "examen_fisico", sub: "patologia_peneana", label: "Patología peneana (fibrosis/curvatura/Peyronie)", type: "textarea" },
          { col: "examen_fisico", sub: "presion_sanguinea", label: "Presión sanguínea (mmHg)", type: "text" },
          { col: "examen_fisico", sub: "cardiovascular", label: "Cardiovascular", type: "text" },
          { col: "examen_fisico", sub: "urogenital", label: "Urogenital", type: "text" },
          { col: "examen_fisico", sub: "biotensiometria", label: "Biotensiometría (índices)", type: "text" },
          { col: "examen_fisico", sub: "observaciones", label: "Observaciones", type: "textarea" },
        ],
      },
      {
        title: "Ecodoppler / estudios",
        fields: [
          { col: "ecodoppler", sub: "arteria_dorsal_der", label: "Arteria dorsal derecha (Pre/Post TDVA)", type: "text" },
          { col: "ecodoppler", sub: "arteria_dorsal_izq", label: "Arteria dorsal izquierda", type: "text" },
          { col: "ecodoppler", sub: "arteria_cavernosa_der", label: "Arteria cavernosa derecha", type: "text" },
          { col: "ecodoppler", sub: "arteria_cavernosa_izq", label: "Arteria cavernosa izquierda", type: "text" },
          { col: "ecodoppler", sub: "test_ereccion", label: "Test de erección (fórmula/dosis/rigidez/duración)", type: "textarea" },
          { col: "estudios", sub: "otros", label: "Otros estudios solicitados", type: "textarea" },
        ],
      },
      {
        title: "Diagnóstico y plan",
        fields: [
          { col: "diagnostico", label: "Diagnóstico", type: "textarea" },
          { col: "plan", label: "Plan / tratamiento indicado", type: "textarea" },
        ],
      },
    ],
  },

  test_psicologico: {
    table: "psych_tests",
    label: "Test Psicológico",
    sections: [
      {
        title: "Cuestionario",
        fields: [
          { col: "respuestas", sub: "transpiracion_manos", label: "Transpiración en las manos", type: "sino" },
          { col: "respuestas", sub: "frecuencia_coital", label: "Frecuencia coital", type: "select", options: ["", "3_x_semana", "1_2_x_semana", "1_x_semana", "1_cada_15_dias"] },
          { col: "respuestas", sub: "dificultad_erecciones", label: "Dificultad para tener erecciones", type: "sino" },
          { col: "respuestas", sub: "control_eyaculacion", label: "Controla a voluntad la eyaculación", type: "sino" },
          { col: "respuestas", sub: "nerviosismo_coito", label: "Nerviosismo/ansiedad ante el coito", type: "sino" },
          { col: "respuestas", sub: "taquicardia", label: "Taquicardia/ahogo previo al acto", type: "sino" },
          { col: "respuestas", sub: "perdida_esfinteres", label: "Pérdida de control de esfínteres", type: "sino" },
          { col: "respuestas", sub: "duracion_penetracion_coito", label: "Duración penetración→coito", type: "text" },
          { col: "respuestas", sub: "nivel_firmeza", label: "Nivel de firmeza (0–10)", type: "number" },
          { col: "respuestas", sub: "deseo_sexual", label: "Tiene deseo sexual", type: "sino" },
          { col: "respuestas", sub: "afecta_pareja", label: "Afecta la relación de pareja", type: "sino" },
          { col: "respuestas", sub: "observaciones", label: "Observaciones", type: "textarea" },
        ],
      },
    ],
  },

  consentimiento: {
    table: "consents",
    label: "Consentimiento Informado",
    sections: [
      {
        title: "Firmante",
        fields: [
          { col: "signer_name", label: "Nombre y apellido del firmante", type: "text" },
          { col: "signer_dni", label: "DNI", type: "text" },
          { col: "tipo", label: "Tipo de consentimiento", type: "select", options: ["disfuncion_erectil", "general"] },
        ],
      },
    ],
  },
};

export const SINO_OPTS = SINO;
