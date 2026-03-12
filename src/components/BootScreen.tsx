"use client";
import { useState, useEffect } from "react";

const BOOT_LINES = [
  { text: "CERBERUS BIOS v3.7.2 // INITIALIZING...", delay: 0 },
  { text: "CPU: CERBERUS QUANTUM CORE x128 @ 9.8 THz", delay: 200 },
  { text: "RAM: 2048 PB NEURAL-SYNC DDR9", delay: 400 },
  { text: "GPU: CERBERUS HYDRA RTX 9090 Ti x3", delay: 600 },
  { text: "STORAGE: 500 EB QUANTUM-SSD ARRAY", delay: 800 },
  { text: "", delay: 900 },
  { text: ">> SCANNING NEURAL INTERFACES... OK", delay: 1000 },
  { text: ">> LOADING CERBERUS KERNEL v12.0.4... OK", delay: 1300 },
  { text: ">> INITIALIZING FIREWALL MATRIX... OK", delay: 1600 },
  { text: ">> MOUNTING ENCRYPTED VOLUMES... OK", delay: 1900 },
  { text: ">> LOADING SECURITY PROTOCOLS... OK", delay: 2200 },
  { text: ">> ESTABLISHING NEURAL LINK... OK", delay: 2500 },
  { text: "", delay: 2600 },
  { text: "ALL SYSTEMS NOMINAL // BOOT COMPLETE", delay: 2800 },
];

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [progressDone, setProgressDone] = useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    BOOT_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(i + 1);
        }, line.delay)
      );
    });

    timers.push(
      setTimeout(() => setProgressDone(true), 3200)
    );

    timers.push(
      setTimeout(() => onComplete(), 4500)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="scanlines fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-50">
      {/* Background hex pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,0,51,0.1) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Cerberus Logo */}
      <div className="mb-8 relative">
        <div className="text-5xl font-bold text-[#ff0033] glitch-text tracking-[0.3em]">
          CERBERUS
        </div>
        <div className="text-sm text-center text-[#ff0033]/60 tracking-[0.5em] mt-1">
          OPERATING SYSTEM
        </div>
        {/* Decorative lines */}
        <div className="absolute -left-20 top-1/2 w-16 h-[1px] bg-gradient-to-r from-transparent to-[#ff0033]/50" />
        <div className="absolute -right-20 top-1/2 w-16 h-[1px] bg-gradient-to-l from-transparent to-[#ff0033]/50" />
      </div>

      {/* Boot log */}
      <div className="w-[700px] max-w-[90vw] text-sm space-y-1 mb-8 font-mono">
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className="boot-line text-[#ff0033]/80"
            style={{ animationDelay: `${i * 0.02}s` }}
          >
            {line.text === "" ? <br /> : (
              <>
                <span className="text-[#ff0033]/40 mr-2">
                  [{String(i).padStart(2, "0")}]
                </span>
                {line.text.includes("OK") ? (
                  <>
                    {line.text.replace(" OK", "")}
                    <span className="text-green-500 ml-2">OK</span>
                  </>
                ) : (
                  line.text
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-[500px] max-w-[80vw] h-1 bg-[#1a1a1a] rounded-full overflow-hidden relative">
        <div
          className={`h-full bg-gradient-to-r from-[#990022] via-[#ff0033] to-[#990022] rounded-full transition-all duration-300 ${
            !progressDone ? "boot-progress" : "w-full"
          }`}
          style={{
            boxShadow: "0 0 10px rgba(255, 0, 51, 0.5), 0 0 20px rgba(255, 0, 51, 0.3)",
          }}
        />
      </div>

      {/* Status text */}
      <div className="mt-4 text-xs text-[#ff0033]/50 tracking-widest">
        {progressDone ? (
          <span className="text-[#ff0033] text-glow">
            SYSTEM READY // LAUNCHING SESSION...
          </span>
        ) : (
          <span className="cursor-blink">LOADING CERBERUS OS</span>
        )}
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-[#ff0033]/30" />
      <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-[#ff0033]/30" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-[#ff0033]/30" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-[#ff0033]/30" />
    </div>
  );
}
