---
name: genexus-patterns
description: Patrones de solución ya probados en proyectos de Inenco para GeneXus 16/17/18 — consumo de servicios REST, encoding y archivos, fechas y zonas horarias, External Objects y apps Android, procesos batch fuera de GeneXus, y User Controls. Cargala cuando la pregunta toque alguno de esos temas, para partir de la solución verificada y no reinventarla.
---

# Patrones verificados en Inenco

Cada patrón está destilado de una nota de `base-de-conocimientos-inenco/`, con los caveats que el equipo pagó por descubrir. **Leé la referencia correspondiente antes de escribir código**, y citá la nota original en tu respuesta.

## Ruteo

| Si la pregunta es sobre… | Cargá |
|---|---|
| Consumir una API REST, OpenAPI Import, `HttpClient`, armar SDTs desde JSON, XRoad | [servicios-rest.md](references/servicios-rest.md) |
| Tildes o "ñ" corruptas, `Encoding`, `BlobFile` vs `Blob`, subida de archivos, nombres de archivo, Tomcat/JVM | [encoding-y-archivos.md](references/encoding-y-archivos.md) |
| `DateTime`, zonas horarias, Oracle `DATE`/`TIMESTAMP`, `ORA-01882`, auditoría temporal, DST | [fechas-y-timezone.md](references/fechas-y-timezone.md) |
| External Object Android, `.aar`, `.library`, push notifications, subir a Play Store | [mobile-android.md](references/mobile-android.md) |
| Correr un `Procedure` por `.bat`/cron sin app web, `java -cp`, procesos diarios | [procesos-batch.md](references/procesos-batch.md) |
| User Control propio, objeto `User Control`, render JS, `gxlibrary` | [user-controls.md](references/user-controls.md) |
| Ramas y merges de KB en GXserver | [versionado-kb.md](references/versionado-kb.md) |

## Cómo aplicar un patrón

1. **Confirmá que el contexto coincide.** Cada nota dice en qué versión, generador y proyecto se validó. Si el caso del usuario difiere (GX16 vs GX17, Java vs .NET, Oracle vs MySQL), decí qué parte del patrón es transferible y qué parte hay que revalidar.
2. **Transmití el caveat, no solo la solución.** Varias notas terminan en una limitación abierta —por ejemplo, el `BlobFile` que no llega a renderizar su User Control en Web Panel—. Omitirla es entregar una trampa.
3. **Preferí el patrón interno sobre la wiki** cuando difieren en algo del entorno. Hay al menos dos casos documentados donde seguir la documentación oficial al pie de la letra no funcionó.
4. **Si el tema no está cubierto acá**, no fuerces el patrón más parecido: pasá a las referencias Nexa para la sintaxis y a la wiki oficial para el procedimiento, y aclará que no hay antecedente interno.
5. **Si resolvés algo nuevo o corregís un patrón**, registralo con `/gx-aportar`: el valor de este corpus está en que crece.
