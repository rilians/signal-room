import React, { useState } from 'react';
import {
  ChannelStrip,
  DropTier,
  LanguageCode,
  SequencerSlot,
} from '../types/campaign';
import { RackModule } from './RackModule';
import {
  CalendarDays,
  Grid3X3,
  Plus,
  Sparkles,
  Trash2,
  Clock,
  DollarSign,
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface PublicationSequencerProps {
  monthLabel: string;
  channels: ChannelStrip[];
  slots: SequencerSlot[];
  playheadDay: number;
  onJumpPlayhead: (day: number) => void;
  onAddSlot: (slot: Omit<SequencerSlot, 'id'>) => SequencerSlot;
  onUpdateSlot: (id: string, patch: Partial<SequencerSlot>) => void;
  onDeleteSlot: (id: string) => void;
  onApplyPattern: (pattern: 'CRESCENDO' | 'FOUR_FLOOR' | 'WEEKEND') => void;
  lang: LanguageCode;
}

export const TIER_META: Record<
  DropTier,
  { label: string; short: string; color: string; defaultBoost: number }
> = {
  HERO_DROP: {
    label: 'HERO DROP',
    short: 'HERO',
    color: '#FF5E1A',
    defaultBoost: 4500,
  },
  VIRAL_BURST: {
    label: 'VIRAL BURST',
    short: 'VIRAL',
    color: '#00F59B',
    defaultBoost: 2400,
  },
  TEASER: {
    label: 'TEASER PULSE',
    short: 'TEASE',
    color: '#00E5FF',
    defaultBoost: 1200,
  },
  ECHO_RETARGET: {
    label: 'ECHO RETARGET',
    short: 'ECHO',
    color: '#FF2A6D',
    defaultBoost: 2000,
  },
};

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export const PublicationSequencer: React.FC<PublicationSequencerProps> = ({
  monthLabel,
  channels,
  slots,
  playheadDay,
  onJumpPlayhead,
  onAddSlot,
  onUpdateSlot,
  onDeleteSlot,
  onApplyPattern,
  lang,
}) => {
  const [viewMode, setViewMode] = useState<'SEQUENCER' | 'CALENDAR'>('SEQUENCER');
  const [bank, setBank] = useState<'BANK_A' | 'BANK_B' | 'ALL_28'>('BANK_A');
  const [activeBrush, setActiveBrush] = useState<DropTier>('HERO_DROP');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
    slots[0]?.id ?? null
  );

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || null;

  const daysRange =
    bank === 'BANK_A'
      ? Array.from({ length: 14 }, (_, i) => i + 1)
      : bank === 'BANK_B'
      ? Array.from({ length: 14 }, (_, i) => i + 15)
      : Array.from({ length: 28 }, (_, i) => i + 1);

  const handlePadClick = (
    channel: ChannelStrip,
    channelIdx: number,
    day: number,
    e: React.MouseEvent
  ) => {
    const existing = slots.find(
      (s) => s.channelId === channel.id && s.day === day
    );

    if (existing) {
      if (e.shiftKey) {
        soundEngine.playSwitchClick(false);
        onDeleteSlot(existing.id);
        if (selectedSlotId === existing.id) setSelectedSlotId(null);
      } else {
        soundEngine.playSequencerPad(channelIdx, existing.tier === 'HERO_DROP');
        setSelectedSlotId(existing.id);
        onJumpPlayhead(day);
      }
      return;
    }

    // Create new publication slot on this pad!
    const meta = TIER_META[activeBrush];
    soundEngine.playSequencerPad(channelIdx, activeBrush === 'HERO_DROP');
    const created = onAddSlot({
      day,
      channelId: channel.id,
      tier: activeBrush,
      title: `${channel.shortName} ${meta.label} D${String(day).padStart(2, '0')}`,
      timeWib: day % 7 === 0 || day % 7 === 6 ? '16:00' : '19:30',
      budgetBoostUsd: meta.defaultBoost,
      format:
        channel.id === 'x_threads'
          ? 'Thread Hook'
          : channel.id === 'spotify_drop'
          ? 'Spatial Audio'
          : '9:16 Vertical',
    });
    setSelectedSlotId(created.id);
    onJumpPlayhead(day);
  };

  return (
    <RackModule
      code="SEQ-28"
      title={
        lang === 'id'
          ? `PUBLICATION STEP SEQUENCER // ${monthLabel}`
          : `PUBLICATION STEP SEQUENCER // ${monthLabel}`
      }
      subtitle={
        lang === 'id'
          ? 'Klik pad kosong untuk menjadwalkan konten, klik pad menyala untuk edit detail jam & boost (Shift+Klik untuk hapus cepat)'
          : 'Click any unlit pad to arm a content drop, click lit pads to inspect/edit timing & boost (Shift+Click to clear)'
      }
      ledColor="#FF5E1A"
      ledPulse
      rightSlot={
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Sequencer vs Calendar Toggle */}
          <div className="flex items-center bg-[#0B0D11] p-0.5 rounded-lg border border-[#232934]">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSwitchClick(true);
                setViewMode('SEQUENCER');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold uppercase ${
                viewMode === 'SEQUENCER'
                  ? 'bg-[#FF5E1A]/20 text-[#FF5E1A] border border-[#FF5E1A]/40'
                  : 'text-[#848D9C] hover:text-white'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>STEP PADS</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSwitchClick(true);
                setViewMode('CALENDAR');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold uppercase ${
                viewMode === 'CALENDAR'
                  ? 'bg-[#00F59B]/20 text-[#00F59B] border border-[#00F59B]/40'
                  : 'text-[#848D9C] hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>CALENDAR</span>
            </button>
          </div>
        </div>
      }
    >
      {/* Top Toolbar: Drop Brush Selector + Bank Switcher + Auto-Quantize Rhythms */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 bg-[#0D1014] p-2.5 rounded-lg border border-[#1E242E]">
        {/* Pad Brush Tier Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#6D7582] mr-1">
            PAD BRUSH:
          </span>
          {(Object.keys(TIER_META) as DropTier[]).map((tierKey) => {
            const meta = TIER_META[tierKey];
            const isSelected = activeBrush === tierKey;
            return (
              <button
                key={tierKey}
                type="button"
                onClick={() => {
                  soundEngine.playSwitchClick(true);
                  setActiveBrush(tierKey);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all border ${
                  isSelected
                    ? 'text-[#08090B]'
                    : 'bg-[#151920] text-[#9BA3B0] border-[#252C37] hover:text-white'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: meta.color,
                        borderColor: meta.color,
                        boxShadow: `0 0 12px ${meta.color}66`,
                      }
                    : undefined
                }
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: isSelected ? '#08090B' : meta.color,
                  }}
                />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Controls: Bank Switcher & Rhythm Quantizer */}
        <div className="flex flex-wrap items-center gap-2">
          {viewMode === 'SEQUENCER' && (
            <div className="flex items-center bg-[#090B0E] p-0.5 rounded border border-[#222833] font-mono text-[10px]">
              {(
                [
                  { id: 'BANK_A', label: 'BANK A [01–14]' },
                  { id: 'BANK_B', label: 'BANK B [15–28]' },
                  { id: 'ALL_28', label: 'FULL [28]' },
                ] as const
              ).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playSwitchClick(true);
                    setBank(b.id);
                  }}
                  className={`px-2 py-1 rounded transition-colors ${
                    bank === b.id
                      ? 'bg-[#252C38] text-[#ECEAE4] font-bold'
                      : 'text-[#6D7582] hover:text-[#B9C0CC]'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}

          {/* Rhythm Pattern Generator */}
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB800] mr-0.5" />
            {(
              [
                { id: 'CRESCENDO', label: 'CRESCENDO' },
                { id: 'FOUR_FLOOR', label: '4/4 PULSE' },
                { id: 'WEEKEND', label: 'WKND SURGE' },
              ] as const
            ).map((pat) => (
              <button
                key={pat.id}
                type="button"
                onClick={() => {
                  soundEngine.playSwitchClick(true);
                  onApplyPattern(pat.id);
                }}
                className="hw-btn px-2 py-1 rounded font-mono text-[9px] font-semibold tracking-wider text-[#C6CDD8] hover:text-[#00F59B]"
                title="Auto-arrange optimal publication rhythm"
              >
                {pat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW 1: HARDWARE DRUM-MACHINE STEP SEQUENCER */}
      {viewMode === 'SEQUENCER' ? (
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[680px]">
            {/* Day Step Numbers Row */}
            <div
              className="grid gap-1.5 mb-2 items-center"
              style={{
                gridTemplateColumns: `118px repeat(${daysRange.length}, minmax(0, 1fr))`,
              }}
            >
              <div className="font-mono text-[9px] uppercase tracking-widest text-[#6D7582] px-2">
                CH // NOV 26
              </div>
              {daysRange.map((day) => {
                // Nov 1, 2026 is a Sunday!
                const dow = WEEKDAYS[(day - 1) % 7];
                const isPlayhead = playheadDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      soundEngine.playSwitchClick(true);
                      onJumpPlayhead(day);
                    }}
                    className={`flex flex-col items-center py-1 rounded border transition-all ${
                      isPlayhead
                        ? 'bg-[#FF5E1A]/20 border-[#FF5E1A] text-[#FF5E1A]'
                        : 'bg-[#0C0F13] border-[#1B2029] text-[#848D9C] hover:border-[#333C4B]'
                    }`}
                    title={`Jump Playhead to Nov ${day}`}
                  >
                    <span className="font-mono text-[8px] opacity-75">{dow[0]}</span>
                    <span className="font-display font-bold text-xs tabular-nums leading-none mt-0.5">
                      {String(day).padStart(2, '0')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Channel Pad Rows */}
            <div className="flex flex-col gap-1.5">
              {channels.map((ch, chIdx) => (
                <div
                  key={ch.id}
                  className="grid gap-1.5 items-center"
                  style={{
                    gridTemplateColumns: `118px repeat(${daysRange.length}, minmax(0, 1fr))`,
                  }}
                >
                  {/* Channel Track Header */}
                  <div className="flex items-center gap-2 bg-[#0E1116] border border-[#1E242E] rounded px-2.5 py-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: ch.muted ? '#37404E' : ch.color,
                        boxShadow: ch.muted ? 'none' : `0 0 6px ${ch.color}`,
                      }}
                    />
                    <span className="font-mono text-[10px] font-bold tracking-wider text-[#ECEAE4] truncate">
                      {ch.shortName}
                    </span>
                  </div>

                  {/* Tactile Rubberized Sequencer Pads */}
                  {daysRange.map((day) => {
                    const slot = slots.find(
                      (s) => s.channelId === ch.id && s.day === day
                    );
                    const isPlayhead = playheadDay === day;
                    const isSelected = slot && selectedSlotId === slot.id;
                    const tierMeta = slot ? TIER_META[slot.tier] : null;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={(e) => handlePadClick(ch, chIdx, day, e)}
                        title={
                          slot
                            ? `[Nov ${day}] ${slot.title} (${slot.timeWib} WIB · +$${slot.budgetBoostUsd})`
                            : `Schedule ${TIER_META[activeBrush].label} on ${ch.name} — Nov ${day}`
                        }
                        className={`relative h-10 rounded-[5px] border transition-all flex flex-col items-center justify-center group ${
                          slot
                            ? 'translate-y-0'
                            : 'bg-[#12161C] hover:bg-[#191F28] border-[#202631]'
                        } ${isSelected ? 'ring-2 ring-white z-10' : ''} ${
                          isPlayhead ? 'brightness-125' : ''
                        }`}
                        style={
                          slot && tierMeta
                            ? {
                                backgroundColor: `${tierMeta.color}28`,
                                borderColor: tierMeta.color,
                                boxShadow: isPlayhead
                                  ? `0 0 16px ${tierMeta.color}, inset 0 0 8px ${tierMeta.color}66`
                                  : `0 0 8px ${tierMeta.color}35`,
                              }
                            : isPlayhead
                            ? {
                                borderColor: 'rgba(255, 94, 26, 0.55)',
                                backgroundColor: 'rgba(255, 94, 26, 0.08)',
                              }
                            : undefined
                        }
                      >
                        {/* Top LED Window on Rubber Pad */}
                        <span
                          className="w-3.5 h-1 rounded-full mb-1 transition-all"
                          style={{
                            backgroundColor:
                              slot && tierMeta
                                ? tierMeta.color
                                : '#252C38',
                            boxShadow:
                              slot && tierMeta
                                ? `0 0 6px ${tierMeta.color}`
                                : 'none',
                          }}
                        />
                        {slot && tierMeta ? (
                          <span
                            className="font-mono text-[8px] font-bold tracking-tighter leading-none"
                            style={{ color: tierMeta.color }}
                          >
                            {bank === 'ALL_28' ? '●' : tierMeta.short}
                          </span>
                        ) : (
                          <Plus className="w-2.5 h-2.5 text-[#364050] opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: 28-DAY STUDIO MONTHLY CALENDAR MATRIX (SUN NOV 01 .. SAT NOV 28, 2026) */
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="hidden lg:block font-mono text-[10px] tracking-[0.2em] text-center text-[#6D7582] py-1"
            >
              {wd}
            </div>
          ))}
          {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => {
            const daySlots = slots.filter((s) => s.day === day);
            const isPlayhead = playheadDay === day;

            return (
              <div
                key={day}
                onClick={() => onJumpPlayhead(day)}
                className={`min-h-[104px] rounded-lg p-2 border flex flex-col justify-between cursor-pointer transition-all ${
                  isPlayhead
                    ? 'bg-[#161B22] border-[#FF5E1A] shadow-[0_0_14px_rgba(255,94,26,0.22)]'
                    : 'bg-[#0D1015] border-[#1E242E] hover:border-[#323B4A]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-display font-bold text-lg leading-none tabular-nums ${
                      isPlayhead ? 'text-[#FF5E1A]' : 'text-[#ECEAE4]'
                    }`}
                  >
                    {String(day).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const defaultCh = channels[0];
                      handlePadClick(defaultCh, 0, day, e);
                    }}
                    className="p-1 rounded bg-[#171C24] hover:bg-[#232B38] text-[#8E96A4] hover:text-[#00F59B]"
                    title={`Add drop on Nov ${day}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-col gap-1 mt-1.5">
                  {daySlots.length === 0 ? (
                    <span className="font-mono text-[9px] text-[#434B59]">
                      — STANDBY —
                    </span>
                  ) : (
                    daySlots.map((sl) => {
                      const ch = channels.find((c) => c.id === sl.channelId);
                      const tm = TIER_META[sl.tier];
                      return (
                        <button
                          key={sl.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.playSwitchClick(true);
                            setSelectedSlotId(sl.id);
                          }}
                          className={`text-left px-1.5 py-1 rounded font-mono text-[9px] truncate border ${
                            selectedSlotId === sl.id ? 'ring-1 ring-white' : ''
                          }`}
                          style={{
                            backgroundColor: `${tm.color}1C`,
                            borderColor: `${tm.color}66`,
                            color: tm.color,
                          }}
                        >
                          <span className="font-bold">{ch?.shortName}:</span> {sl.title}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Sequencer Slot Studio Inspector Strip */}
      <div className="mt-4 pt-3.5 border-t border-[#222832]">
        {selectedSlot ? (
          <div className="crt-screen rounded-lg p-3 border border-[#1E2B25] grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-4">
              <label className="block font-mono text-[9px] uppercase tracking-wider text-[#6F827A] mb-1">
                SELECTED PAD // NOV {String(selectedSlot.day).padStart(2, '0')} ·{' '}
                {channels.find((c) => c.id === selectedSlot.channelId)?.name}
              </label>
              <input
                type="text"
                value={selectedSlot.title}
                onChange={(e) =>
                  onUpdateSlot(selectedSlot.id, { title: e.target.value })
                }
                className="w-full bg-[#0B110F] border border-[#23352D] rounded px-2.5 py-1.5 font-sans text-xs font-semibold text-[#ECEAE4] focus:outline-none focus:border-[#00F59B]"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-mono text-[9px] uppercase tracking-wider text-[#6F827A] mb-1">
                DROP SIGNAL TIER
              </label>
              <select
                value={selectedSlot.tier}
                onChange={(e) =>
                  onUpdateSlot(selectedSlot.id, {
                    tier: e.target.value as DropTier,
                  })
                }
                className="w-full bg-[#0B110F] border border-[#23352D] rounded px-2 py-1.5 font-mono text-xs text-[#00F59B] focus:outline-none focus:border-[#00F59B]"
              >
                {(Object.keys(TIER_META) as DropTier[]).map((tk) => (
                  <option key={tk} value={tk}>
                    {TIER_META[tk].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-[#6F827A] mb-1">
                <Clock className="w-3 h-3" /> TIME (WIB)
              </label>
              <input
                type="time"
                value={selectedSlot.timeWib}
                onChange={(e) =>
                  onUpdateSlot(selectedSlot.id, { timeWib: e.target.value })
                }
                className="w-full bg-[#0B110F] border border-[#23352D] rounded px-2 py-1.5 font-mono text-xs text-[#ECEAE4] focus:outline-none focus:border-[#00F59B]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-[#6F827A] mb-1">
                <DollarSign className="w-3 h-3" /> BOOST (USD)
              </label>
              <input
                type="number"
                step={250}
                min={0}
                max={25000}
                value={selectedSlot.budgetBoostUsd}
                onChange={(e) =>
                  onUpdateSlot(selectedSlot.id, {
                    budgetBoostUsd: Math.max(0, Number(e.target.value)),
                  })
                }
                className="w-full bg-[#0B110F] border border-[#23352D] rounded px-2 py-1.5 font-mono text-xs text-[#FFB800] tabular-nums focus:outline-none focus:border-[#FFB800]"
              />
            </div>

            <div className="md:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSwitchClick(false);
                  onDeleteSlot(selectedSlot.id);
                  setSelectedSlotId(null);
                }}
                className="hw-btn p-2 rounded text-[#FF2A6D] hover:bg-[#FF2A6D]/15 border border-[#FF2A6D]/30"
                title="Remove Scheduled Drop"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-2 font-mono text-[11px] text-[#6D7582]">
            {lang === 'id'
              ? 'Pilih salah satu pad menyala atau klik pad kosong di atas untuk mengatur detail publikasi konten.'
              : 'Select any illuminated pad or click an empty step above to configure publication slot parameters.'}
          </div>
        )}
      </div>
    </RackModule>
  );
};
