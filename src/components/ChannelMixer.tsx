import React, { useEffect, useState, useRef } from 'react';
import { ChannelStrip, TelemetrySnapshot, LanguageCode } from '../types/campaign';
import { RackModule } from './RackModule';
import { Sliders } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface ChannelMixerProps {
  channels: ChannelStrip[];
  telemetry: TelemetrySnapshot;
  isPlaying: boolean;
  onUpdateChannel: (channelId: string, patch: Partial<ChannelStrip>) => void;
  onAutoBalance: () => void;
  lang: LanguageCode;
}

interface SingleFaderStripProps {
  channel: ChannelStrip;
  metrics: TelemetrySnapshot['channelMetrics'][string];
  jitter: number;
  onUpdate: (patch: Partial<ChannelStrip>) => void;
}

const SingleFaderStrip: React.FC<SingleFaderStripProps> = ({
  channel,
  metrics,
  jitter,
  onUpdate,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const updateFromClientY = (clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const rel = 1 - (clientY - rect.top) / rect.height;
    const val = Math.max(0, Math.min(100, Math.round(rel * 100)));
    if (val !== channel.fader) {
      soundEngine.playKnobDetent(val / 100);
      onUpdate({ fader: val });
    }
  };

  const vuDisplay = metrics?.active
    ? Math.max(0, Math.min(100, metrics.vuLevel + jitter))
    : 0;
  const totalLeds = 14;
  const litLeds = Math.round((vuDisplay / 100) * totalLeds);

  return (
    <div
      className={`flex flex-col items-center rounded-lg p-2 border transition-all select-none ${
        metrics?.active
          ? 'bg-[#101318] border-[#252C37]'
          : 'bg-[#0B0D11] border-[#1A1F27] opacity-65'
      }`}
    >
      {/* Channel Code & Colored Strip Cap */}
      <div className="w-full flex items-center justify-between mb-1.5">
        <span className="font-mono text-[9px] tracking-[0.12em] text-[#6D7582]">
          {channel.code}
        </span>
        <span
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: metrics?.active ? channel.color : '#2A303B',
            boxShadow: metrics?.active ? `0 0 6px ${channel.color}` : 'none',
          }}
        />
      </div>

      {/* Organic <-> Paid Trim Pan */}
      <div className="w-full bg-[#090B0E] rounded p-1 mb-2 border border-[#1B2029]">
        <div className="flex items-center justify-between font-mono text-[8px] text-[#6D7582] mb-0.5">
          <span className={channel.panPaid < -5 ? 'text-[#00F59B] font-bold' : ''}>O</span>
          <span className="text-[#ECEAE4] tabular-nums">
            {channel.panPaid === 0
              ? 'EVEN'
              : channel.panPaid > 0
              ? `P+${channel.panPaid}`
              : `O${channel.panPaid}`}
          </span>
          <span className={channel.panPaid > 5 ? 'text-[#FF5E1A] font-bold' : ''}>P</span>
        </div>
        <input
          type="range"
          min={-50}
          max={50}
          value={channel.panPaid}
          aria-label={`${channel.name} Organic vs Paid Pan`}
          onChange={(e) => {
            soundEngine.playKnobDetent((Number(e.target.value) + 50) / 100);
            onUpdate({ panPaid: Number(e.target.value) });
          }}
          className="w-full h-1 bg-[#1D232D] rounded appearance-none cursor-ew-resize accent-[#00E5FF]"
        />
      </div>

      {/* Vertical Fader + LED VU Meter Pair */}
      <div className="flex items-stretch justify-center gap-1.5 xl:gap-2 h-[168px] w-full my-1">
        {/* dB Scale + Fader Slot */}
        <div className="relative flex items-center gap-1">
          <div className="hidden xl:flex h-full flex-col justify-between font-mono text-[8px] text-[#555D6B] py-1 text-right select-none">
            <span>+6</span>
            <span>0</span>
            <span>-6</span>
            <span>-18</span>
            <span>-∞</span>
          </div>

          <div
            ref={trackRef}
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              setDragging(true);
              updateFromClientY(e.clientY);
            }}
            onPointerMove={(e) => {
              if (dragging) updateFromClientY(e.clientY);
            }}
            onPointerUp={(e) => {
              if (dragging) {
                e.currentTarget.releasePointerCapture(e.pointerId);
                setDragging(false);
              }
            }}
            className="relative w-6 h-full flex items-center justify-center cursor-ns-resize touch-none"
            title={`${channel.name} Gain: ${channel.fader}%`}
          >
            {/* Recessed Center Groove */}
            <div className="fader-groove w-2 h-full rounded-full relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-75"
                style={{
                  height: `${channel.fader}%`,
                  backgroundColor: metrics?.active ? channel.color : '#37404E',
                  opacity: 0.55,
                }}
              />
            </div>

            {/* Sculpted Studio Fader Cap */}
            <div
              className="absolute left-0 right-0 h-6 rounded-[4px] border border-[#475163] flex flex-col items-center justify-center pointer-events-none"
              style={{
                bottom: `calc(${channel.fader}% - 12px)`,
                background:
                  'linear-gradient(180deg, #3D4554 0%, #20252E 48%, #151920 52%, #2B323E 100%)',
                boxShadow:
                  '0 4px 8px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
            >
              <span
                className="w-3.5 h-[2px] rounded-full"
                style={{
                  backgroundColor: metrics?.active ? channel.color : '#8A93A2',
                  boxShadow: metrics?.active ? `0 0 5px ${channel.color}` : 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* 14-Segment Vertical VU Meter */}
        <div className="w-2.5 h-full bg-[#07090B] rounded p-[2px] border border-[#1B212A] flex flex-col-reverse justify-between">
          {Array.from({ length: totalLeds }).map((_, idx) => {
            const lit = idx < litLeds;
            let ledCol = '#00F59B';
            if (idx >= 12) ledCol = '#FF2A6D';
            else if (idx >= 9) ledCol = '#FFB800';

            return (
              <span
                key={idx}
                className="w-full h-[7px] rounded-[1px] transition-opacity duration-75"
                style={{
                  backgroundColor: lit ? ledCol : '#161B22',
                  boxShadow: lit ? `0 0 4px ${ledCol}` : 'none',
                  opacity: lit ? 1 : 0.45,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* MUTE / SOLO Tactile Latching Buttons */}
      <div className="grid grid-cols-2 gap-1 w-full mt-2">
        <button
          type="button"
          onClick={() => {
            soundEngine.playSwitchClick(!channel.muted);
            onUpdate({ muted: !channel.muted, solo: false });
          }}
          className={`py-1 rounded font-mono text-[10px] font-bold tracking-wider border transition-all ${
            channel.muted
              ? 'bg-[#FF2A6D] text-[#08090B] border-[#FF2A6D] shadow-[0_0_10px_rgba(255,42,109,0.5)]'
              : 'hw-btn text-[#8E96A4] border-[#252B36]'
          }`}
          title="Mute Channel"
        >
          M
        </button>
        <button
          type="button"
          onClick={() => {
            soundEngine.playSwitchClick(!channel.solo);
            onUpdate({ solo: !channel.solo, muted: false });
          }}
          className={`py-1 rounded font-mono text-[10px] font-bold tracking-wider border transition-all ${
            channel.solo
              ? 'bg-[#FFB800] text-[#08090B] border-[#FFB800] shadow-[0_0_10px_rgba(255,184,0,0.55)]'
              : 'hw-btn text-[#8E96A4] border-[#252B36]'
          }`}
          title="Solo Channel"
        >
          S
        </button>
      </div>

      {/* Channel Telemetry Readout */}
      <div className="w-full crt-screen rounded px-1 py-1.5 mt-2 text-center border border-[#1B2220]">
        <div className="font-display font-bold text-sm leading-none text-[#ECEAE4] tabular-nums">
          {metrics?.sharePct ?? 0}%
        </div>
        <div className="font-mono text-[8px] xl:text-[9px] text-[#00F59B] tabular-nums mt-0.5 truncate">
          ${Math.round((metrics?.spendUsd ?? 0) / 1000)}K · {metrics?.roas ?? 0}x
        </div>
      </div>

      {/* Scribble Strip Label Tape */}
      <div
        className="w-full mt-2 py-1 px-1 rounded text-center font-mono text-[9px] xl:text-[10px] font-bold tracking-wider uppercase truncate"
        style={{
          backgroundColor: `${channel.color}16`,
          color: channel.color,
          border: `1px solid ${channel.color}40`,
        }}
      >
        {channel.shortName}
      </div>
    </div>
  );
};

export const ChannelMixer: React.FC<ChannelMixerProps> = ({
  channels,
  telemetry,
  isPlaying,
  onUpdateChannel,
  onAutoBalance,
  lang,
}) => {
  const [vuJitter, setVuJitter] = useState<number[]>([0, 0, 0, 0, 0]);

  useEffect(() => {
    if (!isPlaying) {
      setVuJitter([0, 0, 0, 0, 0]);
      return;
    }
    const iv = setInterval(() => {
      setVuJitter(channels.map(() => Math.round((Math.random() - 0.42) * 14)));
    }, 130);
    return () => clearInterval(iv);
  }, [isPlaying, channels]);

  return (
    <RackModule
      code="MIX-05"
      title={lang === 'id' ? 'CHANNEL ALLOCATION MIXER' : 'PLATFORM CHANNEL MIXER'}
      subtitle={
        lang === 'id'
          ? 'Geser fader untuk bobot budget, O/P untuk Organik vs Paid, M/S untuk Mute atau Solo kanal'
          : 'Slide faders for channel mix, O/P for Organic vs Paid balance, M/S to Mute or Solo'
      }
      ledColor="#00E5FF"
      className="h-full"
      rightSlot={
        <button
          type="button"
          onClick={() => {
            soundEngine.playSwitchClick(true);
            onAutoBalance();
          }}
          className="hw-btn flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold uppercase tracking-wider text-[#00E5FF]"
        >
          <Sliders className="w-3 h-3" />
          <span>AUTO-GAIN</span>
        </button>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 flex-1">
        {channels.map((ch, idx) => (
          <SingleFaderStrip
            key={ch.id}
            channel={ch}
            metrics={telemetry.channelMetrics[ch.id]}
            jitter={vuJitter[idx] || 0}
            onUpdate={(patch) => onUpdateChannel(ch.id, patch)}
          />
        ))}
      </div>
    </RackModule>
  );
};
