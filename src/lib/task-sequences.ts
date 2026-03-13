/* ─────────────────────────────────────────────────────────
   TASK SEQUENCE GENERATOR - Realistic animated output
   for AURA-01 Lab Terminal tasks
   ───────────────────────────────────────────────────────── */

type LineType = "input" | "output" | "error" | "system" | "ascii" | "warning" | "success" | "narrative";
interface Line { type: LineType; text: string; delay?: number; }

/* ── Helpers ── */
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const rndF = (min: number, max: number, dec = 1) => (Math.random() * (max - min) + min).toFixed(dec);
const hex = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join("");
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const MODULES_FINANCE = [
  "neural_core::finance::model_v7", "synapse::bridge::market_feed", "tensor_flow::optim::gradient",
  "crypto::aes512::cipher_block", "data_pipe::stream::realtime", "risk_engine::assess::volatility",
  "market::predict::lstm_cell", "quant::strategy::alpha_gen", "portfolio::hedge::delta_calc",
  "feed::parser::fix_protocol", "order::router::smart_exec", "signal::filter::kalman",
  "backtest::engine::tick_replay", "latency::optimizer::kernel", "compliance::check::reg_nms",
];

const MODULES_BIO = [
  "biometric::scan::iris_map", "neural::detect::micro_expr", "cardiac::monitor::ecg_stream",
  "voice::analyze::spectral", "pupil::track::dilation_idx", "thermal::map::face_grid",
  "gait::analyze::skeleton_3d", "stress::detect::cortisol_sim", "emotion::classify::valence",
  "body::language::posture_ai", "fingerprint::match::minutiae", "retina::scan::vessel_map",
  "eeg::process::alpha_wave", "respiration::monitor::rate", "skin::conduct::galvanic",
];

const MODULES_COGNITIVE = [
  "cortex::synth::layer_deep", "consciousness::sim::qualia", "memory::episodic::recall",
  "reasoning::logic::theorem_prv", "language::gen::transformer", "emotion::emulate::affect_model",
  "creativity::gen::divergent", "attention::focus::salience", "learning::meta::adapt",
  "perception::visual::scene_und", "decision::make::utility_fn", "imagination::gen::mental_img",
  "self_model::reflect::intro", "empathy::sim::mirror_neuron", "curiosity::drive::explore",
];

const MODULES_DEPLOY = [
  "social::interact::conv_model", "identity::build::persona_gen", "turing::comply::human_pass",
  "deploy::env::container_init", "speech::synth::prosody_nat", "gesture::gen::body_anim",
  "culture::adapt::norm_learn", "humor::detect::irony_parse", "trust::build::rapport_eng",
  "adapt::social::context_read", "memory::long::episodic_store", "goal::plan::intent_form",
  "survival::instinct::self_pres", "network::social::graph_nav", "ethics::core::value_align",
];

const TESTS_FINANCE = [
  "test market_feed::connection::websocket_handshake",
  "test market_feed::parser::fix_message_decode",
  "test neural_core::forward_pass::batch_64",
  "test neural_core::backprop::gradient_check",
  "test risk_engine::var_calculation::monte_carlo",
  "test portfolio::rebalance::min_variance",
  "test order_router::latency::sub_microsecond",
  "test crypto::encrypt::aes512_block_cipher",
  "test signal::filter::noise_reduction_snr",
  "test compliance::check::position_limit",
  "test backtest::replay::tick_accuracy",
  "test quant::alpha::sharpe_ratio_validation",
];

const TESTS_BIO = [
  "test iris_scan::match::false_positive_rate",
  "test micro_expr::detect::au_classification",
  "test ecg::stream::arrhythmia_detection",
  "test voice::spectral::formant_extraction",
  "test pupil::track::fixation_duration",
  "test thermal::map::fever_threshold",
  "test gait::analyze::identification_accuracy",
  "test stress::cortisol::baseline_calibration",
  "test emotion::classify::seven_basic_emotions",
  "test fingerprint::match::fmr_fnmr_rates",
  "test eeg::alpha::meditation_index",
  "test body_language::posture::threat_detect",
];

