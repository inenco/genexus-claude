Manejo de caracteres especiales en nombres de archivos dentro del ecosistema GeneXus

¿Cómo configurar el encoding para evitar errores de lectura?

Para configurar el encoding (codificación) de manera efectiva y evitar errores de lectura o corrupción de datos con caracteres especiales en GeneXus, es fundamental aplicar una estrategia de declaración explícita tanto en el código como en la infraestructura del servidor.

A continuación se detallan los pasos técnicos:

1. Uso del Dominio Encoding de GeneXus

GeneXus distribuye un dominio estándar llamado Encoding (de tipo Character 255) que unifica los identificadores de codificación para los generadores Java y .NET. Utilizar este dominio garantiza que el código sea portable y use valores válidos para cada plataforma.

Ejemplo de uso: &xmlreader.SetDocEncoding(Encoding.UTF-8).

2. Configuración en la API de Archivos (Tipo de datos File)

Cuando manipulas archivos de texto, nunca debes omitir el parámetro de codificación si el archivo no es estrictamente UTF-8. Si no se especifica, GeneXus asume por defecto UTF-8, lo que provocará la inyección de caracteres corruptos al leer archivos generados en entornos Windows heredados (como los que usan Windows-1252).

Lectura/Escritura global: Métodos como ReadAllText, ReadAllLines y WriteAllText aceptan un parámetro opcional de encoding.

Lectura línea por línea: Debes abrir el archivo explícitamente con el encoding correcto usando &File.OpenRead(Encoding.Windows-1252) antes de procesar el contenido.

3. Configuración para XML y Web Services

XMLReader/XMLWriter: El método SetDocEncoding tiene prioridad absoluta sobre cualquier declaración que aparezca en el prólogo nativo del archivo XML (<?xml...?>). Esto es vital para evitar excepciones ante caracteres acentuados.

HttpClient: Al enviar datos estructurados (como JSON o CSV) mediante HTTP, debes inyectar explícitamente el conjunto de caracteres en el encabezado para asegurar que el servidor de destino lo interprete correctamente:

&HttpClient.AddHeader("Content-Type", "application/json; charset=utf-8").

4. Ajustes de Infraestructura (Servidor de Aplicaciones)

La prevención integral de errores requiere que la infraestructura esté alineada con el código:

Java (Tomcat):

En el archivo server.xml, configura los conectores con URIEncoding="UTF-8" para asegurar que los parámetros de las peticiones HTTP se decodifiquen correctamente.

En las opciones de la JVM (CATALINA_OPTS), añade -Dfile.encoding=UTF-8 para forzar que todas las operaciones de entrada/salida de la aplicación usen UTF-8 independientemente del sistema operativo.

Base de Datos (MySQL/MariaDB): Configura el servidor bajo colaciones Unicode extendidas como utf8mb4 y utiliza comandos como ALTER DATABASE ... CHARACTER SET utf8mb4 para que los nombres de archivos y textos se almacenen sin pérdida de integridad.

5. Consideraciones para .NET

En el generador .NET, el entorno de ejecución no expone por defecto todas las páginas de códigos tradicionales. Si necesitas manipular archivos con codificaciones antiguas de Windows, debes registrar el proveedor de codificaciones en tu código:

Encoding.RegisterProvider(CodePagesEncodingProvider.Instance). Además, evita almacenar flujos binarios crudos en variables de tipo String o Character, ya que los codificadores pueden corromper la firma binaria del archivo al intentar mapear bytes no reconocidos a caracteres.

¿Cómo implementar la sanitización de nombres con expresiones regulares?

Para implementar la sanitización de nombres de archivos mediante expresiones regulares en GeneXus, es fundamental utilizar patrones que identifiquen y eliminen caracteres que puedan causar conflictos de interoperabilidad entre sistemas operativos como Windows y Linux.

A continuación, se detallan las expresiones y procedimientos recomendados:

1. Patrón de búsqueda de caracteres no seguros

