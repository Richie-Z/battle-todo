import { Check, Swords } from "lucide-react";
import type { TaskItemProps } from "../types";

export function TaskItem({
  task,
  playerNum,
  isTurn,
  onToggle,
  disabled,
}: TaskItemProps) {
  const actionable = !task.completed && isTurn && !disabled;

  const strike = () => {
    if (actionable) onToggle(playerNum, task.id);
  };

  return (
    <div
      onClick={strike}
      className={`group relative flex items-center gap-3 p-3 rounded-xl border-2 bg-black/40 animate-slide-in overflow-hidden ${
        task.completed
          ? "border-[rgba(74,222,128,0.4)] opacity-60"
          : actionable
            ? "border-[var(--player-color)] cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_6px_20px_var(--player-glow)]"
            : "border-[#2a2a4a] opacity-50"
      } transition-all duration-150`}
    >
      {/* Strike button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          strike();
        }}
        disabled={!actionable}
        title={task.completed ? "Already struck" : "Strike to attack!"}
        className={`w-10 h-10 flex-shrink-0 rounded-lg border-2 text-lg font-black flex items-center justify-center transition-all ${
          task.completed
            ? "border-[#4ade80] bg-[#4ade80]/20 text-[#4ade80]"
            : actionable
              ? "border-[var(--player-color)] bg-[var(--player-color)]/15 text-white group-hover:scale-110 group-hover:shadow-[0_0_14px_var(--player-glow)]"
              : "border-[#2a2a4a] bg-white/5 text-[#8a8aa0]"
        } disabled:cursor-not-allowed`}
      >
        {task.completed ? (
          <Check className="w-6 h-6" />
        ) : (
          <Swords className="w-6 h-6" />
        )}
      </button>

      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span
          className={`text-sm font-semibold truncate ${
            task.completed ? "line-through text-[#8a8aa0]" : "text-white"
          }`}
        >
          {task.text}
        </span>
      </div>

      {/* Power badge */}
      <span className="text-[12px] font-black italic text-[#fecaca] bg-gradient-to-b from-[#ef4444]/40 to-[#7f1d1d]/40 border border-[#ef4444]/50 px-2 py-1 rounded-lg font-mono flex-shrink-0 shadow-[0_2px_0_rgba(0,0,0,0.5)]">
        <Swords className="w-3.5 h-3.5 inline mr-1" />
        {task.damage}
      </span>

      {task.completed ? (
        <span className="text-[10px] font-black tracking-wider text-[#4ade80] bg-[#4ade80]/15 border border-[#4ade80]/40 px-2 py-1 rounded-lg flex-shrink-0">
          <Check className="w-3 h-3 inline mr-0.5" /> HIT
        </span>
      ) : (
        actionable && (
          <span className="text-[10px] font-black tracking-wider text-[var(--player-color)] bg-white/5 border border-[var(--player-color)]/50 px-2 py-1 rounded-lg flex-shrink-0 animate-pulse-glow">
            <Swords className="w-3 h-3 inline mr-0.5" /> READY
          </span>
        )
      )}
    </div>
  );
}
