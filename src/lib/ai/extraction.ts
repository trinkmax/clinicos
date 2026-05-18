import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import type { Database } from "@/lib/db/database.types";

type DocType = Database["public"]["Enums"]["doc_type"];

/** Modelo por defecto: Sonnet 4.6 — visión fuerte y costo apto para volumen de escaneos. */
const MODEL = process.env.ANTHROPIC_EXTRACTION_MODEL ?? "claude-sonnet-4-6";
export const PROMPT_VERSION = "2026-05-18.1";

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY no configurada.");
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

/**
 * Esquemas JSON (tool input) por tipo de documento. Fieles a los formularios
 * físicos de Control Group. El contenido va a jsonb; el staff valida/corrige
 * en la pantalla de revisión (humano en el loop). `_meta` lleva confianza.
 */
const objBag = (props: Record<string, unknown> = {}) => ({
  type: "object",
  additionalProperties: true,
  properties: props,
});

const META = {
  _meta: {
    type: "object",
    description: "Auto-evaluación de la extracción.",
    properties: {
      confidence: { type: "number", minimum: 0, maximum: 1 },
      uncertain_fields: { type: "array", items: { type: "string" } },
      notes: { type: "string" },
    },
    required: ["confidence"],
  },
};

const SCHEMAS: Record<DocType, { description: string; schema: object }> = {
  ficha_ingreso: {
    description:
      "Ficha de Ingreso de Control Group: datos personales, checklist de síntomas/enfermedades, condiciones (disfunción eréctil, eyaculación precoz, déficit de testosterona, Peyronie), diagnóstico y tratamiento.",
    schema: {
      type: "object",
      properties: {
        paciente: objBag({
          apellido: { type: "string" },
          nombres: { type: "string" },
          dni: { type: "string" },
          fecha_nacimiento: { type: "string", description: "YYYY-MM-DD" },
          edad: { type: "string" },
          estado_civil: { type: "string" },
          domicilio: objBag(),
          telefono: { type: "string" },
          email: { type: "string" },
          ocupacion: { type: "string" },
          fecha: { type: "string", description: "Fecha de la ficha YYYY-MM-DD" },
        }),
        sintomas: {
          type: "object",
          description:
            "Cada síntoma/enfermedad → 'si' | 'no' | 'no_se' | null si no marcado.",
          additionalProperties: { type: ["string", "null"] },
        },
        condiciones: objBag({
          disfuncion_erectil: { type: "boolean" },
          eyaculacion_precoz: { type: "boolean" },
          deficit_testosterona: { type: "boolean" },
          peyronie: { type: "boolean" },
        }),
        diagnostico: { type: "string" },
        tratamiento: { type: "string" },
        ...META,
      },
      required: ["paciente", "_meta"],
    },
  },
  test_psicologico: {
    description:
      "Test Psicológico (2 hojas) de Control Group: respuestas SI/NO/A VECES, frecuencias, duraciones y escala de firmeza 0–10.",
    schema: {
      type: "object",
      properties: {
        respuestas: {
          type: "object",
          description:
            "Clave = pregunta abreviada (snake_case), valor = respuesta tal cual (si/no/a_veces/opción/número).",
          additionalProperties: { type: ["string", "number", "null"] },
        },
        nivel_firmeza: { type: ["number", "null"], minimum: 0, maximum: 10 },
        ...META,
      },
      required: ["respuestas", "_meta"],
    },
  },
  historia_clinica: {
    description:
      "Historia Clínica de 6 hojas (documento legal). Capturar todas las secciones: motivo, DE, EP, deseo sexual, antecedentes, examen físico, ecodoppler, estudios, diagnóstico, plan, tratamiento y seguimiento.",
    schema: {
      type: "object",
      properties: {
        profesional: { type: "string" },
        fecha: { type: "string", description: "YYYY-MM-DD" },
        datos_personales: objBag(),
        motivo_consulta: objBag(),
        disfuncion_erectil: objBag(),
        eyaculacion_precoz: objBag(),
        deseo_sexual: objBag(),
        antecedentes: objBag({
          medicos: objBag(),
          quirurgicos: objBag(),
          farmacologicos: objBag(),
          alergias: objBag(),
          habitos: objBag(),
        }),
        examen_fisico: objBag({
          patologia_peneana: objBag(),
          general: objBag(),
          biotensiometria: objBag(),
        }),
        ecodoppler: objBag({
          arterias: { type: "array", items: objBag() },
          test_ereccion: { type: "array", items: objBag() },
        }),
        estudios: objBag(),
        diagnostico: { type: "string" },
        plan: { type: "string" },
        tratamiento: {
          type: "array",
          items: objBag({
            fecha: { type: "string" },
            tratamiento: { type: "string" },
            dosis: { type: "string" },
          }),
        },
        seguimiento: {
          type: "array",
          items: objBag({ fecha: { type: "string" }, detalle: { type: "string" } }),
        },
        ...META,
      },
      required: ["_meta"],
    },
  },
  consentimiento: {
    description:
      "Consentimiento Informado de Control Group: nombre y DNI del firmante, si está firmado, fecha y aclaración.",
    schema: {
      type: "object",
      properties: {
        signer_name: { type: "string" },
        signer_dni: { type: "string" },
        firmado: { type: "boolean" },
        fecha: { type: "string", description: "YYYY-MM-DD" },
        aclaracion: { type: "string" },
        ...META,
      },
      required: ["firmado", "_meta"],
    },
  },
  datos_comerciales: {
    description:
      "Datos Comerciales de Control Group: producto y paquete (FIC u otros productos que comercializa la clínica), costo, cantidad de aplicaciones, pagos (fecha/importe/saldo), retiros y entregas, seguimiento 15/30/60, profesional.",
    schema: {
      type: "object",
      properties: {
        descripcion: { type: "string" },
        producto: {
          type: "string",
          description: "Producto/paquete tal cual figura (ej: FIC, FIC x3, FIC x6, u otro)",
        },
        costo: { type: "number" },
        cant_aplicaciones: { type: "number" },
        inicio_tratamiento: { type: "string" },
        fin_tratamiento: { type: "string" },
        pagos: {
          type: "array",
          items: objBag({
            fecha: { type: "string" },
            importe: { type: "number" },
            saldo: { type: "number" },
          }),
        },
        entregas: {
          type: "array",
          items: objBag({ fecha: { type: "string" }, detalle: { type: "string" } }),
        },
        seguimiento: objBag({
          d15: { type: "string" },
          d30: { type: "string" },
          d60: { type: "string" },
        }),
        profesional: { type: "string" },
        ...META,
      },
      required: ["_meta"],
    },
  },
  receta: {
    description: "Receta médica: fecha, medicación/indicaciones, profesional.",
    schema: {
      type: "object",
      properties: {
        fecha: { type: "string" },
        indicaciones: { type: "string" },
        profesional: { type: "string" },
        ...META,
      },
      required: ["_meta"],
    },
  },
  comprobante_pago: {
    description: "Comprobante de pago: fecha, importe, medio, referencia.",
    schema: {
      type: "object",
      properties: {
        fecha: { type: "string" },
        importe: { type: "number" },
        medio: { type: "string" },
        referencia: { type: "string" },
        ...META,
      },
      required: ["_meta"],
    },
  },
  estudio: {
    description: "Estudio complementario: tipo, fecha, resultados.",
    schema: {
      type: "object",
      properties: {
        tipo: { type: "string" },
        fecha: { type: "string" },
        resultados: { type: "string" },
        ...META,
      },
      required: ["_meta"],
    },
  },
  otro: {
    description: "Documento no clasificado: extraer texto y datos clave.",
    schema: {
      type: "object",
      properties: {
        texto: { type: "string" },
        datos: objBag(),
        ...META,
      },
      required: ["_meta"],
    },
  },
};

