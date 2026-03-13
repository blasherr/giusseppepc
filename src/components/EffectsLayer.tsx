"use client";
import { useState, useEffect, useCallback } from "react";
import { bridge, type AdminCommand } from "@/lib/session-bridge";
import { sounds } from "@/lib/sounds";

type GpTwoPhase = "glitch-in" | "avatar" | "typing" | "connected" | "glitch-out";

export default function EffectsLayer() {
  const [sysMsg, setSysMsg] = useState<string | null>(null);
  const [screamer, setScreamer] = useState<string | null>(null);
  const [blackout, setBlackout] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [bsod, setBsod] = useState(false);
  const [gpTwo, setGpTwo] = useState<GpTwoPhase | null>(null);
  const [gpTwoText, setGpTwoText] = useState("");

  const handleCmd = useCallback((data: unknown) => {
    const cmd = data as AdminCommand;
    switch (cmd.type) {
      case "message":
        sounds.notification();
        setSysMsg(cmd.text);
        setTimeout(() => setSysMsg(null), 6000);
        break;
      case "screamer":
        sounds.screamer();
        setScreamer(cmd.url ?? "");
        setTimeout(() => setScreamer(null), 3000);
        break;
      case "blackout":
        setBlackout(true);
        setTimeout(() => setBlackout(false), cmd.duration ?? 3000);
        break;
      case "glitch":
        setGlitch(true);
        setTimeout(() => setGlitch(false), cmd.duration ?? 2000);
        break;
      case "bsod":
        sounds.error();
        setBsod(true);
        setTimeout(() => setBsod(false), 8000);
        break;
      case "gptwo-connect": {
        // Phase 1: glitch-in (screen flickers)
        setGpTwo("glitch-in");
        sounds.notification();
        setTimeout(() => {
          // Phase 2: avatar appears
          setGpTwo("avatar");
          setTimeout(() => {
            // Phase 3: typing animation
            setGpTwo("typing");
            const msg = "GP-TWO connected // surveillance active";
            let i = 0;
            setGpTwoText("");
            const typeInterval = setInterval(() => {
              i++;
              setGpTwoText(msg.slice(0, i));
              if (i >= msg.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                  // Phase 4: connected state
                  setGpTwo("connected");
                  setTimeout(() => {
                    // Phase 5: glitch-out
                    setGpTwo("glitch-out");
                    setTimeout(() => {
                      setGpTwo(null);
                      setGpTwoText("");
                    }, 600);
                  }, 2000);
                }, 800);
              }
            }, 45);
          }, 1000);
        }, 800);
        break;
      }
    }
  }, []);

  useEffect(() => {
    bridge.on("admin:*", handleCmd);
    return () => bridge.off("admin:*", handleCmd);
  }, [handleCmd]);

  return (
    <>
      {/* System message - top right monitoring style */}
      {sysMsg && (
        <div className="fixed top-4 right-4 z-[9998] w-[340px] animate-[notifSlideIn_0.4s_ease-out_forwards]">
          <div className="relative rounded-lg border border-emerald-500/30 bg-[#0a0f0a]/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_15px_rgba(16,185,129,0.1)] overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-emerald-500/10">
              <div className="relative flex items-center justify-center w-5 h-5">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/90 font-medium">GP-TWO // Analyse active</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500/60 animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-emerald-500/40 animate-pulse [animation-delay:0.2s]" />
                <div className="w-1 h-1 rounded-full bg-emerald-500/20 animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>

            {/* Content */}
            <div className="px-4 py-3 space-y-2.5">
              {/* Scan lines */}
              <div className="flex items-center gap-2 text-[9px] text-emerald-500/50 tracking-[0.2em] uppercase">
                <svg className="w-3 h-3 text-emerald-400/70 animate-[spin_3s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Scan en cours...
              </div>

              {/* Message */}
              <div className="text-[12px] text-emerald-100/90 leading-relaxed font-mono">
                {sysMsg}
              </div>

              {/* Bottom status bar */}
              <div className="flex items-center justify-between pt-1.5 border-t border-emerald-500/10">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span className="text-[9px] text-emerald-500/50 tracking-[0.15em]">Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  <span className="text-[9px] text-emerald-500/50 tracking-[0.15em]">Node actif</span>
                </div>
              </div>
            </div>

            {/* Progress bar at bottom */}
            <div className="h-[2px] bg-emerald-950">
              <div className="h-full bg-emerald-500/70 animate-[notifProgress_6s_linear_forwards]" />
            </div>
          </div>
        </div>
      )}

      {/* Screamer */}
      {screamer && (
        <div className="screamer-overlay">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screamer}
            alt=""
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* Blackout */}
      {blackout && (
        <div className="fixed inset-0 z-[99990] bg-black" />
      )}

      {/* Glitch */}
      {glitch && (
        <div className="fixed inset-0 z-[99988] pointer-events-none animate-[glitchShake_0.05s_infinite]">
          <div className="absolute inset-0 bg-[var(--c-accent)]/5 mix-blend-overlay" />
        </div>
      )}

      {/* BSOD */}
      {bsod && (
        <div className="bsod-overlay">
          <p className="text-xl mb-4">:(</p>
          <p className="text-sm mb-2">Your PC ran into a problem and needs to restart.</p>
          <p className="text-sm mb-6">We&apos;re just collecting some error info, and then we&apos;ll restart for you.</p>
          <p className="text-xs text-white/60">Stop code: CERBERUS_ADMIN_OVERRIDE</p>
        </div>
      )}

      {/* GP-TWO Connect Notification - top right */}
      {gpTwo && (
        <div
          className={`fixed top-4 right-4 z-[9999] w-[360px] transition-all duration-500 ${
            gpTwo === "glitch-out" ? "opacity-0 translate-x-8" : "animate-[notifSlideIn_0.4s_ease-out_forwards]"
          }`}
        >
          <div className="relative rounded-lg border border-emerald-500/30 bg-[#0a0f0a]/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.12)] overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />

            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-emerald-500/10">
              <div className="relative flex items-center justify-center w-5 h-5">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/90 font-medium">
                {gpTwo === "glitch-in" ? "Connexion en cours..." : "GP-TWO // Connecte"}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500/60 animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-emerald-500/40 animate-pulse [animation-delay:0.2s]" />
                <div className="w-1 h-1 rounded-full bg-emerald-500/20 animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>

            {/* Content */}
            <div className="px-4 py-3 space-y-3">
              {/* Avatar row + identity */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className={`relative shrink-0 transition-all duration-500 ${gpTwo === "glitch-in" ? "opacity-40 animate-pulse" : "opacity-100"}`}>
                  <div className="absolute -inset-1 rounded-full bg-emerald-500/15 blur-md animate-pulse" />
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border-[1.5px] border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/gp-two-logo.png" alt="GP-TWO" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_3px)]" />
                  </div>
                  {/* Online dot */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#0a0f0a] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                  </div>
                </div>

                {/* Name + role */}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-emerald-100/95 tracking-wide">GP-TWO</div>
                  <div className="text-[9px] uppercase tracking-[0.25em] text-emerald-500/50">Surveillance node</div>
                </div>

                {/* Status badge */}
                <div className={`shrink-0 px-2 py-0.5 rounded-full border text-[8px] uppercase tracking-[0.25em] transition-all duration-300 ${
                  gpTwo === "glitch-in"
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400/80"
                    : gpTwo === "connected"
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                    : "border-emerald-500/25 bg-emerald-500/10 text-emerald-400/70"
                }`}>
                  {gpTwo === "glitch-in" ? "Linking" : gpTwo === "connected" ? "Active" : "Online"}
                </div>
              </div>

              {/* Analysis lines */}
              <div className="space-y-1.5">
                {/* Line 1 - always visible */}
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-emerald-500/60 shrink-0 animate-[spin_3s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <span className="text-[9px] text-emerald-500/50 tracking-[0.15em] uppercase">
                    {gpTwo === "glitch-in" ? "Initialisation du canal securise..." : "Scan reseau actif"}
                  </span>
                </div>

                {/* Line 2 - after glitch-in */}
                {gpTwo !== "glitch-in" && (
                  <div className="flex items-center gap-2">
                    <svg className="w-3 h-3 text-emerald-500/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[9px] text-emerald-500/50 tracking-[0.15em] uppercase">Surveillance des sessions active</span>
                  </div>
                )}

                {/* Line 3 - typing / connected */}
                {(gpTwo === "typing" || gpTwo === "connected") && (
                  <div className="flex items-center gap-2">
                    <svg className="w-3 h-3 text-emerald-500/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <span className="text-[9px] text-emerald-500/50 tracking-[0.15em] uppercase">Analyse comportementale en cours</span>
                  </div>
                )}
              </div>

              {/* Typing message */}
              {(gpTwo === "typing" || gpTwo === "connected") && (
                <div className="px-3 py-2 rounded bg-emerald-500/[0.06] border border-emerald-500/10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-emerald-300/90 tracking-wide">
                      {gpTwoText}
                    </span>
                    {gpTwo === "typing" && (
                      <span className="w-1.5 h-3.5 bg-emerald-400 animate-[blink_0.6s_infinite]" />
                    )}
                  </div>
                </div>
              )}

              {/* Bottom status */}
              <div className="flex items-center justify-between pt-1.5 border-t border-emerald-500/10">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <span className="text-[9px] text-emerald-500/40 tracking-[0.15em]">Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  <span className="text-[9px] text-emerald-500/40 tracking-[0.15em]">Node actif</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-[2px] bg-emerald-950">
              <div className="h-full bg-emerald-500/70 animate-[notifProgress_8s_linear_forwards]" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
