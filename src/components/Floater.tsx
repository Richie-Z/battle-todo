import type { FloaterProps } from "../types";

const CRIT_THRESHOLD = 19;

export function Floater({ value, type, index = 0 }: FloaterProps) {
  const isHeal = type === "heal";
  const isCrit = !isHeal && value >= CRIT_THRESHOLD;
  // Deterministic spread so stacked numbers don't overlap exactly.
  const left = 50 + ((index % 3) - 1) * 24;
  const tilt = ((index % 5) - 2) * 4;

  return (
    <div
      className={`floater ${isHeal ? "floater-heal" : isCrit ? "floater-crit" : "floater-damage"}`}
      style={
        {
          left: `${left}%`,
          "--floater-tilt": `${tilt}deg`,
        } as React.CSSProperties
      }
    >
      {isCrit && (
        <div className="text-center text-[16px] tracking-[3px] text-[#fde047]">
          CRIT!
        </div>
      )}
      <div>
        {isHeal ? "+" : "-"}
        {value}
      </div>
    </div>
  );
}
