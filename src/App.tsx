import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  CampaignPatch,
  CampaignStatus,
  ChannelStrip,
  LanguageCode,
  SequencerSlot,
  SynthKnobs,
  TelemetrySnapshot,
  VisualizerMode,
} from './types/campaign';
import {
  INITIAL_CAMPAIGNS,
  computeTelemetry,
} from './data/initialCampaigns';
import { MasterTelemetryDeck } from './components/MasterTelemetryDeck';
import { OscilloscopeVisualizer } from './components/OscilloscopeVisualizer';
import { RotaryKnob } from './components/RotaryKnob';
import { RackModule } from './components/RackModule';
import { ChannelMixer } from './components/ChannelMixer';
import { PublicationSequencer } from './components/PublicationSequencer';
import { ContentStemsDeck } from './components/ContentStemsDeck';
import { PatchBayMatrix } from './components/PatchBayMatrix';
import { NewCampaignModal } from './components/NewCampaignModal';
import { soundEngine } from './utils/soundEngine';
import {
  Disc3,
  Headphones,
  Pause,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Volume2,
  VolumeX,
  Wand2,
} from 'lucide-react';

const STORAGE_KEY = 'signal_room_campaigns_v1';

const CABLE_PALETTE = ['#00F59B', '#FF5E1A', '#00E5FF', '#FFB800', '#FF2A6D'];

