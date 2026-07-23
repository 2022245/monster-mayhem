function renderMonsters() {
    document.querySelectorAll(".square").forEach(square => {
        square.textContent = "";
        square.classList.remove("selected");
        square.classList.remove("pending");
        square.classList.remove("placement");
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

    highlightPlacementSquares();
}

function handleClick(row, col) {
    if (gameState.placementPlayer !== null) {
        placeNewMonster(row, col);
        renderMonsters();
        return;
    }

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

    resolveBattles();

    gameState.pendingMoves[1] = null;
    gameState.pendingMoves[2] = null;
    gameState.round++;

    console.log(`Round ${gameState.round - 1} completed`);

    renderMonsters();
}

function resolveBattles() {
    const positions = {};

    gameState.monsters.forEach(monster => {
        const key = `${monster.row},${monster.col}`;

        if (!positions[key]) {
            positions[key] = [];
        }

        positions[key].push(monster);
    });

    Object.values(positions).forEach(monstersOnSquare => {
        if (monstersOnSquare.length === 2) {
            resolveBattle(
                monstersOnSquare[0],
                monstersOnSquare[1]
            );
        }
    });
}

function resolveBattle(monsterA, monsterB) {
    if (monsterA.type === monsterB.type) {
        removeMonster(monsterA.id);
        removeMonster(monsterB.id);

        startPlacement(monsterA.player);
        return;
    }

    if (beats(monsterA.type, monsterB.type)) {
        removeMonster(monsterB.id);
        startPlacement(monsterB.player);
    } else {
        removeMonster(monsterA.id);
        startPlacement(monsterA.player);
    }
}

function beats(typeA, typeB) {
    return (
        (typeA === "vampire" && typeB === "werewolf") ||
        (typeA === "werewolf" && typeB === "ghost") ||
        (typeA === "ghost" && typeB === "vampire")
    );
}

function removeMonster(monsterId) {
    gameState.monsters = gameState.monsters.filter(
        monster => monster.id !== monsterId
    );
}

function startPlacement(playerId) {
    gameState.placementPlayer = playerId;

    alert(
        `Player ${playerId} lost a monster. Choose a square on your starting row.`
    );
}

function highlightPlacementSquares() {
    const playerId = gameState.placementPlayer;

    if (playerId === null) return;

    const placementRow = playerId === 1 ? 0 : 9;

    document
        .querySelectorAll(`[data-row="${placementRow}"]`)
        .forEach(square => {
            const row = Number(square.dataset.row);
            const col = Number(square.dataset.col);

            if (!findMonsterAt(row, col)) {
                square.classList.add("placement");
            }
        });
}

function placeNewMonster(row, col) {
    const playerId = gameState.placementPlayer;

    if (playerId === null) return;

    const requiredRow = playerId === 1 ? 0 : 9;

    if (row !== requiredRow) {
        alert("Choose a square on your starting row");
        return;
    }

    if (findMonsterAt(row, col)) {
        alert("That square is occupied");
        return;
    }

    const chosenType = prompt(
        "Choose a monster: vampire, werewolf or ghost"
    );

    const validTypes = [
        "vampire",
        "werewolf",
        "ghost"
    ];

    const monsterType = chosenType
        ? chosenType.toLowerCase().trim()
        : "";

    if (!validTypes.includes(monsterType)) {
        alert("Invalid monster type");
        return;
    }

    gameState.monsters.push({
        id: Date.now(),
        type: monsterType,
        player: playerId,
        row,
        col
    });

    gameState.placementPlayer = null;

    console.log(
        `Player ${playerId} placed a new ${monsterType}`
    );

    renderMonsters();
}
