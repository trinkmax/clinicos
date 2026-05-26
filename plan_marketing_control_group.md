# Plan de Marketing — Control Group Salud + Max Sex
**Versión:** 1.0 · 21/05/2026
**Alcance:** Reordenamiento digital + 2 campañas (25–40 y 60–90) + lanzamiento e-commerce Max Sex
**Cómo usar este documento:** Cada tarea tiene un checkbox `[ ]`, un responsable sugerido, tiempo estimado, herramientas y criterio de "hecho". Trabajalo como checklist semanal. Lo que no se puede medir, no se hizo.

---

## ROLES (definir personas reales antes de empezar)

| Rol | Quién | Responsabilidad |
|---|---|---|
| **Dueño del proyecto** | (a definir) | Decisiones, presupuesto, prioridades. 1h/semana revisión. |
| **Lead marketing** | (vos / agencia) | Coordinación general, ejecución del plan. |
| **Community manager** | Interno o freelance | Contenido orgánico, respuestas, calendar. 20h/semana. |
| **Performance / Ads** | Freelance o agencia | Meta Ads, Google Ads, optimización. 10h/semana. |
| **Diseñador / editor video** | Freelance | Piezas estáticas y reels. 15h/semana. |
| **Médico vocero** | 1–2 médicos del staff | Cara visible para reels y testimonios. 2h/semana. |
| **Recepción / agendamiento** | Existente | Responder WhatsApp, llamadas, derivar. |
| **Soporte legal / ANMAT** | Externo (consultar) | Solo para Max Sex. Una sola contratación inicial. |
| **Desarrollo web** | Agencia actual (Indigo) o nueva | Cambios en web, landings, e-commerce. |

---

## STACK DE HERRAMIENTAS (lo que hay que tener contratado)

- [ ] **Google Workspace corporativo** (mail @controlgroupsalud.com.ar para cada rol). ~USD 6/usuario/mes.
- [ ] **Meta Business Manager** centralizado (gratis).
- [ ] **Google Ads Manager** centralizado (gratis).
- [ ] **GA4 + Google Tag Manager** (gratis).
- [ ] **WhatsApp Business API** vía 360dialog / Twilio / Meta directo (USD 50–150/mes según volumen).
- [ ] **Tiendanube** para Max Sex (plan Avanzado USD ~75/mes).
- [ ] **CRM**: HubSpot Free al inicio. Migrar a ActiveCampaign o HubSpot Starter cuando >2.000 contactos.
- [ ] **Email marketing**: Brevo (ex-Sendinblue) gratis hasta 300 envíos/día, después USD 25/mes.
- [ ] **Diseño**: Canva Pro (USD 13/mes) + Figma (gratis para 1 editor).
- [ ] **Edición de video**: CapCut (gratis) o Premiere si hay editor pro.
- [ ] **Programación de posts**: Metricool (USD 22/mes) o Later.
- [ ] **Analytics dashboard**: Looker Studio (gratis) conectado a GA4 + Meta + Ads.
- [ ] **Reseñas Google**: WhatsApp Business + plantilla con link `g.page/r/...`.
- [ ] **1Password / Bitwarden** para gestión de contraseñas del equipo.

**Costo mensual herramientas (sin pauta): ~USD 250–400.**

---

# PARTE 1 — SETUP Y LIMPIEZA INICIAL (semanas 1–4)

## SEMANA 1 — Recuperar lo perdido y centralizar

### 1.1 Recuperación de Instagrams
- [ ] Identificar mails y teléfonos originales con los que se crearon `@controlgroupsaludmedicina` y `@controlgroupsalud.ar`. *Responsable: dueño. 1h.*
- [ ] Intentar reset de contraseña desde esos mails. *Responsable: dueño. 30min.*
- [ ] Si no funciona: entrar a `instagram.com/hacked` → "Mi cuenta fue pirateada" → video-selfie. *Responsable: dueño en persona. 1h.*
- [ ] Si tienen Meta Business Manager viejo, revisar si las cuentas IG están conectadas ahí (`business.facebook.com` → Configuración del negocio → Cuentas → Cuentas de Instagram). *Responsable: lead marketing. 1h.*
- [ ] Verificar si "Control Group Salud" está registrado en INPI como marca. Si sí, preparar formulario de reporte de marca de Instagram para reclamar el handle. *Responsable: dueño + legal. 2h.*
- **Criterio de éxito:** acceso recuperado a al menos 1 de los 2 Instagrams en 7 días. Si en 14 días no se recupera ninguno, plan B = crear `@controlgroup.salud` (nuevo) y comunicar migración.

### 1.2 Auditoría de accesos
- [ ] Crear planilla "Inventario Digital" con columnas: Plataforma · URL · Usuario · Mail asociado · Teléfono asociado · 2FA activo · Quién tiene acceso · Notas. *Responsable: lead marketing. 3h.*
- [ ] Llenar la planilla con todo: dominio (NIC.ar), hosting, Google Search Console, GA4, Meta BM, Google Ads, GBP, IGs, FBs, TikTok, YouTube, WhatsApp Business, mails. *Responsable: dueño + lead. 4h.*
- [ ] Cambiar todas las contraseñas a nuevas, fuertes, almacenadas en 1Password. *Responsable: lead marketing. 2h.*
- [ ] Activar 2FA en TODAS las cuentas. *Responsable: lead marketing. 1h.*
- [ ] Transferir propiedad de cuentas a mails corporativos (no Gmails personales). *Responsable: dueño. 2h.*
- **Criterio de éxito:** planilla completa con 100% de los accesos centralizados en cuenta corporativa con 2FA.