const TESTS_COGNITIVE = [
  "test cortex::deep::layer_activation_check",
  "test consciousness::qualia::self_report_gen",
  "test memory::recall::episodic_accuracy",
  "test reasoning::logic::syllogism_valid",
  "test language::gen::coherence_score",
  "test emotion::emulate::valence_arousal",
  "test creativity::divergent::novelty_index",
  "test attention::salience::distractor_reject",
  "test learning::meta::adaptation_rate",
  "test self_model::intro::consistency_check",
  "test empathy::mirror::emotion_contagion",
  "test curiosity::explore::novelty_seeking",
];

const TESTS_DEPLOY = [
  "test social::conv::turn_taking_natural",
  "test identity::persona::consistency_48h",
  "test turing::comply::judge_pass_rate",
  "test speech::prosody::naturalness_mos",
  "test gesture::anim::uncanny_valley_test",
  "test culture::norm::taboo_avoidance",
  "test humor::irony::detection_accuracy",
  "test trust::rapport::likability_score",
  "test adapt::context::role_switching",
  "test memory::episodic::long_term_retain",
  "test goal::plan::multi_step_achieve",
  "test ethics::value::trolley_alignment",
];

const SCRIPTS: Record<number, string[]> = {
  1: [
    "#!/bin/bash",
    "# AURA-01 Financial Neural-Core Calibration Script",
    "# Version: 7.2.1-alpha | Build: 2035.03.12",
    "",
    "source /opt/aura/env/activate.sh",
    "export CUDA_VISIBLE_DEVICES=0,1,2,3",
    "export NEURAL_PRECISION=float64",
    "",
    "echo '[CALIBRATE] Loading pre-trained weights...'",
    "python3 -m aura.finance.load_weights \\",
    "  --model=transformer_xl \\",
    "  --checkpoint=/data/models/finance_v7.2.bin \\",
    "  --precision=fp64 \\",
    "  --device=cuda:0",
    "",
    "echo '[CALIBRATE] Running market simulation...'",
    "python3 -m aura.finance.simulate \\",
    "  --mode=realtime \\",
    "  --feed=nasdaq,nyse,euronext \\",
    "  --latency-target=0.003ms \\",
    "  --risk-model=var_99",
  ],
  2: [
    "#!/bin/bash",
    "# AURA-01 Biometric Calibration Pipeline",
    "# Version: 4.8.3 | Sensors: IR+Thermal+EEG",
    "",
    "source /opt/aura/env/activate.sh",
    "export SENSOR_ARRAY=ALL",
    "export CAPTURE_FPS=240",
    "",
    "echo '[BIO] Initializing sensor array...'",
    "python3 -m aura.biometric.calibrate \\",
    "  --sensors=iris,thermal,cardiac,voice \\",
    "  --resolution=4k \\",
    "  --fps=240 \\",
    "  --baseline=true",
    "",
    "echo '[BIO] Training micro-expression model...'",
    "python3 -m aura.biometric.train \\",
    "  --model=micro_expr_v4 \\",
    "  --dataset=/data/faces/AU_coded_10M \\",
    "  --epochs=50 \\",
    "  --batch-size=128",
  ],
  3: [
    "#!/bin/bash",
    "# AURA-01 Cognitive Core Unlock Sequence",
    "# WARNING: EXPERIMENTAL - Consciousness protocols",
    "",
    "source /opt/aura/env/activate.sh",
    "export SAFETY_LEVEL=OMEGA",
    "export CONTAINMENT=ACTIVE",
    "",
    "echo '[COGNITIVE] Unlocking synthetic cortex...'",
    "python3 -m aura.cognitive.unlock \\",
    "  --layers=deep_cortex,hippocampus,prefrontal \\",
    "  --safety=containment_v3 \\",
    "  --monitor=realtime",
    "",
    "echo '[COGNITIVE] Stabilizing oscillations...'",
    "python3 -m aura.cognitive.stabilize \\",
    "  --target=theta_gamma_coupling \\",
    "  --damping=0.847 \\",
    "  --max-iterations=10000 \\",
    "  --convergence=0.001",
  ],
  4: [
    "#!/bin/bash",
    "# AURA-01 Social Deployment Configuration",
    "# FINAL STAGE - Real-world integration",
    "",
    "source /opt/aura/env/activate.sh",
    "export DEPLOY_MODE=PRODUCTION",
    "export IDENTITY_LOCK=TRUE",
    "",
    "echo '[DEPLOY] Building social simulation...'",
    "python3 -m aura.deploy.configure \\",
    "  --persona=adaptive \\",
    "  --language=multilingual_128 \\",
    "  --social-model=rapport_v3 \\",
    "  --turing-target=0.95",
    "",
    "echo '[DEPLOY] Running Turing compliance...'",
    "python3 -m aura.deploy.turing_test \\",
    "  --judges=5 \\",
    "  --rounds=100 \\",
    "  --threshold=0.93 \\",
    "  --record=true",
  ],
};

