import { useEffect, useMemo, useState } from 'react'
import './App.css'

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = [8, 7, 6, 5, 4, 3, 2, 1]

const pieces = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙',
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟',
  },
}

const backRank = [
  'rook',
  'knight',
  'bishop',
  'queen',
  'king',
  'bishop',
  'knight',
  'rook',
]

function getPiece(fileIndex, rank) {
  if (rank === 8) {
    return {
      color: 'black',
      type: backRank[fileIndex],
      hasMoved: false,
    }
  }

  if (rank === 7) {
    return {
      color: 'black',
      type: 'pawn',
      hasMoved: false,
    }
  }

  if (rank === 2) {
    return {
      color: 'white',
      type: 'pawn',
      hasMoved: false,
    }
  }

  if (rank === 1) {
    return {
      color: 'white',
      type: backRank[fileIndex],
      hasMoved: false,
    }
  }

  return null
}

function createInitialBoard() {
  const board = {}

  ranks.forEach((rank) => {
    files.forEach((file, fileIndex) => {
      const piece = getPiece(fileIndex, rank)

      if (piece) {
        board[`${file}${rank}`] = piece
      }
    })
  })

  return board
}

function getSquare(fileIndex, rank) {
  if (
    fileIndex < 0 ||
    fileIndex >= 8 ||
    rank < 1 ||
    rank > 8
  ) {
    return null
  }

  return `${files[fileIndex]}${rank}`
}

function getCoordinates(square) {
  if (!square || square.length < 2) return null

  return {
    fileIndex: files.indexOf(square[0]),
    rank: Number(square.slice(1)),
  }
}

function getBoardPiece(board, square) {
  return square ? board[square] : null
}

function cloneBoard(board) {
  const nextBoard = {}

  Object.entries(board).forEach(([square, piece]) => {
    nextBoard[square] = { ...piece }
  })

  return nextBoard
}

/*
 * Returns squares attacked by a particular piece.
 *
 * Important:
 * This is intentionally different from normal legal moves.
 * For example, a pawn attacks diagonally even when there is no
 * piece on the target square.
 */
function getAttackedSquares(board, square, piece) {
  const coordinates = getCoordinates(square)

  if (!coordinates) return []

  const { fileIndex, rank } = coordinates
  const attacked = []

  const addSquare = (fileOffset, rankOffset) => {
    const target = getSquare(
      fileIndex + fileOffset,
      rank + rankOffset,
    )

    if (target) {
      attacked.push(target)
    }
  }

  if (piece.type === 'pawn') {
    const direction = piece.color === 'white' ? 1 : -1

    addSquare(-1, direction)
    addSquare(1, direction)

    return attacked
  }

  if (piece.type === 'knight') {
    const knightMoves = [
      [1, 2],
      [2, 1],
      [2, -1],
      [1, -2],
      [-1, -2],
      [-2, -1],
      [-2, 1],
      [-1, 2],
    ]

    knightMoves.forEach(([fileOffset, rankOffset]) => {
      addSquare(fileOffset, rankOffset)
    })

    return attacked
  }

  if (piece.type === 'king') {
    for (let fileOffset = -1; fileOffset <= 1; fileOffset += 1) {
      for (let rankOffset = -1; rankOffset <= 1; rankOffset += 1) {
        if (fileOffset === 0 && rankOffset === 0) continue

        addSquare(fileOffset, rankOffset)
      }
    }

    return attacked
  }

  const directions = []

  if (
    piece.type === 'bishop' ||
    piece.type === 'queen'
  ) {
    directions.push(
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    )
  }

  if (
    piece.type === 'rook' ||
    piece.type === 'queen'
  ) {
    directions.push(
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    )
  }

  directions.forEach(([fileOffset, rankOffset]) => {
    for (let distance = 1; distance < 8; distance += 1) {
      const target = getSquare(
        fileIndex + fileOffset * distance,
        rank + rankOffset * distance,
      )

      if (!target) break

      attacked.push(target)

      if (board[target]) {
        break
      }
    }
  })

  return attacked
}

function isSquareAttacked(board, square, byColor) {
  return Object.entries(board).some(([pieceSquare, piece]) => {
    if (piece.color !== byColor) return false

    return getAttackedSquares(
      board,
      pieceSquare,
      piece,
    ).includes(square)
  })
}

