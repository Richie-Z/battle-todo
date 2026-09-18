import { BattleSide } from "./components/BattleSide";
import { useGame } from "./hooks/useGame";

export default function App() {
  const {
    state,
    player1Name,
    player2Name,
    newTask1,
    setNewTask1,
    newTask2,
    setNewTask2,
    floaters,
    screenShake,
    showSettings,
    setShowSettings,
    logEndRef,
    addTask,
    toggleTask,
    healPlayer,
    resetGame,
    updateNames,
    getHpColor,
    getHpWidth,
    setPlayer1Name,
    setPlayer2Name,
  } = useGame();

  return (
    <div className={`app ${screenShake ? "shake" : ""}`}>
      <div className="bg-effects">
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <div className="bg-grid" />
      </div>

      <header className="header">
        <h1 className="title">BATTLE TODO</h1>
        <button
          type="button"
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙
        </button>
      </header>

      {showSettings && (
        <div className="settings-panel" onClick={() => setShowSettings(false)}>
          <div
            className="settings-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Settings</h2>
            <div className="setting-group">
              <label>Player 1 Name</label>
              <input
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Player 1"
              />
            </div>
            <div className="setting-group">
              <label>Player 2 Name</label>
              <input
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Player 2"
              />
            </div>
            <button type="button" className="apply-btn" onClick={updateNames}>
              Apply Names
            </button>
            <button type="button" className="reset-btn" onClick={resetGame}>
              Reset Game
            </button>
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
          floaters={floaters.filter((f) => f.targetPlayer === "player1")}
        />

        <div className="vs-divider">
          <div className="vs-text">VS</div>
          <div className="turn-indicator">
            Turn:{" "}
            {state.currentTurn === 1 ? state.player1.name : state.player2.name}
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
          floaters={floaters.filter((f) => f.targetPlayer === "player2")}
        />
      </main>

      {state.winner && (
        <div className="victory-overlay" onClick={resetGame}>
          <div className="victory-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="victory-title">VICTORY!</h2>
            <p className="winner-name">
              {state.winner === 1 ? state.player1.name : state.player2.name}{" "}
              Wins!
            </p>
            <button
              type="button"
              className="play-again-btn"
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      <aside className="battle-log">
        <h3>Battle Log</h3>
        <div className="log-content">
          {state.battleLog.length === 0 && (
            <p className="empty-log">
              No actions yet. Complete tasks to attack!
            </p>
          )}
          {state.battleLog
            .slice()
            .reverse()
            .map((entry) => (
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
  );
}