La estrategia más eficaz consiste en utilizar una expresión regular que capture exclusivamente los caracteres ajenos al conjunto "seguro". El patrón recomendado es:

RegEx = ([^-\w. ]*)

Este patrón funciona de la siguiente manera:

Captura: Cualquier carácter que NO sea una letra (mayúscula o minúscula), un número, un guion (-), un guion bajo (_), un punto (.) o un espacio en blanco.

Acción: Una vez identificados estos caracteres mediante la expresión, deben ser reemplazados o eliminados del flujo de carga antes de interactuar con el almacenamiento físico o la base de datos.

2. Aislamiento del nombre base (Purga de rutas)

Es crítico evitar que el navegador o el cliente de origen inyecten prefijos de rutas absolutas o relativas en la transacción, lo cual podría comprometer la seguridad o la resolución del archivo. Para aislar estrictamente el nombre base del archivo, se utiliza la siguiente expresión:

/^.*[\\\/]/

Este reemplazo elimina cualquier cadena que preceda a las barras inclinadas (/ o \), dejando únicamente el nombre y la extensión del archivo.

3. Consideraciones de implementación y errores comunes

Validación en tiempo de ejecución: Estas rutinas deben aplicarse a los flujos de carga antes de la persistencia. Si se detectan caracteres inválidos en componentes como User Controls del Marketplace, el sistema puede arrojar el Error 10, exigiendo el uso de nombres estrictamente alfanuméricos planos.

Codificación complementaria: Para el transporte seguro en peticiones HTTP, se deben usar las funciones UrlEncode y UrlDecode para convertir caracteres especiales (como espacios en %20) a un formato compatible con el estándar de transmisión de URLs.

Uso de GUIDs para evitar colisiones: Aunque la sanitización limpia el nombre, GeneXus recomienda el uso de tipos de datos modernos como BlobFile, Image, Audio o Video. Estos tipos utilizan internamente un GUID en el campo de soporte GXI para garantizar que el nombre físico en el disco sea unívoco, evitando que se sobrescriban archivos si varios usuarios cargan documentos con nombres idénticos al mismo tiempo.

Para asegurar la integridad total, se recomienda forzar siempre el uso del dominio Encoding.UTF-8 en los métodos de acceso a archivos y configurar las bases de datos bajo colaciones utf8mb4.

¿Qué ventajas tiene usar BlobFile sobre el tipo Blob tradicional?

La principal diferencia entre el tipo de datos BlobFile (y sus subtipos especializados como Image, Audio y Video) y el Blob tradicional radica en su arquitectura, específicamente en cómo gestionan los metadatos y la flexibilidad de su almacenamiento.

A continuación se detallan las ventajas de utilizar BlobFile sobre el tipo Blob tradicional:

1. Gestión Automática de Metadatos (Campo GXI)

Blob tradicional: Solo almacena el flujo binario en bruto en la base de datos. Para no perder el nombre original o la extensión, el desarrollador debe crear y configurar manualmente atributos auxiliares (FileTypeAttribute y FileNameAttribute) en la misma tabla.

BlobFile: Utiliza un campo de soporte automático llamado GXI (GeneXus Identifier). Este campo almacena el nombre, la extensión y la referencia lógica (URI) del archivo de forma transparente, eliminando la necesidad de atributos manuales adicionales.

2. Flexibilidad de Almacenamiento (Cloud Storage)

Blob tradicional: Está limitado casi exclusivamente al almacenamiento dentro de las celdas de la tabla en la base de datos relacional.

BlobFile: Permite el desacoplamiento de los binarios. Puede configurarse para almacenar los archivos en proveedores externos (Cloud Object Storage) como Amazon S3, Microsoft Azure, Google Cloud o IBM Cloud mediante la API de Storage Provider. Esto reduce el tamaño de la base de datos y mejora el rendimiento de las consultas.

3. Prevención de Colisiones y Unicidad

