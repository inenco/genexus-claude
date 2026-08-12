---
name: registrar-conocimiento
description: Incorpora una solución nueva a la base de conocimientos interna de Inenco respetando el formato y las reglas de la casa (solo lo verificado en un proyecto real, con su caveat y su contexto de versión). Cargala cuando el equipo resuelva algo que valga la pena dejar asentado, o cuando pidan documentar un error resuelto.
---

# Registrar conocimiento nuevo en la base interna

El valor de `base-de-conocimientos-inenco/` está en que solo contiene cosas que pasaron de verdad. Una entrada inventada, generalizada o sin contexto la degrada.

## Regla de admisión

Antes de escribir, verificá las cuatro condiciones. Si alguna falla, **no escribas la nota**: decí cuál falta.

1. **Se resolvió, o se documenta explícitamente hasta dónde se llegó.** Un intento fallido puede entrar, pero rotulado como tal (hay precedentes: la nota de External Object termina en "no aparece en el Extensions Manager").
2. **Se aplicó en un proyecto real**, con nombre (ERP, Co.Di.Neu., sigihIgnia, Licitaciones Neuquén, blh…).
3. **Se conoce el contexto**: versión y Upgrade de GeneXus, generador, DBMS o app server según el tema.
4. **La causa raíz está entendida**, no solo el remedio.

## Dónde va

| Tipo de aporte | Destino |
|---|---|
| Error puntual con causa raíz, corto | Entrada nueva al final de `Errores Resueltos.md` |
| Procedimiento o patrón completo | Archivo `.md` nuevo en la carpeta temática existente |
| Tema sin carpeta todavía | Carpeta nueva con nombre descriptivo en español, y el `.md` dentro |
| Binario de apoyo (`.xpz`, `.yaml`, `.class`, video) | Junto al `.md` que lo referencia, y mencionalo desde el texto |

Carpetas actuales: `Automatización de procesos fuera de genexus/`, `Investigación/`, `No funcionaba genexus/`, `Notificaciones mobile/`, `Servicios Rest/`, `Subir app a playstore/`.

Antes de crear un archivo, **buscá si el tema ya tiene una nota** y ampliála en lugar de duplicar.

## Formato de la casa

Las notas existentes son prosa exportada de un editor tipo Notion. Imitalo:

- Español. Sin encabezados markdown (`#`), sin fences de código, sin tablas.
- Párrafos y pasos separados por líneas en blanco.
- El código va como texto indentado o suelto entre líneas en blanco, igual que en las notas actuales.
- Arranca con una línea de contexto: qué se hizo, en qué proyecto, con qué versión. Modelo real: *"Este documento presenta el paso a paso para la creacion de un External Object para uso en mobile, en este caso para la compresion de imagenes. Se utilizo Genexus 17 U11 y Android Studio Ladybug Feature Drop | 2024.2.2"*.
- Numerá los pasos cuando sea un procedimiento.
- Cerrá con los bloques que el equipo ya usa cuando corresponda: **"Aclaración:"** para lo que difiere de la documentación oficial, **"Anotación:"** para lo que no se logró, **"Atención:"** para la trampa que hace perder tiempo.
- Si te apoyaste en documentación externa, dejá la URL, como hacen las notas de Servicios REST y de Tomcat.

Para `Errores Resueltos.md`, seguí la plantilla del propio archivo:

```
Error: <síntoma observable>. <Análisis y causa raíz. Qué se cambió.>
```

## Antes de guardar

- [ ] Ninguna afirmación que no se haya verificado. Si algo se supone, la nota dice que se supone.
- [ ] Están los caveats y lo que quedó sin resolver.
- [ ] Está la versión, el generador y el proyecto.
- [ ] Nada de credenciales, IPs internas, connection strings ni datos de clientes. Si el caso real los tenía, reemplazalos por placeholders (`192.168.0.100`, `<host del servicio>`), como ya hacen las notas existentes.
- [ ] Formato consistente con las notas vecinas.
- [ ] Se le mostró la nota al usuario **antes** de escribirla, para que confirme el contenido técnico.

Después de guardar, si el tema toca un patrón de la skill `genexus-patterns`, avisá que conviene actualizar la referencia correspondiente en `.claude/skills/genexus-patterns/references/`.

No hagas commit salvo pedido explícito.
