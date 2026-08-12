---
name: diagnostico-genexus
description: Procedimiento para diagnosticar un error o comportamiento inesperado en GeneXus, ordenando la búsqueda por capa (KB, generado, app server, base de datos, entorno) y consultando el corpus antes de la web. Cargala cuando traigan un mensaje de error, un "no compila", un "no genera bien" o un comportamiento que no se explica.
---

# Diagnóstico de errores GeneXus

## Paso 1 — Encuadrar antes de buscar

Nunca empieces a proponer soluciones sin estos datos. Si faltan, pedilos: la mitad de los errores documentados en Inenco fueron de entorno, y sin contexto no se distinguen de un bug de código.

- Versión y **Upgrade** de GeneXus (16 / 17 / 18 + U). Si hay más de una instalación en la máquina, decilo: es causa conocida de fallas.
- **Generador**: Java o .NET / .NET Framework.
- **DBMS**: Oracle, MySQL/MariaDB, SQL Server, PostgreSQL.
- **App server** y su versión (Tomcat 6/9, IIS…) y versión de Java activa (`java -version`).
- **Momento del fallo**: especificación, generación, build, deploy, o ejecución.
- El **texto literal** del error, y si es reproducible o intermitente.
- Si funciona en otra máquina o en el deploy y falla solo local — eso apunta directo a entorno.

## Paso 2 — Clasificar por capa

La capa determina dónde buscar y qué tipo de solución esperar:

| Capa | Señales típicas |
|---|---|
| **Modelo / KB** | Errores de especificación, atributos inconsistentes, reorganización pendiente, referencias inválidas |
| **Código generado** | Compila mal, falta código, comportamiento que no se corresponde con el source |
| **Generación / IDE** | No genera archivos, faltan carpetas (`WEB-INF/lib`), "no encuentra el recurso", extensiones que no aparecen |
| **App server / JVM** | Caracteres corruptos, rutas de blobs, permisos, encoding, arranque |
| **Base de datos** | `ORA-*`, colaciones, tipos de dato, triggers, commits inesperados |
| **Integración** | HTTP, JSON/SDT, hosts, certificados, timeouts |

## Paso 3 — Consultar el corpus, en este orden

1. **`base-de-conocimientos-inenco/Errores Resueltos.md`** — bitácora colectiva del equipo. Primer lugar siempre.
2. **El resto de `base-de-conocimientos-inenco/`** — grep con el texto del error y con sinónimos en español e inglés. Los archivos son prosa sin encabezados: leé completo el que dé match, porque el contexto útil suele estar párrafos antes.
3. **`nexa-genexus-18/references/`** — para confirmar sintaxis, tipos, propiedades y restricciones del objeto involucrado.
4. **Wiki oficial y SAC** — para el mensaje de error textual y para bugs conocidos por Upgrade.

## Paso 4 — Errores ya resueltos en Inenco

Reconocelos rápido, están documentados con su causa raíz:

- **`Business Component` persiste sin `Commit` explícito.** Causa: las `Rules` (comunes y del bloque `[BC]`) y el procedimiento **After Trn** llamaban procedimientos con `Commit on Exit = Yes`, y el commit se hacía ahí. Revisá esa propiedad en toda la cadena de llamadas. (`Errores Resueltos.md`)
- **GX16 U11 dejó de generar bien la app web en Tomcat.** Causa: se instaló GX18, que trajo Java 17 y Tomcat 9, y GX16 empezó a detectar el Tomcat nuevo. Síntomas: "no encuentra el recurso", falta `WEB-INF/lib`, build y rebuild no cambian nada, pero **el deploy sí funciona** (señal inequívoca de problema local). Solución: corregir el `installpath` de Tomcat en el registro de Windows y ajustar el `PATH` de Java a la versión requerida (1.8 en ese caso). (`No funcionaba genexus/GX16 no genera bien app en tomcat…`)
- **`ORA-01882: timezone region not found`.** Desajuste entre driver JDBC y archivos `timezlrg_*.dat`. Mitigación: `-Doracle.jdbc.timezoneAsRegion=false` y `-Duser.timezone=UTC`. Ver la skill `genexus-patterns` → `fechas-y-timezone.md`.
- **`Unable to translate bytes … to Unicode`** y tildes/ñ corruptas. Desalineación de encoding entre código, Tomcat/JVM y base. Ver `encoding-y-archivos.md`.
- **Fechas desplazadas por horas fijas.** El driver JDBC aplica un offset implícito según la zona de la JVM. Ver `fechas-y-timezone.md`.
- **`Error 10` en User Controls del Marketplace.** Nombres de archivo con caracteres especiales; exige alfanuméricos planos.
- **Llamada a API REST que no sale con OpenAPI Import.** `Execute` con la URL completa no funciona; hay que separar `Host` y path. Ver `servicios-rest.md`.

## Paso 5 — Responder

- Nombrá la **causa raíz**, no solo el remedio. Un remedio sin causa se vuelve a aplicar mal la próxima vez.
- Si hay varias hipótesis, ordenalas por probabilidad y dá para cada una **cómo descartarla** con una verificación concreta y barata.
- Distinguí lo verificado en Inenco de la hipótesis propia.
- Advertí siempre que las soluciones del corpus se aplicaron en un dominio específico: el preámbulo de `Errores Resueltos.md` es explícito en que no se aplican sin analizar antes el dominio propio, para no romper otros flujos.
- Marcá lo que es **destructivo o irreversible**: reorganización de base, cambio de `DateTime storage timezone`, recreación de triggers, Rebuild All. Backup antes, y decilo.

## Paso 6 — Cerrar el ciclo

Si el error era nuevo y se resolvió, ofrecé registrarlo con `/gx-aportar`. Ese es el mecanismo por el que este corpus mejora.
