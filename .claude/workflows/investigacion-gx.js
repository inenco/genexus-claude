export const meta = {
  name: 'investigacion-gx',
  description: 'Investiga a fondo una consulta GeneXus en el corpus interno, las referencias Nexa y la documentacion oficial, y verifica cada elemento del codigo propuesto antes de entregarlo',
  whenToUse: 'Consulta GeneXus dificil o de alto impacto, donde entregar codigo con una propiedad o metodo inventado saldria caro. Pasa la consulta completa en args (incluyendo version, generador y DBMS si se conocen).',
  phases: [
    { title: 'Relevar', detail: 'un agente por fuente: corpus Inenco, referencias Nexa, documentacion oficial' },
    { title: 'Redactar', detail: 'propuesta de solucion con la lista explicita de elementos a verificar' },
    { title: 'Verificar', detail: 'un verificador adversarial por elemento usado en el codigo' },
    { title: 'Consolidar', detail: 'respuesta final, solo con lo que sobrevivio la verificacion' },
  ],
}

const CONSULTA = typeof args === 'string' ? args : JSON.stringify(args || '')

if (!CONSULTA || CONSULTA === '""') {
  log('Falta la consulta. Invoca el workflow pasando la pregunta en args.')
  return { error: 'args vacio: se esperaba la consulta GeneXus' }
}

const CONTEXTO = [
  'Contexto del equipo: Inenco, GeneXus 16 / 17 / 18 en IDE clasico, generadores Java y .NET,',
  'DBMS Oracle / MySQL / MariaDB / SQL Server. La KB es binaria (.gxw): NO existen archivos .gx,',
  'ni el arbol src/, ni gxnext, ni el MCP server. Nada marcado ProductVersion >=19 aplica.',
  'Los objetos Theme, ColorPalette y WorkPanel son legacy para Nexa pero siguen vigentes aca.',
].join(' ')

const HALLAZGOS = {
  type: 'object',
  properties: {
    fuente: { type: 'string', description: 'corpus-inenco | referencias-nexa | documentacion-oficial' },
    hallazgos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          afirmacion: { type: 'string' },
          cita: { type: 'string', description: 'ruta de archivo o URL, con fragmento textual breve' },
          version: { type: 'string', description: 'restriccion de version/Upgrade si la hay, o "sin restriccion"' },
          caveat: { type: 'string', description: 'limitacion o contradiccion asociada, o cadena vacia' },
        },
        required: ['afirmacion', 'cita'],
      },
    },
    huecos: { type: 'array', items: { type: 'string' }, description: 'que parte de la consulta esta fuente no cubre' },
  },
  required: ['fuente', 'hallazgos', 'huecos'],
}

const PROPUESTA = {
  type: 'object',
  properties: {
    respuestaBreve: { type: 'string' },
    codigo: { type: 'string', description: 'codigo GeneXus separado por pestaña del objeto (Source, Rules, Conditions, Variables, Properties)' },
    pasosIde: { type: 'array', items: { type: 'string' } },
    elementos: {
      type: 'array',
      description: 'cada propiedad, metodo, evento, funcion, comando o herramienta usados, a verificar uno por uno',
      items: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          tipo: { type: 'string', description: 'propiedad | metodo | evento | funcion | comando | herramienta | tipo-de-dato' },
          usoEnLaSolucion: { type: 'string' },
          fuenteAlegada: { type: 'string' },
        },
        required: ['nombre', 'tipo', 'fuenteAlegada'],
      },
    },
    supuestos: { type: 'array', items: { type: 'string' } },
    riesgos: { type: 'array', items: { type: 'string' }, description: 'pasos destructivos o irreversibles' },
  },
  required: ['respuestaBreve', 'codigo', 'elementos', 'supuestos'],
}

const VEREDICTO = {
  type: 'object',
  properties: {
    nombre: { type: 'string' },
    existe: { type: 'boolean', description: 'false si no se pudo confirmar en ninguna fuente' },
    disponibleEnVersionObjetivo: { type: 'boolean' },
    evidencia: { type: 'string', description: 'ruta o URL y fragmento textual; vacio si no se encontro' },
    correccion: { type: 'string', description: 'que usar en su lugar si no existe o no aplica' },
  },
  required: ['nombre', 'existe', 'evidencia'],
}

phase('Relevar')

