"use client";
import { useState } from "react";
import BootScreen from "@/components/BootScreen";
import LoginScreen from "@/components/LoginScreen";
import Desktop from "@/components/Desktop";

type Phase = "boot" | "login" | "desktop";
type Session = "gp-two" | "admin";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [session, setSession] = useState<Session>("gp-two");

  return (
    <main className="fixed inset-0 bg-[var(--c-bg)] overflow-hidden select-none">
      {phase === "boot" && <BootScreen onComplete={() => setPhase("login")} />}
      {phase === "login" && (
        <LoginScreen
          onLogin={(s: Session) => {
            setSession(s);
            setPhase("desktop");
          }}
        />
      )}
      {phase === "desktop" && <Desktop session={session} />}
    </main>
  );
}
