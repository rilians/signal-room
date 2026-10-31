import React from 'react';
import {
  ChannelStrip,
  ContentStem,
  LanguageCode,
  SynthKnobs,
} from '../types/campaign';
import { RackModule } from './RackModule';
import { Flame, Zap } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface ContentStemsDeckProps {
  stems: ContentStem[];
  channels: ChannelStrip[];
  knobs: SynthKnobs;
  selectedStemId: string | null;
  onSelectStem: (id: string) => void;
  onToggleBoostStem: (id: string) => void;
  lang: LanguageCode;
}

export const ContentStemsDeck: React.FC<ContentStemsDeckProps> = ({
  stems,
  channels,
  knobs,
  selectedStemId,
  onSelectStem,
  onToggleBoostStem,
  lang,
}) => {
  const activeStem =
    stems.find((s) => s.id === selectedStemId) || stems[0] || null;

  const hookMult = 0.8 + (knobs.resonanceHook / 100) * 0.45;
  const warmthMult = 0.82 + (knobs.warmthCreator / 100) * 0.42;

  return (
    <RackModule
      code="DAW-06"
      title={lang === 'id' ? 'CREATIVE STEMS & RETENTION MONITOR' : 'CREATIVE STEMS & RETENTION DECK'}
      subtitle={
        lang === 'id'
          ? 'Pantau performa tiap aset kreatif seperti multi-track audio stem & inspeksi kurva retensi detik-demi-detik'
          : 'Inspect individual creative assets like multi-track audio stems with second-by-second audience hold curves'
      }
      ledColor="#00F59B"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left 7 Cols: Multi-Track Stem List */}
        <div className="xl:col-span-7 flex flex-col gap-2">
          {stems.map((stem) => {
            const ch = channels.find((c) => c.id === stem.channelId);
            const isSelected = activeStem?.id === stem.id;
            const liveCtr = (
              stem.ctrBase *
              hookMult *
              (stem.boosted ? 1.12 : 1)
            ).toFixed(2);
            const liveRoas = (
              stem.roasBase *
              warmthMult *
              (stem.boosted ? 1.15 : 1)
            ).toFixed(2);
            const liveViewsK = Math.round(
              stem.viewsBaseK *
                (0.7 + (knobs.driveBudget / 100) * 0.65) *
                (stem.boosted ? 1.28 : 1)
            );

            return (
              <div
                key={stem.id}
                onClick={() => {
                  soundEngine.playSwitchClick(true);
                  onSelectStem(stem.id);
                }}
                className={`group rounded-lg p-2.5 border transition-all cursor-pointer flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#151A22] border-[#00F59B]/60 shadow-[0_0_16px_rgba(0,245,155,0.1)]'
                    : 'bg-[#0E1116] border-[#1F2530] hover:border-[#313A4B]'
                }`}
              >
                {/* Oversized Track Number + Full Title & Meta */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className={`font-display font-bold text-2xl sm:text-3xl leading-none tabular-nums shrink-0 ${
                      isSelected ? 'text-[#00F59B]' : 'text-[#4B5465]'
                    }`}
                  >
                    {stem.trackNum}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-xs sm:text-[13px] text-[#ECEAE4] truncate">
                        {stem.title}
                      </span>
                      <span
                        className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                          stem.status === 'HOT'
                            ? 'bg-[#00F59B]/15 text-[#00F59B]'
                            : stem.status === 'FATIGUE'
                            ? 'bg-[#FF2A6D]/20 text-[#FF2A6D]'
                            : 'bg-[#00E5FF]/15 text-[#00E5FF]'
                        }`}
                      >
                        {stem.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-[#7D8594]">
                      <span className="font-semibold" style={{ color: ch?.color }}>
                        {ch?.shortName}
                      </span>
                      <span>·</span>
                      <span className="truncate">{stem.format}</span>
                      <span>·</span>
                      <span className="shrink-0">{stem.durationSec}s</span>
                    </div>
                  </div>
                </div>

                {/* Live Stem Metrics + Boost Latch Button */}
                <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-[#ECEAE4] tabular-nums">
                      {liveViewsK >= 1000
                        ? `${(liveViewsK / 1000).toFixed(2)}M`
                        : `${liveViewsK}K`}{' '}
                      <span className="text-[9px] text-[#6D7582]">PLAYS</span>
                    </div>
                    <div className="text-[10px] text-[#00F59B] tabular-nums">
                      {liveCtr}% CTR ·{' '}
                      <span className="text-[#FFB800]">{liveRoas}x</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEngine.playSwitchClick(!stem.boosted);
                      onToggleBoostStem(stem.id);
                    }}
                    className={`px-2.5 py-1.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border transition-all ${
                      stem.boosted
                        ? 'bg-[#FF5E1A] text-[#08090B] border-[#FF5E1A] shadow-[0_0_12px_rgba(255,94,26,0.45)]'
                        : 'hw-btn text-[#9BA3B0] border-[#262E3B] hover:text-white'
                    }`}
                    title="Inject Paid Spark Gain into this Creative Stem"
                  >
                    <Zap className="w-3 h-3" />
                    <span>{stem.boosted ? 'BOOSTED' : 'BOOST'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 5 Cols: Deep Retention Envelope & Creative Telemetry Inspector */}
        {activeStem && (
          <div className="xl:col-span-5 crt-screen crt-scanlines rounded-xl p-4 border border-[#1E2B25] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#16241E]">
                <div>
                  <span className="font-mono text-[10px] tracking-[0.18em] text-[#00F59B] block">
                    STEM INSPECTOR // TRACK {activeStem.trackNum}
                  </span>
                  <h3 className="font-display font-bold text-base text-[#ECEAE4] mt-0.5">
                    {activeStem.title}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[9px] text-[#6F827A] block">
                    3s THUMBSTOP
                  </span>
                  <span className="font-display font-bold text-2xl leading-none vfd-green tabular-nums">
                    {activeStem.hookScore}%
                  </span>
                </div>
              </div>

              {/* Audience Retention Curve SVG */}
              <div className="my-4">
                <div className="flex items-center justify-between font-mono text-[10px] text-[#768A81] mb-1.5">
                  <span>AUDIENCE RETENTION ENVELOPE (0s → {activeStem.durationSec}s)</span>
                  <span className="text-[#ECEAE4]">
                    END HOLD: {activeStem.retentionCurve[activeStem.retentionCurve.length - 1]}%
                  </span>
                </div>

                <div className="bg-[#040706] rounded-lg p-3 border border-[#172620]">
                  <svg viewBox="0 0 320 120" className="w-full h-[125px] overflow-visible">
                    <defs>
                      <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={
                            activeStem.status === 'FATIGUE' ? '#FF2A6D' : '#00F59B'
                          }
                          stopOpacity="0.35"
                        />
                        <stop
                          offset="100%"
                          stopColor={
                            activeStem.status === 'FATIGUE' ? '#FF2A6D' : '#00F59B'
                          }
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Reference Lines (100%, 50%, 25%) */}
                    {[12, 60, 90].map((yLine, idx) => (
                      <line
                        key={idx}
                        x1="0"
                        y1={yLine}
                        x2="320"
                        y2={yLine}
                        stroke="rgba(0,245,155,0.1)"
                        strokeDasharray="3 3"
                      />
                    ))}

                    {/* 3-Second Critical Hook Gate */}
                    <line
                      x1="52"
                      y1="6"
                      x2="52"
                      y2="112"
                      stroke="rgba(255,184,0,0.5)"
                      strokeDasharray="2 2"
                    />
                    <text
                      x="56"
                      y="16"
                      fill="#FFB800"
                      fontSize="8"
                      fontFamily="JetBrains Mono"
                    >
                      3s HOOK GATE
                    </text>

                    {/* Area + Polyline */}
                    {(() => {
                      const pts = activeStem.retentionCurve.map((val, idx) => {
                        const x =
                          (idx / (activeStem.retentionCurve.length - 1)) * 312 + 4;
                        const y = 110 - (val / 100) * 96;
                        return `${x},${y}`;
                      });
                      const strokeCol =
                        activeStem.status === 'FATIGUE' ? '#FF2A6D' : '#00F59B';
                      return (
                        <>
                          <polygon
                            points={`4,112 ${pts.join(' ')} 316,112`}
                            fill="url(#retGrad)"
                          />
                          <polyline
                            points={pts.join(' ')}
                            fill="none"
                            stroke={strokeCol}
                            strokeWidth="2.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              filter: `drop-shadow(0 0 6px ${strokeCol}88)`,
                            }}
                          />
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>

            {/* Studio Signal Diagnostic Box */}
            <div className="bg-[#0B1210] rounded-lg p-3 border border-[#1B2D26]">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-[#FFB800] mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>
                  {lang === 'id' ? 'DIAGNOSTIK SINYAL KREATIF' : 'STUDIO SIGNAL DIAGNOSTIC'}
                </span>
              </div>
              <p className="text-xs text-[#C6D2CC] leading-relaxed">
                {activeStem.status === 'FATIGUE'
                  ? lang === 'id'
                    ? 'Terdeteksi penurunan tajam setelah detik ke-3 (Ad Fatigue). Hubungkan kabel TRIG-02 → MOD-B di Patch Bay untuk merotasi Hook alternatif secara otomatis.'
                    : 'Sharp post-3s retention drop-off detected (Ad Fatigue). Patch TRIG-02 → MOD-B in the Modular Patch Bay to auto-rotate Alternate Hook B.'
                  : activeStem.boosted
                  ? lang === 'id'
                    ? `Sinyal stem dalam kondisi puncak (${activeStem.hookScore}% thumbstop). Gain Spark aktif memberikan akselerasi ROAS maksimal pada kanal distribusi.`
                    : `Stem carrier locked at peak efficiency (${activeStem.hookScore}% thumbstop). Active Spark Boost is amplifying conversion velocity.`
                  : lang === 'id'
                  ? 'Kurva retensi stabil di atas rata-rata industri. Tekan tombol [BOOST] untuk menginjeksi alokasi paid amplification pada stem ini.'
                  : 'Retention sustain holds cleanly above benchmark. Engage [BOOST] to route additional paid amplification to this stem.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </RackModule>
  );
};
