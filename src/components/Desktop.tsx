"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Terminal from "./Terminal";
import AdminTerminal from "./AdminTerminal";
import AuraTerminal from "./AuraTerminal";
import ReportViewer from "./ReportViewer";
import TrackerDashboard from "./TrackerDashboard";
import EffectsLayer from "./EffectsLayer";
import { sounds } from "@/lib/sounds";
import type { FullReport } from "@/lib/task-sequences";

interface Win {
  id: string;
  type: "terminal" | "admin-terminal" | "aura-terminal" | "report" | "tracker";
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minimized: boolean;
  focused: boolean;
}

interface CtxMenu { x: number; y: number }

type DragMode =
  | { kind: "move"; id: string; ox: number; oy: number }
  | { kind: "resize"; id: string; dir: string; sx: number; sy: number; sw: number; sh: number; sLeft: number; sTop: number };

const MIN_W = 420;
const MIN_H = 280;

export default function Desktop({ session }: { session: "gp-two" | "admin" }) {
  const [wins, setWins] = useState<Win[]>([]);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [startMenu, setStartMenu] = useState(false);
  const [ctx, setCtx] = useState<CtxMenu | null>(null);
  const [reportData, setReportData] = useState<FullReport | null>(null);
  const dragRef = useRef<DragMode | null>(null);
  const counter = useRef(0);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = () => { setCtx(null); setStartMenu(false); };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      e.preventDefault();
      if (d.kind === "move") {
        setWins((p) => p.map((w) => w.id === d.id ? { ...w, x: e.clientX - d.ox, y: Math.max(0, e.clientY - d.oy) } : w));
      } else {
        setWins((p) =>
          p.map((w) => {
            if (w.id !== d.id) return w;
            let { sLeft: nx, sTop: ny, sw: nw, sh: nh } = d;
            const dx = e.clientX - d.sx;
            const dy = e.clientY - d.sy;
            if (d.dir.includes("e")) nw = Math.max(MIN_W, d.sw + dx);
            if (d.dir.includes("s")) nh = Math.max(MIN_H, d.sh + dy);
            if (d.dir.includes("w")) { nw = Math.max(MIN_W, d.sw - dx); nx = d.sLeft + (d.sw - nw); }
            if (d.dir.includes("n")) { nh = Math.max(MIN_H, d.sh - dy); ny = d.sTop + (d.sh - nh); }
            return { ...w, x: nx, y: ny, w: nw, h: nh };
          })
        );
      }
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  const focus = useCallback((id: string) => {
    setWins((p) => p.map((w) => ({ ...w, focused: w.id === id })));
  }, []);

  const openWin = useCallback((type: Win["type"]) => {
    counter.current += 1;
    const prefix = type === "admin-terminal" ? "ADM" : type === "aura-terminal" ? "AURA" : type === "report" ? "RPT" : type === "tracker" ? "TRK" : "TERM";
    const id = `${prefix}-${String(counter.current).padStart(3, "0")}`;
    sounds.windowOpen();
    setWins((p) => [
      ...p.map((w) => ({ ...w, focused: false })),
      {
        id, type,
        title: type === "admin-terminal" ? "Admin Control" : type === "aura-terminal" ? "AURA-01 Lab" : type === "report" ? "Rapport AURA-01" : type === "tracker" ? "Project Tracker" : "Terminal",
        x: 100 + (counter.current % 5) * 30,
        y: 60 + (counter.current % 5) * 30,
        w: type === "aura-terminal" ? 900 : type === "report" ? 950 : type === "tracker" ? 1000 : 780,
        h: type === "aura-terminal" ? 600 : type === "report" ? 650 : type === "tracker" ? 680 : 500,
        minimized: false, focused: true,
      },
    ]);
  }, []);

  const closeWin = useCallback((id: string) => {
    sounds.windowClose();
    setWins((p) => p.filter((w) => w.id !== id));
  }, []);

  const toggleMin = useCallback((id: string) => {
    setWins((p) =>
      p.map((w) =>
        w.id === id
          ? { ...w, minimized: !w.minimized, focused: !w.minimized }
          : w.minimized ? w : { ...w, focused: false }
      )
    );
  }, []);

  const startDrag = useCallback((id: string, e: React.MouseEvent) => {
    focus(id);
    const win = wins.find((w) => w.id === id);
    if (!win) return;
    dragRef.current = { kind: "move", id, ox: e.clientX - win.x, oy: e.clientY - win.y };
  }, [wins, focus]);

  const startResize = useCallback((id: string, dir: string, e: React.MouseEvent) => {
    e.stopPropagation();
    focus(id);
    const win = wins.find((w) => w.id === id);
    if (!win) return;
    dragRef.current = { kind: "resize", id, dir, sx: e.clientX, sy: e.clientY, sw: win.w, sh: win.h, sLeft: win.x, sTop: win.y };
  }, [wins, focus]);

  const isAdmin = session === "admin";

  const handleExport = useCallback((report: FullReport) => {
    setReportData({ ...report, tasks: [...report.tasks] });
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" onContextMenu={(e) => { e.preventDefault(); setCtx({ x: e.clientX, y: e.clientY }); }}>
      <EffectsLayer />

      {/* Desktop area */}
      <div className="flex-1 min-h-0 relative overflow-hidden bg-[#080809]">
        {/* Wallpaper */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cerberus-logo.png" alt="" className="w-[320px] h-[320px] object-contain opacity-[0.15]" />
        </div>

        {/* Desktop icons */}
        <div className="absolute top-8 left-8 flex flex-col gap-3">
          <button
            className="flex flex-col items-center gap-2 p-2 w-[72px] group"
            onDoubleClick={() => openWin("terminal")}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-all group-hover:scale-110">
              <span className="text-[var(--c-accent)] text-xl font-bold drop-shadow-[0_0_6px_var(--c-accent)]">&gt;_</span>
            </div>
            <span className="text-[11px] text-white/50 group-hover:text-white/80 transition-colors leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">Terminal</span>
          </button>
          {isAdmin && (
            <button
              className="flex flex-col items-center gap-2 p-2 w-[72px] group"
              onDoubleClick={() => openWin("admin-terminal")}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-all group-hover:scale-110">
                <span className="text-red-400 text-xl font-bold drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]">⚡</span>
              </div>
              <span className="text-[11px] text-white/50 group-hover:text-red-400/90 transition-colors leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">Admin</span>
            </button>
          )}
          {/* AURA-01 Lab icon */}
          <button
            className="flex flex-col items-center gap-2 p-2 w-[72px] group"
            onDoubleClick={() => openWin("aura-terminal")}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-all group-hover:scale-110">
              <span className="text-[var(--c-accent)] text-xl font-bold drop-shadow-[0_0_8px_rgba(255,42,42,0.6)]">◈</span>
            </div>
            <span className="text-[11px] text-white/50 group-hover:text-[var(--c-accent)]/90 transition-colors leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">AURA Lab</span>
          </button>
          {/* Report file icon - appears after first export */}
          {reportData && reportData.tasks.length > 0 && (
            <button
              className="flex flex-col items-center gap-2 p-2 w-[72px] group relative"
              onDoubleClick={() => openWin("report")}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 relative">
                <span className="text-[var(--c-accent)] text-xl font-bold drop-shadow-[0_0_8px_rgba(255,42,42,0.6)]">📊</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--c-accent)] animate-pulse shadow-[0_0_6px_rgba(255,42,42,0.5)]" />
              </div>
              <span className="text-[11px] text-white/50 group-hover:text-[var(--c-accent)]/90 transition-colors leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">Rapport</span>
            </button>
          )}
          {/* Project Tracker icon */}
          <button
            className="flex flex-col items-center gap-2 p-2 w-[72px] group"
            onDoubleClick={() => openWin("tracker")}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-all group-hover:scale-110">
              <span className="text-[var(--c-accent)] text-xl font-bold drop-shadow-[0_0_8px_rgba(255,42,42,0.6)]">📈</span>
            </div>
            <span className="text-[11px] text-white/50 group-hover:text-[var(--c-accent)]/90 transition-colors leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">Tracker</span>
          </button>
        </div>

        {/* Windows */}
        {wins.map((win) =>
          win.minimized ? null : (
            <div
              key={win.id}
              className={`absolute flex flex-col rounded-lg overflow-hidden transition-shadow duration-200
                ${win.focused
                  ? "z-30 shadow-[0_12px_50px_rgba(0,0,0,0.7),0_0_1px_rgba(255,42,42,0.3)]"
                  : "z-20 opacity-90 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                }
                bg-[#0e0e11] border border-white/[0.06]`}
              style={{ left: win.x, top: win.y, width: win.w, height: win.h }}
              onMouseDown={() => focus(win.id)}
            >
              {/* Title bar */}
              <div
                className="flex items-center justify-between px-4 h-10 bg-[#0e0e11] border-b border-white/[0.05] select-none cursor-move shrink-0"
                onMouseDown={(e) => startDrag(win.id, e)}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${win.focused ? "bg-[var(--c-accent)]" : "bg-white/10"}`} />
                  <span className="text-xs text-white/50 tracking-wider">{win.title}</span>
                  <span className="text-[10px] text-white/20">{win.id}</span>
                </div>
                <div className="flex gap-2">
                  <button className="w-7 h-6 flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 rounded text-xs transition-colors" onClick={() => toggleMin(win.id)}>─</button>
                  <button className="w-7 h-6 flex items-center justify-center text-white/30 hover:text-white hover:bg-red-500/80 rounded text-xs transition-colors" onClick={() => closeWin(win.id)}>✕</button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {win.type === "terminal" && <Terminal windowId={win.id} onClose={closeWin} />}
                {win.type === "admin-terminal" && <AdminTerminal />}
                {win.type === "aura-terminal" && <AuraTerminal onExport={handleExport} />}
                {win.type === "report" && reportData && <ReportViewer report={reportData} />}
                {win.type === "tracker" && <TrackerDashboard />}
              </div>

              {/* Resize handles */}
              {(["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const).map((dir) => (
                <div key={dir} className={`resize-handle resize-${dir}`} onMouseDown={(e) => startResize(win.id, dir, e)} />
              ))}
            </div>
          )
        )}

        {/* Context menu */}
        {ctx && (
          <div className="absolute z-50 min-w-[200px] py-1.5 rounded-lg bg-[#141418] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
            style={{ left: ctx.x, top: ctx.y }} onClick={(e) => e.stopPropagation()}>
            <button className="w-full px-4 py-2.5 text-left text-xs text-white/60 hover:text-white hover:bg-white/[0.04] tracking-wider flex items-center gap-3 transition-colors"
              onClick={() => { openWin("terminal"); setCtx(null); }}>
              <span className="text-[var(--c-accent)]">&gt;_</span> Nouveau terminal
            </button>
            {isAdmin && (
              <button className="w-full px-4 py-2.5 text-left text-xs text-white/60 hover:text-white hover:bg-white/[0.04] tracking-wider flex items-center gap-3 transition-colors"
                onClick={() => { openWin("admin-terminal"); setCtx(null); }}>
                <span className="text-red-400">⚡</span> Admin terminal
              </button>
            )}
            <button className="w-full px-4 py-2.5 text-left text-xs text-white/60 hover:text-white hover:bg-white/[0.04] tracking-wider flex items-center gap-3 transition-colors"
              onClick={() => { openWin("aura-terminal"); setCtx(null); }}>
              <span className="text-[var(--c-accent)]">◈</span> AURA-01 Lab
            </button>
            <button className="w-full px-4 py-2.5 text-left text-xs text-white/60 hover:text-white hover:bg-white/[0.04] tracking-wider flex items-center gap-3 transition-colors"
              onClick={() => { openWin("tracker"); setCtx(null); }}>
              <span className="text-[var(--c-accent)]">📈</span> Project Tracker
            </button>
            <div className="h-px bg-white/[0.05] mx-3 my-1" />
            <div className="px-4 py-2 text-[10px] text-white/15 tracking-wider">
              CERBERUS OS v12.0.4
            </div>
          </div>
        )}
      </div>

      {/* Taskbar */}
      <div className="h-12 min-h-[48px] flex items-center px-3 bg-[#0a0a0d]/95 backdrop-blur-md border-t border-[var(--c-accent)]/15 z-40 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        {/* Start */}
        <div className="relative shrink-0">
          <button
            className="flex items-center gap-2.5 px-4 h-10 rounded-lg hover:bg-white/[0.06] transition-colors"
            onClick={(e) => { e.stopPropagation(); setStartMenu(!startMenu); }}
          >
            <div className={`w-3 h-3 rounded-full shrink-0 shadow-[0_0_8px] ${isAdmin ? "bg-red-500 shadow-red-500/50" : "bg-[var(--c-accent)] shadow-[var(--c-accent)]/50"}`} />
            <span className="text-[13px] text-white/70 tracking-[0.15em] font-medium">{isAdmin ? "ADMIN" : "CERBERUS"}</span>
          </button>

          {startMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-64 rounded-lg bg-[#141418] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6)] py-1.5"
              onClick={(e) => e.stopPropagation()}>
              <div className="px-4 py-3 border-b border-white/[0.05]">
                <div className="text-[13px] text-[var(--c-accent)] tracking-[0.15em] font-bold">
                  {isAdmin ? "ADMIN SESSION" : "CERBERUS OS"}
                </div>
                <div className="text-[11px] text-white/25 mt-1">
                  {isAdmin ? "Full control mode" : "Session: GP-TWO"}
                </div>
              </div>
              <button className="w-full px-4 py-2.5 text-left text-[13px] text-white/50 hover:text-white hover:bg-white/[0.05] tracking-wider flex items-center gap-3 transition-colors"
                onClick={() => { openWin("terminal"); setStartMenu(false); }}>
                <span className="text-[var(--c-accent)]">&gt;_</span> Terminal
              </button>
              {isAdmin && (
                <button className="w-full px-4 py-2.5 text-left text-[13px] text-white/50 hover:text-white hover:bg-white/[0.05] tracking-wider flex items-center gap-3 transition-colors"
                  onClick={() => { openWin("admin-terminal"); setStartMenu(false); }}>
                  <span className="text-red-400">⚡</span> Admin Control
                </button>
              )}
              <button className="w-full px-4 py-2.5 text-left text-[13px] text-white/50 hover:text-white hover:bg-white/[0.05] tracking-wider flex items-center gap-3 transition-colors"
                onClick={() => { openWin("aura-terminal"); setStartMenu(false); }}>
                <span className="text-[var(--c-accent)]">◈</span> AURA-01 Lab
              </button>
              <button className="w-full px-4 py-2.5 text-left text-[13px] text-white/50 hover:text-white hover:bg-white/[0.05] tracking-wider flex items-center gap-3 transition-colors"
                onClick={() => { openWin("tracker"); setStartMenu(false); }}>
                <span className="text-[var(--c-accent)]">📈</span> Project Tracker
              </button>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-white/[0.08] mx-2 shrink-0" />

        {/* Taskbar windows */}
        <div className="flex-1 flex items-center gap-1 px-1 overflow-x-auto min-w-0">
          {wins.map((win) => (
            <button
              key={win.id}
              className={`flex items-center gap-2 px-3.5 h-9 rounded-lg text-[12px] tracking-wider transition-all shrink-0
                ${win.focused && !win.minimized
                  ? "text-white bg-white/[0.08] shadow-[inset_0_-2px_0_var(--c-accent)]"
                  : "text-white/35 hover:text-white/60 hover:bg-white/[0.05]"
                }`}
              onClick={() => toggleMin(win.id)}
            >
              <span className={`shrink-0 ${win.type === "admin-terminal" ? "text-red-400" : win.type === "aura-terminal" ? "text-[var(--c-accent)]" : win.type === "report" ? "text-[var(--c-accent)]" : win.type === "tracker" ? "text-[var(--c-accent)]" : "text-[var(--c-accent)]"}`}>
                {win.type === "admin-terminal" ? "⚡" : win.type === "aura-terminal" ? "◈" : win.type === "report" ? "📊" : win.type === "tracker" ? "📈" : ">_"}
              </span>
              <span className="max-w-[120px] truncate">{win.title}</span>
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-white/[0.08] mx-2 shrink-0" />

        {/* Tray */}
        <div className="flex items-center gap-3 px-3 shrink-0">
          <div className="w-2 h-2 rounded-full bg-[var(--c-accent)]/70 shadow-[0_0_6px_rgba(255,42,42,0.4)]" />
          <div className="text-right leading-tight">
            <div className="text-[13px] text-white/60 tabular-nums font-medium">{time}</div>
            <div className="text-[10px] text-white/30">{date}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