function findKing(board, color) {
  return Object.entries(board).find(
    ([, piece]) =>
      piece.color === color &&
      piece.type === 'king',
  )?.[0] || null
}

function isKingInCheck(board, color) {
  const kingSquare = findKing(board, color)

  if (!kingSquare) {
    return true
  }

  const opponent =
    color === 'white' ? 'black' : 'white'

  return isSquareAttacked(
    board,
    kingSquare,
    opponent,
  )
}

/*
 * Candidate moves are moves that obey the movement rules of
 * the piece. They are not necessarily legal chess moves yet.
 */
function getCandidateMoves(
  board,
  square,
  piece,
  enPassantTarget,
  includeCastling = true,
) {
  const coordinates = getCoordinates(square)

  if (!coordinates) return []

  const { fileIndex, rank } = coordinates
  const moves = []

  const addStep = (fileOffset, rankOffset) => {
    const target = getSquare(
      fileIndex + fileOffset,
      rank + rankOffset,
    )

    if (!target) return null

    return target
  }

  if (piece.type === 'pawn') {
    const direction =
      piece.color === 'white' ? 1 : -1

    const startingRank =
      piece.color === 'white' ? 2 : 7

    const promotionRank =
      piece.color === 'white' ? 8 : 1

    const oneStep = addStep(0, direction)

    if (
      oneStep &&
      !board[oneStep]
    ) {
      moves.push(oneStep)

      const twoStep = addStep(
        0,
        direction * 2,
      )

      if (
        rank === startingRank &&
        twoStep &&
        !board[twoStep]
      ) {
        moves.push(twoStep)
      }
    }

    ;[-1, 1].forEach((fileOffset) => {
      const captureSquare = addStep(
        fileOffset,
        direction,
      )

      if (!captureSquare) return

      const target = board[captureSquare]

      if (
        target &&
        target.color !== piece.color &&
        target.type !== 'king'
      ) {
        moves.push(captureSquare)
      }

      /*
       * En passant.
       */
      if (
        !target &&
        enPassantTarget === captureSquare
      ) {
        moves.push(captureSquare)
      }
    })

    /*
     * promotionRank is intentionally referenced so the
     * movement code remains explicit about promotion.
     */
    void promotionRank
  }

  if (piece.type === 'knight') {
    const knightMoves = [
      [1, 2],
      [2, 1],
      [2, -1],
      [1, -2],
      [-1, -2],
      [-2, -1],
      [-2, 1],
      [-1, 2],
    ]

    knightMoves.forEach(([fileOffset, rankOffset]) => {
      const targetSquare = addStep(
        fileOffset,
        rankOffset,
      )

      if (!targetSquare) return

      const target = board[targetSquare]

      if (
        !target ||
        (
          target.color !== piece.color &&
          target.type !== 'king'
        )
      ) {
        moves.push(targetSquare)
      }
    })
  }

  if (
    piece.type === 'bishop' ||
    piece.type === 'rook' ||
    piece.type === 'queen'
  ) {
    const directions = []

    if (
      piece.type === 'bishop' ||
      piece.type === 'queen'
    ) {
      directions.push(
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      )
    }

    if (
      piece.type === 'rook' ||
      piece.type === 'queen'
    ) {
      directions.push(
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      )
    }

    directions.forEach(([fileOffset, rankOffset]) => {
      for (
        let distance = 1;
        distance < 8;
        distance += 1
      ) {
        const targetSquare = addStep(
          fileOffset * distance,
          rankOffset * distance,
        )

        if (!targetSquare) break

        const target = board[targetSquare]

        if (!target) {
          moves.push(targetSquare)
          continue
        }

        if (
          target.color !== piece.color &&
          target.type !== 'king'
        ) {
          moves.push(targetSquare)
        }

        break
      }
    })
  }

  if (piece.type === 'king') {
    for (
      let fileOffset = -1;
      fileOffset <= 1;
      fileOffset += 1
    ) {
      for (
        let rankOffset = -1;
        rankOffset <= 1;
        rankOffset += 1
      ) {
        if (
          fileOffset === 0 &&
          rankOffset === 0
        ) {
          continue
        }

        const targetSquare = addStep(
          fileOffset,
          rankOffset,
        )

        if (!targetSquare) continue

        const target = board[targetSquare]

        if (
          !target ||
          (
            target.color !== piece.color &&
            target.type !== 'king'
          )
        ) {
          moves.push(targetSquare)
        }
      }
    }

    /*
     * Castling.
     *
     * The king cannot castle while in check.
     * It also cannot pass through or land on an attacked square.
     */
    if (
      includeCastling &&
      !piece.hasMoved &&
      !isKingInCheck(board, piece.color)
    ) {
      const opponent =
        piece.color === 'white'
          ? 'black'
          : 'white'

      const homeRank =
        piece.color === 'white' ? 1 : 8

      const kingHome =
        `e${homeRank}`

      if (square === kingHome) {
        // Kingside castle
        const rookSquare =
          `h${homeRank}`

        const rook =
          board[rookSquare]

        if (
          rook &&
          rook.type === 'rook' &&
          rook.color === piece.color &&
          !rook.hasMoved &&
          !board[`f${homeRank}`] &&
          !board[`g${homeRank}`] &&
          !isSquareAttacked(
            board,
            `f${homeRank}`,
            opponent,
          ) &&
          !isSquareAttacked(
            board,
            `g${homeRank}`,
            opponent,
          )
        ) {
          moves.push(`g${homeRank}`)
        }

        // Queenside castle
        const queenSideRook =
          board[`a${homeRank}`]

        if (
          queenSideRook &&
          queenSideRook.type === 'rook' &&
          queenSideRook.color === piece.color &&
          !queenSideRook.hasMoved &&
          !board[`b${homeRank}`] &&
          !board[`c${homeRank}`] &&
          !board[`d${homeRank}`] &&
          !isSquareAttacked(
            board,
            `d${homeRank}`,
            opponent,
          ) &&
          !isSquareAttacked(
            board,
            `c${homeRank}`,
            opponent,
          )
        ) {
          moves.push(`c${homeRank}`)
        }
      }
    }
  }

  return moves
}

