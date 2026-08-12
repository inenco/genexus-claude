---
name: genexus-compatibilidad
description: Determina qué conocimiento de las referencias Nexa aplica realmente a GeneXus 16, 17 y 18 y qué es exclusivo de GeneXus Next / v19, y cómo verificar desde qué Upgrade existe una feature. Cargala cuando la respuesta dependa de la versión, cuando aparezcan objetos legacy (Theme, WorkPanel), o antes de recomendar una feature que suene reciente.
---

# Compatibilidad de versiones: Nexa (Next/v19) vs. GeneXus 16/17/18

El corpus `nexa-genexus-18/` está escrito para **GeneXus Next**, la generación textual del producto. El equipo de Inenco trabaja con el **IDE clásico** de 16/17/18. Esta skill delimita el préstamo válido.

## Lo que sí se toma de las referencias Nexa

Es conocimiento del lenguaje, estable entre generaciones:

- Comandos y control de flujo: `common-commands.md`, `common-commands-foreach.md`
- Rules, events, functions, formulas, operadores: `common-rules.md`, `common-events.md`, `common-functions.md`, `common-formulas.md`, `common-operators.md`
- Tipos de dato y semántica de datos: `common-data.md`, `common-data-types.md`, `common-attribute-types.md`, `common-semantic-types.md`, `common-data-picture.md`
- Extended types: `common-extended-type-httpclient.md`, `-xmlreader`, `-xmlwriter`, `-file`, `-directory`, `-mailmessage`, `-smtpsession`, `-pop3session`, `-regexmatch`, `-geo*`, `-expression`
- Colecciones, serialización, variables estándar, Business Component, invocación de objetos
- Propósito, restricciones y ejemplos de cada `object-*.md`
- Nombres, tipos, defaults y valores admitidos de cada `properties-*.md`

## Lo que no se toma

Es el flujo operativo de Next, inexistente en el IDE clásico:

- `gxnext` CLI y el MCP server, con todo su ciclo abrir/validar/importar/integrar KB
- Artefactos de texto: `.gx`, `.local.env.gx`, `.kb.gx`, `.panel.xml`, `.web.xml`, `.report.xml`, `module.toml`, `<name>.doc.md`
- El árbol de `global-output.md`: `src/`, `ref/`, categorías `#preferences/`, `#domains/`, `#tables/`, folders `@nombre/`, y su resolución de rutas
- `model-knowledge-base.md` y `model-environment.md`: describen esos archivos de configuración
- La regla "never process legacy objects" — ver más abajo

En 16/17/18 la KB es binaria (`.gxw` + base de datos del modelo). Se abre en el IDE; no hay archivos de objeto que editar ni importar desde disco.

## Fuera de alcance por ser posterior a 18

Marcado en las referencias con `Availability: ProductVersion: >=19`:

- Objeto **`Agent`** (`object-agent.md`): agentes de IA con prompts y tools. No existe en 18.
- Los tipos de dato de `common-data-types.md` marcados `>=19`.
- Propiedades de `properties-knowledge-base.md` marcadas `>=19`.

Si alguien pregunta por esto, decí que es de GeneXus Next y ofrecé el equivalente construible en 18 (típicamente un `Procedure` que consume una API por `HttpClient`).

## Legacy que en Inenco sigue vivo

Nexa marca estos objetos como legacy y su `SKILL.md` ordena rechazarlos. **Esa regla no se hereda acá**: son la realidad de las KBs que mantiene el equipo.

| Objeto | Marca en Nexa | Postura Inenco |
|---|---|---|
| `Theme` | `<17.6`, sugiere `DesignSystem` | Se responde sobre `Theme`. En GX16 y GX17 previo a U6 es el único mecanismo de estilos. |
| `ColorPalette` | `<17.6`, sugiere `DesignSystem` | Igual que `Theme`. |
| `WorkPanel` | `<15`, sugiere `Panel`/`WebPanel` | Puede aparecer en sistemas heredados; se responde. |

Solo empujá la migración a `DesignSystem` si la pregunta es sobre migrar, o si la KB ya está en 17.6+ y se está creando algo nuevo.

Las referencias `object-theme.md`, `object-color-palette.md` y `object-work-panel.md` **no existen** en el corpus: para estos objetos la fuente es la wiki oficial (`SKILL.md` de Nexa deja los enlaces).

## Verificar disponibilidad de una feature

Ninguna referencia de `nexa-genexus-18/` está escrita pensando en 16 o 17. Antes de recomendar algo que suene reciente:

1. Buscá la página en `wiki.genexus.com` y leé la nota **"available as of GeneXus X Upgrade N"**.
2. Confirmá que el **generador** de la KB lo soporte: Java, .NET y .NET Framework difieren en métodos, encoding y configuración. `DateTime.SetTimeZone`, por ejemplo, existe en los tres, pero varios providers de storage o de encoding no.
3. Si la feature es de 18 y la KB es 16, decilo explícitamente y proponé el camino alternativo en lugar de dejar el dato colgado.

## Diferencias de versión ya sufridas en Inenco

- **Convivencia de instalaciones**: instalar GX18 (que trae Java 17 y Tomcat 9) rompió la generación web de GX16 U11, porque el registro de Windows apuntaba al Tomcat nuevo. Se corrige en el `installpath` del registro y en el `PATH` de Java. Ver `base-de-conocimientos-inenco/No funcionaba genexus/GX16 no genera bien app en tomcat (teniendo dos versiones de JAVA y de tomcat).md`.
- **GX17 U11** es la versión de los casos documentados de External Object Android (con `com.genexus.android:*:1.2.1`) y de automatización batch fuera de GeneXus.
- **GX18 U13** es la versión del ensayo con agentes de IA sobre la KB `sigihIgnia18`.
- **GX16/17 con OpenAPI Import**: la herramienta genera un `CallApi` cuyo `&httpClient.Execute(&Method, &UrlWithParms)` no funciona solo con la URL; hay que separar `Host` y path. Ver la nota de Servicios REST.

Cuando el usuario no dice la versión y la respuesta cambia según ella, preguntala antes de escribir código.
