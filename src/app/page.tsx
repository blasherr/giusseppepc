"use client";
import { useState, useCallback } from "react";
import BootScreen from "@/components/BootScreen";
import LoginScreen from "@/components/LoginScreen";
import Desktop from "@/components/Desktop";

type Phase = "boot" | "login" | "desktop";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("boot");

  const handleBootComplete = useCallback(() => setPhase("login"), []);
  const handleLogin = useCallback(() => setPhase("desktop"), []);

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      {phase === "boot" && <BootScreen onComplete={handleBootComplete} />}
      {phase === "login" && <LoginScreen onLogin={handleLogin} />}
      {phase === "desktop" && <Desktop />}
    </main>
  );
}
