import type { GameState } from "../types";

export const STORAGE_KEY = "battle-todo-state";

export const PLAYER1_COLOR = "#ff6b6b";
export const PLAYER2_COLOR = "#4ecdc4";
export const PLAYER1_GLOW = "rgba(255, 107, 107, 0.5)";
export const PLAYER2_GLOW = "rgba(78, 205, 196, 0.5)";

export const initialState: GameState = {
  player1: {
    name: "Player 1",
    hp: 100,
    maxHp: 100,
    tasks: [],
    color: PLAYER1_COLOR,
    glow: PLAYER1_GLOW,
  },
  player2: {
    name: "Player 2",
    hp: 100,
    maxHp: 100,
    tasks: [],
    color: PLAYER2_COLOR,
    glow: PLAYER2_GLOW,
  },
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
