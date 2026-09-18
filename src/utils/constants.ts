export const STORAGE_KEY = "battle-todo-state";

export const initialState = {
  player1: { name: "Player 1", hp: 100, maxHp: 100, tasks: [] },
  player2: { name: "Player 2", hp: 100, maxHp: 100, tasks: [] },
  currentTurn: 1,
  winner: null,
  battleLog: [],
};

export const HP_GREEN = "var(--hp-green)";
export const HP_YELLOW = "var(--hp-yellow)";
export const HP_RED = "var(--hp-red)";

export const FLOATER_LIFETIME = 1200;
export const FLOATER_CLEANUP_INTERVAL = 400;
export const SHAKE_DURATION = 300;
