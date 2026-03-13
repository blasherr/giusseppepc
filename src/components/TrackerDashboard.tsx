"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  GameState, loadGameState, saveGameState, resetGameState,
  isDayUnlocked, getCooldownRemaining, formatCountdown,
} from "@/lib/game-state";

/* ═══════════════════════════════════════════════════════════
   AURA-01 PROJECT TRACKER — 4-DAY COMPANION DASHBOARD
   ═══════════════════════════════════════════════════════════ */

const DAY_COLORS = ["", "#ff2a2a", "#ff4444", "#ff6666", "#ff8888"];
const DAY_ICONS = ["", "💰", "🧬", "🧠", "🤖"];

/* ─── tiny SVG charts ─── */
function MiniBar({ values, color, h = 40 }: { values: number[]; color: string; h?: number }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const w = 200;
  const bw = Math.max(2, (w - values.length * 2) / values.length);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: h }}>
      {values.map((v, i) => (
        <rect key={i} x={i * (bw + 2)} y={h - (v / max) * h} width={bw} height={(v / max) * h}
          fill={color} opacity={0.7 + 0.3 * (v / max)} rx={1} />
      ))}
    </svg>
  );
}

function MiniLine({ values, color, h = 50 }: { values: number[]; color: string; h?: number }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 0.01);
  const w = 200;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - (v / max) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: h }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - (v / max) * (h - 4) - 2;
        return <circle key={i} cx={x} cy={y} r={2.5} fill={color} />;
      })}
    </svg>
  );
}

