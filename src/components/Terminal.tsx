"use client";
import { useState, useRef, useEffect, useCallback } from "react";

interface TerminalLine {
  type: "input" | "output" | "error" | "system";
  text: string;
}

const WELCOME = [
  "╔══════════════════════════════════════════════════════════╗",
  "║          CERBERUS TERMINAL v12.0.4 // GP-TWO            ║",
  "║          Type 'help' for available commands              ║",
  "╚══════════════════════════════════════════════════════════╝",
  "",
];

const FILE_SYSTEM: Record<string, string[]> = {
  "/": ["home/", "system/", "data/", "cerberus.cfg"],
  "/home": ["gp-two/", "shared/"],
  "/home/gp-two": ["documents/", "downloads/", "projects/", ".profile"],
  "/home/gp-two/documents": ["mission_brief.txt", "contacts.enc", "logs/"],
  "/home/gp-two/projects": ["cerberus-core/", "neural-link/", "hydra-net/"],
  "/system": ["kernel/", "drivers/", "config/"],
  "/data": ["encrypted/", "cache/", "neural-maps/"],
};

const FILE_CONTENTS: Record<string, string> = {
  "/cerberus.cfg":
    "[CERBERUS CONFIG]\nversion=12.0.4\nnode=CRB-ALPHA-07\nencryption=AES-512\nneural_sync=enabled\nfirewall=ACTIVE",
  "/home/gp-two/.profile":
    "USER: GP-TWO\nROLE: OPERATOR\nCLEARANCE: LEVEL 7\nLAST_LOGIN: 2026-03-12T08:00:00Z\nSTATUS: ACTIVE",
  "/home/gp-two/documents/mission_brief.txt":
    "[CLASSIFIED - LEVEL 7]\n\nMISSION: CERBERUS GUARDIAN\nSTATUS: IN PROGRESS\nOBJECTIVE: Maintain perimeter integrity\nTHREAT LEVEL: MODERATE\n\n// END TRANSMISSION",
};

