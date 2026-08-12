# GeneXus Claude — Base de conocimiento Inenco

Repositorio de conocimiento para que Claude (**Lucía**) asista al equipo de GeneXus 16/17/18 de Inenco: preguntas de sintaxis, diagnóstico de errores, y código listo para pegar en el IDE.

## Cómo empezar una sesión

**Decí de entrada en qué proyecto estás trabajando.** Si el proyecto ya tiene ficha técnica en `especificaciones-proyectos/`, corré:

```
/gx-proyecto <nombre>
```

y Lucía carga versión de GeneXus, Upgrade, Web/Mobile, generador y DBMS antes de responder nada — no hace falta repetirlos en cada pregunta. Si no hay ficha todavía, decí esos datos en el primer mensaje (versión + Upgrade, generador Java/.NET, DBMS, Web o Mobile) o creá la ficha vos mismo en `especificaciones-proyectos/<proyecto>.md` siguiendo el modelo de `sigih-guias.md`.

Con el contexto puesto, preguntá directo o usá:

| Comando | Para qué |
|---|---|
| `/gx-proyecto <nombre>` | Cargar la ficha técnica de un proyecto al inicio de la sesión |
| `/gx <consulta>` | Preguntar sintaxis, comportamiento o pedir código GeneXus |
| `/gx-error <mensaje o síntoma>` | Diagnosticar un error, con búsqueda de causa raíz en el corpus interno primero |
| `/gx-aportar <qué se resolvió>` | Registrar una solución nueva en la base de conocimientos, con el formato de la casa |

## Qué hay en el repositorio

- **[CLAUDE.md](CLAUDE.md)** — identidad de Lucía, jerarquía de autoridad de las fuentes y protocolo de respuesta. Léelo si algo de lo que sigue no queda claro.
- **`base-de-conocimientos-inenco/`** — notas de problemas reales resueltos en proyectos de Inenco. Máxima autoridad en entorno, infraestructura y tooling.
- **`nexa-genexus-18/`** — referencia vendorizada del lenguaje GeneXus (sintaxis, comandos, tipos, propiedades). Solo lectura: no se edita.
- **`especificaciones-proyectos/`** — una ficha técnica por proyecto. Manda sobre cualquier supuesto genérico una vez cargada con `/gx-proyecto`.
- **`.claude/`** — configuración de Claude Code: agentes (`kb-inenco`, `docs-genexus`, `revisor-genexus`), skills (`genexus-standards`, `genexus-compatibilidad`, `genexus-patterns`, `diagnostico-genexus`, `registrar-conocimiento`), los comandos de la tabla de arriba, y dos workflows (`investigacion-gx`, `auditar-conocimiento`) para consultas de alto impacto y para auditar el corpus.

## Sumar conocimiento nuevo

Cuando resuelvas algo que valga la pena dejar asentado, usá `/gx-aportar`. Solo entra lo verificado en un proyecto real, con su causa raíz y sus caveats — así el corpus no se degrada con generalidades. El detalle de la regla de admisión está en la skill `registrar-conocimiento`.
