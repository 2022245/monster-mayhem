const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

const PORT = 3000;

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (request, response) => {
    response.sendFile(
        path.join(__dirname, "../views/index.html")
    );
});

const games = new Map();
let nextGameNumber = 1;

function createStartingMonsters() {
    const monsters = [];

    const playerOneTypes = [
        "vampire",
        "werewolf",
        "ghost",
        "vampire",
        "werewolf",
        "ghost",
        "vampire",
        "werewolf",
        "ghost",
        "vampire"
    ];

    const playerTwoTypes = [
        "werewolf",
        "ghost",
        "vampire",
        "werewolf",
        "ghost",
        "vampire",
        "werewolf",
        "ghost",
        "vampire",
        "werewolf"
    ];

    playerOneTypes.forEach((type, col) => {
        monsters.push({
            id: col + 1,
            type,
            player: 1,
            row: 0,
            col
        });
    });

    playerTwoTypes.forEach((type, col) => {
        monsters.push({
            id: col + 11,
            type,
            player: 2,
            row: 9,
            col
        });
    });

    return monsters;
}

function createInitialState() {
    return {
        round: 1,

        pendingMoves: {
            1: null,
            2: null
        },

        monsters: createStartingMonsters(),

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
        }
    };
}

function createGame() {
    const gameId = `game-${nextGameNumber}`;
    nextGameNumber++;

    const game = {
        id: gameId,

        players: {
            1: null,
            2: null
        },

        records: {
            gamesPlayed: 0,
            playerOneWins: 0,
            playerOneLosses: 0,
            playerTwoWins: 0,
            playerTwoLosses: 0,
            draws: 0
        },

        state: createInitialState()
    };

    games.set(gameId, game);

    return game;
}

function findWaitingGame() {
    for (const game of games.values()) {
        if (
            game.players[1] !== null &&
            game.players[2] === null
        ) {
            return game;
        }
    }

    return null;
}

function assignPlayerToGame(socket) {
    let game = findWaitingGame();

    if (!game) {
        game = createGame();
    }

    const playerNumber =
        game.players[1] === null ? 1 : 2;

    game.players[playerNumber] = socket.id;

    socket.data.gameId = game.id;
    socket.data.playerNumber = playerNumber;

    socket.join(game.id);

    return {
        game,
        playerNumber
    };
}

function getPlayerCount(game) {
    return Object.values(game.players).filter(
        socketId => socketId !== null
    ).length;
}

function resetGame(game) {
    game.state = createInitialState();
}

function getPublicGameState(game) {
    return {
        ...game.state,
        records: game.records
    };
}

function findMonster(game, monsterId) {
    return game.state.monsters.find(
        monster => monster.id === monsterId
    );
}

function isValidMove(
    game,
    monster,
    targetRow,
    targetCol
) {
    if (
        !Number.isInteger(targetRow) ||
        !Number.isInteger(targetCol) ||
        targetRow < 0 ||
        targetRow > 9 ||
        targetCol < 0 ||
        targetCol > 9
    ) {
        return {
            valid: false,
            message: "The target square is outside the board."
        };
    }

    const rowDifference = Math.abs(
        targetRow - monster.row
    );

    const columnDifference = Math.abs(
        targetCol - monster.col
    );

    const isHorizontal =
        rowDifference === 0 &&
        columnDifference > 0;

    const isVertical =
        columnDifference === 0 &&
        rowDifference > 0;

    const isDiagonal =
        rowDifference === columnDifference &&
        rowDifference > 0 &&
        rowDifference <= 2;

    if (!(isHorizontal || isVertical || isDiagonal)) {
        return {
            valid: false,
            message:
                "Monsters move horizontally, vertically, or up to two squares diagonally."
        };
    }

    const destinationMonster =
        game.state.monsters.find(
            otherMonster =>
                otherMonster.row === targetRow &&
                otherMonster.col === targetCol
        );

    if (
        destinationMonster &&
        destinationMonster.player === monster.player
    ) {
        return {
            valid: false,
            message:
                "You cannot finish a move on one of your own monsters."
        };
    }

    const rowStep = Math.sign(
        targetRow - monster.row
    );

    const columnStep = Math.sign(
        targetCol - monster.col
    );

    let currentRow = monster.row + rowStep;
    let currentCol = monster.col + columnStep;

    while (
        currentRow !== targetRow ||
        currentCol !== targetCol
    ) {
        const blockingMonster =
            game.state.monsters.find(
                otherMonster =>
                    otherMonster.row === currentRow &&
                    otherMonster.col === currentCol
            );

        if (
            blockingMonster &&
            blockingMonster.player !== monster.player
        ) {
            return {
                valid: false,
                message:
                    "You cannot move through an opponent's monster."
            };
        }

        currentRow += rowStep;
        currentCol += columnStep;
    }

    return {
        valid: true,
        message: ""
    };
}

