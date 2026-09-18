export interface Player {
  name: string;
  hp: number;
  maxHp: number;
  tasks: Task[];
  color: string;
  glow: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  damage: number;
}

export interface BattleLogEntry {
  id: string;
  text: string;
  type: "damage" | "heal";
  player: number;
  timestamp: number;
}

export interface FloaterData {
  id: string;
  value: number;
  targetPlayer: string;
  type?: "heal";
  timestamp: number;
}

export interface GameState {
  player1: Player;
  player2: Player;
  currentTurn: 1 | 2;
  winner: number | null;
  battleLog: BattleLogEntry[];
}

export interface GameData {
  player1Name: string;
  player2Name: string;
  player1: Player;
  player2: Player;
  currentTurn: 1 | 2;
  winner: number | null;
  battleLog: BattleLogEntry[];
}

export interface FloaterProps {
  value: number;
  type?: string;
  index?: number;
}

export interface TaskItemProps {
  task: Task;
  playerNum: 1 | 2;
  isTurn: boolean;
  onToggle: (playerNum: 1 | 2, taskId: string) => void;
  disabled: boolean;
}

export interface BattleSideProps {
  player: Player;
  playerNum: 1 | 2;
  isTurn: boolean;
  isWinner: boolean;
  newTask: string;
  setNewTask: (value: string) => void;
  onAddTask: (playerNum: 1 | 2) => void;
  onToggleTask: (playerNum: 1 | 2, taskId: string) => void;
  onHeal: (playerNum: 1 | 2) => void;
  getHpColor: (hp: number, maxHp: number) => string;
  getHpWidth: (hp: number, maxHp: number) => string;
  floaters: FloaterData[];
}
