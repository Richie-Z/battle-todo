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
    <div
      className={`relative w-full min-h-screen bg-[#0d0d1a] overflow-hidden flex flex-col ${screenShake ? "animate-shake" : ""}`}
    >
      <div className="absolute inset-0">
        <div className="absolute rounded-full blur-[80px] opacity-15 w-[400px] h-[400px] bg-[#ff6b6b] top-[-100px] left-[-100px] animate-float" />
        <div className="absolute rounded-full blur-[80px] opacity-15 w-[350px] h-[350px] bg-[#4ecdc4] bottom-[-80px] right-[-80px] animate-float" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          }}
        />
      </div>

      <header className="relative z-10 flex items-center justify-between p-5 border-b border-[#2a2a4a] bg-[#0d0d1a]/80 backdrop-blur-xl">
        <h1 className="text-3xl font-bold tracking-[-1px] bg-gradient-to-r from-[#ff6b6b] to-[#4ecdc4] bg-clip-text text-transparent">
          BATTLE TODO
        </h1>
        <button
          type="button"
          className="bg-[#16162a] border border-[#2a2a4a] text-[#e0e0e8] w-10 h-10 rounded-xl text-lg cursor-pointer transition-all duration-400 hover:bg-[#2a2a4a] hover:rotate-45"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙
        </button>
      </header>

      {showSettings && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-[#16162a] border border-[#2a2a4a] rounded-2xl p-10 min-w-[400px] max-w-[90vw] flex flex-col gap-5 animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Settings</h2>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#8a8aa0] uppercase tracking-[1px]">
                Player 1 Name
              </label>
              <input
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Player 1"
                className="bg-white/5 border border-[#2a2a4a] rounded-xl p-3 text-white text-sm outline-none transition-all focus:border-[#ff6b6b]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#8a8aa0] uppercase tracking-[1px]">
                Player 2 Name
              </label>
              <input
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Player 2"
                className="bg-white/5 border border-[#2a2a4a] rounded-xl p-3 text-white text-sm outline-none transition-all focus:border-[#ff6b6b]"
              />
            </div>
            <button
              type="button"
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#ff6b6b] to-[#ff8a5c] border-none cursor-pointer transition-all hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(255,107,107,0.4)]"
              onClick={updateNames}
            >
              Apply Names
            </button>
            <button
              type="button"
              className="px-6 py-3 rounded-xl text-sm font-semibold text-[#8a8aa0] bg-transparent border border-[#2a2a4a] cursor-pointer transition-all hover:border-[#ff6b6b] hover:text-[#ff6b6b]"
              onClick={resetGame}
            >
              Reset Game
            </button>
          </div>
        </div>
      )}

      <main className="relative z-5 flex flex-1 gap-[30px] p-[30px] items-start justify-center">
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

        <div className="flex flex-col items-center justify-center gap-4 p-[20px_10px] min-w-[100px]">
          <div className="text-3xl font-black bg-gradient-to-r from-[#ff6b6b] to-[#4ecdc4] bg-clip-text text-transparent animate-pulse-glow">
            VS
          </div>
          <div className="text-[12px] font-semibold text-[#8a8aa0] bg-[#16162a] px-3 py-1.5 rounded-[8px] border border-[#2a2a4a] text-center font-mono animate-pulse-glow">
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[8px] animate-fade-in"
          onClick={resetGame}
        >
          <div
            className="text-center animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-6xl font-black bg-gradient-to-r from-[#fbbf24] to-orange-500 bg-clip-text text-transparent mb-4">
              VICTORY!
            </h2>
            <p className="text-[28px] text-white font-semibold mb-8">
              {state.winner === 1 ? state.player1.name : state.player2.name}{" "}
              Wins!
            </p>
            <button
              type="button"
              className="px-[56px] py-[14px] rounded-[14px] border-none bg-gradient-to-r from-[#ff6b6b] to-[#4ecdc4] text-white text-[18px] font-bold cursor-pointer transition-all hover:-translate-y-[2px] hover:shadow-[0_8px_30px_rgba(168,85,247,0.4)]"
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      <aside className="relative z-10 border-t border-[#2a2a4a] bg-[#16162a] p-[16px_40px] max-h-[200px] flex flex-col">
        <h3 className="text-[14px] font-bold text-[#8a8aa0] uppercase tracking-[2px] mb-3">
          Battle Log
        </h3>
        <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
          {state.battleLog.length === 0 && (
            <p className="text-[#8a8aa0] text-[13px] italic text-center py-[20px]">
              No actions yet. Complete tasks to attack!
            </p>
          )}
          {state.battleLog
            .slice()
            .reverse()
            .map((entry) => (
              <div
                key={entry.id}
                className={`flex gap-3 p-1.5 rounded-[8px] text-[13px] bg-white/[0.02] border-l-[3px] ${entry.type === "damage" ? "border-[#f87171]" : "border-[#4ade80]"}`}
              >
                <span className="text-[#8a8aa0] font-mono text-[11px] flex-shrink-0">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-[#e0e0e8]">{entry.text}</span>
              </div>
            ))}
          <div ref={logEndRef} />
        </div>
      </aside>
    </div>
  );
}
