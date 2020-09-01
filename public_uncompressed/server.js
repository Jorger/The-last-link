'use strict';
let availableUsers = [];
const rooms = [];

/**
 * Socket.IO on connect event
 * @param {Socket} socket
 */
module.exports = {
  io: (socket) => {
    /**
     * Evento para un nuevo usuario
     */
    socket.on('nU', (data, callback) => {
      const {
        type = 1,
        localRoom = '',
        table = false,
        user = '',
        createRoom = false,
      } = data;
      let room = '';
      const errors = {
        error: false,
        msg: '',
      };

      // Para saber si ha encontrado el oponente
      let indexPartner = -1;
      // Filtrar los usuarios disponibles que sean del mismo tipo de juego
      const filteredAvailableUsers = availableUsers.filter(
        (v) => v.type === type
      );

      // Buscará a un jugador entre los jugadores creados
      if (type >= 1 && type <= 3) {
        if (type === 1) {
          indexPartner =
            filteredAvailableUsers.length !== 0
              ? randomNumber(0, filteredAvailableUsers.length - 1)
              : -1;
        } else if (type === 2) {
          // Indica que jugará con un amigo
          indexPartner = filteredAvailableUsers.findIndex(
            (v) => v.room === localRoom
          );
        } else if (type === 3) {
          // Indica que es de tipo party mode
          // Es un cliente
          if (!table && !createRoom) {
            indexPartner = filteredAvailableUsers.findIndex(
              (v) => v.room === localRoom
            );
          }
        }
      } else {
        errors.error = true;
        errors.msg = 'Game type is invalid';
      }

      if (!errors.error) {
        if (indexPartner >= 0) {
          let startGame = false;
          let gameData = {};
          room = availableUsers[indexPartner].room;
          if (type !== 3) {
            startGame = true;
            // Guardar en la salas que se está jugando
            gameData = {
              p1: availableUsers[indexPartner].player,
              p2: {
                user,
                id: socket.id,
              },
            };
            socket.join(room);
          } else {
            // Es un juego de tipo party mode
            // Buscar si ya existe el tablero, si no es así, se debe emitir un error
            if (
              availableUsers[indexPartner] &&
              availableUsers[indexPartner].table
            ) {
              // Si existe el tablero
              // Si ya existe el jugador uno
              if (availableUsers[indexPartner].player) {
                // Ya existe el jugador uno
                gameData = {
                  table: availableUsers[indexPartner].table,
                  p1: availableUsers[indexPartner].player,
                  p2: {
                    user,
                    id: socket.id,
                  },
                };
                // Ahora si puede iniciar el juego
                startGame = true;
              } else {
                // Añadir al jugador uno...
                availableUsers[indexPartner].player = {
                  user,
                  id: socket.id,
                };
              }
              socket.join(room);
            } else {
              errors.error = true;
              errors.msg = 'There is no board';
            }
          }

          if (startGame) {
            const startColor = randomNumber(0, 1);
            gameData.room = room;
            gameData.type = type;
            gameData.p1 = { ...gameData.p1, color: startColor };
            gameData.p2 = { ...gameData.p2, color: +!startColor };
            gameData.turn = randomNumber(0, 1);
            rooms.push(gameData);
            availableUsers.splice(indexPartner, 1);
            io.sockets.in(room).emit('sG', gameData);
          }
        } else {
          let setRoom = true;

          if ((type === 2 || type === 3) && !createRoom) {
            setRoom = false;
            errors.error = true;
            errors.msg = 'The room does not exist';
          }

          if (setRoom) {
            room = type === 1 ? guid() : localRoom;
            availableUsers.push({
              room,
              type,
              [type !== 3 ? 'player' : 'table']: {
                user,
                id: socket.id,
              },
            });
            socket.join(room);
          }
        }
      }

      if (errors.error) {
        return callback(errors.msg);
      }

      callback();
    });

    /**
     * Recibe las acciones del socket
     */
    socket.on('mV', (data) => {
      // rV -> Recibe movimiento
      // aC -> Entrega los movimiento a los clientes
      // sT -> Se seleccionó un token
      // gT -> El juego ha terminado
      // rE -> Recibe un emoji

      // Indica que el juego terminó
      if (data.type === 4) {
        const indexRoom = rooms.findIndex((v) => v.room === data.room);
        if (indexRoom >= 0) {
          // Se elimina la sala así se evita que cuando se desconecten los usuarios
          // se emita el mensaje de desconexión
          rooms.splice(indexRoom, 1);
        }
      }

      io.sockets
        .in(data.room)
        .emit(['rV', 'aC', 'sT', 'gT', 'rE'][data.type - 1], data);
    });

    /**
     * Evento para indicar que un jugador se ha desconectado
     */
    socket.on('disconnect', () => {
      // Buscar la sala a la cual pertenece este socket
      // Se debería validar después si es un boarda/table para el party mode
      const indexRoom = rooms.findIndex(
        ({ p1 = { id: '' }, p2 = { id: '' }, table = { id: '' } }) =>
          p1.id === socket.id || p2.id === socket.id || table.id === socket.id
      );

      if (indexRoom >= 0) {
        io.sockets.in(rooms[indexRoom].room).emit('gD', {
          roomData: rooms[indexRoom],
          userDisconnected: socket.id,
          type: 1,
        });
        // Se elimina la sala
        rooms.splice(indexRoom, 1);
      } else {
        // Buscar en el listado de usuarios pendientes a jugar
        // Tener en cuenta el board/table en modo party
        const indexPlayer = availableUsers.findIndex(
          ({ player = { id: '' }, table = { id: '' } }) =>
            player.id === socket.id || table.id === socket.id
        );

        if (indexPlayer >= 0) {
          // Era de tipo party mode
          if (availableUsers[indexPlayer].type === 3) {
            // Si el que se va es es el tablero, se deberá eliminar la sala
            // Y notificarle al cliente que este conectado
            // Se fue el board se debe notificar al cliente
            if (availableUsers[indexPlayer].table.id === socket.id) {
              // Si ya exisatía un player, se le notifica
              if (availableUsers[indexPlayer].player) {
                io.sockets.in(availableUsers[indexPlayer].room).emit('dT');
              }

              // Se elimina del listado de usuarios disponbles
              availableUsers.splice(indexPlayer, 1);
            } else {
              // No se fue la sala si no el cliente, entonces se debe sacar del listado
              delete availableUsers[indexPlayer].player;
            }
          } else {
            availableUsers.splice(indexPlayer, 1);
          }
        }
      }
    });
  },
};
