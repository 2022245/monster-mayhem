const gameState = {
    board: [],
    players: [1, 2],
    round: 1,
    currentPlayer: 1,
    selectedMonster: null,

    pendingMoves: {
        1: null,
        2: null
    },

    monsters: [
        // Player 1 — top row
        {
            id: 1,
            type: "vampire",
            player: 1,
            row: 0,
            col: 0
        },
        {
            id: 2,
            type: "werewolf",
            player: 1,
            row: 0,
            col: 1
        },
        {
            id: 3,
            type: "ghost",
            player: 1,
            row: 0,
            col: 2
        },
        {
            id: 4,
            type: "vampire",
            player: 1,
            row: 0,
            col: 3
        },
        {
            id: 5,
            type: "werewolf",
            player: 1,
            row: 0,
            col: 4
        },
        {
            id: 6,
            type: "ghost",
            player: 1,
            row: 0,
            col: 5
        },
        {
            id: 7,
            type: "vampire",
            player: 1,
            row: 0,
            col: 6
        },
        {
            id: 8,
            type: "werewolf",
            player: 1,
            row: 0,
            col: 7
        },
        {
            id: 9,
            type: "ghost",
            player: 1,
            row: 0,
            col: 8
        },
        {
            id: 10,
            type: "vampire",
            player: 1,
            row: 0,
            col: 9
        },

        // Player 2 — bottom row
        {
            id: 11,
            type: "werewolf",
            player: 2,
            row: 9,
            col: 0
        },
        {
            id: 12,
            type: "ghost",
            player: 2,
            row: 9,
            col: 1
        },
        {
            id: 13,
            type: "vampire",
            player: 2,
            row: 9,
            col: 2
        },
        {
            id: 14,
            type: "werewolf",
            player: 2,
            row: 9,
            col: 3
        },
        {
            id: 15,
            type: "ghost",
            player: 2,
            row: 9,
            col: 4
        },
        {
            id: 16,
            type: "vampire",
            player: 2,
            row: 9,
            col: 5
        },
        {
            id: 17,
            type: "werewolf",
            player: 2,
            row: 9,
            col: 6
        },
        {
            id: 18,
            type: "ghost",
            player: 2,
            row: 9,
            col: 7
        },
        {
            id: 19,
            type: "vampire",
            player: 2,
            row: 9,
            col: 8
        },
        {
            id: 20,
            type: "werewolf",
            player: 2,
            row: 9,
            col: 9
        }
    ]
};
