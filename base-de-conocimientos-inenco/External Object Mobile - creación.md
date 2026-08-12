Este documento presenta el paso a paso para la creacion de un External Object para uso en mobile, en este caso para la compresion de imagenes. Se utilizo Genexus 17 U11 y Android Studio Ladybug Feature Drop | 2024.2.2

Objetivo

Crear una librería Android (.aar) que implemente un External Object (EO) de GeneXus para poder ejecutar código Android nativo (Java), con el objetivo de comprimir imágenes antes de sincronizarlas.

La arquitectura final será:

GeneXus

   │

   ├── ImageCompressor.library

   │

   ▼

Android Extension Library (.aar)

   │

   ├── ImageCompressorModule

   └── ImageCompressorExternalObject

   │

   ▼

Código Android nativo

   │

   ├── BitmapFactory

   ├── Bitmap

   ├── Bitmap.compress()

   └── ExifInterface

Paso 1 - Crear un proyecto Android vacío

En Android Studio:

New Project

↓

No Activity

Configurá:

Name: ImageCompressorLib

Package Name: com.sigihignia.imagecompressor

Language: Java

Minimum SDK: 24 (o el mismo que usa tu app)

Build configuration language: Groovy DSL (build.gradle)

Paso 2 - Revisar la estructura generada

Android Studio creó la siguiente estructura:

ImageCompressorLib

│

├── app

│   ├── manifests

│   ├── java

│   └── res

│

└── Gradle Scripts

   ├── settings.gradle

   ├── build.gradle (Project)

   ├── build.gradle (Module)

   └── libs.versions.toml

Paso 3 - Convertir el proyecto en una Android Library

El proyecto se creó como una aplicación Android.

Para transformarlo en una librería se realizaron dos modificaciones.

3.1 Agregar el plugin Android Library

Archivo:

gradle/libs.versions.toml

Original:

[plugins]

android-application = { id = "com.android.application", version.ref = "agp" }

Se agregó:

android-library = { id = "com.android.library", version.ref = "agp" }

Quedando:

[plugins]

android-application = { id = "com.android.application", version.ref = "agp" }

android-library = { id = "com.android.library", version.ref = "agp" }

3.2 Cambiar el plugin del módulo

Archivo:

app/build.gradle

Original:

plugins {

   alias(libs.plugins.android.application)

}

Nuevo:

plugins {

   alias(libs.plugins.android.library)

}

3.3 Eliminar el applicationId

Como una librería Android no es una aplicación ejecutable, se eliminó:

applicationId "com.sigihignia.imagecompressor"

Paso 4 - Sincronizar Gradle

Luego de las modificaciones se ejecutó:

File

   ↓

Sync Project with Gradle Files

Paso 5 - Próximo paso

El siguiente paso consiste en configurar el proyecto para que pueda utilizar las librerías de GeneXus.

Para ello habrá que agregar al archivo settings.gradle el repositorio Maven local de GeneXus:

dependencyResolutionManagement {

    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)

    repositories {

        google()

        mavenCentral()

        maven {

            url = uri("C:/Program Files (x86)/GeneXus/GeneXus17/Android/m2Repository")

        }

    }

}

Paso 7 - Agregar las dependencias de GeneXus

Ahora sí, en app/build.gradle, dentro de dependencies, agregá estas tres líneas:

implementation "com.genexus.android:CoreExternalObjects:1.2.1"

implementation "com.genexus.android:FlexibleClient:1.2.1"

implementation "com.genexus.android:CoreUserControls:1.2.1"

Te debería quedar algo parecido a:

dependencies {

   implementation libs.appcompat

   implementation libs.material

   implementation "com.genexus.android:CoreExternalObjects:1.2.1"

   implementation "com.genexus.android:FlexibleClient:1.2.1"

   implementation "com.genexus.android:CoreUserControls:1.2.1"

   testImplementation libs.junit

   androidTestImplementation libs.ext.junit

   androidTestImplementation libs.espresso.core

}

Luego hacé:

File

→ Sync Project with Gradle Files

8 - Crear clase ImageCompressorExternalObject 

Click derecho en Java -> com.sigihignia.imagecompressor crear ImageCompressorExternalObject y ImageCompressorModule

En el ImageCompressorModule colocar:

package com.sigihignia.imagecompressor;

import android.content.Context;

import com.genexus.android.core.externalapi.ExternalApiDefinition;

import com.genexus.android.core.externalapi.ExternalApiFactory;

