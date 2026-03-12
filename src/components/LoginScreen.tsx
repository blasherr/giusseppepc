"use client";
import { useState, useEffect, useCallback } from "react";

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState(false);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setShowInput(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (password.length > 0) {
        onLogin();
      } else {
        setError(true);
        setTimeout(() => setError(false), 1000);
      }
    },
    [password, onLogin]
  );

  return (
    <div className="scanlines fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-40">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#ff0033]/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `fadeIn ${2 + Math.random() * 3}s ease-in-out infinite alternate`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Time display */}
      <div className="mb-12 text-center fade-in">
        <div className="text-6xl font-bold text-[#ff0033]/90 text-glow tracking-widest">
          {time}
        </div>
        <div className="text-sm text-[#e0e0e0]/40 mt-2 tracking-[0.3em] uppercase">
          {date}
        </div>
      </div>

      {/* Avatar */}
      <div
        className={`slide-up relative mb-6 ${error ? "animate-[glitchSkew_0.3s_ease]" : ""}`}
      >
        <div className="w-28 h-28 rounded-full overflow-hidden ring-pulse border-2 border-[#ff0033]/50 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://imgg.fr/r/7sf9n0H4.png"
            alt="GP-TWO Avatar"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/30 to-transparent" />
        </div>
        {/* Decorative hexagon ring */}
        <div className="absolute -inset-3 border border-[#ff0033]/20 rounded-full" />
        <div className="absolute -inset-5 border border-[#ff0033]/10 rounded-full" />
      </div>

      {/* Session name */}
      <div className="slide-up mb-1 text-lg text-[#e0e0e0] tracking-[0.2em]">
        Session <span className="text-[#ff0033] font-bold">GP-TWO</span>
      </div>
      <div className="text-xs text-[#ff0033]/40 tracking-[0.3em] mb-8">
        CERBERUS AUTHENTICATED USER
      </div>

      {/* Password input */}
      {showInput && (
        <form onSubmit={handleSubmit} className="fade-in flex flex-col items-center">
          <div
            className={`relative w-72 ${error ? "animate-[glitchSkew_0.2s_ease_2]" : ""}`}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER PASSWORD"
              autoFocus
              className="w-full px-4 py-3 bg-[#111111]/80 border border-[#ff0033]/30 text-[#ff0033] 
                         placeholder-[#ff0033]/20 text-center text-sm tracking-[0.3em]
                         focus:outline-none focus:border-[#ff0033]/60 focus:shadow-[0_0_20px_rgba(255,0,51,0.2)]
                         transition-all duration-300"
            />
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-[#ff0033]/60" />
            <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-[#ff0033]/60" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-[#ff0033]/60" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-[#ff0033]/60" />
          </div>

          <button
            type="submit"
            className="mt-4 px-8 py-2 border border-[#ff0033]/30 text-[#ff0033]/70 text-xs tracking-[0.3em]
                       hover:bg-[#ff0033]/10 hover:border-[#ff0033]/60 hover:text-[#ff0033]
                       transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,0,51,0.2)]"
          >
            CONNECT
          </button>

          {error && (
            <div className="mt-3 text-xs text-[#ff0033] tracking-widest animate-pulse">
              ACCESS DENIED // RETRY
            </div>
          )}
        </form>
      )}

      {/* Bottom info bar */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-between px-8 text-[10px] text-[#ff0033]/30 tracking-widest">
        <span>CERBERUS OS v12.0.4</span>
        <span>SECURE NEURAL LINK ACTIVE</span>
        <span>NODE: CRB-ALPHA-07</span>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-[#ff0033]/20" />
      <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-[#ff0033]/20" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-[#ff0033]/20" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-[#ff0033]/20" />
    </div>
  );
}
