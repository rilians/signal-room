import { SynthKnobs } from '../types/campaign';

class StudioSoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private lastTickTime: number = 0;

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    if (val) {
      this.ensureContext();
      this.playSwitchClick(true);
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Subtle mechanical rotary encoder detent click
   */
  public playKnobDetent(normalizedVal: number): void {
    const nowMs = performance.now();
    if (nowMs - this.lastTickTime < 28) return;
    this.lastTickTime = nowMs;

    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const freq = 520 + normalizedVal * 1550;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.016);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.2, t);
      filter.Q.setValueAtTime(3.2, t);

      gain.gain.setValueAtTime(0.065, t);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.018);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.02);
    } catch {
      // Ignore audio errors
    }
  }

  /**
   * Crisp analog latching switch relay click
   */
  public playSwitchClick(active: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(active ? 1180 : 760, t);
      osc.frequency.exponentialRampToValueAtTime(active ? 1680 : 420, t + 0.025);

      gain.gain.setValueAtTime(0.075, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.028);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.03);
    } catch {
      // Ignore
    }
  }

  /**
   * Sequencer pad trigger voice per channel index
   */
  public playSequencerPad(channelIdx: number, isHero: boolean = false): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const notes = [261.63, 329.63, 392.0, 493.88, 587.33]; // Cmaj9 studio voicings
      const baseFreq = notes[channelIdx % notes.length] * (isHero ? 1.5 : 1);

      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = isHero ? 'sawtooth' : 'triangle';
      sub.type = 'sine';

      osc.frequency.setValueAtTime(baseFreq, t);
      sub.frequency.setValueAtTime(baseFreq * 0.5, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isHero ? 3200 : 1800, t);
      filter.frequency.exponentialRampToValueAtTime(340, t + 0.16);
      filter.Q.setValueAtTime(4, t);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.17);

      osc.connect(filter);
      sub.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      sub.start(t);
      osc.stop(t + 0.18);
      sub.stop(t + 0.18);
    } catch {
      // Ignore
    }
  }

  /**
   * Patch bay jack plug/unplug thump
   */
  public playPatchJack(plugged: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      if (plugged) {
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(640, t + 0.065);
      } else {
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.065);
      }

      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    } catch {
      // Ignore
    }
  }

  /**
   * Auditions the current campaign telemetry as a lush analog synthesizer chord arpeggio!
   * Cutoff = Resonance Hook, Detune = Stereo Audience Width, Echo = Delay Tail, Drive = Budget.
   */
  public playCampaignAudition(knobs: SynthKnobs): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      // Minor 9th / Lush Studio Chord
      const chordFreqs = [220.0, 261.63, 329.63, 392.0, 493.88, 659.25];
      const stepTime = Math.max(0.055, 0.15 - (knobs.freqCadence / 100) * 0.085);
      const releaseDur = 0.55 + (knobs.delayTail / 100) * 1.1;
      const cutoff = 500 + (knobs.resonanceHook / 100) * 3800;
      const detuneCents = (knobs.stereoWidth / 100) * 18;
      const masterLevel = 0.055 + (knobs.driveBudget / 100) * 0.045;

      chordFreqs.forEach((freq, idx) => {
        const start = t + idx * stepTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc1.type = knobs.warmthCreator > 50 ? 'sawtooth' : 'triangle';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(freq, start);
        osc1.detune.setValueAtTime(detuneCents, start);
        osc2.frequency.setValueAtTime(freq * 0.5, start);
        osc2.detune.setValueAtTime(-detuneCents, start);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(cutoff, start);
        filter.frequency.exponentialRampToValueAtTime(280, start + releaseDur);
        filter.Q.setValueAtTime(2 + (knobs.resonanceHook / 100) * 7, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(masterLevel, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0006, start + releaseDur);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(start);
        osc2.start(start);
        osc1.stop(start + releaseDur + 0.05);
        osc2.stop(start + releaseDur + 0.05);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundEngine = new StudioSoundEngine();
