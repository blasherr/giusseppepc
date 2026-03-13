"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { bridge } from "@/lib/session-bridge";

interface TerminalLine {
  type: "input" | "output" | "error" | "system";
  text: string;
}

const WELCOME = [
  "┌──────────────────────────────────────────────┐",
  "│  CERBERUS TERMINAL v12.0.4 // GP-TWO         │",
  "│  Type 'help' for available commands           │",
  "└──────────────────────────────────────────────┘",
  "",
];

const FS: Record<string, string[]> = {
  "/": ["home/", "system/", "data/", "cerberus.cfg"],
  "/home": ["gp-two/", "shared/"],
  "/home/gp-two": ["documents/", "downloads/", "projects/", ".profile"],
  "/home/gp-two/documents": ["mission_brief.txt", "contacts.enc", "logs/"],
  "/home/gp-two/projects": ["cerberus-core/", "neural-link/", "hydra-net/"],
  "/system": ["kernel/", "drivers/", "config/"],
  "/data": ["encrypted/", "cache/", "neural-maps/"],
};

const FILES: Record<string, string> = {
  "/cerberus.cfg": "[CERBERUS CONFIG]\nversion=12.0.4\nnode=CRB-ALPHA-07\nencryption=AES-512\nneural_sync=enabled\nfirewall=ACTIVE",
  "/home/gp-two/.profile": "USER: GP-TWO\nROLE: OPERATOR\nCLEARANCE: LEVEL 7\nLAST_LOGIN: 2026-03-12T08:00:00Z\nSTATUS: ACTIVE",
  "/home/gp-two/documents/mission_brief.txt": "[CLASSIFIED - LEVEL 7]\n\nMISSION: CERBERUS GUARDIAN\nSTATUS: IN PROGRESS\nOBJECTIVE: Maintain perimeter integrity\nTHREAT LEVEL: MODERATE\n\n// END TRANSMISSION",
};

