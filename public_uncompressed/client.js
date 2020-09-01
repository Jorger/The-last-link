'use strict';

(() => {
  // Utilidades
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);

  /**
   * Para establecer el tema en el browser, en este caso mobile
   * @param {*} color
   */
  const setThemeColor = (color = '#000') => {
    const metaThemeColor = $('meta[name=theme-color]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    }
  };

  /**
   * Para edicioar eventos
   * @param {*} target
   * @param {*} type
   * @param {*} callback
   * @param {*} parameter
   */
  const $on = (target, type, callback, parameter = {}) => {
    if (target) {
      target.addEventListener(type, callback, parameter);
    }
  };

  /**
   * Agregar estilos inline a un elemento
   * @param {*} target
   * @param {*} styles
   */
  const addStyle = (target, styles) => {
    if (target) {
      for (let style in styles) {
        target.style[style] = styles[style];
      }
    }
  };

  /**
   * Para eliminar un elemento en el dom
   * @param {*} target
   */
  const removeElement = (target) => {
    if (target) {
      target.parentNode.removeChild(target);
    }
  };

  /**
   * Inyectar html en el dom
   * @param {*} elemet
   * @param {*} html
   */
  const setHtml = (elemet, html) => {
    elemet.innerHTML = html;
  };

  /**
   * Para verificar si un elemento ya tiene una clase asociada
   * @param {*} target
   * @param {*} className
   */
  const hasClass = (target, className) => target.classList.contains(className);

  const addClass = (target, className) => {
    if (target) {
      className.split(' ').forEach((classText) => {
        target.classList.add(classText);
      });
    }
  };

  /**
   * Para eliminar una clase
   * @param {*} target
   * @param {*} className
   */
  const removeClass = (target, className) => {
    if (target) {
      className.split(' ').forEach((classText) => {
        target.classList.remove(classText);
      });
    }
  };

  /**
   * Determina si el dispotivo es mobile
   */
  const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  /**
   * Para establecer un tiempo para hacer una acción en una función
   * útil para el evento de resize
   * @param {*} fn
   * @param {*} delay
   */
  const debounce = (fn, delay) => {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, delay);
    };
  };

  /**
   * Para establecer una interrupción
   * @param {*} fn
   * @param {*} max
   * @param {*} delay
   */
  const setInterrupt = (fn, max, delay) => {
    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      if (counter > max) {
        clearInterval(interval);
      }
      fn(counter);
    }, delay);

    return interval;
  };

  /**
   * Retonará las dimnesiones de la pantalla
   */
  const getDimensionsScreen = () => ({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  // Fin de las utilidades

  // Constantes del juego
  const DIMENSIONS = [412, 732]; // width, height
  const EMOJIS = [
    '😃',
    '🤔',
    '😴',
    '😱',
    '😭',
    '😡',
    '💀',
    '🔥',
    '🎊',
    '💪',
    '👏',
    '👍',
  ];
  const COLORS = { blue: '#28c', red: '#a55' };
  const user = guid(); // Para identificar al usuario
  const supportedShare = 'share' in navigator;
  let modeType = 0; // El tipo de modo de juego que se ha seleccionado
  let socket;
  let connectedSocket = false; //Para indicar si se ha conectado el socket...
  let GAME_ROOM = '';
  let soundsActivated = true;

  const playSounds = (type) => {
    const sounds = {
      click: [, , 1675, , 0.06, 0.24, 1, 1.82, , , 837, 0.06],
      interval: [
        ,
        ,
        1090,
        ,
        0.01,
        0.13,
        ,
        1.4,
        ,
        ,
        513,
        0.08,
        ,
        ,
        ,
        ,
        ,
        0.65,
        0.05,
      ],
      endGame: [
        ,
        ,
        20,
        0.04,
        ,
        0.6,
        ,
        1.31,
        ,
        ,
        -990,
        0.06,
        0.17,
        ,
        ,
        0.04,
        0.07,
      ],
      tokenMove: [, , 150, 0.05, , 0.05, , 1.3, , , , , , 3],
      removeToken: [, , 925, 0.04, 0.3, 0.6, 1, 0.3, , 6.27, -184, 0.09, 0.17],
      emoji: [
        ,
        0.5,
        847,
        0.02,
        0.3,
        0.9,
        1,
        1.67,
        ,
        ,
        -294,
        0.04,
        0.13,
        ,
        ,
        ,
        0.1,
      ],
      king: [
        ,
        ,
        80,
        0.3,
        0.4,
        0.7,
        2,
        0.1,
        -0.73,
        3.42,
        -430,
        0.09,
        0.17,
        ,
        ,
        ,
        0.19,
      ],
    };

    if (soundsActivated) {
      zzfx(...sounds[type]);
    }
  };

  /**
   * Generar colores de lo tokens para el modo party
   * @param {*} color
   * @param {*} index
   */
  const getColorTokens = (color, index) => {
    return `rgb(${{
      red: [150 + index * 10, 85, 85],
      blue: [34, 136, 180 + index * 10],
    }[color].join(' ')})`;
  };

  /**
   * Rederizará el lobby dle juego
   */
  const lobby = () => {
    /**
     * Resetea las opciones del modal
     */
    const hideMessagesModal = () => {
      [...$$('.se')].forEach((v) => removeClass(v, 'so'));
      setHtml($('#se-1'), '');
      $('.frm input').value = '';
    };

    /**
     * Configura la sala localmente
     * @param {*} room
     * @param {*} table
     */
    const configureRoom = (room = '', table = false, createRoom = false) => {
      configureSocket({
        type: modeType === 4 ? 2 : 3,
        localRoom: String(room),
        table,
        createRoom,
      });
      hideMessagesModal();
      addClass($('#se-1'), 'so');
      setHtml(
        $('#se-1'),
        `<h1>CODE: ${room}</h1><p>🔍 Waiting for friend to connect 🔎</p>`
      );

      // Para indicar que se desconectó un tablero, sin haber iniciado una partida
      if (socket && !table && modeType === 5) {
        socket.on('dT', () => {
          alert(
            'The board has been disconnected so the game cannot be started :('
          );
          addClass($('.bc'), 'hi');
          disconnectSocket();
        });
      }
    };

    const renderModalOptions = () => `<div class='bc wh ce hi'>
    <div class='mo ce'>
      <button class='btn blue clm'>X</button>
      <h2></h2>
      <div class='se ce so' id=se-1></div>
      <div class='se ce' id=se-2>
        <button class='btn blue cta'></button>
        <form class='ce frm'>
          <input type='number' placeholder='Table code'/>
          <button type='submit' class='btn red'>Join</button>
        </form>
      </div>
      </div></div>`;

    const renderButtons = () =>
      [
        '<span>📴</span> PLAY OFFLINE',
        '<span>🕹</span> VS BOT',
        '<span>🤖</span> BOT VS BOT',
        '<span>🌎</span> PLAY ONLINE',
        '<span>🤝</span> PLAY WITH A FRIEND',
        '<span>🎉</span> PARTY MODE',
      ]
        .map(
          (v, i) =>
            `<button class='btn ${i < 3 ? 'red' : 'blue'} ce'>${v}</button>`
        )
        .join('');

    setHtml(
      $('.s'),
      `<div class='lo wh ce'>
        ${renderModalOptions()}
        <div class='ti ce'><span>🔗</span>The last link
        <div class='ti-bt ce'>
          ${supportedShare ? '<button id=shr title=Share>📮</button>' : ''}
          <button id=sou title=Sounds>${soundsActivated ? '🔊' : '🔇'}</button>
        </div></div>
        <div class='cb ce'>
          ${renderButtons()}
        </div>
        <h3>Developed by: <a href='https://twitter.com/ostjh' target='_blank' rel='noopener noreferrer'>Jorge Rubiano</h3>
      </div>`
    );

    [...$$('.lo .cb button')].forEach((elemet, index) =>
      $on(elemet, 'click', () => {
        playSounds('click');
        modeType = index;
        if (index <= 2) {
          createBoard(index);
        } else {
          if (navigator.onLine) {
            hideMessagesModal();
            removeClass($('.bc'), 'hi');
            addClass($(`#se-${index === 3 ? 1 : 2}`), 'so');

            $('.mo h2').textContent = [
              'Play online!',
              'Play with a friend!',
              'Party mode!',
            ][modeType - 3];

            if (index === 3) {
              // Se debe conectar al socket
              configureSocket({ type: 1 });
              setHtml(
                $('#se-1'),
                `<p>🔍 Looking for an opponent 🔎</p><p>This may take a few seconds, if you can't find an opponent you can create a room and play with a friend</p>`
              );
            } else {
              $('.cta').textContent =
                index === 4 ? 'CREATE ROOM' : 'CREATE TABLE';
            }
          } else {
            alert(
              'Sorry, you must have an internet connection for this option'
            );
          }
        }
      })
    );

    if (supportedShare) {
      $on($('#shr'), 'click', (e) => {
        e.preventDefault();
        playSounds('click');
        navigator
          .share({
            title: 'The last link',
            text:
              'Play The last link #js13k 2020 edition by Jorge Rubiano @ostjh',
            url: location.href,
          })
          .then(() => {
            alert('Thanks for sharing');
          })
          .catch((err) => {
            alert(err);
          });
      });
    }

    $on($('#sou'), 'click', () => {
      soundsActivated = !soundsActivated;
      $('#sou').textContent = soundsActivated ? '🔊' : '🔇';
      playSounds('click');
    });

    /** Para cerrar el modal */
    $on($('.clm'), 'click', () => {
      playSounds('click');
      addClass($('.bc'), 'hi');
      disconnectSocket();
    });

    $on($('.frm'), 'submit', (e) => {
      playSounds('click');
      e.preventDefault();
      const room = $('.frm input').value;
      if (!isNaN(room) && room.length === 5) {
        configureRoom(room);
      } else {
        alert('The code is not valid');
        $('.frm input').focus();
      }
    });

    $on($('.cta'), 'click', () => {
      playSounds('click');
      configureRoom(randomNumber(10000, 99999), modeType === 5, true);
    });

    setThemeColor();
  };

  /**
   * Crearrá un elemento para mostrar el mensaje de 404 cuando se elimina un token
   * @param {*} left
   * @param {*} top
   * @param {*} element
   */
  const render404 = (left, top, element = 'b') => {
    const id = guid();
    const div = document.createElement('div');
    div.className = 'fof ce';
    div.id = `f-${id}`;
    div.style.left = left;
    div.style.top = top;
    div.innerHTML = '404'
      .split('')
      .map((v) => `<span>${v}</span>`)
      .join('');

    if (element) {
      $(`.${element}`).appendChild(div);
      setTimeout(() => {
        if ($(`#f-${id}`)) {
          removeElement($(`#f-${id}`));
        }
      }, 4000);
    }
  };

  /**
   * Para renderizar el "control remoto"
   * @param {*} color
   */
  const renderControl = (indexColor, initialTurn) => {
    const color = Object.keys(COLORS)[indexColor];
    let emitSocket = false;
    let removeToken = false;
    // Me indica si es el usario es el que se encuentra inicialmente en la parte de abajo del escensario
    // Con esto se sabe que se deben oponer los valoes y/o girar los elementos
    const isBelow = indexColor === initialTurn;
    let availableMovements = [];

    const getRowCol = (index) => ({
      row: index < 4 ? index : index < 8 ? index - 4 : index - 8,
      col: index < 4 ? 0 : index < 8 ? 1 : 2,
    });

    /**
     * Establece el estado inicial de los tokens
     */
    const resetTokens = () => {
      [...$$('.t-e')].forEach((e) => {
        e.disabled = true;
        addClass(e, 'di');
        removeClass(e, 'r bl');
      });
    };

    /**
     * Oculta los botones de selección de movimiento
     */
    const removeTargetPoint = () => {
      [...$$('.t-p')].forEach((e) => {
        removeClass(e, 'v');
      });
    };

    /**
     * Renderiza los botones de selección de movimiento
     */
    const renderTargetPoints = () =>
      [...new Array(4)]
        .map((_, index) => `<button class=t-p id=tg-${index}></button>`)
        .join('');

    /**
     * Renderizará los tokens del "control remoto"
     */
    const renderTokens = () =>
      [...new Array(12)]
        .map(
          (_, i) =>
            `<button color=${color} disabled class='${`t-e cc-${i} ${color} di`}'id=o-${i}></button>`
        )
        .join('');

    setHtml(
      $('.s'),
      `<div class='bw wh ce ${color}'>
        <button class=cl>EXIT</button>
        <div class='bc wh ce'><span></span><button class=cl>EXIT</button></div>
        <div class='tu bo ce ${color}'>Your turn</div>
        <div class='co ce'>
          <div class='tp ce ${
            isBelow ? 'tpr' : ''
          }'>${renderTargetPoints()}</div>
          ${renderTokens()}
        </div>
      </div>`
    );

    /**
     * Para establecer los eventos para los tokes y los botones de selección de movimiento
     */
    ['t-p', 't-e'].forEach((event) => {
      [...$$(`.${event}`)].forEach((elemet) => {
        $on(elemet, 'click', (e) => {
          // Quito la visibilidad de los target points seleccioandos
          const idElement = e.target.id.split('-');
          if (!emitSocket) {
            playSounds('click');
            if (idElement[0] === 'o') {
              removeTargetPoint();
              const index = +idElement[1];
              const { row, col } = getRowCol(index);

              let availableMoves = !removeToken
                ? availableMovements.filter((v) => v.counter === index)[0]
                : availableMovements.filter((v) => v[0].counter === index)[0];

              if (removeToken) {
                availableMoves = {
                  ...availableMoves[0],
                  availableMoves: availableMoves[1],
                };
              }

              if (availableMoves) {
                addClass($('.tp'), 'sht');
                addStyle($('.tp'), {
                  left: `${100 * row + row * 3}px`,
                  top: `${100 * col + col * 8}px`,
                });

                emitSocket = true;
                socket.emit('mV', {
                  type: 3,
                  user,
                  color,
                  removeToken,
                  id: availableMoves.id,
                  room: GAME_ROOM,
                  data: availableMoves,
                });
              }
            } else {
              const [
                destinationColumn,
                destinationRow,
                index,
                indexOpponent,
              ] = e.target.getAttribute('p').split('-');

              emitSocket = true;
              socket.emit('mV', {
                type: 1,
                user,
                color,
                room: GAME_ROOM,
                movement: [
                  +destinationColumn,
                  +destinationRow,
                  +index,
                  indexOpponent === '' ? -1 : +indexOpponent,
                ],
              });

              resetTokens();
              removeClass($('.tp'), 'sht');
            }
          }
        });
      });
    });

    const intervalStart = setInterrupt(
      (counter) => {
        playSounds('interval');
        const counterValue = 3 - counter - 2 + 3;
        $('.bc span').textContent = counterValue;
        if (!counterValue) {
          addClass($('.bc'), 'hi');
        }
      },
      3,
      500
    );

    $on($('.cl'), 'click', () => {
      playSounds('click');
      if (intervalStart) {
        clearInterval(intervalStart);
      }

      if (socket) {
        disconnectSocket();
      }

      lobby();
    });

    setThemeColor(COLORS[color]);

    if (socket) {
      socket.on('aC', (data) => {
        emitSocket = false;
        resetTokens();
        removeClass($('.tp'), 'sht');
        removeClass($(`.tu.${color}`), 'sh');
        availableMovements = data.data;
        removeToken = data.removeToken || false;
        if (data.color === color) {
          addClass($(`.tu.${color}`), 'sh');
          // Itera los elementos
          if (!removeToken) {
            // Habilitar los tokens de forma normal
            availableMovements.forEach((v) => {
              $(`#o-${v.counter}`).disabled = false;
              removeClass($(`#o-${v.counter}`), 'di');

              // Para agregar la clase que indica que es un rey
              if (v.isKing && !hasClass($(`#o-${v.counter}`), 'c')) {
                addClass($(`#o-${v.counter}`), 'c');
                playSounds('king');
              }
            });
          } else {
            // Se habilitan los tokens que pueden eliminar
            availableMovements.forEach((v) => {
              $(`#o-${v[0].counter}`).disabled = false;
              removeClass($(`#o-${v[0].counter}`), 'di');
              addClass($(`#o-${v[0].counter}`), 'r');
            });
          }
        } else if (removeToken) {
          // Se le adiciona la clase de link roto a los tokens que se pueden eliminar
          availableMovements.forEach((v) => {
            v[1].forEach((item) => {
              addClass($(`#o-${item.counter}`), 'bl');
              removeClass($(`#o-${item.counter}`), 'di');
            });
          });
        }

        if (data && data.tokenRemove && Object.keys(data.tokenRemove)) {
          if (
            data.tokenRemove.c === color &&
            $(`#o-${data.tokenRemove.counter}`)
          ) {
            // Se encuentra el token que se debe ir
            playSounds('removeToken');
            addClass($(`#o-${data.tokenRemove.counter}`), 're');
            const { row, col } = getRowCol(data.tokenRemove.counter);
            render404(
              `${100 * row + row * 3}px`,
              `${100 * col + col * 8}px`,
              'co'
            );
            if ('vibrate' in navigator) {
              navigator.vibrate(500);
            }
          }
        }
      });

      // Evento que indica que se ha seleccioando un token
      socket.on('sT', (data) => {
        emitSocket = false;
        if (data.color === color) {
          data.data.availableMoves.forEach(({ target, col, row, id = '' }) => {
            $(`#tg-${target}`).setAttribute(
              'p',
              `${col}-${row}-${data.data.id}-${id}`
            );
            // Se agrega la clase de visibilidad
            addClass($(`#tg-${target}`), 'v');
          });
        }
      });

      /**
       * Para indicar el ganador
       */
      socket.on('gT', (data) => {
        if (data.scoreText !== '') {
          addClass($('.bc'), data.scoreText);
        }

        removeClass($('.bc'), 'hi');
        $('.bc span').textContent = !data.scoreText
          ? 'Tied game'
          : `${data.scoreText} win`;

        playSounds('endGame');
        setThemeColor(data.scoreText !== '' ? COLORS[data.scoreText] : '#000');
      });

      socket.on('gD', (data) => {
        // Buscar si el que se desconectó es el tablero
        const boardID =
          (data &&
            data.roomData &&
            data.roomData.table &&
            data.roomData.table.id) ||
          '';

        if (data.userDisconnected === boardID) {
          alert('Sorry the board has been disconnected :(');
          disconnectSocket();
          lobby();
        }
      });
    }
  };

  /**
   * Función que creará todo el board, además de manejar la lógica de la misma
   * Para el modo online, los tokens contrarios se haría (23 - 13), en este case 13 es el indice
   */
  const createBoard = (
    type = 0,
    online = {
      baseColor: 0,
      initialTurn: 0,
      isPartyMode: false,
    }
  ) => {
    const isOnlineGame = type > 2;
    const TOTAL_TILES = 8;
    const DIMENSIONS_TILES = Math.round(DIMENSIONS[0] / TOTAL_TILES - 3);
    const COLORS_TOKENS = Object.keys(COLORS);

    // Vatiable que indica que se ha enviado un movimiento por el socket
    let sendFromSocket = false;
    // En partidas offline, se indicará el color base con el cual se contruirá el escenario
    // En partidas online, este color deberá llegar del server
    const RANDOM_START_COLOR = !isOnlineGame
      ? randomNumber(0, 1)
      : +!online.baseColor;

    // Es el de arriba
    const INITIAL_COLOR = COLORS_TOKENS[RANDOM_START_COLOR]; // Arriba
    const OPPOSITE_COLOR = COLORS_TOKENS[+!RANDOM_START_COLOR]; // Abajo

    const PLAYERS = {
      [INITIAL_COLOR]: {
        score: 12,
        human: true,
        local: !isOnlineGame,
        counter: 11,
      },
      [OPPOSITE_COLOR]: {
        score: 12,
        human: true,
        local: true,
        counter: 0,
      },
    };

    if (type === 2) {
      PLAYERS[OPPOSITE_COLOR].human = false;
    }

    if (type === 1 || type === 2) {
      PLAYERS[INITIAL_COLOR].human = false;
    }

    // Guadra los posibles token que puede capturar un jugador
    let possibleCaptureOpponent = [];
    // Me indica si se está moviendo un token, relacioando a la animación
    let tokenMove = false;
    // Indica aleatoriamente que jugador iniciará
    // 0 para blue, 1 para rojo
    let turn = !isOnlineGame ? randomNumber(0, 1) : online.initialTurn;
    // Contador para indentificar a los tokens en el escenario
    let cont = 0;
    // Para el intervalo de contador en las partidas online
    let intervalCounter;

    // Para el intervalo de inicio del juego
    const intervalStart = setInterrupt(
      (counter) => {
        const counterValue = 3 - counter - 2 + 3;
        playSounds('interval');
        $('.bc span').textContent = counterValue;
        if (!counterValue) {
          addClass($('.bc'), 'hi');
          enableDisableTokens(
            getTokensCanMoved(COLORS_TOKENS[turn]).map((v) => v.id)
          );

          showTurnMessage();

          if (!PLAYERS[COLORS_TOKENS[turn]].human) {
            makeBotMove();
          }
        }
      },
      3,
      500
    );

    // Cagar los tiles
    const tiles = [...new Array(TOTAL_TILES)].map((_, col) =>
      [...new Array(TOTAL_TILES)].map((_, row) =>
        col < 3 || col > 4
          ? !(col % 2)
            ? row % 2
              ? {
                  c: col < 3 ? INITIAL_COLOR : OPPOSITE_COLOR,
                  id: cont++,
                  d: col < 3 ? 1 : -1,
                  col,
                  row,
                  counter:
                    col < 3
                      ? PLAYERS[INITIAL_COLOR].counter--
                      : PLAYERS[OPPOSITE_COLOR].counter++,
                  arrival: col < 3 ? TOTAL_TILES - 1 : 0,
                }
              : {}
            : !(row % 2)
            ? {
                c: col < 3 ? INITIAL_COLOR : OPPOSITE_COLOR,
                id: cont++,
                d: col < 3 ? 1 : -1,
                col,
                row,
                counter:
                  col < 3
                    ? PLAYERS[INITIAL_COLOR].counter--
                    : PLAYERS[OPPOSITE_COLOR].counter++,
                arrival: col < 3 ? TOTAL_TILES - 1 : 0,
              }
            : {}
          : {}
      )
    );

    /**
     * Función que determinará el ganador
     */
    const determineWinner = () => {
      const scoreKeys = Object.keys(PLAYERS);
      const scoreText =
        PLAYERS[scoreKeys[0]].score === PLAYERS[scoreKeys[1]].score
          ? ''
          : PLAYERS[scoreKeys[0]].score > PLAYERS[scoreKeys[1]].score
          ? scoreKeys[0]
          : scoreKeys[1];

      if (scoreText !== '') {
        addClass($('.bc'), scoreText);
      }

      playSounds('endGame');

      removeClass($('.bc'), 'hi');
      $('.bc span').textContent = !scoreText ? 'Tied game' : `${scoreText} win`;

      if (online.isPartyMode) {
        socket.emit('mV', {
          type: 4,
          room: GAME_ROOM,
          scoreText,
        });
      }
    };

    /**
     * Función que se ejecuta cunado se ha seleccionado un token
     * @param {*} tokenIndex
     */
    const selectToken = (tokenIndex) => {
      // Se obtiene la data del token seleccionado
      const token = getValueFromIndex(tokenIndex);
      // Se valida que el token seleccionado sea del mismo color que tiene el turno
      if (token.c === COLORS_TOKENS[turn]) {
        /**
         * Si el token seleccionado ya tiene la clase 'r' que corresponde al event de girar
         * Se filtrará de los posibles elementos a capturar que previamente se habían cálculado
         * Si en caso contrario no tiene la clase, se buscará las posibles posiciones a donde puede llegar el token
         */
        const availableMoves = !hasClass($(`#o-${token.id}`), 'r')
          ? getAvailableMoves(token)
          : possibleCaptureOpponent.filter((v) => v[0].id === tokenIndex)[0][1];

        if (availableMoves.length) {
          // Posicionar los elementos de llegada
          availableMoves.forEach(({ col, row, id = '' }, index) => {
            const target = $(`#tg-${index}`);
            /**
             * Se agregan atributos personalizados al punto de llegado como son:
             * columna y fila de llegada
             * El token a mover
             * Y el id del oponente que se ha eliminado, si es que existe
             */
            target.setAttribute('p', `${col}-${row}-${token.id}-${id}`);
            // Se agrega la clase de visibilidad
            addClass(target, 'v');
            // Se establece la posición del punto de llegada
            addStyle(target, {
              left: `${row * DIMENSIONS_TILES}px`,
              top: `${col * DIMENSIONS_TILES}px`,
            });
          });
        }
      }
    };

    /**
     * Función qeu establece la posición a donde llegará un token
     * Además recibe el valor del indice del token que elimianrá del oponente
     * @param {*} destinationColumn
     * @param {*} destinationRow
     * @param {*} index
     * @param {*} indexOpponent
     */
    const setTokenMovement = (
      destinationColumn,
      destinationRow,
      index,
      indexOpponent = -1
    ) => {
      // Se ontiene el token que se moverá
      const token = getValueFromIndex(index);
      const { hasListener = false } = tiles[token.col][token.row];
      resetTargetPoints();
      removeClass($(`#o-${index}`), 'sel');

      // Sonido que ha movido el token
      playSounds('tokenMove');

      /**
       * Si llega un valor relacionado al index de un oponente,
       * Se buscará ese token y se eliminará
       */

      let tokenRemove = {};
      if (indexOpponent >= 0) {
        tokenRemove = getValueFromIndex(indexOpponent);
        tiles[tokenRemove.col][tokenRemove.row] = {};
        addClass($(`#o-${indexOpponent}`), 're');
        render404(
          `${tokenRemove.row * DIMENSIONS_TILES}px`,
          `${tokenRemove.col * DIMENSIONS_TILES}px`
        );

        if (
          (!online.isPartyMode &&
            tokenRemove.c === OPPOSITE_COLOR &&
            type !== 2) ||
          type === 0
        ) {
          if ('vibrate' in navigator) {
            navigator.vibrate(500);
          }
        }

        // Sonido que se ha eliminado un token
        playSounds('removeToken');
      }

      // Se guarda en la nueva posición, los valores del token
      // Además se guarda/sobreescriben otras propiedades
      tiles[destinationColumn][destinationRow] = {
        ...tiles[token.col][token.row],
        row: destinationRow,
        col: destinationColumn,
        hasListener,
        counterTransition: 0,
        removedToken: indexOpponent >= 0,
        tokenRemove,
      };

      // Se limpia el valor que estaba en la posición que dejado el vector
      tiles[token.col][token.row] = {};
      // Valor que indica que se está haciendo un movimiento
      tokenMove = true;
      /**
       * Establece la nueva posición donde se moverá el token
       */
      addStyle($(`#o-${index}`), {
        left: `${destinationRow * DIMENSIONS_TILES}px`,
        top: `${destinationColumn * DIMENSIONS_TILES}px`,
      });

      if (!hasListener) {
        // Evento que escucha cuando la animación de un token ha finalizado
        $on($(`#o-${index}`), 'transitionend', (evt) => {
          const { propertyName } = evt;
          if (propertyName === 'transform') {
            removeElement($(`#${evt.target.id}`));
          } else if (propertyName === 'left' || propertyName === 'top') {
            // Se obtiene el valor del token
            const token = getValueFromIndex(+evt.target.id.split('-')[1]);
            if (++tiles[token.col][token.row].counterTransition === 2) {
              // Se valida si el token a llegado al terroririo del oponente
              if (
                token.arrival === token.col &&
                !hasClass($(`#${evt.target.id}`), 'c')
              ) {
                tiles[token.col][token.row].isKing = true;
                addClass($(`#${evt.target.id}`), 'c');
                playSounds('king');
              }
              // Indica que ya se puede realizar nuevos movimientos
              tokenMove = false;

              if (tiles[token.col][token.row].removedToken) {
                PLAYERS[COLORS_TOKENS[+!turn]].score--;

                $(`.sc-${COLORS_TOKENS[+!turn]}`).textContent =
                  (PLAYERS[COLORS_TOKENS[+!turn]].score <= 9 ? '0' : '') +
                  PLAYERS[COLORS_TOKENS[+!turn]].score;
              }

              // Si ha eliminado un token, validar si puede matar a otro
              // Se busca si tiene posible elementos para elininar
              const removedToken = tiles[token.col][token.row].removedToken
                ? canCaptureOpponent().length !== 0
                : false;

              if (!removedToken) {
                turn = +!turn;
              }

              // Función que traerá los posibles tokens a eliminar
              possibleCaptureOpponent = canCaptureOpponent();

              // No se detecta que el usuario pueda capturar a un token
              // Por lo tanto se busca si tiene movimientos disponibles
              const availableMovements = !possibleCaptureOpponent.length
                ? getTokensCanMoved(COLORS_TOKENS[turn])
                : possibleCaptureOpponent;

              // Para bloquear y habilitar los tokens, se envía un array de excepciones
              // Si es que existen posibles elementos para eliminar
              enableDisableTokens(
                availableMovements.map((v) =>
                  possibleCaptureOpponent.length ? v[0].id : v.id
                )
              );

              /**
               * Se establecerá la clase de girar 'r' al token para indicar que podrá eliminar a otro
               */
              possibleCaptureOpponent.forEach((v) => {
                addClass($(`#o-${v[0].id}`), 'r');
                // Se le adiciona la clase de link roto a los tokens que se pueden eliminar
                v[1].forEach((item) => {
                  addClass($(`#o-${item.id}`), 'bl');
                });
              });

              /**
               * Si el jugador no tiene movimientos disponibles y además no tiene movimientos para capturar
               * Se determina que está bloqueado y perderá
               */
              showTurnMessage(
                availableMovements.length || possibleCaptureOpponent.length
              );

              if (
                !availableMovements.length &&
                !possibleCaptureOpponent.length
              ) {
                determineWinner();
              } else {
                if (!PLAYERS[COLORS_TOKENS[turn]].human) {
                  makeBotMove();
                }

                if (online.isPartyMode) {
                  socket.emit('mV', {
                    type: 2,
                    user,
                    room: GAME_ROOM,
                    color: COLORS_TOKENS[turn],
                    tokenRemove: tiles[token.col][token.row].tokenRemove,
                    removeToken: !!possibleCaptureOpponent.length,
                    data: !possibleCaptureOpponent.length
                      ? availableMovements.map((v) => ({
                          ...v,
                          availableMoves: getAvailableMoves(v),
                        }))
                      : possibleCaptureOpponent,
                  });

                  // Girar el board
                  INITIAL_COLOR === COLORS_TOKENS[turn]
                    ? addClass($('.b'), 'ro')
                    : removeClass($('.b'), 'ro');
                }
              }
            }
          }
        });
      }
    };

    /**
     * Realizar el movimiento dle bot
     */
    const makeBotMove = debounce(
      () => {
        let tokenMove = 0;
        let tokenDestinity = {};
        if (!possibleCaptureOpponent.length) {
          const tokensCanMoved = getTokensCanMoved(COLORS_TOKENS[turn]);
          tokenMove =
            tokensCanMoved[randomNumber(0, tokensCanMoved.length - 1)];
          const possibleDestinations = getAvailableMoves(tokenMove);
          tokenDestinity =
            possibleDestinations[
              randomNumber(0, possibleDestinations.length - 1)
            ];
        } else {
          const indexAtack = randomNumber(
            0,
            possibleCaptureOpponent.length - 1
          );
          tokenMove = possibleCaptureOpponent[indexAtack][0];
          const possibleDestinations = possibleCaptureOpponent[indexAtack][1];
          tokenDestinity =
            possibleDestinations[
              randomNumber(0, possibleDestinations.length - 1)
            ];
        }
        const newIndexOpponent =
          tokenDestinity.id === null || tokenDestinity.id === undefined
            ? -1
            : tokenDestinity.id;

        if (!isOnlineGame) {
          setTokenMovement(
            tokenDestinity.col,
            tokenDestinity.row,
            tokenMove.id,
            newIndexOpponent
          );
        } else {
          sendFromSocket = true;
          socket.emit('mV', {
            type: 1,
            user,
            room: GAME_ROOM,
            movement: [
              tokenDestinity.col,
              tokenDestinity.row,
              tokenMove.id,
              newIndexOpponent,
            ],
          });
        }
      },
      !isOnlineGame ? 500 : 0
    );

    /**
     * Para indicar cual jugador tiene un turno
     * @param {*} msg
     */
    const showTurnMessage = (show = true) => {
      // Quita la clase del turno anterior
      removeClass($('.bw'), COLORS_TOKENS[+!turn]);
      removeClass($(`.tu.${COLORS_TOKENS[+!turn]}`), 'sh');
      // Adciona las clases
      if (show) {
        addClass($('.bw'), COLORS_TOKENS[turn]);

        if (!online.isPartyMode) {
          addClass($(`.tu.${COLORS_TOKENS[turn]}`), 'sh');
          $(`.tu.${COLORS_TOKENS[turn]}`).textContent =
            isOnlineGame && !online.isPartyMode ? '10' : 'Your turn';
        }
        //Establece el colro en el navegador
        setThemeColor(COLORS[COLORS_TOKENS[turn]]);

        /**
         * En partidas online se establecerá un contador de movimiento
         */
        if (isOnlineGame && !online.isPartyMode) {
          intervalCounter = setInterrupt(
            (counter) => {
              const printCounter = 9 - counter + 1;
              if (printCounter <= 3) {
                playSounds('interval');
              }
              if (printCounter >= 0) {
                $(`.tu.${COLORS_TOKENS[turn]}`).textContent =
                  (printCounter <= 9 ? '0' : '') + printCounter;
                if (printCounter === 0) {
                  if (PLAYERS[COLORS_TOKENS[turn]].local) {
                    makeBotMove();
                  }
                }
              }
            },
            10,
            1000
          );
        }
      }
    };

    /**
     * Habilitará los tokens que tienen el turno
     * Deshabilitará aquéllos que no lo tienen
     * Si llega un listado de exceptions para los tokens que tienen el turno
     * Sólo se dejarán habilitados los tokens de exceptions, los demás se establecerán como disabled
     * Además quitará la clase de rotación, si es que existe
     * @param {*} exceptions
     */
    const enableDisableTokens = (exceptions = []) => {
      let setFocus = false;
      const currentColor = COLORS_TOKENS[turn];
      const oppositeColor = COLORS_TOKENS[+!turn];

      [getTokensByColor(oppositeColor), getTokensByColor(currentColor)].forEach(
        (token, index) => {
          token.forEach(({ id }) => {
            const tokenID = `#o-${id}`;
            $(tokenID).disabled = index
              ? (PLAYERS[currentColor].human && PLAYERS[currentColor].local) ||
                online.isPartyMode
                ? !exceptions.length
                  ? !index
                  : !exceptions.includes(id)
                : true
              : !index;

            removeClass($(tokenID), 'r bl di');

            // Establecer el focus al primer elemento
            if (
              index &&
              !$(tokenID).disabled &&
              !setFocus &&
              !online.isPartyMode
            ) {
              $(tokenID).focus();
              setFocus = true;
            }

            if (
              index &&
              ((PLAYERS[currentColor].human && PLAYERS[currentColor].local) ||
                online.isPartyMode) &&
              $(tokenID).disabled
            ) {
              addClass($(tokenID), 'di');
            }
          });
        }
      );
    };

    /**
     * Dado el color, retornará todos los tokens que existen en el tablero
     * Retornará un array no una matriz
     * @param {*} color
     */
    const getTokensByColor = (color) =>
      tiles
        .map((tem) => tem.filter((v) => Object.keys(v).length && v.c === color))
        .filter((v) => v.length)
        .reduce((a, s) => [...a, ...s], []);

    /**
     * Para saber si una posición dada está dentro dle rango del escenario
     * @param {*} value
     */
    const inRange = (value) => value >= 0 && value < TOTAL_TILES;

    /**
     * Indica si una celda está libre
     * @param {*} col
     * @param {*} row
     */
    const isCellFree = (col, row) => Object.keys(tiles[col][row]).length === 0;

    /**
     * Quita la clase de visibilidad de los puntos de destino
     */
    const resetTargetPoints = () => {
      [...$$('.t-p')].forEach((e) => {
        removeClass(e, 'v');
      });
    };

    /**
     * Para habilitar o deshabilitar los emojis
     * @param {*} disabled
     */
    const resetEmojis = (disabled = true) => {
      [...$$('.ems')].forEach((e) => {
        e.disabled = disabled;
      });
    };

    /**
     * Dado el index de un token seleccionado,
     * devolverá la data del mismo
     * @param {*} index
     */
    const getValueFromIndex = (index) => {
      for (let col = 0; col < TOTAL_TILES; col++) {
        for (let row = 0; row < TOTAL_TILES; row++) {
          if (
            Object.keys(tiles[col][row]).length &&
            tiles[col][row].id === index
          ) {
            return tiles[col][row];
          }
        }
      }
    };

    /**
     * Función que revisa si al que tiene el turno puede capturar a otro token del adversario
     * Primero filtrar sólo los tokens del usuario que tiene el turno
     */
    const canCaptureOpponent = () =>
      getTokensByColor(COLORS_TOKENS[turn])
        .map((token) => {
          const opponentsPosition = getAvailableMoves(token, true)
            .filter(
              (v) =>
                inRange(v.col + v.direction) &&
                inRange(v.row + v.position) &&
                isCellFree(v.col + v.direction, v.row + v.position)
            )
            .map((v) => ({
              ...v,
              col: v.col + v.direction,
              row: v.row + v.position,
            }));
          return opponentsPosition.length ? [token, opponentsPosition] : [];
        })
        .filter((v) => v.length && v[1].length);

    /**
     * Saber si un token tiene posiociones disponibles
     * Además validará si es posible capturar a un adversario, si este se encuentra en las posiciones de llegada
     * @param {*} param0
     * @param {*} captureAdversary
     */
    const getAvailableMoves = (
      { isKing = false, col, row, d, c },
      captureAdversary = false
    ) => {
      return [1, -1]
        .map((direction, i) =>
          [1, -1]
            .map((position, j) => {
              return (isKing || direction === d) &&
                inRange(col + direction) &&
                inRange(row + position) &&
                ((!captureAdversary &&
                  isCellFree(col + direction, row + position)) ||
                  (captureAdversary &&
                    !isCellFree(col + direction, row + position) &&
                    tiles[col + direction][row + position].c !== c))
                ? {
                    col: col + direction,
                    row: row + position,
                    direction,
                    position,
                    id: tiles[col + direction][row + position].id,
                    counter: tiles[col + direction][row + position].counter,
                    target: i + j + i,
                  }
                : false;
            })
            .filter((v) => v)
        )
        .reduce((a, s) => [...a, ...s], []);
    };

    /**
     * Rertonará el listado de tokens que puede mover un usuario dependiendo de su color
     * @param {*} color
     */
    const getTokensCanMoved = (color) => {
      return getTokensByColor(color).filter((v) => {
        return getAvailableMoves(v).length;
      });
    };

    /**
     * Función que renderizará los elementos que indican a dónde llegarán los tokens
     */
    const renderTargetPoints = () =>
      [...new Array(4)]
        .map((_, index) => `<button class=t-p id=tg-${index}></button>`)
        .join('');

    /**
     * Renderiza los tokens del escenario
     * @param {*} isTile
     */
    const renderTokens = () =>
      tiles
        .map((title) =>
          title
            .map((value) =>
              Object.keys(value).length
                ? `<button color=${value.c} disabled class='${`t-e ${
                    online.isPartyMode ? `cc-${value.counter}` : ''
                  } ${value.c}`}' style='${`left : ${
                    value.row * DIMENSIONS_TILES
                  }px; top : ${value.col * DIMENSIONS_TILES}px`};' id=o-${
                    value.id
                  }></button>`
                : ''
            )
            .join('')
        )
        .join('');

    // getColorTokens

    /**
     * Renderiza los mensajes que indica el turno
     * Además servirá para indicar le tiempo para una jugada
     */
    const renderTurns = () =>
      ['to', 'bo']
        .map(
          (v, i) =>
            `<div class='tu ${v} ce ${
              !i ? INITIAL_COLOR : OPPOSITE_COLOR
            }'></div>`
        )
        .join('');

    /** Renderiza el Score */
    const renderScore = () =>
      `<div class='sc ce'>${[INITIAL_COLOR, OPPOSITE_COLOR]
        .map((v) => `<span class=sc-${v}>${PLAYERS[v].score}</span>`)
        .join('')}</div>`;

    /**
     * Para renderizar los emojis del chat
     */
    const renderEmojis = () => {
      return isOnlineGame && !online.isPartyMode
        ? `<div class='ch-s'></div><div class='ch'><div class='ch-w'>${EMOJIS.map(
            (v, i) => {
              return `<button id=em-${i} class='ems'>${v}</button>`;
            }
          ).join('')}</div></div>`
        : '';
    };

    // Inyecta el html creado
    setHtml(
      $('.s'),
      `<div class='bw wh ce'>
        <button class=cl>EXIT</button>
        ${renderTurns()}
        ${renderScore()}
        <div class=b style='height : ${DIMENSIONS_TILES * TOTAL_TILES + 20}px'>
          ${renderTokens()}${renderTargetPoints()}${renderEmojis()}
        </div>
        <div class='bc wh ce'><span></span><button class=cl>EXIT</button></div>
      </div>`
    );

    /**
     * Establece los eventos
     * t-p corresponde a los punto de llegada
     * t-e corresponde a los tokens
     */

    ['t-p', 't-e'].forEach((event) => {
      [...$$(`.${event}`)].forEach((elemet) => {
        const addEvent =
          event === 't-e'
            ? PLAYERS[elemet.getAttribute('color')].human &&
              PLAYERS[elemet.getAttribute('color')].local &&
              !online.isPartyMode
            : true;

        if (addEvent) {
          $on(elemet, 'click', (e) => {
            if (!tokenMove && !sendFromSocket) {
              if (isOnlineGame && intervalCounter) {
                clearInterval(intervalCounter);
              }
              if (!online.isPartyMode) {
                // Quita la calse de visibilidad de los puntos de llegada
                resetTargetPoints();
              }
              const idElement = e.target.id.split('-');
              // "o" indica que es un token
              if (idElement[0] === 'o') {
                playSounds('click');
                selectToken(+idElement[1]);
              } else {
                if (!online.isPartyMode) {
                  const [
                    destinationColumn,
                    destinationRow,
                    index,
                    indexOpponent,
                  ] = e.target.getAttribute('p').split('-');
                  const newIndexOpponent =
                    indexOpponent === '' ? -1 : +indexOpponent;
                  if (!isOnlineGame) {
                    setTokenMovement(
                      +destinationColumn,
                      +destinationRow,
                      +index,
                      newIndexOpponent
                    );
                  } else {
                    sendFromSocket = true;
                    socket.emit('mV', {
                      type: 1,
                      user,
                      room: GAME_ROOM,
                      movement: [
                        +destinationColumn,
                        +destinationRow,
                        +index,
                        newIndexOpponent,
                      ],
                    });
                  }
                }
              }
            }
          });
        }
      });
    });

    if (isOnlineGame && !online.isPartyMode) {
      [...$$('.ems')].forEach((emoji) => {
        $on(emoji, 'click', (e) => {
          playSounds('emoji');
          resetEmojis();
          const idElement = e.target.id.split('-');
          addClass($(`#em-${+idElement[1]}`), 'seb');
          socket.emit('mV', {
            type: 5,
            user,
            room: GAME_ROOM,
            emoji: +idElement[1],
          });

          setTimeout(() => {
            resetEmojis(false);
            removeClass($(`#em-${+idElement[1]}`), 'seb');
          }, 4000);
        });
      });
    }

    $on($('.cl'), 'click', () => {
      playSounds('click');
      if (intervalStart) {
        clearInterval(intervalStart);
      }

      if (intervalCounter) {
        clearInterval(intervalCounter);
      }

      if (isOnlineGame && socket) {
        disconnectSocket();
      }

      lobby();
    });

    if (isOnlineGame && socket) {
      socket.on('rV', (data) => {
        if (isOnlineGame && intervalCounter) {
          clearInterval(intervalCounter);
        }
        sendFromSocket = false;

        const sameLocalUser = data.user === user || online.isPartyMode;
        let [
          destinationColumn,
          destinationRow,
          index,
          newIndexOpponent,
        ] = data.movement;

        if (!sameLocalUser) {
          index = 23 - index;
          destinationColumn = 7 - destinationColumn;
          destinationRow = 7 - destinationRow;
          newIndexOpponent =
            newIndexOpponent >= 0 ? 23 - newIndexOpponent : newIndexOpponent;
        }

        setTokenMovement(
          destinationColumn,
          destinationRow,
          index,
          newIndexOpponent
        );
      });

      socket.on('gD', () => {
        if (intervalStart) {
          clearInterval(intervalStart);
        }

        if (intervalCounter) {
          clearInterval(intervalCounter);
        }

        determineWinner();

        if (isOnlineGame && socket) {
          disconnectSocket();
        }
      });

      /**
       * Selecciona un token y el board y se muestra en el tablero
       * Usado en party mode
       */
      socket.on('sT', (data) => {
        resetTargetPoints();

        // Mostrar los movimiento disponibles en el token seleccionado
        [...$$('.t-e')].forEach((e) => {
          removeClass(e, 'sel');
        });

        addClass($(`#o-${data.id}`), 'sel');

        selectToken(data.id);
      });

      socket.on('rE', (data) => {
        if (user !== data.user) {
          playSounds('emoji');
          $('.ch-s').textContent = EMOJIS[data.emoji];
          addClass($('.ch-s'), 'an');
          setTimeout(() => {
            if ($('.ch-s')) {
              removeClass($('.ch-s'), 'an');
            }
          }, 4000);
        }
      });

      // Se emite el movimiento inicial a los clientes
      if (online.isPartyMode) {
        socket.emit('mV', {
          type: 2,
          user,
          room: GAME_ROOM,
          color: COLORS_TOKENS[turn],
          data: getTokensCanMoved(COLORS_TOKENS[turn]).map((v) => ({
            ...v,
            availableMoves: getAvailableMoves(v),
          })),
        });
      }
    }
  };

  /**
   * Para manejar el escalado del juego
   */
  const onWindowResize = debounce(() => {
    const { w, h } = getDimensionsScreen();
    const scale = Math.min(w / DIMENSIONS[0], h / DIMENSIONS[1]);
    const mobile = isMobile();
    addStyle($('body'), {
      zoom: `${
        w < DIMENSIONS[0] ? Math.round((w / DIMENSIONS[0]) * 100) : 100
      }%`,
      transform:
        scale >= 1 || mobile ? `scale(${!mobile ? scale : 1})` : undefined,
    });
  }, 100);

  /**
   * Función principal del juego
   */
  const init = () => {
    const style = document.createElement('style');
    let customColor = '';
    for (let color in COLORS) {
      document.documentElement.style.setProperty(`--c-${color}`, COLORS[color]);
      customColor += [...new Array(12)]
        .map(
          (_, i) =>
            `.cc-${i}.${color}:after{background:${getColorTokens(color, i)}}`
        )
        .join('');
    }

    setHtml(style, customColor);
    $('head').appendChild(style);

    addStyle($('.s'), {
      width: `${DIMENSIONS[0]}px`,
      height: `${DIMENSIONS[1]}px`,
    });

    lobby();
    $on(window, 'resize', onWindowResize);
    onWindowResize();

    // getColorTokens
  };

  /**
   * Para desconectar el socket
   */
  const disconnectSocket = () => {
    if (connectedSocket && socket) {
      connectedSocket = false;
      GAME_ROOM = '';
      socket.disconnect();
    }
  };

  /**
   * Configura el socket
   */
  const configureSocket = (options = {}) => {
    socket = io();
    connectedSocket = true;

    // Envia la data del usuario actual al server y busca un jugador
    socket.on('connect', () => {
      socket.emit('nU', { ...options, user }, (error) => {
        if (error) {
          alert(error);
          if ($('.clm')) {
            addClass($('.bc'), 'hi');
          } else {
            lobby();
          }
          disconnectSocket();
        }
      });
    });

    /**
     * Evento que indica que se hizo match en el juego
     */
    socket.on('sG', (data) => {
      GAME_ROOM = data.room;
      const { color } = data.p1.user === user ? data.p1 : data.p2;
      if (data.type !== 3) {
        createBoard(modeType, {
          baseColor: color,
          initialTurn: data.turn,
        });
      } else {
        // Es de tipo party mode
        if (data.table && data.table.user === user) {
          // Indica que renderizará el tablero
          createBoard(modeType, {
            baseColor: data.turn,
            initialTurn: data.turn,
            isPartyMode: true,
          });
        } else {
          // Renderizará un control
          renderControl(color, data.turn);
        }
      }
    });
  };

  $on(document, 'contextmenu', (event) => event.preventDefault());

  console.log(
    '%cGame Developed by Jorge Rubiano https://twitter.com/ostjh',
    'color:red; font-size:20px; font-weight: bold; background-color: black;'
  );

  $on(window, 'load', init);
})();
