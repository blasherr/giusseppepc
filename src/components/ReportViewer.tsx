"use client";
import { useState, useEffect, useRef } from "react";
import type { FullReport, TaskReportData } from "@/lib/task-sequences";

/* ─────────────────────────────────────────────────────────
   CERBERUS OS // FUTURISTIC REPORT VIEWER
   ───────────────────────────────────────────────────────── */

function BarChart({ data, maxVal, color, label }: { data: number[]; maxVal: number; color: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-white/40 tracking-wider uppercase">{label}</span>
      <div className="flex items-end gap-1 h-20">
        {data.map((v, i) => {
          const h = Math.max(2, (v / maxVal) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
              <div
                className="w-full rounded-t-sm transition-all duration-700"
                style={{
                  height: `${h}%`,
                  background: `linear-gradient(to top, ${color}44, ${color})`,
                  boxShadow: `0 0 8px ${color}40`,
                }}
              />
              <span className="text-[8px] text-white/25">{v.toFixed(0)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RadarChart({ metrics }: { metrics: { label: string; value: number; max: number }[] }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 60;
  const n = metrics.length;

  const getPoint = (idx: number, val: number, maxV: number) => {
    const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
    const ratio = val / maxV;
    return {
      x: cx + r * ratio * Math.cos(angle),
      y: cy + r * ratio * Math.sin(angle),
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const points = metrics.map((m, i) => getPoint(i, m.value, m.max));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  return (
    <svg width={size} height={size} className="drop-shadow-[0_0_12px_rgba(255,42,42,0.15)]">
      {gridLevels.map((level) => {
        const gridPoints = metrics.map((_, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          return `${cx + r * level * Math.cos(angle)},${cy + r * level * Math.sin(angle)}`;
        });
        return (
          <polygon
            key={level}
            points={gridPoints.join(" ")}
            fill="none"
            stroke="rgba(255,42,42,0.1)"
            strokeWidth="0.5"
          />
        );
      })}
      {metrics.map((_, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={cx + r * Math.cos(angle)}
            y2={cy + r * Math.sin(angle)}
            stroke="rgba(255,42,42,0.08)"
            strokeWidth="0.5"
          />
        );
      })}
      <polygon
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="rgba(255,42,42,0.12)"
        stroke="rgba(255,42,42,0.7)"
        strokeWidth="1.5"
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#ff2a2a" />
      ))}
      {metrics.map((m, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const lx = cx + (r + 18) * Math.cos(angle);
        const ly = cy + (r + 18) * Math.sin(angle);
        return (
          <text
            key={i}
            x={lx} y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white/30 text-[7px]"
          >
            {m.label.substring(0, 12)}
          </text>
        );
      })}
    </svg>
  );
}

function LineChart({ data, color, label }: { data: number[]; color: string; label: string }) {
  const w = 280;
  const h = 60;
  const pad = 4;
  const maxV = Math.max(...data, 1);
  const minV = Math.min(...data);
  const range = maxV - minV || 1;

  const points = data.map((v, i) => ({
    x: pad + (data.length > 1 ? (i / (data.length - 1)) : 0.5) * (w - pad * 2),
    y: pad + (1 - (v - minV) / range) * (h - pad * 2),
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = pathD + ` L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-white/40 tracking-wider uppercase">{label}</span>
      <svg width={w} height={h}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${label})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} />
        ))}
      </svg>
    </div>
  );
}

function MetricCard({ label, value, unit, progress, color }: {
  label: string; value: string; unit: string; progress: number; color: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3 relative overflow-hidden group hover:border-red-500/20 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/[0.01]" />
      <div className="relative">
        <div className="text-[9px] text-white/30 tracking-[0.15em] uppercase mb-1">{label}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold" style={{ color }}>{value}</span>
          <span className="text-[10px] text-white/30">{unit}</span>
        </div>
        <div className="mt-2 h-1 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min(100, progress)}%`,
              background: `linear-gradient(90deg, ${color}88, ${color})`,
              boxShadow: `0 0 8px ${color}40`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, idx }: { task: TaskReportData; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const dayColors = ["#ff2a2a", "#ff4444", "#ff6666", "#ff8888"];
  const color = dayColors[(task.day - 1) % 4];

  return (
    <div className="border border-white/[0.04] rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}50` }} />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-white/70 truncate">{task.taskName}</div>
          <div className="text-[10px] text-white/25">Jour {task.day} • Task {task.taskIdx + 1}</div>
        </div>
        <div className="text-xs font-mono" style={{ color }}>{task.accuracy.toFixed(1)}%</div>
        <span className="text-white/20 text-xs">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-3 border-t border-white/[0.04] pt-3">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <div className="text-[9px] text-white/25 uppercase tracking-wider">Tests</div>
              <div className="text-sm text-[var(--c-accent)] font-mono">{task.testsPassed}/{task.testsTotal}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-white/25 uppercase tracking-wider">Build</div>
              <div className="text-sm text-[var(--c-accent)] font-mono">{task.buildTime}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-white/25 uppercase tracking-wider">CPU Peak</div>
              <div className="text-sm text-[var(--c-accent)] font-mono">{task.cpuPeak}%</div>
            </div>
          </div>
          <div className="space-y-1.5">
            {task.metrics.map((m, mi) => (
              <div key={mi} className="flex items-center gap-2">
                <span className="text-[9px] text-white/30 w-28 truncate">{m.label}</span>
                <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(m.value / m.max) * 100}%`,
                      background: `linear-gradient(90deg, ${color}88, ${color})`,
                    }}
                  />
                </div>
                <span className="text-[9px] text-white/40 font-mono w-12 text-right">
                  {typeof m.value === "number" && m.value < 1 ? m.value.toFixed(3) : m.value}{m.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN REPORT VIEWER COMPONENT
   ══════════════════════════════════════════════════════════════ */

export default function ReportViewer({ report }: { report: FullReport }) {
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "analytics">("overview");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 400);
    return () => clearTimeout(t);
  }, []);

  const totalTasks = report.tasks.length;
  const maxTasks = 16;
  const daysCompleted = new Set(report.tasks.map((t) => t.day)).size;
  const avgAccuracy = totalTasks > 0
    ? report.tasks.reduce((s, t) => s + t.accuracy, 0) / totalTasks
    : 0;
  const avgCpu = totalTasks > 0
    ? report.tasks.reduce((s, t) => s + t.cpuPeak, 0) / totalTasks
    : 0;
  const avgMem = totalTasks > 0
    ? report.tasks.reduce((s, t) => s + t.memoryUsage, 0) / totalTasks
    : 0;

  // Generate chart data from tasks
  const accuracyData = report.tasks.map((t) => t.accuracy);
  const cpuData = report.tasks.map((t) => t.cpuPeak);
  const memData = report.tasks.map((t) => t.memoryUsage);
  const testData = report.tasks.map((t) => t.testsPassed);

  // Radar chart from latest metrics
  const latestTask = report.tasks[report.tasks.length - 1];
  const radarMetrics = latestTask
    ? latestTask.metrics.map((m) => ({
        label: m.label,
        value: typeof m.value === "number" ? m.value : 0,
        max: m.max,
      }))
    : [];

  const tabs = [
    { id: "overview" as const, label: "VUE D'ENSEMBLE" },
    { id: "tasks" as const, label: "TÂCHES" },
    { id: "analytics" as const, label: "ANALYTICS" },
  ];

  return (
    <div className={`flex flex-col h-full bg-[#060610] transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <div className="shrink-0 border-b border-red-900/20">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center border border-red-500/20">
                <span className="text-[var(--c-accent)] text-sm font-bold">◈</span>
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--c-accent)] border border-[#060610]" />
            </div>
            <div>
              <div className="text-sm text-white/80 tracking-wider font-medium">
                RAPPORT AURA-01
              </div>
              <div className="text-[10px] text-white/25 tracking-wider">
                CERBERUS OS // CLASSIFICATION OMEGA // {report.startTime.split("T")[0]}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-white/20 tracking-wider">PROGRESSION</div>
              <div className="text-lg font-bold text-[var(--c-accent)] font-mono">
                {((totalTasks / maxTasks) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-5 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-[10px] tracking-[0.15em] rounded-t transition-colors
                ${activeTab === tab.id
                  ? "bg-white/[0.04] text-[var(--c-accent)] border-b-2 border-[var(--c-accent)]"
                  : "text-white/25 hover:text-white/50 hover:bg-white/[0.02]"
                }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
        {activeTab === "overview" && (
          <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
            {/* Progress bar */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-white/30 tracking-[0.15em] uppercase">Progression globale du projet</span>
                <span className="text-sm text-[var(--c-accent)] font-mono font-bold">{totalTasks}/{maxTasks} tasks</span>
              </div>
              <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-1000 relative"
                  style={{
                    width: `${(totalTasks / maxTasks) * 100}%`,
                    background: "linear-gradient(90deg, #991a1a, #ff2a2a, #ff4444)",
                    boxShadow: "0 0 12px rgba(0,212,255,0.3)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
                </div>
              </div>
              <div className="flex justify-between mt-2">
                {[1, 2, 3, 4].map((d) => {
                  const dayTasks = report.tasks.filter((t) => t.day === d).length;
                  return (
                    <div key={d} className="text-center">
                      <div className="text-[9px] text-white/20">JOUR {d}</div>
                      <div className={`text-[11px] font-mono ${dayTasks > 0 ? "text-[var(--c-accent)]" : "text-white/10"}`}>
                        {dayTasks}/4
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-4 gap-3">
              <MetricCard label="Accuracy Moy." value={avgAccuracy.toFixed(1)} unit="%" progress={avgAccuracy} color="#ff2a2a" />
              <MetricCard label="Jours" value={String(daysCompleted)} unit="/4" progress={(daysCompleted / 4) * 100} color="#ff4444" />
              <MetricCard label="CPU Moy." value={avgCpu.toFixed(0)} unit="%" progress={avgCpu} color="#ff6666" />
              <MetricCard label="Memoire" value={avgMem.toFixed(1)} unit="GB" progress={(avgMem / 64) * 100} color="#ff8888" />
            </div>

            {/* Charts row */}
            {totalTasks > 1 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                  <LineChart data={accuracyData} color="#ff2a2a" label="Accuracy par tâche" />
                </div>
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                  <LineChart data={cpuData} color="#ff4444" label="CPU peak par tâche" />
                </div>
              </div>
            )}

            {/* Radar + Bar charts */}
            {radarMetrics.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex flex-col items-center">
                  <span className="text-[10px] text-white/40 tracking-wider uppercase mb-2 self-start">Profil AURA-01</span>
                  <RadarChart metrics={radarMetrics} />
                </div>
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                  <BarChart data={testData} maxVal={12} color="#ff6666" label="Tests réussis par tâche" />
                </div>
              </div>
            )}

            {/* Status grid */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
              <div className="text-[10px] text-white/30 tracking-[0.15em] uppercase mb-3">Statut des systèmes</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Neural-Core", status: daysCompleted >= 1 ? "ONLINE" : "OFFLINE", active: daysCompleted >= 1 },
                  { label: "Biometric Suite", status: daysCompleted >= 2 ? "CALIBRATED" : "STANDBY", active: daysCompleted >= 2 },
                  { label: "Cognitive Engine", status: daysCompleted >= 3 ? "ACTIVE" : "DORMANT", active: daysCompleted >= 3 },
                  { label: "Social Module", status: daysCompleted >= 4 ? "DEPLOYED" : "LOCKED", active: daysCompleted >= 4 },
                  { label: "Encryption", status: "AES-512", active: true },
                  { label: "Containment", status: totalTasks > 8 ? "NOMINAL" : "ACTIVE", active: true },
                ].map((sys, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded bg-white/[0.01]">
                    <div className={`w-1.5 h-1.5 rounded-full ${sys.active ? "bg-[var(--c-accent)] shadow-[0_0_4px_rgba(255,42,42,0.5)]" : "bg-white/10"}`} />
                    <span className="text-[10px] text-white/40">{sys.label}</span>
                    <span className={`text-[9px] font-mono ml-auto ${sys.active ? "text-[var(--c-accent)]/70" : "text-white/15"}`}>{sys.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-2 animate-[fadeIn_0.3s_ease-out]">
            {report.tasks.length === 0 ? (
              <div className="text-center py-12 text-white/15 text-sm">Aucune tâche exportée</div>
            ) : (
              report.tasks.map((task, i) => <TaskRow key={i} task={task} idx={i} />)
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
            {totalTasks > 0 ? (
              <>
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                  <LineChart data={memData} color="#ff4444" label="Utilisation mémoire (GB)" />
                </div>
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                  <BarChart data={accuracyData} maxVal={100} color="#ff2a2a" label="Accuracy globale" />
                </div>
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                  <BarChart data={cpuData} maxVal={100} color="#ff6666" label="CPU utilisation" />
                </div>

                {/* Summary table */}
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                  <div className="text-[10px] text-white/30 tracking-[0.15em] uppercase mb-3">Résumé analytique</div>
                  <div className="space-y-1">
                    {[
                      { label: "Tâches complétées", value: `${totalTasks} / ${maxTasks}` },
                      { label: "Jours d'opération", value: `${daysCompleted} / 4` },
                      { label: "Accuracy moyenne", value: `${avgAccuracy.toFixed(2)}%` },
                      { label: "CPU moyen", value: `${avgCpu.toFixed(1)}%` },
                      { label: "Mémoire moyenne", value: `${avgMem.toFixed(1)} GB` },
                      { label: "Tests réussis", value: `${report.tasks.reduce((s, t) => s + t.testsPassed, 0)} / ${report.tasks.reduce((s, t) => s + t.testsTotal, 0)}` },
                      { label: "Statut mission", value: totalTasks >= 16 ? "COMPLETE" : "EN COURS" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                        <span className="text-[11px] text-white/40">{row.label}</span>
                        <span className="text-[11px] text-[var(--c-accent)]/80 font-mono">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-white/15 text-sm">Pas encore de données analytiques</div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-5 py-2 border-t border-red-900/15 flex items-center justify-between">
        <span className="text-[9px] text-white/15 tracking-wider">
          CERBERUS OS v12.0.4 // ECHO_OS v3.7.1 // CLASSIFICATION OMEGA
        </span>
        <span className="text-[9px] text-white/15 tracking-wider font-mono">
          {report.tasks.length > 0 ? `Dernier export: ${report.tasks[report.tasks.length - 1].timestamp.split("T")[1]?.substring(0, 8) || "N/A"}` : "EN ATTENTE"}
        </span>
      </div>
    </div>
  );
}