export default function Terminal({ windowId, onClose }: { windowId: string; onClose: (id: string) => void }) {
  const [lines, setLines] = useState<TerminalLine[]>(
    WELCOME.map((text) => ({ type: "system" as const, text }))
  );
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("/home/gp-two");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  // Listen for admin messages
  useEffect(() => {
    const handler = (data: unknown) => {
      const cmd = data as { type: string; text?: string };
      if (cmd.type === "message") {
        setLines((prev) => [
          ...prev,
          { type: "system", text: `[SYSTEM] ${cmd.text ?? ""}` },
        ]);
      }
    };
    bridge.on("admin:message", handler);
    return () => bridge.off("admin:message", handler);
  }, []);

  const add = useCallback((out: TerminalLine[]) => {
    setLines((p) => [...p, ...out]);
  }, []);

  const resolve = useCallback(
    (path: string): string => {
      if (path.startsWith("/")) return path;
      if (path === "..") {
        const parts = cwd.split("/").filter(Boolean);
        parts.pop();
        return "/" + parts.join("/");
      }
      if (path === ".") return cwd;
      return (cwd === "/" ? `/${path}` : `${cwd}/${path}`).replace(/\/+/g, "/");
    },
    [cwd]
  );

  const exec = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      bridge.sendAsUser({ type: "terminal-line", text: trimmed, timestamp: Date.now() });

      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);
      const out: TerminalLine[] = [{ type: "input", text: `${cwd} > ${trimmed}` }];

      switch (cmd) {
        case "help":
          out.push(
            { type: "system", text: "─── Available Commands ───" },
            { type: "output", text: "  help      Show commands" },
            { type: "output", text: "  clear     Clear screen" },
            { type: "output", text: "  whoami    Current user" },
            { type: "output", text: "  date      Date & time" },
            { type: "output", text: "  echo      Print text" },
            { type: "output", text: "  ls        List dir" },
            { type: "output", text: "  cd        Change dir" },
            { type: "output", text: "  pwd       Working dir" },
            { type: "output", text: "  cat       Read file" },
            { type: "output", text: "  sysinfo   System info" },
            { type: "output", text: "  netstat   Network" },
            { type: "output", text: "  scan      Security scan" },
            { type: "output", text: "  neofetch  System display" },
            { type: "system", text: "──────────────────────────" }
          );
          break;
        case "clear":
          setLines([]);
          bridge.sendAsUser({ type: "terminal-clear", timestamp: Date.now() });
          return;
        case "whoami":
          out.push({ type: "output", text: "GP-TWO @ CRB-ALPHA-07 // CLEARANCE: LVL 7" });
          break;
        case "date":
          out.push({ type: "output", text: new Date().toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "long" }) });
          break;
        case "echo":
          out.push({ type: "output", text: args.join(" ") });
          break;
        case "pwd":
          out.push({ type: "output", text: cwd });
          break;
        case "ls": {
          const t = args[0] ? resolve(args[0]) : cwd;
          const c = FS[t];
          if (c) c.forEach((item) => out.push({ type: "output", text: `${item.endsWith("/") ? "[DIR] " : "      "}${item}` }));
          else out.push({ type: "error", text: `ls: '${t}': No such directory` });
          break;
        }
        case "cd": {
          if (!args[0] || args[0] === "~") {
            setCwd("/home/gp-two");
            out.push({ type: "output", text: "→ /home/gp-two" });
          } else {
            const t = resolve(args[0].replace(/\/$/, ""));
            if (FS[t]) { setCwd(t); out.push({ type: "output", text: `→ ${t}` }); }
            else out.push({ type: "error", text: `cd: '${args[0]}': Not found` });
          }
          break;
        }
        case "cat": {
          if (!args[0]) out.push({ type: "error", text: "cat: missing file" });
          else {
            const c = FILES[resolve(args[0])];
            if (c) c.split("\n").forEach((l) => out.push({ type: "output", text: l }));
            else out.push({ type: "error", text: `cat: '${args[0]}': Not found` });
          }
          break;
        }
        case "sysinfo":
          out.push(
            { type: "system", text: "─── SYSTEM INFO ───" },
            { type: "output", text: "OS:       CERBERUS OS v12.0.4" },
            { type: "output", text: "CPU:      Quantum Core x128 @ 9.8 THz" },
            { type: "output", text: "RAM:      2048 PB (0.3% used)" },
            { type: "output", text: "GPU:      HYDRA RTX 9090 Ti x3" },
            { type: "output", text: "UPTIME:   47d 13h 22m" },
            { type: "system", text: "────────────────────" }
          );
          break;
        case "netstat":
          out.push(
            { type: "system", text: "─── NETWORK ───" },
            { type: "output", text: "STATUS:    CONNECTED" },
            { type: "output", text: "LATENCY:   0.003ms" },
            { type: "output", text: "FIREWALL:  ACTIVE [32 blocked]" },
            { type: "output", text: "VPN:       CERBERUS-SHIELD" },
            { type: "system", text: "────────────────" }
          );
          break;
        case "scan":
          out.push(
            { type: "system", text: ">> Security scan..." },
            { type: "output", text: "[████████████████████] 100%" },
            { type: "output", text: "Vulnerabilities: 0" },
            { type: "output", text: "Threats blocked: 32" },
            { type: "system", text: ">> All systems secure" }
          );
          break;
        case "neofetch":
          out.push(
            { type: "system", text: "   ████████████     GP-TWO@CRB-ALPHA-07" },
            { type: "system", text: "  ██          ██    ────────────────────" },
            { type: "output", text: " ██  ████████  ██   OS:   CERBERUS v12.0.4" },
            { type: "output", text: " ██  ██    ██  ██   CPU:  QC x128 9.8THz" },
            { type: "output", text: " ██  ████████  ██   GPU:  HYDRA 9090Ti x3" },
            { type: "output", text: "  ██          ██    RAM:  6.1 / 2048 PB" },
            { type: "output", text: "   ████████████     Shell: cerberus-sh" }
          );
          break;
        default:
          out.push({ type: "error", text: `'${cmd}': command not found` });
      }
      add(out);
    },
    [cwd, resolve, add]
  );

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      exec(input);
      setHistory((p) => [...p, input]);
      setHistIdx(-1);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length) {
        const i = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
        setHistIdx(i);
        setInput(history[i]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx !== -1) {
        const i = histIdx + 1;
        if (i >= history.length) { setHistIdx(-1); setInput(""); }
        else { setHistIdx(i); setInput(history[i]); }
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--c-bg)]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--c-surface)] border-b border-[var(--c-border)]">
        <span className="text-[10px] text-[var(--c-text-dim)] tracking-[0.15em]">
          TERMINAL // {windowId}
        </span>
        <button
          className="w-3 h-3 rounded-full bg-[var(--c-accent)]/20 hover:bg-[var(--c-accent)] transition-colors"
          onClick={() => onClose(windowId)}
        />
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 text-[13px] leading-5 font-mono"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((l, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap break-all ${
              l.type === "input" ? "text-[var(--c-text-dim)]"
              : l.type === "error" ? "text-red-400"
              : l.type === "system" ? "text-[var(--c-accent)]/70"
              : "text-[var(--c-text)]/80"
            }`}
          >
            {l.text}
          </div>
        ))}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[var(--c-accent)]/40 text-xs">{cwd} &gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            className="terminal-input"
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
