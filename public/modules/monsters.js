function renderMonsters() {
    document.querySelectorAll(".square").forEach(square => {
        square.textContent = "";
        square.classList.remove("selected");
        square.classList.remove("pending");
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
    const rowDifference = Math.abs(targetRow - monster.row);
    const columnDifference = Math.abs(targetCol - monster.col);

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

    return isHorizontal || isVertical || isDiagonal;
}

function queueSelectedMove(targetRow, targetCol) {
    const selectedMonster = gameState.selectedMonster;

    if (!selectedMonster) return;

    if (!isValidMove(selectedMonster, targetRow, targetCol)) {
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

    checkPendingMoves();
}

function checkPendingMoves() {
    const allPlayersReady = gameState.players.every(
        playerId => gameState.pendingMoves[playerId] !== null
    );

    if (allPlayersReady) {
        resolveTurn();
    }
}

function resolveTurn() {
    const moves = Object.values(gameState.pendingMoves);

    moves.forEach(move => {
        const monster = gameState.monsters.find(
            currentMonster =>
                currentMonster.id === move.monsterId
        );

        if (!monster) return;

        monster.row = move.targetRow;
        monster.col = move.targetCol;
    });

    gameState.pendingMoves[1] = null;
    gameState.pendingMoves[2] = null;
    gameState.round++;

    console.log(`Round ${gameState.round - 1} completed`);

    renderMonsters();
}
