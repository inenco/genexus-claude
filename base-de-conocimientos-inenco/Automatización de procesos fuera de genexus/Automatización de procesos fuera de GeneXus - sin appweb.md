Automatización de procesos fuera de GX (gx17u11)

El código que debe ir en el .bat debe ser algo así:

Ejemplo1:

“cd C:\prcbatch java -cp lib\gxclassR.jar;lib\jt400.jar;lib\postgresql-9.1-902.jdbc3.jar;lib\joda-time-2.8.2.jar;lib\commons-io-2.2.jar;lib\commons-lang-2.4.jar;lib\HugaoZipTools.jar;lib\mail.jar;com.jubipens.aprocesosbatch”

El comando “java” realiza la ejecución del mismo mientras que -cp especifica los parámetros que necesita. 

La estructura de archivos de este código es la siguiente: 

-En la carpeta lib van todos los .jar que se necesitan

-Las clases generadas por genexus van en una carpeta com/<tu_sistema>/

** Recordar dar los permisos a todas las carpetas y archivos. 

Es importante que el procedimiento que se genere en genexus tenga las siguientes propiedades:

-Main program: true

-Call protocol: command line

El comando debe recibir correctamente las librerías que va a utilizar, dependerá de los diferentes códigos que realicemos: gxclassR va seguro. 

Brindo ejemplo2 enviado con una estructura más parecida a nuestros casos: “cd "C:\Program Files\Apache Software Foundation\Tomcat 6.0\webapps\Financiera\WEB-INF\classes"

"C:\Program Files\Java\jdk1.6.0_07\jre\bin\java.exe" -cp "C:\Program Files\Apache Software Foundation\Tomcat 6.0\webapps\Financiera\WEB-INF\lib\gxclassr.jar";.;"C:\Program Files\Apache Software Foundation\Tomcat 6.0\webapps\Financiera\WEB-INF\lib\mysql-connector-java-5.1.15-bin.jar"; aprecierrediario”

Caso de éxito: ERP

Se brindan, dentro de la carpeta donde está este documento, la estructura y el código utilizado para este caso. Se encuentra en funcionamiento.

**Atención: puede suceder que la ejecución de JAVA no se logre, en ese caso el CMD brindará el código de error correspondiente. Si sucede, cambiar la palabra “Java” por la ruta completa al compilador (mirar ejemplo 2).

**Atención: no olvidar el espacio antes del procedimiento a ejecutar.

Bibliografía:

-Documentación de genexus (inglés)