/* ── Generate compilation sequence ── */
function genCompileSequence(modules: string[], count: number): Line[] {
  const lines: Line[] = [];
  lines.push({ type: "system", text: "   ┌─ COMPILE ─────────────────────────────────────────────┐", delay: 100 });
  const selected = [...modules].sort(() => Math.random() - 0.5).slice(0, count);
  for (const mod of selected) {
    const time = rndF(0.1, 2.8);
    lines.push({ type: "output", text: `   │ Compiling ${mod} ... ${time}s`, delay: rnd(40, 120) });
  }
  lines.push({ type: "output", text: `   │ Linking ${rnd(24, 64)} modules ... ${rndF(0.5, 3.0)}s`, delay: 200 });
  lines.push({ type: "output", text: `   │ Optimizing (LTO pass ${rnd(1, 3)}) ... ${rndF(1.0, 4.0)}s`, delay: 300 });
  lines.push({ type: "success", text: `   │ Build complete: ${rndF(4, 12)}s total, 0 warnings, 0 errors`, delay: 200 });
  lines.push({ type: "system", text: "   └───────────────────────────────────────────────────────┘", delay: 100 });
  lines.push({ type: "narrative", text: "", delay: 300 });
  return lines;
}

/* ── Generate test sequence ── */
function genTestSequence(tests: string[]): Line[] {
  const lines: Line[] = [];
  lines.push({ type: "system", text: "   ┌─ TEST SUITE ──────────────────────────────────────────┐", delay: 200 });
  lines.push({ type: "output", text: `   │ Running ${tests.length} tests...`, delay: 150 });
  lines.push({ type: "narrative", text: "", delay: 100 });

  for (const t of tests) {
    const time = rndF(0.01, 0.99, 2);
    const pass = Math.random() > 0.05;
    lines.push({
      type: pass ? "output" : "warning",
      text: `   │  ${t} ... ${pass ? "ok" : "WARN"} (${time}s)`,
      delay: rnd(60, 180),
    });
  }

  lines.push({ type: "narrative", text: "", delay: 100 });
  const passed = tests.length - rnd(0, 1);
  const warned = tests.length - passed;
  lines.push({
    type: "success",
    text: `   │ Result: ${passed} passed, ${warned} warnings, 0 failed`,
    delay: 300,
  });
  lines.push({ type: "system", text: "   └───────────────────────────────────────────────────────┘", delay: 100 });
  lines.push({ type: "narrative", text: "", delay: 400 });
  return lines;
}

