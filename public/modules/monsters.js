function renderMonsters() {
    document.querySelectorAll(".square").forEach(square => {
        square.textContent = "";

        square.classList.remove(
            "selected",
            "pending",
            "player-one-piece",
            "player-two-piece"
        );
    });

    gameState.monsters.forEach(monster => {
        const square = document.querySelector(
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
            square.classList.add("player-one-piece");
        } else {
            square.classList.add("player-two-piece");
        }

        if (
            gameState.selectedMonster &&
            gameState.selectedMonster.id === monster.id
        ) {
            square.classList.add("selected");
        }

        const pendingMove = gameState.pendingMoves[monster.player];

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
    const clickedMonster = findMonsterAt(row, col);

    if (clickedMonster) {
        selectMonster(clickedMonster);
    } else {
        queueSelectedMove(row, col);
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
    if (monster.player !== gameState.currentPlayer) {
        alert(`It is Player ${gameState.currentPlayer}'s turn.`);
        return;
    }

    if (gameState.pendingMoves[monster.player]) {
        alert(
            `Player ${monster.player} has already submitted a move this round.`
        );
        return;
    }

    if (
        gameState.selectedMonster &&
        gameState.selectedMonster.id === monster.id
    ) {
        gameState.selectedMonster = null;
        return;
    }

    gameState.selectedMonster = monster;
}

function isValidMove(monster, targetRow, targetCol) {
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

function queueSelectedMove(targetRow, targetCol) {
    const selectedMonster = gameState.selectedMonster;

    if (!selectedMonster) return;

    if (selectedMonster.player !== gameState.currentPlayer) {
        alert(`It is Player ${gameState.currentPlayer}'s turn.`);
        return;
    }

    if (
        !isValidMove(
            selectedMonster,
            targetRow,
            targetCol
        )
    ) {
        alert("Invalid move");
        return;
    }

    gameState.pendingMoves[selectedMonster.player] = {
        monsterId: selectedMonster.id,
        targetRow,
        targetCol
    };

    console.log(
        `Player ${selectedMonster.player} submitted a move`
    );

    gameState.selectedMonster = null;

    if (gameState.currentPlayer === 1) {
        gameState.currentPlayer = 2;
    }

    checkPendingMoves();
}

function checkPendingMoves() {
    const allPlayersReady = gameState.players.every(
        playerId =>
            gameState.pendingMoves[playerId] !== null
    );

    if (allPlayersReady) {
        resolveTurn();
    }
}

function resolveTurn() {
    const moves = Object.values(
        gameState.pendingMoves
    );

    moves.forEach(move => {
        const monster = gameState.monsters.find(
            currentMonster =>
                currentMonster.id === move.monsterId
        );

        if (!monster) return;

        monster.row = move.targetRow;
        monster.col = move.targetCol;
    });

    resolveBattles();

    gameState.pendingMoves[1] = null;
    gameState.pendingMoves[2] = null;

    gameState.round++;
    gameState.currentPlayer = 1;

    checkWinner();

    console.log(
        `Round ${gameState.round - 1} completed`
    );

    renderMonsters();
}

function resolveBattles() {
    const positions = {};

    gameState.monsters.forEach(monster => {
        const key =
            `${monster.row},${monster.col}`;

        if (!positions[key]) {
            positions[key] = [];
        }

        positions[key].push(monster);
    });

    Object.values(positions).forEach(
        monstersOnSquare => {
            if (monstersOnSquare.length === 2) {
                resolveBattle(
                    monstersOnSquare[0],
                    monstersOnSquare[1]
                );
            }
        }
    );
}

function resolveBattle(monsterA, monsterB) {
    if (monsterA.type === monsterB.type) {
        removeMonster(monsterA.id);
        removeMonster(monsterB.id);
        return;
    }

    if (beats(monsterA.type, monsterB.type)) {
        removeMonster(monsterB.id);
    } else {
        removeMonster(monsterA.id);
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

function removeMonster(monsterId) {
    gameState.monsters =
        gameState.monsters.filter(
            monster => monster.id !== monsterId
        );
}

function checkWinner() {
    const playerOneMonsters =
        gameState.monsters.filter(
            monster => monster.player === 1
        );

    const playerTwoMonsters =
        gameState.monsters.filter(
            monster => monster.player === 2
        );

    if (
        playerOneMonsters.length === 0 &&
        playerTwoMonsters.length === 0
    ) {
        alert("The game is a draw!");
        location.reload();
        return;
    }

    if (playerOneMonsters.length === 0) {
        alert("Player 2 wins!");
        location.reload();
        return;
    }

    if (playerTwoMonsters.length === 0) {
        alert("Player 1 wins!");
        location.reload();
    }
}

function updateStatusPanel() {
    const roundNumber =
        document.querySelector("#round-number");

    const currentPlayer =
        document.querySelector("#current-player");

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

    if (
        !roundNumber ||
        !playerOneStatus ||
        !playerTwoStatus
    ) {
        return;
    }

    const playerOneMonsters =
        gameState.monsters.filter(
            monster => monster.player === 1
        ).length;

    const playerTwoMonsters =
        gameState.monsters.filter(
            monster => monster.player === 2
        ).length;

    roundNumber.textContent =
        gameState.round;

    if (currentPlayer) {
        currentPlayer.textContent =
            `Player ${gameState.currentPlayer}`;
    }

    playerOneStatus.textContent =
        gameState.pendingMoves[1]
            ? "Ready"
            : "Waiting";

    playerTwoStatus.textContent =
        gameState.pendingMoves[2]
            ? "Ready"
            : "Waiting";

    if (playerOneScore) {
        playerOneScore.textContent =
            playerOneMonsters;
    }

    if (playerTwoScore) {
        playerTwoScore.textContent =
            playerTwoMonsters;
    }
}