### 1.3 Consolidación de Facebooks
- [ ] Definir cuál FB queda como oficial. Sugerencia: el de 256 seguidores ("Control Group Medicina Masculina" con tapa "Sabemos cómo ayudarte"). *Responsable: dueño. 30min.*
- [ ] En Meta Business Suite → Configuración → Páginas: ver si las 3 páginas están en el mismo BM. *Responsable: lead marketing. 30min.*
- [ ] Si están en el mismo BM: solicitar fusión de páginas (Configuración de la página → Fusionar páginas duplicadas). *Responsable: lead marketing. 1h.*
- [ ] Si no se pueden fusionar: en las 2 secundarias agregar una publicación fijada que diga "Esta página está en desuso. Seguinos en [link página oficial]" y archivarlas. *Responsable: CM. 1h.*
- [ ] Renombrar la página oficial a "Control Group Salud" (una sola marca pública). *Responsable: lead marketing. 30min.*
- **Criterio de éxito:** una sola página Facebook activa, las otras dos redireccionan o están claramente marcadas como inactivas.

### 1.4 Centralización en Meta Business Manager
- [ ] Crear (si no existe) o consolidar Meta BM bajo cuenta corporativa. *Responsable: lead marketing. 1h.*
- [ ] Importar páginas FB, cuentas IG, píxel, catálogos, WhatsApp Business. *Responsable: lead marketing. 2h.*
- [ ] Asignar roles a quienes corresponda (admin solo dueño + lead; editor para CM y performance). *Responsable: lead marketing. 1h.*
- **Criterio de éxito:** un solo BM con todo dentro, accesos asignados, sin cuentas personales sueltas con permisos.

---

## SEMANA 2 — Fundaciones de reputación

### 2.1 Google Business Profile (lo más alto-ROI)
- [ ] Reclamar/verificar GBP de Córdoba (Rondeau 65). *Responsable: dueño. 1h + espera correo postal de Google ~5–14 días.*
- [ ] Crear/verificar GBP CABA (Arenales 1611). *Responsable: dueño. 1h.*
- [ ] Crear/verificar GBP Mendoza (Av. San Martín Sur 36, Godoy Cruz). *Responsable: dueño. 1h.*
- [ ] En cada ficha completar: categoría principal "Médico" + secundaria "Centro médico", servicios (Disfunción eréctil, Eyaculación precoz, Falta de deseo), horarios, teléfono, sitio web, descripción 750 caracteres con keywords. *Responsable: CM. 3h.*
- [ ] Subir 15–20 fotos reales por sede: fachada, recepción, consultorio, médicos, sala de espera. NO stock. *Responsable: CM + sedes. 4h.*
- [ ] Activar mensajes directos en la ficha (atajo a WhatsApp). *Responsable: CM. 30min.*
- **Criterio de éxito:** 3 fichas verificadas, completas al 100%, con fotos propias.

### 2.2 Gestión de reseñas existentes (crisis de reputación)
- [ ] Listar las 15 reseñas actuales en una planilla con: autor, estrellas, fecha, texto, respondida sí/no. *Responsable: CM. 1h.*
- [ ] Redactar respuesta a CADA reseña, incluso las viejas, especialmente las negativas. Tono: empático, sin discutir, ofreciendo contacto directo del director médico. *Responsable: lead marketing + dueño aprueba. 3h.*
- [ ] Publicar las respuestas (1 por día durante 15 días, para no parecer automatizado). *Responsable: CM. 15min/día.*
- [ ] Para reseñas claramente falsas o que violan políticas (insultos, datos falsos): reportarlas vía GBP → Tres puntos → Marcar como inapropiada. *Responsable: CM. 1h.*
- **Criterio de éxito:** 100% de reseñas con respuesta, 2–3 falsas reportadas y eventualmente eliminadas.

### 2.3 Sistema de captación de reseñas nuevas
- [ ] Generar link corto de cada GBP (botón "Pedir reseñas" dentro de la ficha) → guardar los 3 links. *Responsable: CM. 30min.*
- [ ] Crear plantilla de mensaje WhatsApp para enviar 24h después de cada consulta: *"Hola [nombre], gracias por confiar en Control Group Salud. Si te sirvió la consulta, ¿nos dejarías tu experiencia en Google? Nos ayuda muchísimo a llegar a más personas que la necesitan. [link]. Gracias 🙏"*. *Responsable: lead. 30min.*
- [ ] Capacitar a recepción para enviar este mensaje sistemáticamente. *Responsable: lead marketing. 1h capacitación.*
- [ ] Imprimir tarjetitas en cada sede con QR a la ficha de Google para entregar en mostrador después de la consulta. *Responsable: diseñador + imprenta. 2 días.*
- [ ] Crear meta: 5 reseñas nuevas por semana por sede → 60 reseñas/mes total. *Responsable: lead.*
- [ ] Configurar alerta en Looker Studio o Google Alerts cada vez que entra una reseña nueva. *Responsable: lead marketing. 30min.*
- **Criterio de éxito:** al mes 3, promedio Google sube de 3,3 a 4,2+ y hay 50+ reseñas nuevas.

