import React, { useRef, useState, useCallback } from 'react';
import { soundEngine } from '../utils/soundEngine';

interface RotaryKnobProps {
  synthLabel: string;      // e.g. "DRIVE"
  marketingLabel: string;  // e.g. "AD BUDGET"
  value: number;           // 0..100
  defaultValue?: number;
  formattedValue: string;  // e.g. "$142K"
  subUnit?: string;        // e.g. "AMPLITUDE"
  color?: string;
  warnAbove?: number;
  onChange: (nextVal: number) => void;
}

const TOTAL_LEDS = 21;
const MIN_ANGLE = -135;
const MAX_ANGLE = 135;

export const RotaryKnob: React.FC<RotaryKnobProps> = ({
  synthLabel,
  marketingLabel,
  value,
  defaultValue = 60,
  formattedValue,
  subUnit,
  color = '#00F59B',
  warnAbove = 88,
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const startValRef = useRef<number>(value);

  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

  const updateVal = useCallback(
    (raw: number) => {
      const next = clamp(raw);
      if (next !== value) {
        soundEngine.playKnobDetent(next / 100);
        onChange(next);
      }
    },
    [value, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    startYRef.current = e.clientY;
    startXRef.current = e.clientX;
    startValRef.current = value;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dy = startYRef.current - e.clientY;
    const dx = e.clientX - startXRef.current;
    const sensitivity = e.shiftKey ? 0.22 : 0.62;
    const delta = (dy + dx * 0.35) * sensitivity;
    updateVal(startValRef.current + delta);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDragging(false);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const step = e.deltaY < 0 ? 3 : -3;
    updateVal(value + step);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      updateVal(value + (e.shiftKey ? 1 : 4));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      updateVal(value - (e.shiftKey ? 1 : 4));
    } else if (e.key === 'Home') {
      e.preventDefault();
      updateVal(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      updateVal(100);
    }
  };

  const angle = MIN_ANGLE + (value / 100) * (MAX_ANGLE - MIN_ANGLE);
  const isHot = value >= warnAbove;
  const activeColor = isHot ? '#FF2A6D' : color;

  return (
    <div
      className={`group relative flex flex-col items-center justify-between rounded-lg bg-[#101317] border px-2 py-2.5 select-none transition-colors ${
        isDragging
          ? 'border-[#3E4756] bg-[#14181E]'
          : 'border-[#20252E] hover:border-[#303846]'
      }`}
    >
      {/* Top Etched Synth Label */}
      <div className="w-full flex items-center justify-between mb-0.5 px-0.5">
        <span className="font-mono text-[9px] xl:text-[10px] font-bold tracking-[0.14em] text-[#ECEAE4] truncate">
          {synthLabel}
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 transition-all"
          style={{
            backgroundColor: isDragging || isHot ? activeColor : '#2C333F',
            boxShadow: isDragging || isHot ? `0 0 6px ${activeColor}` : 'none',
          }}
        />
      </div>

      {/* Rotary Potentiometer SVG */}
      <div
        role="slider"
        tabIndex={0}
        aria-label={`${synthLabel} ${marketingLabel}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        onDoubleClick={() => updateVal(defaultValue)}
        title="Drag up/down, scroll wheel, or double-click to reset"
        className="relative w-[84px] h-[84px] xl:w-[94px] xl:h-[94px] cursor-ns-resize focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00F59B] rounded-full flex items-center justify-center touch-none"
      >
        <svg viewBox="0 0 110 110" className="w-full h-full overflow-visible">
          <defs>
            <radialGradient id={`knobCap-${synthLabel}`} cx="38%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#38404E" />
              <stop offset="55%" stopColor="#1B1F27" />
              <stop offset="100%" stopColor="#0E1015" />
            </radialGradient>
            <linearGradient id={`knobRim-${synthLabel}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
              <stop offset="50%" stopColor="rgba(30,35,44,0.8)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.95)" />
            </linearGradient>
          </defs>

          {/* 21 LED Collar Segments */}
          {Array.from({ length: TOTAL_LEDS }).map((_, idx) => {
            const pct = (idx / (TOTAL_LEDS - 1)) * 100;
            const deg = MIN_ANGLE + (idx / (TOTAL_LEDS - 1)) * (MAX_ANGLE - MIN_ANGLE);
            const rad = ((deg - 90) * Math.PI) / 180;
            const rInner = 44;
            const rOuter = 49;
            const x1 = 55 + Math.cos(rad) * rInner;
            const y1 = 55 + Math.sin(rad) * rInner;
            const x2 = 55 + Math.cos(rad) * rOuter;
            const y2 = 55 + Math.sin(rad) * rOuter;

            const isLit = value >= pct - 1 && value > 0;
            const segHot = pct >= warnAbove;
            const segColor = segHot ? '#FF2A6D' : color;

            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isLit ? segColor : '#222832'}
                strokeWidth={idx % 5 === 0 ? 2.6 : 2}
                strokeLinecap="round"
                style={
                  isLit
                    ? { filter: `drop-shadow(0 0 3px ${segColor})` }
                    : undefined
                }
              />
            );
          })}

          {/* Outer Recessed Shadow Well */}
          <circle cx="55" cy="57" r="36" fill="rgba(0,0,0,0.72)" />

          {/* Knurled Outer Metallic Skirt */}
          <circle
            cx="55"
            cy="55"
            r="35"
            fill="#14171D"
            stroke={`url(#knobRim-${synthLabel})`}
            strokeWidth="2"
          />

          {/* Rotating Cap Group */}
          <g transform={`rotate(${angle} 55 55)`}>
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              const nx = 55 + Math.cos(a) * 33;
              const ny = 55 + Math.sin(a) * 33;
              return (
                <circle
                  key={i}
                  cx={nx}
                  cy={ny}
                  r="1.15"
                  fill="#090B0E"
                  opacity="0.85"
                />
              );
            })}

            <circle
              cx="55"
              cy="55"
              r="29"
              fill={`url(#knobCap-${synthLabel})`}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />

            <circle
              cx="55"
              cy="55"
              r="18"
              fill="#13161C"
              stroke="rgba(0,0,0,0.65)"
              strokeWidth="1"
            />

            <line
              x1="55"
              y1="28"
              x2="55"
              y2="41"
              stroke={activeColor}
              strokeWidth="3"
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px ${activeColor})` }}
            />
          </g>
        </svg>
      </div>

      {/* Recessed Digital VFD Readout */}
      <div className="w-full crt-screen rounded px-1.5 py-1 mt-1 text-center border border-[#1E2623]">
        <div
          className="font-display font-bold text-base xl:text-lg leading-none tabular-nums tracking-tight truncate"
          style={{
            color: activeColor,
            textShadow: `0 0 10px ${activeColor}55`,
          }}
        >
          {formattedValue}
        </div>
      </div>

      {/* Marketing Parameter Meaning */}
      <div className="mt-1.5 text-center w-full">
        <div className="font-mono text-[9px] xl:text-[10px] font-semibold tracking-[0.08em] uppercase text-[#B9C0CC] truncate">
          {marketingLabel}
        </div>
        {subUnit && (
          <div className="font-mono text-[8px] xl:text-[9px] tracking-[0.12em] uppercase text-[#5C6472] truncate">
            {subUnit}
          </div>
        )}
      </div>
    </div>
  );
};
