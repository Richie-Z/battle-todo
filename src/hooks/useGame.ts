import { useCallback, useEffect, useRef, useState } from "react";
import type { BattleLogEntry, FloaterData, GameState, Task } from "../types";
import {
  FLOATER_CLEANUP_INTERVAL,
  FLOATER_LIFETIME,
  HP_GREEN,
  HP_RED,
  HP_YELLOW,
  initialState,
  SHAKE_DURATION,
  STORAGE_KEY,
} from "../utils/constants";
import { generateId, loadState, saveState } from "../utils/helpers";
import { playClick, playCrit, playHit } from "../utils/sound";

export function useGame() {
  const [state, setState] = useState<GameState>(() => {
    const loaded = loadState();
    return loaded
      ? {
          player1: loaded.player1,
          player2: loaded.player2,
          currentTurn: loaded.currentTurn,
          winner: loaded.winner,
          battleLog: loaded.battleLog,
        }
      : {
          player1: initialState.player1,
          player2: initialState.player2,
          currentTurn: 1,
          winner: null,
          battleLog: [],
        };
  });

  const [player1Name, setPlayer1Name] = useState<string>(
    () => loadState()?.player1Name || "Player 1",
  );
  const [player2Name, setPlayer2Name] = useState<string>(
    () => loadState()?.player2Name || "Player 2",
  );
  const [newTask1, setNewTask1] = useState<string>("");
  const [newTask2, setNewTask2] = useState<string>("");
  const [floaters, setFloaters] = useState<FloaterData[]>([]);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const floaterIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    saveState({
      player1: state.player1,
      player2: state.player2,
      currentTurn: state.currentTurn,
      winner: state.winner,
      battleLog: state.battleLog,
      player1Name,
      player2Name,
    });
  }, [state, player1Name, player2Name]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setFloaters((prev) =>
        prev.filter((f) => now - f.timestamp < FLOATER_LIFETIME),
      );
    }, FLOATER_CLEANUP_INTERVAL);
    floaterIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (state.winner && floaterIntervalRef.current) {
      clearInterval(floaterIntervalRef.current);
      floaterIntervalRef.current = undefined;
    }
  }, [state.winner]);

  const triggerShake = useCallback(() => {
    setScreenShake(true);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = setTimeout(
      () => setScreenShake(false),
      SHAKE_DURATION,
    );
  }, []);

  const addTask = useCallback(
    (playerNum: 1 | 2) => {
      const taskText = playerNum === 1 ? newTask1.trim() : newTask2.trim();
      if (!taskText) return;

      const newTask: Task = {
        id: generateId(),
        text: taskText,
        completed: false,
        damage: Math.floor(Math.random() * 11) + 10,
      };

      const playerKey = playerNum === 1 ? "player1" : "player2";
      setState((prev) => ({
        ...prev,
        [playerKey]: {
          ...prev[playerKey],
          tasks: [...prev[playerKey].tasks, newTask],
        },
      }));

      if (playerNum === 1) setNewTask1("");
      else setNewTask2("");
      playClick();
    },
    [newTask1, newTask2],
  );

  const toggleTask = useCallback(
    (playerNum: 1 | 2, taskId: string) => {
      let damage = 0;
      let opponentKey: "player1" | "player2";

      setState((prev) => {
        const playerKey = playerNum === 1 ? "player1" : "player2";
        opponentKey = playerNum === 1 ? "player2" : "player1";
        const player = prev[playerKey];
        const opponent = prev[opponentKey];

        const task = player.tasks.find((t) => t.id === taskId);
        if (!task || task.completed) return prev;

        const isPlayer1Turn = prev.currentTurn === 1;
        const isCorrectTurn =
          (playerNum === 1 && isPlayer1Turn) ||
          (playerNum === 2 && !isPlayer1Turn);
        if (!isCorrectTurn) return prev;

        damage = task.damage;
        const newOpponentHp = Math.max(0, opponent.hp - damage);
        const winner = newOpponentHp <= 0 ? playerNum : null;

        const newLog: BattleLogEntry[] = [
          ...prev.battleLog,
          {
            id: generateId(),
            text: `${player.name}'s "${task.text}" dealt ${damage} damage to ${opponent.name}!`,
            type: "damage",
            player: playerNum,
            timestamp: Date.now(),
          },
        ];

        return {
          ...prev,
          [playerKey]: {
            ...player,
            tasks: player.tasks.map((t) =>
              t.id === taskId ? { ...t, completed: true } : t,
            ),
          },
          [opponentKey]: { ...opponent, hp: newOpponentHp },
          currentTurn: playerNum === 1 ? 2 : 1,
          winner,
          battleLog: newLog,
        };
      });

      setFloaters((prev) => [
        ...prev,
        {
          id: generateId(),
          value: damage,
          targetPlayer: opponentKey,
          timestamp: Date.now(),
        },
      ]);
      if (damage >= 19) playCrit();
      else playHit();
      playClick();
      triggerShake();
    },
    [triggerShake],
  );

  const healPlayer = useCallback((playerNum: 1 | 2) => {
    let healAmount = 0;

    setState((prev) => {
      const playerKey = playerNum === 1 ? "player1" : "player2";
      const player = prev[playerKey];
      const isPlayer1Turn = prev.currentTurn === 1;
      const isCorrectTurn =
        (playerNum === 1 && isPlayer1Turn) ||
        (playerNum === 2 && !isPlayer1Turn);
      if (!isCorrectTurn) return prev;

      healAmount = Math.floor(Math.random() * 16) + 10;
      const newHp = Math.min(player.maxHp, player.hp + healAmount);

      const newLog: BattleLogEntry[] = [
        ...prev.battleLog,
        {
          id: generateId(),
          text: `${player.name} healed for ${healAmount} HP!`,
          type: "heal",
          player: playerNum,
          timestamp: Date.now(),
        },
      ];

      return {
        ...prev,
        [playerKey]: { ...player, hp: newHp },
        currentTurn: playerNum === 1 ? 2 : 1,
        battleLog: newLog,
      };
    });

    setFloaters((prev) => [
      ...prev,
      {
        id: generateId(),
        value: healAmount,
        targetPlayer: playerNum === 1 ? "player1" : "player2",
        type: "heal",
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const resetGame = useCallback(() => {
    const p1 = player1Name || "Player 1";
    const p2 = player2Name || "Player 2";
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    setState({
      ...initialState,
      player1: { ...initialState.player1, name: p1 },
      player2: { ...initialState.player2, name: p2 },
    });
    setFloaters([]);
    setScreenShake(false);
    localStorage.removeItem(STORAGE_KEY);
  }, [player1Name, player2Name]);

  const updateNames = useCallback(() => {
    setState((prev) => ({
      ...prev,
      player1: { ...prev.player1, name: player1Name },
      player2: { ...prev.player2, name: player2Name },
    }));
  }, [player1Name, player2Name]);

  const getHpColor = useCallback((hp: number, maxHp: number): string => {
    const ratio = hp / maxHp;
    if (ratio > 0.6) return HP_GREEN;
    if (ratio > 0.3) return HP_YELLOW;
    return HP_RED;
  }, []);

  const getHpWidth = useCallback((hp: number, maxHp: number): string => {
    return `${(hp / maxHp) * 100}%`;
  }, []);

  return {
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
    addTask,
    toggleTask,
    healPlayer,
    resetGame,
    updateNames,
    getHpColor,
    getHpWidth,
    setPlayer1Name,
    setPlayer2Name,
  };
}