/* ─── ML Results Viewer ─── */
function MLResultsPanel({ results }: { results: GameState["mlTestResults"] }) {
  if (!results.length) return <p className="text-white/30 text-xs">Aucune donnée ML disponible.</p>;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-white/40 mb-1">ACCURACY / EPOCH</p>
          <MiniLine values={results.map((r) => r.accuracy)} color="#ff2a2a" h={60} />
        </div>
        <div>
          <p className="text-[10px] text-white/40 mb-1">LOSS / EPOCH</p>
          <MiniLine values={results.map((r) => r.loss)} color="#ff6666" h={60} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-white/50 border-b border-white/10">
              <th className="py-1 text-left">Epoch</th>
              <th className="py-1 text-right">Accuracy</th>
              <th className="py-1 text-right">Loss</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.epoch} className="border-b border-white/5">
                <td className="py-0.5 text-[var(--c-accent)]">{r.epoch}</td>
                <td className="py-0.5 text-right text-red-400">{(r.accuracy * 100).toFixed(1)}%</td>
                <td className="py-0.5 text-right text-red-300">{r.loss.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Day Card ─── */
function DayCard({ dp, state, isActive, onOpen }: {
  dp: GameState["dayProgress"][0];
  state: GameState;
  isActive: boolean;
  onOpen: () => void;
}) {
  const unlocked = isDayUnlocked(state, dp.day);
  const cooldown = getCooldownRemaining(state, dp.day);
  const [cd, setCd] = useState(cooldown);
  const completed = !!dp.completedAt;
  const tasksCompleted = dp.tasks.filter((t) => t.completed).length;
  const progress = tasksCompleted / dp.tasks.length;
  const color = DAY_COLORS[dp.day];

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      const remaining = getCooldownRemaining(state, dp.day);
      setCd(remaining);
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown, state, dp.day]);

  return (
    <div
      className={`relative border rounded-xl p-4 transition-all duration-500 ${
        isActive
          ? "border-[var(--c-accent)]/60 bg-[var(--c-accent)]/5 shadow-[0_0_20px_rgba(255,42,42,0.15)]"
          : completed
          ? "border-red-500/30 bg-red-500/5"
          : unlocked
          ? "border-white/20 bg-white/5 hover:border-white/40"
          : "border-white/10 bg-white/[0.02] opacity-60"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{DAY_ICONS[dp.day]}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold" style={{ color }}>{dp.title}</h3>
            {completed && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--c-accent)]/20 text-[var(--c-accent)]">COMPLET</span>}
            {isActive && !completed && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--c-accent)]/20 text-[var(--c-accent)] animate-pulse">EN COURS</span>}
          </div>
          <p className="text-[10px] text-white/30">
            {dp.startedAt ? `Commencé: ${new Date(dp.startedAt).toLocaleString("fr-FR")}` : "Non commencé"}
            {dp.completedAt && ` — Terminé: ${new Date(dp.completedAt).toLocaleString("fr-FR")}`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/10 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${progress * 100}%`, background: color }}
        />
      </div>

      {/* Tasks */}
      <div className="space-y-1.5 mb-3">
        {dp.tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span className={t.completed ? "text-[var(--c-accent)]" : "text-white/20"}>
              {t.completed ? "✓" : "○"}
            </span>
            <span className={t.completed ? "text-white/70" : "text-white/30"}>{t.name}</span>
            {t.exported && <span className="text-[9px] text-[var(--c-accent)] ml-auto">EXPORTÉ</span>}
          </div>
        ))}
      </div>

      {/* Mini-game & ML */}
      <div className="flex items-center gap-3 text-[10px] mb-3">
        <span className={dp.miniGameCompleted ? "text-[var(--c-accent)]" : "text-white/20"}>
          {dp.miniGameCompleted ? "🎮 Mini-jeu ✓" : "🎮 Mini-jeu"}
        </span>
        {dp.day === 4 && (
          <span className={dp.mlTestCompleted ? "text-[var(--c-accent)]" : "text-white/20"}>
            {dp.mlTestCompleted ? "🧪 ML Test ✓" : "🧪 ML Test"}
          </span>
        )}
      </div>

      {/* Cooldown / Action */}
      {!unlocked && cd > 0 ? (
        <div className="text-center">
          <p className="text-[10px] text-white/40 mb-1">VERROUILLÉ — Délai de refroidissement</p>
          <p className="text-lg font-mono tracking-widest" style={{ color }}>{formatCountdown(cd)}</p>
        </div>
      ) : unlocked && !dp.startedAt ? (
        <button
          onClick={onOpen}
          className="w-full py-2 rounded-lg text-xs font-bold tracking-wider transition-all hover:scale-[1.02]"
          style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
        >
          ▶ COMMENCER CE JOUR
        </button>
      ) : null}

      {/* Code preview */}
      {dp.tasks.some((t) => t.codeWritten?.length) && (
        <details className="mt-2">
          <summary className="text-[10px] text-white/40 cursor-pointer hover:text-white/60">
            Voir le code écrit ({dp.tasks.reduce((a, t) => a + (t.codeWritten?.length || 0), 0)} lignes)
          </summary>
          <div className="mt-2 bg-black/40 rounded p-2 max-h-32 overflow-y-auto">
            {dp.tasks.map((t, ti) =>
              t.codeWritten?.map((line, li) => (
                <div key={`${ti}-${li}`} className="text-[10px] font-mono text-[var(--c-accent)]/70">
                  <span className="text-white/20 mr-2">{li + 1}</span>{line}
                </div>
              ))
            )}
          </div>
        </details>
      )}
    </div>
  );
}

/* ═══════════ MAIN TRACKER COMPONENT ═══════════ */

