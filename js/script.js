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
    if (cell.getValue() === 0) {
      console.log(`Marking cell with ${player}`);
      cell.addMark(player); // Mark the cell
    } else {
      console.log("Cell already occupied!");
    }
  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue)
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
    board.putMark(cell, getActivePlayer().mark);

    switchPlayerTurn();
    printNewRound();
  };

  const getBoard = () => board.getBoard(); // Expose the board to get cells
  // Initial play game message
  printNewRound();

  return { playRound, getActivePlayer, getBoard };
}

const game = GameController();
