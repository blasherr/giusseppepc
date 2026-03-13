"use client";
import { useState, useEffect, useCallback } from "react";
import { sounds } from "@/lib/sounds";

type Session = "gp-two" | "admin";

export default function LoginScreen({
  onLogin,
}: {
  onLogin: (session: Session) => void;
}) {
  const [selected, setSelected] = useState<Session>("gp-two");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (connecting) return;
      if (password.length > 0) {
        setConnecting(true);
        sounds.login();
        setTimeout(() => onLogin(selected), 1200);
      } else {
        sounds.error();
        setError(true);
        setTimeout(() => setError(false), 800);
      }
    },
    [password, selected, onLogin, connecting]
  );

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-[#050507]">
      {/* Background */}
      <div className="login-futuristic-bg" />
      <div className="login-orb left-[8%] top-[12%] h-40 w-40" />
      <div className="login-orb right-[10%] top-[16%] h-56 w-56 [animation-delay:1.2s]" />
      <div className="login-orb bottom-[18%] left-[20%] h-64 w-64 [animation-delay:2.4s]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />

      {/* Top bar - time & status */}
      <div className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5 transition-all duration-700 ${show ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.4em] text-white/30">Cerberus OS</span>
          <span className="h-px w-8 bg-white/10" />
          <span className="text-[10px] tracking-[0.3em] text-white/20">v3.1.7</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--c-accent)] shadow-[0_0_8px_rgba(255,42,42,0.6)]" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">Online</span>
          </div>
          <span className="h-px w-4 bg-white/10" />
          <span className="text-[11px] tracking-[0.2em] text-white/40" style={{ fontVariantNumeric: "tabular-nums" }}>{time}</span>
        </div>
      </div>

      {/* Main content - centered vertically */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <div className={`flex w-full max-w-[420px] flex-col items-center transition-all duration-700 ${show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${connecting ? "scale-95 opacity-0" : ""}`}>

          {/* Logo */}
          <div className={`relative mb-8 ${error ? "animate-[glitchShake_0.3s]" : ""}`}>
            <div className="login-panel-glow" />
            <div className="relative h-[160px] w-[160px]">
              <img src="/gp-logo.svg" alt="GP" className="h-full w-full drop-shadow-[0_0_30px_rgba(255,42,42,0.25)]" />
            </div>
          </div>

          {/* Profile name */}
          <div className="mb-1 text-[11px] uppercase tracking-[0.4em] text-white/30">
            {selected === "gp-two" ? "Identity node" : "Admin access"}
          </div>
          <div className="mb-6 text-[28px] font-light uppercase tracking-[0.25em] text-white/90">
            {selected === "gp-two" ? "GP-TWO" : "Admin"}
          </div>

          {/* Session selector */}
          <div className="mb-8 flex gap-2">
            {(["gp-two", "admin"] as const).map((sessionName) => (
              <button
                key={sessionName}
                type="button"
                onClick={() => { setSelected(sessionName); sounds.keypress(); }}
                className={`rounded-full border px-5 py-2 text-[10px] uppercase tracking-[0.3em] transition-all duration-200 ${
                  selected === sessionName
                    ? "border-[var(--c-accent)]/40 bg-[var(--c-accent)]/15 text-white shadow-[0_0_20px_rgba(255,42,42,0.15)]"
                    : "border-white/[0.08] bg-white/[0.03] text-white/30 hover:border-white/[0.14] hover:text-white/55"
                }`}
              >
                {sessionName === "gp-two" ? "Utilisateur" : "Admin"}
              </button>
            ))}
          </div>

          {/* Login card */}
          <div className="login-card relative w-full rounded-[24px] border border-white/[0.08] bg-[rgba(10,6,10,0.75)] px-8 py-8 backdrop-blur-xl">
            {/* Top accent line */}
            <div className="absolute left-8 right-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,42,42,0.5),transparent)]" />

            <form onSubmit={submit} className="space-y-5">
              <div className={error ? "animate-[glitchShake_0.15s_2]" : ""}>
                <label className="mb-2.5 block text-[10px] uppercase tracking-[0.35em] text-white/35">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={() => sounds.keypress()}
                  placeholder="Entrer les identifiants"
                  autoFocus
                  className="h-[52px] w-full rounded-[16px] border border-white/[0.08] bg-white/[0.03] px-5 text-[14px] tracking-[0.15em] text-white placeholder:text-white/20 focus:border-[var(--c-accent)]/35 focus:bg-[var(--c-accent)]/[0.04] focus:outline-none transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={connecting}
                className="login-shimmer h-[52px] w-full rounded-[16px] border border-[var(--c-accent)]/25 bg-[linear-gradient(135deg,rgba(255,42,42,0.9),rgba(255,70,50,0.9))] text-[11px] uppercase tracking-[0.45em] text-white shadow-[0_12px_40px_rgba(255,42,42,0.25)] transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_16px_50px_rgba(255,42,42,0.35)] active:scale-[0.99] disabled:opacity-40"
              >
                {connecting ? "Connexion..." : "Initialiser la session"}
              </button>

              {error && (
                <p className="text-center text-[10px] uppercase tracking-[0.3em] text-[var(--c-accent)]">
                  Acces refuse
                </p>
              )}
            </form>

            {/* Bottom info */}
            <div className="mt-6 flex items-center justify-between text-[9px] uppercase tracking-[0.3em] text-white/20">
              <span>Secure node</span>
              <span className="flex items-center gap-2">
                <span className="h-px w-3 bg-white/10" />
                {selected === "gp-two" ? "Tier 02" : "Tier 01"}
              </span>
              <span>Encrypted</span>
            </div>
          </div>

          {/* Date below card */}
          <div className="mt-6 text-[11px] uppercase tracking-[0.35em] text-white/25">
            {date}
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-6 transition-all duration-700 ${show ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center gap-3">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/10" />
          <span className="text-[9px] uppercase tracking-[0.5em] text-white/15">Cerberus Access Terminal</span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/10" />
        </div>
      </div>
    </div>
  );
}
