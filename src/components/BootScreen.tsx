"use client";
import { useState, useEffect, useRef } from "react";
import { sounds } from "@/lib/sounds";

const LINES = [
  { text: "CERBERUS BIOS v3.7.2 // INITIALIZING...", delay: 0 },
  { text: "CPU: QUANTUM CORE x128 @ 9.8 THz", delay: 200 },
  { text: "RAM: 2048 PB NEURAL-SYNC DDR9", delay: 350 },
  { text: "GPU: HYDRA RTX 9090 Ti x3 SLI", delay: 500 },
  { text: "STORAGE: 500 EB QUANTUM-SSD ARRAY", delay: 650 },
  { text: "", delay: 750 },
  { text: ">> Scanning neural interfaces... OK", delay: 850 },
  { text: ">> Loading kernel v12.0.4... OK", delay: 1100 },
  { text: ">> Initializing firewall matrix... OK", delay: 1350 },
  { text: ">> Mounting encrypted volumes... OK", delay: 1600 },
  { text: ">> Establishing neural link... OK", delay: 1850 },
  { text: "", delay: 1950 },
  { text: "ALL SYSTEMS NOMINAL — BOOT COMPLETE", delay: 2100 },
];

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(0);
  const [done, setDone] = useState(false);
  const played = useRef(false);

  useEffect(() => {
    if (!played.current) {
      played.current = true;
      sounds.boot();
    }

    const timers: NodeJS.Timeout[] = [];
    LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisible(i + 1), LINES[i].delay));
    });
    timers.push(setTimeout(() => setDone(true), 2700));
    timers.push(setTimeout(() => onComplete(), 3800));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="scanlines fixed inset-0 bg-[var(--c-bg)] flex flex-col items-center justify-center z-50">
      {/* Title */}
      <div className="mb-8 text-center slide-up">
        <h1 className="text-4xl font-bold text-[var(--c-accent)] tracking-[0.3em]">
          CERBERUS
        </h1>
        <p className="text-[10px] text-[var(--c-text-dim)] tracking-[0.5em] mt-1">
          OPERATING SYSTEM
        </p>
      </div>

      {/* Log */}
      <div className="w-[640px] max-w-[90vw] font-mono text-[12px] space-y-0.5 mb-8">
        {LINES.slice(0, visible).map((line, i) => (
          <div key={i} className="boot-line" style={{ animationDelay: `${i * 15}ms` }}>
            {line.text === "" ? (
              <br />
            ) : (
              <span className={line.text.includes("OK")
                ? "text-[var(--c-text-dim)]"
                : i === LINES.length - 1
                ? "text-[var(--c-accent)] font-bold"
                : "text-[var(--c-text-dim)]/70"
              }>
                <span className="text-[var(--c-accent)]/30 mr-1.5 text-[10px]">
                  {String(i).padStart(2, "0")}
                </span>
                {line.text.includes("OK") ? (
                  <>
                    {line.text.replace(" OK", "")}
                    <span className="text-[var(--c-accent)] ml-1">OK</span>
                  </>
                ) : (
                  line.text
                )}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="w-[400px] max-w-[70vw]">
        <div className="h-[2px] bg-[var(--c-border)] overflow-hidden">
          <div className={`h-full bg-[var(--c-accent)] ${done ? "w-full" : "boot-progress"}`} />
        </div>
        <p className="text-center text-[10px] tracking-[0.3em] mt-3 text-[var(--c-text-dim)]">
          {done ? (
            <span className="text-[var(--c-accent)]">SYSTEM READY</span>
          ) : (
            <span className="cursor-blink">LOADING</span>
          )}
        </p>
      </div>
    </div>
  );
}

