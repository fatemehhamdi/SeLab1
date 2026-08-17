import { useEffect, useState } from 'react'
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

const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']

function getPiece(fileIndex, rank) {
  if (rank === 8) return { color: 'black', type: backRank[fileIndex] }
  if (rank === 7) return { color: 'black', type: 'pawn' }
  if (rank === 2) return { color: 'white', type: 'pawn' }
  if (rank === 1) return { color: 'white', type: backRank[fileIndex] }
  return null
}

function getCandidateMoves(fileIndex, rank, piece, getBoardPiece) {
  const moves = []
  const addStep = (fileOffset, rankOffset) => {
    const nextFile = fileIndex + fileOffset
    const nextRank = rank + rankOffset
    if (nextFile < 0 || nextFile >= 8 || nextRank < 1 || nextRank > 8) return null
    return `${files[nextFile]}${nextRank}`
  }

  if (piece.type === 'pawn') {
    const direction = piece.color === 'white' ? 1 : -1
    const oneStep = addStep(0, direction)
    const twoStep = addStep(0, direction * 2)
    if (oneStep && !getBoardPiece(oneStep)) {
      moves.push(oneStep)
      const startingRank = piece.color === 'white' ? 2 : 7
      if (rank === startingRank && twoStep && !getBoardPiece(twoStep)) moves.push(twoStep)
    }
    ;[-1, 1].forEach((fileOffset) => {
      const captureSquare = addStep(fileOffset, direction)
      const target = captureSquare && getBoardPiece(captureSquare)
      if (target && target.color !== piece.color) moves.push(captureSquare)
    })
  } else if (piece.type === 'knight') {
    ;[
      [1, 2], [2, 1], [2, -1], [1, -2],
      [-1, -2], [-2, -1], [-2, 1], [-1, 2],
    ].forEach(([fileOffset, rankOffset]) => {
      const square = addStep(fileOffset, rankOffset)
      const target = square && getBoardPiece(square)
      if (square && (!target || target.color !== piece.color)) moves.push(square)
    })
  } else if (piece.type === 'bishop' || piece.type === 'rook' || piece.type === 'queen') {
    const directions = []
    if (piece.type === 'bishop' || piece.type === 'queen') {
      directions.push([1, 1], [1, -1], [-1, 1], [-1, -1])
    }
    if (piece.type === 'rook' || piece.type === 'queen') {
      directions.push([1, 0], [-1, 0], [0, 1], [0, -1])
    }
    directions.forEach(([fileOffset, rankOffset]) => {
      for (let distance = 1; distance < 8; distance += 1) {
        const square = addStep(fileOffset * distance, rankOffset * distance)
        if (!square) break
        const target = getBoardPiece(square)
        if (!target) {
          moves.push(square)
        } else {
          if (target.color !== piece.color) moves.push(square)
          break
        }
      }
    })
  } else if (piece.type === 'king') {
    for (let fileOffset = -1; fileOffset <= 1; fileOffset += 1) {
      for (let rankOffset = -1; rankOffset <= 1; rankOffset += 1) {
        if (!fileOffset && !rankOffset) continue
        const square = addStep(fileOffset, rankOffset)
        const target = square && getBoardPiece(square)
        if (square && (!target || target.color !== piece.color)) moves.push(square)
      }
    }
  }

  return moves
}

function GameInfo({ selectedSquare, selectedPiece, onClearSelection }) {
  return (
    <aside className="game-info" aria-label="Game information">
      <span className="eyebrow">LOCAL MULTIPLAYER</span>
      <h2>Game information</h2>
      <div className="turn-card">
        <span className="turn-indicator" aria-hidden="true" />
        <div>
          <span className="turn-label">Current turn</span>
          <strong>White to move</strong>
        </div>
      </div>
      <div className={`selection-card ${selectedPiece ? 'active' : ''}`}>
        <span className="turn-label">Selected piece</span>
        {selectedPiece ? (
          <>
            <strong>{selectedPiece.color} {selectedPiece.type}</strong>
            <span className="selection-square">Located on {selectedSquare}</span>
            <button className="clear-selection" type="button" onClick={onClearSelection}>
              Clear selection
            </button>
          </>
        ) : (
          <span className="selection-empty">Choose a white piece on the board.</span>
        )}
      </div>
      <div className="game-note">
        <span className="note-icon" aria-hidden="true">♟</span>
        <p>Take turns and capture your opponent&apos;s pieces to win.</p>
      </div>
    </aside>
  )
}

