# Automatizar procesos GeneXus sin app web

Fuente: `base-de-conocimientos-inenco/Automatización de procesos fuera de genexus/Automatización de procesos genexus sin necesidad de appweb.md`
Validado en: **GX17 U11**. Caso en producción: sistema **ERP**, con estructura y clases completas en la subcarpeta `procesos/` de esa nota (incluye `procesosdiarios.bat`, `com/erp/*.class` y `lib/*.jar` reales para copiar como plantilla).

## Propiedades obligatorias del Procedure

Sin estas dos no hay ejecución por línea de comandos:

- `Main program = True`
- `Call protocol = Command line`

## Estructura de archivos en el servidor

```
C:\prcbatch\
├── procesosdiarios.bat
├── lib\                    <- todos los .jar necesarios
└── com\<tu_sistema>\       <- las clases generadas por GeneXus
```

Dar permisos a **todas** las carpetas y archivos.

## El `.bat`

Forma mínima:

```bat
cd C:\prcbatch
java -cp lib\gxclassR.jar;lib\jt400.jar;lib\postgresql-9.1-902.jdbc3.jar;lib\joda-time-2.8.2.jar;lib\commons-io-2.2.jar;lib\commons-lang-2.4.jar;lib\mail.jar; com.jubipens.aprocesosbatch
```

Forma con rutas absolutas, más parecida a los despliegues del equipo (clases dentro del webapp de Tomcat):

```bat
cd "C:\Program Files\Apache Software Foundation\Tomcat 6.0\webapps\Financiera\WEB-INF\classes"
"C:\Program Files\Java\jdk1.6.0_07\jre\bin\java.exe" -cp "…\WEB-INF\lib\gxclassr.jar";.;"…\WEB-INF\lib\mysql-connector-java-5.1.15-bin.jar"; aprecierrediario
```

- `-cp` lista el classpath. Qué `.jar` van depende del código; **`gxclassR.jar` va siempre**.
- El nombre del programa es la clase generada, con su package (`com.<sistema>.<procedimiento>`) o suelta si las clases están en el directorio actual.

## Dos errores que cuestan tiempo

1. **`java` no se resuelve.** El CMD devuelve el código de error correspondiente. Solución: reemplazar `java` por la **ruta completa al ejecutable**, como en el segundo ejemplo. Especialmente probable si hay varias versiones de Java instaladas (ver el caso de convivencia GX16/GX18 en `base-de-conocimientos-inenco/No funcionaba genexus/`).
2. **Falta el espacio antes del nombre del procedimiento.** El `; aprecierrediario` lleva espacio después del punto y coma que cierra el classpath. Sin él no arranca.

## Recomendaciones al armar uno nuevo

- Copiá la estructura del caso ERP como plantilla en lugar de armarla desde cero.
- Los `.jar` del caso ERP dan la pista de qué suele hacer falta: `gxclassR`, `gxcommon`, `gxmail`, el connector JDBC del DBMS, `joda-time`, `commons-io`, `commons-collections4`, `log4j-api` + `log4j-core`, `bcprov` si hay criptografía.
- Si el proceso escribe archivos o manda mail, revisá `client.cfg` (rutas de blobs y temporales) y el encoding de la JVM: `-Dfile.encoding=UTF-8`. Ver [encoding-y-archivos.md](encoding-y-archivos.md).
- Si el proceso graba `DateTime`, corre fuera del app server y por lo tanto puede tener otra zona horaria: ver [fechas-y-timezone.md](fechas-y-timezone.md), donde la alineación de background workers es condición para usar `Application Server` como storage timezone.
- Programalo con el Task Scheduler de Windows apuntando al `.bat`, no al `java` directo, para que el `cd` inicial se respete.

## Sintaxis de referencia

`nexa-genexus-18/references/object-procedure.md`, sección **COMMAND LINE EXECUTION**, tiene la forma de invocación para los entornos Java y .NET; y **EMBEDDED NATIVE CODE** si hace falta bajar a código nativo.
