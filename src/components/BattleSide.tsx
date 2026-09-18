import type { BattleSideProps } from "../types";
import { Floater } from "./Floater";
import { TaskItem } from "./TaskItem";

export function BattleSide({
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
  floaters,
}: BattleSideProps) {
  const hasPendingTasks = player.tasks.some((t) => !t.completed);

  return (
    <div
      className={`player-panel relative w-[45%] bg-[#16162a] border border-[#2a2a4a] rounded-2xl p-6 transition-all overflow-hidden ${playerNum === 2 ? "border-l-[3px]" : ""} ${isTurn ? "border-[var(--player-color)] shadow-[0_0_30px_var(--player-glow),inset_0_0_30px_rgba(0,0,0,0.2)]" : ""} ${isWinner ? "border-[#fbbf24] shadow-[0_0_40px_rgba(251,191,36,0.4)] animate-winner-celebrate" : ""}`}
      style={
        {
          "--player-color": player.color,
          "--player-glow": player.glow,
        } as React.CSSProperties
      }
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--player-color)] to-transparent opacity-0 transition-opacity duration-300" />

      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
          style={{ background: player.color }}
        >
          {player.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">{player.name}</h2>
          <div className="flex flex-col gap-1.5">
            <div className="w-full h-3 bg-white/8 rounded-3xl overflow-hidden relative">
              <div
                className="h-full rounded-3xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  width: getHpWidth(player.hp, player.maxHp),
                  background: getHpColor(player.hp, player.maxHp),
                }}
              />
            </div>
            <span className="text-xs font-semibold text-[#8a8aa0] font-mono">
              {player.hp} / {player.maxHp}
            </span>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-[#8a8aa0] text-center py-1.5 bg-white/[0.03] rounded-lg mb-3 font-normal italic tracking-[0.3px]">
        <span>Type a task → press Enter → check the box to attack!</span>
      </div>

      <div className="absolute top-[80px] left-0 right-0 bottom-[200px] pointer-events-none overflow-hidden">
        {floaters.map((f) => (
          <Floater key={f.id} value={f.value} type={f.type} />
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAddTask(playerNum)}
          placeholder={`Task for ${player.name}... (check box to attack!)`}
          className="flex-1 bg-white/[0.08] border border-[rgba(255,255,255,0.15)] rounded-xl p-3 text-white text-sm outline-none transition-all"
          disabled={isWinner}
        />
        <button
          type="button"
          className="w-11 h-11 rounded-xl border border-[var(--player-color)] bg-white/[0.05] text-[var(--player-color)] text-[22px] font-bold cursor-pointer transition-all hover:bg-[var(--player-color)] hover:text-[#0d0d1a] hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={() => onAddTask(playerNum)}
          disabled={!newTask.trim() || isWinner}
          title="Add task and deal damage on check"
        >
          ⚔
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
        {player.tasks.length === 0 ? (
          <p className="text-[#8a8aa0] text-sm text-center py-[30px] italic">
            No tasks yet. Add one above!
          </p>
        ) : (
          player.tasks.map((task) => (
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
        type="button"
        className="w-full mt-4 py-3 rounded-xl border border-[#4ade80] bg-[rgba(74,222,128,0.1)] text-[#4ade80] text-sm font-bold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[rgba(74,222,128,0.25)] hover:-translate-y-[1px] hover:shadow-[0_4px_15px_rgba(74,222,128,0.2)]"
        onClick={() => onHeal(playerNum)}
        disabled={!isTurn || isWinner || hasPendingTasks}
      >
        {!isTurn
          ? "Wait..."
          : isWinner
            ? "Game Over"
            : hasPendingTasks
              ? `Complete ${player.tasks.filter((t) => !t.completed).length} task(s) first`
              : "💚 Heal (End Turn)"}
      </button>
    </div>
  );
}
