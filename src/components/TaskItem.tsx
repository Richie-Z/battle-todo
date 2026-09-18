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
      className={`task-item ${task.completed ? "completed" : ""} ${!isTurn ? "not-turn" : ""}`}
    >
      <label className="task-checkbox">
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
        />
        <span className="checkmark" />
      </label>
      <div className="task-content">
        <span className="task-text">{task.text}</span>
        <span className="task-damage">⚔ {task.damage} DMG</span>
      </div>
      {task.completed && <span className="completed-badge">DONE</span>}
    </div>
  );
}
