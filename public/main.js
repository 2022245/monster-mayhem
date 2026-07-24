const socket = io();

let myPlayerNumber = null;
let connectedPlayerCount = 0;

socket.on("connect", () => {
    console.log(
        `Connected to server: ${socket.id}`
    );
});

socket.on("player-assigned", data => {
    myPlayerNumber = data.playerNumber;

    const identityElement =
        document.querySelector(
            "#player-identity"
        );

    if (identityElement) {
        identityElement.textContent =
            `You are Player ${myPlayerNumber} — ${data.gameId}`;
    }
});

socket.on("players-connected", data => {
    connectedPlayerCount = data.count;

    const connectionElement =
        document.querySelector(
            "#connection-status"
        );

    if (!connectionElement) return;

    if (data.count < 2) {
        connectionElement.textContent =
            `Waiting for another player (${data.count}/2)`;
    } else {
        connectionElement.textContent =
            "Both players connected";
    }
});

socket.on("game-state", serverState => {
    gameState.round =
        serverState.round;

    gameState.pendingMoves =
        serverState.pendingMoves;

    gameState.monsters =
        serverState.monsters;

    gameState.stats =
        serverState.stats;

    gameState.records =
        serverState.records;

    gameState.gameOver =
        serverState.gameOver;

    gameState.winner =
        serverState.winner;

    gameState.rematchReady =
        serverState.rematchReady;

    gameState.selectedMonster = null;

    renderMonsters();
});

socket.on("game-over", data => {
    gameState.gameOver = true;
    gameState.winner = data.winner;
    gameState.selectedMonster = null;

    renderMonsters();
});

socket.on("move-error", message => {
    alert(message);
});

socket.on("game-message", data => {
    alert(data.message);
});

socket.on("disconnect", () => {
    connectedPlayerCount = 0;

    const connectionElement =
        document.querySelector(
            "#connection-status"
        );

    if (connectionElement) {
        connectionElement.textContent =
            "Disconnected from server";
    }
});

const playAgainButton =
    document.querySelector(
        "#play-again-button"
    );

if (playAgainButton) {
    playAgainButton.addEventListener(
        "click",
        () => {
            if (!gameState.gameOver) return;

            socket.emit("play-again");
        }
    );
}

createBoard();
renderMonsters();

