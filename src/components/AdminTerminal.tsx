"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { bridge, type AdminCommand } from "@/lib/session-bridge";
import { sounds } from "@/lib/sounds";

interface LogEntry {
  timestamp: number;
  text: string;
  type?: "sent" | "user" | "error" | "info";
}

const SCREAMER_PRESETS: Record<string, string> = {
  ghost: "https://i.imgur.com/J3G3oXa.jpeg",
  static: "https://i.imgur.com/hN0bR8R.gif",
  skull: "https://i.imgur.com/NJHvKNQ.jpeg",
};

export default function AdminTerminal() {
  const [msgText, setMsgText] = useState("");
  const [screamerPreset, setScreamerPreset] = useState("ghost");
  const [screamerUrl, setScreamerUrl] = useState("");
  const [blackoutDur, setBlackoutDur] = useState(3000);
  const [glitchDur, setGlitchDur] = useState(2000);
  const [tab, setTab] = useState<"controls" | "logs">("controls");
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: Date.now(), text: "Panel admin pret.", type: "info" },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [logs]);

  // Listen to user events
  useEffect(() => {
    const handler = (data: unknown) => {
      const d = data as { type: string; text?: string; timestamp: number };
      if (d.type === "terminal-line") {
        setLogs((p) => [...p, { timestamp: d.timestamp, text: d.text ?? "", type: "user" }]);
      } else if (d.type === "terminal-clear") {
        setLogs((p) => [...p, { timestamp: d.timestamp, text: "Terminal clear", type: "user" }]);
      }
    };
    bridge.on("user:*", handler);
    return () => bridge.off("user:*", handler);
  }, []);

  const addLog = useCallback((text: string, type: LogEntry["type"] = "info") => {
    setLogs((p) => [...p, { timestamp: Date.now(), text, type }]);
  }, []);

  const sendCmd = useCallback((cmd: AdminCommand) => {
    bridge.sendAsAdmin(cmd);
    sounds.notification();
  }, []);

  const fmtTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-[#060608]">
      {/* Header */}
      <div className="px-4 py-2.5 bg-[#0c0c10] border-b border-red-500/15 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,42,42,0.6)] animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-red-400/80 font-medium">
            Admin Control
          </span>
        </div>
        <div className="flex gap-1">
          {(["controls", "logs"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded text-[9px] uppercase tracking-[0.2em] transition-all ${
                tab === t
                  ? "bg-red-500/15 text-red-400 border border-red-500/30"
                  : "text-white/30 hover:text-white/50 border border-transparent"
              }`}
            >
              {t === "controls" ? "Controles" : "Logs"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === "controls" ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">

          {/* === GP-TWO Section === */}
          <Section title="GP-TWO" icon="user">
            <ActionButton
              label="Connexion GP-TWO"
              description="Simule la connexion de GP-TWO"
              color="emerald"
              onClick={() => {
                sendCmd({ type: "gptwo-connect" });
                addLog("GP-TWO connexion envoyee", "sent");
              }}
            />
          </Section>

          {/* === Messages Section === */}
          <Section title="Messages" icon="message">
            <div className="space-y-2">
              <input
                type="text"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && msgText.trim()) {
                    sendCmd({ type: "message", text: msgText });
                    addLog(`Message: "${msgText}"`, "sent");
                    setMsgText("");
                  }
                }}
                placeholder="Ecrire un message..."
                className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.08] text-[12px] text-white/80 placeholder:text-white/20 focus:border-red-500/30 focus:outline-none transition-colors"
              />
              <ActionButton
                label="Envoyer message"
                color="blue"
                disabled={!msgText.trim()}
                onClick={() => {
                  if (!msgText.trim()) return;
                  sendCmd({ type: "message", text: msgText });
                  addLog(`Message: "${msgText}"`, "sent");
                  setMsgText("");
                }}
              />
            </div>
          </Section>

          {/* === Effets Visuels Section === */}
          <Section title="Effets visuels" icon="effect">
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                label="Blackout"
                description={`${blackoutDur}ms`}
                color="white"
                onClick={() => {
                  sendCmd({ type: "blackout", duration: blackoutDur });
                  addLog(`Blackout ${blackoutDur}ms`, "sent");
                }}
              />
              <ActionButton
                label="Glitch"
                description={`${glitchDur}ms`}
                color="purple"
                onClick={() => {
                  sendCmd({ type: "glitch", duration: glitchDur });
                  addLog(`Glitch ${glitchDur}ms`, "sent");
                }}
              />
              <ActionButton
                label="BSOD"
                description="Ecran bleu"
                color="blue"
                onClick={() => {
                  sendCmd({ type: "bsod" });
                  addLog("BSOD declenche", "sent");
                }}
              />
            </div>

            {/* Duration sliders */}
            <div className="mt-2 space-y-2">
              <SliderControl
                label="Blackout"
                value={blackoutDur}
                min={500}
                max={10000}
                step={500}
                onChange={setBlackoutDur}
              />
              <SliderControl
                label="Glitch"
                value={glitchDur}
                min={500}
                max={10000}
                step={500}
                onChange={setGlitchDur}
              />
            </div>
          </Section>

          {/* === Screamer Section === */}
          <Section title="Screamer" icon="danger">
            <div className="space-y-2">
              {/* Preset buttons */}
              <div className="flex gap-1.5">
                {Object.keys(SCREAMER_PRESETS).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setScreamerPreset(preset)}
                    className={`flex-1 px-2 py-1.5 rounded text-[9px] uppercase tracking-[0.15em] border transition-all ${
                      screamerPreset === preset
                        ? "bg-red-500/15 text-red-400 border-red-500/30"
                        : "bg-white/[0.02] text-white/30 border-white/[0.06] hover:border-white/[0.12]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <ActionButton
                label={`Screamer — ${screamerPreset}`}
                color="red"
                onClick={() => {
                  sendCmd({ type: "screamer", preset: screamerPreset, url: SCREAMER_PRESETS[screamerPreset] });
                  addLog(`Screamer: ${screamerPreset}`, "sent");
                }}
              />

              {/* Custom URL */}
              <div className="pt-1 border-t border-white/[0.04]">
                <input
                  type="text"
                  value={screamerUrl}
                  onChange={(e) => setScreamerUrl(e.target.value)}
                  placeholder="URL image custom..."
                  className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.08] text-[11px] text-white/80 placeholder:text-white/20 focus:border-red-500/30 focus:outline-none transition-colors"
                />
                <ActionButton
                  label="Screamer custom"
                  color="red"
                  disabled={!screamerUrl.trim()}
                  className="mt-1.5"
                  onClick={() => {
                    if (!screamerUrl.trim()) return;
                    sendCmd({ type: "screamer", url: screamerUrl });
                    addLog("Screamer custom envoye", "sent");
                    setScreamerUrl("");
                  }}
                />
              </div>
            </div>
          </Section>

        </div>
      ) : (
        /* === Logs Tab === */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 text-[11px] leading-5 font-mono space-y-0.5"
          >
            {logs.map((l, i) => (
              <div
                key={i}
                className={`flex gap-2 ${
                  l.type === "user" ? "text-yellow-400/70"
                    : l.type === "sent" ? "text-emerald-400/70"
                    : l.type === "error" ? "text-red-400"
                    : "text-white/35"
                }`}
              >
                <span className="text-white/15 shrink-0 text-[10px]">{fmtTime(l.timestamp)}</span>
                <span className={`shrink-0 text-[9px] uppercase tracking-wider w-10 ${
                  l.type === "user" ? "text-yellow-500/50"
                    : l.type === "sent" ? "text-emerald-500/50"
                    : l.type === "error" ? "text-red-500/50"
                    : "text-white/20"
                }`}>
                  {l.type === "user" ? "USR" : l.type === "sent" ? "OUT" : l.type === "error" ? "ERR" : "SYS"}
                </span>
                <span className="break-all">{l.text}</span>
              </div>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-white/[0.06] flex justify-end">
            <button
              onClick={() => setLogs([])}
              className="px-3 py-1 rounded text-[9px] uppercase tracking-[0.2em] text-white/30 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
            >
              Clear logs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function Section({ title, icon, children }: { title: string; icon: "user" | "message" | "effect" | "danger"; children: React.ReactNode }) {
  const icons = {
    user: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    message: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    effect: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    danger: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  };

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.015] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04]">
        <span className="text-red-400/60">{icons[icon]}</span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-medium">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function ActionButton({
  label,
  description,
  color,
  disabled,
  className,
  onClick,
}: {
  label: string;
  description?: string;
  color: "red" | "blue" | "emerald" | "purple" | "white";
  disabled?: boolean;
  className?: string;
  onClick: () => void;
}) {
  const colors = {
    red: "border-red-500/25 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 shadow-[0_0_10px_rgba(255,42,42,0.05)] hover:shadow-[0_0_15px_rgba(255,42,42,0.12)]",
    blue: "border-blue-500/25 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/40",
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.05)] hover:shadow-[0_0_15px_rgba(16,185,129,0.12)]",
    purple: "border-purple-500/25 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40",
    white: "border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/25",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-[11px] tracking-[0.1em] transition-all duration-150 active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none ${colors[color]} ${className ?? ""}`}
    >
      <span className="uppercase font-medium">{label}</span>
      {description && <span className="text-[9px] opacity-50">{description}</span>}
    </button>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[9px] uppercase tracking-[0.15em] text-white/25 w-14 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 appearance-none bg-white/10 rounded-full accent-red-500 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(255,42,42,0.5)]"
      />
      <span className="text-[10px] text-white/30 w-12 text-right tabular-nums">{(value / 1000).toFixed(1)}s</span>
    </div>
  );
}
