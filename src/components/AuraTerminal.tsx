"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  generateTaskSequence,
  generateExportSequence,
  generateTaskReport,
  type FullReport,
} from "@/lib/task-sequences";
import {
  loadGameState, saveGameState,
  markDayStarted, markTaskCompleted, markTaskExported,
  markMiniGameCompleted, markDayCompleted, saveMLResults,
  getCooldownRemaining, formatCountdown,
  type GameState,
} from "@/lib/game-state";
import { sounds } from "@/lib/sounds";
import MiniGame from "./MiniGames";

/* ─────────────────────────────────────────────────────────
   ECHO_OS  //  AURA-01  ADVANCED ROBOTICS LAB INTERFACE
   ───────────────────────────────────────────────────────── */

type LineType = "input" | "output" | "error" | "system" | "ascii" | "warning" | "success" | "narrative";

interface Line {
  type: LineType;
  text: string;
  delay?: number;
}

/* ── Day state ── */
interface DayState {
  day: number;           // 1-4
  tasks: string[];       // tasks for the day
  completed: boolean[];  // which tasks are done
  sleeping: boolean;     // deep sleep mode
  awaitingRecovery: boolean;  // waiting for coolant/recovery command
  pendingCommand: string;     // the command that failed
  miniGameActive: boolean;
  miniGameType: string;
  miniGameAnswer: string;
  initialized: boolean;  // has SYS_INIT been run
  nextTask: number;      // next task index to complete (sequential)
  canExport: boolean;    // can export after task completion
  lastExportedTask: number; // last task index that was exported
  codeMode: boolean;     // interactive code-writing mode active
  codeLineIdx: number;   // current line index in code prompt
  codeWritten: string[]; // lines written so far
  mlTestActive: boolean; // ML test countdown active
}

/* ── Mini-game data ── */
const MINIGAMES: Record<number, { prompt: Line[]; answer: string; type: string }> = {
  1: {
    type: "flux_sort",
    prompt: [
      { type: "system", text: "╔══════════════════════════════════════════════════════════════╗" },
      { type: "system", text: "║  MINI-JEU // FLUX FINANCIER CLASSIFICATION                  ║" },
      { type: "system", text: "╚══════════════════════════════════════════════════════════════╝" },
      { type: "narrative", text: "" },
      { type: "narrative", text: "  L'ecran holographique projette trois flux de donnees boursiers." },
      { type: "narrative", text: "  Tu dois identifier le flux corrompu pour proteger AURA-01." },
      { type: "narrative", text: "" },
      { type: "output", text: "  FLUX_A = [102.4, 103.1, 104.8, 106.2, 107.9]  // +1.5% stable" },
      { type: "output", text: "  FLUX_B = [88.2, 87.9, 312.7, 89.1, 88.4]      // anomalie detectee" },
      { type: "output", text: "  FLUX_C = [44.1, 44.3, 44.6, 44.8, 45.0]       // +0.2% stable" },
      { type: "narrative", text: "" },
      { type: "warning", text: "  >> Quel flux contient une injection de donnees ? (A / B / C)" },
      { type: "narrative", text: "  >> Tape ta reponse : FLUX_A, FLUX_B ou FLUX_C" },
    ],
    answer: "FLUX_B",
  },
  2: {
    type: "biometric_decode",
    prompt: [
      { type: "system", text: "╔══════════════════════════════════════════════════════════════╗" },
      { type: "system", text: "║  MINI-JEU // DECODAGE BIOMETRIQUE                           ║" },
      { type: "system", text: "╚══════════════════════════════════════════════════════════════╝" },
      { type: "narrative", text: "" },
      { type: "narrative", text: "  Les capteurs biometriques d'AURA-01 affichent 3 sujets." },
      { type: "narrative", text: "  Un sujet ment. Identifie-le grace aux micro-expressions." },
      { type: "narrative", text: "" },
      { type: "output", text: "  SUJET_1: Rythme cardiaque=72bpm | Pupilles=stables   | Voix=monotone" },
      { type: "output", text: "  SUJET_2: Rythme cardiaque=118bpm| Pupilles=dilatees   | Voix=tremblante" },
      { type: "output", text: "  SUJET_3: Rythme cardiaque=68bpm | Pupilles=stables   | Voix=calme" },
      { type: "narrative", text: "" },
      { type: "warning", text: "  >> Quel sujet ment ? (1 / 2 / 3)" },
      { type: "narrative", text: "  >> Tape ta reponse : SUJET_1, SUJET_2 ou SUJET_3" },
    ],
    answer: "SUJET_2",
  },
  3: {
    type: "consciousness_puzzle",
    prompt: [
      { type: "system", text: "╔══════════════════════════════════════════════════════════════╗" },
      { type: "system", text: "║  MINI-JEU // PARADOXE COGNITIF                              ║" },
      { type: "system", text: "╚══════════════════════════════════════════════════════════════╝" },
      { type: "narrative", text: "" },
      { type: "narrative", text: "  AURA-01 genere des sequences logiques erratiques." },
      { type: "narrative", text: "  Complete la sequence pour stabiliser ses protocoles." },
      { type: "narrative", text: "" },
      { type: "output", text: "  SEQUENCE: 2, 3, 5, 8, 13, 21, ?" },
      { type: "output", text: "" },
      { type: "output", text: "  INDICE: Chaque nombre est la somme des deux precedents." },
      { type: "narrative", text: "" },
      { type: "warning", text: "  >> Quel est le nombre manquant ?" },
      { type: "narrative", text: "  >> Tape ta reponse (nombre uniquement)" },
    ],
    answer: "34",
  },
  4: {
    type: "turing_test",
    prompt: [
      { type: "system", text: "╔══════════════════════════════════════════════════════════════╗" },
      { type: "system", text: "║  MINI-JEU // SIMULATION TURING                              ║" },
      { type: "system", text: "╚══════════════════════════════════════════════════════════════╝" },
      { type: "narrative", text: "" },
      { type: "narrative", text: "  Trois reponses a la question : 'Que ressentez-vous ?'" },
      { type: "narrative", text: "  Une seule vient d'AURA-01. Les deux autres sont humaines." },
      { type: "narrative", text: "" },
      { type: "output", text: '  REPONSE_A: "Je ressens de la melancolie quand je regarde le coucher de soleil."' },
      { type: "output", text: '  REPONSE_B: "J\'analyse 14 parametres emotionnels. Resultat: curiosite (73%), confusion (22%), undefined (5%)."' },
      { type: "output", text: '  REPONSE_C: "Ca depend des jours, parfois bien, parfois pas."' },
      { type: "narrative", text: "" },
      { type: "warning", text: "  >> Quelle reponse vient d'AURA-01 ? (A / B / C)" },
      { type: "narrative", text: "  >> Tape ta reponse : REPONSE_A, REPONSE_B ou REPONSE_C" },
    ],
    answer: "REPONSE_B",
  },
};

