Como crear un user control

Creando con Objeto “User control”:

En la pestaña Screen Template va un "Template" html que quieras tener de base, allí puedes definir las propiedades del user control utilizando {{Nombre_Propiedad}} hay un par de cosas con esas propiedades, como que puedes usar SDT allí y para eso definir una clase de ciclo repetitivo con html, eso está pensando cuando tus UC sean "sencillos" o más orientados al tema visual implementando componentes de algún framework, eso sí está bastante descrito en la Wiki.

En la pestaña Properties es donde haces la magia, lo primero es poner en la línea 1 <Definition auto="false"> por defecto está en True y lo que hace es que GeneXus auto declara las propiedades según lo que vas agregando en el  Screen Template si escribes algo allí y no pones el auto en False probablemente lo pierdas.

Para declarar más propiedades, sigues el formato de las que ya te declaró GeneXus, o básicamente es: <Property Name="Speed" Type="numeric" Default="600"/> (los valores que van entre comillas son los editables), si la propiedad es de tipo "combo" que en este control se conoce como Enum entonces es algo así:

<Property Name="Mode" Type="enum" Default="horizontal">

      <Value>horizontal</Value>

      <Value>vertical</Value>

      <Value>fade</Value>

  </Property>

Mismo concepto del anterior editables los valores entre comillas y los datos que están dentro de los tag Value serán los que se muestran.

Ahora en este mismo Tab, para agregar métodos o funciones, los declaras con un tag <Script> donde le defines un nombre y sus posibles parámetros, sería algo así:

<Script Name="Nombre_De_La_Funcion">

      //Acá todo el código Javascript que requieras en el método

</Script> 

Esto para que se entienda un poco mejor, sería en el Render lo equivalente a:

Nombre_De_La_Funcion = function(){

      //Acá todo el código Javascript que requieras en el método

}

Si quieres definir que tu método recibe parámetros entonces lo haces algo así:

<Script Name="Nombre_De_La_Funcion" Parameters="parm1, parm2, etc...">

</Script>

Ahora, hay algunos disparadores que puedes agregar para los método, en caso que así se requieran, en la wiki hay algunos eventos, pero sí creo que o no hay más de los que dice la Wiki, o no están bien documentados, por ejemplo si quieres que un método se ejecute antes del Show que hacen los UC normalmente lo harías de la siguiente manera:

<Script Name="NombreDelMetodo" When="BeforeShow">

Esto hace que GeneXus ejecute automáticamente tu método antes de hacer el "pintado" del mismo en pantalla, y si quieres que se ejecute después del pintado entonces en lugar de BeforeShow usas AfterShow (estos dos disparadores son los más usados, en la Wiki puedes ver algunos otros como por ejemplo cuando el UC es de tipo Control Info)

Ahora es importante que se sepa que todos estos métodos que se declaren con la etiqueta script van a estar disponibles desde el WebPanel o Trn (WebForm) donde lo uses si desde algún evento haces UserControl.Metodo te salen todos, aún si no están pensados para llamarse desde allí.

Entonces si quieres que estos métodos sean "Privados" y no estén disponibles en los eventos de un Objeto GX sino solo para tu RenderJS, los declaras en el nombre con un Guion Bajo ( _ ) al inicio del nombre, por ejemplo:

<Script Name="_MetodoPrivado">

Esto no cambia la declaración en el RenderJS con respecto a los otros, pero si GX entiende que no los debe sacar en la lista de eventos cuando se llame o utilice el UC desde los Events de un Objeto.

Para definir un Evento de UserControl, que puede ser escuchado y programado desde GeneXus, entonces lo haces con el Tag <Event> por ejemplo:

<Event Name="NombreDelEvento"/>

Esto hace que desde un WebPanel  puedas programar algo como:

Event UserControlName.NombreDelEvento

EndEvent

Y si lo llamas desde algún método de tu RenderJS por ejemplo: this.NombreDelEvento(); entonces GX disparará el Evento GeneXus que se codificó en el webpanel.

