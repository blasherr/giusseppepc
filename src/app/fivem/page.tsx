"use client";
import { useState, useEffect } from "react";

type Phase = "boot" | "login" | "desktop";
type Session = "gp-two" | "admin";

// FiveM CEF safe page - same as main page but with dynamic imports
// to avoid parse-time crashes from Firebase/BroadcastChannel/AudioContext
export default function FiveMPage() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [session, setSession] = useState<Session>("gp-two");
  const [error, setError] = useState<string | null>(null);

  const [Components, setComponents] = useState<{
    BootScreen: React.ComponentType<{ onComplete: () => void }>;
    LoginScreen: React.ComponentType<{ onLogin: (s: Session) => void }>;
    Desktop: React.ComponentType<{ session: Session }>;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Load fivemCompat first to set up safe wrappers
        await import("@/lib/fivemCompat");

        const [boot, login, desktop] = await Promise.all([
          import("@/components/BootScreen"),
          import("@/components/LoginScreen"),
          import("@/components/Desktop"),
        ]);

        setComponents({
          BootScreen: boot.default,
          LoginScreen: login.default,
          Desktop: desktop.default,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  if (error) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#000", color: "#ff4444", fontFamily: "monospace", padding: 20, fontSize: 12 }}>
        <p>[CERBERUS ERROR] {error}</p>
      </div>
    );
  }

  if (!Components) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#0a0a0a", color: "#10b981", fontFamily: "monospace", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, letterSpacing: "0.2em" }}>CERBERUS OS</p>
          <p style={{ fontSize: 11, opacity: 0.5, marginTop: 8 }}>Initialisation...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="fixed inset-0 bg-[var(--c-bg)] overflow-hidden select-none">
      {phase === "boot" && <Components.BootScreen onComplete={() => setPhase("login")} />}
      {phase === "login" && (
        <Components.LoginScreen
          onLogin={(s: Session) => {
            setSession(s);
            setPhase("desktop");
          }}
        />
      )}
      {phase === "desktop" && <Components.Desktop session={session} />}
    </main>
  );
}