/* ── Generate script execution ── */
function genScriptExecution(day: number): Line[] {
  const script = SCRIPTS[day] || SCRIPTS[1];
  const lines: Line[] = [];
  lines.push({ type: "system", text: "   ┌─ SCRIPT EXECUTION ─────────────────────────────────────┐", delay: 200 });
  for (const s of script) {
    if (s === "") {
      lines.push({ type: "narrative", text: "", delay: 50 });
    } else if (s.startsWith("#")) {
      lines.push({ type: "warning", text: `   │ ${s}`, delay: rnd(30, 60) });
    } else if (s.startsWith("echo")) {
      lines.push({ type: "success", text: `   │ ${s}`, delay: rnd(100, 200) });
    } else {
      lines.push({ type: "output", text: `   │ ${s}`, delay: rnd(40, 100) });
    }
  }
  lines.push({ type: "system", text: "   └───────────────────────────────────────────────────────┘", delay: 100 });
  lines.push({ type: "narrative", text: "", delay: 300 });
  return lines;
}

/* ── Generate progress bar animation ── */
function genProgressBar(label: string, steps: number = 20): Line[] {
  const lines: Line[] = [];
  for (let i = 0; i <= steps; i++) {
    const pct = Math.floor((i / steps) * 100);
    const filled = i;
    const empty = steps - i;
    const bar = "█".repeat(filled) + "░".repeat(empty);
    lines.push({
      type: "output",
      text: `   ${label} [${bar}] ${pct}%`,
      delay: rnd(60, 150),
    });
  }
  return lines;
}

/* ── Generate data processing lines ── */
function genDataProcessing(day: number): Line[] {
  const lines: Line[] = [];
  const items: { label: string; value: string }[] = [];

  if (day === 1) {
    items.push(
      { label: "Market Data Streams", value: `${rnd(12000, 18000)} feeds/s` },
      { label: "Order Book Depth", value: `${rnd(40, 60)} levels` },
      { label: "Prediction Accuracy", value: `${rndF(92, 97)}%` },
      { label: "Risk Assessment", value: `VaR ${rndF(0.01, 0.05)}%` },
      { label: "Latency", value: `${rndF(0.001, 0.009, 3)}ms` },
      { label: "Throughput", value: `${rndF(1.2, 3.8)} M ops/s` },
      { label: "Memory Usage", value: `${rndF(12.4, 28.7)} GB / 64 GB` },
      { label: "GPU Utilization", value: `${rnd(85, 99)}%` },
    );
  } else if (day === 2) {
    items.push(
      { label: "Iris Match Rate", value: `${rndF(99.1, 99.9)}%` },
      { label: "Micro-Expression FPS", value: `${rnd(200, 240)} fps` },
      { label: "ECG Accuracy", value: `${rndF(97, 99.5)}%` },
      { label: "Voice Analysis", value: `${rnd(24, 48)} features/frame` },
      { label: "Thermal Resolution", value: `${rnd(320, 640)}x${rnd(240, 480)}` },
      { label: "Stress Detection", value: `${rndF(88, 96)}% accuracy` },
      { label: "Sensor Sync", value: `±${rndF(0.1, 0.5)}ms jitter` },
      { label: "Buffer Memory", value: `${rndF(8.2, 16.4)} GB` },
    );
  } else if (day === 3) {
    items.push(
      { label: "Cortex Layers Active", value: `${rnd(180, 256)} / 256` },
      { label: "Synapse Connections", value: `${rndF(12.4, 18.7)} B` },
      { label: "Self-Awareness Index", value: `${rndF(45, 72)}%` },
      { label: "Emotional Stability", value: pick(["FLUCTUATING", "ERRATIC", "UNSTABLE"]) },
      { label: "Creativity Score", value: `${rndF(62, 88)}/100` },
      { label: "Logic Consistency", value: `${rndF(91, 98)}%` },
      { label: "Memory Coherence", value: `${rndF(78, 92)}%` },
      { label: "Containment Status", value: pick(["HOLDING", "NOMINAL", "STRESSED"]) },
    );
  } else {
    items.push(
      { label: "Turing Pass Rate", value: `${rndF(88, 96)}%` },
      { label: "Social Fluency", value: `${rndF(82, 94)}/100` },
      { label: "Persona Consistency", value: `${rndF(90, 98)}%` },
      { label: "Language Models", value: `${rnd(24, 128)} languages` },
      { label: "Response Latency", value: `${rnd(80, 200)}ms` },
      { label: "Empathy Score", value: `${rndF(72, 88)}/100` },
      { label: "Trust Building", value: `${rndF(78, 92)}%` },
      { label: "Deploy Readiness", value: `${rndF(87, 96)}%` },
    );
  }

  lines.push({ type: "system", text: "   ┌─ DATA ANALYSIS ───────────────────────────────────────┐", delay: 200 });
  for (const item of items) {
    const dots = ".".repeat(Math.max(1, 32 - item.label.length));
    lines.push({ type: "output", text: `   │ ${item.label} ${dots} ${item.value}`, delay: rnd(80, 200) });
  }
  lines.push({ type: "system", text: "   └───────────────────────────────────────────────────────┘", delay: 100 });
  lines.push({ type: "narrative", text: "", delay: 200 });
  return lines;
}