### 2.4 WhatsApp Business profesional
- [ ] Elegir proveedor de WhatsApp Business API: 360dialog (recomendado para AR), Twilio o Meta directo. *Responsable: lead + dueño. 2h investigación.*
- [ ] Contratar y verificar el número único nacional (puede ser el 0810 portado a WhatsApp o un nuevo número). *Responsable: lead. 5 días incluyendo verificación de Meta.*
- [ ] Configurar perfil: nombre comercial, descripción, dirección, horarios, sitio web, logo. *Responsable: CM. 1h.*
- [ ] Diseñar flujo de bot de primer contacto: saludo → "¿Qué te trae?" (DE / EP / Falta de deseo / Otro) → "¿En qué sede?" (Córdoba / CABA / Mendoza) → "¿Querés agendar turno?" → captura datos y deriva a humano. *Responsable: lead + bot specialist. 8h.*
- [ ] Implementar bot en plataforma (ManyChat, Trengo, Respond.io o nativo del API). *Responsable: bot specialist. 1 semana.*
- [ ] Capacitar a recepción para tomar la conversación cuando el bot deriva. *Responsable: lead. 2h.*
- **Criterio de éxito:** todas las consultas entrantes pasan por flujo trackeado, con tiempo de primera respuesta <5min en horario laboral.

---

## SEMANA 3 — Tracking, web y landings

### 3.1 Tracking completo (sin esto el resto es a ciegas)
- [ ] Crear cuenta GA4. *Responsable: lead. 1h.*
- [ ] Crear contenedor Google Tag Manager (GTM) e instalar en la web (pedir a Indigo). *Responsable: dev. 1 día.*
- [ ] Crear Meta Pixel y configurar Conversions API (CAPI) — crítico en 2026 para categorías sensibles. *Responsable: performance. 1 día.*
- [ ] Definir eventos de conversión a trackear:
  - `click_whatsapp` (cualquier botón de WhatsApp)
  - `click_call` (cualquier botón de teléfono)
  - `form_submit` (formularios de contacto)
  - `appointment_request` (cuando el bot/recepción confirma turno)
  - `appointment_completed` (después de la consulta — manual desde sistema interno)
  - `purchase` (Max Sex, cuando exista)
- [ ] Implementar cada evento en GTM con disparadores correctos. *Responsable: dev + performance. 2 días.*
- [ ] Verificar con Google Tag Assistant y Meta Pixel Helper que todos los eventos disparan. *Responsable: performance. 4h.*
- [ ] Conectar GA4 con Google Ads para importar conversiones. *Responsable: performance. 1h.*
- [ ] Crear plantilla de UTMs estandarizada (utm_source, utm_medium, utm_campaign, utm_content, utm_term). Usarla en TODO link de campaña. *Responsable: lead. 1h.*
- **Criterio de éxito:** podés ver en GA4 cuántos chats WhatsApp se generaron ayer, desde qué fuente, con qué creativo. Si no podés ver eso, no terminaste.

### 3.2 SEO técnico y mejoras de la web
- [ ] Pedir a Indigo (o nuevo dev) actualización de WordPress + Elementor a última versión estable. *Responsable: dev. 1 día.*
- [ ] Auditoría con PageSpeed Insights. Meta: LCP <2,5s en mobile, CLS <0,1. *Responsable: dev. 2 días para optimizar.*
- [ ] Implementar schema markup `MedicalBusiness` y `Physician` en cada sede. *Responsable: dev. 1 día.*
- [ ] Crear landing page por servicio:
  - `/disfuncion-erectil`
  - `/eyaculacion-precoz`
  - `/falta-de-deseo`
  Cada una con copy específico, FAQs, testimonio en video, CTA WhatsApp+llamada. *Responsable: lead + dev + copywriter. 1 semana.*
- [ ] Crear landing por sede:
  - `/cordoba`
  - `/caba`
  - `/mendoza`
  Con mapa, equipo, horarios, formas de contacto. *Responsable: dev. 3 días.*
- [ ] Verificar Google Search Console: enviar sitemap, revisar errores de indexación. *Responsable: lead. 2h.*
- **Criterio de éxito:** 6 landings nuevas indexadas, PageSpeed mobile >80, sin errores críticos en Search Console.

### 3.3 Landings de campaña (separadas de la web principal)
- [ ] Crear `/recupera-tu-confianza` (campaña 25–40): hero con doctor a cámara, copy desestigmatizador, formulario 3 campos (nombre + WhatsApp + sede), botón gigante WhatsApp. *Responsable: dev + copy. 3 días.*
- [ ] Crear `/volve-a-sentirte` (campaña 60–90): tipografía 18px+, 1 solo CTA (llamar), número 0810 destacado en hero, fotos médicos con matrículas, mapa de sedes, testimonio video. *Responsable: dev + copy. 3 días.*
- [ ] A/B test setup desde el día 1: variante A vs B en headline, foto y CTA. *Responsable: performance. 2h.*
- **Criterio de éxito:** 2 landings vivas, con tracking, listas para recibir tráfico de pauta.

