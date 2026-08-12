1er paso: 

Create a "Key Store file" for signature the application's packets with the following command. It is distributed with the JDK on the /bin directory.

> keytool -genkey -v -keystore ruta al app.keystore -alias appnombre -keyalg RSA -keysize 2048 -validity 10000

keytool -genkey -v -keystore “C:\Users\aalmiron\Pictures\blh\blh.keystore” -alias blh -keyalg RSA -keysize 2048 -validity 10000