BlobFile: Genera un GUID único para cada archivo almacenado físicamente en el disco o la nube. Esto garantiza que el nombre del archivo sea unívoco en toda la plataforma, evitando que un usuario sobrescriba el archivo de otro si cargan documentos con el mismo nombre simultáneamente.

4. Métodos y Funcionalidades Avanzadas

Carga desde URL: Incluye el método FromURL, que permite cargar un archivo indicando una dirección local o remota. Si es una URL remota, GeneXus descarga y guarda el binario automáticamente al realizar el insert.

Referencias externas: Permite asignar simplemente una URI (propiedad FileURI) para referenciar un archivo que ya existe en otra ubicación sin necesidad de descargarlo o duplicarlo en la propia base de datos.

Subtipos especializados: Al usar los tipos Image, Audio o Video (que heredan la lógica de BlobFile), GeneXus realiza el renderizado automático en la interfaz de usuario sin intervención del programador.

5. Recomendación de Ingeniería

Debido a que el BlobFile facilita la escalabilidad del sistema y la migración hacia arquitecturas modernas, las fuentes recomiendan fuertemente priorizar su uso (o el de los tipos multimedia) y descartar por completo el tipo Blob tradicional para nuevos desarrollos.

Incluso existen procesos de reorganización automática para migrar datos existentes de Blob a BlobFile, donde GeneXus se encarga de copiar los binarios y regenerar los metadatos en el nuevo campo GXI.

Aclaraciones

Se intentó implementar BlobFile en un atributo del sistema Co.Di.Neu. y hubo dificultades al crear una variable de este tipo en un Web Panel, No agregaba correctamente, por defecto, el User Control para cargar documentos ya que no aparecia nada en la pantalla más que el label del campo, hubo que utilizar una variable de tipo Blob común y luego utilizar este código para guardar el documento subido en el atributo/variable BlobFile:

&Path = &Blob // Paso de variable tipo Blob a variable tipo Path

&BlobFile.FromURL(&Path) // Paso el Path de la variable para que BlobFile tenga referencia

esto permite que el el BlobFile tenga el documento subido (se chequea descargando el documento subido directo desde la Base de Datos y el contenido es correcto). A pesar de esto, al intentar agregar el atributo BlobFile a una pantalla para descargar el contenido subido vuelve a suceder que no aparece nada, por lo que no es posible descargar lo subido.

¿Cómo configurar el servidor Tomcat para evitar corrupción de caracteres?

Para configurar correctamente el servidor Apache Tomcat y evitar la corrupción de caracteres especiales (como tildes o la letra "ñ") en aplicaciones Java generadas con GeneXus, es necesario realizar ajustes tanto en los conectores del servidor como en las propiedades de la Máquina Virtual de Java (JVM).

Se deben garantizar las siguientes tres configuraciones fundamentales:

1. Codificación de los Conectores en server.xml

Es indispensable asegurar que las peticiones HTTP sean decodificadas bajo el estándar internacional UTF-8. Para ello, se debe editar el archivo de configuración global server.xml de Tomcat:

Inyecte la directiva URIEncoding="UTF-8" de forma explícita en todos los conectores HTTP y AJP que estén activos.

Esto previene que el servidor reemplace caracteres diacríticos por secuencias corruptas al procesar peticiones GET y parámetros transmitidos en la cabecera del cuerpo de la petición.

2. Parámetros de la Máquina Virtual de Java (JVM)

Para que las operaciones internas de entrada/salida (I/O) de archivos se resuelvan en UTF-8, independientemente de la configuración regional del sistema operativo del servidor, se debe configurar la opción de arranque en CATALINA_OPTS:

Añada la directiva: -Dfile.encoding=UTF-8.

Esta configuración obliga a las clases de la aplicación Java a utilizar UTF-8 de forma consistente para manejar flujos de datos y archivos planos.

3. Configuración de Directorios y Permisos

