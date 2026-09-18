import type { FloaterProps } from "../types";

export function Floater({ value, type }: FloaterProps) {
  const isDamage = type === "damage" || !type;
  return (
    <div className={isDamage ? "damage-number" : "heal-number"}>
      {isDamage ? "-" : "+"}
      {value}
    </div>
  );
}