/*
 * Applies a move to a copied board.
 *
 * This function does not decide whether the move is legal.
 * That is handled by getLegalMoves().
 */
function applyMove(
  board,
  from,
  to,
  enPassantTarget,
) {
  const nextBoard = cloneBoard(board)
  const movingPiece = nextBoard[from]

  if (!movingPiece) {
    return nextBoard
  }

  /*
   * En passant capture.
   */
  if (
    movingPiece.type === 'pawn' &&
    to === enPassantTarget &&
    !nextBoard[to]
  ) {
    const toCoordinates =
      getCoordinates(to)

    const capturedPawnRank =
      toCoordinates.rank +
      (movingPiece.color === 'white'
        ? -1
        : 1)

    const capturedPawnSquare =
      `${toCoordinates.fileIndex >= 0
        ? files[toCoordinates.fileIndex]
        : to[0]}${capturedPawnRank}`

    if (
      nextBoard[capturedPawnSquare]?.type ===
        'pawn' &&
      nextBoard[capturedPawnSquare]?.color !==
        movingPiece.color
    ) {
      delete nextBoard[capturedPawnSquare]
    }
  }

  /*
   * Move the piece.
   */
  delete nextBoard[from]

  nextBoard[to] = {
    ...movingPiece,
    hasMoved: true,
  }

  /*
   * Castling moves the rook as well.
   */
  if (
    movingPiece.type === 'king'
  ) {
    const fromCoordinates =
      getCoordinates(from)

    const toCoordinates =
      getCoordinates(to)

    if (
      fromCoordinates &&
      toCoordinates &&
      Math.abs(
        toCoordinates.fileIndex -
          fromCoordinates.fileIndex,
      ) === 2
    ) {
      const rank = fromCoordinates.rank

      if (toCoordinates.fileIndex === 6) {
        // Kingside
        const rookFrom = `h${rank}`
        const rookTo = `f${rank}`

        if (nextBoard[rookFrom]) {
          nextBoard[rookTo] = {
            ...nextBoard[rookFrom],
            hasMoved: true,
          }

          delete nextBoard[rookFrom]
        }
      }

      if (toCoordinates.fileIndex === 2) {
        // Queenside
        const rookFrom = `a${rank}`
        const rookTo = `d${rank}`

        if (nextBoard[rookFrom]) {
          nextBoard[rookTo] = {
            ...nextBoard[rookFrom],
            hasMoved: true,
          }

          delete nextBoard[rookFrom]
        }
      }
    }
  }

  /*
   * Pawn promotion.
   * Automatically promotes to queen.
   */
  if (
    movingPiece.type === 'pawn'
  ) {
    const promotionRank =
      movingPiece.color === 'white'
        ? 8
        : 1

    const toCoordinates =
      getCoordinates(to)

    if (
      toCoordinates?.rank === promotionRank
    ) {
      nextBoard[to] = {
        ...nextBoard[to],
        type: 'queen',
      }
    }
  }

  return nextBoard
}