---

## SEMANA 4 — Contenido base y arranque de pauta

### 4.1 Producción de contenido inicial (banco de piezas)
- [ ] Reunión de brief con médico vocero: definir 20 temas de educación médica (DE causas, EP tipos, mitos, diabetes y sexualidad, post-prostatectomía, ansiedad, etc.). *Responsable: lead + médico. 2h.*
- [ ] Sesión de filmación 1: grabar 10 reels educativos con el médico (1 día de producción, 10 piezas de 30–60s). *Responsable: editor + médico + lead. 1 día.*
- [ ] Sesión de filmación 2: grabar 5 testimonios de pacientes que dieron consentimiento (anónimos: solo voz o de espaldas si quieren). *Responsable: editor. 1 día.*
- [ ] Editar piezas con subtítulos quemados (90% de la gente mira sin audio), branding sutil, CTA al final. *Responsable: editor. 1 semana.*
- [ ] Diseñar 15 piezas estáticas: 5 educativas, 5 institucionales (matrículas, sedes, equipo), 5 testimonios escritos. *Responsable: diseñador. 1 semana.*
- **Criterio de éxito:** banco de 30 piezas listas para publicar y para usar como creativos de ads.

### 4.2 Calendario editorial mes 1
- [ ] Definir frecuencia: Instagram 4 posts/semana (3 reels + 1 carrusel) + 1 historia/día. Facebook 3 posts/semana (mismo contenido adaptado). *Responsable: lead. 1h.*
- [ ] Cargar calendar en Metricool/Later con el contenido de los próximos 30 días. *Responsable: CM. 4h.*
- [ ] Definir hashtags fijos (10–15) + variables por post. *Responsable: CM. 1h.*
- **Criterio de éxito:** 30 días con contenido cargado y programado, no improvisado.

### 4.3 Setup de campañas Meta Ads (ambas audiencias)
- [ ] Estructura de cuenta Meta Ads:
  ```
  Campaña 1 — Mensajes — 25–40
   └ AdSet 1A — IG/FB Mobile — Adv+ audience
   └ AdSet 1B — Reels — 25–40 hombres AR
  Campaña 2 — Mensajes — 60–90
   └ AdSet 2A — FB Mobile — 60+ hombres AR
   └ AdSet 2B — FB Desktop — 60+ hombres AR
  Campaña 3 — Conversiones (turno) — 25–40
   └ ...
  Campaña 4 — Conversiones (llamada) — 60–90
   └ ...
  Campaña 5 — Retargeting — todos
  ```
  *Responsable: performance. 4h.*
- [ ] Cargar creativos en biblioteca de Meta (mínimo 3 por adset para que rote). *Responsable: performance. 2h.*
- [ ] Pasar todos los textos por checklist anti-rechazo:
  - [ ] No menciona placer, potencia, mejora sexual
  - [ ] No imágenes sugestivas, sin parejas en cama, sin pieles desnudas
  - [ ] No promete resultados garantizados como claim único
  - [ ] Habla de "condición médica", "salud", "calidad de vida"
  - [ ] Edad mínima 18+ configurada en cada adset
- [ ] Configurar presupuesto inicial bajo: USD 20–30/día por campaña durante 14 días de aprendizaje. *Responsable: performance.*
- [ ] Activar.
- **Criterio de éxito:** campañas aprobadas sin rechazos, eventos disparándose en GA4 y Meta Events Manager.

### 4.4 Setup Google Ads
- [ ] Crear campañas Search separadas por audiencia:
  - "Search 25–40 — EP" (keywords: eyaculación precoz, eyaculo rápido, cómo durar más, etc.)
  - "Search 25–40 — DE joven" (disfunción eréctil joven, no se me para con ansiedad, etc.)
  - "Search 60–90 — DE orgánica" (disfunción eréctil diabetes, impotencia después de próstata, no logro erección 70 años, etc.)
  - "Search marca" (control group salud, control group medicina sexual — defensivo)
  *Responsable: performance. 8h.*
- [ ] Para cada campaña: 3 grupos de anuncios mínimo, 3 anuncios por grupo (RSA), 15 keywords cuidadosamente elegidas (no usar amplia), extensiones (sitelinks, llamada, ubicación). *Responsable: performance. 1 día por campaña.*
- [ ] Listas de palabras clave negativas (gratis, porno, viagra genérico, etc.). *Responsable: performance. 2h.*
- [ ] Geo-targeting: Córdoba capital + AMBA + Gran Mendoza. *Responsable: performance. 30min.*
- [ ] Presupuesto inicial: USD 15–25/día por campaña los primeros 14 días. *Responsable: performance.*
- **Criterio de éxito:** 4 campañas Search vivas, llegando a tope de presupuesto sin sobre-impresiones bajas (= keywords bien elegidas).

---

# PARTE 2 — OPERACIÓN MENSUAL RECURRENTE

A partir del mes 2, esto pasa a ser el ritmo de trabajo permanente.

