---
name: genexus-standards
description: Convenciones obligatorias para escribir código y modelar objetos GeneXus en Inenco (nombres, prioridad de tipos de dato, literales y traducción, formato, ubicación de la lógica). Cargala antes de entregar cualquier código GeneXus o de proponer objetos nuevos, y cuando haya que decidir entre Attribute, Domain, SDT o tipo built-in.
---

# Estándares de código GeneXus — Inenco

Destiladas de `nexa-genexus-18/references/global-constraints.md`, `common-data.md` y la sección BEST PRACTICES de `nexa-genexus-18/SKILL.md`. Aplican a GeneXus 16, 17 y 18 en IDE clásico.

## Cómo se entrega el código

El equipo escribe en el IDE, no en archivos de texto. Traducí siempre a las pestañas del objeto:

| Lo que ves en las referencias Nexa | Lo que entregás |
|---|---|
| `Procedure Nombre { <código> }` | El contenido de la pestaña **Source** |
| `#Rules … #End` | La pestaña **Rules** |
| `#Conditions … #End` | La pestaña **Conditions** |
| `#Variables … #End` | Tabla de variables: nombre, tipo, colección sí/no |
| `#Properties … #End` | Lista de propiedades a tocar, por su nombre en la ventana Properties |
| `#Layout` / `.panel.xml` / `.web.xml` | Descripción del Form/Layout y los controles a colocar |

Nunca entregues un archivo `.gx`, ni rutas `src/…`, ni categorías `#domains/`: no existen en 16/17/18.

Los bloques de código van con fence ` ```genexus `. Los nombres de objetos y palabras clave de GeneXus, entre backticks y en Title Case: el objeto `Procedure`, el comando `For Each`.

## Nombres

- Prefijá cada atributo con la Transaction o el sublevel que lo define: `CustomerName`, `InvoiceLineQuantity`.
- Nunca califiques un atributo con punto: `Customer.CustomerName` es inválido; se escribe `CustomerName`.
- Sin abreviaturas crípticas: `CustomerTransaction`, no `CstTrx`.
- Palabras significativas y concisas, sin palabras función: `CustomerBirthDate`, no `CustomerDateOfBirth`.
- Variables: se definen sin `&` y se referencian con `&`. Los atributos van sin `&` siempre.

## Prioridad de tipo de dato

En este orden, y solo se baja un escalón si el anterior no aplica:

1. **`Attribute`** — cuando el elemento significa lo mismo que un atributo existente. En el IDE: "Based on attribute".
2. **`Domain`** — cuando hay un concepto reusable con semántica propia. Preferí los domains built-in del módulo `GeneXus` (`Email`, `Phone`, `Encoding`, `Timezones`) antes de crear uno.
3. **`SDT`** o **`Business Component`** — cuando la forma del dato ya está modelada.
4. **Tipo built-in** — solo si no hace falta semántica, formato ni validación adicional.

Al definir un `Domain` nuevo:

- Sin redundancia de sufijo (`NameDomain`) ni especializaciones de prefijo (`UserName`, `ProductName`).
- Sin overlays vacíos de un tipo de dato (`PurchaseDate` sobre `Date` no aporta nada).
- Usá enumerados en lugar de literales sueltos para conjuntos cerrados de valores, y referencialos con notación de punto: `ProductCategoryType.Cosmetics`, no `!"COSMETICS"`.
- Nunca uses como nombre una palabra reservada (`Event`), un tipo built-in (`Image`) ni un domain built-in (`Phone`).

Elementos que representan solo hora: `DataType = DateTime` con `DateFormat = None`.

## Literales y traducción

- Los literales **traducibles** van sin prefijo: `"Guardar"`.
- Los literales **no traducibles** van con `!`: `!"application/json"`, `!"www.example.com"`, `!"America/Argentina/Buenos_Aires"`.
- Prohibido dentro de literales: escapes (`\t`, `\n`), comillas escapadas, apóstrofos, emojis, caracteres de control. Para caracteres especiales usá `chr(9)` y `Newline()`.
- Todos los literales se escriben en el idioma definido por la propiedad `KbLanguage` de la KB. No mezcles idiomas.
- Si la KB es multilenguaje, cada literal traducible tiene que quedar sincronizado en los objetos `Language`.

## Formato

- Indentación con **tabuladores**, nunca con espacios.
- Un statement por línea.
- Punto y coma solo en `Rules`, `Conditions` y cláusulas `Order`.
- Argumentos de llamada siempre posicionales.
- Comentarios con `//`, en el idioma de la KB, y solo cuando explican un *por qué* que no se lee del código.

## Dónde va la lógica

- Lógica reusable → objeto `Procedure`.
- Carga de datos reusable → objeto `Data Provider`.
- Filtros reusables → objeto `Data Selector`.
- Serialización JSON/XML → objeto `SDT`, nunca armando strings a mano.
- Nunca dupliques lógica entre objetos. Antes de proponer un objeto nuevo, verificá que no exista uno con el mismo propósito y responsabilidad; el diseño es bottom-up, derivado de los datos y el comportamiento que ya hay.
- Después de tocar una `Transaction`, revisá que `Table` e índices queden consistentes (impact / reorganización).

## Antes de entregar

- [ ] Cada propiedad, método y evento usados existen en las referencias o en la wiki, con la versión objetivo verificada.
- [ ] Tipos de dato asignados según la prioridad de arriba.
- [ ] Literales con o sin `!` según correspondan a traducibles o no.
- [ ] `Commit` / `Rollback` explícitos donde toca, revisando además el `Commit on Exit` de los procedimientos llamados.
- [ ] Encoding explícito en toda lectura o escritura de archivos que no sea UTF-8.
- [ ] Se dijo con qué versión, generador y DBMS se probó o se asumió.