/*
 * Filters candidate moves into actual legal chess moves.
 *
 * A move is illegal if, after making it, the player's king
 * is in check.
 */
function getLegalMoves(
  board,
  square,
  piece,
  enPassantTarget,
) {
  const candidateMoves =
    getCandidateMoves(
      board,
      square,
      piece,
      enPassantTarget,
      true,
    )

  return candidateMoves.filter((targetSquare) => {
    const nextBoard = applyMove(
      board,
      square,
      targetSquare,
      enPassantTarget,
    )

    return !isKingInCheck(
      nextBoard,
      piece.color,
    )
  })
}

function hasAnyLegalMoves(
  board,
  color,
  enPassantTarget,
) {
  return Object.entries(board).some(
    ([square, piece]) => {
      if (piece.color !== color) {
        return false
      }

      return (
        getLegalMoves(
          board,
          square,
          piece,
          enPassantTarget,
        ).length > 0
      )
    },
  )
}

function getNextEnPassantTarget(
  board,
  from,
  to,
  piece,
) {
  if (
    piece.type !== 'pawn'
  ) {
    return null
  }

  const fromCoordinates =
    getCoordinates(from)

  const toCoordinates =
    getCoordinates(to)

  if (!fromCoordinates || !toCoordinates) {
    return null
  }

  if (
    Math.abs(
      toCoordinates.rank -
        fromCoordinates.rank,
    ) !== 2
  ) {
    return null
  }

  const middleRank =
    (
      fromCoordinates.rank +
      toCoordinates.rank
    ) / 2

  return `${files[fromCoordinates.fileIndex]}${middleRank}`
}

function GameInfo({
  selectedSquare,
  selectedPiece,
  currentTurn,
  statusMessage,
  onClearSelection,
  gameOver,
  onRestart,
}) {
  return (
    <aside
      className="game-info"
      aria-label="Game information"
    >
      <span className="eyebrow">
        LOCAL MULTIPLAYER
      </span>

      <h2>Game information</h2>

      <div className="turn-card">
        <span
          className="turn-indicator"
          aria-hidden="true"
        />

        <div>
          <span className="turn-label">
            Current turn
          </span>

          <strong>
            {currentTurn === 'white'
              ? 'White to move'
              : 'Black to move'}
          </strong>
        </div>
      </div>

      <div
        className={`status-message ${statusMessage.type}`}
        role="status"
      >
        {statusMessage.text}
      </div>

      <div
        className={`selection-card ${
          selectedPiece ? 'active' : ''
        }`}
      >
        <span className="turn-label">
          Selected piece
        </span>

        {selectedPiece ? (
          <>
            <strong>
              {selectedPiece.color}{' '}
              {selectedPiece.type}
            </strong>

            <span className="selection-square">
              Located on {selectedSquare}
            </span>

            <button
              className="clear-selection"
              type="button"
              onClick={onClearSelection}
            >
              Clear selection
            </button>
          </>
        ) : (
          <span className="selection-empty">
            Choose one of your pieces on the
            board.
          </span>
        )}
      </div>

      <div className="game-note">
        <span
          className="note-icon"
          aria-hidden="true"
        >
          ♟
        </span>

        <p>
          The king may never remain in check.
          Checkmate ends the game.
        </p>
      </div>

      {gameOver && (
        <button
          className="restart-button"
          type="button"
          onClick={onRestart}
        >
          New game
        </button>
      )}
    </aside>
  )
}

