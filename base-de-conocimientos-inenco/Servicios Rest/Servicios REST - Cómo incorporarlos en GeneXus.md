*Aclaración: El siguiente documento se anotó en base a lo realizado para implementar un web service con XRoad para el sistema de Licitaciones de la Provincia de Neuquén; es posible que algunos pasos difieran en otras implementaciones.

*Documentación: https://wiki.genexus.com/commwiki/servlet/wiki?50177,OpenAPI+import+tool+%28GeneXus+17+Upgrade+8+or+prior%29,

Obtener archivo con Información del Servicio

Solicitar archivo (en formato .yaml) con la definición de los servicios REST que se desean incorporar a GeneXus. Ver archivo de ejemplo: ejemploXRoad.yaml incluido en la carpeta como ejemplo del tipo de archivo deseado.

Este archivo debe ser provisto por el administrador de los servicios REST.

Importar el archivo en GeneXus

Crear carpeta con el nombre: *Nombre del Servicio*

Seleccionar la herramienta OpenAPI Import 

Importar los objetos del archivo en la carpeta creada.

Verificar que haya creado la carpeta de OpenAPICommon con procedimientos generados por GeneXus (si ya se ha importado un Servicio REST previamente, es posible que este Módulo ya esté creado) y poblado la carpeta *Nombre del Servicio* creada previamente con los objetos importados.

Modificar objetos generados en carpeta OpenAPI

*Aclaración: Este proceso fue necesario al implementar el web service de XRoad; es posible que este paso difiera en otras implementaciones.

Modificar el procedimiento CallApi

Reemplazar la línea:

&httpClient.Execute(&Method, &UrlWithParms)

con las siguientes líneas:

&httpClient.Host = &UrlWithParms.Substring(1, &UrlWithParms.IndexOf('/') - 1)

&httpClient.Execute(&Method, &UrlWithParms.Substring(&UrlWithParms.IndexOf('/')))

Ya que el proceso Execute no funciona correctamente solo con la Url, se establece el Host previo a ejecutar el procedimiento con el resto del Path (Url = “<host>/<path/subpath>”)

Modificar objetos generados en carpeta del Servicio

*Aclaracion: Este proceso fue necesario al implementar el web service de XRoad; es posible que este paso difiera en otras implementaciones.

Modificar el procedimiento ApiBaseUrl

En el Procedimiento *Nombre del Servicio* > Client > ApiBaseUrl, reemplazar la línea:

&BaseURL = "/"

con la siguiente línea:

&BaseURL = "Host del Servicio"

El Host se debería poder encontrar en el archivo .yaml utilizado en el paso 1. Debe ir solo el Host (ejemplo: “192.168.0.100”).

Crear SDT para uso de los Servicios

En la carpeta *Nombre del Servicio* > Api, para cada procedimiento generado para el web service, es posible que se necesite crear objetos SDTs para enviar o recibir objetos de tipo Json (si es que los mismos no fueron generados por GeneXus y se deba crear manualmente):

Obtener un ejemplo del Json requerido, con los atributos necesarios.

{    "username": "user",    "password": "123abc"}

*Aclaración: es posible que los datos del Json estén incluidos en un segundo nivel, por ejemplo: 

{"response": true,"data": {"username": "user","password": "123abc"      }}

en este caso, solo incluir el nivel con los datos deseados, en la sección Reemplazar con los SDTs creados se indica cómo reemplazar correctamente.

Seleccionar la herramienta Json Import 

Utilizar la herramienta:

Agregar Nombre del SDT 

Seleccionar la carpeta del Servicio

Marcar el campo Text

Copiar y pegar el ejemplo de Json

Seleccionar la opción Assume Varchar for null values.

Seleccionar OK

Verificar que se creó el SDT con un atributo para cada campo del Json, cada uno con su tipo correspondiente.

Reemplazar con los SDTs creados

Reemplazar en la carpeta *Nombre del Servicio* > Api, para cada procedimiento que GeneXus no haya creado un SDT, el tipo de los parámetros (ya sea de entrada o salida) con el SDT correspondiente.

En los casos que se reemplaza el SDT como salida:

Si el resultado de la llamada a la API (es decir, el content de &ApiResponse/&localVarResponse) es el Json de respuesta, por ejemplo: 

{    "username": "user",    "password": "123abc"}

entonces no es necesario reemplazar líneas de código, solo el tipo de las variables que reciben la respuesta. Esta respuesta es asignada en la línea:

&JsonObjectOUT.FromJson(&localVarResponse.Content)

en este ejemplo, &JsonObjectOUT debe ser del tipo de SDT creado.

Si el objeto se encuentra en un segundo nivel del resultado, como por ejemplo: 

{"response": true,"data": {"username": "user","password": "123abc"      }}

entonces se debe reemplazar, navegar el string de respuesta y recortar (mediante el método substring) solo la sección entre llaves {} que incluya los datos. Por ejemplo:

&StartIndex = &localVarResponse.Content.IndexOf("data") + 6&DataString = &localVarResponse.Content.Substring(&StartIndex,                         &localVarResponse.Content.Length() - &StartIndex)&JsonObjectOUT.FromJson(&DataString)

Incorporar los procedimientos al sistema

Para incorporarlos al sistema, solo se debe llamar al procedimiento (enviando los parámetros si los requiere) y obtener la salida de los mismos. Por ejemplo:

&SDTInput.username = trim('user')&SDTInput.password = trim('123abc')UsersControllerLogin.Call(&ServerUrlTemplatingVar, &SDTInput, &JsonObjectOUT, &HttpMessage, &IsSuccess)// &IsSuccess - boolean, indica si el servicio se encuentra activo y respondió correctamente (si el usuario no tiene permisos para utilizarlo o envió un parámetro incorrecto, resulta en false)

// &HttpMessage - mensaje de respuesta http del servicio

// &JsonObjectOUT - SDT con la respuesta del servicio, si es que tiene una

*Aclaración: la variable &ServerUrlTemplatingVar se dejó vacía, ya que la misma se reemplaza dentro del procedimiento generado (por lo que los valores de entrada eran ignorados). Esto difiere de lo indicado en la documentación oficial, pero debido a que al seguir lo indicado en la documentación no funcionaba correctamente, se realizó de manera distinta.