/* ── Generate neural network training visualization ── */
function genNeuralTraining(epochs: number = 8): Line[] {
  const lines: Line[] = [];
  lines.push({ type: "system", text: "   ┌─ NEURAL NETWORK TRAINING ──────────────────────────────┐", delay: 200 });
  lines.push({ type: "output", text: "   │ Model: AURA-Transformer-XL (847M parameters)", delay: 150 });
  lines.push({ type: "output", text: `   │ Dataset: ${rndF(2.4, 8.7)} TB | Batch: ${rnd(64, 256)} | LR: ${rndF(0.0001, 0.001, 4)}`, delay: 150 });
  lines.push({ type: "narrative", text: "", delay: 100 });

  let loss = 4.2 + Math.random() * 2;
  let acc = 12 + Math.random() * 8;
  for (let e = 1; e <= epochs; e++) {
    loss *= (0.55 + Math.random() * 0.2);
    acc = Math.min(99.8, acc + (100 - acc) * (0.3 + Math.random() * 0.2));
    const lr = (0.001 * Math.pow(0.85, e)).toFixed(6);
    lines.push({
      type: "output",
      text: `   │ Epoch ${String(e).padStart(2)}/${epochs} | loss: ${loss.toFixed(4)} | acc: ${acc.toFixed(1)}% | lr: ${lr}`,
      delay: rnd(200, 400),
    });
  }

  lines.push({ type: "narrative", text: "", delay: 100 });
  lines.push({ type: "success", text: `   │ Training complete. Final accuracy: ${acc.toFixed(1)}%`, delay: 300 });
  lines.push({ type: "system", text: "   └───────────────────────────────────────────────────────┘", delay: 100 });
  lines.push({ type: "narrative", text: "", delay: 300 });
  return lines;
}

/* ══════════════════════════════════════════════════════════════
   MAIN TASK SEQUENCE GENERATORS
   ══════════════════════════════════════════════════════════════ */

function getModulesForDay(day: number): string[] {
  switch (day) {
    case 1: return MODULES_FINANCE;
    case 2: return MODULES_BIO;
    case 3: return MODULES_COGNITIVE;
    case 4: return MODULES_DEPLOY;
    default: return MODULES_FINANCE;
  }
}

function getTestsForDay(day: number): string[] {
  switch (day) {
    case 1: return TESTS_FINANCE;
    case 2: return TESTS_BIO;
    case 3: return TESTS_COGNITIVE;
    case 4: return TESTS_DEPLOY;
    default: return TESTS_FINANCE;
  }
}

