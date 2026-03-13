/* ─────────────────────────────────────────────────────────
   AURA-01 Persistent Game State
   Saved in localStorage, shared between terminal & tracker
   ───────────────────────────────────────────────────────── */

export interface DayProgress {
  day: number;
  title: string;
  tasks: { name: string; completed: boolean; codeWritten?: string[]; exported: boolean }[];
  miniGameCompleted: boolean;
  mlTestCompleted: boolean;
  startedAt: string | null;
  completedAt: string | null;
}

export interface GameState {
  initialized: boolean;
  currentDay: number;           // 1-4, 0 = not started
  dayProgress: DayProgress[];
  unlockedAt: Record<number, string>; // day -> ISO timestamp when it was unlocked
  completedAt: Record<number, string>; // day -> ISO timestamp when SLEEP was done
  totalExports: number;
  codeLines: number;
  miniGamesWon: number;
  mlTestResults: { epoch: number; accuracy: number; loss: number }[];
  lastActivity: string;
}

const STORAGE_KEY = "aura01_game_state";
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h

const DAY_TITLES = [
  "",
  "JOUR 1 : INFILTRATION FINANCIERE",
  "JOUR 2 : PROFILAGE BIOMETRIQUE",
  "JOUR 3 : EVEIL COGNITIF",
  "JOUR 4 : TEST DE TURING & DEPLOIEMENT",
];

const DAY_TASKS = [
  [],
  [
    "Calibrer le Neural-Core financier d'AURA-01",
    "Synchroniser les flux de donnees boursiers en temps reel",
    "Lancer le mini-jeu de classification des flux",
    "Activer le protocole d'infiltration furtive",
  ],
  [
    "Calibrer les capteurs biometriques d'AURA-01",
    "Entrainer le reseau neuronal de detection de mensonges",
    "Lancer le mini-jeu de decodage biometrique",
    "Deployer le module d'analyse comportementale",
  ],
  [
    "Debloquer le cortex synthetique d'AURA-01",
    "Stabiliser les oscillations cognitives erratiques",
    "Lancer le mini-jeu de paradoxe cognitif",
    "Contenir les questions philosophiques d'AURA-01",
  ],
  [
    "Configurer l'environnement de simulation sociale",
    "Lancer le test de Turing modifie",
    "Lancer le mini-jeu de simulation Turing",
    "Deployer AURA-01 dans le monde reel",
  ],
];

function createDefaultState(): GameState {
  return {
    initialized: false,
    currentDay: 0,
    dayProgress: [1, 2, 3, 4].map((d) => ({
      day: d,
      title: DAY_TITLES[d],
      tasks: DAY_TASKS[d].map((name) => ({ name, completed: false, exported: false })),
      miniGameCompleted: false,
      mlTestCompleted: false,
      startedAt: null,
      completedAt: null,
    })),
    unlockedAt: {},
    completedAt: {},
    totalExports: 0,
    codeLines: 0,
    miniGamesWon: 0,
    mlTestResults: [],
    lastActivity: new Date().toISOString(),
  };
}

export function loadGameState(): GameState {
  if (typeof window === "undefined") return createDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    return JSON.parse(raw) as GameState;
  } catch {
    return createDefaultState();
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  state.lastActivity = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
  // Dispatch event so other components can listen
  window.dispatchEvent(new CustomEvent("aura-state-change", { detail: state }));
}

export function resetGameState(): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* blocked */ }
  window.dispatchEvent(new CustomEvent("aura-state-change", { detail: createDefaultState() }));
}

/** Check if a day is unlocked based on cooldown */
export function isDayUnlocked(state: GameState, day: number): boolean {
  if (day === 1) return true; // Day 1 always unlocked
  const prevCompleted = state.completedAt[day - 1];
  if (!prevCompleted) return false;
  const elapsed = Date.now() - new Date(prevCompleted).getTime();
  return elapsed >= COOLDOWN_MS;
}

/** Get remaining cooldown time in ms */
export function getCooldownRemaining(state: GameState, day: number): number {
  if (day === 1) return 0;
  const prevCompleted = state.completedAt[day - 1];
  if (!prevCompleted) return COOLDOWN_MS;
  const elapsed = Date.now() - new Date(prevCompleted).getTime();
  return Math.max(0, COOLDOWN_MS - elapsed);
}

/** Format ms as HH:MM:SS */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Mark a day as started */
export function markDayStarted(state: GameState, day: number): GameState {
  const next = { ...state, currentDay: day, initialized: true };
  if (!next.unlockedAt[day]) next.unlockedAt = { ...next.unlockedAt, [day]: new Date().toISOString() };
  const dp = next.dayProgress.map((d) =>
    d.day === day && !d.startedAt ? { ...d, startedAt: new Date().toISOString() } : d
  );
  next.dayProgress = dp;
  return next;
}

/** Mark a task as completed */
export function markTaskCompleted(state: GameState, day: number, taskIdx: number, codeLines?: string[]): GameState {
  const dp = state.dayProgress.map((d) => {
    if (d.day !== day) return d;
    const tasks = d.tasks.map((t, i) =>
      i === taskIdx ? { ...t, completed: true, codeWritten: codeLines || t.codeWritten } : t
    );
    return { ...d, tasks };
  });
  return {
    ...state,
    dayProgress: dp,
    codeLines: state.codeLines + (codeLines?.length || 0),
  };
}

/** Mark task as exported */
export function markTaskExported(state: GameState, day: number, taskIdx: number): GameState {
  const dp = state.dayProgress.map((d) => {
    if (d.day !== day) return d;
    const tasks = d.tasks.map((t, i) => (i === taskIdx ? { ...t, exported: true } : t));
    return { ...d, tasks };
  });
  return { ...state, dayProgress: dp, totalExports: state.totalExports + 1 };
}

/** Mark minigame completed */
export function markMiniGameCompleted(state: GameState, day: number): GameState {
  const dp = state.dayProgress.map((d) =>
    d.day === day ? { ...d, miniGameCompleted: true } : d
  );
  return { ...state, dayProgress: dp, miniGamesWon: state.miniGamesWon + 1 };
}

/** Mark day as completed (SLEEP) */
export function markDayCompleted(state: GameState, day: number): GameState {
  const dp = state.dayProgress.map((d) =>
    d.day === day ? { ...d, completedAt: new Date().toISOString() } : d
  );
  return {
    ...state,
    dayProgress: dp,
    completedAt: { ...state.completedAt, [day]: new Date().toISOString() },
  };
}

/** Save ML test results */
export function saveMLResults(state: GameState, results: { epoch: number; accuracy: number; loss: number }[]): GameState {
  const dp = state.dayProgress.map((d) =>
    d.day === 4 ? { ...d, mlTestCompleted: true } : d
  );
  return { ...state, dayProgress: dp, mlTestResults: results };
}
