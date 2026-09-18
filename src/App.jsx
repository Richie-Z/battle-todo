import { useState, useEffect, useRef } from 'react'
import './App.css'

const STORAGE_KEY = 'battle-todo-state'

const initialState = {
  player1: { name: 'Player 1', hp: 100, maxHp: 100, tasks: [] },
  player2: { name: 'Player 2', hp: 100, maxHp: 100, tasks: [] },
  currentTurn: 1,
  winner: null,
  battleLog: [],
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function saveState(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        ...initialState,
        player1Name: parsed.player1Name || 'Player 1',
        player2Name: parsed.player2Name || 'Player 2',
        player1: { ...initialState.player1, ...parsed.player1, name: parsed.player1Name || 'Player 1' },
        player2: { ...initialState.player2, ...parsed.player2, name: parsed.player2Name || 'Player 2' },
        currentTurn: parsed.currentTurn,
        winner: parsed.winner,
        battleLog: parsed.battleLog || [],
      }
    }
  } catch {}
  return null
}

function App() {
  const [state, setState] = useState(() => loadState() || { ...initialState, player1Name: 'Player 1', player2Name: 'Player 2' })
  const [player1Name, setPlayer1Name] = useState(() => loadState()?.player1Name || 'Player 1')
  const [player2Name, setPlayer2Name] = useState(() => loadState()?.player2Name || 'Player 2')
  const [newTask1, setNewTask1] = useState('')
  const [newTask2, setNewTask2] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [floaters, setFloaters] = useState([])
  const [screenShake, setScreenShake] = useState(false)
  const logEndRef = useRef(null)
  const shakeTimerRef = useRef(null)

  useEffect(() => {
    saveState({ ...state, player1Name, player2Name })
  }, [state, player1Name, player2Name])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.battleLog])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setFloaters(prev => prev.filter(f => now - f.timestamp < 1200))
    }, 400)
    return () => clearInterval(interval)
  }, [])

  const triggerShake = () => {
    setScreenShake(true)
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current)
    shakeTimerRef.current = setTimeout(() => setScreenShake(false), 300)
  }

  const addTask = (playerNum) => {
    const taskText = playerNum === 1 ? newTask1.trim() : newTask2.trim()
    if (!taskText) return

    const newTask = {
      id: generateId(),
      text: taskText,
      completed: false,
      damage: Math.floor(Math.random() * 11) + 10,
    }

    const playerKey = playerNum === 1 ? 'player1' : 'player2'
    setState(prev => ({
      ...prev,
      [playerKey]: {
        ...prev[playerKey],
        tasks: [...prev[playerKey].tasks, newTask]
      }
    }))

    if (playerNum === 1) setNewTask1('')
    else setNewTask2('')
  }

  const toggleTask = (playerNum, taskId) => {
    let damage = 0
    setState(prev => {
      const playerKey = playerNum === 1 ? 'player1' : 'player2'
      const opponentKey = playerNum === 1 ? 'player2' : 'player1'
      const player = prev[playerKey]
      const opponent = prev[opponentKey]

      const task = player.tasks.find(t => t.id === taskId)
      if (!task || task.completed) return prev

      const isPlayer1Turn = prev.currentTurn === 1
      const isCorrectTurn = (playerNum === 1 && isPlayer1Turn) || (playerNum === 2 && !isPlayer1Turn)
      if (!isCorrectTurn) return prev

      damage = task.damage
      const newOpponentHp = Math.max(0, opponent.hp - damage)
      const winner = newOpponentHp <= 0 ? playerNum : null

      const newLog = [
        ...prev.battleLog,
        {
          id: generateId(),
          text: `${player.name}'s "${task.text}" dealt ${damage} damage to ${opponent.name}!`,
          type: 'damage',
          player: playerNum,
          timestamp: Date.now()
        }
      ]

      const opponentKeyFinal = opponentKey

      return {
        ...prev,
        [playerKey]: {
          ...player,
          tasks: player.tasks.map(t => t.id === taskId ? { ...t, completed: true } : t)
        },
        [opponentKeyFinal]: {
          ...opponent,
          hp: newOpponentHp
        },
        currentTurn: playerNum === 1 ? 2 : 1,
        winner,
        battleLog: newLog,
      }
    })

    const opponentKey = playerNum === 1 ? 'player2' : 'player1'
    setFloaters(prev => [...prev, {
      id: generateId(),
      value: damage,
      targetPlayer: opponentKey,
      timestamp: Date.now()
    }])
    triggerShake()
  }

  const healPlayer = (playerNum) => {
    let healAmount = 0
    setState(prev => {
      const playerKey = playerNum === 1 ? 'player1' : 'player2'
      const player = prev[playerKey]
      const isPlayer1Turn = prev.currentTurn === 1
      const isCorrectTurn = (playerNum === 1 && isPlayer1Turn) || (playerNum === 2 && !isPlayer1Turn)
      if (!isCorrectTurn) return prev

      healAmount = Math.floor(Math.random() * 16) + 10
      const newHp = Math.min(player.maxHp, player.hp + healAmount)

      const newLog = [
        ...prev.battleLog,
        {
          id: generateId(),
          text: `${player.name} healed for ${healAmount} HP!`,
          type: 'heal',
          player: playerNum,
          timestamp: Date.now()
        }
      ]

      return {
        ...prev,
        [playerKey]: { ...player, hp: newHp },
        currentTurn: playerNum === 1 ? 2 : 1,
        battleLog: newLog
      }
    })

    setFloaters(prev => [...prev, {
      id: generateId(),
      value: healAmount,
      targetPlayer: playerNum === 1 ? 'player1' : 'player2',
      type: 'heal',
      timestamp: Date.now()
    }])
  }

  const resetGame = () => {
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current)
    setState({
      ...initialState,
      player1: { ...initialState.player1, name: player1Name },
      player2: { ...initialState.player2, name: player2Name }
    })
    setFloaters([])
    setScreenShake(false)
    localStorage.removeItem(STORAGE_KEY)
  }

  const updateNames = () => {
    setState(prev => ({
      ...prev,
      player1: { ...prev.player1, name: player1Name },
      player2: { ...prev.player2, name: player2Name }
    }))
  }

  const getHpColor = (hp, maxHp) => {
    const ratio = hp / maxHp
    if (ratio > 0.6) return 'var(--hp-green)'
    if (ratio > 0.3) return 'var(--hp-yellow)'
    return 'var(--hp-red)'
  }

  const getHpWidth = (hp, maxHp) => `${(hp / maxHp) * 100}%`

  return (
    <div className={`app ${screenShake ? 'shake' : ''}`}>
      <div className="bg-effects">
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <div className="bg-grid" />
      </div>

      <header className="header">
        <h1 className="title">BATTLE TODO</h1>
        <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
          ⚙
        </button>
      </header>

      {showSettings && (
        <div className="settings-panel" onClick={() => setShowSettings(false)}>
          <div className="settings-content" onClick={e => e.stopPropagation()}>
            <h2>Settings</h2>
            <div className="setting-group">
              <label>Player 1 Name</label>
              <input
                value={player1Name}
                onChange={e => setPlayer1Name(e.target.value)}
                placeholder="Player 1"
              />
            </div>
            <div className="setting-group">
              <label>Player 2 Name</label>
              <input
                value={player2Name}
                onChange={e => setPlayer2Name(e.target.value)}
                placeholder="Player 2"
              />
            </div>
            <button className="apply-btn" onClick={updateNames}>Apply Names</button>
            <button className="reset-btn" onClick={resetGame}>Reset Game</button>
          </div>
        </div>
      )}

      <main className="battle-arena">
        <BattleSide
          player={state.player1}
          opponent={state.player2}
          playerNum={1}
          isTurn={state.currentTurn === 1}
          isWinner={state.winner === 1}
          newTask={newTask1}
          setNewTask={setNewTask1}
          onAddTask={addTask}
          onToggleTask={toggleTask}
          onHeal={healPlayer}
          getHpColor={getHpColor}
          getHpWidth={getHpWidth}
          floaters={floaters.filter(f => f.targetPlayer === 'player1')}
        />

        <div className="vs-divider">
          <div className="vs-text">VS</div>
          <div className="turn-indicator">
            Turn: {state.currentTurn === 1 ? state.player1.name : state.player2.name}
          </div>
        </div>

        <BattleSide
          player={state.player2}
          opponent={state.player1}
          playerNum={2}
          isTurn={state.currentTurn === 2}
          isWinner={state.winner === 2}
          newTask={newTask2}
          setNewTask={setNewTask2}
          onAddTask={addTask}
          onToggleTask={toggleTask}
          onHeal={healPlayer}
          getHpColor={getHpColor}
          getHpWidth={getHpWidth}
          floaters={floaters.filter(f => f.targetPlayer === 'player2')}
        />
      </main>

      {state.winner && (
        <div className="victory-overlay" onClick={resetGame}>
          <div className="victory-content" onClick={e => e.stopPropagation()}>
            <h2 className="victory-title">VICTORY!</h2>
            <p className="winner-name">
              {state.winner === 1 ? state.player1.name : state.player2.name} Wins!
            </p>
            <button className="play-again-btn" onClick={resetGame}>Play Again</button>
          </div>
        </div>
      )}

      <aside className="battle-log">
        <h3>Battle Log</h3>
        <div className="log-content">
          {state.battleLog.length === 0 && (
            <p className="empty-log">No actions yet. Complete tasks to attack!</p>
          )}
          {state.battleLog.slice().reverse().map(entry => (
            <div key={entry.id} className={`log-entry ${entry.type}`}>
              <span className="log-time">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
              <span className="log-text">{entry.text}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </aside>
    </div>
  )
}

function BattleSide({
  player,
  _opponent,
  playerNum,
  isTurn,
  isWinner,
  newTask,
  setNewTask,
  onAddTask,
  onToggleTask,
  onHeal,
  getHpColor,
  getHpWidth,
  floaters
}) {
const hasPendingTasks = player.tasks.some(t => !t.completed)

  return (
    <div
      className={`player-panel ${playerNum === 2 ? 'flipped' : ''} ${isTurn ? 'active-turn' : ''} ${isWinner ? 'winner' : ''}`}
      style={{
        '--player-color': player.color,
        '--player-glow': player.glow
      }}
    >
      <div className="player-header">
        <div className="player-avatar" style={{ background: player.color }}>
          {player.name.charAt(0)}
        </div>
        <div className="player-info">
          <h2 className="player-name">{player.name}</h2>
          <div className="hp-bar-container">
            <div className="hp-bar-bg">
              <div
                className="hp-bar-fill"
                style={{
                  width: getHpWidth(player.hp, player.maxHp),
                  background: getHpColor(player.hp, player.maxHp)
                }}
              />
            </div>
            <span className="hp-text">{player.hp} / {player.maxHp}</span>
          </div>
        </div>
      </div>

      <div className="player-instructions">
        <span>Type a task → press Enter → check the box to attack!</span>
      </div>

      <div className="effects-layer">
        {floaters.map(f => (
          <Floater key={f.id} value={f.value} type={f.type} />
        ))}
      </div>

      <div className="task-input-area">
        <input
          type="text"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onAddTask(playerNum)}
          placeholder={`Task for ${player.name}... (check box to attack!)`}
          className="task-input"
          disabled={isWinner}
        />
        <button
          className="add-task-btn"
          onClick={() => onAddTask(playerNum)}
          disabled={!newTask.trim() || isWinner}
          title="Add task and deal damage on check"
        >
          ⚔
        </button>
      </div>

      <div className="tasks-container">
        {player.tasks.length === 0 ? (
          <p className="empty-tasks">No tasks yet. Add one above!</p>
        ) : (
          player.tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              playerNum={playerNum}
              isTurn={isTurn}
              onToggle={onToggleTask}
              disabled={isWinner}
            />
          ))
        )}
      </div>

      <button
        className="heal-btn"
        onClick={() => onHeal(playerNum)}
        disabled={!isTurn || isWinner || hasPendingTasks}
      >
        {!isTurn ? 'Wait...' : isWinner ? 'Game Over' : hasPendingTasks ? `Complete ${player.tasks.filter(t => !t.completed).length} task(s) first` : '💚 Heal (End Turn)'}
      </button>
    </div>
  )
}
function Floater({ value, type }) {
  const [offset] = useState(() => Math.random() * 120 + 20)
  return (
    <div className={type === 'heal' ? 'heal-number' : 'damage-number'} style={{ left: offset }}>
      {type === 'heal' ? '+' : '-'}{value}
    </div>
  )
}

function TaskItem({ task, playerNum, isTurn, onToggle, disabled }) {
  return (
    <div className={`task-item ${task.completed ? 'completed' : ''} ${!isTurn ? 'not-turn' : ''}`}>
      <label className="task-checkbox">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => !task.completed && isTurn && !disabled && onToggle(playerNum, task.id)}
          disabled={task.completed || !isTurn || disabled}
        />
        <span className="checkmark" />
      </label>
      <div className="task-content">
        <span className="task-text">{task.text}</span>
        <span className="task-damage">⚔ {task.damage} DMG</span>
      </div>
      {task.completed && <span className="completed-badge">DONE</span>}
    </div>
  )
}

export default App