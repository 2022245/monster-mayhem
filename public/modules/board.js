const board = document.getElementById("game-board");

function createBoard() {

    for (let row = 0; row < 10; row++) {

        gameState.board[row] = [];

        for (let col = 0; col < 10; col++) {

            gameState.board[row][col] = null;

            const square = document.createElement("div");

            square.classList.add("square");
            square.dataset.row = row;
            square.dataset.col = col;

            square.addEventListener("click", () => {
                handleClick(row, col);
            });

            board.appendChild(square);

        }

    }

}
