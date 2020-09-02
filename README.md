# 🔗 The last link

Juego realizado para la [#js13k2020](https://js13kgames.com/), el tema para está edición fue [404](https://medium.com/js13kgames/js13kgames-2020-has-started-c7e003292613), 
el juego está basado en el popular juego denominado [damas](https://es.wikipedia.org/wiki/Damas) o [checkers](https://en.wikipedia.org/wiki/Draughts) en inglés.

En este juego se cuenta con dos jugadores, cada uno con 12 fichas, las fichas se moverán digonalmente hacia adelante, una vez se llegue al campo del contrario la ficha se convertirá en un rey,
permitiendo que se mueve en todas direcciones, igualmente de forma diagonal, cuando la ficha de un adversario se encuentra en una posición diagonal se podrá eliminar, siempre y cuando la posición siguiente se encuentra libre.

![image](https://github.com/Jorger/The-last-link/blob/master/images/principal.png?raw=true)

En esta versión de ese juego cada ficha está representada por un link, cada vez que se elimina un link se realiza un 404, es decir se ha eliminado la página y por consiguiente ya no está disponible 🤷‍♂️ es donde el tema aplica al juego 😅.

En está competencia existe la categoría de [server](https://github.com/js13kGames/js13kserver), en la cual se entrega un proyecto el cual ya tiene configurado lo necesario para establecer una conexión en tiempo real, en este caso haciedo uso de la popular librería conocida como [socket.io](https://socket.io/), 
la idea es que el juego comprimido en un acrhivo .zip no supere los 13KB, para este juego el archivo que contiene todo el juego y que pesa 13 KB, es el denominado [dist.zip](https://github.com/Jorger/The-last-link/blob/master/dist.zip), los archivos comprimidos está ubicados en la carpeta [public](https://github.com/Jorger/The-last-link/tree/master/public), 
de la misma forma los archivos no comprimidos del juego se encuetran en la carpeta [public_uncompressed](https://github.com/Jorger/The-last-link/tree/master/public_uncompressed)

## 🎮 Modalidades de Juego.

El juego cuenta con dos tipos de modalidades como son:

* **Offline:** Que a la vez se componente de:

  * 📴 Play offline
  * 🕹 Play vs Bot
  * 🤖 Bot vs Bot
  
* **Online:** De la misma forma se compone de:

  * 🌎 Play Online
  * 🤝 Play with a friend
  * 🎉 Party Mode

## 1️⃣ Offline.

En está modalidad toda la actividad del juego se lleva a cabo en el mismo dispotivo, gracias al uso de [service workers](https://developers.google.com/web/fundamentals/primers/service-workers), el juego puede funcionar offline, además de ser un [PWA](https://web.dev/progressive-web-apps/)

### 📴 Play offline

![offline](https://github.com/Jorger/The-last-link/blob/master/images/404_offline.gif?raw=true)

En esta modalidad la partida se llevará a cabo en el mismo dispositivo.

### 🕹 Play vs Bot

![bot](https://github.com/Jorger/The-last-link/blob/master/images/404_bot.gif?raw=true)

En esta modalides competiremos vs un bot, es una modalidad que también sirve como práctica.

### 🤖 Bot vs Bot

![botvbot](https://github.com/Jorger/The-last-link/blob/master/images/404_bot_vs_bot.gif?raw=true)

Está es una modalidad "especial", ya que sólo actuaremos como expectadores, fue útil en el momento de desarrollo, pero también es útil a manera de práctica, ya que se pueden ver movimientos que tal vez no salgan en las otras modalidades, además me pareció divertido dejarlo 😬

## 2️⃣ Online.

Está modalidad requiere conexión a internet, ya que se hará uso de [websockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API), se tienen las siguientes opciones:

### 🌎 Play Online

![online](https://github.com/Jorger/The-last-link/blob/master/images/404_online.gif?raw=true)

Esta modalidad nos permitirá inciar una partida con cualquier jugador que este conectado, se podría intepretar como una partida aleatoria, ya que se creará una sala con aquella persona que este disponible en ese momento, 
en esta partida además se encuenta con la opción de tener un "chat" a través de emojis, para así darle un toque social al juego, cada uno usuario tiene 10 segundos para realizar su movimiento, si no lo hace 
en este lapso de tiempo se hará un lanzamiento aleatorio.

### 🤝 Play with a friend

![friend](https://github.com/Jorger/The-last-link/blob/master/images/404_friend.gif?raw=true)

Es una extensión de la modalidad anterior, pero en este caso se creará una sala privada, es decir, sólo aquellos usuarios que tengan el código de la sala podrán jugar la partida, 
se aplican las mismas funcionalidades de la modalidad anterior, contando con el mismo tiempo de lanzamiento y la capacidad de interactuar por medio de emojis.

### 🎉 Party Mode

![party](https://github.com/Jorger/The-last-link/blob/master/images/404_party.gif?raw=true)

Es una modalidad especial en la cual se busca que los dispositivos móviles se conviertan en controles remotos, en este caso sólo existirá un sólo tablero, el cual recibirá los movimientos dados por los jugadores a través de los "controles".

En está modalidad no existe el tiempo, ni interacción a través de emojis, ya que es una mezcla entre el funcionamiento offline en el cual se tiene un sólo tablero y el funcionamiento online, ya que se reuqiere conexión de internet, se busca que los 
jugadores se encuentre en el mismo sitio físicamente, a diferencia de las dos modalidades anteriores.

## 🏃‍♂️ Ejecución.

Este proyecto es un fork del [proyecto original](https://github.com/js13kGames/js13kserver) creado para está categoría, en este caso se requiere de NodeJS.

### Instalación de dependencias.

```
npm i
```

### Ejecución del proyecto

```
npm run start:dev
```

En este caso se el proyecto correrá en http://localhost:3000/

**Nota:**

Se recomiendo renombrar la carpeta `public_uncompressed` a `public` y ésta última ponerle otro nombre, para así ver los archivos sin compresión.


## 📦 Compresión de archivos.

Se utilizarán los siguientes herramientas para comprimir los archivos:

* https://xem.github.io/terser-online/
* https://csscompressor.com/
* https://tinypng.com/
* https://javascript-minifier.com/

## 🔈 Sonidos.

Para los sonidos se uzó la librería [ZzFX](https://github.com/KilledByAPixel/ZzFX), la cual es una de las recomendadas entre los [recursos](https://js13kgames.github.io/resources/) de la competencia

## 📖 TO-DO

- [ ] Escribir artículo postmortem
- [ ] Compartir link de la entrada en la JS13k

# 👨🏻‍💻 Autor
* Jorge Rubaino 
[@ostjh](https://twitter.com/ostjh)