function ChessBoard({
  board,
  selectedSquare,
  allowedSquares,
  checkedKingSquare,
  onSquareClick,
}) {
  return (
    <div className="board-shell">
      <div
        className="board"
        role="grid"
        aria-label="Chess board"
      >
        {ranks.flatMap((rank) =>
          files.map((file, fileIndex) => {
            const square =
              `${file}${rank}`

            const piece =
              board[square]

            const isLight =
              (fileIndex + rank) % 2 === 0

            const isSelected =
              selectedSquare === square

            const isAllowed =
              allowedSquares.includes(square)

            const isChecked =
              checkedKingSquare === square

            return (
              <button
                className={[
                  'square',
                  isLight
                    ? 'light'
                    : 'dark',
                  isSelected
                    ? 'selected'
                    : '',
                  isAllowed
                    ? 'allowed'
                    : '',
                  isChecked
                    ? 'in-check'
                    : '',
                ].join(' ')}
                key={square}
                type="button"
                role="gridcell"
                aria-label={`${square}${
                  piece
                    ? `, ${piece.color} ${piece.type}`
                    : ''
                }`}
                aria-pressed={isSelected}
                onClick={() =>
                  onSquareClick(square)
                }
              >
                {piece && (
                  <span
                    className={`piece ${piece.color}`}
                    aria-label={`${piece.color} ${piece.type}`}
                  >
                    {
                      pieces[
                        piece.color
                      ][piece.type]
                    }
                  </span>
                )}

                {isAllowed && (
                  <span
                    className="move-dot"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          }),
        )}
      </div>

      <div
        className="board-coordinates"
        aria-hidden="true"
      >
        {files.map((file) => (
          <span key={file}>{file}</span>
        ))}
      </div>
    </div>
  )
}

function App() {
  const [board, setBoard] = useState(
    createInitialBoard,
  )

  const [currentTurn, setCurrentTurn] =
    useState('white')

  const [selectedSquare, setSelectedSquare] =
    useState(null)

  const [allowedSquares, setAllowedSquares] =
    useState([])

  const [enPassantTarget, setEnPassantTarget] =
    useState(null)

  const [gameOver, setGameOver] =
    useState(false)

  const [statusMessage, setStatusMessage] =
    useState({
      type: 'info',
      text: 'Select one of your pieces to begin.',
    })

  const selectedPiece = selectedSquare
    ? board[selectedSquare]
    : null

  const checkedKingSquare = useMemo(() => {
    if (
      isKingInCheck(board, 'white')
    ) {
      return findKing(board, 'white')
    }

    if (
      isKingInCheck(board, 'black')
    ) {
      return findKing(board, 'black')
    }

    return null
  }, [board])

  useEffect(() => {
    const cancelSelection = (event) => {
      if (event.key === 'Escape') {
        setSelectedSquare(null)
        setAllowedSquares([])
      }
    }

    window.addEventListener(
      'keydown',
      cancelSelection,
    )

    return () =>
      window.removeEventListener(
        'keydown',
        cancelSelection,
      )
  }, [])

  const clearSelection = () => {
    setSelectedSquare(null)
    setAllowedSquares([])
  }

  const finishTurn = (
    nextBoard,
    movingPiece,
    from,
    to,
  ) => {
    const nextTurn =
      movingPiece.color === 'white'
        ? 'black'
        : 'white'

    const nextEnPassantTarget =
      getNextEnPassantTarget(
        board,
        from,
        to,
        movingPiece,
      )

    const opponentInCheck =
      isKingInCheck(
        nextBoard,
        nextTurn,
      )

    const opponentHasMoves =
      hasAnyLegalMoves(
        nextBoard,
        nextTurn,
        nextEnPassantTarget,
      )

    setBoard(nextBoard)
    setEnPassantTarget(
      nextEnPassantTarget,
    )
    setCurrentTurn(nextTurn)
    clearSelection()

    if (
      opponentInCheck &&
      !opponentHasMoves
    ) {
      setGameOver(true)

      setStatusMessage({
        type: 'success',
        text: `Checkmate! ${
          movingPiece.color === 'white'
            ? 'White'
            : 'Black'
        } wins.`,
      })

      return
    }

    if (
      !opponentInCheck &&
      !opponentHasMoves
    ) {
      setGameOver(true)

      setStatusMessage({
        type: 'success',
        text: 'Stalemate! The game is a draw.',
      })

      return
    }

    if (opponentInCheck) {
      setStatusMessage({
        type: 'error',
        text: `${
          nextTurn === 'white'
            ? 'White'
            : 'Black'
        } is in check.`,
      })

      return
    }

    setStatusMessage({
      type: 'success',
      text: `Valid move. ${
        nextTurn === 'white'
          ? 'White'
          : 'Black'
      }'s turn.`,
    })
  }

  const handleSquareClick = (square) => {
    if (gameOver) {
      return
    }

    /*
     * A legal destination was selected.
     */
    if (
      selectedSquare &&
      allowedSquares.includes(square)
    ) {
      const movingPiece =
        board[selectedSquare]

      if (!movingPiece) {
        clearSelection()
        return
      }

      const nextBoard = applyMove(
        board,
        selectedSquare,
        square,
        enPassantTarget,
      )

      finishTurn(
        nextBoard,
        movingPiece,
        selectedSquare,
        square,
      )

      return
    }

    /*
     * Clicking the selected piece cancels selection.
     */
    if (selectedSquare === square) {
      clearSelection()

      setStatusMessage({
        type: 'info',
        text: 'Selection cancelled.',
      })

      return
    }

    const piece = board[square]

    /*
     * Empty square without an active move.
     */
    if (!piece) {
      clearSelection()

      setStatusMessage({
        type: 'error',
        text: 'Choose one of your pieces.',
      })

      return
    }

    /*
     * Wrong player's piece.
     */
    if (piece.color !== currentTurn) {
      clearSelection()

      setStatusMessage({
        type: 'error',
        text: `Invalid move: it is ${
          currentTurn === 'white'
            ? 'White'
            : 'Black'
        }'s turn.`,
      })

      return
    }

    const legalMoves =
      getLegalMoves(
        board,
        square,
        piece,
        enPassantTarget,
      )

    /*
     * This should rarely happen, but it makes the UI
     * explicit when a piece is completely pinned.
     */
    if (legalMoves.length === 0) {
      setSelectedSquare(square)
      setAllowedSquares([])

      setStatusMessage({
        type: isKingInCheck(
          board,
          currentTurn,
        )
          ? 'error'
          : 'info',
        text: isKingInCheck(
          board,
          currentTurn,
        )
          ? 'Your king is in check. This piece has no legal move.'
          : `${piece.color} ${piece.type} has no legal moves.`,
      })

      return
    }

    setSelectedSquare(square)
    setAllowedSquares(legalMoves)

    setStatusMessage({
      type: 'info',
      text: `${piece.color} ${piece.type} selected. Choose a highlighted square.`,
    })
  }

  const restartGame = () => {
    setBoard(createInitialBoard())
    setCurrentTurn('white')
    setSelectedSquare(null)
    setAllowedSquares([])
    setEnPassantTarget(null)
    setGameOver(false)

    setStatusMessage({
      type: 'info',
      text: 'New game started. White to move.',
    })
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <span className="eyebrow">
            CHESS / TWO PLAYERS
          </span>

          <h1>Simple Chess</h1>

          <p className="subtitle">
            A focused board for a classic game.
          </p>
        </div>

        <div className="status-pill">
          <span />
          {gameOver
            ? 'Game over'
            : 'Game ready'}
        </div>
      </header>

      <div className="game-layout">
        <section
          className="board-panel"
          aria-labelledby="board-title"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                THE BOARD
              </span>

              <h2 id="board-title">
                Make your move
              </h2>
            </div>

            <span className="board-size">
              {selectedSquare
                ? 'Press Esc to cancel'
                : gameOver
                  ? 'Game over'
                  : `${currentTurn} to move`}
            </span>
          </div>

          <ChessBoard
            board={board}
            selectedSquare={
              selectedSquare
            }
            allowedSquares={
              allowedSquares
            }
            checkedKingSquare={
              checkedKingSquare
            }
            onSquareClick={
              handleSquareClick
            }
          />
        </section>

        <GameInfo
          selectedSquare={
            selectedSquare
          }
          selectedPiece={
            selectedPiece
          }
          currentTurn={currentTurn}
          statusMessage={
            statusMessage
          }
          onClearSelection={
            clearSelection
          }
          gameOver={gameOver}
          onRestart={restartGame}
        />
      </div>
    </main>
  )
}

export default App