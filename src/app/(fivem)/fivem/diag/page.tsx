"use client";
import { useState, useEffect } from "react";

type TestResult = {
  name: string;
  status: "pending" | "ok" | "fail" | "warn";
  detail?: string;
};

export default function DiagPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "DOM Rendering", status: "ok", detail: "Page visible" },
    { name: "CSS Inline Styles", status: "pending" },
    { name: "useState/useEffect", status: "pending" },
    { name: "localStorage", status: "pending" },
    { name: "sessionStorage", status: "pending" },
    { name: "BroadcastChannel", status: "pending" },
    { name: "AudioContext", status: "pending" },
    { name: "fetch() API", status: "pending" },
    { name: "Dynamic import()", status: "pending" },
    { name: "Firebase import", status: "pending" },
  ]);

  const update = (name: string, status: TestResult["status"], detail?: string) => {
    setTests((prev) =>
      prev.map((t) => (t.name === name ? { ...t, status, detail } : t))
    );
  };

  useEffect(() => {
    // Test: CSS works (if we got here, it works)
    update("CSS Inline Styles", "ok", "Styles applied");

    // Test: useState/useEffect
    update("useState/useEffect", "ok", "Hooks functional");

    // Test: localStorage
    try {
      localStorage.setItem("__cef_test", "1");
      const v = localStorage.getItem("__cef_test");
      localStorage.removeItem("__cef_test");
      update("localStorage", v === "1" ? "ok" : "fail", v === "1" ? "Read/write OK" : "Value mismatch");
    } catch (e) {
      update("localStorage", "fail", String(e));
    }

    // Test: sessionStorage
    try {
      sessionStorage.setItem("__cef_test", "1");
      const v = sessionStorage.getItem("__cef_test");
      sessionStorage.removeItem("__cef_test");
      update("sessionStorage", v === "1" ? "ok" : "fail", v === "1" ? "Read/write OK" : "Value mismatch");
    } catch (e) {
      update("sessionStorage", "fail", String(e));
    }

    // Test: BroadcastChannel
    try {
      const bc = new BroadcastChannel("__cef_test");
      bc.close();
      update("BroadcastChannel", "ok", "Supported");
    } catch (e) {
      update("BroadcastChannel", "fail", String(e));
    }

    // Test: AudioContext
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        ctx.close();
        update("AudioContext", "ok", "Supported");
      } else {
        update("AudioContext", "fail", "Not available");
      }
    } catch (e) {
      update("AudioContext", "fail", String(e));
    }

    // Test: fetch
    fetch("/api/health", { method: "GET" })
      .then((r) => {
        update("fetch() API", "ok", `Status: ${r.status}`);
      })
      .catch(() => {
        // Fallback: try fetching the page itself
        fetch("/fivem/test")
          .then((r) => update("fetch() API", "ok", `Fallback status: ${r.status}`))
          .catch((e) => update("fetch() API", "fail", String(e)));
      });

    // Test: Dynamic import
    import("@/lib/fivemCompat")
      .then(() => update("Dynamic import()", "ok", "fivemCompat loaded"))
      .catch((e) => update("Dynamic import()", "fail", String(e)));

    // Test: Firebase import
    import("@/lib/firebase")
      .then(() => update("Firebase import", "ok", "Firebase module loaded"))
      .catch((e) => update("Firebase import", "fail", String(e)));
  }, []);

  const statusIcon = (s: TestResult["status"]) => {
    switch (s) {
      case "ok": return "[OK]";
      case "fail": return "[FAIL]";
      case "warn": return "[WARN]";
      case "pending": return "[...]";
    }
  };

  const statusColor = (s: TestResult["status"]) => {
    switch (s) {
      case "ok": return "#10b981";
      case "fail": return "#ef4444";
      case "warn": return "#f59e0b";
      case "pending": return "#6b7280";
    }
  };

  const passed = tests.filter((t) => t.status === "ok").length;
  const failed = tests.filter((t) => t.status === "fail").length;

  return (
    <div
      style={{
        margin: 0,
        background: "#0a0a0a",
        color: "#e5e5e5",
        fontFamily: "monospace",
        padding: 24,
        minHeight: "100vh",
        fontSize: 13,
      }}
    >
      <h1 style={{ color: "#10b981", fontSize: 18, marginBottom: 4 }}>
        CERBERUS OS - CEF DIAGNOSTIC
      </h1>
      <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 11 }}>
        URL: /fivem/diag | UA: {typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : "N/A"}
      </p>

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <span style={{ color: "#10b981" }}>{passed} passed</span>
        <span style={{ color: "#ef4444" }}>{failed} failed</span>
        <span style={{ color: "#6b7280" }}>{tests.length - passed - failed} pending</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {tests.map((t) => (
          <div
            key={t.name}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              padding: "6px 10px",
              background: t.status === "fail" ? "#1a0000" : "#111",
              borderLeft: `3px solid ${statusColor(t.status)}`,
              borderRadius: 2,
            }}
          >
            <span style={{ color: statusColor(t.status), minWidth: 50, fontWeight: "bold" }}>
              {statusIcon(t.status)}
            </span>
            <span style={{ minWidth: 180 }}>{t.name}</span>
            <span style={{ color: "#6b7280", fontSize: 11 }}>{t.detail || ""}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: 12, background: "#111", borderRadius: 4, fontSize: 11, color: "#6b7280" }}>
        <p>Si tout est [OK] ici mais /fivem montre un ecran noir:</p>
        <p>→ Le probleme est dans le rendu des composants (BootScreen/LoginScreen/Desktop)</p>
        <p style={{ marginTop: 8 }}>Si Firebase est [FAIL]:</p>
        <p>→ Normal en localhost sans env vars. En prod, verifier les variables Vercel.</p>
      </div>
    </div>
  );
}
