# SIGIH — Guías Mobile

**Sistema Integral de Gestión de la Información Hidrocarburífera** — módulo Mobile Guías.

## Ficha técnica

| | |
|---|---|
| GeneXus | 17 Upgrade 11 |
| KB local | `SigihAPKGuias` |
| KB en GXServer | `SigihAPK_Guias` |
| Entorno de Producción | Web/Mobile · Java · SQL Server |
| SmartDevice | Sí |
| Generador | Java |
| Base de datos | SQL Server |
| JDK | 11 |
| Tomcat | 9.0 |
| Pattern | Ignia |
| Style | Carmine (Web) y CarmineSD (Mobile) |
| Versión Android soportada | 5 a 16 (probada en 15 y 16) |
| Classpath adicional | Ninguno |
| User Controls | Ninguno registrado |

## Accesos

La configuración de accesos está documentada aparte, en **"Documento Accesos"**.

## Deploy y versionado en Producción

- El deploy a producción se hace en **modo distribution**. Para el procedimiento de firma y extracción del APK a subir, ver la guía **"Documentación - Firma distribución app"**.
- El versionado de la app se lleva **a mano** sobre el objeto `Startup`: el valor ahí tiene que coincidir con el parámetro `AppVersionGuia` de la tabla `Parametro`. Si no coinciden, la build no está lista para publicar.

## Historial

- **~01/10/2025** — Se separó la parte mobile de la KB unificada de Web.
