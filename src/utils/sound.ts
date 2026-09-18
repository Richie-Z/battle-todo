// Tiny WebAudio synth for retro battle sound effects. No assets needed.
// The AudioContext is created lazily on first user-triggered sound call.

let ctx: AudioContext | null = null;

const MUTE_KEY = "battle-todo-muted";

export function isSoundMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {}
}

function audio(): AudioContext | null {
  if (isSoundMuted()) return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freqFrom: number,
  freqTo: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  delay = 0,
): void {
  const ac = audio();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqFrom, t0);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(1, freqTo),
      t0 + duration,
    );
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  } catch {}
}

export function playHit(): void {
  tone(180, 55, 0.18, "sawtooth", 0.12);
  tone(90, 40, 0.22, "square", 0.08, 0.02);
}

export function playCrit(): void {
  tone(320, 60, 0.25, "sawtooth", 0.14);
  tone(640, 120, 0.2, "square", 0.07, 0.05);
}

export function playHeal(): void {
  tone(420, 660, 0.14, "sine", 0.1);
  tone(660, 990, 0.18, "sine", 0.1, 0.12);
}

export function playClick(): void {
  tone(700, 500, 0.06, "square", 0.05);
}

export function playTurn(): void {
  tone(330, 495, 0.09, "square", 0.06);
  tone(495, 660, 0.09, "square", 0.06, 0.09);
}

export function playVictory(): void {
  const notes = [523, 659, 784, 1047, 784, 1047];
  notes.forEach((n, i) => {
    tone(n, n, 0.16, "square", 0.08, i * 0.13);
  });
}

export function playDefeat(): void {
  const notes = [392, 330, 262, 196];
  notes.forEach((n, i) => {
    tone(n, n * 0.94, 0.22, "sawtooth", 0.08, i * 0.16);
  });
}