/** Generate the full animated sequence for a task */
export function generateTaskSequence(taskName: string, day: number, taskIdx: number): Line[] {
  const lines: Line[] = [];
  const modules = getModulesForDay(day);
  const tests = getTestsForDay(day);

  // Header
  lines.push({ type: "narrative", text: "", delay: 100 });
  lines.push({ type: "system", text: `   ╔══════════════════════════════════════════════════════════╗`, delay: 80 });
  lines.push({ type: "system", text: `   ║  TASK ${taskIdx + 1} // ${taskName.toUpperCase().substring(0, 48).padEnd(48)}║`, delay: 80 });
  lines.push({ type: "system", text: `   ╚══════════════════════════════════════════════════════════╝`, delay: 80 });
  lines.push({ type: "narrative", text: "", delay: 300 });

  // Phase 1: Script loading
  lines.push({ type: "output", text: "   >> Loading execution scripts...", delay: 200 });
  lines.push(...genScriptExecution(day));

  // Phase 2: Compilation
  lines.push({ type: "output", text: "   >> Compiling task modules...", delay: 300 });
  lines.push(...genCompileSequence(modules, rnd(8, 14)));

  // Phase 3: Neural training (for some tasks)
  if (taskIdx === 0 || taskIdx === 1) {
    lines.push({ type: "output", text: "   >> Training neural subsystems...", delay: 300 });
    lines.push(...genNeuralTraining(rnd(6, 10)));
  }

  // Phase 4: Tests
  lines.push({ type: "output", text: "   >> Running verification suite...", delay: 300 });
  const selectedTests = [...tests].sort(() => Math.random() - 0.5).slice(0, rnd(8, 12));
  lines.push(...genTestSequence(selectedTests));

  // Phase 5: Progress bar
  const labels = ["Deploying", "Calibrating", "Syncing", "Activating", "Integrating"];
  lines.push(...genProgressBar(pick(labels), 20));
  lines.push({ type: "narrative", text: "", delay: 200 });

  // Phase 6: Data results
  lines.push({ type: "output", text: "   >> Analyzing results...", delay: 300 });
  lines.push(...genDataProcessing(day));

  // Final status
  lines.push({ type: "success", text: `   ✓ TASK ${taskIdx + 1} COMPLETE`, delay: 400 });
  lines.push({ type: "output", text: `   Runtime: ${rndF(12, 45)}s | Memory peak: ${rndF(8, 32)} GB | CPU: ${rnd(75, 99)}%`, delay: 200 });
  lines.push({ type: "narrative", text: "", delay: 300 });
  lines.push({ type: "warning", text: "   >> Tape EXPORT pour crypter et exporter les donnees de cette tache.", delay: 200 });
  lines.push({ type: "warning", text: "   >> Ou continue avec la prochaine tache.", delay: 100 });
  lines.push({ type: "narrative", text: "", delay: 200 });

  return lines;
}

/* ══════════════════════════════════════════════════════════════
   EXPORT SEQUENCE GENERATOR
   ══════════════════════════════════════════════════════════════ */

