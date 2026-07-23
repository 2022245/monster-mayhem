function renderMonsters() {
    document
        .querySelectorAll(".square")
        .forEach(square => {
            square.textContent = "";

            square.classList.remove(
                "selected",
                "pending",
                "player-one-piece",
                "player-two-piece"
            );
        });

    gameState.monsters.forEach(monster => {
        const square =
            document.querySelector(
                `[data-row="${monster.row}"][data-col="${monster.col}"]`
            );

        if (!square) return;

        switch (monster.type) {
            case "vampire":
                square.textContent = "🧛";
                break;

            case "werewolf":
                square.textContent = "🐺";
                break;

            case "ghost":
                square.textContent = "👻";
                break;
        }

        if (monster.player === 1) {
            square.classList.add(
                "player-one-piece"
            );
        } else {
            square.classList.add(
                "player-two-piece"
            );
        }

        if (
            gameState.selectedMonster &&
            gameState.selectedMonster.id ===
                monster.id
        ) {
            square.classList.add("selected");
        }

        const pendingMove =
            gameState.pendingMoves[
                monster.player
            ];

        if (
            pendingMove &&
            pendingMove.monsterId === monster.id
        ) {
            square.classList.add("pending");
        }
    });

    updateStatusPanel();
}

function handleClick(row, col) {
    if (gameState.gameOver) {
        alert(
            "The game is finished. Choose Play Again."
        );

        return;
    }

    if (connectedPlayerCount < 2) {
        alert(
            "Wait until both players are connected."
        );

        return;
    }

    const clickedMonster =
        findMonsterAt(row, col);

    if (clickedMonster) {
        selectMonster(clickedMonster);
    } else {
        submitSelectedMove(row, col);
    }

    renderMonsters();
}

function findMonsterAt(row, col) {
    return gameState.monsters.find(
        monster =>
            monster.row === row &&
            monster.col === col
    );
}

function selectMonster(monster) {
    if (monster.player !== myPlayerNumber) {
        alert(
            "You can only select your own monsters."
        );

        return;
    }

    if (
        gameState.pendingMoves[
            myPlayerNumber
        ]
    ) {
        alert(
            "You already submitted a move this round."
        );

        return;
    }

    if (
        gameState.selectedMonster &&
        gameState.selectedMonster.id ===
            monster.id
    ) {
        gameState.selectedMonster = null;
        return;
    }

    gameState.selectedMonster = monster;
}

function isValidMove(
    monster,
    targetRow,
    targetCol
) {
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

    return (
        isHorizontal ||
        isVertical ||
        isDiagonal
    );
}

function submitSelectedMove(
    targetRow,
    targetCol
) {
    const selectedMonster =
        gameState.selectedMonster;

    if (!selectedMonster) return;

    if (
        !isValidMove(
            selectedMonster,
            targetRow,
            targetCol
        )
    ) {
        alert("Invalid move.");
        return;
    }

    socket.emit("submit-move", {
        monsterId: selectedMonster.id,
        targetRow,
        targetCol
    });

    gameState.selectedMonster = null;
}

function updateStatusPanel() {
    const roundNumber =
        document.querySelector(
            "#round-number"
        );

    const currentPlayer =
        document.querySelector(
            "#current-player"
        );

    const playerOneStatus =
        document.querySelector(
            "#player-one-status"
        );

    const playerTwoStatus =
        document.querySelector(
            "#player-two-status"
        );

    const playerOneScore =
        document.querySelector(
            "#player-one-score"
        );

    const playerTwoScore =
        document.querySelector(
            "#player-two-score"
        );

    const battleCount =
        document.querySelector(
            "#battle-count"
        );

    const playerOneEliminations =
        document.querySelector(
            "#player-one-eliminations"
        );

    const playerTwoEliminations =
        document.querySelector(
            "#player-two-eliminations"
        );

    const gameResult =
        document.querySelector(
            "#game-result"
        );

    const playAgainButton =
        document.querySelector(
            "#play-again-button"
        );

    const playerOneMonsters =
        gameState.monsters.filter(
            monster => monster.player === 1
        ).length;

    const playerTwoMonsters =
        gameState.monsters.filter(
            monster => monster.player === 2
        ).length;

    if (roundNumber) {
        roundNumber.textContent =
            gameState.round;
    }

    if (currentPlayer) {
        currentPlayer.textContent =
            gameState.gameOver
                ? "Game finished"
                : "Simultaneous turns";
    }

    if (playerOneStatus) {
        playerOneStatus.textContent =
            gameState.gameOver
                ? "Finished"
                : gameState.pendingMoves[1]
                    ? "Ready"
                    : "Choosing";
    }

    if (playerTwoStatus) {
        playerTwoStatus.textContent =
            gameState.gameOver
                ? "Finished"
                : gameState.pendingMoves[2]
                    ? "Ready"
                    : "Choosing";
    }

    if (playerOneScore) {
        playerOneScore.textContent =
            playerOneMonsters;
    }

    if (playerTwoScore) {
        playerTwoScore.textContent =
            playerTwoMonsters;
    }

    if (battleCount) {
        battleCount.textContent =
            gameState.stats.battles;
    }

    if (playerOneEliminations) {
        playerOneEliminations.textContent =
            gameState.stats.playerOneEliminations;
    }

    if (playerTwoEliminations) {
        playerTwoEliminations.textContent =
            gameState.stats.playerTwoEliminations;
    }

    if (gameResult) {
        if (!gameState.gameOver) {
            gameResult.textContent = "";
        } else if (gameState.winner === "draw") {
            gameResult.textContent =
                "🤝 The game is a draw!";
        } else {
            gameResult.textContent =
                `🏆 Player ${gameState.winner} wins!`;
        }
    }

    if (playAgainButton) {
        playAgainButton.hidden =
            !gameState.gameOver;

        const playerReady =
            gameState.rematchReady[
                myPlayerNumber
            ];

        if (playerReady) {
            playAgainButton.textContent =
                "Waiting for opponent...";
            playAgainButton.disabled = true;
        } else {
            playAgainButton.textContent =
                "Play Again";
            playAgainButton.disabled = false;
        }
    }
}