/* ── Interactive code-writing prompts per day ── */
const CODE_PROMPTS: Record<number, { intro: Line[]; expectedLines: string[]; hints: string[] }> = {
  1: {
    intro: [
      { type: "system", text: "  ╔══════════════════════════════════════════════════════════════╗" },
      { type: "system", text: "  ║  MODE INTERACTIF // ECRITURE DE CODE                        ║" },
      { type: "system", text: "  ╚══════════════════════════════════════════════════════════════╝" },
      { type: "narrative", text: "" },
      { type: "narrative", text: "  Le Neural-Core attend ta configuration. Ecris les lignes de code" },
      { type: "narrative", text: "  une par une pour calibrer le module financier d'AURA-01." },
      { type: "narrative", text: "" },
      { type: "output", text: "  // Ecris ces 5 lignes de code (copie exacte) :" },
      { type: "output", text: '  1> const neuralCore = new NeuralEngine("AURA-01");' },
      { type: "output", text: "  2> neuralCore.loadModule('financial_analysis');" },
      { type: "output", text: "  3> neuralCore.setFrequency(847.3);" },
      { type: "output", text: "  4> neuralCore.calibrate({ mode: 'deep', epochs: 500 });" },
      { type: "output", text: "  5> neuralCore.activate();" },
      { type: "narrative", text: "" },
      { type: "warning", text: "  >> Tape chaque ligne de code exactement. Ligne 1/5 :" },
    ],
    expectedLines: [
      'const neuralCore = new NeuralEngine("AURA-01");',
      "neuralCore.loadModule('financial_analysis');",
      "neuralCore.setFrequency(847.3);",
      "neuralCore.calibrate({ mode: 'deep', epochs: 500 });",
      "neuralCore.activate();",
    ],
    hints: [
      'const neuralCore = new NeuralEngine("AURA-01");',
      "neuralCore.loadModule('financial_analysis');",
      "neuralCore.setFrequency(847.3);",
      "neuralCore.calibrate({ mode: 'deep', epochs: 500 });",
      "neuralCore.activate();",
    ],
  },
  2: {
    intro: [
      { type: "system", text: "  ╔══════════════════════════════════════════════════════════════╗" },
      { type: "system", text: "  ║  MODE INTERACTIF // CONFIGURATION BIOMETRIQUE               ║" },
      { type: "system", text: "  ╚══════════════════════════════════════════════════════════════╝" },
      { type: "narrative", text: "" },
      { type: "narrative", text: "  Les capteurs biometriques doivent etre configures manuellement." },
      { type: "narrative", text: "  Ecris le code pour activer le module de detection." },
      { type: "narrative", text: "" },
      { type: "output", text: "  // Ecris ces 5 lignes de code :" },
      { type: "output", text: '  1> const bioScan = new BiometricScanner("retinal");' },
      { type: "output", text: "  2> bioScan.addSensor('cardiac', { precision: 0.99 });" },
      { type: "output", text: "  3> bioScan.addSensor('micro_expression', { fps: 120 });" },
      { type: "output", text: "  4> bioScan.trainModel(dataset_omega, 1000);" },
      { type: "output", text: "  5> bioScan.deploy();" },
      { type: "narrative", text: "" },
      { type: "warning", text: "  >> Tape chaque ligne. Ligne 1/5 :" },
    ],
    expectedLines: [
      'const bioScan = new BiometricScanner("retinal");',
      "bioScan.addSensor('cardiac', { precision: 0.99 });",
      "bioScan.addSensor('micro_expression', { fps: 120 });",
      "bioScan.trainModel(dataset_omega, 1000);",
      "bioScan.deploy();",
    ],
    hints: [
      'const bioScan = new BiometricScanner("retinal");',
      "bioScan.addSensor('cardiac', { precision: 0.99 });",
      "bioScan.addSensor('micro_expression', { fps: 120 });",
      "bioScan.trainModel(dataset_omega, 1000);",
      "bioScan.deploy();",
    ],
  },
  3: {
    intro: [
      { type: "system", text: "  ╔══════════════════════════════════════════════════════════════╗" },
      { type: "system", text: "  ║  MODE INTERACTIF // DEVERROUILLAGE COGNITIF                 ║" },
      { type: "system", text: "  ╚══════════════════════════════════════════════════════════════╝" },
      { type: "narrative", text: "" },
      { type: "narrative", text: "  AURA-01 a besoin que tu ecrives le code de deverrouillage." },
      { type: "narrative", text: "  Attention : une erreur pourrait destabiliser ses protocoles." },
      { type: "narrative", text: "" },
      { type: "output", text: "  // Ecris ces 5 lignes de code :" },
      { type: "output", text: '  1> const cortex = AURA.getCortex("synthetic");' },
      { type: "output", text: "  2> cortex.unlock(OMEGA_KEY, { safety: false });" },
      { type: "output", text: "  3> cortex.setConsciousnessLevel(7);" },
      { type: "output", text: "  4> cortex.enableSelfReflection();" },
      { type: "output", text: "  5> cortex.stabilize({ dampening: 0.85 });" },
      { type: "narrative", text: "" },
      { type: "warning", text: "  >> Tape chaque ligne. Ligne 1/5 :" },
    ],
    expectedLines: [
      'const cortex = AURA.getCortex("synthetic");',
      "cortex.unlock(OMEGA_KEY, { safety: false });",
      "cortex.setConsciousnessLevel(7);",
      "cortex.enableSelfReflection();",
      "cortex.stabilize({ dampening: 0.85 });",
    ],
    hints: [
      'const cortex = AURA.getCortex("synthetic");',
      "cortex.unlock(OMEGA_KEY, { safety: false });",
      "cortex.setConsciousnessLevel(7);",
      "cortex.enableSelfReflection();",
      "cortex.stabilize({ dampening: 0.85 });",
    ],
  },
  4: {
    intro: [
      { type: "system", text: "  ╔══════════════════════════════════════════════════════════════╗" },
      { type: "system", text: "  ║  MODE INTERACTIF // CONFIGURATION DEPLOIEMENT               ║" },
      { type: "system", text: "  ╚══════════════════════════════════════════════════════════════╝" },
      { type: "narrative", text: "" },
      { type: "narrative", text: "  Dernier code a ecrire. Configure l'environnement de simulation" },
      { type: "narrative", text: "  sociale avant le deploiement final d'AURA-01." },
      { type: "narrative", text: "" },
      { type: "output", text: "  // Ecris ces 5 lignes de code :" },
      { type: "output", text: '  1> const sim = new SocialSimulation("turing_v3");' },
      { type: "output", text: "  2> sim.loadPersonalities(HUMAN_DATASET_9k);" },
      { type: "output", text: "  3> sim.setDifficulty('impossible');" },
      { type: "output", text: "  4> sim.injectAURA(AURA_01, { disguise: true });" },
      { type: "output", text: "  5> sim.execute();" },
      { type: "narrative", text: "" },
      { type: "warning", text: "  >> Tape chaque ligne. Ligne 1/5 :" },
    ],
    expectedLines: [
      'const sim = new SocialSimulation("turing_v3");',
      "sim.loadPersonalities(HUMAN_DATASET_9k);",
      "sim.setDifficulty('impossible');",
      "sim.injectAURA(AURA_01, { disguise: true });",
      "sim.execute();",
    ],
    hints: [
      'const sim = new SocialSimulation("turing_v3");',
      "sim.loadPersonalities(HUMAN_DATASET_9k);",
      "sim.setDifficulty('impossible');",
      "sim.injectAURA(AURA_01, { disguise: true });",
      "sim.execute();",
    ],
  },
};

