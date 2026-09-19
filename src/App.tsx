import {
  ArrowRight,
  Flame,
  Gamepad,
  Heart,
  RefreshCw,
  ScrollText,
  Settings,
  Swords,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BattleSide } from "./components/BattleSide";
import { useGame } from "./hooks/useGame";
import {
  isSoundMuted,
  playClick,
  playDefeat,
  playHeal,
  playHit,
  playTurn,
  playVictory,
  setSoundMuted,
} from "./utils/sound";

const CONFETTI_COLORS = [
  "#ff6b6b",
  "#4ecdc4",
  "#fbbf24",
  "#4ade80",
  "#c084fc",
  "#ffffff",
];

interface Ember {
  id: string;
  left: string;
  size: number;
  duration: string;
  delay: string;
}

const EMBERS: Ember[] = Array.from({ length: 14 }, (_, i) => ({
  id: `ember-${i}`,
  left: `${(i * 37 + 11) % 100}%`,
  size: 3 + ((i * 7) % 4),
  duration: `${4 + ((i * 13) % 5)}s`,
  delay: `${(i * 0.7) % 4}s`,
}));

export default function App() {
  const {
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
  } = useGame();

  const [muted, setMuted] = useState(isSoundMuted());
  const [turnBanner, setTurnBanner] = useState<number | null>(null);

  const actions = state.battleLog.length;
  const currentName =
    state.currentTurn === 1 ? state.player1.name : state.player2.name;
  const currentColor =
    state.currentTurn === 1 ? state.player1.color : state.player2.color;
  const winnerName =
    state.winner === 1 ? state.player1.name : state.player2.name;
  const winnerColor =
    state.winner === 1 ? state.player1.color : state.player2.color;
  const p1Damage = state.player1.tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.damage, 0);
  const p2Damage = state.player2.tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.damage, 0);

  // Combat sounds for each new log entry.
  const lastLogId = useRef<string | null>(null);
  useEffect(() => {
    const last = state.battleLog[state.battleLog.length - 1];
    if (!last || last.id === lastLogId.current) return;
    lastLogId.current = last.id;
    if (last.type === "damage") playHit();
    else playHeal();
  }, [state.battleLog]);

  // Turn banner + jingle (skip the opening turn).
  const firstTurn = useRef(true);
  useEffect(() => {
    if (state.winner) {
      setTurnBanner(null);
      return;
    }
    if (firstTurn.current) {
      firstTurn.current = false;
      return;
    }
    setTurnBanner(state.currentTurn);
    playTurn();
    const t = setTimeout(() => setTurnBanner(null), 1300);
    return () => clearTimeout(t);
  }, [state.currentTurn, state.winner]);

  // Victory fanfare + defeat sound.
  useEffect(() => {
    if (state.winner) {
      playVictory();
      playDefeat();
    }
  }, [state.winner]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
    if (!next) playClick();
  };

  return (
    <div
      className={`relative w-full min-h-screen bg-[#0d0d1a] overflow-hidden flex flex-col ${screenShake ? "animate-shake" : ""}`}
    >
      {/* Arena background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full blur-[100px] opacity-20 w-[420px] h-[420px] bg-[#ff6b6b] top-[-120px] left-[-120px] animate-float" />
        <div className="absolute rounded-full blur-[100px] opacity-20 w-[380px] h-[380px] bg-[#4ecdc4] bottom-[-100px] right-[-100px] animate-float" />
        <div className="absolute rounded-full blur-[120px] opacity-10 w-[500px] h-[300px] bg-[#7c3aed] top-[40%] left-[30%]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse at center, black 25%, transparent 72%)",
          }}
        />
        {/* Rising embers */}
        {EMBERS.map((ember) => (
          <span
            key={ember.id}
            className="ember absolute bottom-0 rounded-full bg-orange-400/50"
            style={{
              left: ember.left,
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              animationDuration: ember.duration,
              animationDelay: ember.delay,
            }}
          />
        ))}
        {/* Arena floor line */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#7c3aed]/60 to-transparent" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between gap-2 px-4 sm:px-5 py-4 border-b-2 border-[#2a2a4a] bg-[#0d0d1a]/85 backdrop-blur-xl">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Swords className="text-2xl sm:text-3xl text-[#ff6b6b] animate-idle-bob flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="title-chrome text-2xl sm:text-3xl md:text-4xl font-black italic tracking-tight leading-none truncate">
              BATTLE TODO
            </h1>
            <p className="text-[10px] font-black tracking-[4px] text-[#8a8aa0] mt-1 truncate">
              TODO ARENA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:inline-block text-xs font-black tracking-widest px-3 py-2 rounded-lg bg-[#fbbf24]/15 border-2 border-[#fbbf24]/60 text-[#fbbf24]">
            ACTIONS {actions}
          </span>
          <button
            type="button"
            onClick={toggleMute}
            title={muted ? "Unmute sounds" : "Mute sounds"}
            className="bg-[#16162a] border-2 border-[#2a2a4a] text-[#e0e0e8] w-11 h-11 rounded-xl text-lg cursor-pointer transition-all hover:border-[#fbbf24] active:translate-y-[2px]"
          >
            {muted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              playClick();
              setShowSettings(!showSettings);
            }}
            title="Game settings"
            className="bg-[#16162a] border-2 border-[#2a2a4a] text-[#e0e0e8] w-11 h-11 rounded-xl text-lg cursor-pointer transition-all duration-300 hover:border-[#4ecdc4] hover:rotate-90 active:translate-y-[2px]"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {showSettings && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-[#16162a] border-2 border-[#2a2a4a] rounded-2xl p-8 w-full max-w-[420px] flex flex-col gap-4 animate-pop-in shadow-[0_0_50px_rgba(124,58,237,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-black italic tracking-wide text-white">
              <Gamepad className="w-5 h-5 mr-2" />
              GAME SETTINGS
            </h2>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-[#ff6b6b] uppercase tracking-[2px]">
                Player 1 — Fighter name
              </label>
              <input
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Player 1"
                className="bg-black/50 border-2 border-[#2a2a4a] rounded-xl p-3 text-white text-sm font-semibold outline-none transition-all focus:border-[#ff6b6b]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-[#4ecdc4] uppercase tracking-[2px]">
                Player 2 — Fighter name
              </label>
              <input
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Player 2"
                className="bg-black/50 border-2 border-[#2a2a4a] rounded-xl p-3 text-white text-sm font-semibold outline-none transition-all focus:border-[#4ecdc4]"
              />
            </div>
            <button
              type="button"
              onClick={updateNames}
              className="py-3 rounded-xl text-sm font-black tracking-wider text-white bg-gradient-to-b from-[#ff6b6b] to-[#c0392b] border-b-4 border-black/60 cursor-pointer transition-all active:translate-y-[2px] active:border-b-0 hover:brightness-110"
            >
              APPLY NAMES
            </button>
            <button
              type="button"
              onClick={resetGame}
              className="py-3 rounded-xl text-sm font-black tracking-wider text-[#8a8aa0] bg-transparent border-2 border-[#2a2a4a] cursor-pointer transition-all hover:border-[#ff6b6b] hover:text-[#ff6b6b] active:translate-y-[2px]"
            >
              RESET GAME
            </button>
          </div>
        </div>
      )}

      {/* Turn banner */}
      {turnBanner !== null && !state.winner && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="animate-turn-banner text-center">
            <div
              className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tight px-4"
              style={{
                color: turnBanner === 1 ? "#ff6b6b" : "#4ecdc4",
                textShadow: "0 4px 0 rgba(0,0,0,0.8), 0 0 40px currentColor",
              }}
            >
              {turnBanner === 1 ? state.player1.name : state.player2.name}
              &apos;S TURN!
            </div>
            <div className="text-2xl font-black tracking-[8px] text-white mt-2">
              — FIGHT! —
            </div>
          </div>
        </div>
      )}

      {/* Arena */}
      <main className="relative z-10 flex flex-1 flex-col lg:flex-row gap-5 p-5 md:p-[30px] items-stretch lg:items-start justify-center">
        <BattleSide
          player={state.player1}
          playerNum={1}
          isTurn={state.currentTurn === 1}
          isWinner={state.winner === 1}
          newTask={newTask1}
          setNewTask={setNewTask1}
          onAddTask={addTask}
          onToggleTask={toggleTask}
          onHeal={healPlayer}
          getHpColor={getHpColor}
          getHpWidth={getHpWidth}
          floaters={floaters.filter((f) => f.targetPlayer === "player1")}
        />

        {/* VS column */}
        <div className="flex lg:flex-col flex-row items-center justify-center gap-3 lg:py-10 lg:min-w-[110px]">
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-[#2a2a4a] to-black border-4 border-[#fbbf24] flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-pulse-glow flex-shrink-0">
            <span className="text-2xl font-black italic text-[#fbbf24]">
              VS
            </span>
          </div>
          <div className="flex lg:flex-col flex-row gap-2">
            <div className="text-[11px] font-black tracking-widest text-white bg-black/60 px-3 py-2 rounded-lg border-2 border-[#2a2a4a] text-center whitespace-nowrap">
              ACTIONS {actions}
            </div>
            {!state.winner && (
              <div
                className="text-[11px] font-black tracking-widest px-3 py-2 rounded-lg border-2 text-center whitespace-nowrap animate-pulse-glow bg-black/60"
                style={{ borderColor: currentColor, color: currentColor }}
              >
                <ArrowRight className="w-4 h-4 mr-1" />
                {currentName}
              </div>
            )}
          </div>
        </div>

        <BattleSide
          player={state.player2}
          playerNum={2}
          isTurn={state.currentTurn === 2}
          isWinner={state.winner === 2}
          newTask={newTask2}
          setNewTask={setNewTask2}
          onAddTask={addTask}
          onToggleTask={toggleTask}
          onHeal={healPlayer}
          getHpColor={getHpColor}
          getHpWidth={getHpWidth}
          floaters={floaters.filter((f) => f.targetPlayer === "player2")}
        />
      </main>

      {/* Victory */}
      {state.winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-[8px] animate-fade-in p-4 overflow-hidden">
          {CONFETTI_COLORS.flatMap((color, ci) =>
            [0, 1, 2, 3, 4].map((n) => {
              const i = ci * 5 + n;
              return (
                <span
                  key={i}
                  className="confetti-piece absolute top-0 pointer-events-none"
                  style={{
                    left: `${(i * 37 + 7) % 100}%`,
                    width: `${6 + ((i * 3) % 5)}px`,
                    height: `${9 + ((i * 5) % 7)}px`,
                    background: color,
                    animationDuration: `${2.4 + ((i * 13) % 20) / 10}s`,
                    animationDelay: `${(i * 0.17) % 2.5}s`,
                  }}
                />
              );
            }),
          )}
          <div className="text-center animate-pop-in relative">
            <Trophy className="w-14 h-14 mb-2 animate-idle-bob text-[#fbbf24]" />
            <h2
              className="text-5xl sm:text-6xl md:text-7xl font-black italic tracking-tight mb-2"
              style={{
                color: winnerColor,
                textShadow: "0 4px 0 rgba(0,0,0,0.8), 0 0 50px currentColor",
              }}
            >
              VICTORY!
            </h2>
            <p className="text-2xl text-white font-black italic mb-5">
              {winnerName} WINS THE ARENA!
            </p>
            <div className="flex gap-3 justify-center mb-7">
              <div className="bg-black/60 border-2 border-[#ff6b6b]/60 rounded-xl px-4 py-2">
                <div className="text-[10px] font-black tracking-widest text-[#ff6b6b]">
                  {state.player1.name.toUpperCase()} DMG
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {p1Damage}
                </div>
              </div>
              <div className="bg-black/60 border-2 border-[#fbbf24]/60 rounded-xl px-4 py-2">
                <div className="text-[10px] font-black tracking-widest text-[#fbbf24]">
                  ACTIONS
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {actions}
                </div>
              </div>
              <div className="bg-black/60 border-2 border-[#4ecdc4]/60 rounded-xl px-4 py-2">
                <div className="text-[10px] font-black tracking-widest text-[#4ecdc4]">
                  {state.player2.name.toUpperCase()} DMG
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {p2Damage}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={resetGame}
              className="px-14 py-4 rounded-2xl border-b-8 border-black/60 bg-gradient-to-b from-[#ff6b6b] to-[#4ecdc4] text-white text-xl font-black italic tracking-wide cursor-pointer transition-all hover:brightness-110 hover:-translate-y-[2px] active:translate-y-[4px] active:border-b-0"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              REMATCH!
            </button>
          </div>
        </div>
      )}

      {/* Combat feed */}
      <aside className="relative z-10 border-t-2 border-[#2a2a4a] bg-[#101024]/95 p-4 md:px-10 max-h-[190px] flex flex-col">
        <h3 className="text-[12px] font-black text-[#fbbf24] tracking-[3px] mb-2">
          <ScrollText className="w-4 h-4 mr-1.5" />
          COMBAT FEED
        </h3>
        <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
          {state.battleLog.length === 0 && (
            <p className="text-[#8a8aa0] text-[13px] italic text-center py-4">
              The arena is silent… add a quest and strike first!
            </p>
          )}
          {state.battleLog
            .slice()
            .reverse()
            .map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] bg-black/40 border animate-slide-in ${
                  entry.type === "damage"
                    ? "border-[#f87171]/40"
                    : "border-[#4ade80]/40"
                }`}
              >
                <span className="text-base flex-shrink-0">
                  {entry.type === "damage" ? (
                    <Flame className="w-4 h-4 text-[#f87171]" />
                  ) : (
                    <Heart className="w-4 h-4 text-[#4ade80]" />
                  )}
                </span>
                <span className="text-[#8a8aa0] font-mono text-[11px] flex-shrink-0">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-[#e0e0e8] font-semibold">
                  {entry.text}
                </span>
              </div>
            ))}
        </div>
      </aside>
    </div>
  );
}