## Ritual semanal
- [ ] **Lunes 9:00** — Standup de marketing 30min: qué se publica esta semana, qué ads están corriendo, qué hay que aprobar.
- [ ] **Martes** — Producción de contenido: 2–3 piezas nuevas.
- [ ] **Miércoles** — Revisión de pauta: ajustes de presupuesto, pausa de creativos cansados, lanzamiento de nuevos.
- [ ] **Jueves** — Atención de comunidad: responder DMs y comentarios pendientes, gestionar reseñas nuevas.
- [ ] **Viernes 16:00** — Informe semanal de KPIs (CAC, conversiones, costos, mejores creativos).

## Ritual mensual
- [ ] **Primer lunes del mes** — Reunión estratégica 90min: revisión de KPIs vs. objetivos, decisiones de presupuesto, planificación del mes siguiente.
- [ ] **Cierre de mes** — Informe ejecutivo de 1 página para el dueño: gastado, CAC, conversiones, top creativos, próximos pasos.

## Contenido orgánico (todos los meses)
- [ ] 12–16 piezas por mes: 8 reels educativos + 4 carruseles + 2–4 testimonios.
- [ ] 1 video largo (YouTube + Facebook) por mes: entrevista con un médico, 8–12 min.
- [ ] 4 artículos de blog SEO por mes (cada uno targeteando 1 keyword de cola larga).
- [ ] 20+ historias por mes con sub-temas, encuestas, FAQ.
- [ ] 1 sesión de filmación grupal por mes para producir todo de una vez (eficiencia).

## Gestión de reputación (todos los meses)
- [ ] Meta: 20+ reseñas nuevas Google entre las 3 sedes.
- [ ] Responder 100% de reseñas en <48h.
- [ ] Reportar reseñas falsas o difamatorias.
- [ ] Monitorear menciones de marca en redes (alertas, búsquedas semanales).

---

# PARTE 3 — CAMPAÑA 25–40 ("Recuperá tu confianza")

## Setup creativo
- [ ] Definir promesa central: *"Tiene nombre. Tiene solución. En una consulta."*
- [ ] Producir 3 conceptos creativos x 3 variantes cada uno = 9 piezas para testear:
  - **Concepto A** — Doctor habla a cámara: *"32% de los hombres tienen eyaculación precoz como trastorno clínico. No es falta de hombría, es un tema médico."*
  - **Concepto B** — Texto en pantalla con estadísticas + voz en off: desestigmatizador, "no te define".
  - **Concepto C** — Testimonio anónimo (paciente real, voz cambiada o de espaldas): "Yo pensé que era yo, era ansiedad. En una consulta lo resolvimos."
- [ ] Cada concepto en formato vertical 9:16 (Reels/TikTok/Stories) + cuadrado 1:1 (Feed) + horizontal 16:9 (YouTube).
- [ ] Subtítulos quemados en todas las piezas.
- [ ] Hook fuerte en los primeros 2 segundos (95% de retención depende de eso).

## Canales y mix de inversión (sobre el budget asignado a 25–40)
- [ ] 45% Meta Ads (IG Reels prioridad + FB feed).
- [ ] 25% Google Ads Search.
- [ ] 15% TikTok Ads (formato Spark Ads sobre contenido orgánico existente).
- [ ] 10% YouTube pre-roll (in-stream skippable de 15s).
- [ ] 5% retargeting (visitantes web últimos 30 días, no convertidos).

## Targeting Meta
- [ ] Hombres 25–40 años.
- [ ] Geo: Argentina con énfasis en Córdoba capital, CABA, GBA, Mendoza.
- [ ] Intereses: fitness, vida sana, paternidad, masculinidad consciente. NO usar "salud sexual" como interés directo (penaliza por categoría sensible).
- [ ] Idioma: español.
- [ ] Activar Advantage+ Audience.
- [ ] Excluir: visitantes que ya completaron formulario en últimos 30 días.

## Targeting Google Ads
- [ ] Match types: 70% frase, 20% amplia modificada, 10% exacta.
- [ ] Lista de keywords negativas exhaustiva: gratis, porno, viagra, sildenafil, casero, remedio casero, medicación, etc.
- [ ] Audiencias en segmento: Salud y belleza > Salud, Padres jóvenes.
- [ ] Horarios: ajustar para más bid entre 21h y 1am (cuando el target busca este tipo de info).

## KPIs target (primeros 90 días)
- [ ] CPM <USD 5 (Meta) — si sube de USD 8 hay problema creativo/categoría.
- [ ] CTR >1,5% en Reels, >0,8% en feed.
- [ ] Costo por chat WhatsApp <USD 4.
- [ ] Costo por turno agendado <USD 15.
- [ ] Tasa de turno → consulta efectiva >60%.
- [ ] CAC final (gasto / consultas pagas) <USD 25.

---

# PARTE 4 — CAMPAÑA 60–90 ("Volvé a sentirte vos")

## Setup creativo
- [ ] Promesa central: *"Diabetes, hipertensión o haber pasado por una cirugía no te condena. Tenemos solución hasta los 90 años."*
- [ ] 3 conceptos x 3 variantes = 9 piezas:
  - **Concepto A** — Médico (60+) habla a cámara con autoridad: tratamos pacientes con comorbilidades, 25+ años de experiencia.
  - **Concepto B** — Testimonio paciente real 65+ (con consentimiento): "Pensé que ya no había vuelta atrás. En una consulta cambió todo."
  - **Concepto C** — Informativo: gráfica simple con factores que afectan la erección a partir de los 60 años + invitación a consulta.
