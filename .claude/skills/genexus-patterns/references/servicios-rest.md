# Consumo de servicios REST en GeneXus

Fuente: `base-de-conocimientos-inenco/Servicios Rest/Como incorporar Servicios REST en GeneXus.md`
Validado en: sistema de Licitaciones de la Provincia de Neuquén, integración vía **XRoad**. Archivo de ejemplo: `ejemploXRoad.yaml` en la misma carpeta.
Documentación base: [OpenAPI import tool (GeneXus 17 U8 o anterior)](https://wiki.genexus.com/commwiki/servlet/wiki?50177)

## Camino recomendado: OpenAPI Import

1. Pedí al administrador del servicio el **`.yaml` con la definición OpenAPI**. Sin él no hay import.
2. Creá una carpeta en la KB con el nombre del servicio.
3. Corré la herramienta **OpenAPI Import** e importá los objetos ahí.
4. Verificá que se hayan generado: la carpeta `OpenAPICommon` con procedimientos de infraestructura (puede existir ya si se importó otro servicio antes), y la carpeta del servicio con `Client/` y `Api/`.

## Dos parches que hubo que aplicar

Ambos fueron necesarios con XRoad y pueden diferir en otras implementaciones, pero son el primer lugar donde mirar si el llamado no sale.

### `Execute` no funciona pasando solo la URL

En el `Procedure` `CallApi` de `OpenAPICommon`, reemplazar:

```genexus
&httpClient.Execute(&Method, &UrlWithParms)
```

por:

```genexus
&httpClient.Host = &UrlWithParms.Substring(1, &UrlWithParms.IndexOf('/') - 1)
&httpClient.Execute(&Method, &UrlWithParms.Substring(&UrlWithParms.IndexOf('/')))
```

Es decir: se fija `Host` por separado y a `Execute` se le pasa solo el path. La URL entra con forma `<host>/<path>/<subpath>`.

### `ApiBaseUrl` viene vacío

En `<Servicio> > Client > ApiBaseUrl`, reemplazar `&BaseURL = "/"` por el host real, que sale del `.yaml`. Solo el host, sin path ni esquema: `192.168.0.100`.

## SDTs para los payloads JSON

GeneXus no siempre genera el SDT de entrada o salida. Cuando falta:

1. Conseguí un JSON de ejemplo con los campos reales.
2. Herramienta **Json Import**: nombre del SDT, carpeta del servicio, marcar **Text**, pegar el JSON, y tildar **Assume Varchar for null values**.
3. Verificá que cada campo quedó con su tipo.
4. En los procedimientos de `Api/`, reemplazá el tipo de los parámetros de entrada/salida por el SDT creado.

**Payload anidado.** Si los datos vienen en un segundo nivel:

```json
{ "response": true, "data": { "username": "user", "password": "123abc" } }
```

modelá el SDT solo con el nivel de datos y recortá la respuesta antes de deserializar:

```genexus
&StartIndex = &localVarResponse.Content.IndexOf("data") + 6
&DataString = &localVarResponse.Content.Substring(&StartIndex, &localVarResponse.Content.Length() - &StartIndex)
&JsonObjectOUT.FromJson(&DataString)
```

Si en cambio el `Content` ya es el JSON plano, no se toca ninguna línea: alcanza con cambiar el tipo de la variable que recibe `FromJson`.

## Invocar el servicio desde el sistema

```genexus
&SDTInput.username = trim('user')
&SDTInput.password = trim('123abc')
UsersControllerLogin.Call(&ServerUrlTemplatingVar, &SDTInput, &JsonObjectOUT, &HttpMessage, &IsSuccess)
```

- `&IsSuccess` — Boolean: el servicio respondió correctamente. Da `False` también por falta de permisos o parámetro inválido, no solo por servicio caído.
- `&HttpMessage` — mensaje HTTP de respuesta.
- `&JsonObjectOUT` — SDT con el payload, si hay.

**Caveat documentado:** `&ServerUrlTemplatingVar` se dejó **vacía**. El procedimiento generado la reemplaza internamente y **ignora** lo que se le pase. Esto contradice la documentación oficial; siguiéndola no funcionaba.

## Recordatorios de encoding

Al enviar JSON o CSV, declarar el charset explícitamente:

```genexus
&HttpClient.AddHeader("Content-Type", !"application/json; charset=utf-8")
```

Ver [encoding-y-archivos.md](encoding-y-archivos.md) para la alineación completa código / app server / base de datos.

## Sintaxis de referencia

`nexa-genexus-18/references/common-extended-type-httpclient.md` para métodos y propiedades de `HttpClient`; `object-api.md` para *exponer* servicios propios (el caso inverso al de esta nota); `common-serialization.md` para `FromJson` / `ToJson`.
