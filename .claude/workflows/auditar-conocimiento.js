export const meta = {
  name: 'auditar-conocimiento',
  description: 'Audita la base de conocimientos interna de Inenco nota por nota: contradicciones con la documentacion oficial, datos desactualizados por version, contexto faltante y caveats sin cerrar',
  whenToUse: 'Revision periodica del corpus, o antes de apoyarse fuerte en el para un proyecto nuevo. No modifica archivos: produce un informe con el trabajo pendiente.',
  phases: [
    { title: 'Inventariar', detail: 'listar las notas y clasificarlas por tema' },
    { title: 'Auditar', detail: 'una auditoria por nota, contrastando contra la documentacion oficial' },
    { title: 'Informar', detail: 'informe consolidado y priorizado' },
  ],
}

const INVENTARIO = {
  type: 'object',
  properties: {
    notas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ruta: { type: 'string' },
          tema: { type: 'string' },
          version: { type: 'string', description: 'version de GeneXus que menciona la nota, o "no indica"' },
          prioridad: { type: 'string', description: 'alta | media | baja segun cuanto se apoye el equipo en esta nota' },
        },
        required: ['ruta', 'tema'],
      },
    },
  },
  required: ['notas'],
}

const AUDITORIA = {
  type: 'object',
  properties: {
    ruta: { type: 'string' },
    hallazgos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tipo: {
            type: 'string',
            description: 'contradiccion-oficial | desactualizado | contexto-faltante | caveat-abierto | riesgo-de-seguridad | hueco-tematico',
          },
          severidad: { type: 'string', description: 'alta | media | baja' },
          detalle: { type: 'string' },
          evidencia: { type: 'string', description: 'fragmento de la nota y URL o referencia que la contradice o actualiza' },
          accion: { type: 'string', description: 'que habria que corregir, agregar o verificar' },
        },
        required: ['tipo', 'severidad', 'detalle', 'accion'],
      },
    },
    sigueVigente: { type: 'boolean', description: 'false si la nota describe algo que ya no aplica en 16/17/18' },
  },
  required: ['ruta', 'hallazgos', 'sigueVigente'],
}

const CONTEXTO = [
  'Equipo de Inenco: GeneXus 16 / 17 / 18 en IDE clasico, generadores Java y .NET,',
  'DBMS Oracle / MySQL / MariaDB / SQL Server. La KB es binaria: no hay artefactos .gx.',
  'Nada de ProductVersion >=19 aplica. Theme, ColorPalette y WorkPanel son legacy para',
  'GeneXus Next pero siguen vigentes para este equipo.',
].join(' ')

phase('Inventariar')

const inventario = await agent(
  [
    'Lista todas las notas .md de base-de-conocimientos-inenco/ (recursivo) y clasifica cada una.',
    '',
    CONTEXTO,
    '',
    'Para cada nota: leela lo suficiente para determinar su tema, la version de GeneXus que menciona,',
    'y que tan critica es para el trabajo diario del equipo.',
    'Marca prioridad baja a los reportes de investigacion que no son conocimiento GeneXus reutilizable.',
  ].join('\n'),
  { label: 'inventariar', phase: 'Inventariar', schema: INVENTARIO }
)

if (!inventario || !(inventario.notas || []).length) {
  return { error: 'No se pudo inventariar la base de conocimientos' }
}

const MAX_NOTAS = 10
const ordenadas = inventario.notas.slice().sort((a, b) => {
  const peso = { alta: 0, media: 1, baja: 2 }
  const pa = peso[a.prioridad] === undefined ? 1 : peso[a.prioridad]
  const pb = peso[b.prioridad] === undefined ? 1 : peso[b.prioridad]
  return pa - pb
})
const auditables = ordenadas.slice(0, MAX_NOTAS)

log(`Inventario: ${inventario.notas.length} nota(s); se auditan ${auditables.length}`)
if (ordenadas.length > MAX_NOTAS) {
  log(`Sin auditar en esta corrida: ${ordenadas.slice(MAX_NOTAS).map((n) => n.ruta).join(', ')}`)
}