- [ ] Tipografía grande, ritmo más pausado, sin música agresiva.
- [ ] Número 0810 visible en todos los creativos.

## Canales y mix
- [ ] 40% Facebook Ads (acá vive el 60+).
- [ ] 25% Google Ads Search.
- [ ] 15% YouTube (in-stream no-skippable 15s + bumpers 6s en contenido de salud cardiovascular).
- [ ] 10% WhatsApp Broadcast a base propia + email a base propia.
- [ ] 10% offline:
  - Radio AM (Cba: AM 580 Cadena 3, Mitre Córdoba; CABA: Mitre AM 790, Continental AM 590; Mza: LV10).
  - Avisos en sección Salud de diarios locales (La Voz del Interior, Los Andes).
  - Folletería en consultorios de cardiología, urología, diabetología aliados.

## Targeting Meta (Facebook)
- [ ] Hombres 60+ años.
- [ ] Geo: AR con foco mismas ciudades.
- [ ] Intereses: salud cardiovascular, diabetes, jubilación, golf, pesca, asociaciones de jubilados.
- [ ] Excluir: gente que viva fuera de zonas servidas (cada sede tiene radio de 100km).

## Targeting Google Ads
- [ ] Keywords core: "disfunción eréctil diabetes", "impotencia después de cirugía próstata", "no logro erección 70 años", "tratamiento disfunción eréctil adulto mayor", "viagra no me funciona qué hago", "medicación cardíaca y erección".
- [ ] Concordancia: 80% frase + 20% exacta (este target no busca con sinónimos raros).
- [ ] Programar bid +50% en horario 10–14h (cuando este grupo está más activo online).
- [ ] Extensión de llamada gigante con tracking.

## KPIs target
- [ ] CPM <USD 3 (es público más barato en Meta).
- [ ] CTR >1,2% en Facebook feed.
- [ ] Costo por llamada al 0810 <USD 8 (este target llama más de lo que chatea).
- [ ] Costo por turno agendado <USD 20.
- [ ] CAC <USD 35 (ticket es mayor, justifica más CAC).

## Recordatorios específicos para este target
- [ ] Asegurar que recepción atiende rápido y con paciencia en teléfono (este grupo abandona si suena más de 4 timbres).
- [ ] Capacitar para explicar 2 veces si hace falta, sin sonar condescendiente.
- [ ] Tener disponibilidad de turnos en horario de mañana (preferencia clara).
- [ ] Folletería física en sede para que se lleven (este grupo todavía valora lo impreso).

---

# PARTE 5 — E-COMMERCE MAX SEX (mes 3 al 6, en paralelo)

## Pre-launch: marco legal y producto (mes 3)

### 5.1 Validación legal (CRÍTICO antes de cualquier inversión)
- [ ] Contratar consultor regulatorio ANMAT especializado en suplementos. *Responsable: dueño. 1 semana búsqueda.*
- [ ] Definir línea de productos. Opciones realistas:
  - Suplementos dietarios (maca, ginseng, zinc, L-arginina, tribulus): necesitan RNE + RNPA. ~3–6 meses de tramitación si los importan o producen.
  - Productos cosméticos íntimos (lubricantes, retardantes): necesitan habilitación ANMAT.
  - **NO se pueden vender sin receta:** sildenafil, tadalafil, vardenafil, paroxetina, dapoxetina. Olvidarse de esa vía vía e-commerce abierto.
- [ ] Para cada producto: tener documentación regulatoria al día antes de listarlo. *Responsable: dueño + consultor. 2–6 meses según producto.*
- [ ] Términos y Condiciones, Política de Privacidad, Política de Devoluciones — redactadas por abogado, no copiadas de plantilla genérica. *Responsable: legal. 1 semana.*
- **Criterio:** todos los productos a lanzar tienen RNPA o equivalente.

### 5.2 Marca y posicionamiento
- [ ] Definir si "Max Sex" se mantiene como nombre o se cambia. Pros: pegadizo, claro. Contras: en Meta/Google es bandera roja inmediata para clasificación de categoría sensible y dificulta pauta. Sugerencia: evaluar nombre más "wellness" tipo "Max Vitality", "MX Salud", "Control+ Wellness". *Responsable: dueño. Decisión clave.*
- [ ] Diseñar identidad visual (logo, paleta, tipografía). *Responsable: diseñador. 2 semanas.*
- [ ] Packaging discreto y profesional. *Responsable: diseñador + proveedor. 1 mes.*
- [ ] Conexión narrativa con clínica: *"by Control Group — 25 años de medicina sexual masculina."* *Responsable: lead. 1 día redacción.*

