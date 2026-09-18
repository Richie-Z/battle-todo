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
      className={`player-panel ${playerNum === 2 ? "flipped" : ""} ${isTurn ? "active-turn" : ""} ${isWinner ? "winner" : ""}`}
      style={
        {
          "--player-color": player.color,
          "--player-glow": player.glow,
        } as React.CSSProperties
      }
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
                  background: getHpColor(player.hp, player.maxHp),
                }}
              />
            </div>
            <span className="hp-text">
              {player.hp} / {player.maxHp}
            </span>
          </div>
        </div>
      </div>

      <div className="player-instructions">
        <span>Type a task → press Enter → check the box to attack!</span>
      </div>

      <div className="effects-layer">
        {floaters.map((f) => (
          <Floater key={f.id} value={f.value} type={f.type} />
        ))}
      </div>

      <div className="task-input-area">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAddTask(playerNum)}
          placeholder={`Task for ${player.name}... (check box to attack!)`}
          className="task-input"
          disabled={isWinner}
        />
        <button
          type="button"
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
        className="heal-btn"
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
