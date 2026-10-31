import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LanguageCode, PatchCable } from '../types/campaign';
import { PATCH_SOURCES, PATCH_TARGETS } from '../data/initialCampaigns';
import { RackModule } from './RackModule';
import { Cable, Unplug } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface PatchBayMatrixProps {
  patches: PatchCable[];
  onConnectPatch: (sourceId: string, targetId: string) => void;
  onRemovePatch: (patchId: string) => void;
  lang: LanguageCode;
}

interface Point {
  x: number;
  y: number;
}

export const PatchBayMatrix: React.FC<PatchBayMatrixProps> = ({
  patches,
  onConnectPatch,
  onRemovePatch,
  lang,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const jackRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [armedSourceId, setArmedSourceId] = useState<string | null>(null);
  const [coords, setCoords] = useState<Record<string, Point>>({});

  const measureJacks = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const next: Record<string, Point> = {};

    Object.entries(jackRefs.current).forEach(([key, el]) => {
      if (el) {
        const r = el.getBoundingClientRect();
        next[key] = {
          x: r.left - cRect.left + r.width / 2,
          y: r.top - cRect.top + r.height / 2,
        };
      }
    });
    setCoords(next);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(measureJacks);
    const t1 = setTimeout(measureJacks, 180);
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => measureJacks()).catch(() => {});
    }
    const ro = new ResizeObserver(() => measureJacks());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', measureJacks);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      ro.disconnect();
      window.removeEventListener('resize', measureJacks);
    };
  }, [measureJacks, patches, lang]);

  const handleSourceClick = (srcId: string) => {
    soundEngine.playSwitchClick(armedSourceId !== srcId);
    setArmedSourceId((prev) => (prev === srcId ? null : srcId));
  };

  const handleTargetClick = (dstId: string) => {
    if (armedSourceId) {
      const existing = patches.find(
        (p) => p.sourceId === armedSourceId && p.targetId === dstId
      );
      if (existing) {
        soundEngine.playPatchJack(false);
        onRemovePatch(existing.id);
      } else {
        soundEngine.playPatchJack(true);
        onConnectPatch(armedSourceId, dstId);
      }
      setArmedSourceId(null);
      return;
    }

    const connected = patches.find((p) => p.targetId === dstId);
    if (connected) {
      soundEngine.playPatchJack(false);
      onRemovePatch(connected.id);
    }
  };

  return (
    <RackModule
      code="CV-PATCH"
      title={lang === 'id' ? 'MODULAR AUTOMATION PATCH BAY' : 'EURORACK AUTOMATION PATCH BAY'}
      subtitle={
        lang === 'id'
          ? 'Klik soket TRIGGER (kiri) lalu hubungkan ke soket ACTION (kanan) untuk menyalakan aturan otomasi'
          : 'Click a TRIGGER jack (left) then patch into an ACTION jack (right) to wire live campaign automation'
      }
      ledColor="#FFB800"
      className="h-full"
      rightSlot={
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#FFB800] bg-[#FFB800]/10 px-2.5 py-1 rounded border border-[#FFB800]/30">
          <Cable className="w-3.5 h-3.5" />
          <span>{patches.length} CABLES</span>
        </div>
      }
    >
      <div ref={containerRef} className="relative flex-1 flex flex-col justify-between">
        {/* Center Etched Conduit Strip */}
        <div
          aria-hidden="true"
          className="hidden sm:flex absolute top-7 bottom-12 left-1/2 -translate-x-1/2 w-8 bg-[#090B0E] border-x border-[#1B2029] rounded flex-col items-center justify-around py-4 pointer-events-none opacity-80"
        >
          <span className="font-mono text-[8px] text-[#3B4352] rotate-90 tracking-widest">
            CV-BUS
          </span>
          <span className="w-1 h-1 rounded-full bg-[#262D3A]" />
          <span className="font-mono text-[8px] text-[#3B4352] rotate-90 tracking-widest">
            PATCH
          </span>
        </div>

        {/* Hanging SVG Catenary Patch Cables Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
          {patches.map((cable, idx) => {
            const p1 = coords[cable.sourceId];
            const p2 = coords[cable.targetId];
            if (!p1 || !p2) return null;

            const midX = (p1.x + p2.x) / 2;
            const sag = 38 + (idx % 3) * 16;
            const ctrlY = Math.max(p1.y, p2.y) + sag;
            const pathD = `M ${p1.x} ${p1.y} Q ${midX} ${ctrlY} ${p2.x} ${p2.y}`;

            return (
              <g key={cable.id}>
                <path
                  d={pathD}
                  fill="none"
                  stroke="rgba(0,0,0,0.8)"
                  strokeWidth="7.5"
                  strokeLinecap="round"
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke={cable.color}
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  opacity="0.94"
                  style={{ filter: `drop-shadow(0 0 8px ${cable.color}88)` }}
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke="rgba(255,255,255,0.38)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <circle
                  cx={p1.x}
                  cy={p1.y}
                  r="6"
                  fill="#0B0D10"
                  stroke={cable.color}
                  strokeWidth="2.5"
                />
                <circle
                  cx={p2.x}
                  cy={p2.y}
                  r="6"
                  fill="#0B0D10"
                  stroke={cable.color}
                  strokeWidth="2.5"
                />
              </g>
            );
          })}
        </svg>

        {/* Left Sources & Right Targets Grid */}
        <div className="grid grid-cols-2 gap-6 sm:gap-12 relative z-10">
          {/* LEFT: SIGNAL TRIGGERS (OUTPUTS) */}
          <div className="flex flex-col gap-2.5">
            <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#7D8594] pb-1 border-b border-[#202631]">
              TRIGGERS [OUT]
            </div>
            {PATCH_SOURCES.map((src) => {
              const isArmed = armedSourceId === src.id;
              const pluggedCable = patches.find((p) => p.sourceId === src.id);
              return (
                <div
                  key={src.id}
                  onClick={() => handleSourceClick(src.id)}
                  className={`rounded-lg p-2.5 border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    isArmed
                      ? 'bg-[#00F59B]/12 border-[#00F59B] shadow-[0_0_14px_rgba(0,245,155,0.2)]'
                      : 'bg-[#0D1015] border-[#1F2530] hover:border-[#343E4F]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[9px] text-[#00F59B] font-bold shrink-0">
                        {src.code}
                      </span>
                      <span className="font-mono text-[10px] xl:text-[11px] font-bold text-[#ECEAE4] truncate">
                        {src.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#7D8594] leading-snug mt-0.5 line-clamp-1">
                      {lang === 'id' ? src.descId : src.descEn}
                    </p>
                  </div>

                  {/* 3.5mm Hardware Patch Socket */}
                  <button
                    ref={(el) => {
                      jackRefs.current[src.id] = el;
                    }}
                    type="button"
                    aria-label={`Trigger Jack ${src.label}`}
                    className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border-2 transition-transform ${
                      isArmed ? 'scale-110 animate-pulse' : ''
                    }`}
                    style={{
                      background:
                        'radial-gradient(circle, #040507 42%, #2B3340 60%, #171B22 100%)',
                      borderColor: isArmed
                        ? '#00F59B'
                        : pluggedCable
                        ? pluggedCable.color
                        : '#4A5464',
                    }}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#020304] border border-[#1E242E]" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* RIGHT: AUTOMATION DESTINATIONS (INPUTS) */}
          <div className="flex flex-col gap-2.5">
            <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#7D8594] pb-1 border-b border-[#202631] text-right">
              ACTIONS [IN]
            </div>
            {PATCH_TARGETS.map((dst) => {
              const pluggedCable = patches.find((p) => p.targetId === dst.id);
              return (
                <div
                  key={dst.id}
                  onClick={() => handleTargetClick(dst.id)}
                  className={`rounded-lg p-2.5 border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    armedSourceId
                      ? 'bg-[#131922] border-[#FFB800]/60 hover:border-[#00F59B]'
                      : 'bg-[#0D1015] border-[#1F2530] hover:border-[#343E4F]'
                  }`}
                >
                  {/* 3.5mm Hardware Patch Socket */}
                  <button
                    ref={(el) => {
                      jackRefs.current[dst.id] = el;
                    }}
                    type="button"
                    aria-label={`Destination Jack ${dst.label}`}
                    className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center border-2 transition-transform"
                    style={{
                      background:
                        'radial-gradient(circle, #040507 42%, #2B3340 60%, #171B22 100%)',
                      borderColor: armedSourceId
                        ? '#FFB800'
                        : pluggedCable
                        ? pluggedCable.color
                        : '#4A5464',
                    }}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#020304] border border-[#1E242E]" />
                  </button>

                  <div className="min-w-0 text-right flex-1">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono text-[10px] xl:text-[11px] font-bold text-[#ECEAE4] truncate">
                        {dst.label}
                      </span>
                      <span className="font-mono text-[9px] text-[#FFB800] font-bold shrink-0">
                        {dst.code}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#7D8594] leading-snug mt-0.5 line-clamp-1">
                      {lang === 'id' ? dst.descId : dst.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Patch Cable Tags Below for Quick Unplug */}
        <div className="mt-3.5 pt-2.5 border-t border-[#202631] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {patches.length === 0 ? (
              <span className="font-mono text-[10px] text-[#6D7582]">
                {lang === 'id'
                  ? 'Belum ada kabel terpasang — klik soket TRIG lalu klik soket MOD.'
                  : 'No patch cables routed — select a TRIG jack then click a MOD jack.'}
              </span>
            ) : (
              patches.map((p) => {
                const s = PATCH_SOURCES.find((x) => x.id === p.sourceId);
                const t = PATCH_TARGETS.find((x) => x.id === p.targetId);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playPatchJack(false);
                      onRemovePatch(p.id);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded font-mono text-[10px] bg-[#13171E] border hover:brightness-125 transition-all"
                    style={{
                      borderColor: `${p.color}66`,
                      color: p.color,
                    }}
                    title="Click to unplug cable"
                  >
                    <span>
                      {s?.code} → {t?.code}
                    </span>
                    <Unplug className="w-3 h-3 opacity-80" />
                  </button>
                );
              })
            )}
          </div>

          {armedSourceId && (
            <span className="font-mono text-[10px] text-[#00F59B] animate-pulse">
              {lang === 'id'
                ? '● KABEL SIAP — PILIH SOKET MOD DI KANAN...'
                : '● CABLE ARMED — CLICK DESTINATION JACK ON RIGHT...'}
            </span>
          )}
        </div>
      </div>
    </RackModule>
  );
};
