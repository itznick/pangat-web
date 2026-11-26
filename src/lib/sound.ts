// Kitchen Audio Chime using Web Audio API
// Generates an authentic, crisp, multi-tone kitchen POS alert chime without any external audio file dependencies.

let audioCtx: AudioContext | null = null

function makeContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioCtx) {
      audioCtx = new AudioCtx()
      audioCtx.onstatechange = () => audioListeners.forEach((f) => f(isAudioReady()))
    }
  }
  return audioCtx
}

const audioListeners = new Set<(ready: boolean) => void>()
/** Told when the browser really starts/stops allowing sound (e.g. it suspends the context again). */
export function onAudioReadyChange(f: (ready: boolean) => void): () => void {
  audioListeners.add(f)
  return () => audioListeners.delete(f)
}

/** Any first tap/key on the page also unlocks sound (browsers count it as the required gesture). Resolves the same way as unlockAudio, silently. */
export function armAudioUnlock(): () => void {
  if (typeof window === "undefined") return () => {}
  const unlock = () => {
    const ctx = makeContext()
    if (ctx && ctx.state !== "running") void ctx.resume().catch(() => {})
  }
  window.addEventListener("pointerdown", unlock, { passive: true })
  window.addEventListener("keydown", unlock)
  return () => {
    window.removeEventListener("pointerdown", unlock)
    window.removeEventListener("keydown", unlock)
  }
}

/** True only when the browser will really play sound now (an AudioContext that is running). Browsers keep it suspended until a tap. */
export function isAudioReady(): boolean {
  return !!audioCtx && audioCtx.state === "running"
}

/**
 * Must be called from a user tap ("Enable kitchen sound"). Resumes the audio context and plays a short confirmation chime so staff hear
 * that it works. Resolves to the REAL outcome: never "ready" unless the context is running.
 */
export async function unlockAudio(): Promise<"ready" | "blocked" | "unsupported"> {
  const ctx = makeContext()
  if (!ctx) return "unsupported"
  try {
    if (ctx.state !== "running") await ctx.resume()
  } catch {
    return "blocked"
  }
  if (ctx.state !== "running") return "blocked"
  playKitchenChime()
  return "ready"
}

function getAudioContext(): AudioContext | null {
  const ctx = makeContext()
  if (ctx && ctx.state === "suspended") void ctx.resume().catch(() => {}) // may succeed after any earlier tap; this chime is lost either way
  return ctx && ctx.state === "running" ? ctx : null
}

/**
 * Play a high-contrast, pleasant dual-tone kitchen order chime.
 * Simulates the exact audible frequency of modern cafe Kitchen Display Systems (KDS)
 * tuned to cut through espresso machines and busy dining chatter.
 */
export function playKitchenChime() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // Tone 1: High crisp notification ping (G5 - 784 Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = "sine"
    osc1.frequency.setValueAtTime(784, now)
    osc1.frequency.exponentialRampToValueAtTime(790, now + 0.12)

    gain1.gain.setValueAtTime(0, now)
    gain1.gain.linearRampToValueAtTime(0.35, now + 0.02)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

    osc1.connect(gain1)
    gain1.connect(ctx.destination)

    osc1.start(now)
    osc1.stop(now + 0.6)

    // Tone 2: Harmonious high bell chime (C6 - 1046.5 Hz) slightly delayed for the classic "ding-dong" kitchen alert
    const delay = 0.14
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(1046.5, now + delay)
    osc2.frequency.exponentialRampToValueAtTime(1055, now + delay + 0.2)

    // Add bell harmonic richness
    const osc3 = ctx.createOscillator()
    const gain3 = ctx.createGain()
    osc3.type = "triangle"
    osc3.frequency.setValueAtTime(2093, now + delay) // Octave overtone

    gain2.gain.setValueAtTime(0, now + delay)
    gain2.gain.linearRampToValueAtTime(0.45, now + delay + 0.02)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.95)

    gain3.gain.setValueAtTime(0, now + delay)
    gain3.gain.linearRampToValueAtTime(0.12, now + delay + 0.02)
    gain3.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5)

    osc2.connect(gain2)
    gain2.connect(ctx.destination)

    osc3.connect(gain3)
    gain3.connect(ctx.destination)

    osc2.start(now + delay)
    osc2.stop(now + delay + 0.95)

    osc3.start(now + delay)
    osc3.stop(now + delay + 0.5)
  } catch (err) {
    console.warn("Could not play kitchen chime:", err)
  }
}