function bothPlayersReady(game) {
    return (
        game.state.pendingMoves[1] !== null &&
        game.state.pendingMoves[2] !== null
    );
}

function bothPlayersWantRematch(game) {
    return (
        game.state.rematchReady[1] &&
        game.state.rematchReady[2]
    );
}

function resolveTurn(game) {
    const moves = Object.values(
        game.state.pendingMoves
    );

    moves.forEach(move => {
        const monster = findMonster(
            game,
            move.monsterId
        );

        if (!monster) return;

        monster.row = move.targetRow;
        monster.col = move.targetCol;
    });

    resolveBattles(game);

    game.state.pendingMoves[1] = null;
    game.state.pendingMoves[2] = null;

    game.state.round++;
}

function resolveBattles(game) {
    const positions = {};

    game.state.monsters.forEach(monster => {
        const position =
            `${monster.row},${monster.col}`;

        if (!positions[position]) {
            positions[position] = [];
        }

        positions[position].push(monster);
    });

    Object.values(positions).forEach(
        monstersOnSquare => {
            if (monstersOnSquare.length === 2) {
                resolveBattle(
                    game,
                    monstersOnSquare[0],
                    monstersOnSquare[1]
                );
            }
        }
    );
}

function resolveBattle(
    game,
    monsterA,
    monsterB
) {
    if (monsterA.player === monsterB.player) {
        return;
    }

    game.state.stats.battles++;

    if (monsterA.type === monsterB.type) {
        removeMonster(game, monsterA.id);
        removeMonster(game, monsterB.id);
        return;
    }

    if (beats(monsterA.type, monsterB.type)) {
        removeMonster(game, monsterB.id);

        if (monsterA.player === 1) {
            game.state.stats.playerOneEliminations++;
        } else {
            game.state.stats.playerTwoEliminations++;
        }
    } else {
        removeMonster(game, monsterA.id);

        if (monsterB.player === 1) {
            game.state.stats.playerOneEliminations++;
        } else {
            game.state.stats.playerTwoEliminations++;
        }
    }
}

function beats(typeA, typeB) {
    return (
        (
            typeA === "vampire" &&
            typeB === "werewolf"
        ) ||
        (
            typeA === "werewolf" &&
            typeB === "ghost"
        ) ||
        (
            typeA === "ghost" &&
            typeB === "vampire"
        )
    );
}

function removeMonster(game, monsterId) {
    game.state.monsters =
        game.state.monsters.filter(
            monster => monster.id !== monsterId
        );
}

function getWinner(game) {
    const playerOneCount =
        game.state.monsters.filter(
            monster => monster.player === 1
        ).length;

    const playerTwoCount =
        game.state.monsters.filter(
            monster => monster.player === 2
        ).length;

    if (
        playerOneCount === 0 &&
        playerTwoCount === 0
    ) {
        return "draw";
    }

    if (playerOneCount === 0) {
        return 2;
    }

    if (playerTwoCount === 0) {
        return 1;
    }

    return null;
}

function broadcastGameState(game) {
    io.to(game.id).emit(
        "game-state",
        getPublicGameState(game)
    );
}

function broadcastPlayerCount(game) {
    io.to(game.id).emit(
        "players-connected",
        {
            count: getPlayerCount(game)
        }
    );
}