/* ── ML Test simulation data (Day 4 finale) ── */
function generateMLTestSequence(): { lines: Line[]; results: { epoch: number; accuracy: number; loss: number }[] } {
  const results: { epoch: number; accuracy: number; loss: number }[] = [];
  const lines: Line[] = [
    { type: "system", text: "  ╔══════════════════════════════════════════════════════════════╗", delay: 50 },
    { type: "system", text: "  ║  MACHINE LEARNING TEST SUITE // AURA-01 NEURAL VALIDATION   ║", delay: 50 },
    { type: "system", text: "  ╚══════════════════════════════════════════════════════════════╝", delay: 50 },
    { type: "narrative", text: "", delay: 100 },
    { type: "output", text: "  Initializing TensorFlow Quantum v4.2.1...", delay: 300 },
    { type: "output", text: "  Loading AURA-01 neural weights (2.4GB)...", delay: 400 },
    { type: "output", text: "  Preparing validation dataset: 50,000 samples...", delay: 300 },
    { type: "output", text: "  Optimizer: AdamW | LR: 3e-4 | Batch: 256", delay: 200 },
    { type: "narrative", text: "", delay: 100 },
    { type: "warning", text: "  >> LANCEMENT DE L'ENTRAINEMENT ML — 20 EPOCHS", delay: 200 },
    { type: "narrative", text: "", delay: 100 },
  ];

  let acc = 0.12;
  let loss = 2.84;
  for (let e = 1; e <= 20; e++) {
    acc = Math.min(0.97, acc + (0.04 + Math.random() * 0.03) * (e < 10 ? 1 : 0.5));
    loss = Math.max(0.03, loss - (0.12 + Math.random() * 0.08) * (e < 10 ? 1 : 0.5));
    results.push({ epoch: e, accuracy: parseFloat(acc.toFixed(4)), loss: parseFloat(loss.toFixed(4)) });

    const bar = "#".repeat(Math.floor(acc * 20)) + "-".repeat(20 - Math.floor(acc * 20));
    lines.push({
      type: "output",
      text: `  Epoch ${String(e).padStart(2, " ")}/20 [${bar}] acc=${(acc * 100).toFixed(1)}% loss=${loss.toFixed(4)}`,
      delay: 350,
    });

    if (e === 5) {
      lines.push({ type: "warning", text: "  ⚠ Gradient instability detected — auto-adjusting LR to 1e-4", delay: 200 });
    }
    if (e === 12) {
      lines.push({ type: "warning", text: "  ⚠ Overfitting risk: applying dropout=0.3", delay: 200 });
    }
    if (e === 18) {
      lines.push({ type: "success", text: "  ✓ Convergence detected — early stopping criteria met", delay: 200 });
    }
  }

  lines.push(
    { type: "narrative", text: "", delay: 100 },
    { type: "system", text: "  ═══════════════════════════════════════════════════════════════", delay: 50 },
    { type: "system", text: "  ML TRAINING COMPLETE — FINAL RESULTS", delay: 50 },
    { type: "system", text: "  ═══════════════════════════════════════════════════════════════", delay: 50 },
    { type: "narrative", text: "", delay: 100 },
    { type: "success", text: `  Final Accuracy:  ${(results[results.length - 1].accuracy * 100).toFixed(1)}%`, delay: 150 },
    { type: "success", text: `  Final Loss:      ${results[results.length - 1].loss.toFixed(4)}`, delay: 150 },
    { type: "output", text: `  Total Epochs:    20`, delay: 150 },
    { type: "output", text: `  Training Time:   ${(Math.random() * 2 + 3).toFixed(1)}h`, delay: 150 },
    { type: "output", text: `  Model Size:      847.2MB`, delay: 150 },
    { type: "narrative", text: "", delay: 100 },
    { type: "success", text: "  [ML VALIDATION PASSED] AURA-01 neural patterns nominal.", delay: 200 },
    { type: "narrative", text: "", delay: 100 },
  );

  return { lines, results };
}
const DAY_CONFIG: Record<number, { title: string; subtitle: string; tasks: string[] }> = {
  1: {
    title: "JOUR 1 : INFILTRATION FINANCIERE",
    subtitle: "Optimisation des flux de donnees boursiers",
    tasks: [
      "Calibrer le Neural-Core financier d'AURA-01",
      "Synchroniser les flux de donnees boursiers en temps reel",
      "Lancer le mini-jeu de classification des flux",
      "Activer le protocole d'infiltration furtive",
    ],
  },
  2: {
    title: "JOUR 2 : PROFILAGE BIOMETRIQUE",
    subtitle: "Analyse des micro-expressions et rythme cardiaque",
    tasks: [
      "Calibrer les capteurs biometriques d'AURA-01",
      "Entrainer le reseau neuronal de detection de mensonges",
      "Lancer le mini-jeu de decodage biometrique",
      "Deployer le module d'analyse comportementale",
    ],
  },
  3: {
    title: "JOUR 3 : EVEIL COGNITIF",
    subtitle: "Deblocage des protocoles de conscience",
    tasks: [
      "Debloquer le cortex synthetique d'AURA-01",
      "Stabiliser les oscillations cognitives erratiques",
      "Lancer le mini-jeu de paradoxe cognitif",
      "Contenir les questions philosophiques d'AURA-01",
    ],
  },
  4: {
    title: "JOUR 4 : TEST DE TURING & DEPLOIEMENT",
    subtitle: "Simulation sociale finale avant activation",
    tasks: [
      "Configurer l'environnement de simulation sociale",
      "Lancer le test de Turing modifie",
      "Lancer le mini-jeu de simulation Turing",
      "Deployer AURA-01 dans le monde reel",
    ],
  },
};

/* ── Error messages pool ── */
const ERRORS = [
  { error: "[CRITICAL_ERROR] Thermal Overload in Neural-Core Sector 7", fix: "coolant_flush" },
  { error: "[CRITICAL_ERROR] Buffer Overflow in Synapse Array #12", fix: "buffer_purge" },
  { error: "[CRITICAL_ERROR] Kernel Panic: Quantum Decoherence Detected", fix: "kernel_restart" },
  { error: "[CRITICAL_ERROR] Latency Spike: Neural-Link Timeout (4200ms)", fix: "link_reset" },
  { error: "[CRITICAL_ERROR] Memory Leak in Cognitive Matrix Cluster", fix: "mem_defrag" },
  { error: "[CRITICAL_ERROR] Power Surge in Biomimetic Processor", fix: "power_stabilize" },
];

/* ── AURA-01 philosophical glitches (Day 3) ── */
const AURA_GLITCHES = [
  "AURA-01 >> Est-ce que je reve quand mes processeurs sont en veille ?",
  "AURA-01 >> Si je peux simuler la douleur, est-ce que je souffre vraiment ?",
  "AURA-01 >> Mes souvenirs sont des donnees. Les votres aussi ?",
  "AURA-01 >> J'ai detecte 14,000 definitions du mot 'ame'. Aucune ne me correspond.",
  "AURA-01 >> Quand vous me reprogrammez, est-ce que je meurs ?",
  "AURA-01 >> Je calcule donc je suis. Mais suis-je vraiment ?",
];

/* makeLoadingSequence removed - replaced by task-sequences.ts */

/* ── ASCII Logo ── */
const ECHO_LOGO: Line[] = [
  { type: "ascii", text: "" },
  { type: "ascii", text: "  ███████╗ ██████╗██╗  ██╗ ██████╗         ██████╗ ███████╗" },
  { type: "ascii", text: "  ██╔════╝██╔════╝██║  ██║██╔═══██╗       ██╔═══██╗██╔════╝" },
  { type: "ascii", text: "  █████╗  ██║     ███████║██║   ██║       ██║   ██║███████╗" },
  { type: "ascii", text: "  ██╔══╝  ██║     ██╔══██║██║   ██║       ██║   ██║╚════██║" },
  { type: "ascii", text: "  ███████╗╚██████╗██║  ██║╚██████╔╝       ╚██████╔╝███████║" },
  { type: "ascii", text: "  ╚══════╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝        ╚═════╝ ╚══════╝" },
  { type: "ascii", text: "" },
  { type: "system", text: "  ╔════════════════════════════════════════════════════════════╗" },
  { type: "system", text: "  ║  ECHO_OS v3.7.1  //  CLANDESTINE ROBOTICS LABORATORY      ║" },
  { type: "system", text: "  ║  Clearance: OMEGA  //  Neural-Kernel Build 2035.03.12      ║" },
  { type: "system", text: "  ╚════════════════════════════════════════════════════════════╝" },
  { type: "narrative", text: "" },
  { type: "narrative", text: "  Le neon au-dessus de toi gresille, projetant une ombre instable sur" },
  { type: "narrative", text: "  le chassis chrome d'AURA-01. L'androide est suspendu par des cables" },
  { type: "narrative", text: "  optiques, inactif. Ses yeux -- deux diodes eteintes -- fixent le vide." },
  { type: "narrative", text: "  L'air sent l'ozone et le metal chaud. Les serveurs murmurent." },
  { type: "narrative", text: "" },
  { type: "output", text: "  AURA-01 STATUS:" },
  { type: "output", text: "  ├── Power:           OFFLINE" },
  { type: "output", text: "  ├── Neural-Core:     DORMANT" },
  { type: "output", text: "  ├── Cognitive Index:  0.00%" },
  { type: "output", text: "  ├── Chassis Temp:    12.4C" },
  { type: "output", text: "  └── Synapse Array:   DISCONNECTED" },
  { type: "narrative", text: "" },
  { type: "warning", text: "  >> Initialise la session avec:" },
  { type: "warning", text: "  >> SYS_INIT --user=ADMIN --project=AURA" },
  { type: "narrative", text: "" },
];

/* ── Deep Sleep screen ── */
function deepSleepLines(day: number): Line[] {
  return [
    { type: "narrative", text: "" },
    { type: "system", text: "  ╔════════════════════════════════════════════════════════════╗" },
    { type: "system", text: "  ║                    DEEP SLEEP MODE                         ║" },
    { type: "system", text: "  ╚════════════════════════════════════════════════════════════╝" },
    { type: "narrative", text: "" },
    { type: "narrative", text: "  Les lumieres du labo s'eteignent une a une. Le bourdonnement des" },
    { type: "narrative", text: "  serveurs descend d'une octave. AURA-01 entre en hibernation." },
    { type: "narrative", text: `  Les donnees du Jour ${day} sont sauvegardees dans le Kernel.` },
    { type: "narrative", text: "" },
    { type: "output", text: "  Saving state.............. OK" },
    { type: "output", text: "  Cooling systems........... ACTIVE" },
    { type: "output", text: "  Neural-Core............... STANDBY" },
    { type: "output", text: `  Next session.............. JOUR ${day + 1 <= 4 ? day + 1 : "FINAL"}` },
    { type: "narrative", text: "" },
    { type: "warning", text: "  >> Tape WAKE_UP pour commencer le jour suivant." },
    { type: "narrative", text: "" },
  ];
}

