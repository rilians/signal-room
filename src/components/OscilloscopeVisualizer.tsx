import React, { useEffect, useRef, useState } from 'react';
import {
  CampaignPatch,
  TelemetrySnapshot,
  VisualizerMode,
  LanguageCode,
} from '../types/campaign';
import { Activity, BarChart3, GitCommitHorizontal, Radar } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface OscilloscopeVisualizerProps {
  campaign: CampaignPatch;
  telemetry: TelemetrySnapshot;
  isPlaying: boolean;
  playheadDay: number;
  mode: VisualizerMode;
  onModeChange: (m: VisualizerMode) => void;
  onSelectStem?: (stemId: string) => void;
  selectedStemId?: string | null;
  lang: LanguageCode;
}

const FORMAT_BANDS = [
  { label: '9:16 REELS', base: 86, color: '#00F59B' },
  { label: 'SPARK ADS', base: 92, color: '#FF5E1A' },
  { label: 'CREATOR POV', base: 84, color: '#00F59B' },
  { label: 'YT SHORTS', base: 74, color: '#00E5FF' },
  { label: 'LIVE DROP', base: 79, color: '#FFB800' },
  { label: 'CAROUSEL', base: 63, color: '#00E5FF' },
  { label: 'AUDIO 3D', base: 68, color: '#FF2A6D' },
  { label: 'ECHO RETARGET', base: 81, color: '#FFB800' },
];