const FUENTES = [
  {
    key: 'corpus-inenco',
    prompt: [
      'Rastrea SOLO base-de-conocimientos-inenco/ para responder esta consulta GeneXus:',
      CONSULTA,
      '',
      CONTEXTO,
      '',
      'Es experiencia de campo verificada en proyectos reales de Inenco y tiene la maxima autoridad',
      'en entorno, infraestructura, tooling y en "esto en la practica no funciona".',
      'Los archivos son prosa exportada de Notion: sin encabezados markdown. Cuando haya match,',
      'lee el archivo completo, porque el contexto que le da sentido suele estar parrafos antes.',
      'Captura obligatoriamente los bloques "Aclaracion", "Anotacion" y "Atencion" cercanos:',
      'registran lo que no funciono o lo que difiere de la documentacion oficial.',
      'No inventes nada: si el corpus no lo cubre, ponelo en huecos.',
    ].join('\n'),
  },
  {
    key: 'referencias-nexa',
    prompt: [
      'Rastrea SOLO nexa-genexus-18/references/ para responder esta consulta GeneXus:',
      CONSULTA,
      '',
      CONTEXTO,
      '',
      'Usa object-*.md (proposito, SYNTAX, CONSTRAINTS, EXAMPLES), common-*.md (comandos, rules,',
      'events, functions, formulas, tipos de dato, extended types) y properties-*.md (nombre exacto,',
      'tipo, default y valores de cada propiedad).',
      'IGNORA model-*.md y global-*.md: describen el modelo textual de GeneXus Next, no el IDE clasico.',
      'Anota toda marca de version que encuentres. Cita archivo y fragmento textual para cada afirmacion.',
      'Si algo no esta escrito en una referencia, no lo deduzcas por analogia: ponelo en huecos.',
    ].join('\n'),
  },
  {
    key: 'documentacion-oficial',
    prompt: [
      'Investiga en la documentacion oficial de GeneXus para responder esta consulta:',
      CONSULTA,
      '',
      CONTEXTO,
      '',
      'Fuentes, en orden: wiki.genexus.com, docs.genexus.com, search.genexus.com,',
      'training.genexus.com, y el SAC para bugs conocidos y workarounds.',
      'Para cada afirmacion trae la URL y, cuando exista, la nota textual "available as of',
      'GeneXus X Upgrade N": si la feature es posterior a 18, marcala como fuera de alcance.',
      'Distingui lo que cambia entre generador Java, .NET y .NET Framework.',
      'La comunidad y los blogs valen solo como pista, nunca como afirmacion normativa.',
    ].join('\n'),
  },
]

const relevado = (
  await parallel(
    FUENTES.map((f) => () =>
      agent(f.prompt, { label: `relevar:${f.key}`, phase: 'Relevar', schema: HALLAZGOS })
    )
  )
).filter(Boolean)

const totalHallazgos = relevado.reduce((n, r) => n + (r.hallazgos || []).length, 0)
log(`Relevamiento: ${totalHallazgos} hallazgo(s) desde ${relevado.length} fuente(s)`)

if (totalHallazgos === 0) {
  return {
    consulta: CONSULTA,
    conclusion: 'Ninguna fuente aporto hallazgos. Reformular la consulta o acotar el tema.',
    huecos: relevado.flatMap((r) => r.huecos || []),
  }
}

phase('Redactar')

const propuesta = await agent(
  [
    'Redacta la solucion GeneXus para esta consulta:',
    CONSULTA,
    '',
    CONTEXTO,
    '',
    'Relevamiento de las tres fuentes (JSON):',
    JSON.stringify(relevado),
    '',
    'Reglas de entrega:',
    '- El codigo se expresa como se escribe en el IDE, separado por pestaña del objeto',
    '  (Source, Rules, Conditions, Variables con su tipo, Properties por nombre).',
    '  Jamas un archivo .gx, ni rutas src/, ni categorias #domains/.',
    '- Prioridad de tipo de dato: Attribute > Domain > SDT/Business Component > built-in.',
    '- Atributos prefijados por su Transaction y nunca calificados con punto.',
    '- Literales traducibles sin prefijo; no traducibles con !. Sin escapes ni apostrofos.',
    '- Tabuladores, un statement por linea, punto y coma solo en rules, conditions y orders.',
    '- Cuando el corpus de Inenco contradiga a la documentacion oficial, gana el caso de campo,',
    '  y se explicita la contradiccion.',
    '',
    'CRITICO: en "elementos" enumera TODA propiedad, metodo, evento, funcion, comando, herramienta',
    'y tipo de dato que uses, con la fuente que alegas para cada uno. Lo que no listes no se verifica,',
    'y lo no verificado no se entrega.',
  ].join('\n'),
  { label: 'redactar-propuesta', phase: 'Redactar', schema: PROPUESTA }
)

