import React, { useState, useEffect, useRef } from 'react'

const GRID_COLS = 20
const GRID_ROWS = 14

const COMMAND_LIST = [
  'help',
  'snake',
  'tictactoe',
  'spaceinvaders',
  'matrix',
  'neofetch',
  'whoami',
  'skills',
  'projects',
  'contact',
  'date',
  'quote',
  'banner',
  'sudo',
  'clear',
]

const QUOTES = [
  '"The best way to predict the future is to invent it." — Alan Kay',
  '"First, solve the problem. Then, write the code." — John Johnson',
  '"Artificial intelligence is the new electricity." — Andrew Ng',
  '"Simplicity is prerequisite for reliability." — Edsger W. Dijkstra',
  '"Talk is cheap. Show me the code." — Linus Torvalds',
]

export default function TerminalConsole({ profile }) {
  // Tabs: 'cli' | 'snake' | 'tictactoe' | 'space' | 'matrix'
  const [activeTab, setActiveTab] = useState('cli')

  // CLI state
  const [history, setHistory] = useState([
    { type: 'system', text: 'Tanish Developer Console v3.0.0 (x86_64-emerald-rose)' },
    { type: 'system', text: 'Type "help", "neofetch", or select a game tab (Snake, Tic-Tac-Toe, Space Invaders).' },
  ])
  const [inputVal, setInputVal] = useState('')
  const [userCmdsHistory, setUserCmdsHistory] = useState([])
  const [historyPointer, setHistoryPointer] = useState(-1)

  const terminalEndRef = useRef(null)
  const inputRef = useRef(null)

  // Snake Game State
  const [snake, setSnake] = useState([[6, 6], [5, 6], [4, 6]])
  const [food, setFood] = useState([12, 8])
  const [direction, setDirection] = useState('RIGHT')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('tanish_snake_highscore') || '0', 10)
    } catch {
      return 0
    }
  })
  const [isSnakeRunning, setIsSnakeRunning] = useState(false)
  const [isSnakeOver, setIsSnakeOver] = useState(false)

  // Tic-Tac-Toe State
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winnerInfo, setWinnerInfo] = useState(null)

  // Space Invaders State
  const spaceCanvasRef = useRef(null)
  const [spaceScore, setSpaceScore] = useState(0)
  const [isSpaceOver, setIsSpaceOver] = useState(false)

  // Matrix canvas ref
  const matrixCanvasRef = useRef(null)

  // Auto scroll CLI
  useEffect(() => {
    if (activeTab === 'cli') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [history, activeTab])

  // CLI Keydown for Auto-Complete & Up/Down Command History
  function handleCliKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      if (!inputVal.trim()) return
      const matches = COMMAND_LIST.filter((cmd) => cmd.startsWith(inputVal.trim().toLowerCase()))
      if (matches.length === 1) {
        setInputVal(matches[0])
      } else if (matches.length > 1) {
        setHistory((prev) => [
          ...prev,
          { type: 'user', text: `$ ${inputVal}` },
          { type: 'output', text: `Suggestions: ${matches.join('  ')}` },
        ])
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (userCmdsHistory.length === 0) return
      const nextPtr = historyPointer < userCmdsHistory.length - 1 ? historyPointer + 1 : historyPointer
      setHistoryPointer(nextPtr)
      setInputVal(userCmdsHistory[userCmdsHistory.length - 1 - nextPtr] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyPointer > 0) {
        const nextPtr = historyPointer - 1
        setHistoryPointer(nextPtr)
        setInputVal(userCmdsHistory[userCmdsHistory.length - 1 - nextPtr] || '')
      } else if (historyPointer === 0) {
        setHistoryPointer(-1)
        setInputVal('')
      }
    }
  }

  // Snake Game Loop
  useEffect(() => {
    if (activeTab !== 'snake' || !isSnakeRunning || isSnakeOver) return

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0]
        let newHead = [head[0], head[1]]

        if (direction === 'UP') newHead[1] -= 1
        if (direction === 'DOWN') newHead[1] += 1
        if (direction === 'LEFT') newHead[0] -= 1
        if (direction === 'RIGHT') newHead[0] += 1

        // Wall collision check
        if (
          newHead[0] < 0 ||
          newHead[0] >= GRID_COLS ||
          newHead[1] < 0 ||
          newHead[1] >= GRID_ROWS
        ) {
          setIsSnakeOver(true)
          setIsSnakeRunning(false)
          return prevSnake
        }

        // Self collision check
        for (let segment of prevSnake) {
          if (segment[0] === newHead[0] && segment[1] === newHead[1]) {
            setIsSnakeOver(true)
            setIsSnakeRunning(false)
            return prevSnake
          }
        }

        const newSnake = [newHead, ...prevSnake]

        // Check food collision
        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          setScore((prev) => {
            const nextScore = prev + 10
            if (nextScore > highScore) {
              setHighScore(nextScore)
              try {
                localStorage.setItem('tanish_snake_highscore', nextScore.toString())
              } catch {}
            }
            return nextScore
          })
          spawnFood(newSnake)
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, 110)

    return () => clearInterval(interval)
  }, [activeTab, isSnakeRunning, isSnakeOver, direction, food, highScore])

  // Key listeners for Snake
  useEffect(() => {
    function handleKeyDown(e) {
      if (activeTab !== 'snake') return

      if (['ArrowUp', 'KeyW'].includes(e.code) && direction !== 'DOWN') {
        setDirection('UP')
        e.preventDefault()
      } else if (['ArrowDown', 'KeyS'].includes(e.code) && direction !== 'UP') {
        setDirection('DOWN')
        e.preventDefault()
      } else if (['ArrowLeft', 'KeyA'].includes(e.code) && direction !== 'RIGHT') {
        setDirection('LEFT')
        e.preventDefault()
      } else if (['ArrowRight', 'KeyD'].includes(e.code) && direction !== 'LEFT') {
        setDirection('RIGHT')
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, direction])

  function spawnFood(currentSnake) {
    let newPos
    while (true) {
      const rx = Math.floor(Math.random() * GRID_COLS)
      const ry = Math.floor(Math.random() * GRID_ROWS)
      const collides = currentSnake.some(([x, y]) => x === rx && y === ry)
      if (!collides) {
        newPos = [rx, ry]
        break
      }
    }
    setFood(newPos)
  }

  function startSnake() {
    setSnake([[6, 6], [5, 6], [4, 6]])
    setDirection('RIGHT')
    setScore(0)
    setIsSnakeOver(false)
    setIsSnakeRunning(true)
    spawnFood([[6, 6], [5, 6], [4, 6]])
  }

  // Tic-Tac-Toe AI Move
  useEffect(() => {
    if (activeTab !== 'tictactoe' || isXNext || winnerInfo) return

    const timer = setTimeout(() => {
      const emptyIndices = board
        .map((val, idx) => (val === null ? idx : null))
        .filter((val) => val !== null)

      if (emptyIndices.length > 0) {
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
        const newBoard = [...board]
        newBoard[randomIndex] = 'O'
        setBoard(newBoard)
        checkTTTWinner(newBoard)
        setIsXNext(true)
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [activeTab, isXNext, board, winnerInfo])

  function handleTTTClick(index) {
    if (board[index] || !isXNext || winnerInfo) return

    const newBoard = [...board]
    newBoard[index] = 'X'
    setBoard(newBoard)
    const hasWinner = checkTTTWinner(newBoard)
    if (!hasWinner) {
      setIsXNext(false)
    }
  }

  function checkTTTWinner(b) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]

    for (let [a, bIdx, c] of lines) {
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        setWinnerInfo(b[a])
        return true
      }
    }

    if (b.every((cell) => cell !== null)) {
      setWinnerInfo('Draw')
      return true
    }

    return false
  }

  function resetTTT() {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setWinnerInfo(null)
  }

  // Space Invaders Game Loop
  useEffect(() => {
    if (activeTab !== 'space') return

    const canvas = spaceCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.parentElement.clientWidth || 600
    canvas.height = 320

    let ship = { x: canvas.width / 2 - 15, y: canvas.height - 30, w: 30, h: 14, speed: 6 }
    let bullets = []
    let aliens = []
    let alienSpeed = 1.2
    let alienDir = 1
    let localScore = 0
    let keys = {}
    let animationFrameId

    // Spawn aliens
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        aliens.push({
          x: 40 + c * 50,
          y: 30 + r * 35,
          w: 26,
          h: 18,
          alive: true,
        })
      }
    }

    function onKeyDown(e) {
      keys[e.code] = true
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        bullets.push({ x: ship.x + ship.w / 2 - 2, y: ship.y, w: 4, h: 10, speed: 7 })
        e.preventDefault()
      }
    }

    function onKeyUp(e) {
      keys[e.code] = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    function update() {
      // Ship movement
      if ((keys['ArrowLeft'] || keys['KeyA']) && ship.x > 0) {
        ship.x -= ship.speed
      }
      if ((keys['ArrowRight'] || keys['KeyD']) && ship.x < canvas.width - ship.w) {
        ship.x += ship.speed
      }

      // Update bullets
      for (let b of bullets) {
        b.y -= b.speed
      }
      bullets = bullets.filter((b) => b.y > -10)

      // Update aliens movement
      let edgeReached = false
      for (let a of aliens) {
        if (!a.alive) continue
        a.x += alienSpeed * alienDir
        if (a.x <= 10 || a.x + a.w >= canvas.width - 10) {
          edgeReached = true
        }
      }

      if (edgeReached) {
        alienDir *= -1
        for (let a of aliens) {
          if (a.alive) a.y += 12
        }
      }

      // Bullet-Alien Collision
      for (let b of bullets) {
        for (let a of aliens) {
          if (
            a.alive &&
            b.x < a.x + a.w &&
            b.x + b.w > a.x &&
            b.y < a.y + a.h &&
            b.y + b.h > a.y
          ) {
            a.alive = false
            b.y = -100
            localScore += 20
            setSpaceScore(localScore)
          }
        }
      }

      // Alien-Bottom Collision
      for (let a of aliens) {
        if (a.alive && a.y + a.h >= ship.y) {
          setIsSpaceOver(true)
        }
      }

      // Draw frame
      ctx.fillStyle = '#06120e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw Ship
      ctx.fillStyle = '#FFB7C5'
      ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
      ctx.fillRect(ship.x + ship.w / 2 - 3, ship.y - 6, 6, 6)

      // Draw Bullets
      ctx.fillStyle = '#C5A3FF'
      for (let b of bullets) {
        ctx.fillRect(b.x, b.y, b.w, b.h)
      }

      // Draw Aliens
      for (let a of aliens) {
        if (a.alive) {
          ctx.fillStyle = '#42d19b'
          ctx.fillRect(a.x, a.y, a.w, a.h)
        }
      }

      animationFrameId = requestAnimationFrame(update)
    }

    animationFrameId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [activeTab])

  // Matrix Rain Canvas Animation
  useEffect(() => {
    if (activeTab !== 'matrix') return
    const canvas = matrixCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = (canvas.width = canvas.parentElement.clientWidth)
    let height = (canvas.height = canvas.parentElement.clientHeight)

    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*+='
    const fontSize = 14
    const columns = Math.floor(width / fontSize)
    const drops = Array(columns).fill(1)

    function draw() {
      ctx.fillStyle = 'rgba(9, 26, 20, 0.15)'
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = '#42d19b'
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 40)
    return () => clearInterval(interval)
  }, [activeTab])

  // CLI Command Handling
  function handleCommandSubmit(e) {
    e.preventDefault()
    const raw = inputVal.trim()
    if (!raw) return

    setUserCmdsHistory((prev) => [...prev, raw])
    setHistoryPointer(-1)

    const cmd = raw.toLowerCase()
    const nextHistory = [...history, { type: 'user', text: `$ ${raw}` }]

    switch (cmd) {
      case 'help':
      case 'commands':
      case 'man':
        nextHistory.push({
          type: 'output',
          text: `Tanish CLI v3.0.0 Manual:
  snake          - Launch retro Snake Game
  tictactoe      - Launch Tic-Tac-Toe vs AI
  spaceinvaders  - Launch 2D Space Shooter arcade game
  matrix         - Trigger Matrix Rain Animation
  neofetch       - Display system & profile summary
  whoami         - Print candidate bio
  skills         - List technical proficiencies
  projects       - Output featured projects
  contact        - Display contact information
  date           - Show current real-time clock
  quote          - Print random developer quote
  banner         - Render ASCII brand banner
  sudo           - Request superuser permissions
  clear          - Clear console output`,
        })
        break

      case 'neofetch':
      case 'fetch':
        nextHistory.push({
          type: 'output',
          text: `
  .------------------------.    N. Tanish @ Developer-Console
  |   N. Tanish Profile    |    -----------------------------
  |  AI & ML Software Eng  |    OS: Emerald-Rose Kernel v6.8.0
  '------------------------'    Uptime: 99.9% uptime
  Degree: B.Tech CSE (AI & ML) @ Vel Tech University
  Languages: Java, Python, JavaScript, SQL, PHP
  AI Stack: Gemini API, Scikit-learn, NLTK, Pandas, Agentic AI
  Web Stack: React, FastAPI, REST APIs, Node.js, MySQL
  Certifications: Cisco AI, Anthropic Claude, AWS AI, Deloitte`,
        })
        break

      case 'banner':
        nextHistory.push({
          type: 'output',
          text: `
  _____ ___   _  _ ___ ___ _  _ 
 |_   _/_\ \ / \| / __/ _ | || |
   | |/ _ \ V  /| \__ \ _ | __ |
   |_/_/ \_\_/ |_||___/___|_||_|
  Software Engineer | Generative & Agentic AI Specialist`,
        })
        break

      case 'date':
        nextHistory.push({
          type: 'output',
          text: `Current System Time: ${new Date().toLocaleString()}`,
        })
        break

      case 'quote':
        const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)]
        nextHistory.push({
          type: 'output',
          text: randomQuote,
        })
        break

      case 'sudo':
      case 'sudo rm -rf /':
        nextHistory.push({
          type: 'output',
          text: `[sudo] password for visitor: \nAccess Denied: Nice try, hacker! 😉 Your IP has been logged.`,
        })
        break

      case 'snake':
      case 'play snake':
        setActiveTab('snake')
        startSnake()
        nextHistory.push({ type: 'output', text: 'Launching Retro Snake Game...' })
        break

      case 'tictactoe':
      case 'play tictactoe':
        setActiveTab('tictactoe')
        resetTTT()
        nextHistory.push({ type: 'output', text: 'Launching Tic-Tac-Toe vs AI...' })
        break

      case 'spaceinvaders':
      case 'space':
      case 'shooter':
        setActiveTab('space')
        setIsSpaceOver(false)
        setSpaceScore(0)
        nextHistory.push({ type: 'output', text: 'Launching Space Invaders Shooter...' })
        break

      case 'matrix':
        setActiveTab('matrix')
        nextHistory.push({ type: 'output', text: 'Entering Matrix Rain mode...' })
        break

      case 'whoami':
        nextHistory.push({
          type: 'output',
          text: `N. Tanish — B.Tech Computer Science (AI & ML) @ Vel Tech University.\nBuilding Generative & Agentic AI systems, REST APIs, and full-stack web applications.`,
        })
        break

      case 'skills':
        nextHistory.push({
          type: 'output',
          text: `Languages: Java, Python, JavaScript, SQL, PHP\nAI & ML: Gemini API, Scikit-learn, NLTK, NumPy, Pandas, Prompt Engineering\nWeb/Backend: React, Node.js, FastAPI, REST APIs, MySQL, Docker`,
        })
        break

      case 'projects':
        nextHistory.push({
          type: 'output',
          text: `1. PhishHunter AI — AI-Powered Phishing Detection Extension & API\n2. CivicVoice     — Geolocation Infrastructure Issue Platform\n3. Axis           — Voice-Driven AI Chrome Browser Agent`,
        })
        break

      case 'contact':
        nextHistory.push({
          type: 'output',
          text: `Email: Tanish8012@gmail.com | Phone: +91 8817068898 | Location: Chennai, India\nGitHub: github.com/vtu27125-Tanish`,
        })
        break

      case 'clear':
        setHistory([])
        setInputVal('')
        return

      default:
        nextHistory.push({
          type: 'output',
          text: `Command not found: "${raw}". Type "help" or press Tab for auto-completion.`,
        })
        break
    }

    setHistory(nextHistory)
    setInputVal('')
  }

  return (
    <section className="terminal-section">
      <div className="terminal-container">
        {/* Terminal Header Bar */}
        <div className="terminal-header">
          <div className="terminal-window-controls">
            <span className="terminal-dot terminal-dot--red" />
            <span className="terminal-dot terminal-dot--yellow" />
            <span className="terminal-dot terminal-dot--green" />
          </div>

          <div className="terminal-tabs">
            <button
              type="button"
              className={`terminal-tab ${activeTab === 'cli' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('cli')}
            >
              💻 CLI Terminal
            </button>
            <button
              type="button"
              className={`terminal-tab ${activeTab === 'snake' ? 'is-active' : ''}`}
              onClick={() => {
                setActiveTab('snake')
                if (!isSnakeRunning && !isSnakeOver) startSnake()
              }}
            >
              🐍 Snake Game
            </button>
            <button
              type="button"
              className={`terminal-tab ${activeTab === 'tictactoe' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('tictactoe')}
            >
              ❌⭕ Tic-Tac-Toe
            </button>
            <button
              type="button"
              className={`terminal-tab ${activeTab === 'space' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('space')}
            >
              🚀 Space Shooter
            </button>
            <button
              type="button"
              className={`terminal-tab ${activeTab === 'matrix' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('matrix')}
            >
              🟢 Matrix Rain
            </button>
          </div>
        </div>

        {/* Tab 1: Interactive CLI Terminal */}
        {activeTab === 'cli' && (
          <div className="terminal-body" onClick={() => inputRef.current?.focus()}>
            <div className="terminal-output">
              {history.map((item, index) => (
                <div key={index} className={`terminal-line terminal-line--${item.type}`}>
                  <pre>{item.text}</pre>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            <form onSubmit={handleCommandSubmit} className="terminal-input-row">
              <span className="terminal-prompt">tanish@dev:~$</span>
              <input
                ref={inputRef}
                type="text"
                className="terminal-input"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleCliKeyDown}
                placeholder="Type 'help', 'neofetch', 'snake' (Tab to autocomplete, ▲/▼ history)..."
                autoFocus
              />
            </form>
          </div>
        )}

        {/* Tab 2: Playable Retro Snake Game */}
        {activeTab === 'snake' && (
          <div className="terminal-game-wrapper">
            <div className="game-status-bar">
              <span>Score: <strong>{score}</strong></span>
              <span>High Score: <strong>{highScore}</strong></span>
              <button type="button" className="game-btn" onClick={startSnake}>
                {isSnakeOver ? '🔁 Play Again' : '🎮 Restart'}
              </button>
            </div>

            <div className="snake-grid">
              {Array.from({ length: GRID_ROWS }).map((_, r) => (
                <div key={r} className="snake-row">
                  {Array.from({ length: GRID_COLS }).map((_, c) => {
                    const isHead = snake[0][0] === c && snake[0][1] === r
                    const isBody = snake.some(([sx, sy], idx) => idx > 0 && sx === c && sy === r)
                    const isFoodCell = food[0] === c && food[1] === r

                    return (
                      <div
                        key={c}
                        className={`snake-cell ${isHead ? 'is-head' : ''} ${
                          isBody ? 'is-body' : ''
                        } ${isFoodCell ? 'is-food' : ''}`}
                      />
                    )
                  })}
                </div>
              ))}

              {isSnakeOver && (
                <div className="game-overlay">
                  <h4>Game Over!</h4>
                  <p>Final Score: {score}</p>
                  <button type="button" className="btn-primary" onClick={startSnake}>
                    Play Again
                  </button>
                </div>
              )}
            </div>

            {/* Mobile / Onscreen D-Pad Controls */}
            <div className="dpad-controls">
              <div className="dpad-row">
                <button type="button" onClick={() => direction !== 'DOWN' && setDirection('UP')}>
                  ▲
                </button>
              </div>
              <div className="dpad-row">
                <button type="button" onClick={() => direction !== 'RIGHT' && setDirection('LEFT')}>
                  ◀
                </button>
                <button type="button" onClick={() => direction !== 'UP' && setDirection('DOWN')}>
                  ▼
                </button>
                <button type="button" onClick={() => direction !== 'LEFT' && setDirection('RIGHT')}>
                  ►
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Tic-Tac-Toe Game */}
        {activeTab === 'tictactoe' && (
          <div className="terminal-game-wrapper">
            <div className="game-status-bar">
              <span>
                {winnerInfo
                  ? winnerInfo === 'Draw'
                    ? "🤝 It's a Draw!"
                    : `🎉 Winner: ${winnerInfo}!`
                  : `Turn: ${isXNext ? 'Your Turn (X)' : 'AI Turn (O)...'}`}
              </span>
              <button type="button" className="game-btn" onClick={resetTTT}>
                🔁 Reset Board
              </button>
            </div>

            <div className="ttt-grid">
              {board.map((cell, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`ttt-cell ${cell ? `ttt-cell--${cell.toLowerCase()}` : ''}`}
                  onClick={() => handleTTTClick(idx)}
                >
                  {cell}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: 2D Arcade Space Shooter */}
        {activeTab === 'space' && (
          <div className="matrix-canvas-wrapper">
            <div className="game-status-bar" style={{ padding: '8px 16px' }}>
              <span>Score: <strong>{spaceScore}</strong></span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Controls: A/D or ◀/► to move, Space/▲ to shoot</span>
            </div>
            <canvas ref={spaceCanvasRef} className="matrix-canvas" />
            {isSpaceOver && (
              <div className="game-overlay">
                <h4>Invasion Reached Earth!</h4>
                <p>Score: {spaceScore}</p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setIsSpaceOver(false)
                    setSpaceScore(0)
                  }}
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Matrix Digital Rain */}
        {activeTab === 'matrix' && (
          <div className="matrix-canvas-wrapper">
            <canvas ref={matrixCanvasRef} className="matrix-canvas" />
            <div className="matrix-overlay-text">System Core Active — Matrix Mode</div>
          </div>
        )}
      </div>
    </section>
  )
}