### 5.3 Plataforma e-commerce
- [ ] Contratar Tiendanube plan Avanzado. *Responsable: dueño. 1 día.*
- [ ] Configurar dominio (`maxsex.com.ar` o el que se elija). *Responsable: dev. 1 día.*
- [ ] Integrar medios de pago: MercadoPago + Modo + transferencia + Naranja X. *Responsable: dev. 2 días.*
- [ ] Integrar envíos: Andreani + OCA + Correo Argentino (con cobertura nacional). *Responsable: dev. 2 días.*
- [ ] Configurar empaque: caja exterior sin marca visible (solo dirección + remitente neutro). *Responsable: lead + proveedor. 1 semana.*
- [ ] Páginas de producto: foto profesional + descripción técnica + ingredientes + modo de uso + claims permitidos por ANMAT + opiniones. *Responsable: copy + fotógrafo. 1 mes producción completa.*
- [ ] Conectar Meta Pixel y CAPI al e-commerce. *Responsable: performance. 1 día.*
- [ ] Conectar GA4 con eventos de e-commerce (add_to_cart, begin_checkout, purchase). *Responsable: performance. 1 día.*

## Launch (mes 4–5)

### 5.4 Pre-launch: lista de espera
- [ ] Crear landing `/proximamente` con captura de email + WhatsApp. *Responsable: dev. 2 días.*
- [ ] Promesa: 20% off de fundador + envío gratis para los primeros 500. *Responsable: lead.*
- [ ] Promocionar la lista de espera durante 30 días vía:
  - Pacientes existentes (WhatsApp + mail).
  - Followers de redes (orgánico + algo de pauta).
  - Cross-promo en consultorios (QR en sala de espera).
- [ ] Meta: 500–1.000 leads pre-launch. *Responsable: lead.*

### 5.5 Soft launch (solo a la lista, 1 semana)
- [ ] Abrir tienda con código exclusivo. *Responsable: lead + dev.*
- [ ] Medir todo: tasa de conversión, AOV, abandono de carrito, tiempo en sitio. *Responsable: performance. Diario.*
- [ ] Ajustar fricciones detectadas (formularios, métodos de pago, tiempos de envío).
- [ ] Pedir reseñas a los primeros 50 compradores.

### 5.6 Launch público (día 1 de la fase comercial)
- [ ] Campaña de awareness Meta Ads. *Responsable: performance.*
- [ ] Google Shopping para productos elegibles (suplementos genéricos, sí; productos "potenciadores", no). *Responsable: performance. 1 semana setup.*
- [ ] Mercado Libre Tienda Oficial — paralelo, no es canibalización, es adquisición. *Responsable: lead. 2 semanas setup.*
- [ ] Email blast a base completa. *Responsable: CM.*
- [ ] Comunicado a prensa especializada (medios salud, lifestyle masculino). *Responsable: lead o PR freelance.*

### 5.7 Operación post-launch (mensual recurrente)
- [ ] Retargeting carrito abandonado (email + Meta Ads dinámico).
- [ ] Email flows: bienvenida, post-compra, recompra a 45 días (suplementos rinden 1 mes), cross-sell.
- [ ] Programa de referidos: 15% de descuento por cada amigo que compra.
- [ ] Bundling: combos terapéuticos (ej. "Programa 90 días").
- [ ] Cross-sell con clínica: cupón Max Sex post-consulta + invitación a consulta post-compra Max Sex.

### 5.8 KPIs Max Sex (primeros 6 meses post-launch)
- [ ] CAC <USD 20.
- [ ] AOV >USD 60.
- [ ] ROAS objetivo: 3x mínimo, 5x objetivo.
- [ ] Tasa de recompra a 60 días >25%.
- [ ] Reseñas verificadas en productos >10 por producto en 90 días.

---

# PARTE 6 — MEDICIÓN, INFORMES Y ESCALA

## Dashboard único (Looker Studio)
- [ ] Construir dashboard con tabs:
  - **Resumen ejecutivo:** gasto total, consultas, ventas, CAC, ROAS.
  - **Clínica 25–40:** por canal, por creativo, por sede.
  - **Clínica 60–90:** ídem.
  - **Max Sex:** ventas, AOV, top productos, CAC por canal.
  - **Reputación:** evolución reseñas Google, sentiment, menciones.
  - **Orgánico:** crecimiento de seguidores, engagement rate, top contenidos.
- [ ] Acceso compartido al dueño con vista de solo lectura. *Responsable: lead. 1 semana setup.*

## Reportes
- [ ] **Semanal (viernes):** 1 página, 6 métricas clave, 3 highlights, 3 alertas. *Responsable: lead.*
- [ ] **Mensual (primer lunes):** presentación de 10 slides con análisis y decisiones del mes siguiente. *Responsable: lead.*
- [ ] **Trimestral:** revisión estratégica con dueño — qué escalar, qué cortar, qué probar nuevo.

## Cuándo escalar (señales claras)
- [ ] Si una campaña tiene CAC <objetivo durante 14 días seguidos → subir 30% de presupuesto.
- [ ] Si un creativo tiene CTR >2x media → producir 3 variantes y replicar el ángulo.
- [ ] Si una keyword convierte mejor que su grupo → moverla a grupo propio con bid más alto.
- [ ] Si una sede llena agenda 3 semanas seguidas → priorizar contenido y pauta de esa sede.

## Cuándo cortar
- [ ] Creativo con CTR <0,5% después de 5.000 impresiones → pausar.
- [ ] Adset que no genera conversiones después de USD 100 gastados → pausar.
- [ ] Keyword con CTR <1% y 0 conversiones después de 50 clics → negativa.
- [ ] Canal completo con ROAS <1 después de 30 días → reasignar a canal ganador.

