const gameState = {
    board: [],
    players: [1, 2],
    round: 1,
    selectedMonster: null,

    pendingMoves: {
        1: null,
        2: null
    },

    monsters: [
        {
            id: 1,
            type: "vampire",
            player: 1,
            row: 0,
            col: 4
        },
        {
            id: 2,
            type: "werewolf",
            player: 2,
            row: 9,
            col: 4
        }
    ]
};