Por último, si tu UC se basa en alguna librería externa o tienes unos recursos como css, js, imagenes, etc externos que deseas incluir para que se referencien y tu UC pueda funcionar bien, entonces utilizas el concepto "Librería Base" donde básicamente tomas los recursos externos, y lo pones en un comprimido de formato zip con el nombre que quieras, pero con extensión gxlibrary y lo agregas en el apartado Files de la KB, todos estos gxlibrary GeneXus los va a entender como librerías bases y entonces en  tu User Control Object en la propiedad Base Style te saldrá una lista con todos estos, selecciona el adecuado y esto hará que en ejecución GeneXus copie todos estos recursos a tu webapp (sea Java o .Net)y referencie los css y los js en el head de la página html equivalente del objeto GeneXus que se esté ejecutando.

¿Se puede usar el siguiente código?

$( document ).ready(function() {

  // Handler for .ready() called.

});

De poder se puede, pero no te va a funcionar, porque el UC Object está en un nivel abstracto, entonces no te deja programar algo directamente en el render, sino sólo por métodos, lo que puedes hacer es disparar un método en el AfterShow que sería cuando ya se pintó el UC, o que en algún js de tu base library lo programes

Ahora, te recomiendo usar el 

gx.evt.on_ready(this, function(){

 //TODO, CODIGO AQUÍ

});

Pues el document.ready no es igual a la página cargada totalmente, al menos las de genexus, en cambio en gx.evt.on_ready si es cuando ya genexus cargó todo y la página está lista, en ocasiones se disparan consecutivamente casi igual, pero en la mayoría el de gx se ejecuta un poco después, y con eso puedes garantizar que está todo en pantalla de lo que necesites

El onready llamalo en un script en el before show

Si el objeto no guarda los cambios ni da error tampoco, simplemente no los guarda es porque todo debe estar por dentro de Definition

O sea

<Definition auto="false">

<Script Name="Autocomplete" When="AfterShow">

</Script>

</Definition>

Anotación: No logré que esta forma me funcione, pero si encontré lo que parece ser un ejemplo creado de esta forma. 

UC de un solo archivo

Crearlos de la manera antigua: 

Ejemplo de Genexus

User control generator

UC creados para basarse

Otro UC

Se necesita crear 4 archivos: 

-Un archivo de definición de control: se definen aspectos generales del control, como nombre, versión o recursos externos. Su extensión es .control

-Un archivo de propiedades, donde se definen las propiedades del control.

-Un archivo render en tiempo de diseño, que especifica cómo se visualizará el control en tiempo de diseño (en el IDE de GeneXus).

-Un archivo de representación en tiempo de ejecución, que especifica cómo se mostrará el control en tiempo de ejecución.

Archivo control:

Este es un archivo de definición de control en formato XML. Se utiliza para definir un control personalizado para una aplicación en particular. A continuación se detallan algunos de los elementos y atributos del archivo:

-La etiqueta <ControlDefinition> define un nuevo control.

-La etiqueta <Version> indica la versión del control.

-La etiqueta <DataSourceAllowed> indica si el control permite la conexión a una fuente de datos.

-La etiqueta <CustomDataSources> indica las fuentes de datos personalizadas disponibles para el control.

-La etiqueta <AutoGrowSupported> indica si el control es compatible con el crecimiento automático.

-La etiqueta <IncludeInControlInfo> indica si el control debe incluirse en la información de control.

-La etiqueta <SupportFiles> indica los archivos necesarios para que el control se ejecute correctamente.

-Las etiquetas <iOS_SupportFiles>, <Android_SupportFiles> y <BB_SupportFiles> indican los archivos específicos para cada plataforma.

-La etiqueta <RuntimeRender> indica el archivo JavaScript que se usará para el renderizado en tiempo de ejecución

-La etiqueta <GxResources> indica los recursos asociados al control.

-Las etiquetas <HeightPropertyName> y <WidthPropertyName> indican los nombres de las propiedades que determinan el alto y el ancho del control, respectivamente.

-La etiqueta <ResizeSupported> indica si el control admite el cambio de tamaño.

-La etiqueta <ObjClass> indica la clase de objeto correspondiente al control.

-La etiqueta <Description> proporciona una breve descripción del control.

-La etiqueta <Id> proporciona un identificador único para el control.

-La etiqueta <Name> indica el nombre del control.

-La etiqueta <Platforms> indica las plataformas en las que se admite el control.

-La etiqueta <ShowMethod> indica el método utilizado para mostrar el control.

