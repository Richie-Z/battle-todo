import type { GameData, Player } from "../types";
import { initialState, STORAGE_KEY } from "./constants";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function saveState(data: GameData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function loadState(): GameData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...initialState,
        player1Name: parsed.player1Name || "Player 1",
        player2Name: parsed.player2Name || "Player 2",
        player1: {
          ...initialState.player1,
          ...parsed.player1,
          name: parsed.player1Name || "Player 1",
        },
        player2: {
          ...initialState.player2,
          ...parsed.player2,
          name: parsed.player2Name || "Player 2",
        },
        currentTurn: parsed.currentTurn,
        winner: parsed.winner,
        battleLog: parsed.battleLog || [],
      };
    }
  } catch {}
  return null;
}

export function createPlayer(
  name: string,
  color: string,
  glow: string,
): Player {
  return {
    name,
    hp: 100,
    maxHp: 100,
    tasks: [],
    color,
    glow,
  };
}
