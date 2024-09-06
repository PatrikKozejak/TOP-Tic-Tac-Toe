function Gameboard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;

  const putMark = (cell, player) => {
    console.log(`Marking cell with ${player}`);
    cell.addMark(player); // Mark the cell
  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );
    console.log(boardWithCellValues);
  };

  return { getBoard, printBoard, putMark };
}

function Cell() {
  let value = 0;

  const addMark = (player) => {
    console.log(`addMark called with player ${player}`);
    value = player;
  };

  const getValue = () => value;

  return { addMark, getValue };
}

function GameController(
  playerOneName = "Player One",
  playerTwoName = "Player Two"
) {
  const board = Gameboard();

  const players = [
    {
      name: playerOneName,
      mark: 1,
    },
    {
      name: playerTwoName,
      mark: 2,
    },
  ];

  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    board.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };

  const playRound = (cell) => {
    if (cell.getValue() === 0) {
      board.putMark(cell, getActivePlayer().mark);

      switchPlayerTurn();
      printNewRound();
    } else {
      console.log("Cell already occupied!");
    }
  };

  // Initial play game message
  printNewRound();

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    switchPlayerTurn,
    printNewRound,
  };
}

function ScreenController() {
  const game = GameController();
  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");

  const updateScreen = () => {
    boardDiv.textContent = "";

    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;
    board.forEach((row, rowIndex) => {
      row.forEach((cell, index) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        cellButton.dataset.row = rowIndex;
        cellButton.dataset.column = index;
        cellButton.textContent = cell.getValue();
        cellButton.addEventListener("click", clickHandlerBoard);
        boardDiv.appendChild(cellButton);
      });
    });
  };

  function clickHandlerBoard(e) {
    // Get coords of clicked Cell
    const selectedCell = [e.target.dataset.row, e.target.dataset.column];

    if (!selectedCell) return;
    game.playRound(game.getBoard()[selectedCell[0]][selectedCell[1]]);
    updateScreen();
  }
  // Initial render
  updateScreen();
}
ScreenController();
