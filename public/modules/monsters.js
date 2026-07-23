function renderMonsters() {

    document.querySelectorAll(".square").forEach(square => {
        square.textContent = "";
        square.classList.remove("selected");
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

    });

}

function handleClick(row, col) {

    const monster = gameState.monsters.find(
        m => m.row === row && m.col === col
    );

    if (monster) {

        if (
            gameState.selectedMonster &&
            gameState.selectedMonster.id === monster.id
        ) {
            gameState.selectedMonster = null;
        } else {
            gameState.selectedMonster = monster;
        }

    } else {

        moveSelectedMonster(row, col);

    }

    renderMonsters();

}

function moveSelectedMonster(row, col) {

    if (!gameState.selectedMonster) return;

    gameState.selectedMonster.row = row;
    gameState.selectedMonster.col = col;

    gameState.selectedMonster = null;

}
