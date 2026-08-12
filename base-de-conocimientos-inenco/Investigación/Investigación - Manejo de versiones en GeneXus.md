Manejo de versiones en GX

Manejo de versiones en GX

Lo mencionado en este documento se implementó en la KB de sigihIgnia. 

Crear versiones nuevas

Se podrían crear de dos maneras diferentes, dependiendo el caso que se presente: 

-Local:De esta forma, nos permite manejar versiones desde nuestra máquina. Ideal si somos el único desarrollador del proyecto y debemos presentar diferentes versiones. 

-En gxserver:

Esta es la forma que implementamos nosotros. En gxserver, nos posicionamos en la KB que queremos versionar, nos dirigimos a la pestaña ‘versions’ y freezamos la rama. Luego, a partir de ese frizado, creamos la versión nueva. 

En nuestra PC, debemos crear una nueva KB y seleccionar esa rama en específico. Podemos también descargar todas las ramas, aunque eso no asegurará que futuras versiones sean actualizadas en esa KB. Descarga ramas creadas hasta ese momento, no futuras. 

Mergear versiones

Traer cambios de la rama principal a la nueva rama creada: te posicionas sobre la KB local de la nueva rama creada y pones ‘bring all changes’ de la rama principal. Comenzamos el merge, si son muchos cambios hay que ir por partes. 

De la nueva rama creada a la principal: te posicionas sobre la KB local de la rama principal y pones ‘bring all changes’. Podes especificar desde qué commit traer los cambios, si no se especifica se trae todos por defecto. Si es posible, mejor especificar para agilizar el proceso de merge.