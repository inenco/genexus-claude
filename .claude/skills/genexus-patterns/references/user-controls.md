# User Controls propios

Fuente: `base-de-conocimientos-inenco/Investigación/Como crear un user control.md`
Estado: investigación con conclusiones parciales. Leé los caveats: hay cosas que la nota declara explícitamente no logradas.

## Camino A — objeto `User Control` (moderno)

Para controles sencillos u orientados a lo visual, típicamente envolviendo un componente de algún framework JS.

### Pestaña Screen Template

HTML de base. Las propiedades se interpolan con `{{Nombre_Propiedad}}`. Se pueden usar SDTs definiendo una clase de ciclo repetitivo con HTML.

### Pestaña Properties

**Lo primero:** poner en la línea 1 `<Definition auto="false">`. Viene en `true`, y con `auto="true"` GeneXus autodeclara las propiedades a partir del Screen Template y **pisa lo que escribas ahí**.

Todo tiene que ir **dentro** de `<Definition>`. Si el objeto no guarda los cambios y tampoco da error, es porque algo quedó afuera.

Propiedad simple:

```xml
<Property Name="Speed" Type="numeric" Default="600"/>
```

Propiedad tipo combo (acá se llama `enum`):

```xml
<Property Name="Mode" Type="enum" Default="horizontal">
    <Value>horizontal</Value>
    <Value>vertical</Value>
    <Value>fade</Value>
</Property>
```

Los valores entre comillas son los editables; el contenido de los `<Value>` es lo que se muestra.

Métodos, con `<Script>`:

```xml
<Script Name="Nombre_De_La_Funcion" Parameters="parm1, parm2">
    // JavaScript del método
</Script>
```

Equivale, en el render, a `Nombre_De_La_Funcion = function(){ … }`.

Disparadores: `When="BeforeShow"` ejecuta el método antes del "pintado" del control; `When="AfterShow"`, después. Son los dos más usados; la wiki lista algunos más (por ejemplo para UC de tipo Control Info) y la nota advierte que están mal documentados.

**Métodos privados:** un `_` al inicio del nombre (`<Script Name="_MetodoPrivado">`) hace que GeneXus no los ofrezca en la lista de eventos del objeto que use el control. Sin el guion bajo, **todos** los métodos declarados con `<Script>` quedan disponibles desde el Web Panel o la Transaction, incluso los que no están pensados para llamarse desde ahí.

Eventos hacia GeneXus:

```xml
<Event Name="NombreDelEvento"/>
```

Habilita programar en el Web Panel:

```genexus
Event UserControlName.NombreDelEvento
EndEvent
```

y dispararlo desde el render JS con `this.NombreDelEvento();`.

### Recursos externos: librería base

Empaquetá css, js e imágenes en un zip con extensión **`.gxlibrary`** y agregalo en la sección Files de la KB. GeneXus reconoce los `.gxlibrary` como librerías base y aparecen en la propiedad **Base Style** del objeto User Control. En ejecución copia los recursos al webapp (Java o .NET) y referencia css y js en el `<head>` del HTML del objeto.

### JavaScript: qué usar

`$(document).ready(...)` se puede escribir pero **no va a funcionar**: el objeto User Control es abstracto y no permite programar directo en el render, solo por métodos. Usá:

```javascript
gx.evt.on_ready(this, function(){
    // código
});
```

`document.ready` no equivale a la página GeneXus cargada; `gx.evt.on_ready` dispara cuando GeneXus terminó de cargar todo. A veces coinciden, pero en la mayoría de los casos el de GeneXus corre un poco después, y es lo que garantiza que esté todo en pantalla. Llamá al `on_ready` desde un script en el `BeforeShow`.

**Caveat:** quien escribió la nota **no logró hacer funcionar esta forma**, aunque encontró lo que parece un ejemplo construido así. Tomá el camino A como orientación, no como receta probada.

## Camino B — UC "de un solo archivo" (forma antigua)

Cuatro archivos:

1. **`.control`** — definición general en XML: `<ControlDefinition>`, `<Version>`, `<Name>`, `<Id>`, `<Description>`, `<Platforms>`, `<ControlType>`, `<Categories>`, `<ObjClass>`, `<Constructor>`, `<ShowMethod>`, `<DataSourceAllowed>`, `<CustomDataSources>`, `<AutoGrowSupported>`, `<ResizeSupported>`, `<IncludeInControlInfo>`, `<HeightPropertyName>` / `<WidthPropertyName>`, `<ToolboxIcon>`, `<IsPublic>`, `<Events>`, `<Methods>`, `<Actions>`, `<GxResources>`, `<SupportFiles>` y sus variantes por plataforma (`<iOS_SupportFiles>`, `<Android_SupportFiles>`), `<ReferencedFiles>` y sus variantes, `<PropertiesDefinition>`, `<DesignRender>`, `<RuntimeRender>`, `<Android_IsScrollable>`.
2. **Propiedades** — XML con raíz `<Content>`, un `<Object id="…">` por control, `<Group>` agrupando, y un `<Prop>` por propiedad con `<Name>`, `<Type>`, `<Default>`, `<CustomType>` y `<Metadata>` (donde los `<Value>` definen los métodos setter/getter y el tipo esperado).
3. **Render de diseño (XSL)** — cómo se ve en el IDE. `<xsl:stylesheet>` con los namespaces y excluyendo los prefijos `msxml` y `gx`; `<xsl:output method="html">`; template raíz `match="/"`; template `match="GxControl"` con un `<xsl:choose>`/`<xsl:when>` que elige el render según el tipo de control; templates de render por control, que pueden usar `gxca:GetMyPath()` para resolver rutas de imágenes; y un template auxiliar tipo `AddStyleAttribute` para inyectar estilos.
4. **Render de ejecución (JS)** — el JavaScript real, donde valen las funciones de GeneXus (`gx.evt.on_ready`, etc.).

La nota apunta a basarse en los ejemplos de GeneXus, en el User Control Generator y en UCs existentes antes de escribir los cuatro archivos desde cero.

## Antes de recomendar un User Control propio

Preguntá si el requerimiento no se cubre con un control estándar o con uno del Marketplace: es más código propio para mantener, y en el Marketplace hay controles que ya fallan solos ante nombres de archivo con caracteres especiales (Error 10, ver [encoding-y-archivos.md](encoding-y-archivos.md)).
