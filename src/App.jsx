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

function GameInfo() {
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
      <div className="game-note">
        <span className="note-icon" aria-hidden="true">♟</span>
        <p>Take turns and capture your opponent&apos;s pieces to win.</p>
      </div>
    </aside>
  )
}

function ChessBoard() {
  return (
    <div className="board-shell">
      <div className="board" role="grid" aria-label="Chess board">
        {ranks.flatMap((rank) =>
          files.map((file, fileIndex) => {
            const piece = getPiece(fileIndex, rank)
            const isLight = (fileIndex + rank) % 2 === 0
            const square = `${file}${rank}`

            return (
              <div
                className={`square ${isLight ? 'light' : 'dark'}`}
                key={square}
                role="gridcell"
                aria-label={`${square}${piece ? `, ${piece.color} ${piece.type}` : ''}`}
              >
                {piece && (
                  <span className={`piece ${piece.color}`} aria-label={`${piece.color} ${piece.type}`}>
                    {pieces[piece.color][piece.type]}
                  </span>
                )}
              </div>
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
            <span className="board-size">8 × 8</span>
          </div>
          <ChessBoard />
        </section>
        <GameInfo />
      </div>
    </main>
  )
}

export default App