Si su aplicación maneja archivos temporales o multimedia (blobs), debe asegurar que las rutas configuradas en el archivo client.cfg sean válidas dentro del entorno de Tomcat:

Verifique las propiedades TMPMEDIA_DIR (donde se cargan los archivos a la base de datos) y CS_BLOB_PATH (donde se recuperan para visualización).

Importante: En el generador Java, estos directorios deben existir previamente, ya que GeneXus no los crea automáticamente.

La aplicación debe contar con permisos de lectura y escritura activos sobre estas carpetas para evitar errores de flujo.

Recomendación de Alineación Integral

Para un entorno robusto, esta parametrización de Tomcat debe estar alineada con la colación de la base de datos. Si utiliza MySQL o MariaDB, se recomienda configurar el servidor bajo colaciones Unicode extendidas como utf8mb4 para asegurar que los nombres de archivos sanitizados se almacenen sin pérdida de integridad.

Configuración de UTF-8 en conexiones Oracle

Para configurar correctamente el estándar UTF-8 en un ambiente con Oracle (y en general en cualquier arquitectura GeneXus), es imperativo establecer una alineación de triple capa que garantice que el código, el servidor de aplicaciones y el motor de base de datos operen bajo el mismo esquema de codificación.

A continuación, se detallan los pasos técnicos para asegurar la integridad de los datos en la conexión:

1. Configuración del Servidor de Aplicaciones (Java/Tomcat)

En entornos Java, que son los más comunes para conectar con Oracle, la comunicación depende de cómo la Máquina Virtual de Java (JVM) procesa los flujos de datos.

Parámetros de la JVM: Es fundamental forzar a la aplicación a utilizar UTF-8 independientemente de la configuración regional del sistema operativo. Esto se logra inyectando la directiva -Dfile.encoding=UTF-8 en las opciones de arranque del servidor (por ejemplo, en CATALINA_OPTS para Tomcat).

Conectores de Tomcat: En el archivo server.xml, debe asegurarse de que los conectores (HTTP y AJP) tengan definida de forma explícita la directiva URIEncoding="UTF-8". Esto garantiza que los parámetros enviados en las URLs o cuerpos de peticiones sean decodificados correctamente antes de llegar a la lógica de GeneXus.

2. Configuración en la Capa de Base de Datos

Para que Oracle almacene caracteres especiales (como la "ñ" o tildes) sin corromperlos, el motor debe estar configurado bajo colaciones Unicode extendidas.

Las fuentes indican que la mayoría de las bases de datos relacionales modernas retienen la Forma de Composición Canónica (NFC) de Unicode.

Es indispensable que la base de datos y sus tablas estén adecuadas para procesar esta información de forma consistente mediante comandos de conversión estructural si la base de datos no fue creada originalmente en UTF-8.

3. Configuración en el Código GeneXus

Dentro de la Base de Conocimiento (KB), debe utilizar las herramientas nativas para asegurar que el transporte de datos sea seguro:

Dominio Encoding: Utilice siempre el dominio estándar Encoding.UTF-8 en métodos que requieran parámetros de codificación, como en la manipulación de archivos de texto o XML.

HttpClient: Al realizar integraciones vía HTTP (como servicios REST que luego persisten datos en Oracle), es vital inyectar explícitamente el conjunto de caracteres en la cabecera:

&HttpClient.AddHeader("Content-Type", "application/json; charset=utf-8").

Prevención de Errores: La falta de esta configuración puede provocar excepciones críticas como "Unable to translate bytes... to Unicode", lo que indica una discrepancia entre la página de códigos enviada y la esperada por el motor.

Nota importante: Aunque las fuentes se centran en la alineación general de la infraestructura y mencionan ejemplos específicos para MySQL/MariaDB (como el uso de utf8mb4), los principios de sanitización y codificación homogénea son directamente aplicables a su conexión con Oracle para evitar que los caracteres especiales se pierdan o se transformen en secuencias corruptas durante la persistencia.