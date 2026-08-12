# DateTime, zonas horarias y Oracle

Fuente: `base-de-conocimientos-inenco/Oracle y GeneXus - 5 secretos críticos.md`

## Recomendación para sistemas nuevos

`DateTime storage timezone = GMT/UTC`, y JVM en UTC. Estandarización total, de punta a punta.

## 1. El tipo `DATE` de Oracle siempre lleva hora

Oracle guarda `DATE` en una estructura fija de 7 bytes con siglo, año, mes, día, **hora, minuto y segundo**. Insertar sin especificar hora deja `00:00:00`.

Consecuencia: una comparación por igualdad contra un día calendario no encuentra un registro grabado a las `15:30:00`. `TRUNC` lo resuelve pero mata el uso de índices estándar. **Usá comparaciones de rango (`>=` y `<`)** para que el optimizador aproveche los índices sin necesidad de índices basados en funciones.

## 2. Cómo mapea GeneXus según la precisión

| Atributo GeneXus | Precisión | Tipo nativo Oracle | Capacidad TZ | Bytes |
|---|---|---|---|---|
| `Date` | N/A | `DATE` | zone-less | 7 |
| `DateTime` | Segundos | `DATE` | zone-less | 7 |
| `DateTime` | Milisegundos | `TIMESTAMP` | zone-less | 12 |
| (nativo Oracle) | N/A | `TIMESTAMP WITH TZ` | región/offset | 13 |

`DATE` y `TIMESTAMP` son **timezone-naive**: guardan valores literales y son ciegos al origen geográfico. La normalización es responsabilidad exclusiva de la capa de aplicación y del driver.

## 3. El desplazamiento invisible y `ORA-01882`

El driver JDBC (`ojdbc`) intercepta los objetos de tiempo de Java y ejecuta implícitamente `ALTER SESSION SET TIME_ZONE` según la zona de la JVM. Con la JVM en UTC-3, el driver **resta tres horas** antes de escribir en una columna `DATE`. Esa es la fuente principal de inconsistencias.

Si además hay desajuste entre la versión del driver y los archivos de zona del servidor (`timezlrg_*.dat`), salta `ORA-01882: timezone region not found`.

Argumentos de arranque de la JVM que blindan esto:

```
-Duser.timezone=UTC
-Doracle.jdbc.timezoneAsRegion=false
```

## 4. La fórmula de normalización de GeneXus

Con la propiedad `DateTime storage timezone`:

```
T_db = T_client - (O_client - O_storage)
```

| Valor | Comportamiento |
|---|---|
| `Undefined` | Zona desconocida: guarda valores literales, sin conversión. Default en KBs migradas. Alto riesgo en apps distribuidas. |
| `GMT/UTC` | Recomendado. Todo se normaliza a UTC antes de persistir. |
| `Application Server` | Los datos se alinean al huso del servidor de aplicaciones. Solo para migraciones legacy donde los datos ya coinciden con ese reloj. |

Cuándo `Application Server` es la opción sensata: migración de una app que estaba en `Undefined` y de la que **se sabe con certeza** que todo el histórico se guardó en hora local del app server; entornos totalmente alineados (base, app server, background workers y CLI en la misma zona); baja dispersión geográfica y preferencia por leer la base directamente. Evita el programa de conversión, y con eso reduce downtime y riesgo. Para todo lo demás, UTC.

## 5. DST: horas fantasma y lógica invertida

El horario de verano genera horas inexistentes (cuando el reloj adelanta) y duplicadas (cuando atrasa). Oracle lo maneja con `ERROR_ON_OVERLAP_TIME`.

El riesgo grave es la **inversión de lógica**: un Job A a las 01:45 PDT y un Job B a las 01:30 PST, durante la transición de atraso y sin normalización a UTC, pueden ejecutarse en orden invertido y romper secuencias dependientes. Se previene manteniendo actualizados los `timezlrg_*.dat` **en cliente y servidor**.

## Cambiar `DateTime storage timezone` en un sistema en producción

Operación de alto riesgo. El orden importa y no es negociable:

1. **Backup de la base.** Obligatorio.
2. Con la propiedad **todavía en `Undefined`**, escribir y ejecutar el programa de conversión. En `Undefined` GeneXus no convierte nada, así que se manipulan los valores crudos.
3. Ejecutar la conversión sobre **todas** las tablas con atributos `DateTime`:

```genexus
For Each // Tabla A
    // FromTimeZone convierte desde la zona origen a la zona del proceso
    AtributoDateTime = AtributoDateTime.FromTimeZone(Timezones.Montevideo)
EndFor

For Each // Tabla B
    AtributoDateTime = AtributoDateTime.FromTimeZone(Timezones.Montevideo)
EndFor

Commit
```

4. Recién ahí, cambiar la propiedad a `GMT/UTC` (o `Application Server`) en el IDE.
5. **Rebuild All** de toda la KB, para que los programas generados empiecen a aplicar las conversiones automáticas de lectura y escritura.
6. **Recrear los triggers de auditoría** (por ejemplo K2B Audit): los viejos loguean en hora local del servidor de base. Recrearlos **no** modifica los registros ya escritos, así que quedan huecos o superposiciones en la ventana de despliegue.

Planificá un **"Migration Quiet Period"**: inactividad del sistema por un lapso igual o mayor al offset de la zona (3 horas para UTC-3), para no solapar los logs de auditoría durante la transición.

Si se cambia de `Undefined` a `GMT/UTC` **sin** convertir, la aplicación asume que el histórico ya está en UTC y le aplica la conversión inversa al leer: todas las horas quedan desplazadas.

## `SetTimeZone` en tiempo de ejecución

```genexus
&Success = DateTime.SetTimeZone(Timezones.Buenos_Aires)
```

- Método estático de `DateTime`. El parámetro es un valor del domain `Timezones`; para una zona no listada se puede pasar el nombre (`"America/Montevideo"`).
- Devuelve Boolean: `False` si el parámetro es inválido.
- Disponible en Java, .NET y .NET Framework.
- Afecta **toda la sesión** para visualización y conversiones (`TtoC`, etc.) hasta que se lo vuelva a invocar.
- **Límite crítico:** no tiene ningún efecto sobre cómo se almacenan o recuperan los datos. La persistencia sigue dependiendo exclusivamente de `DateTime storage timezone`. `SetTimeZone` es capa de presentación.

Caso de uso: el usuario quiere ver los datos en una zona fija (la hora de una reunión en su ciudad de origen) sin importar desde dónde se conecta.

## Sintaxis de referencia

`nexa-genexus-18/references/common-data-types.md` (`DateTime`, precisión), `common-functions.md` (funciones de fecha), `common-data.md` (elementos de solo hora: `DataType = DateTime` con `DateFormat = None`), `properties-environment-datastore.md` (propiedades del data store).