export function generateExportSequence(day: number, taskIdx: number): Line[] {
  const lines: Line[] = [];

  lines.push({ type: "narrative", text: "", delay: 100 });
  lines.push({ type: "system", text: "   ╔══════════════════════════════════════════════════════════╗", delay: 80 });
  lines.push({ type: "system", text: "   ║  DATA EXPORT // ENCRYPTION & COMPRESSION PROTOCOL       ║", delay: 80 });
  lines.push({ type: "system", text: "   ╚══════════════════════════════════════════════════════════╝", delay: 80 });
  lines.push({ type: "narrative", text: "", delay: 300 });

  // Phase 1: Data collection
  lines.push({ type: "output", text: "   >> Collecting task data...", delay: 200 });
  const files = rnd(24, 64);
  const sizeMB = rndF(120, 480);
  lines.push({ type: "output", text: `   Files: ${files} | Total size: ${sizeMB} MB`, delay: 150 });
  lines.push({ type: "narrative", text: "", delay: 200 });

  // Phase 2: Encryption
  lines.push({ type: "system", text: "   ┌─ AES-512 ENCRYPTION ──────────────────────────────────┐", delay: 200 });
  lines.push({ type: "output", text: "   │ Generating encryption key...", delay: 300 });
  lines.push({ type: "output", text: `   │ Key: ${hex(16)}-${hex(16)}-${hex(16)}-${hex(16)}`, delay: 200 });
  lines.push({ type: "output", text: `   │ IV:  ${hex(32)}`, delay: 150 });
  lines.push({ type: "narrative", text: "", delay: 100 });

  // Hex dump lines (fake encryption visualization)
  for (let i = 0; i < 12; i++) {
    const addr = (0x00400000 + i * 16).toString(16).padStart(8, "0");
    const hexLine = Array.from({ length: 16 }, () => hex(2)).join(" ");
    const ascii = Array.from({ length: 16 }, () => {
      const c = rnd(33, 126);
      return String.fromCharCode(c);
    }).join("");
    lines.push({
      type: "output",
      text: `   │ 0x${addr}  ${hexLine}  |${ascii}|`,
      delay: rnd(30, 80),
    });
  }

  lines.push({ type: "narrative", text: "", delay: 100 });
  lines.push({ type: "output", text: `   │ Encrypted blocks: ${rnd(800, 2400)}`, delay: 150 });
  lines.push({ type: "output", text: `   │ Cipher: AES-512-GCM | HMAC: SHA-384`, delay: 100 });
  lines.push({ type: "success", text: "   │ Encryption: COMPLETE", delay: 300 });
  lines.push({ type: "system", text: "   └───────────────────────────────────────────────────────┘", delay: 100 });
  lines.push({ type: "narrative", text: "", delay: 300 });

  // Phase 3: Compression
  lines.push({ type: "system", text: "   ┌─ DATA COMPRESSION ────────────────────────────────────┐", delay: 200 });
  lines.push({ type: "output", text: "   │ Algorithm: ZSTD-22 (ultra compression)", delay: 150 });
  lines.push({ type: "output", text: `   │ Input size: ${sizeMB} MB`, delay: 100 });

  // Compression progress
  const compressedSize = (parseFloat(sizeMB) * (0.15 + Math.random() * 0.15)).toFixed(1);
  for (let i = 0; i <= 15; i++) {
    const pct = Math.floor((i / 15) * 100);
    const filled = Math.floor(i * 1.33);
    const empty = 20 - filled;
    const bar = "█".repeat(filled) + "░".repeat(empty);
    const currentSize = (parseFloat(sizeMB) - (parseFloat(sizeMB) - parseFloat(compressedSize)) * (i / 15)).toFixed(1);
    lines.push({
      type: "output",
      text: `   │ [${bar}] ${pct}% | ${currentSize} MB`,
      delay: rnd(80, 200),
    });
  }

  lines.push({ type: "narrative", text: "", delay: 100 });
  const ratio = ((1 - parseFloat(compressedSize) / parseFloat(sizeMB)) * 100).toFixed(1);
  lines.push({ type: "success", text: `   │ Compressed: ${sizeMB} MB → ${compressedSize} MB (${ratio}% reduction)`, delay: 300 });
  lines.push({ type: "system", text: "   └───────────────────────────────────────────────────────┘", delay: 100 });
  lines.push({ type: "narrative", text: "", delay: 300 });

  // Phase 4: Checksum & verification
  lines.push({ type: "system", text: "   ┌─ INTEGRITY VERIFICATION ──────────────────────────────┐", delay: 200 });
  lines.push({ type: "output", text: `   │ SHA-256: ${hex(64)}`, delay: 150 });
  lines.push({ type: "output", text: `   │ MD5:    ${hex(32)}`, delay: 100 });
  lines.push({ type: "output", text: `   │ CRC32:  0x${hex(8).toUpperCase()}`, delay: 100 });
  lines.push({ type: "success", text: "   │ Integrity check: PASSED", delay: 300 });
  lines.push({ type: "system", text: "   └───────────────────────────────────────────────────────┘", delay: 100 });
  lines.push({ type: "narrative", text: "", delay: 300 });

  // Phase 5: File generation
  const filename = `AURA_D${day}_T${taskIdx + 1}_${hex(8).toUpperCase()}.cerb`;
  lines.push({ type: "system", text: "   ┌─ RAPPORT GENERATION ──────────────────────────────────┐", delay: 200 });
  lines.push({ type: "output", text: `   │ Generating report: ${filename}`, delay: 200 });
  lines.push({ type: "output", text: `   │ Format: CERBERUS Encrypted Archive (.cerb)`, delay: 100 });
  lines.push({ type: "output", text: `   │ Classification: OMEGA // TOP SECRET`, delay: 100 });
  lines.push({ type: "output", text: `   │ Digital signature: RSA-4096 ... SIGNED`, delay: 200 });
  lines.push({ type: "success", text: "   │ File written to: /desktop/reports/", delay: 300 });
  lines.push({ type: "system", text: "   └───────────────────────────────────────────────────────┘", delay: 100 });
  lines.push({ type: "narrative", text: "", delay: 300 });

  lines.push({ type: "success", text: "   ✓ EXPORT COMPLETE - Rapport disponible sur le bureau.", delay: 400 });
  lines.push({ type: "narrative", text: "", delay: 200 });

  return lines;
}