export default function Terminal({
  windowId,
  onClose,
}: {
  windowId: string;
  onClose: (id: string) => void;
}) {
  const [lines, setLines] = useState<TerminalLine[]>(
    WELCOME.map((text) => ({ type: "system" as const, text }))
  );
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("/home/gp-two");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  const addLines = useCallback(
    (newLines: TerminalLine[]) => {
      setLines((prev) => [...prev, ...newLines]);
    },
    []
  );

  const resolvePath = useCallback(
    (path: string): string => {
      if (path.startsWith("/")) return path;
      if (path === "..") {
        const parts = cwd.split("/").filter(Boolean);
        parts.pop();
        return "/" + parts.join("/");
      }
      if (path === ".") return cwd;
      const resolved = cwd === "/" ? `/${path}` : `${cwd}/${path}`;
      return resolved.replace(/\/+/g, "/");
    },
    [cwd]
  );

  const processCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim();
      if (!trimmed) return;

      const parts = trimmed.split(/\s+/);
      const command = parts[0].toLowerCase();
      const args = parts.slice(1);
      const outputLines: TerminalLine[] = [
        { type: "input", text: `${cwd} > ${trimmed}` },
      ];

      switch (command) {
        case "help":
          outputLines.push(
            { type: "system", text: "╔═══════════════════════════════════════╗" },
            { type: "system", text: "║       AVAILABLE COMMANDS              ║" },
            { type: "system", text: "╠═══════════════════════════════════════╣" },
            { type: "output", text: "  help          Show this help menu" },
            { type: "output", text: "  clear         Clear terminal" },
            { type: "output", text: "  whoami        Display current user" },
            { type: "output", text: "  date          Show current date/time" },
            { type: "output", text: "  echo [text]   Print text to terminal" },
            { type: "output", text: "  ls            List directory contents" },
            { type: "output", text: "  cd [dir]      Change directory" },
            { type: "output", text: "  pwd           Print working directory" },
            { type: "output", text: "  cat [file]    Display file contents" },
            { type: "output", text: "  sysinfo       System information" },
            { type: "output", text: "  netstat       Network status" },
            { type: "output", text: "  scan          Security scan" },
            { type: "output", text: "  matrix        Toggle matrix effect" },
            { type: "output", text: "  neofetch      System fetch display" },
            { type: "system", text: "╚═══════════════════════════════════════╝" }
          );
          break;

        case "clear":
          setLines([]);
          return;

        case "whoami":
          outputLines.push({ type: "output", text: "GP-TWO @ CERBERUS NODE CRB-ALPHA-07" });
          outputLines.push({ type: "output", text: "CLEARANCE: LEVEL 7 // STATUS: ACTIVE" });
          break;

        case "date":
          outputLines.push({
            type: "output",
            text: new Date().toLocaleString("fr-FR", {
              dateStyle: "full",
              timeStyle: "long",
            }),
          });
          break;

        case "echo":
          outputLines.push({ type: "output", text: args.join(" ") || "" });
          break;

        case "pwd":
          outputLines.push({ type: "output", text: cwd });
          break;

        case "ls": {
          const target = args[0] ? resolvePath(args[0]) : cwd;
          const contents = FILE_SYSTEM[target];
          if (contents) {
            contents.forEach((item) => {
              const isDir = item.endsWith("/");
              outputLines.push({
                type: "output",
                text: `${isDir ? "[DIR] " : "      "}${item}`,
              });
            });
          } else {
            outputLines.push({
              type: "error",
              text: `ls: cannot access '${target}': No such directory`,
            });
          }
          break;
        }

        case "cd": {
          if (!args[0] || args[0] === "~") {
            setCwd("/home/gp-two");
            outputLines.push({ type: "output", text: "Changed to /home/gp-two" });
          } else {
            const target = resolvePath(args[0].replace(/\/$/, ""));
            if (FILE_SYSTEM[target]) {
              setCwd(target);
              outputLines.push({ type: "output", text: `Changed to ${target}` });
            } else {
              outputLines.push({
                type: "error",
                text: `cd: '${args[0]}': No such directory`,
              });
            }
          }
          break;
        }

        case "cat": {
          if (!args[0]) {
            outputLines.push({ type: "error", text: "cat: missing file operand" });
          } else {
            const filePath = resolvePath(args[0]);
            const content = FILE_CONTENTS[filePath];
            if (content) {
              content.split("\n").forEach((line) => {
                outputLines.push({ type: "output", text: line });
              });
            } else {
              outputLines.push({
                type: "error",
                text: `cat: '${args[0]}': No such file or permission denied`,
              });
            }
          }
          break;
        }

        case "sysinfo":
          outputLines.push(
            { type: "system", text: "══════ CERBERUS SYSTEM INFO ══════" },
            { type: "output", text: "OS:       CERBERUS OS v12.0.4" },
            { type: "output", text: "KERNEL:   CRB-KERNEL 12.0.4-quantum" },
            { type: "output", text: "CPU:      Quantum Core x128 @ 9.8 THz" },
            { type: "output", text: "RAM:      2048 PB / 2048 PB (0.3% used)" },
            { type: "output", text: "GPU:      HYDRA RTX 9090 Ti x3 (SLI)" },
            { type: "output", text: "UPTIME:   47d 13h 22m 08s" },
            { type: "output", text: "NODE:     CRB-ALPHA-07" },
            { type: "output", text: "SECURITY: MAXIMUM // FIREWALL ACTIVE" },
            { type: "system", text: "══════════════════════════════════" }
          );
          break;

        case "netstat":
          outputLines.push(
            { type: "system", text: "══════ NETWORK STATUS ══════" },
            { type: "output", text: "STATUS:    CONNECTED" },
            { type: "output", text: "PROTOCOL:  QUANTUM-TCP/IP v4" },
            { type: "output", text: "LATENCY:   0.003ms" },
            { type: "output", text: "BANDWIDTH: 500 TB/s" },
            { type: "output", text: "FIREWALL:  ACTIVE [32 threats blocked]" },
            { type: "output", text: "VPN:       CERBERUS-SHIELD (ENCRYPTED)" },
            { type: "output", text: "PEERS:     7 nodes connected" },
            { type: "system", text: "════════════════════════════" }
          );
          break;

        case "scan":
          outputLines.push(
            { type: "system", text: ">> INITIATING SECURITY SCAN..." },
            { type: "output", text: "[████████████████████] 100%" },
            { type: "output", text: "" },
            { type: "output", text: "VULNERABILITIES: 0 FOUND" },
            { type: "output", text: "THREATS BLOCKED: 32" },
            { type: "output", text: "FIREWALL STATUS: OPTIMAL" },
            { type: "output", text: "ENCRYPTION: AES-512 ACTIVE" },
            { type: "output", text: "" },
            { type: "system", text: ">> SCAN COMPLETE // ALL SYSTEMS SECURE" }
          );
          break;

        case "matrix":
          outputLines.push({
            type: "system",
            text: ">> MATRIX VISUALIZATION NOT AVAILABLE IN THIS TERMINAL MODE",
          });
          break;

        case "neofetch":
          outputLines.push(
            { type: "system", text: "       ████████████        GP-TWO@CRB-ALPHA-07" },
            { type: "system", text: "     ██            ██      ─────────────────────" },
            { type: "output", text: "    ██  ██████████  ██     OS: CERBERUS OS v12.0.4" },
            { type: "output", text: "   ██  ██  ████  ██  ██    Kernel: CRB-12.0.4-quantum" },
            { type: "output", text: "   ██  ██  ████  ██  ██    CPU: Quantum Core x128" },
            { type: "output", text: "   ██  ██████████  ██      GPU: HYDRA RTX 9090 Ti x3" },
            { type: "output", text: "    ██            ██       RAM: 6.1 PB / 2048 PB" },
            { type: "output", text: "     ██  ██████  ██        Disk: 12.3 EB / 500 EB" },
            { type: "output", text: "      ████    ████         Shell: cerberus-sh 4.2" },
            { type: "output", text: "       ██      ██          Terminal: CERBERUS-TERM" },
            { type: "system", text: "        ████████           Node: CRB-ALPHA-07" }
          );
          break;

        default:
          outputLines.push({
            type: "error",
            text: `'${command}': command not found. Type 'help' for available commands.`,
          });
      }

      addLines(outputLines);
    },
    [cwd, resolvePath, addLines]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      processCommand(input);
      setHistory((prev) => [...prev, input]);
      setHistoryIdx(-1);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx !== -1) {
        const newIdx = historyIdx + 1;
        if (newIdx >= history.length) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(newIdx);
          setInput(history[newIdx]);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0d0d0d] border-b border-[#ff0033]/20">
        <div className="flex items-center gap-2">
          <span className="text-[#ff0033] text-xs">⬢</span>
          <span className="text-[#ff0033]/70 text-xs tracking-widest">
            CERBERUS TERMINAL // {windowId}
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            className="w-3 h-3 rounded-full bg-[#ff0033]/20 hover:bg-[#ff0033]/60 transition-colors border border-[#ff0033]/30"
            onClick={() => onClose(windowId)}
          />
        </div>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 text-sm leading-6 font-mono"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap break-all ${
              line.type === "input"
                ? "text-[#ff0033]/60"
                : line.type === "error"
                ? "text-red-400"
                : line.type === "system"
                ? "text-[#ff0033]/80"
                : "text-[#e0e0e0]/80"
            }`}
          >
            {line.text}
          </div>
        ))}

        {/* Input line */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[#ff0033]/50 text-xs whitespace-nowrap">
            {cwd} &gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