io.on("connection", socket => {
    const {
        game,
        playerNumber
    } = assignPlayerToGame(socket);

    socket.emit("player-assigned", {
        playerNumber,
        gameId: game.id
    });

    broadcastPlayerCount(game);
    broadcastGameState(game);

    console.log(
        `${socket.id} joined ${game.id} as Player ${playerNumber}`
    );

    socket.on("submit-move", move => {
        const gameId = socket.data.gameId;
        const currentGame = games.get(gameId);
        const currentPlayer =
            socket.data.playerNumber;

        if (!currentGame || !currentPlayer) {
            return;
        }

        if (currentGame.state.gameOver) {
            socket.emit(
                "move-error",
                "The game is finished. Choose Play Again."
            );

            return;
        }

        if (getPlayerCount(currentGame) < 2) {
            socket.emit(
                "move-error",
                "Wait until another player joins."
            );

            return;
        }

        if (
            currentGame.state.pendingMoves[
                currentPlayer
            ]
        ) {
            socket.emit(
                "move-error",
                "You already submitted a move this round."
            );

            return;
        }

        const monster = findMonster(
            currentGame,
            move.monsterId
        );

        if (!monster) {
            socket.emit(
                "move-error",
                "Monster not found."
            );

            return;
        }

        if (monster.player !== currentPlayer) {
            socket.emit(
                "move-error",
                "You can only move your own monsters."
            );

            return;
        }

        const moveValidation = isValidMove(
            currentGame,
            monster,
            move.targetRow,
            move.targetCol
        );

        if (!moveValidation.valid) {
            socket.emit(
                "move-error",
                moveValidation.message
            );

            return;
        }

        currentGame.state.pendingMoves[
            currentPlayer
        ] = {
            monsterId: monster.id,
            targetRow: move.targetRow,
            targetCol: move.targetCol
        };

        broadcastGameState(currentGame);

        if (bothPlayersReady(currentGame)) {
            resolveTurn(currentGame);

            const winner =
                getWinner(currentGame);

            if (winner !== null) {
                currentGame.state.gameOver = true;
                currentGame.state.winner = winner;

                currentGame.records.gamesPlayed++;

                if (winner === "draw") {
                    currentGame.records.draws++;
                } else if (winner === 1) {
                    currentGame.records.playerOneWins++;
                    currentGame.records.playerTwoLosses++;
                } else {
                    currentGame.records.playerTwoWins++;
                    currentGame.records.playerOneLosses++;
                }

                io.to(currentGame.id).emit(
                    "game-over",
                    {
                        winner
                    }
                );
            }

            broadcastGameState(currentGame);
        }
    });

    socket.on("play-again", () => {
        const gameId = socket.data.gameId;
        const currentGame = games.get(gameId);
        const currentPlayer =
            socket.data.playerNumber;

        if (!currentGame || !currentPlayer) {
            return;
        }

        if (!currentGame.state.gameOver) {
            return;
        }

        currentGame.state.rematchReady[
            currentPlayer
        ] = true;

        broadcastGameState(currentGame);

        if (bothPlayersWantRematch(currentGame)) {
            resetGame(currentGame);

            io.to(currentGame.id).emit(
                "game-message",
                {
                    message:
                        "Both players are ready. A new game has started!"
                }
            );

            broadcastGameState(currentGame);
        }
    });

    socket.on("disconnect", () => {
        const gameId = socket.data.gameId;

        const disconnectedPlayer =
            socket.data.playerNumber;

        const currentGame =
            games.get(gameId);

        if (!currentGame) return;

        currentGame.players[
            disconnectedPlayer
        ] = null;

        resetGame(currentGame);

        const remainingPlayerNumber =
            disconnectedPlayer === 1
                ? 2
                : 1;

        const remainingSocketId =
            currentGame.players[
                remainingPlayerNumber
            ];

        if (remainingSocketId) {
            currentGame.players[1] =
                remainingSocketId;

            currentGame.players[2] = null;

            const remainingSocket =
                io.sockets.sockets.get(
                    remainingSocketId
                );

            if (remainingSocket) {
                remainingSocket.data.playerNumber = 1;

                remainingSocket.emit(
                    "player-assigned",
                    {
                        playerNumber: 1,
                        gameId: currentGame.id
                    }
                );

                remainingSocket.emit(
                    "game-message",
                    {
                        message:
                            "Your opponent disconnected. The game was reset and you are now Player 1."
                    }
                );
            }
        }

        broadcastPlayerCount(currentGame);
        broadcastGameState(currentGame);

        if (
            getPlayerCount(currentGame) === 0
        ) {
            games.delete(currentGame.id);
        }

        console.log(
            `${socket.id} left ${gameId}`
        );
    });
});

httpServer.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT}`
    );
});

