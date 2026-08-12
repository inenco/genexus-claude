Introducción al problema: 

En mi PC realice la instalación de GX18 y fue exitosa. Sin embargo, ésta necesitó una nueva versión de JAVA y de tomcat (se instaló JAVA 17 y Tomcat 9).

Luego de esto, la versión de GX16U11 ya no generaba bien las aplicaciones web. 

Primero no encontraba el recurso, la carpeta generada se veía así:

(dentro de web-inf también faltaba la carpeta lib).

Al agregar la carpeta lib, a veces mostraba este mensaje: 

No importa si hacía build/rebuild. Seguía sin generar los archivos necesarios para su correcto funcionamiento. 

Al generar un deploy si se desplegaba bien, por lo tanto era problema de mi PC. 

Solución:

Encontré la siguiente solución en la documentación de genexus: Configurando Tomcat manualmente

y confirmé que el problema provenía de que estaba detectando el otro tomcat. 

Utilizando esta otra documentación:

Como cambiar los valores de la registry de windows para Tomcat

cambié la ruta del installpath dentro de los registros a la versión más nueva del tomcat por la versión que yo necesitaba y me generó bien los archivos. 

También cambié la versión de JAVA que tenía en mi pc, con el comando “java -version” me figuraba la 17 y yo necesitaba la 1.8, agregando el path de la misma en las variables de entorno ya me figuraba correctamente.