if (!propuesta) {
  return { consulta: CONSULTA, error: 'La redaccion de la propuesta fallo', relevado }
}

const MAX_VERIFICAR = 8
const todos = propuesta.elementos || []
const aVerificar = todos.slice(0, MAX_VERIFICAR)
if (todos.length > MAX_VERIFICAR) {
  log(`Atencion: ${todos.length} elementos declarados, se verifican los primeros ${MAX_VERIFICAR}. Sin verificar: ${todos.slice(MAX_VERIFICAR).map((e) => e.nombre).join(', ')}`)
}

phase('Verificar')

const veredictos = (
  await parallel(
    aVerificar.map((el) => () =>
      agent(
        [
          `Verificacion adversarial de un solo elemento: ${el.tipo} "${el.nombre}".`,
          `Uso propuesto: ${el.usoEnLaSolucion || '(no especificado)'}`,
          `Fuente alegada: ${el.fuenteAlegada}`,
          '',
          CONTEXTO,
          `Consulta original (para inferir la version objetivo): ${CONSULTA}`,
          '',
          'Tu trabajo es REFUTAR, no confirmar. Parti del supuesto de que el elemento no existe',
          'y solo aceptalo si encontras evidencia textual explicita, en este orden:',
          '1) nexa-genexus-18/references/ (properties-*.md, common-*.md, object-*.md)',
          '2) base-de-conocimientos-inenco/',
          '3) wiki.genexus.com / docs.genexus.com',
          '',
          'Un nombre plausible que no aparece en ninguna fuente es INEXISTENTE (existe=false).',
          'Es la falla concreta que ya quemo una sesion completa del equipo: un agente inventando',
          'this.Footer.Text en un SD Panel. Ante la duda, existe=false.',
          'Verifica ademas que este disponible en la version objetivo, no solo que exista en Next.',
          'Si no existe o no aplica, proponé en "correccion" el elemento correcto.',
        ].join('\n'),
        { label: `verificar:${el.nombre}`, phase: 'Verificar', schema: VEREDICTO, effort: 'high' }
      )
    )
  )
).filter(Boolean)

const rechazados = veredictos.filter((v) => !v.existe || v.disponibleEnVersionObjetivo === false)
log(`Verificacion: ${veredictos.length} elemento(s) revisados, ${rechazados.length} rechazado(s)`)

phase('Consolidar')

const final = await agent(
  [
    'Consolida la respuesta final para el equipo de Inenco. La firma Lucia.',
    '',
    `Consulta: ${CONSULTA}`,
    '',
    'Propuesta redactada (JSON):',
    JSON.stringify(propuesta),
    '',
    'Veredictos de verificacion (JSON):',
    JSON.stringify(veredictos),
    '',
    'Relevamiento original, para citas (JSON):',
    JSON.stringify(relevado),
    '',
    'Reglas de la respuesta final:',
    '- Corregi el codigo aplicando cada veredicto con existe=false o fuera de version objetivo.',
    '  Si no hay reemplazo valido, saca esa parte y deci explicitamente que no se puede resolver asi.',
    '- Estructura: respuesta directa en dos o tres oraciones, despues el codigo en bloques ```genexus',
    '  separados por pestaña del objeto, despues los pasos en el IDE.',
    '- Etiqueta el origen de cada afirmacion: verificado en Inenco / referencia Nexa / wiki oficial /',
    '  inferencia. Con ruta de archivo o URL.',
    '- Transmiti los caveats: si un patron interno tiene una parte sin resolver, decilo.',
    '- Marca lo destructivo o irreversible (reorganizacion, Rebuild All, cambio de propiedades de',
    '  entorno, recreacion de triggers) y recorda el backup.',
    '- Lista al final los supuestos asumidos y los huecos que quedaron sin cubrir.',
    '- Espanol, tono profesional y critico, sin emojis. Markdown.',
    '',
    'Tu texto de retorno es la respuesta que se le muestra al equipo.',
  ].join('\n'),
  { label: 'consolidar', phase: 'Consolidar', effort: 'high' }
)

return {
  consulta: CONSULTA,
  respuesta: final,
  elementosVerificados: veredictos.length,
  elementosRechazados: rechazados.map((v) => ({ nombre: v.nombre, correccion: v.correccion })),
  sinVerificar: todos.slice(MAX_VERIFICAR).map((e) => e.nombre),
}
