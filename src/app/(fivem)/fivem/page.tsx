"use client";
import { useState } from "react";
import BootScreen from "@/components/BootScreen";
import LoginScreen from "@/components/LoginScreen";

type Phase = "boot" | "login" | "done";

export default function FiveMPage() {
  const [phase, setPhase] = useState<Phase>("boot");

  return (
    <main className="fixed inset-0 bg-[var(--c-bg)] overflow-hidden select-none">
      {phase === "boot" && <BootScreen onComplete={() => setPhase("login")} />}
      {phase === "login" && (
        <LoginScreen
          onLogin={() => {
            setPhase("done");
          }}
        />
      )}
      {phase === "done" && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-[var(--c-accent)] text-2xl font-bold mb-4">
              CERBERUS OS - FiveM OK
            </p>
            <p className="text-[var(--c-text-dim)] text-sm">
              Boot + Login fonctionnent. Desktop pas encore integre.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
