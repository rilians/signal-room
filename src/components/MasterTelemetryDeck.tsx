import React from 'react';
import { TelemetrySnapshot, LanguageCode } from '../types/campaign';
import { AlertTriangle, BookmarkCheck, RotateCcw } from 'lucide-react';

interface MasterTelemetryDeckProps {
  telemetry: TelemetrySnapshot;
  snapshotA: TelemetrySnapshot | null;
  onCaptureSnapshot: () => void;
  onClearSnapshot: () => void;
  lang: LanguageCode;
}

export const MasterTelemetryDeck: React.FC<MasterTelemetryDeckProps> = ({
  telemetry,
  snapshotA,
  onCaptureSnapshot,
  onClearSnapshot,
  lang,
}) => {
  const renderDelta = (current: number, base: number | undefined, invertGood = false) => {
    if (base === undefined || base === 0) return null;
    const pct = ((current - base) / Math.abs(base)) * 100;
    if (Math.abs(pct) < 0.2) {
      return (
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#181D24] text-[#7D8594]">
          0.0% A/B
        </span>
      );
    }
    const isPositiveGood = invertGood ? pct < 0 : pct > 0;
    return (
      <span
        className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border tabular-nums ${
          isPositiveGood
            ? 'bg-[#00F59B]/10 text-[#00F59B] border-[#00F59B]/30'
            : 'bg-[#FF2A6D]/10 text-[#FF2A6D] border-[#FF2A6D]/30'
        }`}
      >
        {pct > 0 ? '+' : ''}
        {pct.toFixed(1)}% vs A
      </span>
    );
  };

  return (
    <div className="module-faceplate relative rounded-xl border border-[#282E38] p-3.5 sm:p-4">
      <span className="rack-screw !absolute top-2.5 left-2.5 opacity-80" />
      <span className="rack-screw !absolute top-2.5 right-2.5 opacity-80" />
      <span className="rack-screw !absolute bottom-2.5 left-2.5 opacity-80" />
      <span className="rack-screw !absolute bottom-2.5 right-2.5 opacity-80" />

      {/* Top Strip: Master Telemetry Header & A/B Snapshot Switch */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#232831] px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00F59B] shadow-[0_0_8px_#00F59B]" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#7D8594]">
              VFD-MASTER // LIVE TELEMETRY BUS
            </span>
          </div>

          {telemetry.isClipping && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#FF2A6D]/15 border border-[#FF2A6D]/50 text-[#FF2A6D] animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
                {lang === 'id'
                  ? `CLIPPING ${telemetry.thdClippingPct}% — AUDIENCE FATIGUE! NAIKKAN WARMTH / KURANGI FREQ`
                  : `SIGNAL CLIP ${telemetry.thdClippingPct}% — AD FATIGUE! BOOST WARMTH OR TRIM FREQ`}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCaptureSnapshot}
            className="hw-btn flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider text-[#ECEAE4]"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>
              {snapshotA
                ? lang === 'id'
                  ? 'UPDATE SNAPSHOT [A]'
                  : 'OVERWRITE SNAP [A]'
                : lang === 'id'
                ? 'KUNCI SNAPSHOT [A]'
                : 'CAPTURE SNAP [A]'}
            </span>
          </button>
          {snapshotA && (
            <button
              type="button"
              onClick={onClearSnapshot}
              className="hw-btn flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider text-[#9BA3B0] hover:text-white"
              title="Clear A/B Comparison"
            >
              <RotateCcw className="w-3 h-3" />
              <span>CLR</span>
            </button>
          )}
        </div>
      </div>

      {/* Oversized Numbers VFD Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 px-1">
        {/* 1. PROJECTED IMPRESSIONS */}
        <div className="crt-screen crt-scanlines rounded-lg p-3.5 border border-[#1B2621] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#768A81]">
              01 // IMPRESSIONS
            </span>
            {renderDelta(telemetry.impressionsM, snapshotA?.impressionsM)}
          </div>
          <div className="my-2 flex items-baseline gap-1">
            <span className="font-display font-bold text-4xl sm:text-5xl xl:text-[52px] leading-none tracking-tight tabular-nums vfd-green">
              {telemetry.impressionsM.toFixed(1)}
            </span>
            <span className="font-display font-bold text-xl text-[#00F59B]/75">M</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#6F827A] pt-1.5 border-t border-[#14201B]">
            <span>{lang === 'id' ? 'JANGKAUAN UNIK' : 'UNIQUE REACH'}</span>
            <span className="text-[#ECEAE4] tabular-nums">{telemetry.reachUniqueM}M</span>
          </div>
        </div>

        {/* 2. BLENDED ROAS MULTIPLIER */}
        <div className="crt-screen crt-scanlines rounded-lg p-3.5 border border-[#292018] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#937B6A]">
              02 // MASTER ROAS
            </span>
            {renderDelta(telemetry.blendedRoas, snapshotA?.blendedRoas)}
          </div>
          <div className="my-2 flex items-baseline gap-1">
            <span className="font-display font-bold text-4xl sm:text-5xl xl:text-[52px] leading-none tracking-tight tabular-nums vfd-amber">
              {telemetry.blendedRoas.toFixed(2)}
            </span>
            <span className="font-display font-bold text-xl text-[#FF5E1A]/80">x</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8A7668] pt-1.5 border-t border-[#221A14]">
            <span>PATCH AUTOMATION</span>
            <span className="text-[#FFB800] tabular-nums">+{telemetry.activePatchBonusPct}% GAIN</span>
          </div>
        </div>

        {/* 3. EST. CONVERSIONS */}
        <div className="crt-screen crt-scanlines rounded-lg p-3.5 border border-[#17252B] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#6D8794]">
              03 // CONVERSIONS
            </span>
            {renderDelta(telemetry.conversions, snapshotA?.conversions)}
          </div>
          <div className="my-2 flex items-baseline gap-1">
            <span className="font-display font-bold text-4xl sm:text-5xl xl:text-[52px] leading-none tracking-tight tabular-nums vfd-cyan">
              {telemetry.conversions >= 10000
                ? `${(telemetry.conversions / 1000).toFixed(1)}K`
                : telemetry.conversions.toLocaleString('en-US')}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#6D8794] pt-1.5 border-t border-[#132026]">
            <span>BLENDED CTR / CPA</span>
            <span className="text-[#ECEAE4] tabular-nums">
              {telemetry.blendedCtr}% · ${telemetry.cpaUsd}
            </span>
          </div>
        </div>

        {/* 4. ACTIVE DRIVE BUDGET */}
        <div className="crt-screen crt-scanlines rounded-lg p-3.5 border border-[#282315] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#918565]">
              04 // TOTAL POWER
            </span>
            {renderDelta(telemetry.budgetUsd, snapshotA?.budgetUsd, true)}
          </div>
          <div className="my-2 flex items-baseline gap-0.5">
            <span className="font-display font-bold text-2xl text-[#FFB800]/80 mr-0.5">$</span>
            <span className="font-display font-bold text-4xl sm:text-5xl xl:text-[52px] leading-none tracking-tight tabular-nums vfd-gold">
              {Math.round(telemetry.budgetUsd / 1000)}
            </span>
            <span className="font-display font-bold text-xl text-[#FFB800]/80">K</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8A7F62] pt-1.5 border-t border-[#221E12]">
            <span>{lang === 'id' ? 'BURN / HARI' : 'BURN / DAY'}</span>
            <span className="text-[#ECEAE4] tabular-nums">
              ${telemetry.dailyBurnUsd.toLocaleString('en-US')}/d
            </span>
          </div>
        </div>

        {/* 5. SIGNAL-TO-NOISE HEALTH & THD */}
        <div className="col-span-2 lg:col-span-1 crt-screen crt-scanlines rounded-lg p-3.5 border border-[#241A24] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#8E748C]">
              05 // SIGNAL SNR
            </span>
            <span
              className={`font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                telemetry.isClipping
                  ? 'bg-[#FF2A6D]/20 text-[#FF2A6D]'
                  : 'bg-[#00F59B]/15 text-[#00F59B]'
              }`}
            >
              {telemetry.isClipping ? 'CLIPPING' : 'CLEAN LOCK'}
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1">
            <span
              className={`font-display font-bold text-4xl sm:text-5xl xl:text-[52px] leading-none tracking-tight tabular-nums ${
                telemetry.isClipping ? 'vfd-magenta' : 'vfd-green'
              }`}
            >
              {telemetry.snrDb.toFixed(1)}
            </span>
            <span className="font-display font-bold text-lg text-[#9BA3B0]">dB</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#847286] pt-1.5 border-t border-[#211722]">
            <span>FATIGUE THD</span>
            <span
              className={`tabular-nums font-semibold ${
                telemetry.isClipping ? 'text-[#FF2A6D]' : 'text-[#00F59B]'
              }`}
            >
              {telemetry.thdClippingPct}% · {telemetry.scheduledDropsCount} DROPS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
