# Firma y distribución Android en GeneXus

Configuración de firma digital para Android en GeneXus 
Antes de generar una aplicación Android en modo Distribution, es necesario disponer de un certificado digital de firma (Keystore). Este certificado identifica al desarrollador de la aplicación y permite generar paquetes firmados para distribución. Android exige que todas las aplicaciones distribuidas fuera del entorno de desarrollo estén firmadas con un certificado válido. 
Generación del archivo Keystore 
Para crear un nuevo certificado se utiliza la herramienta keytool, incluida en la instalación de Java. 
Ejecutar el siguiente comando desde una consola: 
keytool -genkeypair ^ 
-v ^ 
-keystore guias_app.keystore ^ 
-alias guias_app ^ 
-keyalg RSA ^ 
-keysize 2048 ^ 
-validity 10000 
Durante la ejecución se solicitarán los siguientes datos: 
● Contraseña del Keystore. 
● Nombre y apellido. 
● Organización. 
● Ciudad. 
● Provincia o Estado. 
● Código de país (AR para Argentina). 
● Contraseña de la clave. 
Al finalizar se generará el archivo:
guias_app.keystore 
Datos necesarios para GeneXus 
Del proceso anterior se obtienen los siguientes valores que serán requeridos posteriormente en GeneXus: 
Propiedad Valor 
Keystore File Ruta completa al archivo 
guias_app.keystore 

Keystore Password 
Contraseña definida para el Keystore 

Alias guias_app 
Key Password Contraseña de la clave asociada al alias 
Configuración en GeneXus 
Una vez generado el certificado, configurar las propiedades Android de la KB en el environment de producción: 
1. Cambiar el modo de compilación 
Acceder a: 
Preferences → Android 
y establecer: 
Compilation Mode = Distribution
2. Configurar la firma de la aplicación Completar las siguientes propiedades: 
Propiedad Valor 
Key Store File Ruta del archivo .keystore 

Key Store Password 
Contraseña del Keystore 

Key Alias Alias definido durante la creación 
Key Password Contraseña de la clave 
Ejemplo: 
Key Store File = C:\Firmas\guias_app.keystore 
Key Store Password = ******** 
Key Alias = guias_app 
Key Password = ******** 
Verificación de la configuración 
Al compilar la aplicación en modo Distribution, GeneXus utilizará el certificado configurado para firmar el paquete generado. Si la configuración es correcta, el proceso finalizará sin errores de firma y se obtendrá un archivo Android App Bundle (.aab) listo para distribución. El nombre del archivo será el mismo que el startup object que previamente generaba .apk (ejemplo Guia.apk). 
Es importante conservar el archivo .keystore, el alias y las contraseñas utilizadas. La pérdida de cualquiera de estos elementos impedirá generar nuevas versiones firmadas de la aplicación con la misma identidad digital, afectando futuras actualizaciones para los usuarios.

Generación de APK a partir de un archivo AAB firmado 

IMPORTANTE: propiedad Publishing Format en el objeto menu de la app, permite cambiar de Android App Bundle (.aab) a Legacy (.apk), evitando los pasos listados abajo.

Durante la configuración de la aplicación Android en GeneXus 17 se modificó el modo de compilación de Development a Distribution con el objetivo de generar una versión apta para distribución y publicación. Al realizar este cambio se observó que el proceso de compilación dejó de generar directamente el archivo APK utilizado habitualmente para la instalación manual en dispositivos, produciendo únicamente un archivo Android App Bundle (.aab) firmado. 
El formato AAB es el mecanismo recomendado actualmente por Google para la distribución de aplicaciones Android a través de Google Play. Sin embargo, para instalaciones manuales o distribución directa a usuarios finales continúa siendo necesario disponer de un archivo APK instalable. Por este motivo se utilizó la herramienta oficial Bundletool para generar un APK universal a partir del archivo AAB generado por GeneXus. 
Procedimiento realizado 
1. Se verificó la generación correcta del archivo: 
Guia.aab 
2. Se descargó la herramienta Bundletool desde el repositorio oficial de Google y se obtuvo el archivo ejecutable: 
bundletool-all-1.18.3.jar (o última versión) 
https://github.com/google/bundletool/releases 
3. Se generó un paquete APK universal utilizando el mismo certificado de firma configurado en GeneXus: 
java -jar bundletool-all-1.18.3.jar build-apks ^ 
--bundle="C:\Models\SigihAPK\LaPampaAPK\web\Guia.aab" ^ 
--output="C:\Models\SigihAPK\LaPampaAPK\web\Guia.apks" ^ 
--mode=universal ^ 
--ks="RutaDelKeystore" ^ 
--ks-key-alias=AliasConfigurado 
4. El archivo generado posee extensión .apks, que corresponde a un contenedor ZIP con los APKs resultantes. 
5. Se extrajo el contenido del archivo .apks, renombrando la extensión de este a .zip obteniéndose el archivo: 
universal.apk
6. Se instaló el APK generado en Android Studio para su validación. Verificación de compilación Release 
Con el objetivo de confirmar que la aplicación instalada no correspondiera a una compilación de depuración (Debug), se realizaron verificaciones mediante Android Debug Bridge (ADB). 
Se verificó el paquete real instalado y se ejecutó la consulta de propiedades de la aplicación: 
& "C:\Users\glong\AppData\Local\Android\Sdk\platform-tools\adb.exe" shell pm list packages | findstr sigih 
Obtenemos el nombre real del paquete: 
package:com.artech.sigihignia.Guia 
Intentamos debuggear: 
& "C:\Users\glong\AppData\Local\Android\Sdk\platform-tools\adb.exe" shell run-as com.artech.sigihignia.Guia 
Obtenemos mensaje de negación que confirma la firma de distribution: run-as: package not debuggable: com.artech.sigihignia.Guia 
No se detectaron indicadores de compilación depurable (DEBUGGABLE), lo que constituye una evidencia de que la aplicación fue generada y firmada como una versión de distribución (Release). 
Resultado 
Se obtuvo exitosamente un archivo APK instalable a partir del AAB generado por GeneXus en modo Distribution, manteniendo la firma de producción configurada mediante el keystore corporativo y evitando el uso del certificado de depuración de Android.