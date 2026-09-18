import type { TaskItemProps } from "../types";

export function TaskItem({
  task,
  playerNum,
  isTurn,
  onToggle,
  disabled,
}: TaskItemProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 bg-white/[0.03] border border-[#2a2a4a] rounded-xl transition-all cursor-pointer animate-slide-in ${task.completed ? "opacity-50 border-[rgba(74,222,128,0.3)]" : ""} ${!isTurn ? "opacity-40 pointer-events-none" : ""}`}
    >
      <label className="task-checkbox relative w-[22px] h-[22px] flex-shrink-0 cursor-pointer">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() =>
            !task.completed &&
            isTurn &&
            !disabled &&
            onToggle(playerNum, task.id)
          }
          disabled={task.completed || !isTurn || disabled}
          className="hidden"
        />
        <span className="w-[22px] h-[22px] border-2 border-[#2a2a4a] rounded-[6px] flex items-center justify-center transition-all" />
      </label>
      <div className="flex-1 flex items-center gap-[10px] min-w-0">
        <span className="text-sm text-white whitespace-nowrap overflow-hidden text-overflow-ellipsis">
          {task.text}
        </span>
        <span className="text-[12px] font-bold text-[#f87171] bg-[rgba(248,113,113,0.15)] px-2 py-0.5 rounded-[6px] font-mono flex-shrink-0">
          ⚔ {task.damage} DMG
        </span>
      </div>
      {task.completed && (
        <span className="text-[11px] font-bold text-[#4ade80] bg-[rgba(74,222,128,0.15)] px-2 py-0.5 rounded-[6px] font-mono flex-shrink-0">
          DONE
        </span>
      )}
    </div>
  );
}
