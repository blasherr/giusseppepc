class SoundManager {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = "sine",
    vol = 0.08
  ) {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = vol;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );
      osc.stop(ctx.currentTime + duration);
    } catch {
      /* audio not available */
    }
  }

  private noise(duration: number, vol = 0.15) {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const size = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const gain = ctx.createGain();
      src.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = vol;
      src.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    } catch {
      /* audio not available */
    }
  }

  boot() {
    this.tone(440, 0.1, "square", 0.04);
    setTimeout(() => this.tone(554, 0.1, "square", 0.04), 120);
    setTimeout(() => this.tone(659, 0.15, "square", 0.04), 240);
    setTimeout(() => this.tone(880, 0.3, "sine", 0.05), 400);
  }

  login() {
    this.tone(523, 0.12, "sine", 0.05);
    setTimeout(() => this.tone(659, 0.12, "sine", 0.05), 130);
    setTimeout(() => this.tone(784, 0.2, "sine", 0.06), 260);
  }

  error() {
    this.tone(200, 0.15, "square", 0.07);
    setTimeout(() => this.tone(150, 0.2, "square", 0.05), 150);
  }

  keypress() {
    this.tone(1200, 0.02, "square", 0.015);
  }

  windowOpen() {
    this.tone(600, 0.07, "sine", 0.04);
    setTimeout(() => this.tone(800, 0.1, "sine", 0.04), 70);
  }

  windowClose() {
    this.tone(800, 0.06, "sine", 0.03);
    setTimeout(() => this.tone(500, 0.08, "sine", 0.03), 70);
  }

  notification() {
    this.tone(880, 0.1, "sine", 0.06);
    setTimeout(() => this.tone(1100, 0.12, "sine", 0.06), 100);
  }

  screamer() {
    this.noise(2, 0.3);
    this.tone(100, 1.5, "sawtooth", 0.15);
    setTimeout(() => this.tone(2000, 1, "square", 0.12), 100);
  }

  // Task/success sounds
  taskComplete() {
    this.tone(523, 0.1, "sine", 0.06);
    setTimeout(() => this.tone(659, 0.1, "sine", 0.06), 100);
    setTimeout(() => this.tone(784, 0.1, "sine", 0.06), 200);
    setTimeout(() => this.tone(1047, 0.25, "sine", 0.08), 300);
  }

  success() {
    this.tone(880, 0.08, "sine", 0.05);
    setTimeout(() => this.tone(1100, 0.08, "sine", 0.05), 80);
    setTimeout(() => this.tone(1320, 0.15, "sine", 0.06), 160);
  }

  minigameWin() {
    this.tone(440, 0.08, "square", 0.04);
    setTimeout(() => this.tone(554, 0.08, "square", 0.04), 100);
    setTimeout(() => this.tone(659, 0.08, "square", 0.04), 200);
    setTimeout(() => this.tone(880, 0.12, "square", 0.05), 300);
    setTimeout(() => this.tone(1100, 0.2, "sine", 0.06), 420);
  }

  minigameFail() {
    this.tone(300, 0.15, "sawtooth", 0.06);
    setTimeout(() => this.tone(200, 0.25, "sawtooth", 0.05), 180);
  }

  codeAccepted() {
    this.tone(700, 0.06, "sine", 0.04);
    setTimeout(() => this.tone(900, 0.08, "sine", 0.05), 80);
  }

  codeRejected() {
    this.tone(250, 0.12, "square", 0.05);
  }

  dayComplete() {
    this.tone(440, 0.12, "sine", 0.05);
    setTimeout(() => this.tone(554, 0.12, "sine", 0.05), 150);
    setTimeout(() => this.tone(659, 0.12, "sine", 0.05), 300);
    setTimeout(() => this.tone(880, 0.15, "sine", 0.06), 450);
    setTimeout(() => this.tone(1047, 0.25, "sine", 0.07), 600);
    setTimeout(() => this.tone(1320, 0.35, "sine", 0.08), 750);
  }

  warning() {
    this.tone(600, 0.1, "square", 0.05);
    setTimeout(() => this.tone(400, 0.15, "square", 0.05), 150);
  }

  typing() {
    this.tone(800 + Math.random() * 400, 0.015, "square", 0.01);
  }

  export() {
    this.tone(300, 0.08, "sine", 0.04);
    setTimeout(() => this.tone(400, 0.08, "sine", 0.04), 100);
    setTimeout(() => this.tone(500, 0.08, "sine", 0.04), 200);
    setTimeout(() => this.tone(600, 0.15, "sine", 0.05), 300);
  }

  sleep() {
    this.tone(600, 0.2, "sine", 0.05);
    setTimeout(() => this.tone(400, 0.3, "sine", 0.04), 250);
    setTimeout(() => this.tone(300, 0.4, "sine", 0.03), 550);
  }

  wakeUp() {
    this.tone(300, 0.15, "sine", 0.04);
    setTimeout(() => this.tone(400, 0.12, "sine", 0.05), 180);
    setTimeout(() => this.tone(550, 0.12, "sine", 0.05), 340);
    setTimeout(() => this.tone(700, 0.2, "sine", 0.06), 500);
  }
}

export const sounds = new SoundManager();
