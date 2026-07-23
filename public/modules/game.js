const gameState = {
    board: [],

    round: 1,

    pendingMoves: {
        1: null,
        2: null
    },

    monsters: [],

    stats: {
        battles: 0,
        playerOneEliminations: 0,
        playerTwoEliminations: 0
    },

    gameOver: false,
    winner: null,

    rematchReady: {
        1: false,
        2: false
    },

    selectedMonster: null
};

