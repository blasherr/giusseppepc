"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Terminal from "./Terminal";

interface WindowState {
  id: string;
  type: "terminal";
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  focused: boolean;
}

interface ContextMenu {
  x: number;
  y: number;
}

export default function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [dragState, setDragState] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const windowCounter = useRef(0);

  // Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close context menu & start menu on click
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setStartMenuOpen(false);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Drag handling
  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === dragState.id
            ? { ...w, x: e.clientX - dragState.offsetX, y: e.clientY - dragState.offsetY }
            : w
        )
      );
    };

    const handleMouseUp = () => setDragState(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState]);

  const openTerminal = useCallback(() => {
    windowCounter.current += 1;
    const id = `TERM-${String(windowCounter.current).padStart(3, "0")}`;
    setWindows((prev) => [
      ...prev.map((w) => ({ ...w, focused: false })),
      {
        id,
        type: "terminal" as const,
        title: `CERBERUS TERMINAL // ${id}`,
        x: 100 + (windowCounter.current % 5) * 30,
        y: 60 + (windowCounter.current % 5) * 30,
        width: 750,
        height: 480,
        minimized: false,
        focused: true,
      },
    ]);
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => ({ ...w, focused: w.id === id }))
    );
  }, []);

  const toggleMinimize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, minimized: !w.minimized, focused: !w.minimized }
          : w.minimized
          ? w
          : { ...w, focused: false }
      )
    );
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleStartDrag = useCallback(
    (id: string, e: React.MouseEvent) => {
      focusWindow(id);
      setDragState({
        id,
        offsetX: e.clientX - (windows.find((w) => w.id === id)?.x ?? 0),
        offsetY: e.clientY - (windows.find((w) => w.id === id)?.y ?? 0),
      });
    },
    [windows, focusWindow]
  );

  return (
    <div className="scanlines fixed inset-0 flex flex-col" onContextMenu={handleContextMenu}>
      {/* Desktop area */}
      <div
        ref={desktopRef}
        className="flex-1 relative overflow-hidden"
        style={{
          background: "#0a0a0a",
        }}
      >
        {/* Wallpaper - Cerberus Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://imgg.fr/r/HiqDM5yF.png"
            alt="Cerberus"
            className="max-w-[60%] max-h-[60%] object-contain opacity-30"
            style={{
              filter: "drop-shadow(0 0 40px rgba(255, 0, 51, 0.2))",
            }}
            crossOrigin="anonymous"
          />
        </div>

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,0,51,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,51,0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Desktop icons */}
        <div className="absolute top-6 left-6 flex flex-col gap-4">
          <button
            className="flex flex-col items-center gap-1 p-3 rounded hover:bg-[#ff0033]/10 transition-all duration-200 group w-20"
            onDoubleClick={openTerminal}
          >
            <div className="w-12 h-12 flex items-center justify-center border border-[#ff0033]/30 bg-[#111]/80 
                            group-hover:border-[#ff0033]/60 group-hover:shadow-[0_0_15px_rgba(255,0,51,0.2)] transition-all">
              <span className="text-[#ff0033] text-lg font-bold">&gt;_</span>
            </div>
            <span className="text-[10px] text-[#e0e0e0]/70 tracking-wider group-hover:text-[#ff0033]/90 transition-colors">
              TERMINAL
            </span>
          </button>
        </div>

        {/* Windows */}
        {windows.map((win) =>
          win.minimized ? null : (
            <div
              key={win.id}
              className={`absolute window-chrome rounded-sm overflow-hidden flex flex-col transition-shadow duration-200
                ${win.focused ? "z-30 shadow-[0_0_40px_rgba(255,0,51,0.15)]" : "z-20 opacity-90"}`}
              style={{
                left: win.x,
                top: win.y,
                width: win.width,
                height: win.height,
              }}
              onMouseDown={() => focusWindow(win.id)}
            >
              {/* Title bar */}
              <div
                className="flex items-center justify-between px-3 py-1.5 bg-[#0d0d0d] border-b border-[#ff0033]/20 cursor-move select-none"
                onMouseDown={(e) => handleStartDrag(win.id, e)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#ff0033]/60 animate-pulse" />
                  <span className="text-[10px] text-[#ff0033]/60 tracking-[0.2em]">
                    {win.title}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    className="w-4 h-4 flex items-center justify-center text-[#ff0033]/40 hover:text-[#ff0033] hover:bg-[#ff0033]/10 transition-all text-[10px]"
                    onClick={() => toggleMinimize(win.id)}
                  >
                    ─
                  </button>
                  <button
                    className="w-4 h-4 flex items-center justify-center text-[#ff0033]/40 hover:text-white hover:bg-[#ff0033] transition-all text-[10px]"
                    onClick={() => closeWindow(win.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Window content */}
              <div className="flex-1 overflow-hidden">
                {win.type === "terminal" && (
                  <Terminal windowId={win.id} onClose={closeWindow} />
                )}
              </div>

              {/* Resize handle visual */}
              <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize">
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-[#ff0033]/30" />
              </div>
            </div>
          )
        )}

        {/* Context menu */}
        {contextMenu && (
          <div
            className="context-menu absolute z-50 min-w-[200px] py-1 rounded-sm"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="context-menu-item w-full px-4 py-2 text-left text-xs text-[#e0e0e0]/70 tracking-wider flex items-center gap-3 transition-colors"
              onClick={() => {
                openTerminal();
                setContextMenu(null);
              }}
            >
              <span className="text-[#ff0033]">&gt;_</span> Open Terminal
            </button>
            <div className="h-[1px] bg-[#ff0033]/10 mx-2 my-1" />
            <button
              className="context-menu-item w-full px-4 py-2 text-left text-xs text-[#e0e0e0]/70 tracking-wider flex items-center gap-3 transition-colors"
              onClick={() => setContextMenu(null)}
            >
              <span className="text-[#ff0033]">⟳</span> Refresh Desktop
            </button>
            <button
              className="context-menu-item w-full px-4 py-2 text-left text-xs text-[#e0e0e0]/70 tracking-wider flex items-center gap-3 transition-colors"
              onClick={() => setContextMenu(null)}
            >
              <span className="text-[#ff0033]">⚙</span> System Settings
            </button>
            <div className="h-[1px] bg-[#ff0033]/10 mx-2 my-1" />
            <button
              className="context-menu-item w-full px-4 py-2 text-left text-xs text-[#e0e0e0]/30 tracking-wider flex items-center gap-3"
              disabled
            >
              <span className="text-[#ff0033]/30">ⓘ</span> CERBERUS OS v12.0.4
            </button>
          </div>
        )}
      </div>

      {/* TASKBAR */}
      <div className="taskbar-glass h-12 flex items-center justify-between px-2 z-40 relative">
        {/* Start button */}
        <div className="relative">
          <button
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#ff0033]/10 transition-all duration-200 border border-transparent hover:border-[#ff0033]/20"
            onClick={(e) => {
              e.stopPropagation();
              setStartMenuOpen(!startMenuOpen);
            }}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#ff0033]">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
                      stroke="#ff0033" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[10px] text-[#ff0033]/80 tracking-[0.2em] hidden sm:inline">
              CERBERUS
            </span>
          </button>

          {/* Start menu */}
          {startMenuOpen && (
            <div
              className="absolute bottom-full left-0 mb-1 w-64 context-menu py-2 rounded-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-[#ff0033]/10 mb-1">
                <div className="text-xs text-[#ff0033] tracking-[0.3em] font-bold">
                  CERBERUS OS
                </div>
                <div className="text-[10px] text-[#e0e0e0]/30 tracking-wider mt-0.5">
                  SESSION: GP-TWO // NODE: CRB-ALPHA-07
                </div>
              </div>

              <button
                className="context-menu-item w-full px-4 py-2.5 text-left text-xs text-[#e0e0e0]/70 tracking-wider flex items-center gap-3 transition-colors"
                onClick={() => {
                  openTerminal();
                  setStartMenuOpen(false);
                }}
              >
                <span className="text-[#ff0033] text-sm">&gt;_</span> Terminal
              </button>
              <button
                className="context-menu-item w-full px-4 py-2.5 text-left text-xs text-[#e0e0e0]/40 tracking-wider flex items-center gap-3"
                disabled
              >
                <span className="text-[#ff0033]/30 text-sm">📁</span> Files (Coming Soon)
              </button>
              <button
                className="context-menu-item w-full px-4 py-2.5 text-left text-xs text-[#e0e0e0]/40 tracking-wider flex items-center gap-3"
                disabled
              >
                <span className="text-[#ff0033]/30 text-sm">⚙</span> Settings (Coming Soon)
              </button>

              <div className="h-[1px] bg-[#ff0033]/10 mx-2 my-1" />
              <div className="px-4 py-2 text-[10px] text-[#ff0033]/20 tracking-widest">
                v12.0.4 // QUANTUM BUILD
              </div>
            </div>
          )}
        </div>

        {/* Taskbar windows */}
        <div className="flex-1 flex items-center gap-1 px-2 overflow-x-auto">
          {windows.map((win) => (
            <button
              key={win.id}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] tracking-wider transition-all duration-200 border
                ${
                  win.focused && !win.minimized
                    ? "bg-[#ff0033]/15 border-[#ff0033]/40 text-[#ff0033]"
                    : "bg-transparent border-transparent text-[#e0e0e0]/40 hover:bg-[#ff0033]/5 hover:text-[#e0e0e0]/60"
                }`}
              onClick={() => toggleMinimize(win.id)}
            >
              <span className="text-[#ff0033]">&gt;_</span>
              <span className="max-w-[100px] truncate">{win.id}</span>
              {win.focused && !win.minimized && (
                <div className="w-1 h-1 rounded-full bg-[#ff0033] animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* System tray */}
        <div className="flex items-center gap-3 px-3">
          {/* Network indicator */}
          <div className="flex items-center gap-1.5" title="Network: Connected">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-[#e0e0e0]/30 tracking-wider hidden md:inline">
              NET
            </span>
          </div>

          {/* Security */}
          <div className="flex items-center gap-1.5" title="Security: Active">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff0033] animate-pulse" />
            <span className="text-[10px] text-[#e0e0e0]/30 tracking-wider hidden md:inline">
              SEC
            </span>
          </div>

          {/* Separator */}
          <div className="w-[1px] h-5 bg-[#ff0033]/15" />

          {/* Clock */}
          <div className="text-right">
            <div className="text-[11px] text-[#ff0033]/80 tracking-wider tabular-nums">
              {time}
            </div>
            <div className="text-[9px] text-[#e0e0e0]/30 tracking-wider tabular-nums">
              {date}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