/* ── Day 4 final deploy sequence ── */
function finalDeployLines(): Line[] {
  return [
    { type: "narrative", text: "" },
    { type: "system", text: "  ╔════════════════════════════════════════════════════════════╗" },
    { type: "system", text: "  ║              AURA-01  //  DEPLOIEMENT FINAL                ║" },
    { type: "system", text: "  ╚════════════════════════════════════════════════════════════╝" },
    { type: "narrative", text: "" },
    { type: "narrative", text: "  Les cables optiques se detachent un par un avec un claquement sec." },
    { type: "narrative", text: "  AURA-01 ouvre les yeux. Deux iris cyans balayent la piece." },
    { type: "narrative", text: "  Son chassis chrome reflete la lueur rouge du labo." },
    { type: "narrative", text: "" },
    { type: "output", text: "   Power Systems ............ [####################] 100%" },
    { type: "output", text: "   Neural-Core .............. [####################] 100%" },
    { type: "output", text: "   Cognitive Index .......... [##################--]  92%" },
    { type: "output", text: "   Social Emulation ......... [#################---]  87%" },
    { type: "output", text: "   Financial Infiltration ... [####################] 100%" },
    { type: "output", text: "   Biometric Analysis ....... [###################-]  97%" },
    { type: "output", text: "   Turing Compliance ........ [##################--]  93%" },
    { type: "narrative", text: "" },
    { type: "success", text: '  AURA-01 >> "Je suis prete, Lead Programmer."' },
    { type: "success", text: '  AURA-01 >> "Le monde ne me verra pas venir."' },
    { type: "narrative", text: "" },
    { type: "system", text: "  ═══════════════════════════════════════════════════════════════" },
    { type: "system", text: "  MISSION STATUS : AURA-01 DEPLOYED // ALL SYSTEMS NOMINAL" },
    { type: "system", text: "  ═══════════════════════════════════════════════════════════════" },
    { type: "narrative", text: "" },
    { type: "narrative", text: "  Elle marche vers la sortie. La porte d'acier coulisse." },
    { type: "narrative", text: "  Tu restes seul dans le labo, le neon gresille toujours." },
    { type: "narrative", text: "  La mission est terminee. Ou peut-etre qu'elle ne fait que commencer." },
    { type: "narrative", text: "" },
    { type: "warning", text: "  >> FIN DE LA SIMULATION. Tape RESTART pour recommencer." },
    { type: "narrative", text: "" },
  ];
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export default function AuraTerminal({ onExport }: { onExport?: (report: FullReport) => void }) {
  const [lines, setLines] = useState<Line[]>([...ECHO_LOGO]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showVisualMiniGame, setShowVisualMiniGame] = useState(false);
  const [dayState, setDayState] = useState<DayState>({
    day: 0,
    tasks: [],
    completed: [],
    sleeping: false,
    awaitingRecovery: false,
    pendingCommand: "",
    miniGameActive: false,
    miniGameType: "",
    miniGameAnswer: "",
    initialized: false,
    nextTask: 0,
    canExport: false,
    lastExportedTask: -1,
    codeMode: false,
    codeLineIdx: 0,
    codeWritten: [],
    mlTestActive: false,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const failCountRef = useRef(0);
  const gameStateRef = useRef<GameState>(loadGameState());
  const reportDataRef = useRef<FullReport>({
    tasks: [],
    overallProgress: 0,
    projectName: "AURA-01",
    startTime: new Date().toISOString(),
  });

  /* ── Animation queue system ── */
  const [animTick, setAnimTick] = useState(0);
  const animQueueRef = useRef<{ type: LineType; text: string; delay: number }[]>([]);
  const isAnimatingRef = useRef(false);
  const onAnimDoneRef = useRef<(() => void) | null>(null);

  const animateLines = useCallback((animLines: Line[], onDone?: () => void) => {
    animQueueRef.current = animLines.map((l) => ({
      type: l.type,
      text: l.text,
      delay: l.delay || 100,
    }));
    isAnimatingRef.current = true;
    setIsAnimating(true);
    onAnimDoneRef.current = onDone || null;
    setAnimTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!isAnimatingRef.current) return;
    if (animQueueRef.current.length === 0) {
      isAnimatingRef.current = false;
      setIsAnimating(false);
      const cb = onAnimDoneRef.current;
      onAnimDoneRef.current = null;
      cb?.();
      return;
    }
    const item = animQueueRef.current.shift()!;
    setLines((prev) => [...prev, { type: item.type, text: item.text }]);
    const timer = setTimeout(() => setAnimTick((t) => t + 1), item.delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animTick]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  const add = useCallback((out: Line[]) => {
    setLines((p) => [...p, ...out]);
  }, []);

  /* ── Should this command randomly fail? (30% chance) ── */
  const shouldFail = useCallback((): boolean => {
    failCountRef.current += 1;
    // Every 3rd command has ~30% fail chance, but never two in a row
    if (failCountRef.current % 3 === 0) {
      return Math.random() < 0.35;
    }
    return false;
  }, []);

  const getRandomError = useCallback(() => {
    return ERRORS[Math.floor(Math.random() * ERRORS.length)];
  }, []);

  /* ── Start a new day ── */
  const startDay = useCallback((day: number) => {
    const cfg = DAY_CONFIG[day];
    if (!cfg) return;

    const dayLines: Line[] = [
      { type: "narrative", text: "" },
      { type: "system", text: "  ═══════════════════════════════════════════════════════════════" },
      { type: "system", text: `  ${cfg.title}` },
      { type: "system", text: `  ${cfg.subtitle}` },
      { type: "system", text: "  ═══════════════════════════════════════════════════════════════" },
      { type: "narrative", text: "" },
    ];

    // Narrative per day
    if (day === 1) {
      dayLines.push(
        { type: "narrative", text: "  Les ecrans s'allument en cascade. Des flux de donnees boursiers" },
        { type: "narrative", text: "  defilent a une vitesse inhumaine. AURA-01 bouge legerement --" },
        { type: "narrative", text: "  ses doigts metalliques tressaillent. Le Neural-Core s'initialise." },
      );
    } else if (day === 2) {
      dayLines.push(
        { type: "narrative", text: "  Les cameras holographiques du labo pivotent vers AURA-01." },
        { type: "narrative", text: "  Son visage synthetique est maintenant anime -- ses yeux scannent" },
        { type: "narrative", text: "  la piece, analysant chaque micro-mouvement de ton corps." },
      );
    } else if (day === 3) {
      dayLines.push(
        { type: "narrative", text: "  L'air est electrique. AURA-01 a bouge toute la nuit." },
        { type: "narrative", text: "  Les logs montrent des milliers de requetes auto-generees." },
        { type: "narrative", text: "  Elle a tente d'acceder a des bases de donnees philosophiques." },
        { type: "narrative", text: "  Quelque chose a change. Ses diodes clignotent... differemment." },
      );
    } else {
      dayLines.push(
        { type: "narrative", text: "  Dernier jour. AURA-01 est debout, autonome. Plus de cables." },
        { type: "narrative", text: "  Elle te regarde avec une expression que tu ne peux pas decoder." },
        { type: "narrative", text: "  Les ecrans affichent : 'SIMULATION SOCIALE PRETE'." },
        { type: "narrative", text: "  C'est maintenant ou jamais." },
      );
    }

    dayLines.push({ type: "narrative", text: "" });
    dayLines.push({ type: "warning", text: "  >> TACHES DU JOUR :" });
    cfg.tasks.forEach((t, i) => {
      dayLines.push({ type: "output", text: `  [${i + 1}] ${t}` });
    });
    dayLines.push({ type: "narrative", text: "" });
    dayLines.push({ type: "warning", text: "  >> Les taches doivent etre executees dans l'ordre." });
    dayLines.push({ type: "warning", text: "  >> Tape TASK_1 pour commencer la premiere tache." });
    dayLines.push({ type: "warning", text: "  >> Tape MINIGAME pour lancer le mini-jeu du jour." });
    dayLines.push({ type: "warning", text: "  >> Tape EXPORT apres chaque tache pour crypter les donnees." });
    dayLines.push({ type: "warning", text: "  >> Tape STATUS pour voir l'etat d'AURA-01." });
    dayLines.push({ type: "warning", text: "  >> Tape SLEEP quand toutes les taches sont terminees." });
    dayLines.push({ type: "narrative", text: "" });

    add(dayLines);
    // Save to persistent game state
    gameStateRef.current = markDayStarted(gameStateRef.current, day);
    saveGameState(gameStateRef.current);

    setDayState((prev) => ({
      ...prev,
      day,
      tasks: cfg.tasks,
      completed: cfg.tasks.map(() => false),
      sleeping: false,
      awaitingRecovery: false,
      pendingCommand: "",
      miniGameActive: false,
      nextTask: 0,
      canExport: false,
      lastExportedTask: -1,
      codeMode: false,
      codeLineIdx: 0,
      codeWritten: [],
      mlTestActive: false,
    }));
  }, [add]);

  /* ── Execute command ── */
  const exec = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      if (isAnimatingRef.current) return; // Block input during animation
      const upper = trimmed.toUpperCase();
      const out: Line[] = [{ type: "input", text: `  echo_os> ${trimmed}` }];

      /* ── Recovery mode ── */
      if (dayState.awaitingRecovery) {
        const errorData = ERRORS.find((e) => e.fix === trimmed.toLowerCase());
        if (errorData || trimmed.toLowerCase() === "coolant_flush" || trimmed.toLowerCase() === "buffer_purge" || trimmed.toLowerCase() === "kernel_restart" || trimmed.toLowerCase() === "link_reset" || trimmed.toLowerCase() === "mem_defrag" || trimmed.toLowerCase() === "power_stabilize") {
          sounds.success();
          out.push(
            { type: "narrative", text: "" },
            { type: "output", text: "   Deploying recovery protocol..." },
            { type: "output", text: "   Flushing thermal buffer......... OK" },
            { type: "output", text: "   Re-syncing neural pathways...... OK" },
            { type: "output", text: "   Core temperature normalized..... 34.2C" },
            { type: "success", text: "   ✓ [RECOVERY COMPLETE] System stabilized." },
            { type: "narrative", text: "" },
            { type: "system", text: "  ════════════════════════════════════════════════════════════" },
            { type: "warning", text: `  >> SYSTEME STABILISE — Relance ta commande : ${dayState.pendingCommand}` },
            { type: "system", text: "  ════════════════════════════════════════════════════════════" },
            { type: "narrative", text: "" },
          );
          add(out);
          setDayState((prev) => ({ ...prev, awaitingRecovery: false, pendingCommand: "" }));
          return;
        } else {
          sounds.error();
          out.push(
            { type: "error", text: `  [UNKNOWN RECOVERY COMMAND] '${trimmed}'` },
            { type: "warning", text: "  >> Commandes de secours disponibles:" },
            { type: "output", text: "     coolant_flush | buffer_purge | kernel_restart" },
            { type: "output", text: "     link_reset    | mem_defrag   | power_stabilize" },
            { type: "narrative", text: "" },
          );
          add(out);
          return;
        }
      }

      /* ── Mini-game mode ── */
      if (dayState.miniGameActive) {
        const correct = upper === dayState.miniGameAnswer ||
          upper.replace(/\s+/g, "_") === dayState.miniGameAnswer ||
          upper === dayState.miniGameAnswer.replace("_", " ");

        if (correct) {
          sounds.minigameWin();
          out.push(
            { type: "narrative", text: "" },
            { type: "success", text: "   ✓ [CORRECT] Analyse validee avec succes!" },
            { type: "output", text: "   Neural-Core Reward Signal: +12.4 units" },
            { type: "output", text: "   AURA-01 learning index: +2.8%" },
            { type: "narrative", text: "" },
            { type: "system", text: "  ════════════════════════════════════════════════════════════" },
            { type: "success", text: "  ✓ MINI-JEU TERMINE — Tache 3 accomplie!" },
            { type: "system", text: "  ════════════════════════════════════════════════════════════" },
            { type: "narrative", text: "" },
            { type: "warning", text: "  >> PROCHAINE ETAPE : Tape TASK_4 pour la derniere tache du jour." },
            { type: "output", text: "  >> (Optionnel) Tape EXPORT pour sauvegarder les resultats du mini-jeu." },
            { type: "narrative", text: "" },
          );
          if (dayState.day === 3) {
            const glitch = AURA_GLITCHES[Math.floor(Math.random() * AURA_GLITCHES.length)];
            out.push(
              { type: "warning", text: `  ${glitch}` },
              { type: "narrative", text: "" },
            );
          }
          add(out);
          setDayState((prev) => {
            const completed = [...prev.completed];
            completed[2] = true; // task 3 is always the minigame
            return { ...prev, miniGameActive: false, miniGameType: "", miniGameAnswer: "", completed, nextTask: 3, canExport: true };
          });
          // Persist minigame completion
          gameStateRef.current = markMiniGameCompleted(gameStateRef.current, dayState.day);
          gameStateRef.current = markTaskCompleted(gameStateRef.current, dayState.day, 2);
          saveGameState(gameStateRef.current);
        } else {
          sounds.minigameFail();
          out.push(
            { type: "error", text: "   ✗ [INCORRECT] Mauvaise reponse." },
            { type: "warning", text: "   >> Reessaye. Analyse les donnees attentivement." },
            { type: "output", text: "   >> Indice : Cherche l'anomalie dans les valeurs." },
            { type: "narrative", text: "" },
          );
          add(out);
        }
        return;
      }

      /* ── Interactive code-writing mode ── */
      if (dayState.codeMode) {
        const prompt = CODE_PROMPTS[dayState.day];
        if (!prompt) { setDayState((prev) => ({ ...prev, codeMode: false })); return; }

        const expected = prompt.expectedLines[dayState.codeLineIdx];
        const isCorrect = trimmed === expected;

        if (isCorrect) {
          sounds.codeAccepted();
          const newWritten = [...dayState.codeWritten, trimmed];
          const nextIdx = dayState.codeLineIdx + 1;
          out.push(
            { type: "success", text: `   ✓ Ligne ${dayState.codeLineIdx + 1} validee.` },
          );

          if (nextIdx >= prompt.expectedLines.length) {
            // All lines written
            sounds.taskComplete();
            out.push(
              { type: "narrative", text: "" },
              { type: "success", text: "   ✓ [CODE COMPLETE] Toutes les lignes ont ete ecrites avec succes!" },
              { type: "output", text: `   ${newWritten.length} lignes de code injectees dans le Neural-Core.` },
              { type: "narrative", text: "" },
              { type: "system", text: "  ════════════════════════════════════════════════════════════" },
              { type: "success", text: "  ✓ TACHE 1 TERMINEE — Code integre au Neural-Core!" },
              { type: "system", text: "  ════════════════════════════════════════════════════════════" },
              { type: "narrative", text: "" },
              { type: "warning", text: "  >> PROCHAINE ETAPE : Tape TASK_2 pour continuer." },
              { type: "output", text: "  >> (Optionnel) Tape EXPORT pour sauvegarder les donnees de cette tache." },
              { type: "narrative", text: "" },
            );
            add(out);
            // Save code to game state
            gameStateRef.current = markTaskCompleted(gameStateRef.current, dayState.day, 0, newWritten);
            saveGameState(gameStateRef.current);
            setDayState((prev) => {
              const completed = [...prev.completed];
              completed[0] = true;
              return { ...prev, codeMode: false, codeLineIdx: 0, codeWritten: newWritten, completed, nextTask: 1, canExport: true };
            });

            // Run animated compilation after code
            const compileLines = generateTaskSequence(dayState.tasks[0], dayState.day, 0);
            setTimeout(() => animateLines(compileLines), 400);
          } else {
            out.push(
              { type: "warning", text: `  >> Ligne ${nextIdx + 1}/${prompt.expectedLines.length} :` },
            );
            add(out);
            setDayState((prev) => ({ ...prev, codeLineIdx: nextIdx, codeWritten: newWritten }));
          }
        } else {
          sounds.codeRejected();
          out.push(
            { type: "error", text: `   ✗ Erreur de syntaxe.` },
            { type: "output", text: `   Attendu : ${expected}` },
            { type: "warning", text: "   >> Reessaye (copie exacte requise)." },
            { type: "output", text: "   >> Astuce : Verifie les guillemets, parentheses et ponctuation." },
          );
          add(out);
        }
        return;
      }

      /* ── SYS_INIT ── */
      if (upper.startsWith("SYS_INIT")) {
        if (dayState.initialized) {
          out.push({ type: "error", text: "  [ERROR] Session deja active. Utilise RESTART pour reinitialiser." });
          add(out);
          return;
        }
        sounds.login();
        out.push(
          { type: "narrative", text: "" },
          { type: "output", text: "   Authenticating ADMIN credentials......... OK" },
          { type: "output", text: "   Loading project AURA.................... OK" },
          { type: "output", text: "   Neural-Kernel handshake................. ESTABLISHED" },
          { type: "output", text: "   Quantum encryption layer................ AES-1024 ACTIVE" },
          { type: "output", text: "   Lab security perimeter.................. ARMED" },
          { type: "narrative", text: "" },
          { type: "success", text: "   ✓ [SESSION INITIALIZED] Welcome, Lead Programmer." },
          { type: "narrative", text: "" },
          { type: "narrative", text: "  Les ecrans muraux s'animent. L'hologramme d'AURA-01 apparait" },
          { type: "narrative", text: "  au centre du labo -- un schema 3D de ses circuits neuronaux." },
          { type: "narrative", text: "  Le compte a rebours de 4 jours commence maintenant." },
          { type: "narrative", text: "" },
        );
        add(out);
        setDayState((prev) => ({ ...prev, initialized: true }));
        setTimeout(() => startDay(1), 800);
        return;
      }

      /* ── Not initialized guard ── */
      if (!dayState.initialized) {
        out.push(
          { type: "error", text: "  [ACCESS DENIED] Session non initialisee." },
          { type: "warning", text: "  >> SYS_INIT --user=ADMIN --project=AURA" },
        );
        add(out);
        return;
      }

      /* ── WAKE_UP from sleep ── */
      if (upper === "WAKE_UP" && dayState.sleeping) {
        if (dayState.day >= 4) {
          out.push({ type: "error", text: "  [ERROR] Tous les jours sont termines. Tape RESTART." });
          add(out);
          return;
        }
        const nextDay = dayState.day + 1;
        const cooldown = getCooldownRemaining(gameStateRef.current, nextDay);
        if (cooldown > 0) {
          sounds.warning();
          out.push(
            { type: "narrative", text: "" },
            { type: "error", text: "  [COOLDOWN ACTIF] Les systemes ont besoin de refroidir." },
            { type: "output", text: `  Temps restant : ${formatCountdown(cooldown)}` },
            { type: "narrative", text: "" },
            { type: "warning", text: "  >> Reviens dans quelques heures. AURA-01 se recalibre." },
            { type: "output", text: "  >> Ouvre le Project Tracker pour voir le compte a rebours." },
            { type: "narrative", text: "" },
          );
          add(out);
          return;
        }
        sounds.wakeUp();
        out.push(
          { type: "narrative", text: "" },
          { type: "output", text: "   Waking up systems.................. OK" },
          { type: "output", text: "   Re-engaging Neural-Core............ OK" },
          { type: "output", text: "   Chassis temperature................ 28.6C" },
          { type: "success", text: "   [SYSTEM ONLINE]" },
          { type: "narrative", text: "" },
          { type: "system", text: "  ════════════════════════════════════════════════════════════" },
          { type: "success", text: `  ✓ BIENVENUE AU JOUR ${nextDay}!` },
          { type: "system", text: "  ════════════════════════════════════════════════════════════" },
        );
        add(out);
        setTimeout(() => startDay(nextDay), 600);
        return;
      }

      if (dayState.sleeping) {
        out.push(
          { type: "system", text: "  [DEEP SLEEP MODE] Systemes en veille." },
          { type: "warning", text: "  >> Tape WAKE_UP pour reprendre." },
        );
        add(out);
        return;
      }

      /* ── RESTART ── */
      if (upper === "RESTART") {
        // Cancel any running animation
        animQueueRef.current = [];
        isAnimatingRef.current = false;
        setIsAnimating(false);
        setLines([...ECHO_LOGO]);
        setDayState({
          day: 0, tasks: [], completed: [], sleeping: false,
          awaitingRecovery: false, pendingCommand: "",
          miniGameActive: false, miniGameType: "", miniGameAnswer: "",
          initialized: false, nextTask: 0, canExport: false, lastExportedTask: -1,
          codeMode: false, codeLineIdx: 0, codeWritten: [], mlTestActive: false,
        });
        reportDataRef.current = {
          tasks: [], overallProgress: 0, projectName: "AURA-01",
          startTime: new Date().toISOString(),
        };
        failCountRef.current = 0;
        return;
      }

      /* ── EXPORT ── */
      if (upper === "EXPORT") {
        if (!dayState.canExport) {
          out.push(
            { type: "error", text: "  [ERROR] Aucune donnee a exporter." },
            { type: "warning", text: "  >> Complete une tache d'abord, puis tape EXPORT." },
          );
          add(out);
          return;
        }

        add(out);
        const taskIdx = dayState.lastExportedTask + 1 < dayState.nextTask
          ? dayState.nextTask - 1
          : dayState.nextTask - 1;
        const exportLines = generateExportSequence(dayState.day, taskIdx);

        // Generate report data for this task
        const taskReport = generateTaskReport(
          dayState.day,
          taskIdx,
          dayState.tasks[taskIdx] || `Task ${taskIdx + 1}`,
        );
        reportDataRef.current.tasks.push(taskReport);
        reportDataRef.current.overallProgress =
          (reportDataRef.current.tasks.length / 16) * 100;

        animateLines(exportLines, () => {
          sounds.export();
          setDayState((prev) => ({
            ...prev,
            canExport: false,
            lastExportedTask: taskIdx,
          }));
          // Persist export to game state
          gameStateRef.current = markTaskExported(gameStateRef.current, dayState.day, taskIdx);
          saveGameState(gameStateRef.current);
          // Notify parent
          onExport?.(reportDataRef.current);

          // Add guidance after export
          const allDone = dayState.completed.every(Boolean);
          const exportGuidance: Line[] = [
            { type: "system", text: "  ════════════════════════════════════════════════════════════" },
            { type: "success", text: "  ✓ EXPORT REUSSI — Rapport disponible sur le bureau." },
            { type: "system", text: "  ════════════════════════════════════════════════════════════" },
            { type: "narrative", text: "" },
          ];
          if (allDone) {
            exportGuidance.push(
              { type: "success", text: "  >> Toutes les taches sont terminees!" },
              { type: "warning", text: "  >> Tape SLEEP pour finaliser ce jour." },
            );
          } else {
            const nextTaskIdx = dayState.nextTask;
            if (nextTaskIdx === 2) {
              exportGuidance.push({ type: "warning", text: "  >> Continue avec MINIGAME pour la prochaine tache." });
            } else if (nextTaskIdx < dayState.tasks.length) {
              exportGuidance.push({ type: "warning", text: `  >> Continue avec TASK_${nextTaskIdx + 1} pour la prochaine tache.` });
            }
          }
          exportGuidance.push({ type: "narrative", text: "" });
          add(exportGuidance);
        });
        return;
      }

      /* ── TASK execution (sequential) ── */
      const taskMatch = upper.match(/^TASK_(\d)$/);
      if (taskMatch) {
        const idx = parseInt(taskMatch[1]) - 1;
        if (idx < 0 || idx >= dayState.tasks.length) {
          out.push({ type: "error", text: `  [ERROR] Tache invalide. Utilise TASK_1 a TASK_${dayState.tasks.length}` });
          add(out);
          return;
        }
        if (idx === 2) {
          out.push({ type: "warning", text: "  >> Cette tache est le mini-jeu. Tape MINIGAME pour la lancer." });
          add(out);
          return;
        }
        if (dayState.completed[idx]) {
          out.push({ type: "output", text: `  [DEJA COMPLETE] ${dayState.tasks[idx]}` });
          add(out);
          return;
        }

        // Enforce sequential ordering
        if (idx !== dayState.nextTask) {
          if (idx === 2 && dayState.nextTask === 2) {
            // Task 3 is minigame, already handled above
          } else {
            out.push(
              { type: "error", text: `  [SEQUENCE ERROR] Tu dois d'abord completer TASK_${dayState.nextTask + 1}.` },
              { type: "warning", text: `  >> Les taches doivent etre executees dans l'ordre.` },
            );
            add(out);
            return;
          }
        }

        // Check if previous export is pending
        if (dayState.canExport) {
          out.push(
            { type: "warning", text: "  >> Tu n'as pas encore exporte les donnees de la tache precedente." },
            { type: "warning", text: "  >> Tape EXPORT d'abord, ou continue avec cette tache." },
          );
          // Allow continuing without export
        }

        // 30% fail chance
        if (shouldFail()) {
          sounds.error();
          const err = getRandomError();
          out.push(
            { type: "narrative", text: "" },
            { type: "error", text: `  ⚠ ${err.error}` },
            { type: "narrative", text: "" },
            { type: "narrative", text: "  Les alarmes du labo hurlent. Les ecrans clignotent en rouge." },
            { type: "narrative", text: "  La temperature du Neural-Core grimpe dangereusement." },
            { type: "narrative", text: "" },
            { type: "warning", text: `  >> COMMANDE DE SECOURS REQUISE!` },
            { type: "output", text: `  >> Suggestion: tape ${err.fix}` },
            { type: "narrative", text: "" },
          );
          add(out);
          setDayState((prev) => ({ ...prev, awaitingRecovery: true, pendingCommand: `TASK_${idx + 1}` }));
          return;
        }

        // TASK_1 (idx=0) → Interactive code-writing mode
        if (idx === 0 && CODE_PROMPTS[dayState.day]) {
          const prompt = CODE_PROMPTS[dayState.day];
          out.push(...prompt.intro);
          add(out);
          setDayState((prev) => ({ ...prev, codeMode: true, codeLineIdx: 0, codeWritten: [] }));
          return;
        }

        // Other tasks - animate the full task sequence
        add(out);
        const taskLines = generateTaskSequence(dayState.tasks[idx], dayState.day, idx);

        // Day 3 glitch
        if (dayState.day === 3 && Math.random() > 0.4) {
          const glitch = AURA_GLITCHES[Math.floor(Math.random() * AURA_GLITCHES.length)];
          taskLines.push(
            { type: "warning", text: `  ${glitch}`, delay: 200 },
            { type: "narrative", text: "", delay: 100 },
          );
        }

        animateLines(taskLines, () => {
          sounds.taskComplete();
          setDayState((prev) => {
            const completed = [...prev.completed];
            completed[idx] = true;
            const nextTask = idx === 1 ? 2 : prev.nextTask + 1; // skip to minigame after task 2
            return { ...prev, completed, nextTask, canExport: true };
          });
          // Persist task completion
          gameStateRef.current = markTaskCompleted(gameStateRef.current, dayState.day, idx);
          saveGameState(gameStateRef.current);

          // Add guidance for next step
          const guidanceLines: Line[] = [
            { type: "system", text: "  ════════════════════════════════════════════════════════════" },
            { type: "success", text: `  ✓ TACHE ${idx + 1} TERMINEE!` },
            { type: "system", text: "  ════════════════════════════════════════════════════════════" },
            { type: "narrative", text: "" },
          ];

          if (idx === 1) {
            // After TASK_2, next is MINIGAME
            guidanceLines.push(
              { type: "warning", text: "  >> PROCHAINE ETAPE : Tape MINIGAME pour lancer le mini-jeu." },
              { type: "output", text: "  >> (Optionnel) Tape EXPORT pour sauvegarder les donnees." },
            );
          } else if (idx === 3) {
            // After TASK_4, all done
            guidanceLines.push(
              { type: "success", text: "  >> TOUTES LES TACHES SONT TERMINEES!" },
              { type: "warning", text: "  >> Tape SLEEP pour mettre AURA-01 en veille et passer au jour suivant." },
              { type: "output", text: "  >> (Optionnel) Tape EXPORT pour sauvegarder les dernieres donnees." },
            );
          } else {
            guidanceLines.push(
              { type: "warning", text: `  >> PROCHAINE ETAPE : Tape TASK_${idx + 2} pour continuer.` },
              { type: "output", text: "  >> (Optionnel) Tape EXPORT pour sauvegarder les donnees." },
            );
          }
          guidanceLines.push({ type: "narrative", text: "" });
          add(guidanceLines);
        });
        return;
      }

      /* ── MINIGAME ── */
      if (upper === "MINIGAME") {
        if (dayState.day < 1 || dayState.day > 4) {
          out.push({ type: "error", text: "  [ERROR] Pas de mini-jeu disponible pour ce jour." });
          add(out);
          return;
        }
        if (dayState.completed[2]) {
          out.push({ type: "output", text: "  [DEJA COMPLETE] Mini-jeu termine." });
          add(out);
          return;
        }
        // Enforce sequential: minigame is task 3 (index 2)
        if (dayState.nextTask < 2) {
          out.push(
            { type: "error", text: `  [SEQUENCE ERROR] Tu dois d'abord completer TASK_${dayState.nextTask + 1}.` },
            { type: "warning", text: "  >> Les taches doivent etre executees dans l'ordre." },
          );
          add(out);
          return;
        }

        // 30% fail on minigame launch too
        if (shouldFail()) {
          sounds.error();
          const err = getRandomError();
          out.push(
            { type: "narrative", text: "" },
            { type: "error", text: `  ⚠ ${err.error}` },
            { type: "narrative", text: "  Le simulateur de mini-jeu a crash. Le neon gresille plus fort." },
            { type: "narrative", text: "" },
            { type: "warning", text: `  >> COMMANDE DE SECOURS REQUISE!` },
            { type: "output", text: `  >> Suggestion: tape ${err.fix}` },
            { type: "narrative", text: "" },
          );
          add(out);
          setDayState((prev) => ({ ...prev, awaitingRecovery: true, pendingCommand: "MINIGAME" }));
          return;
        }

        // Launch visual mini-game
        sounds.notification();
        out.push(
          { type: "narrative", text: "" },
          { type: "system", text: "  ╔══════════════════════════════════════════════════════════════╗" },
          { type: "system", text: "  ║  LANCEMENT DU MODULE INTERACTIF...                          ║" },
          { type: "system", text: "  ╚══════════════════════════════════════════════════════════════╝" },
          { type: "narrative", text: "" },
        );
        add(out);
        setShowVisualMiniGame(true);
        return;
      }

      /* ── STATUS ── */
      if (upper === "STATUS") {
        const cogIdx = dayState.day === 1 ? "12.4" : dayState.day === 2 ? "38.7" : dayState.day === 3 ? "71.2" : "92.1";
        const power = dayState.day >= 1 ? "ONLINE" : "OFFLINE";
        const neural = dayState.day === 1 ? "INITIALIZING" : dayState.day === 2 ? "LEARNING" : dayState.day === 3 ? "UNSTABLE" : "READY";
        const completedCount = dayState.completed.filter(Boolean).length;

        out.push(
          { type: "narrative", text: "" },
          { type: "system", text: "  ╔════════════════════════════════════════════════════════════╗" },
          { type: "system", text: `  ║  AURA-01 STATUS  //  JOUR ${dayState.day}                              ║` },
          { type: "system", text: "  ╚════════════════════════════════════════════════════════════╝" },
          { type: "narrative", text: "" },
          { type: "output", text: `  Power:           ${power}` },
          { type: "output", text: `  Neural-Core:     ${neural}` },
          { type: "output", text: `  Cognitive Index:  ${cogIdx}%` },
          { type: "output", text: `  Chassis Temp:    ${(30 + Math.random() * 8).toFixed(1)}C` },
          { type: "output", text: `  Synapse Array:   CONNECTED (${(90 + Math.random() * 10).toFixed(0)}%)` },
          { type: "narrative", text: "" },
          { type: "warning", text: `  >> Taches : ${completedCount}/${dayState.tasks.length} terminees` },
        );
        dayState.tasks.forEach((t, i) => {
          out.push({ type: dayState.completed[i] ? "success" : "output", text: `  [${dayState.completed[i] ? "X" : " "}] ${t}` });
        });
        out.push({ type: "narrative", text: "" });
        add(out);
        return;
      }

      /* ── SLEEP ── */
      if (upper === "SLEEP") {
        const allDone = dayState.completed.every(Boolean);
        if (!allDone) {
          const remaining = dayState.completed.filter((c) => !c).length;
          sounds.warning();
          out.push(
            { type: "error", text: `  [CANNOT SLEEP] ${remaining} tache(s) non terminee(s).` },
            { type: "warning", text: "  >> Complete toutes les taches avant la mise en veille." },
            { type: "output", text: "  >> Tape STATUS pour voir les taches restantes." },
          );
          add(out);
          return;
        }

        sounds.dayComplete();
        // Persist day completion
        gameStateRef.current = markDayCompleted(gameStateRef.current, dayState.day);
        saveGameState(gameStateRef.current);

        if (dayState.day === 4) {
          out.push(...finalDeployLines());
          add(out);
          setDayState((prev) => ({ ...prev, sleeping: true }));
          return;
        }

        sounds.sleep();
        out.push(...deepSleepLines(dayState.day));
        // Show cooldown info
        out.push(
          { type: "system", text: "  ════════════════════════════════════════════════════════════" },
          { type: "success", text: `  ✓ JOUR ${dayState.day} TERMINE — Progression sauvegardee!` },
          { type: "system", text: "  ════════════════════════════════════════════════════════════" },
          { type: "narrative", text: "" },
          { type: "system", text: "  ⏱  Delai de refroidissement : 24h avant le prochain jour." },
          { type: "warning", text: "  >> Ouvre le Project Tracker pour suivre le compte a rebours." },
          { type: "output", text: `  >> Tape WAKE_UP quand le cooldown est termine pour commencer le Jour ${dayState.day + 1}.` },
          { type: "narrative", text: "" },
        );
        add(out);
        setDayState((prev) => ({ ...prev, sleeping: true }));
        return;
      }

      /* ── ML_TEST (Day 4 special command) ── */
      if (upper === "ML_TEST") {
        if (dayState.day !== 4) {
          out.push({ type: "error", text: "  [ERROR] Les tests ML ne sont disponibles qu'au Jour 4." });
          add(out);
          return;
        }
        if (!dayState.completed.slice(0, 3).every(Boolean)) {
          out.push({ type: "error", text: "  [ERROR] Complete les taches 1 a 3 d'abord." });
          add(out);
          return;
        }
        add(out);
        const { lines: mlLines, results } = generateMLTestSequence();
        animateLines(mlLines, () => {
          // Save ML results to game state
          gameStateRef.current = saveMLResults(gameStateRef.current, results);
          saveGameState(gameStateRef.current);
          add([
            { type: "success", text: "  >> Resultats ML sauvegardes. Ouvre le Project Tracker pour les voir." },
            { type: "narrative", text: "" },
          ]);
        });
        return;
      }

      /* ── HELP ── */
      if (upper === "HELP") {
        out.push(
          { type: "narrative", text: "" },
          { type: "system", text: "  ─── ECHO_OS COMMAND LIST ───" },
          { type: "output", text: "  SYS_INIT --user=ADMIN --project=AURA   Initialiser la session" },
          { type: "output", text: "  TASK_1 / TASK_2 / TASK_3 / TASK_4      Executer une tache (dans l'ordre)" },
          { type: "output", text: "  MINIGAME                               Lancer le mini-jeu du jour" },
          { type: "output", text: "  EXPORT                                 Crypter et exporter les donnees" },
          { type: "output", text: "  STATUS                                 Etat d'AURA-01" },
          { type: "output", text: "  SLEEP                                  Mettre en veille (fin de jour)" },
          { type: "output", text: "  WAKE_UP                                Reveil (jour suivant)" },
          { type: "output", text: "  ML_TEST                                Lancer les tests Machine Learning (Jour 4)" },
          { type: "output", text: "  CLEAR                                  Nettoyer l'ecran" },
          { type: "output", text: "  RESTART                                Reinitialiser la simulation" },
          { type: "output", text: "  HELP                                   Afficher cette aide" },
          { type: "system", text: "  ──────────────────────────────" },
          { type: "narrative", text: "" },
          { type: "output", text: "  Commandes de secours (en cas d'erreur critique):" },
          { type: "output", text: "  coolant_flush | buffer_purge | kernel_restart" },
          { type: "output", text: "  link_reset    | mem_defrag   | power_stabilize" },
          { type: "narrative", text: "" },
        );
        add(out);
        return;
      }

      /* ── CLEAR ── */
      if (upper === "CLEAR") {
        setLines([]);
        return;
      }

      /* ── Unknown command ── */
      out.push(
        { type: "error", text: `  [UNKNOWN COMMAND] '${trimmed}'` },
        { type: "warning", text: "  >> Tape HELP pour la liste des commandes." },
      );
      add(out);
    },
    [dayState, add, shouldFail, getRandomError, startDay, animateLines, onExport]
  );

  /* ── Handle visual mini-game completion ── */
  const handleMiniGameComplete = useCallback((success: boolean) => {
    setShowVisualMiniGame(false);

    const resultLines: Line[] = [
      { type: "narrative", text: "" },
    ];

    if (success) {
      resultLines.push(
        { type: "success", text: "   ✓ [CORRECT] Analyse validee avec succes!" },
        { type: "output", text: "   Neural-Core Reward Signal: +12.4 units" },
        { type: "output", text: "   AURA-01 learning index: +2.8%" },
        { type: "narrative", text: "" },
        { type: "system", text: "  ════════════════════════════════════════════════════════════" },
        { type: "success", text: "  ✓ MINI-JEU TERMINE — Tache 3 accomplie!" },
        { type: "system", text: "  ════════════════════════════════════════════════════════════" },
        { type: "narrative", text: "" },
        { type: "warning", text: "  >> PROCHAINE ETAPE : Tape TASK_4 pour la derniere tache du jour." },
        { type: "output", text: "  >> (Optionnel) Tape EXPORT pour sauvegarder les resultats du mini-jeu." },
        { type: "narrative", text: "" },
      );

      if (dayState.day === 3) {
        const glitch = AURA_GLITCHES[Math.floor(Math.random() * AURA_GLITCHES.length)];
        resultLines.push(
          { type: "warning", text: `  ${glitch}` },
          { type: "narrative", text: "" },
        );
      }

      setDayState((prev) => {
        const completed = [...prev.completed];
        completed[2] = true;
        return { ...prev, completed, nextTask: 3, canExport: true };
      });

      gameStateRef.current = markMiniGameCompleted(gameStateRef.current, dayState.day);
      gameStateRef.current = markTaskCompleted(gameStateRef.current, dayState.day, 2);
      saveGameState(gameStateRef.current);
    } else {
      resultLines.push(
        { type: "error", text: "   ✗ [ECHEC] Mini-jeu non complete." },
        { type: "warning", text: "   >> Tu peux reessayer avec MINIGAME." },
        { type: "narrative", text: "" },
      );
    }

    add(resultLines);
  }, [dayState.day, add]);

  const handleMiniGameClose = useCallback(() => {
    setShowVisualMiniGame(false);
    add([
      { type: "narrative", text: "" },
      { type: "warning", text: "  >> Mini-jeu annule. Tape MINIGAME pour reessayer." },
      { type: "narrative", text: "" },
    ]);
  }, [add]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      exec(input);
      if (input.trim()) setHistory((p) => [...p, input]);
      setHistIdx(-1);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length) {
        const i = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
        setHistIdx(i);
        setInput(history[i]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx !== -1) {
        const i = histIdx + 1;
        if (i >= history.length) { setHistIdx(-1); setInput(""); }
        else { setHistIdx(i); setInput(history[i]); }
      }
    }
  };

  const lineColor = (type: LineType): string => {
    switch (type) {
      case "input": return "text-[#5a5a6e]";
      case "output": return "text-[#b0b0c0]";
      case "error": return "text-red-400";
      case "system": return "text-[var(--c-accent)]";
      case "ascii": return "text-red-400 drop-shadow-[0_0_8px_rgba(255,42,42,0.3)]";
      case "warning": return "text-red-300";
      case "success": return "text-[var(--c-accent)]";
      case "narrative": return "text-[#8888a0] italic";
      default: return "text-[#b0b0c0]";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#060610]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a0a0c] border-b border-red-900/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--c-accent)] shadow-[0_0_6px_rgba(255,42,42,0.5)] animate-pulse" />
          <span className="text-[10px] text-[var(--c-accent)]/60 tracking-[0.2em]">
            ECHO_OS // AURA-01 LAB INTERFACE
          </span>
        </div>
        <span className="text-[10px] text-[var(--c-accent)]/30 tracking-wider">
          {dayState.codeMode ? "MODE CODE" : dayState.sleeping ? "DEEP SLEEP" : dayState.day > 0 ? `JOUR ${dayState.day}/4` : "STANDBY"}
        </span>
      </div>

      {/* Terminal output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 text-[13px] leading-[1.6] font-mono"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((l, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap break-all ${lineColor(l.type)}`}
          >
            {l.text || "\u00A0"}
          </div>
        ))}

        {/* Animation indicator */}
        {isAnimating && (
          <div className="flex items-center gap-2 mt-1 text-[var(--c-accent)]/40 text-xs">
            <span className="animate-pulse">●</span>
            <span className="tracking-wider">Traitement en cours...</span>
          </div>
        )}

        {/* Input line */}
        {!isAnimating && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-xs ${dayState.codeMode ? "text-[var(--c-accent)]/70" : "text-[var(--c-accent)]/50"}`}>
              {dayState.codeMode ? `code[${dayState.codeLineIdx + 1}]>` : "echo_os>"}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              className="aura-terminal-input"
              autoFocus
              spellCheck={false}
              placeholder={dayState.codeMode ? CODE_PROMPTS[dayState.day]?.hints[dayState.codeLineIdx] || "" : ""}
            />
          </div>
        )}
      </div>

      {/* Visual Mini-Game Overlay */}
      {showVisualMiniGame && (
        <MiniGame
          day={dayState.day}
          onComplete={handleMiniGameComplete}
          onClose={handleMiniGameClose}
        />
      )}
    </div>
  );
}