phase('Auditar')

const auditorias = (
  await parallel(
    auditables.map((nota) => () =>
      agent(
        [
          `Audita esta nota de la base de conocimientos: ${nota.ruta}`,
          `Tema declarado: ${nota.tema}. Version mencionada: ${nota.version || 'no indica'}.`,
          '',
          CONTEXTO,
          '',
          'Leela completa y contrastala contra la documentacion oficial de GeneXus',
          '(wiki.genexus.com, docs.genexus.com, SAC) y contra nexa-genexus-18/references/.',
          '',
          'Busca especificamente:',
          '- contradiccion-oficial: la nota afirma algo que la documentacion contradice. OJO: cuando la',
          '  nota documenta explicitamente que la via oficial no funciono en un caso real, eso NO es un',
          '  error de la nota; registralo solo si la documentacion cambio desde entonces.',
          '- desactualizado: version, Upgrade, ruta de instalacion o version de dependencia superada',
          '  (por ejemplo com.genexus.android:*:1.2.1, rutas de GeneXus17, Tomcat 6, JDK 1.6).',
          '- contexto-faltante: no dice version, generador, DBMS o proyecto, y eso hace ambigua la receta.',
          '- caveat-abierto: la nota termina en algo no resuelto y nadie lo cerro. Deci que falta probar.',
          '- riesgo-de-seguridad: credenciales, IPs internas, connection strings, rutas con nombres de',
          '  usuario reales o datos de clientes que deberian ser placeholders.',
          '- hueco-tematico: falta un paso obvio para que la receta sea utilizable de punta a punta.',
          '',
          'No propongas reescribir el formato de prosa: es deliberado. Se conservador:',
          'reporta solo lo que puedas respaldar con evidencia concreta.',
        ].join('\n'),
        { label: `auditar:${nota.ruta.split('/').pop()}`, phase: 'Auditar', schema: AUDITORIA }
      )
    )
  )
).filter(Boolean)

const todos = auditorias.flatMap((a) => (a.hallazgos || []).map((h) => ({ ...h, ruta: a.ruta })))
const altas = todos.filter((h) => h.severidad === 'alta')
log(`Auditoria: ${todos.length} hallazgo(s), ${altas.length} de severidad alta`)

if (!todos.length) {
  return {
    notasAuditadas: auditorias.length,
    conclusion: 'Sin hallazgos: el corpus auditado esta consistente con la documentacion oficial.',
    sinAuditar: ordenadas.slice(MAX_NOTAS).map((n) => n.ruta),
  }
}

phase('Informar')

const informe = await agent(
  [
    'Consolida el informe de auditoria de la base de conocimientos de Inenco.',
    '',
    'Auditorias por nota (JSON):',
    JSON.stringify(auditorias),
    '',
    'Estructura del informe, en espanol y en markdown:',
    '1. Resumen: estado general del corpus en tres o cuatro oraciones.',
    '2. Accion inmediata: los hallazgos de severidad alta, agrupados por nota, con la correccion concreta.',
    '   Los riesgos de seguridad (credenciales, IPs, rutas con nombres de usuario reales) van primero.',
    '3. A revisar: severidad media, agrupado por tema.',
    '4. Notas que ya no aplican a 16/17/18, si hay alguna, con la justificacion.',
    '5. Huecos del corpus: temas que el equipo usa a diario y no estan documentados.',
    '6. Que registrar proximamente, en orden de valor.',
    '',
    'Cada item con la ruta de la nota y su evidencia. No propongas cambiar el formato de prosa',
    'de las notas: es deliberado. No inventes hallazgos para engrosar el informe.',
    '',
    'Tu texto de retorno es el informe que se le muestra al equipo.',
  ].join('\n'),
  { label: 'informe', phase: 'Informar', effort: 'high' }
)

return {
  notasAuditadas: auditorias.length,
  hallazgos: todos.length,
  severidadAlta: altas.length,
  sinAuditar: ordenadas.slice(MAX_NOTAS).map((n) => n.ruta),
  informe,
}