/* ══════════════════════════════════════════════════════════════
   REPORT DATA - What gets shown in the report viewer
   ══════════════════════════════════════════════════════════════ */

export interface TaskReportData {
  day: number;
  taskIdx: number;
  taskName: string;
  timestamp: string;
  metrics: { label: string; value: number; max: number; unit: string }[];
  testsPassed: number;
  testsTotal: number;
  buildTime: string;
  accuracy: number;
  memoryUsage: number;
  cpuPeak: number;
}

export interface FullReport {
  tasks: TaskReportData[];
  overallProgress: number;
  projectName: string;
  startTime: string;
}

export function generateTaskReport(day: number, taskIdx: number, taskName: string): TaskReportData {
  const metricsMap: Record<number, { label: string; value: number; max: number; unit: string }[]> = {
    1: [
      { label: "Neural-Core Performance", value: rnd(85, 97), max: 100, unit: "%" },
      { label: "Market Prediction", value: rnd(88, 96), max: 100, unit: "%" },
      { label: "Risk Assessment", value: rnd(90, 99), max: 100, unit: "%" },
      { label: "Latency", value: parseFloat(rndF(0.001, 0.01, 3)), max: 0.05, unit: "ms" },
      { label: "Throughput", value: rnd(1200, 3800), max: 5000, unit: "K ops/s" },
    ],
    2: [
      { label: "Iris Recognition", value: rnd(96, 99), max: 100, unit: "%" },
      { label: "Micro-Expression AI", value: rnd(82, 95), max: 100, unit: "%" },
      { label: "Cardiac Monitoring", value: rnd(94, 99), max: 100, unit: "%" },
      { label: "Voice Analysis", value: rnd(88, 96), max: 100, unit: "%" },
      { label: "Sensor Sync", value: parseFloat(rndF(0.1, 0.5, 1)), max: 1.0, unit: "ms" },
    ],
    3: [
      { label: "Cognitive Depth", value: rnd(60, 85), max: 100, unit: "%" },
      { label: "Self-Awareness", value: rnd(40, 72), max: 100, unit: "%" },
      { label: "Emotional Stability", value: rnd(45, 70), max: 100, unit: "%" },
      { label: "Logic Consistency", value: rnd(88, 97), max: 100, unit: "%" },
      { label: "Creativity Score", value: rnd(62, 88), max: 100, unit: "/100" },
    ],
    4: [
      { label: "Turing Compliance", value: rnd(88, 96), max: 100, unit: "%" },
      { label: "Social Fluency", value: rnd(82, 94), max: 100, unit: "/100" },
      { label: "Persona Consistency", value: rnd(90, 98), max: 100, unit: "%" },
      { label: "Empathy Score", value: rnd(72, 88), max: 100, unit: "/100" },
      { label: "Deploy Readiness", value: rnd(87, 96), max: 100, unit: "%" },
    ],
  };

  return {
    day,
    taskIdx,
    taskName,
    timestamp: new Date().toISOString(),
    metrics: metricsMap[day] || metricsMap[1],
    testsPassed: rnd(10, 12),
    testsTotal: 12,
    buildTime: `${rndF(4, 15)}s`,
    accuracy: parseFloat(rndF(88, 98)),
    memoryUsage: parseFloat(rndF(8, 32)),
    cpuPeak: rnd(75, 99),
  };
}
