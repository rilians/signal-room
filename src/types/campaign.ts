export type LanguageCode = 'id' | 'en';

export type CampaignStatus = 'ON AIR' | 'MASTERING' | 'STANDBY';

export type VisualizerMode = 'WAVEFORM' | 'SPECTRUM' | 'ADSR' | 'RADAR';

export type DropTier = 'HERO_DROP' | 'VIRAL_BURST' | 'TEASER' | 'ECHO_RETARGET';

export interface SynthKnobs {
  driveBudget: number;      // 0..100 -> $15k - $250k
  freqCadence: number;      // 0..100 -> 2 - 28 posts/week
  resonanceHook: number;    // 0..100 -> Viral Hook Aggression %
  warmthCreator: number;    // 0..100 -> Creator Seeding & Trust %
  stereoWidth: number;      // 0..100 -> Niche (0) to Broad Mass (100)
  delayTail: number;        // 0..100 -> Retargeting Tail (1 - 30 days)
}

export interface ChannelStrip {
  id: string;
  code: string;             // e.g. CH-01
  name: string;             // e.g. IG REELS
  shortName: string;        // e.g. REELS
  fader: number;            // 0..100 allocation gain
  panPaid: number;          // -50 (100% Organic) to +50 (100% Paid Boost)
  muted: boolean;
  solo: boolean;
  color: string;            // Hex neon color
  baseCpm: number;          // USD CPM baseline
  baseCtr: number;          // % baseline CTR
  harmonicRatio: number;    // Wave frequency multiplier
}

export interface ContentStem {
  id: string;
  trackNum: string;         // "01", "02"...
  title: string;
  format: string;           // "9:16 REEL", "TIKTOK SPARK", etc.
  channelId: string;
  durationSec: number;
  hookScore: number;        // 0..100
  ctrBase: number;          // e.g. 4.8
  roasBase: number;         // e.g. 5.2
  viewsBaseK: number;       // e.g. 840 (840K)
  retentionCurve: number[]; // 16 normalized points 0..100
  status: 'HOT' | 'NOMINAL' | 'FATIGUE';
  boosted: boolean;
}

export interface SequencerSlot {
  id: string;
  day: number;              // 1..28 (Nov 2026)
  channelId: string;
  tier: DropTier;
  title: string;
  timeWib: string;          // e.g. "19:30"
  budgetBoostUsd: number;   // e.g. 1800
  format: string;
}

export interface PatchCable {
  id: string;
  sourceId: string;
  targetId: string;
  color: string;
}

export interface CampaignPatch {
  id: string;
  tapeCode: string;         // "TAPE 01"
  name: string;
  brand: string;
  objective: string;
  status: CampaignStatus;
  monthLabel: string;       // "NOVEMBER 2026"
  tempoBpm: number;         // 90..160 simulation speed
  accentColor: string;
  knobs: SynthKnobs;
  channels: ChannelStrip[];
  stems: ContentStem[];
  sequencer: SequencerSlot[];
  patches: PatchCable[];
}

export interface TelemetrySnapshot {
  budgetUsd: number;
  dailyBurnUsd: number;
  impressionsM: number;
  reachUniqueM: number;
  conversions: number;
  blendedCtr: number;
  blendedRoas: number;
  cpaUsd: number;
  snrDb: number;            // Signal-to-Noise health score in dB
  thdClippingPct: number;   // Ad fatigue distortion %
  isClipping: boolean;
  scheduledDropsCount: number;
  activePatchBonusPct: number;
  channelMetrics: Record<
    string,
    {
      active: boolean;
      sharePct: number;
      spendUsd: number;
      impressionsK: number;
      vuLevel: number;      // 0..100 for VU meter
      roas: number;
    }
  >;
}
