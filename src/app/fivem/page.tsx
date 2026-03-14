"use client";

import { useState, useEffect } from "react";

export default function FiveMPage() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setMounted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }, []);

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a0a0c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}>
        <div style={{
          background: "rgba(127,29,29,0.5)",
          border: "1px solid #ef4444",
          borderRadius: 12,
          padding: 24,
          maxWidth: 400,
        }}>
          <h1 style={{ color: "#ef4444", fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>Erreur</h1>
          <p style={{ color: "white" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a0a0c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a0a0a 0%, #0a0a0c 50%, #0a0a14 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,42,42,0.3)",
        borderRadius: 16,
        padding: 32,
        maxWidth: 480,
        width: "100%",
        textAlign: "center",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>&#x2705;</div>
        <h1 style={{
          color: "#ff2a2a",
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 12,
          letterSpacing: "0.05em",
        }}>
          CERBERUS OS - FiveM
        </h1>
        <p style={{ color: "#d4d4d8", marginBottom: 20, fontSize: 14 }}>
          Cette page fonctionne correctement dans FiveM CEF !
        </p>

        <div style={{
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}>
          <p style={{ color: "#10b981", fontSize: 13 }}>
            Le JavaScript React fonctionne.
          </p>
        </div>

        <div style={{
          background: "rgba(255,42,42,0.08)",
          border: "1px solid rgba(255,42,42,0.2)",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}>
          <p style={{ color: "#ff6b6b", fontSize: 13 }}>
            Viewport: {typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "N/A"}
          </p>
          <p style={{ color: "#ff6b6b", fontSize: 11, marginTop: 4 }}>
            DPR: {typeof window !== "undefined" ? window.devicePixelRatio : "N/A"}
          </p>
        </div>

        <div style={{ color: "#6b7280", fontSize: 11, marginTop: 16 }}>
          Si vous voyez cette page, le probleme vient des composants
          avances (BootScreen, Desktop, Firebase) et non du CEF.
        </div>
      </div>
    </div>
  );
}
