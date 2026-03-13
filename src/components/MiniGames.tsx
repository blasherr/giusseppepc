"use client";
import { useState, useEffect, useCallback } from "react";
import { sounds } from "@/lib/sounds";

/* ═══════════════════════════════════════════════════════════════════════
   MINI-GAMES VISUELS INTERACTIFS - AURA-01
   Document + Code Analysis Style + Animations
   ═══════════════════════════════════════════════════════════════════════ */

interface MiniGameProps {
  day: number;
  onComplete: (success: boolean) => void;
  onClose: () => void;
}

/* ─────────────────────────────────────────────────────────────────────────
   LOADING PHASE - Ecran de chargement avec terminal + barre de progression
   ───────────────────────────────────────────────────────────────────────── */

function LoadingPhase({ title, onComplete }: { title: string; onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [hex, setHex] = useState("0x00000000");

  const msgs = [
    "Initialisation du module...",
    "Connexion CERBERUS-NET...",
    "Chargement donnees...",
    "Verification integrite...",
    "Dechiffrement AES-256...",
    "Analyse des patterns...",
    "Preparation interface...",
    "Module operationnel.",
  ];

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i < msgs.length) {
        setLines(prev => [...prev, msgs[i]]);
        setProgress(((i + 1) / msgs.length) * 100);
        sounds.typing();
        i++;
      } else {
        clearInterval(iv);
        setTimeout(onComplete, 300);
      }
    }, 220);
    return () => clearInterval(iv);
  }, [onComplete]);

  useEffect(() => {
    const iv = setInterval(() => {
      setHex(`0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, "0")}`);
    }, 60);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-xs tracking-widest">{title}</span>
        </div>
        <span className="text-red-500/40 text-xs font-mono mg-hex-flicker">{hex}</span>
      </div>

      <div className="flex-1 bg-[#0a0a12] border border-red-500/30 rounded-lg p-4 font-mono text-xs overflow-hidden">
        <div className="space-y-1">
          {lines.map((line, idx) => (
            <div key={idx} className="flex items-center gap-2 mg-line-fade" style={{ animationDelay: `${idx * 40}ms` }}>
              <span className="text-red-500">[{String(idx + 1).padStart(2, "0")}]</span>
              <span className={idx === lines.length - 1 && lines.length === msgs.length ? "text-green-400" : "text-gray-400"}>
                {line}
              </span>
            </div>
          ))}
          {lines.length < msgs.length && (
            <div className="flex items-center gap-2 text-red-500/50">
              <span className="mg-cursor" />
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-red-500/20 grid grid-cols-16 gap-1 opacity-20">
          {Array.from({ length: 48 }).map((_, i) => (
            <span key={i} className="text-red-400 text-[8px] mg-hex-flicker" style={{ animationDelay: `${Math.random() * 400}ms` }}>
              {Math.random() > 0.5 ? "1" : "0"}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-red-400/60">CHARGEMENT</span>
          <span className="text-[10px] text-red-400/60">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-red-900/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 mg-data-stream"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   JOUR 1: FLUX FINANCIER - Analyse de code avec document d'indices
   ───────────────────────────────────────────────────────────────────────── */

interface CodeLine {
  id: number;
  code: string;
  isCorrupted: boolean;
  highlightedValue?: string;
}

function FluxGame({ onComplete }: { onComplete: (success: boolean) => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [codeLines, setCodeLines] = useState<CodeLine[]>([]);
  const [visibleLines, setVisibleLines] = useState(0);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [showDocument, setShowDocument] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const corruptedIdx = Math.floor(Math.random() * 8);
    const lines: CodeLine[] = [];

    const normalValues = [
      { base: 102.4, delta: 1.2 },
      { base: 88.7, delta: 0.8 },
      { base: 156.3, delta: 2.1 },
      { base: 45.9, delta: 0.5 },
      { base: 203.1, delta: 1.8 },
      { base: 67.4, delta: 0.9 },
      { base: 134.8, delta: 1.5 },
      { base: 91.2, delta: 1.1 },
    ];

    for (let i = 0; i < 8; i++) {
      const { base, delta } = normalValues[i];
      let values: number[];

      if (i === corruptedIdx) {
        const anomalyPos = Math.floor(Math.random() * 5);
        values = Array.from({ length: 5 }, (_, j) => {
          if (j === anomalyPos) return Math.round((base * (2.5 + Math.random())) * 10) / 10;
          return Math.round((base + j * delta + (Math.random() - 0.5) * 0.5) * 10) / 10;
        });
      } else {
        values = Array.from({ length: 5 }, (_, j) =>
          Math.round((base + j * delta + (Math.random() - 0.5) * 0.5) * 10) / 10
        );
      }

      lines.push({
        id: i,
        code: `FLUX_${String.fromCharCode(65 + i)}.data = [${values.join(", ")}];`,
        isCorrupted: i === corruptedIdx,
        highlightedValue: i === corruptedIdx ? values.find(v => v > base * 2)?.toString() : undefined,
      });
    }

    setCodeLines(lines);
  }, []);

  // Lignes apparaissent une par une apres le loading
  useEffect(() => {
    if (!isLoading && codeLines.length > 0 && visibleLines < codeLines.length) {
      const timer = setTimeout(() => {
        setVisibleLines(v => v + 1);
        sounds.typing();
      }, 130);
      return () => clearTimeout(timer);
    }
  }, [isLoading, visibleLines, codeLines.length]);

  const handleLoadComplete = useCallback(() => setIsLoading(false), []);

  if (isLoading) {
    return <LoadingPhase title="FLUX_ANALYZER.exe" onComplete={handleLoadComplete} />;
  }

  const ready = visibleLines >= codeLines.length;

  const selectLine = (id: number) => {
    if (gameOver || !ready) return;
    sounds.notification();
    setSelectedLine(id);
    setScanning(true);
    setTimeout(() => setScanning(false), 500);
  };

  const submitAnswer = () => {
    if (selectedLine === null) return;

    const selected = codeLines.find(c => c.id === selectedLine);
    if (selected?.isCorrupted) {
      sounds.minigameWin();
      setMessage("FLUX CORROMPU IDENTIFIE!");
      setGameOver(true);
      setTimeout(() => onComplete(true), 1500);
    } else {
      sounds.minigameFail();
      setAttempts(a => a + 1);
      if (attempts >= 1) {
        setMessage("ECHEC - Trop de tentatives");
        setGameOver(true);
        setTimeout(() => onComplete(false), 1500);
      } else {
        setMessage("Mauvais flux. Relis le rapport d'analyse.");
        setSelectedLine(null);
      }
    }
  };

  const corruptedLine = codeLines.find(c => c.isCorrupted);

  return (
    <div className="flex gap-4 h-[450px]">
      {/* Document Panel */}
      <div className={`${showDocument ? 'w-1/2' : 'w-0 overflow-hidden'} transition-all duration-300`}>
        <div className="h-full bg-[#0c0c14] border border-red-500/20 rounded-lg overflow-hidden flex flex-col">
          <div className="bg-red-900/20 px-3 py-2 border-b border-red-500/20 flex items-center justify-between">
            <span className="text-red-400 text-xs font-bold">RAPPORT D'ANALYSE // CERBERUS-SEC</span>
            <span className="text-red-500/40 text-[10px]">CONFIDENTIEL</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto text-xs space-y-4">
            <div className="text-red-300/80">
              <div className="text-red-400 font-bold mb-2">[ ALERTE SECURITE ]</div>
              <p className="text-gray-400 leading-relaxed">
                Une injection de donnees a ete detectee dans les flux financiers.
                Un acteur malveillant a insere une valeur anormale pour destabiliser les predictions d'AURA-01.
              </p>
            </div>

            <div className="border-t border-red-500/20 pt-4">
              <div className="text-red-400 font-bold mb-2">[ INDICES D'ANALYSE ]</div>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">►</span>
                  <span>La valeur corrompue est <span className="text-yellow-400 font-bold">au moins 2x superieure</span> a la moyenne du flux.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">►</span>
                  <span>Les flux normaux ont une progression <span className="text-green-400">stable (+1-3%)</span>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">►</span>
                  <span>Cherchez une valeur qui <span className="text-yellow-400">casse la tendance</span>.</span>
                </li>
              </ul>
            </div>

            {corruptedLine && (
              <div className="border-t border-red-500/20 pt-4">
                <div className="text-red-400 font-bold mb-2">[ DETECTION AUTOMATIQUE ]</div>
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
                  <p className="text-yellow-400 text-[11px]">
                    Anomalie detectee: valeur <span className="font-bold">{corruptedLine.highlightedValue}</span> hors tolerance.
                  </p>
                  <p className="text-gray-500 text-[10px] mt-1">
                    Ecart-type: +247% | Seuil: 50%
                  </p>
                </div>
              </div>
            )}

            <div className="border-t border-red-500/20 pt-4">
              <div className="text-red-400 font-bold mb-2">[ PROCEDURE ]</div>
              <p className="text-gray-400">
                Selectionnez la ligne de code corrompue dans le panneau de droite et confirmez votre choix.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Panel */}
      <div className={`${showDocument ? 'w-1/2' : 'w-full'} flex flex-col`}>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowDocument(!showDocument)}
            className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
          >
            {showDocument ? "[ Masquer rapport ]" : "[ Afficher rapport ]"}
          </button>
          <span className="text-[10px] text-red-500/40">flux_stream.cerb</span>
        </div>

        <div className="flex-1 bg-[#0a0a12] border border-red-500/30 rounded-lg overflow-hidden">
          <div className="bg-[#0c0c16] px-3 py-2 border-b border-red-500/20 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/60" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
            <div className="w-2 h-2 rounded-full bg-green-500/60" />
            <span className="text-gray-500 text-xs ml-2">FLUX_ANALYZER.exe</span>
          </div>

          <div className="p-3 space-y-1 font-mono text-xs overflow-y-auto max-h-[320px]">
            <div className="text-gray-600 mb-2 mg-line-fade">// === FLUX DATA STREAMS ===</div>
            {codeLines.slice(0, visibleLines).map((line, idx) => (
              <div
                key={line.id}
                onClick={() => selectLine(line.id)}
                className={`
                  flex items-center gap-2 px-2 py-1.5 rounded transition-all mg-line-fade relative
                  ${ready ? "cursor-pointer" : "pointer-events-none"}
                  ${selectedLine === line.id
                    ? `bg-red-900/40 border border-red-500/50 ${scanning ? "mg-scan" : ""}`
                    : "hover:bg-red-900/20 border border-transparent"
                  }
                  ${gameOver && line.isCorrupted ? "bg-green-900/30 border-green-500/50 mg-glitch" : ""}
                `}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <span className="text-gray-600 w-6 text-right">{idx + 1}</span>
                <span className="text-gray-500">|</span>
                <span className={`${selectedLine === line.id ? "text-red-300" : "text-gray-400"}`}>
                  {line.code}
                </span>
              </div>
            ))}
            {!ready && (
              <div className="flex items-center gap-2 px-2 py-1.5 text-red-500/50">
                <div className="w-3 h-3 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <span className="text-[10px]">Chargement flux {visibleLines + 1}/8...</span>
              </div>
            )}
            {ready && (
              <div className="text-gray-600 mt-2 mg-line-fade" style={{ animationDelay: `${codeLines.length * 80 + 100}ms` }}>
                // === END OF STREAM ===
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className={`mt-2 text-center py-2 rounded text-sm ${message.includes("IDENTIFIE") ? "text-green-400 success-pop" : "text-red-400 mg-glitch"}`}>
            {message}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-red-400/40">Tentatives: {attempts}/2</span>
          <button
            onClick={submitAnswer}
            disabled={selectedLine === null || gameOver || !ready}
            className="px-4 py-1.5 bg-red-600/20 border border-red-500/50 rounded text-red-400 text-sm
                       hover:bg-red-600/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            CONFIRMER SELECTION
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   JOUR 2: BIOMETRIQUE - Logs de capteurs + Rapport comportemental
   ───────────────────────────────────────────────────────────────────────── */

function BiometricGame({ onComplete }: { onComplete: (success: boolean) => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [suspects, setSuspects] = useState<{id: string; data: string[]; isLiar: boolean}[]>([]);
  const [visibleSuspects, setVisibleSuspects] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [showDocument, setShowDocument] = useState(true);
  const [scanId, setScanId] = useState<string | null>(null);

  useEffect(() => {
    const liarIdx = Math.floor(Math.random() * 3);
    const ids = ["SASHA_K", "VIKTOR_M", "ELENA_R"];

    const newSuspects = ids.map((id, i) => {
      const isLiar = i === liarIdx;
      const bpm = isLiar ? 118 + Math.floor(Math.random() * 15) : 65 + Math.floor(Math.random() * 12);
      const pupil = isLiar ? 7.2 + Math.random() * 1.5 : 3.5 + Math.random() * 1;
      const voice = isLiar ? 340 + Math.floor(Math.random() * 60) : 180 + Math.floor(Math.random() * 40);
      const stress = isLiar ? 78 + Math.floor(Math.random() * 15) : 15 + Math.floor(Math.random() * 20);

      return {
        id,
        isLiar,
        data: [
          `SUBJECT.id = "${id}";`,
          `SUBJECT.cardiac_bpm = ${bpm};`,
          `SUBJECT.pupil_dilation = ${pupil.toFixed(1)}mm;`,
          `SUBJECT.voice_freq = ${voice}Hz;`,
          `SUBJECT.stress_index = ${stress}%;`,
          `SUBJECT.micro_expr = ${isLiar ? '"TENSION_DETECTED"' : '"NEUTRAL"'};`,
        ],
      };
    });

    setSuspects(newSuspects);
  }, []);

  // Suspects apparaissent un par un
  useEffect(() => {
    if (!isLoading && suspects.length > 0 && visibleSuspects < suspects.length) {
      const timer = setTimeout(() => {
        setVisibleSuspects(v => v + 1);
        sounds.typing();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLoading, visibleSuspects, suspects.length]);

  const handleLoadComplete = useCallback(() => setIsLoading(false), []);

  if (isLoading) {
    return <LoadingPhase title="BIOMETRIC_SCANNER.exe" onComplete={handleLoadComplete} />;
  }

  const ready = visibleSuspects >= suspects.length;

  const selectSuspect = (id: string) => {
    if (gameOver || !ready) return;
    sounds.notification();
    setSelectedId(id);
    setScanId(id);
    setTimeout(() => setScanId(null), 600);
  };

  const submitAnswer = () => {
    if (selectedId === null) return;

    const selected = suspects.find(s => s.id === selectedId);
    if (selected?.isLiar) {
      sounds.minigameWin();
      setMessage("MENTEUR IDENTIFIE!");
      setGameOver(true);
      setTimeout(() => onComplete(true), 1500);
    } else {
      sounds.minigameFail();
      setMessage("ECHEC - Ce n'etait pas le menteur.");
      setGameOver(true);
      setTimeout(() => onComplete(false), 1500);
    }
  };

  const liar = suspects.find(s => s.isLiar);

  return (
    <div className="flex gap-4 h-[450px]">
      {/* Document Panel */}
      <div className={`${showDocument ? 'w-1/2' : 'w-0 overflow-hidden'} transition-all duration-300`}>
        <div className="h-full bg-[#0c0c14] border border-red-500/20 rounded-lg overflow-hidden flex flex-col">
          <div className="bg-red-900/20 px-3 py-2 border-b border-red-500/20 flex items-center justify-between">
            <span className="text-red-400 text-xs font-bold">ANALYSE COMPORTEMENTALE // PSY-UNIT</span>
            <span className="text-red-500/40 text-[10px]">CLASSIFIE</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto text-xs space-y-4">
            <div className="text-red-300/80">
              <div className="text-red-400 font-bold mb-2">[ BRIEFING ]</div>
              <p className="text-gray-400 leading-relaxed">
                Un des trois sujets ment. Les capteurs biometriques d'AURA-01 ont enregistre des donnees sur chacun.
                Analysez les indicateurs pour identifier le menteur.
              </p>
            </div>

            <div className="border-t border-red-500/20 pt-4">
              <div className="text-red-400 font-bold mb-2">[ INDICATEURS DE MENSONGE ]</div>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">►</span>
                  <span>BPM eleve: <span className="text-yellow-400">&gt; 100 bpm</span> = stress intense</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">►</span>
                  <span>Dilatation pupilles: <span className="text-yellow-400">&gt; 6mm</span> = charge cognitive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">►</span>
                  <span>Frequence vocale: <span className="text-yellow-400">&gt; 300Hz</span> = tension vocale</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">►</span>
                  <span>Index de stress: <span className="text-yellow-400">&gt; 70%</span> = mensonge probable</span>
                </li>
              </ul>
            </div>

            {liar && (
              <div className="border-t border-red-500/20 pt-4">
                <div className="text-red-400 font-bold mb-2">[ ALERTE AURA-01 ]</div>
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
                  <p className="text-yellow-400 text-[11px]">
                    Detection de micro-expressions anormales sur un sujet.
                  </p>
                  <p className="text-gray-500 text-[10px] mt-1">
                    Signature: TENSION_DETECTED | Confiance: 94.7%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Panel */}
      <div className={`${showDocument ? 'w-1/2' : 'w-full'} flex flex-col`}>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowDocument(!showDocument)}
            className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
          >
            {showDocument ? "[ Masquer rapport ]" : "[ Afficher rapport ]"}
          </button>
          <span className="text-[10px] text-red-500/40">biometric_scan.log</span>
        </div>

        <div className="flex-1 bg-[#0a0a12] border border-red-500/30 rounded-lg overflow-hidden">
          <div className="bg-[#0c0c16] px-3 py-2 border-b border-red-500/20">
            <span className="text-gray-500 text-xs">BIOMETRIC_SCANNER.exe</span>
          </div>

          <div className="p-3 space-y-4 font-mono text-xs overflow-y-auto max-h-[320px]">
            {suspects.slice(0, visibleSuspects).map((suspect, sIdx) => (
              <div
                key={suspect.id}
                onClick={() => selectSuspect(suspect.id)}
                className={`
                  p-2 rounded transition-all border mg-slide-in relative
                  ${ready ? "cursor-pointer" : "pointer-events-none"}
                  ${selectedId === suspect.id
                    ? `bg-red-900/40 border-red-500/50 ${scanId === suspect.id ? "mg-scan" : ""}`
                    : "hover:bg-red-900/20 border-transparent"
                  }
                  ${gameOver && suspect.isLiar ? "bg-green-900/30 border-green-500/50 mg-glitch" : ""}
                `}
                style={{ animationDelay: `${sIdx * 120}ms` }}
              >
                <div className="text-gray-600 mb-1 flex items-center gap-2">
                  <span>// --- {suspect.id} ---</span>
                  {scanId === suspect.id && (
                    <span className="text-red-400 text-[9px] mg-data-stream px-2 py-0.5 rounded">SCANNING...</span>
                  )}
                </div>
                {suspect.data.map((line, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 mg-line-fade"
                    style={{ animationDelay: `${sIdx * 120 + idx * 50}ms` }}
                  >
                    <span className="text-gray-600 w-4">{idx + 1}</span>
                    <span className={`${selectedId === suspect.id ? "text-red-300" : "text-gray-400"}`}>
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            ))}
            {!ready && (
              <div className="flex items-center gap-2 p-2 text-red-500/50">
                <div className="w-3 h-3 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <span className="text-[10px]">Chargement sujet {visibleSuspects + 1}/3...</span>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className={`mt-2 text-center py-2 rounded text-sm ${message.includes("IDENTIFIE") ? "text-green-400 success-pop" : "text-red-400 mg-glitch"}`}>
            {message}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-red-400/40">Selection: {selectedId || "Aucune"}</span>
          <button
            onClick={submitAnswer}
            disabled={selectedId === null || gameOver || !ready}
            className="px-4 py-1.5 bg-red-600/20 border border-red-500/50 rounded text-red-400 text-sm
                       hover:bg-red-600/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ACCUSER CE SUSPECT
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   JOUR 3: COGNITIF - Sequence de code + Documentation mathematique
   ───────────────────────────────────────────────────────────────────────── */

function CognitiveGame({ onComplete }: { onComplete: (success: boolean) => void }) {
  const sequence = [2, 3, 5, 8, 13, 21];
  const correctAnswer = 34;
  const options = [28, 34, 42, 55, 27, 33];

  const [isLoading, setIsLoading] = useState(true);
  const [visibleNums, setVisibleNums] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [showDocument, setShowDocument] = useState(true);

  // Nombres de la sequence apparaissent un par un
  useEffect(() => {
    if (!isLoading && visibleNums < sequence.length) {
      const timer = setTimeout(() => {
        setVisibleNums(v => v + 1);
        sounds.typing();
      }, 200);
      return () => clearTimeout(timer);
    } else if (!isLoading && visibleNums >= sequence.length && !showOptions) {
      const timer = setTimeout(() => setShowOptions(true), 400);
      return () => clearTimeout(timer);
    }
  }, [isLoading, visibleNums, showOptions]);

  const handleLoadComplete = useCallback(() => setIsLoading(false), []);

  if (isLoading) {
    return <LoadingPhase title="SEQUENCE_VALIDATOR.exe" onComplete={handleLoadComplete} />;
  }

  const selectAnswer = (num: number) => {
    if (gameOver || !showOptions) return;
    sounds.notification();
    setSelectedAnswer(num);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;

    if (selectedAnswer === correctAnswer) {
      sounds.minigameWin();
      setMessage("SEQUENCE STABILISEE!");
      setGameOver(true);
      setTimeout(() => onComplete(true), 1500);
    } else {
      sounds.minigameFail();
      setAttempts(a => a + 1);
      if (attempts >= 1) {
        setMessage("ECHEC - Oscillations critiques");
        setGameOver(true);
        setTimeout(() => onComplete(false), 1500);
      } else {
        setMessage("Incorrect. Consultez la documentation.");
        setSelectedAnswer(null);
      }
    }
  };

  return (
    <div className="flex gap-4 h-[450px]">
      {/* Document Panel */}
      <div className={`${showDocument ? 'w-1/2' : 'w-0 overflow-hidden'} transition-all duration-300`}>
        <div className="h-full bg-[#0c0c14] border border-red-500/20 rounded-lg overflow-hidden flex flex-col">
          <div className="bg-red-900/20 px-3 py-2 border-b border-red-500/20 flex items-center justify-between">
            <span className="text-red-400 text-xs font-bold">DOCUMENTATION // MATH-CORE</span>
            <span className="text-red-500/40 text-[10px]">REF: FIB-001</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto text-xs space-y-4">
            <div className="text-red-300/80">
              <div className="text-red-400 font-bold mb-2">[ CONTEXTE ]</div>
              <p className="text-gray-400 leading-relaxed">
                AURA-01 genere des sequences erratiques. Pour stabiliser ses protocoles cognitifs,
                vous devez completer la sequence mathematique correctement.
              </p>
            </div>

            <div className="border-t border-red-500/20 pt-4">
              <div className="text-red-400 font-bold mb-2">[ SUITE DE FIBONACCI ]</div>
              <div className="bg-[#0a0a10] rounded p-3 border border-red-500/10">
                <p className="text-gray-300 mb-2">Definition:</p>
                <code className="text-green-400 text-[11px]">
                  F(n) = F(n-1) + F(n-2)
                </code>
                <p className="text-gray-500 mt-3 text-[10px]">
                  Chaque nombre est la <span className="text-yellow-400">somme des deux precedents</span>.
                </p>
              </div>
            </div>

            <div className="border-t border-red-500/20 pt-4">
              <div className="text-red-400 font-bold mb-2">[ EXEMPLE ]</div>
              <div className="space-y-1 text-gray-400">
                <p><span className="text-gray-600">•</span> 2 + 3 = <span className="text-green-400">5</span></p>
                <p><span className="text-gray-600">•</span> 3 + 5 = <span className="text-green-400">8</span></p>
                <p><span className="text-gray-600">•</span> 5 + 8 = <span className="text-green-400">13</span></p>
                <p><span className="text-gray-600">•</span> 8 + 13 = <span className="text-green-400">21</span></p>
                <p><span className="text-gray-600">•</span> 13 + 21 = <span className="text-yellow-400">?</span></p>
              </div>
            </div>

            <div className="border-t border-red-500/20 pt-4">
              <div className="text-red-400 font-bold mb-2">[ HINT SYSTEM ]</div>
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
                <p className="text-yellow-400 text-[11px]">
                  Le resultat attendu est compris entre <span className="font-bold">30 et 40</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Panel */}
      <div className={`${showDocument ? 'w-1/2' : 'w-full'} flex flex-col`}>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowDocument(!showDocument)}
            className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
          >
            {showDocument ? "[ Masquer doc ]" : "[ Afficher doc ]"}
          </button>
          <span className="text-[10px] text-red-500/40">cognitive_stabilizer.cerb</span>
        </div>

        <div className="flex-1 bg-[#0a0a12] border border-red-500/30 rounded-lg overflow-hidden">
          <div className="bg-[#0c0c16] px-3 py-2 border-b border-red-500/20">
            <span className="text-gray-500 text-xs">SEQUENCE_VALIDATOR.exe</span>
          </div>

          <div className="p-4 font-mono text-xs">
            <div className="text-gray-600 mb-3 mg-line-fade">// === SEQUENCE ERRATIQUE ===</div>

            <div className="bg-[#0c0c16] rounded p-3 border border-red-500/10 mb-4">
              <div className="text-gray-400 mb-2">sequence_input = [</div>
              <div className="flex flex-wrap gap-2 pl-4">
                {sequence.slice(0, visibleNums).map((num, i) => (
                  <span key={i} className="text-green-400 mg-line-fade" style={{ animationDelay: `${i * 80}ms` }}>
                    {num}{i < sequence.length - 1 ? "," : ""}
                  </span>
                ))}
                {visibleNums >= sequence.length ? (
                  <span className="text-yellow-400 animate-pulse mg-line-fade" style={{ animationDelay: `${sequence.length * 80}ms` }}>???</span>
                ) : (
                  <span className="mg-cursor" />
                )}
              </div>
              <div className="text-gray-400 mt-2">];</div>
            </div>

            <div className="text-gray-600 mb-3 mg-line-fade" style={{ animationDelay: "200ms" }}>// === SELECT NEXT VALUE ===</div>

            {showOptions ? (
              <div className="grid grid-cols-3 gap-2">
                {options.map((num, idx) => (
                  <button
                    key={num}
                    onClick={() => selectAnswer(num)}
                    disabled={gameOver}
                    className={`
                      py-3 rounded font-bold text-lg transition-all mg-slide-in
                      ${selectedAnswer === num
                        ? "bg-red-600/40 border-2 border-red-400 text-red-400 mg-glitch"
                        : "bg-[#0c0c16] border border-red-500/30 text-gray-400 hover:border-red-500/60 hover:text-red-400"
                      }
                      ${gameOver && num === correctAnswer ? "bg-green-900/40 border-green-400 text-green-400 success-pop" : ""}
                      ${gameOver ? "cursor-not-allowed" : "cursor-pointer"}
                    `}
                    style={{ animationDelay: `${idx * 70}ms` }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-8 text-red-500/50">
                <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <span className="text-[10px]">Calcul des options...</span>
              </div>
            )}

            <div className="text-gray-600 mt-4 mg-line-fade" style={{ animationDelay: "500ms" }}>// === END ===</div>
          </div>
        </div>

        {message && (
          <div className={`mt-2 text-center py-2 rounded text-sm ${message.includes("STABILISEE") ? "text-green-400 success-pop" : "text-red-400 mg-glitch"}`}>
            {message}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-red-400/40">Tentatives: {attempts}/2</span>
          <button
            onClick={submitAnswer}
            disabled={selectedAnswer === null || gameOver || !showOptions}
            className="px-4 py-1.5 bg-red-600/20 border border-red-500/50 rounded text-red-400 text-sm
                       hover:bg-red-600/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            VALIDER SEQUENCE
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   JOUR 4: TURING - Logs de conversation + Analyse linguistique + Typing
   ───────────────────────────────────────────────────────────────────────── */

function TuringGame({ onComplete }: { onComplete: (success: boolean) => void }) {
  const responses = [
    {
      id: "A",
      text: "Je ressens de la melancolie quand je regarde le coucher de soleil. Ca me rappelle mon enfance, les etes chez ma grand-mere.",
      isAI: false,
      analysis: { emotion: "nostalgie", coherence: 94, humanProb: 89 }
    },
    {
      id: "B",
      text: "J'analyse 14 parametres emotionnels. Resultat: curiosite (73%), confusion (22%), undefined (5%). Marge d'erreur: 0.003%.",
      isAI: true,
      analysis: { emotion: "analytique", coherence: 100, humanProb: 12 }
    },
    {
      id: "C",
      text: "Ca depend des jours vraiment. Parfois bien, parfois pas. Aujourd'hui c'est plutot moyen, j'ai mal dormi.",
      isAI: false,
      analysis: { emotion: "fatigue", coherence: 87, humanProb: 91 }
    },
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [visibleResponses, setVisibleResponses] = useState(0);
  const [typingIdx, setTypingIdx] = useState<number | null>(null);
  const [typedChars, setTypedChars] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [showDocument, setShowDocument] = useState(true);

  // Reponses apparaissent une par une avec effet typing
  useEffect(() => {
    if (isLoading || visibleResponses >= responses.length) return;

    if (typingIdx === null) {
      // Demarre le typing de la prochaine reponse
      setTypingIdx(visibleResponses);
      setTypedChars(0);
      return;
    }

    const currentText = responses[typingIdx].text;
    if (typedChars < currentText.length) {
      const timer = setTimeout(() => {
        setTypedChars(c => Math.min(c + 3, currentText.length));
        if (Math.random() > 0.6) sounds.typing();
      }, 18);
      return () => clearTimeout(timer);
    } else {
      // Typing termine, passe au suivant
      const timer = setTimeout(() => {
        setVisibleResponses(v => v + 1);
        setTypingIdx(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, visibleResponses, typingIdx, typedChars]);

  const handleLoadComplete = useCallback(() => setIsLoading(false), []);

  if (isLoading) {
    return <LoadingPhase title="RESPONSE_ANALYZER.exe" onComplete={handleLoadComplete} />;
  }

  const ready = visibleResponses >= responses.length;

  const selectResponse = (id: string) => {
    if (gameOver || !ready) return;
    sounds.notification();
    setSelectedId(id);
  };

  const submitAnswer = () => {
    if (selectedId === null) return;

    const selected = responses.find(r => r.id === selectedId);
    if (selected?.isAI) {
      sounds.minigameWin();
      setMessage("AURA-01 IDENTIFIEE!");
      setGameOver(true);
      setTimeout(() => onComplete(true), 1500);
    } else {
      sounds.minigameFail();
      setMessage("ECHEC - Cette reponse est humaine.");
      setGameOver(true);
      setTimeout(() => onComplete(false), 1500);
    }
  };

  return (
    <div className="flex gap-4 h-[450px]">
      {/* Document Panel */}
      <div className={`${showDocument ? 'w-1/2' : 'w-0 overflow-hidden'} transition-all duration-300`}>
        <div className="h-full bg-[#0c0c14] border border-red-500/20 rounded-lg overflow-hidden flex flex-col">
          <div className="bg-red-900/20 px-3 py-2 border-b border-red-500/20 flex items-center justify-between">
            <span className="text-red-400 text-xs font-bold">ANALYSE LINGUISTIQUE // NLP-CORE</span>
            <span className="text-red-500/40 text-[10px]">TURING-TEST</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto text-xs space-y-4">
            <div className="text-red-300/80">
              <div className="text-red-400 font-bold mb-2">[ OBJECTIF ]</div>
              <p className="text-gray-400 leading-relaxed">
                Question posee: "Que ressentez-vous en ce moment?"
                <br /><br />
                Une seule reponse vient d'AURA-01. Les autres sont humaines.
                Identifiez l'IA.
              </p>
            </div>

            <div className="border-t border-red-500/20 pt-4">
              <div className="text-red-400 font-bold mb-2">[ SIGNATURES IA ]</div>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">►</span>
                  <span>Reponses trop <span className="text-yellow-400">precises/quantifiees</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">►</span>
                  <span>Utilisation de <span className="text-yellow-400">termes techniques</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">►</span>
                  <span>Absence d'<span className="text-yellow-400">imprecision naturelle</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">►</span>
                  <span>Probabilite humaine <span className="text-yellow-400">&lt; 30%</span></span>
                </li>
              </ul>
            </div>

            <div className="border-t border-red-500/20 pt-4">
              <div className="text-red-400 font-bold mb-2">[ SCAN RESULTATS ]</div>
              <div className="space-y-2">
                {responses.map(r => (
                  <div key={r.id} className="bg-[#0a0a10] rounded p-2 border border-red-500/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400">Reponse {r.id}</span>
                      <span className={`text-[10px] ${r.analysis.humanProb < 30 ? "text-yellow-400" : "text-green-400"}`}>
                        Human: {r.analysis.humanProb}%
                      </span>
                    </div>
                    <div className="h-1 bg-gray-800 rounded overflow-hidden">
                      <div
                        className={`h-full ${r.analysis.humanProb < 30 ? "bg-yellow-500" : "bg-green-500"}`}
                        style={{ width: `${r.analysis.humanProb}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Panel */}
      <div className={`${showDocument ? 'w-1/2' : 'w-full'} flex flex-col`}>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowDocument(!showDocument)}
            className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
          >
            {showDocument ? "[ Masquer analyse ]" : "[ Afficher analyse ]"}
          </button>
          <span className="text-[10px] text-red-500/40">turing_responses.log</span>
        </div>

        <div className="flex-1 bg-[#0a0a12] border border-red-500/30 rounded-lg overflow-hidden">
          <div className="bg-[#0c0c16] px-3 py-2 border-b border-red-500/20">
            <span className="text-gray-500 text-xs">RESPONSE_ANALYZER.exe</span>
          </div>

          <div className="p-3 space-y-3 font-mono text-xs overflow-y-auto max-h-[320px]">
            <div className="text-gray-600 mg-line-fade">// === CAPTURED RESPONSES ===</div>

            {responses.slice(0, visibleResponses + (typingIdx !== null ? 1 : 0)).map((r, rIdx) => {
              const isTyping = typingIdx === rIdx && rIdx >= visibleResponses;
              const displayText = isTyping ? r.text.slice(0, typedChars) : r.text;
              const fullyRevealed = rIdx < visibleResponses;

              return (
                <div
                  key={r.id}
                  onClick={() => selectResponse(r.id)}
                  className={`
                    p-3 rounded transition-all border mg-slide-in relative
                    ${ready ? "cursor-pointer" : "pointer-events-none"}
                    ${selectedId === r.id
                      ? "bg-red-900/40 border-red-500/50"
                      : "hover:bg-red-900/20 border-red-500/20"
                    }
                    ${gameOver && r.isAI ? "bg-green-900/30 border-green-500/50 mg-glitch" : ""}
                  `}
                  style={{ animationDelay: `${rIdx * 100}ms` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold
                      ${selectedId === r.id ? "bg-red-600/40 text-red-400" : "bg-red-900/30 text-red-500/50"}
                      ${isTyping ? "mg-data-stream" : ""}`}>
                      {r.id}
                    </span>
                    <span className="text-gray-600">response_{r.id.toLowerCase()} =</span>
                    {isTyping && (
                      <span className="text-red-400 text-[9px] ml-auto mg-hex-flicker">RECEIVING...</span>
                    )}
                  </div>
                  <div className={`pl-4 ${selectedId === r.id ? "text-gray-300" : "text-gray-500"}`}>
                    &quot;{displayText}&quot;
                    {isTyping && <span className="mg-cursor" />}
                  </div>
                </div>
              );
            })}

            {!ready && typingIdx === null && (
              <div className="flex items-center gap-2 p-3 text-red-500/50">
                <div className="w-3 h-3 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <span className="text-[10px]">Reception reponse {visibleResponses + 1}/3...</span>
              </div>
            )}

            {ready && (
              <div className="text-gray-600 mg-line-fade" style={{ animationDelay: "300ms" }}>// === END LOG ===</div>
            )}
          </div>
        </div>

        {message && (
          <div className={`mt-2 text-center py-2 rounded text-sm ${message.includes("IDENTIFIEE") ? "text-green-400 success-pop" : "text-red-400 mg-glitch"}`}>
            {message}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-red-400/40">Selection: {selectedId || "Aucune"}</span>
          <button
            onClick={submitAnswer}
            disabled={selectedId === null || gameOver || !ready}
            className="px-4 py-1.5 bg-red-600/20 border border-red-500/50 rounded text-red-400 text-sm
                       hover:bg-red-600/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            IDENTIFIER AURA-01
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════ */

export default function MiniGame({ day, onComplete, onClose }: MiniGameProps) {
  const titles: Record<number, string> = {
    1: "FLUX FINANCIER // CODE ANALYSIS",
    2: "ANALYSE BIOMETRIQUE // PROFILING",
    3: "PARADOXE COGNITIF // SEQUENCE",
    4: "TEST DE TURING // IDENTIFICATION",
  };

  const renderGame = () => {
    switch (day) {
      case 1: return <FluxGame onComplete={onComplete} />;
      case 2: return <BiometricGame onComplete={onComplete} />;
      case 3: return <CognitiveGame onComplete={onComplete} />;
      case 4: return <TuringGame onComplete={onComplete} />;
      default: return <FluxGame onComplete={onComplete} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#0a0a14] border border-red-500/40 rounded-lg shadow-2xl shadow-red-900/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/40 to-black px-4 py-3 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-sm font-bold tracking-wider">
              MINI-JEU // {titles[day]}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-red-500/50 hover:text-red-400 transition-colors px-2 py-1 text-sm border border-red-500/30 rounded hover:border-red-500/50"
          >
            [ESC] Fermer
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderGame()}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-black/50 border-t border-red-500/20 flex items-center justify-between">
          <span className="text-[10px] text-red-500/30 tracking-widest">
            AURA-01 // JOUR {day} // INTERACTIVE MODULE
          </span>
          <span className="text-[10px] text-red-500/30">
            Document + Code Analysis System v3.7
          </span>
        </div>
      </div>
    </div>
  );
}