export default function TrackerDashboard() {
  const [state, setState] = useState<GameState | null>(null);
  const [tab, setTab] = useState<"overview" | "days" | "ml">("overview");
  const [, setNow] = useState(Date.now());
  const frameRef = useRef(0);

  // Load state
  useEffect(() => {
    setState(loadGameState());
    const handler = (e: Event) => setState({ ...(e as CustomEvent).detail });
    window.addEventListener("aura-state-change", handler);
    return () => window.removeEventListener("aura-state-change", handler);
  }, []);

  // Tick for countdowns
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Scanline animation
  useEffect(() => {
    const canvas = document.getElementById("tracker-scanline") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let y = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,42,42,0.03)";
      ctx.fillRect(0, y, canvas.width, 2);
      y = (y + 1) % canvas.height;
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const handleReset = useCallback(() => {
    if (confirm("Réinitialiser toute la progression ? Cette action est irréversible.")) {
      resetGameState();
      setState(loadGameState());
    }
  }, []);

  const handleStartDay = useCallback((day: number) => {
    // Signal the terminal to start this day by saving state
    alert(`Ouvrez le terminal AURA Lab et tapez WAKE_UP pour commencer le Jour ${day}.`);
  }, []);

  if (!state) return null;

  const daysCompleted = Object.keys(state.completedAt).length;
  const daysRemaining = 4 - daysCompleted;
  const totalTasks = state.dayProgress.reduce((a, d) => a + d.tasks.length, 0);
  const totalCompleted = state.dayProgress.reduce((a, d) => a + d.tasks.filter((t) => t.completed).length, 0);
  const overallProgress = totalTasks > 0 ? totalCompleted / totalTasks : 0;

  // Next unlock time
  let nextUnlock: number | null = null;
  for (let d = 2; d <= 4; d++) {
    if (!isDayUnlocked(state, d) && state.completedAt[d - 1]) {
      nextUnlock = getCooldownRemaining(state, d);
      break;
    }
  }

  return (
    <div className="h-full bg-[#060608] text-white font-[var(--font-mono)] overflow-auto relative">
      <canvas id="tracker-scanline" className="absolute inset-0 pointer-events-none z-50 w-full h-full" width={1920} height={1080} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#060608]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">◈</span>
            <div>
              <h1 className="text-lg font-bold tracking-widest text-[var(--c-accent)]">AURA-01 <span className="text-white/40">PROJECT TRACKER</span></h1>
              <p className="text-[10px] text-white/30">Cerberus Neural Development Program — Phase Active</p>
            </div>
          </div>
          <div className="flex-1" />
          {/* Stats pills */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-[var(--c-accent)]/10 border border-[var(--c-accent)]/20 text-[11px]">
              <span className="text-white/50">JOURS RESTANTS:</span>{" "}
              <span className="text-[var(--c-accent)] font-bold">{daysRemaining}</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-[var(--c-accent)]/10 border border-[var(--c-accent)]/20 text-[11px]">
              <span className="text-white/50">PROGRESSION:</span>{" "}
              <span className="text-[var(--c-accent)] font-bold">{Math.round(overallProgress * 100)}%</span>
            </div>
            {nextUnlock !== null && nextUnlock > 0 && (
              <div className="px-3 py-1 rounded-full bg-[var(--c-accent)]/10 border border-[var(--c-accent)]/20 text-[11px]">
                <span className="text-white/50">PROCHAIN JOUR:</span>{" "}
                <span className="text-[var(--c-accent)] font-bold">{formatCountdown(nextUnlock)}</span>
              </div>
            )}
          </div>
          {/* Back to desktop link removed - embedded in window */}
        </div>
      </header>

      {/* Tab bar */}
      <div className="max-w-6xl mx-auto px-6 mt-4 flex gap-2">
        {(["overview", "days", "ml"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${
              tab === t ? "bg-[var(--c-accent)]/15 text-[var(--c-accent)] border border-[var(--c-accent)]/30" : "text-white/40 hover:text-white/60"
            }`}
          >
            {t === "overview" ? "VUE D'ENSEMBLE" : t === "days" ? "DÉTAIL JOURS" : "ML & TESTS"}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={handleReset} className="text-[10px] text-red-400/40 hover:text-red-400 transition-colors">
          RESET
        </button>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Big progress */}
            <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02]">
              <div className="flex items-end gap-6 mb-4">
                <div>
                  <p className="text-[10px] text-white/40 mb-1">PROGRESSION GLOBALE</p>
                  <p className="text-4xl font-bold text-[var(--c-accent)]">{Math.round(overallProgress * 100)}%</p>
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000"
                      style={{ width: `${overallProgress * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/40">TACHES</p>
                  <p className="text-lg font-bold">{totalCompleted}<span className="text-white/30">/{totalTasks}</span></p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "JOURS COMPLETES", val: daysCompleted, max: 4, color: "#ff2a2a" },
                  { label: "LIGNES DE CODE", val: state.codeLines, max: null, color: "#ff4444" },
                  { label: "MINI-JEUX GAGNES", val: state.miniGamesWon, max: 4, color: "#ff6666" },
                  { label: "EXPORTS REALISES", val: state.totalExports, max: null, color: "#ff8888" },
                ].map(({ label, val, max, color }) => (
                  <div key={label} className="text-center p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <p className="text-2xl font-bold" style={{ color }}>{val}{max !== null && <span className="text-white/20 text-sm">/{max}</span>}</p>
                    <p className="text-[9px] text-white/40 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02]">
              <p className="text-[10px] text-white/40 mb-4">TIMELINE DU PROJET</p>
              <div className="flex items-center gap-0">
                {state.dayProgress.map((dp, i) => {
                  const completed = !!dp.completedAt;
                  const active = state.currentDay === dp.day && !completed;
                  const unlocked = isDayUnlocked(state, dp.day);
                  return (
                    <div key={dp.day} className="flex items-center flex-1">
                      <div className={`relative flex flex-col items-center ${i > 0 ? "flex-1" : ""}`}>
                        {i > 0 && (
                          <div className={`absolute top-4 right-1/2 w-full h-0.5 ${completed ? "bg-[var(--c-accent)]/50" : "bg-white/10"}`} />
                        )}
                        <div
                          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                            completed
                              ? "bg-[var(--c-accent)]/20 border-[var(--c-accent)] text-[var(--c-accent)]"
                              : active
                              ? "bg-[var(--c-accent)]/20 border-[var(--c-accent)] text-[var(--c-accent)] animate-pulse"
                              : unlocked
                              ? "bg-white/10 border-white/30 text-white/50"
                              : "bg-white/5 border-white/10 text-white/20"
                          }`}
                        >
                          {completed ? "✓" : dp.day}
                        </div>
                        <p className="text-[9px] text-white/40 mt-2 text-center max-w-[80px]">
                          JOUR {dp.day}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity bars */}
            {state.codeLines > 0 && (
              <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02]">
                <p className="text-[10px] text-white/40 mb-3">ACTIVITE PAR JOUR</p>
                <MiniBar
                  values={state.dayProgress.map((d) =>
                    d.tasks.reduce((a, t) => a + (t.codeWritten?.length || 0), 0)
                  )}
                  color="#ff2a2a"
                  h={50}
                />
              </div>
            )}
          </div>
        )}

        {tab === "days" && (
          <div className="grid gap-4">
            {state.dayProgress.map((dp) => (
              <DayCard
                key={dp.day}
                dp={dp}
                state={state}
                isActive={state.currentDay === dp.day && !dp.completedAt}
                onOpen={() => handleStartDay(dp.day)}
              />
            ))}
          </div>
        )}

        {tab === "ml" && (
          <div className="space-y-6">
            <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02]">
              <h2 className="text-sm font-bold text-[var(--c-accent)] mb-4">🧪 MACHINE LEARNING — RÉSULTATS DE TESTS</h2>
              <MLResultsPanel results={state.mlTestResults} />
            </div>

            <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02]">
              <h2 className="text-sm font-bold text-[var(--c-accent)] mb-3">📋 RÉSUMÉ ML</h2>
              {state.mlTestResults.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[var(--c-accent)]">
                      {(state.mlTestResults[state.mlTestResults.length - 1]?.accuracy * 100).toFixed(1)}%
                    </p>
                    <p className="text-[9px] text-white/40">ACCURACY FINALE</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-400">
                      {state.mlTestResults[state.mlTestResults.length - 1]?.loss.toFixed(4)}
                    </p>
                    <p className="text-[9px] text-white/40">LOSS FINALE</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--c-accent)]">{state.mlTestResults.length}</p>
                    <p className="text-[9px] text-white/40">EPOCHS</p>
                  </div>
                </div>
              ) : (
                <p className="text-white/30 text-xs">Les tests ML seront lancés au Jour 4.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-4 border-t border-white/5 text-[9px] text-white/20 flex items-center gap-4">
        <span>CERBERUS OS v3.7.1 — AURA-01 Neural Development Program</span>
        <span className="flex-1" />
        <span>Dernière activité: {state.lastActivity ? new Date(state.lastActivity).toLocaleString("fr-FR") : "N/A"}</span>
        <span className={`w-2 h-2 rounded-full ${state.initialized ? "bg-[var(--c-accent)] animate-pulse" : "bg-white/20"}`} />
      </footer>
    </div>
  );
}