import com.genexus.android.core.framework.GenexusModule;

public class ImageCompressorModule implements GenexusModule {

   @Override

   public void initialize(Context context) {

       ExternalApiDefinition api =

               new ExternalApiDefinition(

                       "ImageCompressor",

                       ImageCompressorExternalObject.class);

       ExternalApiFactory.addApi(api);

   }

}

en ImageCompressorExternalObject  colocar:

package com.sigihignia.imagecompressor;

import com.genexus.android.core.actions.ApiAction;

import com.genexus.android.core.externalapi.ExternalApi;

import com.genexus.android.core.externalapi.ExternalApiResult;

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

9 - Deshabilitar tests para buildEn app/build.gradle, agregá dentro de android { ... }:

testOptions {

   animationsDisabled = true

}

Y al final del archivo agregá:

tasks.configureEach {

   if (name.contains("AndroidTest")) {

       enabled = false

   }

}

Esto deshabilita todas las tareas de androidTest

Luego darle a sync, build -> clean project, y luego make project o rebuild.

9 - Prueba desde Genexus

Camino:Android Library

↓

Publicarla como Maven (.aar + .pom + .module)

↓

Copiar al m2Repository de GeneXus

↓

Crear ImageCompressor.library

↓

Probar desde GeneXus Paso 1

C:\Users\glong\AndroidStudioProjects\ImageCompressorLib\app\build.gradle

agregá arriba de todo:

plugins {

   alias(libs.plugins.android.library)

   id 'maven-publish'

}

Paso 2

Al final del archivo agregá exactamente esto:

afterEvaluate {

   publishing {

       publications {

           release(MavenPublication) {

               groupId = "com.sigihignia.imagecompressor"

               artifactId = "ImageCompressor"

               version = "1.0.0"

               from components.release

           }

       }

       repositories {

           maven {

               url = uri(layout.buildDirectory.dir("repo"))

           }

       }

   }

}

Luego hacer sync

10 - crear .library

Crear una carpeta con esta estructura:

C:\Desarrollo\ImageCompressor\

│

├── ImageCompressor.library

└── Android\

    └── app-debug.aar

El archivo .aar se encuentra en el proyecto, ejemplo:C:\Users\glong\AndroidStudioProjects\ImageCompressorLib\app\build\outputs\aar

El archivo library lo crearemos con esa extension y este contenido xml:

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

11 - Group y Version

colocarlos en el build.gradle, deberia quedar de esta manera:plugins {

alias(libs.plugins.android.library)

}

group = "com.sigihignia.imagecompressor"

version = "1.0.0" 

12 - renombrar el módulo a ImageCompressor

Quedaría:

ImageCompressorLib

│

├── ImageCompressor

│   ├── build.gradle

│   └── src

│

└── settings.gradle

y en settings.gradle cambiar:

include ':app'

por

include ':ImageCompressor'

Con eso el .aar pasa a llamarse algo como:

ImageCompressor-release.aar

que ya coincide con el nombre de la librería. No olvidar el Sync

13 - Pegar .library

En la carpeta Libraries de genexus ej:

C:\Program Files (x86)\GeneXus\GeneXus17\Libraries\ImageCompressor

pegar nuestro archivo .library

14 - Publicar con Maven

1) Agregá estos plugins arriba de todo en app/build.gradle

plugins {

   alias(libs.plugins.android.library)

   id 'maven-publish'

}

2) Debajo del bloque android { ... } agregá

android {

   ...

   publishing {

       singleVariant("release")

   }

}

Ese bloque es el que le dice a Gradle que el componente release debe ser publicable.

3) Al final del archivo agregá

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

           maven {

               url = layout.buildDirectory.dir("repo")

           }

       }

   }

}

4) Hacé

Sync

Si sincroniza sin errores ya estamos.

5) Luego ejecutá

gradlew publishReleasePublicationToMavenRepository

6) El resultado debería aparecer en

app/build/repo/

y dentro vas a tener algo así:

com/

└── sigihignia/

     └── imagecompressor/

          └── ImageCompressor/

               ├── maven-metadata.xml

               └── 1.0.0/

                    ImageCompressor-1.0.0.aar

                    ImageCompressor-1.0.0.module

                    ImageCompressor-1.0.0.pom

Es exactamente la misma estructura que tiene el m2Repository de GeneXus.

Ahora Reiniciar/abrir genexus, y e tools > extensions managers deberia aparecer (pero no aparece)