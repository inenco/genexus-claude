# Android: External Objects, push notifications y Play Store

Fuentes:
- `base-de-conocimientos-inenco/Creacion de External Object Mobile.md` — validado en **GX17 U11** + Android Studio Ladybug Feature Drop 2024.2.2
- `base-de-conocimientos-inenco/Notificaciones mobile/` — `EnviarNotificacion.xpz` (objetos exportados, importables a una KB) y `pushNotifications2.mp4`
- `base-de-conocimientos-inenco/Subir app a playstore/Subir app.md`

## External Object con código Android nativo

Arquitectura del caso documentado (compresión de imágenes antes de sincronizar):

```
GeneXus
  └── ImageCompressor.library
        └── Android Extension Library (.aar)
              ├── ImageCompressorModule            (implements GenexusModule)
              └── ImageCompressorExternalObject    (extends ExternalApi)
                    └── código Android nativo (BitmapFactory, Bitmap.compress, ExifInterface)
```

### Pasos

1. **Proyecto Android vacío**: New Project → No Activity. Java, Minimum SDK igual al de la app (24 en el caso), Groovy DSL.
2. **Convertir a Android Library**:
   - `gradle/libs.versions.toml`: agregar `android-library = { id = "com.android.library", version.ref = "agp" }` junto al `android-application` existente.
   - `app/build.gradle`: cambiar `alias(libs.plugins.android.application)` por `alias(libs.plugins.android.library)`.
   - Eliminar el `applicationId` (una librería no es ejecutable).
   - Sync.
3. **Repositorio Maven local de GeneXus** en `settings.gradle`:

```groovy
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = uri("C:/Program Files (x86)/GeneXus/GeneXus17/Android/m2Repository") }
    }
}
```

4. **Dependencias** en `app/build.gradle` (versiones del caso GX17 U11 — verificá las de tu instalación en el `m2Repository`):

```groovy
implementation "com.genexus.android:CoreExternalObjects:1.2.1"
implementation "com.genexus.android:FlexibleClient:1.2.1"
implementation "com.genexus.android:CoreUserControls:1.2.1"
```

5. **Las dos clases.** El módulo registra la API; el External Object expone los métodos:

```java
public class ImageCompressorModule implements GenexusModule {
    @Override
    public void initialize(Context context) {
        ExternalApiDefinition api =
            new ExternalApiDefinition("ImageCompressor", ImageCompressorExternalObject.class);
        ExternalApiFactory.addApi(api);
    }
}
```

```java
public class ImageCompressorExternalObject extends ExternalApi {
    public ImageCompressorExternalObject(ApiAction action) {
        super(action);
        addMethodHandler("Test", 0, new TestHandler());
    }

    private class TestHandler implements ExternalApi.IMethodInvoker {
        @Override
        public ExternalApiResult invoke(java.util.List parameters) {
            String text = parameters.get(0).toString();
            return ExternalApiResult.success("ANDROID OK -> " + text);
        }
    }
}
```

El segundo argumento de `addMethodHandler` es el índice del handler; el nombre (`"Test"`) tiene que coincidir con el método declarado en el External Object de la KB.

6. **Deshabilitar los androidTest**, que rompen el build:

```groovy
android { testOptions { animationsDisabled = true } }

tasks.configureEach {
    if (name.contains("AndroidTest")) { enabled = false }
}
```

Luego Sync → Clean Project → Rebuild.

7. **Publicar como Maven.** En `app/build.gradle`: agregar `id 'maven-publish'` a `plugins`, declarar `group` y `version` a nivel de proyecto, habilitar el componente publicable y configurar la publicación:

```groovy
android {
    // …
    publishing { singleVariant("release") }
}

afterEvaluate {
    publishing {
        publications {
            release(MavenPublication) {
                from components.release
                groupId = "com.sigihignia.imagecompressor"
                artifactId = "ImageCompressor"
                version = "1.0.0"
            }
        }
        repositories {
            maven { url = layout.buildDirectory.dir("repo") }
        }
    }
}
```

```
gradlew publishReleasePublicationToMavenRepository
```

El resultado queda en `app/build/repo/` con la misma estructura que el `m2Repository` de GeneXus (`.aar`, `.module`, `.pom`, `maven-metadata.xml`), lista para copiar ahí.

8. **Renombrar el módulo** de `app` al nombre de la librería (`include ':ImageCompressor'` en `settings.gradle`), para que el artefacto salga como `ImageCompressor-release.aar` y coincida con el nombre de la librería. Sync.

9. **El archivo `.library`**, en `C:\Program Files (x86)\GeneXus\GeneXus17\Libraries\<Nombre>\`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<ExtensionLibrary Name="ImageCompressor">
    <Implements>
        <ExternalObject name="ImageCompressor"/>
    </Implements>
    <Android>
        <GroupId>com.sigihignia.imagecompressor</GroupId>
        <Name>ImageCompressor</Name>
        <Version>1.0.0</Version>
        <ModuleClass>com.sigihignia.imagecompressor.ImageCompressorModule</ModuleClass>
    </Android>
</ExtensionLibrary>
```

### Caveat abierto

Tras reiniciar GeneXus, la librería **no apareció** en Tools → Extensions Manager. La nota termina ahí: el circuito completo hasta usarla desde la KB **no quedó verificado**. Si alguien va por este camino, decíselo: tiene la parte Android resuelta y el registro en el IDE pendiente.

## Push notifications

En `base-de-conocimientos-inenco/Notificaciones mobile/` hay un `.xpz` con los objetos ya construidos (`EnviarNotificacion`) y un video con el procedimiento. El `.xpz` se importa desde el IDE con Knowledge Manager → Import. No hay nota escrita: si te preguntan, señalá esos dos archivos y pedí que se documente el paso a paso al usarlos (`/gx-aportar`).

## Firmar y subir a Play Store

Generar el Key Store con el `keytool` que viene en el `/bin` del JDK:

```
keytool -genkey -v -keystore "<ruta>\app.keystore" -alias <appnombre> -keyalg RSA -keysize 2048 -validity 10000
```

Ejemplo real del equipo (proyecto blh):

```
keytool -genkey -v -keystore "C:\Users\aalmiron\Pictures\blh\blh.keystore" -alias blh -keyalg RSA -keysize 2048 -validity 10000
```

La nota interna cubre solo este primer paso. El resto (configurar el keystore en las propiedades del generador Android de la KB, generar el bundle firmado y publicarlo en Play Console) hay que sacarlo de la wiki oficial, y conviene documentarlo cuando se haga.

## Sintaxis de referencia

`nexa-genexus-18/references/object-external-object.md` para declarar el External Object en la KB (métodos, propiedades, eventos, tipos); `object-panel.md` para las pantallas mobile; `properties-environment-frontend.md` para propiedades del generador.
