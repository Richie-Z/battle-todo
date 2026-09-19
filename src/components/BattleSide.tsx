import {
  AlertTriangle,
  Clock,
  Heart,
  ScrollText,
  Skull,
  Swords,
  Trophy,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { BattleSideProps } from "../types";
import { Floater } from "./Floater";
import { TaskItem } from "./TaskItem";

const LOW_HP_THRESHOLD = 30;

export function BattleSide({
  player,
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
  const pendingCount = player.tasks.filter((t) => !t.completed).length;
  const isKO = player.hp <= 0;
  const isLowHp = !isKO && player.hp <= LOW_HP_THRESHOLD;
  const fighter =
    playerNum === 1 ? (
      <Swords className="text-3xl text-[#ff6b6b]" />
    ) : (
      <Swords className="text-3xl text-[#4ecdc4]" />
    );

  // Flash + shake the card when a new damage/heal floater lands on this side.
  const [hitFlash, setHitFlash] = useState(false);
  const [healFlash, setHealFlash] = useState(false);
  const seenFloaterIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fresh = floaters.filter((f) => !seenFloaterIds.current.has(f.id));
    if (fresh.length === 0) return;
    fresh.forEach((f) => {
      seenFloaterIds.current.add(f.id);
    });
    if (fresh.some((f) => f.type !== "heal")) {
      setHitFlash(true);
      const t = setTimeout(() => setHitFlash(false), 450);
      return () => clearTimeout(t);
    }
    if (fresh.some((f) => f.type === "heal")) {
      setHealFlash(true);
      const t = setTimeout(() => setHealFlash(false), 450);
      return () => clearTimeout(t);
    }
  }, [floaters]);

  return (
    <div
      className={`relative w-full lg:w-[45%] rounded-2xl border-2 p-5 transition-all duration-300 overflow-hidden bg-gradient-to-b from-[#1b1b33] to-[#121222] ${
        isKO
          ? "border-[#3a3a55] grayscale"
          : isTurn
            ? "border-[var(--player-color)] shadow-[0_0_35px_var(--player-glow)] -translate-y-1"
            : "border-[#2a2a4a] opacity-90"
      } ${isWinner ? "border-[#fbbf24] shadow-[0_0_45px_rgba(251,191,36,0.5)] animate-winner-celebrate" : ""}`}
      style={
        {
          "--player-color": player.color,
          "--player-glow": player.glow,
        } as React.CSSProperties
      }
    >
      {/* Hit / heal flashes */}
      {hitFlash && !isKO && (
        <div className="hit-flash-overlay absolute inset-0 bg-red-500 pointer-events-none z-30 rounded-2xl" />
      )}
      {healFlash && (
        <div className="hit-flash-overlay absolute inset-0 bg-green-400 pointer-events-none z-30 rounded-2xl" />
      )}
      {/* Top glow strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--player-color)] to-transparent" />

      {/* K.O. stamp */}
      {isKO && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <span className="text-6xl font-black italic text-red-500 -rotate-12 border-4 border-red-500 rounded-xl px-4 py-1 bg-black/60">
            K.O.
          </span>
        </div>
      )}

      {/* Fighter header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 border-[var(--player-color)] shadow-[0_4px_0_rgba(0,0,0,0.6),0_0_18px_var(--player-glow)] bg-black/50 ${hitFlash ? "animate-hurt" : isTurn && !isKO ? "animate-idle-bob" : ""}`}
          >
            {fighter}
          </div>
          <div
            className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black text-white border border-black/60"
            style={{ background: player.color }}
          >
            {playerNum}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-black italic tracking-wide text-white truncate uppercase">
              {player.name}
            </h2>
            {isTurn && !isWinner && !isKO && (
              <span
                className="text-[10px] font-black tracking-widest px-2 py-1 rounded-md text-black animate-pulse-glow"
                style={{ background: player.color }}
              >
                YOUR MOVE
              </span>
            )}
            {isWinner && (
              <span className="text-[10px] font-black tracking-widest px-2 py-1 rounded-md bg-[#fbbf24] text-black">
                WINNER
              </span>
            )}
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span
              className={`text-2xl font-black ${isLowHp ? "text-[#f87171] animate-danger-blink" : "text-white"}`}
            >
              {player.hp}
            </span>
            <span className="text-xs font-bold text-[#8a8aa0]">
              / {player.maxHp} HP
            </span>
            {isLowHp && (
              <span className="ml-1 text-[10px] font-black text-[#f87171] tracking-widest animate-danger-blink">
                <AlertTriangle className="w-3.5 h-3.5 inline text-[#f87171] mr-0.5" />{" "}
                LOW HP!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* HP bar with ghost drain */}
      <div
        className={`relative h-6 rounded-lg bg-black/70 border border-black overflow-hidden mb-4 ${isLowHp ? "shadow-[0_0_12px_rgba(248,113,113,0.7)]" : ""}`}
      >
        {/* Ghost (delayed drain) */}
        <div
          className="hp-ghost absolute inset-y-0 left-0 bg-white/80"
          style={{ width: getHpWidth(player.hp, player.maxHp) }}
        />
        {/* Main bar */}
        <div
          className="hp-main absolute inset-y-0 left-0"
          style={{
            width: getHpWidth(player.hp, player.maxHp),
            background: getHpColor(player.hp, player.maxHp),
          }}
        />
        {/* Segments */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0, transparent 9%, rgba(0,0,0,0.55) 9%, rgba(0,0,0,0.55) 10%)",
          }}
        />
        {/* Shine sweep */}
        <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent hp-shine" />
      </div>

      {/* Floating combat numbers */}
      <div className="absolute left-0 right-0 top-0 h-44 pointer-events-none overflow-hidden z-20">
        {floaters.map((f, i) => (
          <Floater key={f.id} value={f.value} type={f.type} index={i} />
        ))}
      </div>

      {/* Quest input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAddTask(playerNum)}
          placeholder={`New quest for ${player.name}...`}
          className="flex-1 bg-black/50 border-2 border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-sm font-semibold outline-none transition-all placeholder:text-[#8a8aa0] placeholder:font-normal focus:border-[var(--player-color)] focus:shadow-[0_0_12px_var(--player-glow)] disabled:opacity-50"
          disabled={isWinner || isKO}
        />
        <button
          type="button"
          onClick={() => onAddTask(playerNum)}
          disabled={!newTask.trim() || isWinner || isKO}
          title="Add quest (strike it to attack!)"
          className="px-4 rounded-xl border-b-4 font-black text-sm text-white transition-all active:translate-y-[2px] active:border-b-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4 border-black/60"
          style={{ background: player.color }}
        >
          ＋ QUEST
        </button>
      </div>

      {/* Quest list */}
      <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1 mb-4">
        {player.tasks.length === 0 ? (
          <div className="border-2 border-dashed border-[#2a2a4a] rounded-xl py-6 text-center">
            <ScrollText className="text-2xl mb-1 text-[#8a8aa0]" />
            <p className="text-[#8a8aa0] text-sm italic">
              No quests. Add one to arm an attack!
            </p>
          </div>
        ) : (
          player.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              playerNum={playerNum}
              isTurn={isTurn}
              onToggle={onToggleTask}
              disabled={isWinner || isKO}
            />
          ))
        )}
      </div>

      {/* Heal */}
      <button
        type="button"
        onClick={() => onHeal(playerNum)}
        disabled={!isTurn || isWinner || isKO || hasPendingTasks}
        className="w-full py-3 rounded-xl border-b-4 border-[#14532d] bg-gradient-to-b from-[#4ade80] to-[#16a34a] text-[#052e16] text-sm font-black tracking-wider transition-all active:translate-y-[2px] active:border-b-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4 hover:brightness-110"
      >
        {isKO ? (
          <>
            <Skull className="w-4 h-4 inline text-white mr-1" /> GAME OVER
          </>
        ) : isWinner ? (
          <>
            <Trophy className="w-4 h-4 inline text-[#fbbf24] mr-1" /> VICTORY
          </>
        ) : !hasPendingTasks && isTurn ? (
          <>
            <Heart className="w-4 h-4 inline text-[#052e16] mr-1" /> HEAL + END
            TURN
          </>
        ) : hasPendingTasks ? (
          <>
            <Swords className="w-4 h-4 inline text-white mr-1" /> FINISH{" "}
            {pendingCount} QUEST{pendingCount > 1 ? "S" : ""} TO HEAL
          </>
        ) : (
          <>
            <Clock className="w-4 h-4 inline text-white mr-1" /> WAIT FOR YOUR
            TURN
          </>
        )}
      </button>
    </div>
  );
}
