# Versionado de KBs en GXserver

Fuente: `base-de-conocimientos-inenco/Investigación/Manejo de versiones.md`
Implementado en: KB **sigihIgnia**.

## Dos formas de crear versiones

- **Local** — versiones manejadas desde la máquina propia. Sirve si sos el único desarrollador del proyecto y necesitás presentar versiones distintas.
- **En GXserver** — es la que usa el equipo.

## Crear una versión en GXserver

1. En GXserver, posicionate sobre la KB a versionar.
2. Pestaña **Versions** → **freeze** de la rama.
3. A partir de ese freeze, creá la versión nueva.
4. En la máquina local, creá una **KB nueva** seleccionando esa rama.

**Ojo con bajar todas las ramas:** podés descargar todas las existentes, pero eso **no** garantiza que futuras versiones se actualicen en esa KB. Baja las ramas creadas hasta ese momento, no las futuras.

## Mergear

**De la rama principal hacia la nueva:** posicionate sobre la KB local de la rama nueva y hacé **Bring all changes** de la rama principal. Si son muchos cambios, hacelo por partes.

**De la rama nueva hacia la principal:** posicionate sobre la KB local de la rama principal y hacé **Bring all changes**. Podés especificar desde qué commit traer los cambios; **si no especificás, trae todo**. Conviene especificar para agilizar el merge.

## Al asesorar sobre esto

Recordá que la KB de 16/17/18 es binaria: el versionado pasa por GXserver, no por git. Si alguien pregunta "cómo hago una branch", la respuesta es freeze + versión en GXserver, no un comando de git.