export function App() {
  const [campaigns, setCampaigns] = useState<CampaignPatch[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_CAMPAIGNS;
  });

  const [activeId, setActiveId] = useState<string>(() => campaigns[0]?.id || 'camp-neon-pulse');
  const [lang, setLang] = useState<LanguageCode>('id');
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playheadDay, setPlayheadDay] = useState<number>(5);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('WAVEFORM');
  const [snapshotA, setSnapshotA] = useState<TelemetrySnapshot | null>(null);
  const [selectedStemId, setSelectedStemId] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [auditioning, setAuditioning] = useState<boolean>(false);

  const activeCampaign = useMemo(
    () => campaigns.find((c) => c.id === activeId) || campaigns[0],
    [campaigns, activeId]
  );

  // Sync persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    } catch {
      // ignore
    }
  }, [campaigns]);

  // Compute live telemetry
  const telemetry = useMemo(
    () => computeTelemetry(activeCampaign),
    [activeCampaign]
  );

  // Step Sequencer Playhead Clock
  useEffect(() => {
    if (!isPlaying) return;
    // Map BPM to step interval (comfortable visual cadence ~900ms - 1500ms per day)
    const stepMs = Math.round((60 / activeCampaign.tempoBpm) * 2400);
    const timer = setInterval(() => {
      setPlayheadDay((prev) => {
        const nextDay = prev >= 28 ? 1 : prev + 1;
        return nextDay;
      });
    }, stepMs);
    return () => clearInterval(timer);
  }, [isPlaying, activeCampaign.tempoBpm]);

  // Helper to update current campaign cleanly
  const updateActiveCampaign = useCallback(
    (updater: (curr: CampaignPatch) => CampaignPatch) => {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === activeCampaign.id ? updater(c) : c))
      );
    },
    [activeCampaign.id]
  );

  const handleKnobChange = useCallback(
    (key: keyof SynthKnobs, val: number) => {
      updateActiveCampaign((curr) => ({
        ...curr,
        knobs: { ...curr.knobs, [key]: val },
      }));
    },
    [updateActiveCampaign]
  );

  const applyKnobPreset = (preset: 'VIRAL' | 'BALANCED' | 'ROAS') => {
    soundEngine.playSwitchClick(true);
    const map: Record<typeof preset, SynthKnobs> = {
      VIRAL: {
        driveBudget: 74,
        freqCadence: 80,
        resonanceHook: 86,
        warmthCreator: 78,
        stereoWidth: 72,
        delayTail: 48,
      },
      BALANCED: {
        driveBudget: 65,
        freqCadence: 58,
        resonanceHook: 74,
        warmthCreator: 75,
        stereoWidth: 50,
        delayTail: 64,
      },
      ROAS: {
        driveBudget: 56,
        freqCadence: 46,
        resonanceHook: 72,
        warmthCreator: 88,
        stereoWidth: 32,
        delayTail: 86,
      },
    };
    updateActiveCampaign((curr) => ({
      ...curr,
      knobs: map[preset],
    }));
  };

  const handleUpdateChannel = useCallback(
    (channelId: string, patch: Partial<ChannelStrip>) => {
      updateActiveCampaign((curr) => ({
        ...curr,
        channels: curr.channels.map((ch) =>
          ch.id === channelId ? { ...ch, ...patch } : ch
        ),
      }));
    },
    [updateActiveCampaign]
  );

  const handleAutoBalanceChannels = useCallback(() => {
    updateActiveCampaign((curr) => ({
      ...curr,
      channels: curr.channels.map((ch) => {
        const optimal = Math.min(96, Math.round(ch.baseCtr * 19.5));
        return { ...ch, fader: optimal, muted: false, solo: false };
      }),
    }));
  }, [updateActiveCampaign]);

  const handleAddSlot = useCallback(
    (slotInput: Omit<SequencerSlot, 'id'>): SequencerSlot => {
      const created: SequencerSlot = {
        ...slotInput,
        id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      updateActiveCampaign((curr) => ({
        ...curr,
        sequencer: [...curr.sequencer, created],
      }));
      return created;
    },
    [updateActiveCampaign]
  );

  const handleUpdateSlot = useCallback(
    (slotId: string, patch: Partial<SequencerSlot>) => {
      updateActiveCampaign((curr) => ({
        ...curr,
        sequencer: curr.sequencer.map((s) =>
          s.id === slotId ? { ...s, ...patch } : s
        ),
      }));
    },
    [updateActiveCampaign]
  );

  const handleDeleteSlot = useCallback(
    (slotId: string) => {
      updateActiveCampaign((curr) => ({
        ...curr,
        sequencer: curr.sequencer.filter((s) => s.id !== slotId),
      }));
    },
    [updateActiveCampaign]
  );

  const handleApplyPattern = useCallback(
    (pattern: 'CRESCENDO' | 'FOUR_FLOOR' | 'WEEKEND') => {
      updateActiveCampaign((curr) => {
        const chs = curr.channels;
        const generated: SequencerSlot[] = [];
        let idx = 0;

        if (pattern === 'FOUR_FLOOR') {
          for (let d = 1; d <= 28; d += 3) {
            const ch = chs[idx % chs.length];
            generated.push({
              id: `pat-${Date.now()}-${idx}`,
              day: d,
              channelId: ch.id,
              tier: d % 6 === 1 ? 'HERO_DROP' : 'VIRAL_BURST',
              title: `${ch.shortName} Rhythmic Pulse D${String(d).padStart(2, '0')}`,
              timeWib: '19:30',
              budgetBoostUsd: d % 6 === 1 ? 4200 : 2100,
              format: '9:16 Vertical',
            });
            idx++;
          }
        } else if (pattern === 'CRESCENDO') {
          const days = [2, 5, 8, 10, 12, 13, 14, 14, 18, 21, 24, 26, 27, 28];
          days.forEach((d, i) => {
            const ch = chs[i % chs.length];
            const isPeak = d === 14 || d === 28;
            generated.push({
              id: `pat-${Date.now()}-${i}`,
              day: d,
              channelId: ch.id,
              tier: isPeak
                ? 'HERO_DROP'
                : d < 10
                ? 'TEASER'
                : 'VIRAL_BURST',
              title: isPeak
                ? `${ch.shortName} CLIMAX DROP`
                : `${ch.shortName} Build Wave`,
              timeWib: '20:00',
              budgetBoostUsd: isPeak ? 5800 : 1900,
              format: 'Hero Cut',
            });
          });
        } else {
          // WEEKEND SURGE (Fri=6, Sat=7, Sun=1 in Nov 2026)
          for (let d = 1; d <= 28; d++) {
            const dow = (d - 1) % 7; // 0=Sun, 5=Fri, 6=Sat
            if (dow === 0 || dow === 5 || dow === 6) {
              const ch = chs[idx % 3];
              generated.push({
                id: `pat-${Date.now()}-${idx}`,
                day: d,
                channelId: ch.id,
                tier: dow === 6 ? 'HERO_DROP' : 'VIRAL_BURST',
                title: `${ch.shortName} Weekend Surge`,
                timeWib: dow === 0 ? '16:30' : '20:00',
                budgetBoostUsd: dow === 6 ? 4600 : 2500,
                format: 'Spark Drop',
              });
              idx++;
            }
          }
        }

        return { ...curr, sequencer: generated };
      });
    },
    [updateActiveCampaign]
  );

  const handleToggleBoostStem = useCallback(
    (stemId: string) => {
      updateActiveCampaign((curr) => ({
        ...curr,
        stems: curr.stems.map((st) =>
          st.id === stemId ? { ...st, boosted: !st.boosted } : st
        ),
      }));
    },
    [updateActiveCampaign]
  );

  const handleConnectPatch = useCallback(
    (sourceId: string, targetId: string) => {
      updateActiveCampaign((curr) => {
        const nextColor =
          CABLE_PALETTE[curr.patches.length % CABLE_PALETTE.length];
        return {
          ...curr,
          patches: [
            ...curr.patches,
            {
              id: `patch-${Date.now()}`,
              sourceId,
              targetId,
              color: nextColor,
            },
          ],
        };
      });
    },
    [updateActiveCampaign]
  );

  const handleRemovePatch = useCallback(
    (patchId: string) => {
      updateActiveCampaign((curr) => ({
        ...curr,
        patches: curr.patches.filter((p) => p.id !== patchId),
      }));
    },
    [updateActiveCampaign]
  );

  const handleAuditionSynth = () => {
    if (!soundOn) {
      setSoundOn(true);
      soundEngine.setEnabled(true);
    }
    setAuditioning(true);
    soundEngine.playCampaignAudition(activeCampaign.knobs);
    setTimeout(() => setAuditioning(false), 1400);
  };

  const handleFactoryReset = () => {
    soundEngine.playSwitchClick(false);
    localStorage.removeItem(STORAGE_KEY);
    setCampaigns(INITIAL_CAMPAIGNS);
    setActiveId(INITIAL_CAMPAIGNS[0].id);
    setSnapshotA(null);
  };

  // Formatted knob values
  const { knobs } = activeCampaign;
  const formattedDrive = `$${Math.round(
    (15000 + Math.pow(knobs.driveBudget / 100, 1.35) * 235000) / 1000
  )}K`;
  const formattedFreq = `${Math.round(2 + (knobs.freqCadence / 100) * 26)}/WK`;
  const formattedRes = `${knobs.resonanceHook}%`;
  const formattedWarmth = `${knobs.warmthCreator}%`;
  const formattedWidth =
    knobs.stereoWidth < 35
      ? `NICHE ${knobs.stereoWidth}`
      : knobs.stereoWidth > 70
      ? `MASS ${knobs.stereoWidth}`
      : `MID ${knobs.stereoWidth}`;
  const formattedDelay = `${Math.round(1 + (knobs.delayTail / 100) * 29)}D`;

  return (
    <div className="min-h-screen bg-[#08090B] text-[#ECEAE4] flex flex-col">
      {/* =================================================================== */}
      {/* TOP MASTER CONSOLE RACK HEADER                                      */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 chassis-surface border-b border-[#252B36] px-3 sm:px-6 py-2.5">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Studio Emblem & SIGNAL ROOM Wordmark */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg bg-[#0B0D10] border border-[#2C3442] flex items-center justify-center shadow-inner">
              <Disc3
                className={`w-6 h-6 text-[#00F59B] ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '6s' }}
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF5E1A] shadow-[0_0_8px_#FF5E1A]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-lg sm:text-xl tracking-[0.14em] uppercase text-[#ECEAE4] leading-none">
                  SIGNAL ROOM
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FF2A6D]/15 border border-[#FF2A6D]/45 font-mono text-[9px] font-bold tracking-widest text-[#FF2A6D]">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  {activeCampaign.status}
                </span>
              </div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-[#7D8594] uppercase mt-0.5">
                MODEL SR-26 // CREATIVE CAMPAIGN SYNTHESIZER
              </p>
            </div>
          </div>

          {/* Center: Master Tape Cartridge Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
            {campaigns.map((camp) => {
              const isSelected = camp.id === activeCampaign.id;
              return (
                <button
                  key={camp.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playSwitchClick(true);
                    setActiveId(camp.id);
                    setSelectedStemId(null);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-[11px] uppercase tracking-wider border transition-all shrink-0 ${
                    isSelected
                      ? 'bg-[#1B212B] text-[#ECEAE4] border-[#424D60] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                      : 'bg-[#0E1115] text-[#7D8594] border-[#1F2530] hover:text-[#C6CDD8]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: isSelected ? camp.accentColor : '#3A4250',
                      boxShadow: isSelected ? `0 0 8px ${camp.accentColor}` : 'none',
                    }}
                  />
                  <span className="font-bold text-[#9BA3B0]">{camp.tapeCode}</span>
                  <span className="hidden md:inline text-[#ECEAE4] font-semibold">
                    {camp.name.split('//')[0].trim()}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                soundEngine.playSwitchClick(true);
                setIsNewModalOpen(true);
              }}
              className="hw-btn flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold text-[#00F59B] shrink-0"
              title="Mount New Campaign Tape"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NEW TAPE</span>
            </button>
          </div>

          {/* Right: Master Transport, Synth Audition, SFX & Language */}
          <div className="flex items-center gap-2">
            {/* PLAY / PAUSE LIVE TELEMETRY TRANSPORT */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playSwitchClick(!isPlaying);
                setIsPlaying((p) => !p);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider border transition-all ${
                isPlaying
                  ? 'bg-[#00F59B] text-[#08090B] border-[#00F59B] shadow-[0_0_14px_rgba(0,245,155,0.38)]'
                  : 'hw-btn text-[#ECEAE4] border-[#2C3442]'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>LIVE SIM</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>PAUSED</span>
                </>
              )}
            </button>

            {/* AUDITION CAMPAIGN CHORD SYNTH */}
            <button
              type="button"
              onClick={handleAuditionSynth}
              className={`hw-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-semibold uppercase tracking-wider border ${
                auditioning
                  ? 'border-[#FF5E1A] text-[#FF5E1A] shadow-[0_0_12px_rgba(255,94,26,0.4)]'
                  : 'border-[#2A313E] text-[#FFB800]'
              }`}
              title={
                lang === 'id'
                  ? 'Dengarkan harmoni audio synthesizer dari parameter kampanye saat ini!'
                  : 'Audition your campaign parameters as a polyphonic synthesizer chord!'
              }
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AUDITION</span>
            </button>

            {/* SOUND FX TOGGLE */}
            <button
              type="button"
              onClick={() => {
                const next = !soundOn;
                setSoundOn(next);
                soundEngine.setEnabled(next);
              }}
              className={`hw-btn p-1.5 rounded-lg border ${
                soundOn
                  ? 'border-[#00E5FF]/40 text-[#00E5FF]'
                  : 'border-[#252C37] text-[#5F6775]'
              }`}
              title={soundOn ? 'Studio Tactile SFX: ON' : 'Studio Tactile SFX: MUTED'}
            >
              {soundOn ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* LANGUAGE SWITCHER ID / EN */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playSwitchClick(true);
                setLang((l) => (l === 'id' ? 'en' : 'id'));
              }}
              className="hw-btn px-2 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-widest text-[#C6CDD8]"
            >
              {lang.toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* MAIN STUDIO RACK CONSOLE                                            */}
      {/* =================================================================== */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
        {/* ACTIVE CAMPAIGN PATCH BAR */}
        <div className="chassis-surface rounded-xl border border-[#242A35] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="font-mono text-xs font-bold px-2.5 py-1 rounded border"
              style={{
                backgroundColor: `${activeCampaign.accentColor}18`,
                borderColor: `${activeCampaign.accentColor}55`,
                color: activeCampaign.accentColor,
              }}
            >
              {activeCampaign.tapeCode} // {activeCampaign.brand}
            </span>

            <div>
              <h2 className="font-display font-bold text-base sm:text-lg tracking-wider text-[#ECEAE4] leading-tight">
                {activeCampaign.name}
              </h2>
              <p className="font-mono text-[10px] tracking-widest text-[#7D8594] uppercase">
                OBJ: {activeCampaign.objective}
              </p>
            </div>
          </div>

          {/* Campaign Status, Tempo BPM & Quick Synth Patch Presets */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Selector */}
            <select
              value={activeCampaign.status}
              onChange={(e) => {
                soundEngine.playSwitchClick(true);
                updateActiveCampaign((c) => ({
                  ...c,
                  status: e.target.value as CampaignStatus,
                }));
              }}
              aria-label="Campaign Broadcast Status"
              className="bg-[#0B0E12] border border-[#272F3C] rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold text-[#00F59B] focus:outline-none focus:border-[#00F59B]"
            >
              <option value="ON AIR">● ON AIR (LIVE)</option>
              <option value="MASTERING">◐ MASTERING (DRAFT)</option>
              <option value="STANDBY">○ STANDBY (PAUSED)</option>
            </select>

            {/* Tempo BPM Stepper */}
            <div className="flex items-center bg-[#0B0E12] border border-[#272F3C] rounded-lg px-2 py-1 font-mono text-[11px]">
              <span className="text-[#6D7582] mr-2 text-[9px]">TEMPO</span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playKnobDetent(0.3);
                  updateActiveCampaign((c) => ({
                    ...c,
                    tempoBpm: Math.max(80, c.tempoBpm - 4),
                  }));
                }}
                className="px-1.5 text-[#9BA3B0] hover:text-white font-bold"
              >
                -
              </button>
              <span className="px-1.5 font-bold text-[#FF5E1A] tabular-nums">
                {activeCampaign.tempoBpm} BPM
              </span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playKnobDetent(0.7);
                  updateActiveCampaign((c) => ({
                    ...c,
                    tempoBpm: Math.min(170, c.tempoBpm + 4),
                  }));
                }}
                className="px-1.5 text-[#9BA3B0] hover:text-white font-bold"
              >
                +
              </button>
            </div>

            {/* Quick Strategic Synth Presets */}
            <div className="flex items-center gap-1 bg-[#0B0E12] p-1 rounded-lg border border-[#232A36]">
              <Wand2 className="w-3.5 h-3.5 text-[#00E5FF] mx-1" />
              <button
                type="button"
                onClick={() => applyKnobPreset('VIRAL')}
                className="px-2 py-1 rounded font-mono text-[10px] text-[#B9C0CC] hover:bg-[#1C222D] hover:text-[#00F59B]"
              >
                VIRAL BLITZ
              </button>
              <button
                type="button"
                onClick={() => applyKnobPreset('BALANCED')}
                className="px-2 py-1 rounded font-mono text-[10px] text-[#B9C0CC] hover:bg-[#1C222D] hover:text-[#00E5FF]"
              >
                STUDIO BALANCED
              </button>
              <button
                type="button"
                onClick={() => applyKnobPreset('ROAS')}
                className="px-2 py-1 rounded font-mono text-[10px] text-[#B9C0CC] hover:bg-[#1C222D] hover:text-[#FFB800]"
              >
                MAX ROAS
              </button>
            </div>
          </div>
        </div>

        {/* MASTER VFD TELEMETRY OVERSIZED NUMBERS */}
        <MasterTelemetryDeck
          telemetry={telemetry}
          snapshotA={snapshotA}
          onCaptureSnapshot={() => {
            soundEngine.playSwitchClick(true);
            setSnapshotA(telemetry);
          }}
          onClearSnapshot={() => {
            soundEngine.playSwitchClick(false);
            setSnapshotA(null);
          }}
          lang={lang}
        />

        {/* ROW 1: CRT OSCILLOSCOPE (7 COLS) + 6-KNOB PARAMETER SYNTHESIZER (5 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <OscilloscopeVisualizer
              campaign={activeCampaign}
              telemetry={telemetry}
              isPlaying={isPlaying}
              playheadDay={playheadDay}
              mode={visualizerMode}
              onModeChange={setVisualizerMode}
              selectedStemId={selectedStemId}
              onSelectStem={setSelectedStemId}
              lang={lang}
            />
          </div>

          {/* 6 ROTARY KNOBS ANALOG PARAMETER BAY */}
          <div className="lg:col-span-5 flex flex-col">
            <RackModule
              code="SYN-06"
              title={
                lang === 'id'
                  ? 'ANALOG PARAMETER SYNTHESIZER'
                  : 'CAMPAIGN PARAMETER SYNTHESIZER'
              }
              subtitle={
                lang === 'id'
                  ? 'Tarik knob ke atas/bawah atau gunakan scroll wheel untuk memodulasi gelombang kampanye'
                  : 'Drag knobs vertically or scroll wheel to sculpt budget drive, cadence & viral harmonics'
              }
              ledColor="#00F59B"
              className="h-full"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-1">
                <RotaryKnob
                  synthLabel="DRIVE"
                  marketingLabel={lang === 'id' ? 'AD BUDGET' : 'AD BUDGET'}
                  subUnit="AMPLITUDE"
                  value={knobs.driveBudget}
                  defaultValue={68}
                  formattedValue={formattedDrive}
                  color="#FFB800"
                  warnAbove={92}
                  onChange={(v) => handleKnobChange('driveBudget', v)}
                />
                <RotaryKnob
                  synthLabel="FREQ"
                  marketingLabel={lang === 'id' ? 'POST CADENCE' : 'POST CADENCE'}
                  subUnit="OSCILLATION"
                  value={knobs.freqCadence}
                  defaultValue={62}
                  formattedValue={formattedFreq}
                  color="#00F59B"
                  warnAbove={85}
                  onChange={(v) => handleKnobChange('freqCadence', v)}
                />
                <RotaryKnob
                  synthLabel="RESONANCE"
                  marketingLabel={lang === 'id' ? 'VIRAL HOOK' : 'VIRAL HOOK'}
                  subUnit="HARMONIC PEAK"
                  value={knobs.resonanceHook}
                  defaultValue={78}
                  formattedValue={formattedRes}
                  color="#FF5E1A"
                  warnAbove={88}
                  onChange={(v) => handleKnobChange('resonanceHook', v)}
                />
                <RotaryKnob
                  synthLabel="WARMTH"
                  marketingLabel={lang === 'id' ? 'CREATOR SEED' : 'CREATOR SEED'}
                  subUnit="TUBE TRUST"
                  value={knobs.warmthCreator}
                  defaultValue={72}
                  formattedValue={formattedWarmth}
                  color="#00F59B"
                  warnAbove={96}
                  onChange={(v) => handleKnobChange('warmthCreator', v)}
                />
                <RotaryKnob
                  synthLabel="WIDTH"
                  marketingLabel={lang === 'id' ? 'AUDIENCE SCOPE' : 'AUDIENCE'}
                  subUnit="STEREO FIELD"
                  value={knobs.stereoWidth}
                  defaultValue={54}
                  formattedValue={formattedWidth}
                  color="#00E5FF"
                  warnAbove={90}
                  onChange={(v) => handleKnobChange('stereoWidth', v)}
                />
                <RotaryKnob
                  synthLabel="DELAY"
                  marketingLabel={lang === 'id' ? 'RETARGET TAIL' : 'RETARGETING'}
                  subUnit="ECHO WINDOW"
                  value={knobs.delayTail}
                  defaultValue={64}
                  formattedValue={formattedDelay}
                  color="#FF5E1A"
                  warnAbove={94}
                  onChange={(v) => handleKnobChange('delayTail', v)}
                />
              </div>

              {/* Harmonic Sweet-Spot Balance Meter */}
              <div className="mt-3 pt-2.5 border-t border-[#222832] flex items-center justify-between gap-3 font-mono text-[10px]">
                <span className="text-[#7D8594]">HARMONIC SWEET-SPOT:</span>
                <div className="flex-1 h-2 bg-[#0A0D10] rounded-full overflow-hidden border border-[#1E2530] p-[1px]">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${Math.min(100, Math.round((telemetry.snrDb / 98) * 100))}%`,
                      background: telemetry.isClipping
                        ? 'linear-gradient(90deg, #FFB800, #FF2A6D)'
                        : 'linear-gradient(90deg, #00F59B, #00E5FF)',
                    }}
                  />
                </div>
                <span
                  className={`font-bold tabular-nums ${
                    telemetry.isClipping ? 'text-[#FF2A6D]' : 'text-[#00F59B]'
                  }`}
                >
                  {telemetry.isClipping ? 'OVERDRIVEN!' : 'OPTIMAL'}
                </span>
              </div>
            </RackModule>
          </div>
        </div>

        {/* ROW 2: PUBLICATION STEP SEQUENCER CALENDAR (7 COLS) + 5-CH MIXER (5 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <PublicationSequencer
              monthLabel={activeCampaign.monthLabel}
              channels={activeCampaign.channels}
              slots={activeCampaign.sequencer}
              playheadDay={playheadDay}
              onJumpPlayhead={setPlayheadDay}
              onAddSlot={handleAddSlot}
              onUpdateSlot={handleUpdateSlot}
              onDeleteSlot={handleDeleteSlot}
              onApplyPattern={handleApplyPattern}
              lang={lang}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <ChannelMixer
              channels={activeCampaign.channels}
              telemetry={telemetry}
              isPlaying={isPlaying}
              onUpdateChannel={handleUpdateChannel}
              onAutoBalance={handleAutoBalanceChannels}
              lang={lang}
            />
          </div>
        </div>

        {/* ROW 3: CREATIVE STEMS MONITOR (7 COLS) + EURORACK PATCH BAY (5 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <ContentStemsDeck
              stems={activeCampaign.stems}
              channels={activeCampaign.channels}
              knobs={activeCampaign.knobs}
              selectedStemId={selectedStemId}
              onSelectStem={setSelectedStemId}
              onToggleBoostStem={handleToggleBoostStem}
              lang={lang}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <PatchBayMatrix
              patches={activeCampaign.patches}
              onConnectPatch={handleConnectPatch}
              onRemovePatch={handleRemovePatch}
              lang={lang}
            />
          </div>
        </div>
      </main>

      {/* =================================================================== */}
      {/* HARDWARE CHASSIS FOOTER SERIAL PLATE                                */}
      {/* =================================================================== */}
      <footer className="mt-6 border-t border-[#1D222B] bg-[#0B0D10] px-4 sm:px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] text-[#6D7582]">
          <div className="flex items-center gap-3">
            <span className="text-[#ECEAE4] font-bold">
              SIGNAL ROOM // SR-26 CONSOLE
            </span>
            <span>·</span>
            <span>ANALOG TELEMETRY ENGINE v2.6</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline text-[#00F59B]">
              SYNC LOCKED 48kHz / 24-BIT
            </span>
          </div>

          <button
            type="button"
            onClick={handleFactoryReset}
            className="flex items-center gap-1.5 text-[#8E96A4] hover:text-[#FF5E1A] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>FACTORY RESET PATCHES</span>
          </button>
        </div>
      </footer>

      {/* NEW CAMPAIGN MODAL */}
      <NewCampaignModal
        isOpen={isNewModalOpen}
        nextIndex={campaigns.length + 1}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={(created) => {
          setCampaigns((prev) => [...prev, created]);
          setActiveId(created.id);
        }}
        lang={lang}
      />
    </div>
  );
}

export default App;
