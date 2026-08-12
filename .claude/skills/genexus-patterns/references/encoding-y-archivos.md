# Encoding, caracteres especiales y manejo de archivos

Fuente: `base-de-conocimientos-inenco/Manejo de caracteres especiales.md`
Caso concreto de `BlobFile`: sistema **Co.Di.Neu.**

## Principio: alineación de tres capas

Los caracteres se corrompen cuando código, servidor de aplicaciones y base de datos no acuerdan la codificación. Hay que fijar las tres; arreglar una sola no alcanza.

### Capa 1 — Código GeneXus

Usá el domain estándar **`Encoding`** (Character 255, del módulo GeneXus): unifica los identificadores entre los generadores Java y .NET, así que el código queda portable.

```genexus
&xmlreader.SetDocEncoding(Encoding.UTF-8)
&HttpClient.AddHeader("Content-Type", !"application/json; charset=utf-8")
```

Reglas:

- **Tipo `File`**: si el archivo no es estrictamente UTF-8, **nunca omitas el parámetro de encoding**. Por defecto GeneXus asume UTF-8 e inyecta caracteres corruptos al leer archivos generados en Windows heredado (Windows-1252). `ReadAllText`, `ReadAllLines` y `WriteAllText` aceptan el parámetro; para leer línea por línea hay que abrir explícitamente con `&File.OpenRead(Encoding.Windows-1252)`.
- **`XMLReader` / `XMLWriter`**: `SetDocEncoding` tiene **prioridad absoluta** sobre el prólogo `<?xml …?>` del archivo. Es lo que evita las excepciones con acentos.
- **Generador .NET**: el runtime no expone por defecto las code pages tradicionales de Windows. Si hay que manipular codificaciones viejas, registrá el provider: `Encoding.RegisterProvider(CodePagesEncodingProvider.Instance)`. Y **no guardes flujos binarios crudos en variables `String` o `Character`**: los codificadores corrompen la firma binaria al mapear bytes no reconocidos.

### Capa 2 — Servidor de aplicaciones (Tomcat / JVM)

- `server.xml`: `URIEncoding="UTF-8"` explícito en **todos** los conectores HTTP y AJP activos. Sin esto, los parámetros de GET y de cabecera llegan con secuencias corruptas.
- `CATALINA_OPTS`: agregar `-Dfile.encoding=UTF-8`, para que toda la E/S de la aplicación use UTF-8 independientemente del locale del sistema operativo.
- `client.cfg`: verificar `TMPMEDIA_DIR` (carga de archivos a la base) y `CS_BLOB_PATH` (recuperación para visualización). **En el generador Java estos directorios deben existir previamente: GeneXus no los crea.** Y la aplicación necesita permisos de lectura y escritura sobre ellos.

### Capa 3 — Base de datos

- MySQL / MariaDB: colación Unicode extendida `utf8mb4`; `ALTER DATABASE … CHARACTER SET utf8mb4` si la base no nació así.
- Oracle: el motor debe estar bajo colación Unicode. Los tipos `DATE` y `TIMESTAMP` no ayudan acá — ver [fechas-y-timezone.md](fechas-y-timezone.md).
- Síntoma típico de desalineación: `Unable to translate bytes … to Unicode`.

## Sanitización de nombres de archivo

Para interoperar entre Windows y Linux, aplicar **antes** de persistir o de tocar el almacenamiento físico:

- Caracteres no seguros — capturar todo lo que no sea letra, número, guion, guion bajo, punto o espacio, y eliminarlo:
  `([^-\w. ]*)`
- Purga de rutas — aislar el nombre base, evitando que el cliente inyecte rutas absolutas o relativas:
  `/^.*[\\\/]/`
- Para transporte en URLs, `UrlEncode` / `UrlDecode`.
- Con User Controls del Marketplace, un nombre inválido puede disparar **Error 10**, que exige nombres alfanuméricos planos.

## `BlobFile` vs `Blob`

`BlobFile` (y sus subtipos `Image`, `Audio`, `Video`) es lo recomendado para desarrollos nuevos; el `Blob` tradicional se descarta.

| | `Blob` | `BlobFile` |
|---|---|---|
| Metadatos | Atributos auxiliares manuales (`FileTypeAttribute`, `FileNameAttribute`) | Campo de soporte **GXI** automático: nombre, extensión y URI |
| Almacenamiento | Solo en la celda de la tabla | Puede ir a Cloud Object Storage (S3, Azure, Google, IBM) vía Storage Provider API |
| Colisiones | El mismo nombre sobrescribe | GUID único por archivo |
| Extras | — | `FromURL` (carga desde ruta local o remota), propiedad `FileURI` para referenciar sin duplicar, renderizado automático en los subtipos |

Existe reorganización automática para migrar datos de `Blob` a `BlobFile`.

### Caveat abierto (Co.Di.Neu.)

Crear una variable `BlobFile` en un **Web Panel** no agregó el User Control de carga: en pantalla solo aparecía el label. El workaround fue subir con una variable `Blob` común y pasarla después:

```genexus
&Path = &Blob            // Blob -> Path
&BlobFile.FromURL(&Path) // el BlobFile toma la referencia
```

Esto **sí** guarda bien el documento —se verificó descargándolo directo de la base—, pero al poner el atributo `BlobFile` en pantalla para descargar vuelve a no mostrarse nada, así que **la descarga desde la UI quedó sin resolver**. Si alguien pregunta por `BlobFile` en Web Panel, avisá de esta limitación antes de que la descubra en producción.

## Sintaxis de referencia

`nexa-genexus-18/references/common-extended-type-file.md`, `-directory`, `-xmlreader`, `-xmlwriter`, `-regexmatch`; `common-data-types.md` para los tipos de blob; `common-semantic-types.md` para los domains built-in.