function ChessBoard({ selectedSquare, allowedSquares, onSquareClick }) {
  return (
    <div className="board-shell">
      <div className="board" role="grid" aria-label="Chess board">
        {ranks.flatMap((rank) =>
          files.map((file, fileIndex) => {
            const piece = getPiece(fileIndex, rank)
            const isLight = (fileIndex + rank) % 2 === 0
            const square = `${file}${rank}`
            const isSelected = selectedSquare === square
            const isAllowed = allowedSquares.includes(square)

            return (
              <button
                className={`square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''} ${isAllowed ? 'allowed' : ''}`}
                key={square}
                type="button"
                role="gridcell"
                aria-label={`${square}${piece ? `, ${piece.color} ${piece.type}` : ''}`}
                aria-pressed={isSelected}
                onClick={() => onSquareClick(square)}
              >
                {piece && (
                  <span className={`piece ${piece.color}`} aria-label={`${piece.color} ${piece.type}`}>
                    {pieces[piece.color][piece.type]}
                  </span>
                )}
                {isAllowed && <span className="move-dot" aria-hidden="true" />}
              </button>
            )
          }),
        )}
      </div>
      <div className="board-coordinates" aria-hidden="true">
        {files.map((file) => <span key={file}>{file}</span>)}
      </div>
    </div>
  )
}

function App() {
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [allowedSquares, setAllowedSquares] = useState([])

  useEffect(() => {
    const cancelSelection = (event) => {
      if (event.key === 'Escape') {
        setSelectedSquare(null)
        setAllowedSquares([])
      }
    }
    window.addEventListener('keydown', cancelSelection)
    return () => window.removeEventListener('keydown', cancelSelection)
  }, [])

  const getBoardPiece = (square) => getPiece(files.indexOf(square[0]), Number(square[1]))
  const clearSelection = () => {
    setSelectedSquare(null)
    setAllowedSquares([])
  }

  const handleSquareClickWithRules = (square) => {
    if (selectedSquare === square) {
      clearSelection()
      return
    }

    const fileIndex = files.indexOf(square[0])
    const rank = Number(square[1])
    const piece = getBoardPiece(square)

    if (!piece || piece.color !== 'white') {
      clearSelection()
      return
    }

    setSelectedSquare(square)
    setAllowedSquares(getCandidateMoves(fileIndex, rank, piece, getBoardPiece))
  }

  const selectedFileIndex = selectedSquare ? files.indexOf(selectedSquare[0]) : -1
  const selectedRank = selectedSquare ? Number(selectedSquare[1]) : 0
  const selectedPiece = selectedSquare ? getPiece(selectedFileIndex, selectedRank) : null

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <span className="eyebrow">CHESS / TWO PLAYERS</span>
          <h1>Simple Chess</h1>
          <p className="subtitle">A focused board for a classic game.</p>
        </div>
        <div className="status-pill"><span /> Game ready</div>
      </header>

      <div className="game-layout">
        <section className="board-panel" aria-labelledby="board-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE BOARD</span>
              <h2 id="board-title">Make your move</h2>
            </div>
            <span className="board-size">{selectedSquare ? 'Press Esc to cancel' : 'Select a piece'}</span>
          </div>
          <ChessBoard
            selectedSquare={selectedSquare}
            allowedSquares={allowedSquares}
            onSquareClick={handleSquareClickWithRules}
          />
        </section>
        <GameInfo
          selectedSquare={selectedSquare}
          selectedPiece={selectedPiece}
          onClearSelection={clearSelection}
        />
      </div>
    </main>
  )
}

export default App
