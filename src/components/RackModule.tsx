import React from 'react';

interface RackModuleProps {
  code: string;
  title: string;
  subtitle?: string;
  ledColor?: string;
  ledPulse?: boolean;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const RackModule: React.FC<RackModuleProps> = ({
  code,
  title,
  subtitle,
  ledColor = '#00F59B',
  ledPulse = false,
  rightSlot,
  children,
  className = '',
}) => {
  return (
    <section
      className={`module-faceplate relative rounded-xl border border-[#282E38] p-4 sm:p-5 flex flex-col ${className}`}
    >
      {/* Top 2 Torx Rack Screws */}
      <span className="rack-screw !absolute top-2.5 left-2.5 opacity-80" aria-hidden="true" />
      <span className="rack-screw !absolute top-2.5 right-2.5 opacity-80" aria-hidden="true" />
      {/* Bottom 2 Torx Rack Screws */}
      <span className="rack-screw !absolute bottom-2.5 left-2.5 opacity-80" aria-hidden="true" />
      <span className="rack-screw !absolute bottom-2.5 right-2.5 opacity-80" aria-hidden="true" />

      {/* Silkscreen Module Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-3.5 border-b border-[#232831] px-2">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${ledPulse ? 'animate-pulse' : ''}`}
            style={{
              backgroundColor: ledColor,
              boxShadow: `0 0 8px ${ledColor}`,
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#6D7582]">
                {code}
              </span>
              <span className="text-[#363D49] text-[10px]">//</span>
              <h2 className="font-display font-bold text-xs sm:text-sm tracking-[0.14em] uppercase text-[#ECEAE4]">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-[11px] text-[#7D8594] mt-0.5 leading-tight">{subtitle}</p>
            )}
          </div>
        </div>
        {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
      </div>

      <div className="flex-1 flex flex-col">{children}</div>
    </section>
  );
};
