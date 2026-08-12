---
description: Diagnostica un error o comportamiento inesperado de GeneXus buscando causa raíz en el corpus interno antes que en la web
argument-hint: <mensaje de error o síntoma, con versión/generador/momento del fallo>
---

Error reportado: **$ARGUMENTS**

Cargá la skill `diagnostico-genexus` y aplicá su procedimiento.

Además, para esta consulta puntual:

- Si en el reporte falta versión + Upgrade, generador, DBMS/app server, o el momento del fallo (especificación, generación, build, deploy, ejecución), pedí eso primero: sin esos datos no se distingue un bug de código de un problema de entorno, y la mitad de los casos documentados en Inenco fueron de entorno.
- Grepeá `base-de-conocimientos-inenco/Errores Resueltos.md` y el resto de la base con el **texto literal** del error y con sinónimos en español e inglés antes de ir a la web.
- Si el síntoma coincide con un caso ya documentado (commit fantasma de `Business Component`, Tomcat/Java duplicados, `ORA-01882`, caracteres corruptos, fechas desplazadas, `Error 10` de User Control, `Execute` de OpenAPI Import), citá la nota y traé su causa raíz completa, no solo el remedio.

Cerrá el informe con:

- **Causa raíz** o, si no se puede determinar todavía, las hipótesis ordenadas por probabilidad y **cómo descartar cada una** con una verificación concreta.
- La corrección, distinguiendo lo verificado en Inenco de la inferencia propia.
- Advertencia explícita si algún paso es destructivo o irreversible.
- Si el error resultó nuevo y quedó resuelto, ofrecé registrarlo con `/gx-aportar`.