export interface ExtractionResult {
  data: Record<string, unknown>;
  confidence: number;
  uncertainFields: string[];
  model: string;
  promptVersion: string;
}

const SYSTEM = `Sos un asistente experto en digitalizar documentos clínicos y comerciales manuscritos en español rioplatense de Control Group Salud (clínica de medicina sexual, Argentina).
Reglas:
- Transcribí EXACTAMENTE lo que ves. No inventes ni completes datos que no están.
- Si un campo está vacío o ilegible, dejalo null y agregalo a _meta.uncertain_fields.
- Fechas en formato YYYY-MM-DD. Números sin separador de miles.
- Marcas/tildes/cruces = el valor de esa opción. Casillas SI/NO/NO SE → 'si'|'no'|'no_se'.
- _meta.confidence = tu confianza global 0–1 (bajá si hay mucha letra manuscrita dudosa).
- Devolvé SOLO la herramienta estructurada.`;

function mediaType(mime: string): string {
  return mime === "image/jpg" ? "image/jpeg" : mime;
}

/**
 * Extrae datos estructurados de un documento escaneado con Claude (visión).
 * Salida forzada por tool-use; prompt caching en system + esquema (costo).
 */
export async function extractDocument(params: {
  docType: DocType;
  base64: string;
  mime: string;
}): Promise<ExtractionResult> {
  const def = SCHEMAS[params.docType];
  const isPdf = params.mime === "application/pdf";

  const message = await client().messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: [
      { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
    ],
    tools: [
      {
        name: "registrar_documento",
        description: def.description,
        input_schema: def.schema as Anthropic.Tool.InputSchema,
        cache_control: { type: "ephemeral" },
      },
    ],
    tool_choice: { type: "tool", name: "registrar_documento" },
    messages: [
      {
        role: "user",
        content: [
          isPdf
            ? {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: params.base64,
                },
              }
            : {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType(
                    params.mime,
                  ) as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
                  data: params.base64,
                },
              },
          {
            type: "text",
            text: "Digitalizá este documento y devolvé la herramienta estructurada.",
          },
        ],
      },
    ],
  });

  const block = message.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("La IA no devolvió datos estructurados.");
  }
  const data = block.input as Record<string, unknown>;
  const meta = (data._meta ?? {}) as {
    confidence?: number;
    uncertain_fields?: string[];
  };

  return {
    data,
    confidence: typeof meta.confidence === "number" ? meta.confidence : 0.5,
    uncertainFields: Array.isArray(meta.uncertain_fields)
      ? meta.uncertain_fields
      : [],
    model: MODEL,
    promptVersion: PROMPT_VERSION,
  };
}
