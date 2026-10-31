import React, { useState } from 'react';
import { CampaignPatch, LanguageCode } from '../types/campaign';
import { Disc3, X } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface NewCampaignModalProps {
  isOpen: boolean;
  nextIndex: number;
  onClose: () => void;
  onCreate: (newPatch: CampaignPatch) => void;
  lang: LanguageCode;
}

const ACCENT_SWATCHES = ['#00F59B', '#FF5E1A', '#00E5FF', '#FFB800', '#FF2A6D'];

export const NewCampaignModal: React.FC<NewCampaignModalProps> = ({
  isOpen,
  nextIndex,
  onClose,
  onCreate,
  lang,
}) => {
  const [name, setName] = useState('HYPERDRIVE // Q4 LAUNCH');
  const [brand, setBrand] = useState('AETHER LABS');
  const [objective, setObjective] = useState(
    'FULL-FUNNEL PRODUCT LAUNCH & VIRAL SEEDING'
  );
  const [driveBudget, setDriveBudget] = useState(64);
  const [tempoBpm, setTempoBpm] = useState(126);
  const [accentColor, setAccentColor] = useState('#00F59B');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playPatchJack(true);

    const tapeNum = String(nextIndex).padStart(2, '0');
    const created: CampaignPatch = {
      id: `camp-custom-${Date.now()}`,
      tapeCode: `TAPE ${tapeNum}`,
      name: name.trim().toUpperCase() || `UNTITLED PATCH ${tapeNum}`,
      brand: brand.trim().toUpperCase() || 'STUDIO CLIENT',
      objective: objective.trim().toUpperCase(),
      status: 'ON AIR',
      monthLabel: 'NOVEMBER 2026',
      tempoBpm,
      accentColor,
      knobs: {
        driveBudget,
        freqCadence: 60,
        resonanceHook: 75,
        warmthCreator: 70,
        stereoWidth: 50,
        delayTail: 58,
      },
      channels: [
        { id: 'ig_reels', code: 'CH-01', name: 'IG REELS', shortName: 'REELS', fader: 85, panPaid: 10, muted: false, solo: false, color: '#00F59B', baseCpm: 5.8, baseCtr: 4.0, harmonicRatio: 1.0 },
        { id: 'tiktok', code: 'CH-02', name: 'TIKTOK PULSE', shortName: 'TIKTOK', fader: 90, panPaid: -10, muted: false, solo: false, color: '#FF5E1A', baseCpm: 4.4, baseCtr: 4.7, harmonicRatio: 1.65 },
        { id: 'yt_shorts', code: 'CH-03', name: 'YT SHORTS', shortName: 'SHORTS', fader: 68, panPaid: 15, muted: false, solo: false, color: '#00E5FF', baseCpm: 5.5, baseCtr: 3.5, harmonicRatio: 2.2 },
        { id: 'x_threads', code: 'CH-04', name: 'X // THREADS', shortName: 'X/THRD', fader: 55, panPaid: -25, muted: false, solo: false, color: '#FFB800', baseCpm: 4.9, baseCtr: 3.1, harmonicRatio: 3.1 },
        { id: 'spotify_drop', code: 'CH-05', name: 'AUDIO // DROP', shortName: 'AUDIO', fader: 50, panPaid: 20, muted: false, solo: false, color: '#FF2A6D', baseCpm: 6.4, baseCtr: 2.8, harmonicRatio: 0.65 },
      ],
      stems: [
        {
          id: `st-${Date.now()}-1`,
          trackNum: '01',
          title: `${name.trim().toUpperCase().slice(0, 16)} HERO FILM`,
          format: '9:16 HERO REEL',
          channelId: 'ig_reels',
          durationSec: 20,
          hookScore: 91,
          ctrBase: 5.0,
          roasBase: 5.4,
          viewsBaseK: 960,
          retentionCurve: [100, 94, 90, 86, 82, 79, 75, 72, 69, 67, 64, 62, 60, 58, 56, 55],
          status: 'HOT',
          boosted: true,
        },
        {
          id: `st-${Date.now()}-2`,
          trackNum: '02',
          title: 'CREATOR FIRST-IMPRESSION POV',
          format: 'TIKTOK SPARK',
          channelId: 'tiktok',
          durationSec: 26,
          hookScore: 86,
          ctrBase: 4.5,
          roasBase: 4.9,
          viewsBaseK: 780,
          retentionCurve: [100, 91, 86, 81, 77, 73, 70, 66, 63, 60, 57, 55, 53, 51, 49, 48],
          status: 'NOMINAL',
          boosted: false,
        },
        {
          id: `st-${Date.now()}-3`,
          trackNum: '03',
          title: 'DEEP-DIVE FEATURE BREAKDOWN',
          format: 'YT SHORT',
          channelId: 'yt_shorts',
          durationSec: 35,
          hookScore: 80,
          ctrBase: 3.8,
          roasBase: 4.3,
          viewsBaseK: 540,
          retentionCurve: [100, 88, 81, 75, 70, 66, 63, 59, 56, 53, 50, 48, 46, 44, 42, 40],
          status: 'NOMINAL',
          boosted: false,
        },
      ],
      sequencer: [
        { id: `sq-${Date.now()}-1`, day: 2, channelId: 'tiktok', tier: 'TEASER', title: 'Frequency Teaser Cut', timeWib: '19:00', budgetBoostUsd: 1500, format: 'Spark Video' },
        { id: `sq-${Date.now()}-2`, day: 6, channelId: 'ig_reels', tier: 'HERO_DROP', title: 'MAIN LAUNCH PREMIERE', timeWib: '20:00', budgetBoostUsd: 5000, format: 'Hero Film' },
        { id: `sq-${Date.now()}-3`, day: 10, channelId: 'yt_shorts', tier: 'VIRAL_BURST', title: 'Creator Lab Breakdown', timeWib: '19:30', budgetBoostUsd: 2600, format: '60s Short' },
        { id: `sq-${Date.now()}-4`, day: 16, channelId: 'ig_reels', tier: 'ECHO_RETARGET', title: 'Mid-Month Conversion Echo', timeWib: '20:30', budgetBoostUsd: 2200, format: 'Dynamic Reel' },
      ],
      patches: [
        { id: `pc-${Date.now()}`, sourceId: 'src_viral_spike', targetId: 'dst_spark_boost', color: accentColor },
      ],
    };

    onCreate(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="module-faceplate relative w-full max-w-lg rounded-2xl border border-[#343C4A] p-6 shadow-2xl">
        <span className="rack-screw !absolute top-3 left-3" />
        <span className="rack-screw !absolute top-3 right-3" />
        <span className="rack-screw !absolute bottom-3 left-3" />
        <span className="rack-screw !absolute bottom-3 right-3" />

        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#252C37]">
          <div className="flex items-center gap-2.5">
            <Disc3 className="w-5 h-5 text-[#00F59B] animate-spin" style={{ animationDuration: '5s' }} />
            <div>
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#7D8594] block">
                MASTER REEL INITIALIZER
              </span>
              <h2 className="font-display font-bold text-base tracking-wider uppercase text-[#ECEAE4]">
                {lang === 'id' ? 'MUAT KAMPANYE BARU (NEW TAPE)' : 'LOAD NEW CAMPAIGN TAPE'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="hw-btn p-1.5 rounded text-[#8E96A4] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#8E96A4] mb-1">
                CAMPAIGN PATCH NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full crt-screen rounded px-3 py-2 font-mono text-xs text-[#ECEAE4] border border-[#23322B] focus:outline-none focus:border-[#00F59B]"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#8E96A4] mb-1">
                CLIENT / BRAND STUDIO
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full crt-screen rounded px-3 py-2 font-mono text-xs text-[#ECEAE4] border border-[#23322B] focus:outline-none focus:border-[#00F59B]"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#8E96A4] mb-1">
              PRIMARY SIGNAL OBJECTIVE
            </label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full crt-screen rounded px-3 py-2 font-mono text-xs text-[#ECEAE4] border border-[#23322B] focus:outline-none focus:border-[#00F59B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-[#8E96A4] mb-1">
                <span>INITIAL DRIVE</span>
                <span className="text-[#00F59B] font-bold">{driveBudget}%</span>
              </label>
              <input
                type="range"
                min={15}
                max={95}
                value={driveBudget}
                onChange={(e) => setDriveBudget(Number(e.target.value))}
                className="w-full accent-[#00F59B]"
              />
            </div>

            <div>
              <label className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-[#8E96A4] mb-1">
                <span>CADENCE TEMPO</span>
                <span className="text-[#FF5E1A] font-bold">{tempoBpm} BPM</span>
              </label>
              <input
                type="range"
                min={90}
                max={160}
                value={tempoBpm}
                onChange={(e) => setTempoBpm(Number(e.target.value))}
                className="w-full accent-[#FF5E1A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#8E96A4] mb-1.5">
              SIGNAL LED CARRIER COLOR
            </label>
            <div className="flex items-center gap-2.5">
              {ACCENT_SWATCHES.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setAccentColor(col)}
                  className={`w-8 h-8 rounded-lg border-2 transition-transform ${
                    accentColor === col ? 'scale-110 border-white' : 'border-transparent opacity-70'
                  }`}
                  style={{
                    backgroundColor: col,
                    boxShadow: accentColor === col ? `0 0 12px ${col}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#252C37]">
            <button
              type="button"
              onClick={onClose}
              className="hw-btn px-4 py-2 rounded font-mono text-xs uppercase text-[#9BA3B0]"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded font-mono text-xs font-bold uppercase tracking-wider bg-[#00F59B] text-[#08090B] shadow-[0_0_16px_rgba(0,245,155,0.4)] hover:brightness-110 transition-all"
            >
              MOUNT & ARM TAPE →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