---

# ANEXO A — PRESUPUESTO MENSUAL ORIENTATIVO (mes 2 en adelante)

| Línea | Mínimo | Recomendado | Agresivo |
|---|---|---|---|
| Pauta Meta 25–40 | USD 600 | 1.500 | 3.000 |
| Pauta Meta 60–90 | USD 500 | 1.200 | 2.500 |
| Google Ads | USD 700 | 1.800 | 3.500 |
| YouTube + TikTok | USD 200 | 600 | 1.500 |
| Pauta Max Sex (desde mes 4) | USD 500 | 1.500 | 4.000 |
| Producción contenido | USD 500 | 1.200 | 2.500 |
| Equipo (CM + perf + diseño freelance) | USD 1.200 | 2.500 | 5.000 |
| Herramientas SaaS | USD 250 | 400 | 600 |
| Offline (radio + diarios + folletería) | USD 0 | 800 | 2.000 |
| **TOTAL mensual** | **USD 4.450** | **USD 11.500** | **USD 24.600** |

Empezar en escala "mínimo" 60 días, evaluar, escalar.

---

# ANEXO B — CHECKLIST RÁPIDA DE LO QUE NO PODÉS HACER

- ❌ Hablar de "placer", "potencia", "rendimiento sexual" en ads de Meta o Google.
- ❌ Imágenes de parejas en cama, pieles desnudas, posturas sugestivas.
- ❌ Promesas tipo "100% garantizado", "cura segura", "resultados milagrosos".
- ❌ Vender medicamentos recetados por e-commerce abierto.
- ❌ Hacer claims terapéuticos en suplementos sin respaldo ANMAT.
- ❌ Usar testimonios sin consentimiento firmado por escrito.
- ❌ Antes/después gráfico del cuerpo.
- ❌ Targeting por orientación sexual o estado civil (Meta restringido).
- ❌ Mezclar marca clínica con e-commerce de forma confusa (separar claramente quién es quién).
- ❌ Responder reseñas negativas con tono defensivo o agresivo.

---

# ANEXO C — PLANTILLAS RÁPIDAS

## C.1 Respuesta a reseña negativa
> Hola [nombre], gracias por tomarte el tiempo de dejar tu opinión. Lamentamos que tu experiencia no haya sido la esperada y queremos entender qué pasó para mejorar. ¿Podés escribirnos a direccion@controlgroupsalud.com.ar para que el director médico te contacte personalmente? Tu feedback es importante para nosotros.

## C.2 Mensaje WhatsApp post-consulta
> Hola [nombre], soy [nombre] de Control Group Salud. Esperamos que estés bien después de tu consulta de ayer. Si te sirvió y te animás, nos ayuda muchísimo que dejes tu experiencia acá 👉 [link]. Cualquier duda que te haya quedado, escribinos. Gracias por confiar 🙏

## C.3 Bot WhatsApp primer contacto
> 👋 Hola, bienvenido a Control Group Salud. Para orientarte mejor, ¿cuál es tu motivo de consulta?
> 1️⃣ Disfunción eréctil
> 2️⃣ Eyaculación precoz
> 3️⃣ Falta de deseo
> 4️⃣ Otro
> 5️⃣ Hablar con una persona

## C.4 Email lista de espera Max Sex
> Asunto: Estás dentro. Reservado tu 20% de fundador.
>
> Hola [nombre],
>
> Quedaste entre los primeros 500 en la lista de Max Sex by Control Group. Cuando abramos en [mes], te avisamos 24h antes que al resto y tu código MAX20 te da:
> - 20% off en tu primer pedido
> - Envío gratis a todo el país
> - Acceso a la línea de consulta médica gratuita por 30 días
>
> Gracias por la confianza. Te avisamos pronto.

---

# ANEXO D — CRONOGRAMA RESUMIDO (6 meses)

| Mes | Foco principal | Hitos |
|---|---|---|
| **Mes 1** | Limpieza + fundaciones | IGs recuperados · GBP verificados · WhatsApp API vivo · Tracking completo · Landings live |
| **Mes 2** | Arranque campañas + contenido | Campañas 25–40 y 60–90 en aprendizaje · 12 piezas orgánicas/mes · 30+ reseñas nuevas |
| **Mes 3** | Optimización + pre-launch Max Sex | CAC bajando · ROAS de Search >3 · Lista espera Max Sex 500+ leads |
| **Mes 4** | Lanzamiento Max Sex (soft) | Tienda viva · primeros 100 pedidos · ajustes · reseñas iniciales |
| **Mes 5** | Launch público Max Sex + escala clínica | Pauta Max Sex en marcha · Mercado Libre vivo · clínica con agenda llena en al menos 1 sede |
| **Mes 6** | Análisis y plan H2 | Revisión completa · decisiones de escala · plan próximos 6 meses |

---

**Última nota:** Este plan asume ejecución sostenida. La diferencia entre clínicas que funcionan y las que no, en este vertical, no es la calidad médica (suelen ser similares) sino la consistencia operativa del marketing y la reputación. Hacer el 70% de esto bien durante 6 meses vale 10x más que hacer el 100% durante 2 meses y abandonarlo.