-La etiqueta <ReferencedFiles> indica los archivos de recursos que se utilizan para el control.

-Las etiquetas <iOS_ReferencedFiles>, <Android_ReferencedFiles> y <BB_ReferencedFiles> indican los archivos de recursos específicos para cada plataforma.

-La etiqueta <Constructor> indica el constructor utilizado para crear el control.

-La etiqueta <PropertiesDefinition> indica el archivo XML que define las propiedades del control.

-La etiqueta <DesignRender> indica el archivo XSL utilizado para el renderizado de diseño.

-La etiqueta <ToolboxIcon> indica el icono que se utilizará en el cuadro de herramientas para representar el control.

-La etiqueta <ControlType> indica el tipo de control.

-La etiqueta <Categories> indica las categorías a las que pertenece el control.

-La etiqueta <Events> indica los eventos a los que responde el control.

-La etiqueta <Methods> indica los métodos disponibles para el control.

-La etiqueta <Actions> indica las acciones disponibles para el control.

-La etiqueta <IsPublic> indica si el control es público o privado.

-La etiqueta <Android_IsScrollable> indica si el control es desplazable en Android.

Es importante tener en cuenta que este archivo es utilizado por Genexus para generar el código necesario para implementar el control en la aplicación, por lo que debe seguir una estructura específica y contener la información necesaria para que el control funcione correctamente.

Archivo propiedades:

Estas propiedades se utilizan para personalizar el aspecto y la funcionalidad del control de menú en la aplicación Genexus.

-La etiqueta raíz es <Content>, que engloba todo el contenido del archivo. Dentro de la etiqueta <Content>, hay una serie de elementos <Object>, que representan los controles que se van a configurar.

-Cada <Object> tiene un atributo id, que identifica el control al que se refiere. Dentro de cada <Object>, hay un <Group> que agrupa las propiedades del control, y dentro de <Group> hay una serie de elementos <Prop> que representan cada propiedad del control.

-Las etiquetas <Name> y <Type> indican el nombre y tipo de cada propiedad, respectivamente.

-La etiqueta <Default> se utiliza para especificar un valor por defecto para la propiedad, en caso de que no se haya configurado ningún valor explícitamente.

-La etiqueta <CustomType> se utiliza para especificar el tipo de dato personalizado de la propiedad.

-La etiqueta <Metadata> se utiliza para agregar información adicional sobre la propiedad. En este caso, se usan las etiquetas <Value> dentro de <Metadata> para especificar el nombre de los métodos de configuración y obtención de la propiedad, y el tipo de datos que se espera como valor para la propiedad.

Archivo Render (XSL):

-La etiqueta <xsl:stylesheet> define el comienzo del archivo XSLT y especifica la versión de XSLT que se va a usar. También se definen los namespaces que se van a utilizar y se excluyen los prefijos msxml y gx del resultado.

-La etiqueta <xsl:output> indica el formato de salida del archivo, en este caso HTML.

-La plantilla <xsl:template> con el atributo match="/" define la plantilla raíz del archivo, es decir, el punto de partida desde donde se aplicarán las plantillas.

-La plantilla <xsl:template> con el atributo match="GxControl" indica que se va a aplicar esta plantilla a todos los nodos del tipo GxControl en el documento XML que se va a transformar. Dentro de esta plantilla se utiliza una estructura condicional <xsl:choose>/<xsl:when> para determinar qué plantilla de renderizado utilizar en función del tipo de control que se esté renderizando.

-La plantilla <xsl:template> con el atributo name="RendergpxMenu" define la plantilla de renderizado para el control gpxMenu. Dentro de esta plantilla se utiliza la función gxca:GetMyPath() para obtener la ruta de la imagen que se va a mostrar junto al control. También se llama a la plantilla AddStyleAttribute para agregar estilos al control.

-La plantilla <xsl:template> con el atributo name="AddStyleAttribute" define la plantilla que agrega los estilos al control. En este caso, se define el estilo "border-style: solid; border-width: 0px;" y se le asigna a la etiqueta span.

Archivo Render (JS):

Acá se coloca código JS, pueden utilizarse las funciones de genexus como: 

gx.evt.on_ready(this, function(){ 

CÓDIGO JS

})

u otras más.