export const OscilloscopeVisualizer: React.FC<OscilloscopeVisualizerProps> = ({
  campaign,
  telemetry,
  isPlaying,
  playheadDay,
  mode,
  onModeChange,
  onSelectStem,
  selectedStemId,
  lang,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<number>(0);
  const [hoverXRatio, setHoverXRatio] = useState<number | null>(null);
  const [hoveredBandIdx, setHoveredBandIdx] = useState<number | null>(null);

  const { knobs, sequencer } = campaign;

  useEffect(() => {
    if (mode !== 'WAVEFORM') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId = 0;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (
        canvas.width !== Math.floor(rect.width * dpr) ||
        canvas.height !== Math.floor(rect.height * dpr)
      ) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      const W = rect.width;
      const H = rect.height;

      // Deep CRT phosphor black
      ctx.fillStyle = '#050807';
      ctx.fillRect(0, 0, W, H);

      // Studio Graticule Grid (14 cols x 6 rows)
      ctx.strokeStyle = 'rgba(0, 245, 155, 0.075)';
      ctx.lineWidth = 1;
      const cols = 14;
      const rows = 6;
      for (let i = 1; i < cols; i++) {
        const x = (W / cols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let j = 1; j < rows; j++) {
        const y = (H / rows) * j;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Center zero-axis line with studio tick subdivisions
      const midY = H * 0.5;
      ctx.strokeStyle = 'rgba(0, 245, 155, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(W, midY);
      ctx.stroke();

      for (let t = 0; t <= 56; t++) {
        const tx = (W / 56) * t;
        ctx.beginPath();
        ctx.moveTo(tx, midY - 3);
        ctx.lineTo(tx, midY + 3);
        ctx.stroke();
      }

      // Clipping ceiling warning line
      const clipCeilingY = H * 0.13;
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = telemetry.isClipping
        ? 'rgba(255, 42, 109, 0.65)'
        : 'rgba(255, 94, 26, 0.22)';
      ctx.beginPath();
      ctx.moveTo(0, clipCeilingY);
      ctx.lineTo(W, clipCeilingY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Advance phase
      const speed = isPlaying
        ? 0.022 + (campaign.tempoBpm - 90) * 0.00035
        : 0.003;
      phaseRef.current += speed;
      const phase = phaseRef.current;

      const ampReach = (0.16 + (knobs.driveBudget / 100) * 0.28) * H;
      const freqCycles = 2.2 + (knobs.freqCadence / 100) * 7.5;
      const harmonicSharpness = knobs.resonanceHook / 100;
      const warmthSmooth = knobs.warmthCreator / 100;
      const stereoSpread = (knobs.stereoWidth / 100) * 1.4;
      const echoStrength = knobs.delayTail / 100;

      // 1. Retargeting Echo Ghost Wave (Delay Tail)
      if (echoStrength > 0.08) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 184, 0, ${0.14 + echoStrength * 0.26})`;
        ctx.lineWidth = 1.5;
        for (let px = 0; px <= W; px += 2) {
          const u = px / W;
          const delayedU = u - echoStrength * 0.085;
          const base = Math.sin(delayedU * Math.PI * 2 * freqCycles - phase * 0.85);
          const harm =
            Math.sin(delayedU * Math.PI * 6 * freqCycles - phase * 1.3) *
            harmonicSharpness *
            0.35;
          const y =
            midY - (base + harm) * ampReach * (0.45 + echoStrength * 0.35);
          if (px === 0) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        ctx.stroke();
      }

      // 2. Secondary Trace: Engagement / Audience Stereo Modulation (Electric Cyan)
      ctx.beginPath();
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(0, 229, 255, 0.55)';
      ctx.shadowBlur = 8;
      for (let px = 0; px <= W; px += 2) {
        const u = px / W;
        const mod = Math.sin(
          u * Math.PI * 2 * (freqCycles * 0.75) - phase + stereoSpread
        );
        const sub =
          Math.cos(u * Math.PI * 4 * freqCycles - phase * 0.6) *
          (0.35 * warmthSmooth);
        const y = midY - (mod + sub) * (ampReach * 0.72);
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();

      // 3. Primary Carrier Wave: Reach + Viral Resonance + Sequencer Drop Spikes
      ctx.beginPath();
      ctx.strokeStyle = telemetry.isClipping ? '#FF2A6D' : '#00F59B';
      ctx.lineWidth = 2.6;
      ctx.shadowColor = telemetry.isClipping
        ? 'rgba(255, 42, 109, 0.7)'
        : 'rgba(0, 245, 155, 0.65)';
      ctx.shadowBlur = 12;

      for (let px = 0; px <= W; px += 1.5) {
        const u = px / W;
        const dayFloat = 1 + u * 27;

        let dropImpulse = 0;
        for (let i = 0; i < sequencer.length; i++) {
          const dist = Math.abs(dayFloat - sequencer[i].day);
          if (dist < 0.75) {
            const weight = sequencer[i].tier === 'HERO_DROP' ? 0.34 : 0.18;
            dropImpulse += (1 - dist / 0.75) * weight;
          }
        }

        const carrier = Math.sin(u * Math.PI * 2 * freqCycles - phase * 1.15);
        const thirdHarmonic =
          Math.sin(u * Math.PI * 6 * freqCycles - phase * 1.8) *
          (harmonicSharpness * 0.42);
        let rawSample = (carrier + thirdHarmonic) * (1 + dropImpulse * 0.55);

        if (telemetry.isClipping && Math.abs(rawSample) > 1.05) {
          rawSample = Math.sign(rawSample) * 1.08;
        }

        const y = Math.max(12, Math.min(H - 18, midY - rawSample * ampReach));
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 4. Bottom Calendar Sequencer Drop Impulse Markers (D01..D28)
      sequencer.forEach((slot) => {
        const sx = ((slot.day - 1) / 27) * (W - 24) + 12;
        const col =
          slot.tier === 'HERO_DROP'
            ? '#FF5E1A'
            : slot.tier === 'VIRAL_BURST'
            ? '#00F59B'
            : slot.tier === 'TEASER'
            ? '#00E5FF'
            : '#FF2A6D';
        const markerH = slot.tier === 'HERO_DROP' ? 12 : 7;
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, H - 2);
        ctx.lineTo(sx, H - 2 - markerH);
        ctx.stroke();
      });

      // 5. Sequencer Playhead Indicator Line
      const playheadX = ((playheadDay - 1) / 27) * (W - 24) + 12;
      ctx.strokeStyle = 'rgba(255, 94, 26, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, H);
      ctx.stroke();

      ctx.fillStyle = '#FF5E1A';
      ctx.beginPath();
      ctx.arc(playheadX, 10, 4, 0, Math.PI * 2);
      ctx.fill();

      // 6. Interactive Hover Crosshair
      if (hoverXRatio !== null) {
        const hx = hoverXRatio * W;
        ctx.strokeStyle = 'rgba(236, 234, 228, 0.5)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(hx, 0);
        ctx.lineTo(hx, H);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mode, campaign, telemetry, isPlaying, playheadDay, hoverXRatio, knobs, sequencer]);

  const hoveredDay =
    hoverXRatio !== null
      ? Math.min(28, Math.max(1, Math.round(1 + hoverXRatio * 27)))
      : null;
  const hoveredDrops = hoveredDay
    ? sequencer.filter((s) => s.day === hoveredDay)
    : [];

  // ADSR Funnel Geometry
  const attackX = 18 + (100 - knobs.resonanceHook) * 0.45;
  const peakY = 18 + (100 - knobs.driveBudget) * 0.28;
  const decayX = attackX + 42 + (100 - knobs.freqCadence) * 0.35;
  const sustainLevelY = 128 - (knobs.warmthCreator / 100) * 68;
  const sustainEndX = 245;
  const releaseEndX = sustainEndX + 35 + (knobs.delayTail / 100) * 95;

  return (
    <div className="module-faceplate relative rounded-xl border border-[#282E38] p-4 sm:p-5 flex flex-col h-full">
      <span className="rack-screw !absolute top-2.5 left-2.5 opacity-80" />
      <span className="rack-screw !absolute top-2.5 right-2.5 opacity-80" />
      <span className="rack-screw !absolute bottom-2.5 left-2.5 opacity-80" />
      <span className="rack-screw !absolute bottom-2.5 right-2.5 opacity-80" />

      {/* Header & 4-Mode CRT Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-[#232831] px-2">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{
              backgroundColor: telemetry.isClipping ? '#FF2A6D' : '#00F59B',
              boxShadow: `0 0 10px ${telemetry.isClipping ? '#FF2A6D' : '#00F59B'}`,
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#6D7582]">
                CRT-01 // PHOSPHOR MONITOR
              </span>
              <span className="text-[#363D49] text-[10px]">//</span>
              <h2 className="font-display font-bold text-xs sm:text-sm tracking-[0.14em] uppercase text-[#ECEAE4]">
                {mode === 'WAVEFORM' && 'LIVE SIGNAL OSCILLOSCOPE'}
                {mode === 'SPECTRUM' && '32-BAND FORMAT SPECTRUM FFT'}
                {mode === 'ADSR' && 'ADSR CAMPAIGN LIFECYCLE ENVELOPE'}
                {mode === 'RADAR' && 'XY VECTOR CREATIVE RADAR'}
              </h2>
            </div>
            <p className="text-[11px] text-[#7D8594] mt-0.5">
              {lang === 'id'
                ? 'Visualisasi gelombang performa kampanye real-time yang bereaksi langsung terhadap putaran knob & sequencer'
                : 'Real-time campaign signal telemetry responding instantaneously to rotary knobs & sequencer drops'}
            </p>
          </div>
        </div>

        {/* Tactile Interlocking Radio Push-Buttons */}
        <div className="flex items-center gap-1 bg-[#0C0E12] p-1 rounded-lg border border-[#222832]">
          {(
            [
              { id: 'WAVEFORM', label: 'OSC WAVE', icon: Activity },
              { id: 'SPECTRUM', label: 'FFT BARS', icon: BarChart3 },
              { id: 'ADSR', label: 'ADSR FUNNEL', icon: GitCommitHorizontal },
              { id: 'RADAR', label: 'XY RADAR', icon: Radar },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundEngine.playSwitchClick(true);
                  onModeChange(item.id);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono font-semibold tracking-wider uppercase transition-all ${
                  active
                    ? 'bg-[#00F59B]/15 text-[#00F59B] border border-[#00F59B]/45 shadow-[0_0_12px_rgba(0,245,155,0.18)]'
                    : 'text-[#848D9C] hover:text-[#ECEAE4] border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recessed CRT Screen Frame */}
      <div className="crt-screen crt-scanlines relative rounded-xl border border-[#1E2B25] overflow-hidden flex-1 min-h-[295px] flex flex-col">
        {/* MODE 1: LIVE OSCILLOSCOPE WAVEFORM */}
        {mode === 'WAVEFORM' && (
          <div
            className="relative w-full flex-1 min-h-[295px] cursor-crosshair"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setHoverXRatio(
                Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
              );
            }}
            onMouseLeave={() => setHoverXRatio(null)}
          >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

            {/* Top-left Oscilloscope Legend */}
            <div className="absolute top-3 left-3.5 flex flex-wrap items-center gap-3 pointer-events-none bg-[#050807]/85 px-2.5 py-1 rounded border border-[#1A2922]">
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#00F59B]">
                <span className="w-2.5 h-0.5 bg-[#00F59B]" /> CH-A: REACH CARRIER
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#00E5FF]">
                <span className="w-2.5 h-0.5 bg-[#00E5FF]" /> CH-B: ENGAGEMENT MOD
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#FFB800]">
                <span className="w-2.5 h-0.5 bg-[#FFB800]" /> DELAY: RETARGET ECHO
              </span>
            </div>

            {/* Top-right Live Timebase & Playhead Readout */}
            <div className="absolute top-3 right-3.5 flex items-center gap-2 pointer-events-none bg-[#050807]/85 px-2.5 py-1 rounded border border-[#1F2925] font-mono text-[10px]">
              <span className="text-[#7D8594]">PLAYHEAD:</span>
              <span className="text-[#FF5E1A] font-bold tabular-nums">
                NOV {String(playheadDay).padStart(2, '0')}
              </span>
              <span className="text-[#36423D]">|</span>
              <span className="text-[#00F59B] tabular-nums">
                {Math.round(2 + (knobs.freqCadence / 100) * 26)} Hz/WK
              </span>
            </div>

            {/* Interactive Hover Telemetry Readout */}
            {hoveredDay !== null ? (
              <div className="absolute bottom-4 left-3.5 right-3.5 sm:right-auto bg-[#090E0C]/95 border border-[#00F59B]/35 rounded-lg px-3 py-2 pointer-events-none flex flex-wrap items-center gap-4 font-mono text-[11px]">
                <div>
                  <span className="text-[#6F827A] mr-1.5">CURSOR:</span>
                  <span className="text-[#ECEAE4] font-bold">
                    NOV {String(hoveredDay).padStart(2, '0')}, 2026
                  </span>
                </div>
                <div>
                  <span className="text-[#6F827A] mr-1.5">EST. DAILY REACH:</span>
                  <span className="text-[#00F59B] font-bold tabular-nums">
                    {Math.round(
                      ((telemetry.impressionsM * 1000) / 28) *
                        (1 + hoveredDrops.length * 0.42)
                    ).toLocaleString('en-US')}
                    K
                  </span>
                </div>
                <div>
                  <span className="text-[#6F827A] mr-1.5">SCHEDULED DROPS:</span>
                  <span className="text-[#FF5E1A] font-bold">
                    {hoveredDrops.length > 0
                      ? hoveredDrops.map((d) => d.title).join(' + ')
                      : lang === 'id'
                      ? 'Sinyal Sustain Reguler'
                      : 'Ambient Sustain Carrier'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="absolute bottom-3.5 left-3.5 pointer-events-none font-mono text-[9px] text-[#5B7369] bg-[#050807]/75 px-2 py-0.5 rounded">
                {lang === 'id'
                  ? 'GARIS DETAK BAWAH = JADWAL PUBLIKASI SEQUENCER (ARAHKAN KURSOR UNTUK INSPEKSI HARIAN)'
                  : 'BOTTOM IMPULSE TICKS = SCHEDULED SEQUENCER DROPS (HOVER SCREEN FOR DAILY TELEMETRY)'}
              </div>
            )}
          </div>
        )}

        {/* MODE 2: 32-BAND FORMAT SPECTRUM ANALYZER */}
        {mode === 'SPECTRUM' && (
          <div className="relative w-full flex-1 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#768A81]">
              <span>FFT HARMONIC ANALYZER // CONTENT FORMAT EFFICIENCY</span>
              <span className="text-[#00F59B]">
                PEAK FORMAT: SPARK ADS ({(telemetry.blendedRoas * 1.18).toFixed(2)}x ROAS)
              </span>
            </div>

            <div className="flex-1 grid grid-cols-8 gap-2 sm:gap-3 items-end pt-4 pb-2 min-h-[210px]">
              {FORMAT_BANDS.map((band, idx) => {
                const knobBoost =
                  idx % 3 === 0
                    ? knobs.resonanceHook * 0.25
                    : idx % 3 === 1
                    ? knobs.warmthCreator * 0.25
                    : knobs.delayTail * 0.25;
                const rawScore = Math.min(
                  98,
                  Math.max(22, Math.round(band.base * 0.72 + knobBoost))
                );
                const segments = 16;
                const litSegments = Math.round((rawScore / 100) * segments);
                const isHovered = hoveredBandIdx === idx;

                return (
                  <div
                    key={band.label}
                    onMouseEnter={() => setHoveredBandIdx(idx)}
                    onMouseLeave={() => setHoveredBandIdx(null)}
                    className="h-full flex flex-col items-center justify-end group cursor-pointer"
                  >
                    <span className="font-mono text-[10px] font-bold tabular-nums mb-1 text-[#ECEAE4]">
                      {rawScore}%
                    </span>
                    <div className="w-full max-w-[44px] flex-1 flex flex-col-reverse gap-[3px] p-1 rounded bg-[#0A0F0D] border border-[#19241F] group-hover:border-[#00F59B]/50 transition-colors">
                      {Array.from({ length: segments }).map((_, sIdx) => {
                        const isLit = sIdx < litSegments;
                        const isPeakCap = sIdx === Math.min(segments - 1, litSegments);
                        let segColor = band.color;
                        if (sIdx >= 13) segColor = '#FF2A6D';
                        else if (sIdx >= 10) segColor = '#FFB800';

                        return (
                          <div
                            key={sIdx}
                            className="w-full flex-1 rounded-[1px] transition-all duration-150"
                            style={{
                              backgroundColor: isLit
                                ? segColor
                                : isPeakCap
                                ? '#ECEAE4'
                                : '#131C18',
                              boxShadow:
                                isLit && isHovered ? `0 0 8px ${segColor}` : 'none',
                              opacity: isLit || isPeakCap ? 1 : 0.45,
                            }}
                          />
                        );
                      })}
                    </div>
                    <span className="font-mono text-[9px] sm:text-[10px] tracking-wider text-center text-[#8B95A5] mt-2 truncate w-full">
                      {band.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#6F827A] border-t border-[#15221C] pt-2">
              <span>
                {hoveredBandIdx !== null
                  ? `${FORMAT_BANDS[hoveredBandIdx].label} — EST. CTR ${(
                      telemetry.blendedCtr *
                      (0.85 + (hoveredBandIdx % 3) * 0.16)
                    ).toFixed(2)}% · ROAS ${(
                      telemetry.blendedRoas *
                      (0.9 + (FORMAT_BANDS[hoveredBandIdx].base - 70) * 0.012)
                    ).toFixed(2)}x`
                  : lang === 'id'
                  ? 'Arahkan kursor ke spektrum bar untuk inspeksi rasio konversi tiap format kreatif'
                  : 'Hover any harmonic spectrum column to inspect format-specific CTR & ROAS yield'}
              </span>
              <span className="text-[#00E5FF]">RES: 24-BIT FLOAT</span>
            </div>
          </div>
        )}

        {/* MODE 3: ADSR CAMPAIGN LIFECYCLE FUNNEL ENVELOPE */}
        {mode === 'ADSR' && (
          <div className="relative w-full flex-1 p-4 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
              <span className="text-[#768A81]">
                SYNTH ENVELOPE GENERATOR // MARKETING FUNNEL VELOCITY CURVE
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[#00F59B]">A: HOOK LAUNCH</span>
                <span className="text-[#00E5FF]">D: COOLING</span>
                <span className="text-[#FFB800]">S: CREATOR TRUST</span>
                <span className="text-[#FF5E1A]">R: RETARGET TAIL</span>
              </div>
            </div>

            <div className="flex-1 w-full flex items-center justify-center my-1">
              <svg
                viewBox="0 0 400 165"
                className="w-full h-full max-h-[215px] overflow-visible"
              >
                <defs>
                  <linearGradient id="adsrFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F59B" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#00F59B" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {[attackX, decayX, sustainEndX, releaseEndX].map((xPos, idx) => (
                  <line
                    key={idx}
                    x1={xPos}
                    y1={12}
                    x2={xPos}
                    y2={148}
                    stroke="rgba(0,245,155,0.16)"
                    strokeDasharray="3 3"
                  />
                ))}

                <line
                  x1={14}
                  y1={148}
                  x2={388}
                  y2={148}
                  stroke="rgba(255,255,255,0.15)"
                />

                <path
                  d={`M 18 148 L ${attackX} ${peakY} L ${decayX} ${sustainLevelY} L ${sustainEndX} ${sustainLevelY} L ${releaseEndX} 148 Z`}
                  fill="url(#adsrFill)"
                />

                <path
                  d={`M 18 148 L ${attackX} ${peakY} L ${decayX} ${sustainLevelY} L ${sustainEndX} ${sustainLevelY} L ${releaseEndX} 148`}
                  fill="none"
                  stroke="#00F59B"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0,245,155,0.65))' }}
                />

                {[
                  {
                    x: attackX,
                    y: peakY,
                    color: '#00F59B',
                    tag: `PEAK ${knobs.driveBudget}%`,
                  },
                  {
                    x: decayX,
                    y: sustainLevelY,
                    color: '#00E5FF',
                    tag: `HOLD ${knobs.warmthCreator}%`,
                  },
                  { x: sustainEndX, y: sustainLevelY, color: '#FFB800', tag: 'SUSTAIN' },
                  {
                    x: releaseEndX,
                    y: 148,
                    color: '#FF5E1A',
                    tag: `+${Math.round(1 + (knobs.delayTail / 100) * 29)}d TAIL`,
                  },
                ].map((pt, i) => (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="5"
                      fill="#080B0A"
                      stroke={pt.color}
                      strokeWidth="2.5"
                    />
                    <text
                      x={pt.x}
                      y={Math.max(12, pt.y - 10)}
                      textAnchor="middle"
                      fill={pt.color}
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {pt.tag}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#15221C] font-mono text-[10px]">
              <div>
                <span className="text-[#6F827A] block">ATTACK (HOOK)</span>
                <span className="text-[#00F59B] font-bold">
                  {knobs.resonanceHook}% VELOCITY
                </span>
              </div>
              <div>
                <span className="text-[#6F827A] block">DECAY (CADENCE)</span>
                <span className="text-[#00E5FF] font-bold">
                  {Math.round(2 + (knobs.freqCadence / 100) * 26)} DROPS/WK
                </span>
              </div>
              <div>
                <span className="text-[#6F827A] block">SUSTAIN (TRUST)</span>
                <span className="text-[#FFB800] font-bold">
                  {knobs.warmthCreator}% SEEDING
                </span>
              </div>
              <div>
                <span className="text-[#6F827A] block">RELEASE (ECHO)</span>
                <span className="text-[#FF5E1A] font-bold">
                  {Math.round(1 + (knobs.delayTail / 100) * 29)} DAYS WINDOW
                </span>
              </div>
            </div>
          </div>
        )}

        {/* MODE 4: XY CREATIVE VECTOR RADAR */}
        {mode === 'RADAR' && (
          <div className="relative w-full flex-1 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#768A81]">
              <span>XY VECTOR PHASE MATRIX // HOOK SCORE (X) vs ROAS YIELD (Y)</span>
              <span className="text-[#00E5FF]">CLICK NODE TO INSPECT STEM</span>
            </div>

            <div className="relative flex-1 my-2 border border-[#192923] rounded-lg bg-[#050908] overflow-hidden min-h-[200px]">
              <svg viewBox="0 0 400 190" className="w-full h-full">
                <line
                  x1="200"
                  y1="0"
                  x2="200"
                  y2="190"
                  stroke="rgba(0,245,155,0.15)"
                />
                <line
                  x1="0"
                  y1="95"
                  x2="400"
                  y2="95"
                  stroke="rgba(0,245,155,0.15)"
                />
                <circle
                  cx="200"
                  cy="95"
                  r="38"
                  fill="none"
                  stroke="rgba(0,245,155,0.1)"
                />
                <circle
                  cx="200"
                  cy="95"
                  r="76"
                  fill="none"
                  stroke="rgba(0,245,155,0.1)"
                />
                <circle
                  cx="200"
                  cy="95"
                  r="120"
                  fill="none"
                  stroke="rgba(0,229,255,0.08)"
                />

                <text
                  x="10"
                  y="16"
                  fill="#5D746B"
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                >
                  NICHE CONVERTERS
                </text>
                <text
                  x="305"
                  y="16"
                  fill="#00F59B"
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                >
                  UNICORN WINNERS ★
                </text>
                <text
                  x="10"
                  y="182"
                  fill="#FF2A6D"
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                >
                  FATIGUE / RETIRE
                </text>
                <text
                  x="305"
                  y="182"
                  fill="#FFB800"
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                >
                  VIRAL AWARENESS
                </text>

                {campaign.stems.map((stem) => {
                  const x = 35 + ((stem.hookScore - 50) / 50) * 335;
                  const effectiveRoas =
                    stem.roasBase *
                    (0.82 + (knobs.warmthCreator / 100) * 0.4) *
                    (stem.boosted ? 1.12 : 1);
                  const y =
                    162 -
                    Math.min(1, Math.max(0.08, (effectiveRoas - 2) / 5.4)) * 124;
                  const r = 6 + Math.min(8, stem.viewsBaseK / 220);
                  const isSel = selectedStemId === stem.id;
                  const nodeColor =
                    stem.status === 'FATIGUE'
                      ? '#FF2A6D'
                      : stem.boosted
                      ? '#00F59B'
                      : '#00E5FF';

                  return (
                    <g
                      key={stem.id}
                      onClick={() => {
                        soundEngine.playSwitchClick(true);
                        onSelectStem?.(stem.id);
                      }}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={r + (isSel ? 6 : 3)}
                        fill={nodeColor}
                        opacity={isSel ? 0.28 : 0.14}
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={r}
                        fill="#080D0B"
                        stroke={nodeColor}
                        strokeWidth={isSel ? 2.8 : 1.8}
                      />
                      <text
                        x={x}
                        y={y + 3}
                        textAnchor="middle"
                        fill={nodeColor}
                        fontSize="7.5"
                        fontWeight="bold"
                        fontFamily="JetBrains Mono"
                      >
                        {stem.trackNum}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#6F827A]">
              <span>X-AXIS: 3-SECOND HOOK RETENTION (50% → 100%)</span>
              <span>Y-AXIS: STEM ATTRIBUTED ROAS (2.0x → 7.0x)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
