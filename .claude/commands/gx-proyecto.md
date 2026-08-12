---
description: Carga la ficha técnica de un proyecto desde especificaciones-proyectos/ (versión de GeneXus, Upgrade, Web/Mobile, generador, DBMS) para que rija el resto de la sesión
argument-hint: <nombre del proyecto, o vacío para listar los disponibles>
---

Proyecto solicitado: **$ARGUMENTS**

1. Si no vino nombre, listá los archivos de `especificaciones-proyectos/` con el nombre de sistema de cada uno (primera línea o encabezado) y pedí cuál usar.
2. Buscá en `especificaciones-proyectos/` el archivo que mejor coincida, por nombre de archivo o por el nombre del sistema dentro del documento. Si hay más de un candidato razonable, mostralos y pedí que se elija.
3. Leé el archivo completo.
4. Confirmá en una respuesta breve los datos que van a regir el resto de la sesión: sistema, versión de GeneXus y Upgrade, KB (nombre local y en GXServer), Web y/o Mobile, generador, base de datos, y cualquier particularidad de deploy o versionado que traiga la ficha.
5. A partir de ahora esos datos son la fuente de verdad para esta sesión, por encima de cualquier supuesto genérico de `genexus-compatibilidad` o de `genexus-patterns`: no vuelvas a preguntar versión, generador ni DBMS, y filtrá cualquier recomendación para que sea compatible con esa versión y ese Upgrade. Si el usuario menciona otro proyecto más adelante, volvé a correr este comando para ese proyecto.
