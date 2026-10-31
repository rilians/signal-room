import { CampaignPatch, TelemetrySnapshot } from '../types/campaign';

export interface PatchJackDef {
  id: string;
  code: string;
  label: string;
  descId: string;
  descEn: string;
  roasLift: number;
  ctrLift: number;
}

export const PATCH_SOURCES: PatchJackDef[] = [
  {
    id: 'src_viral_spike',
    code: 'TRIG-01',
    label: 'VIRAL VELOCITY > 2.5x',
    descId: 'Saat share rate organik menembus 2.5x rata-rata',
    descEn: 'When organic share velocity exceeds 2.5x baseline',
    roasLift: 0.22,
    ctrLift: 0.35,
  },
  {
    id: 'src_hook_drop',
    code: 'TRIG-02',
    label: '3s HOLD < 45% ATTN',
    descId: 'Saat retensi 3 detik pertama turun di bawah 45%',
    descEn: 'When 3-second thumbstop ratio dips below 45%',
    roasLift: 0.14,
    ctrLift: 0.28,
  },
  {
    id: 'src_prime_window',
    code: 'TRIG-03',
    label: 'PRIME HOUR 19:00–22:00',
    descId: 'Sinkronisasi jam puncak audiens aktif malam hari',
    descEn: 'Peak evening mobile scroll window trigger',
    roasLift: 0.18,
    ctrLift: 0.2,
  },
  {
    id: 'src_creator_echo',
    code: 'TRIG-04',
    label: 'CREATOR DUET / REMIX',
    descId: 'Deteksi otomatis konten kolaborasi kreator baru',
    descEn: 'Auto-detects high-engagement creator remix posts',
    roasLift: 0.26,
    ctrLift: 0.31,
  },
];

export const PATCH_TARGETS: PatchJackDef[] = [
  {
    id: 'dst_spark_boost',
    code: 'MOD-A',
    label: '+30% SPARK GAIN',
    descId: 'Injeksi budget otomatis ke kanal video pendek terkuat',
    descEn: 'Auto-inject +30% paid Spark boost to top short-form video',
    roasLift: 0.25,
    ctrLift: 0.18,
  },
  {
    id: 'dst_swap_hook',
    code: 'MOD-B',
    label: 'SWAP ALT HOOK B',
    descId: 'Rotasi otomatis ke variasi kreatif Hook-B anti-jenuh',
    descEn: 'Hot-swap creative intro to Variant B to prevent fatigue',
    roasLift: 0.19,
    ctrLift: 0.32,
  },
  {
    id: 'dst_echo_retarget',
    code: 'MOD-C',
    label: 'FIRE DELAY RETARGET',
    descId: 'Aktifkan gelombang iklan retargeting keranjang 48 jam',
    descEn: 'Trigger 48h dynamic retargeting echo sequence',
    roasLift: 0.34,
    ctrLift: 0.15,
  },
  {
    id: 'dst_cross_pan',
    code: 'MOD-D',
    label: 'PAN TO ORGANIC SEED',
    descId: 'Alihkan bobot distribusi ke komunitas & micro-creator',
    descEn: 'Shift stereo balance toward organic community seeding',
    roasLift: 0.21,
    ctrLift: 0.24,
  },
];

export const INITIAL_CAMPAIGNS: CampaignPatch[] = [
  {
    id: 'camp-neon-pulse',
    tapeCode: 'TAPE 01',
    name: 'NEON PULSE // FW26 DROP',
    brand: 'VORTEX ATELIER',
    objective: 'HIGH-VELOCITY CAPSULE LAUNCH & DIRECT DROP CONVERSION',
    status: 'ON AIR',
    monthLabel: 'NOVEMBER 2026',
    tempoBpm: 128,
    accentColor: '#00F59B',
    knobs: {
      driveBudget: 68,
      freqCadence: 62,
      resonanceHook: 78,
      warmthCreator: 72,
      stereoWidth: 54,
      delayTail: 64,
    },
    channels: [
      {
        id: 'ig_reels',
        code: 'CH-01',
        name: 'IG REELS',
        shortName: 'REELS',
        fader: 86,
        panPaid: 15,
        muted: false,
        solo: false,
        color: '#00F59B',
        baseCpm: 6.4,
        baseCtr: 3.9,
        harmonicRatio: 1.0,
      },
      {
        id: 'tiktok',
        code: 'CH-02',
        name: 'TIKTOK PULSE',
        shortName: 'TIKTOK',
        fader: 92,
        panPaid: -10,
        muted: false,
        solo: false,
        color: '#FF5E1A',
        baseCpm: 4.8,
        baseCtr: 4.6,
        harmonicRatio: 1.65,
      },
      {
        id: 'yt_shorts',
        code: 'CH-03',
        name: 'YT SHORTS',
        shortName: 'SHORTS',
        fader: 64,
        panPaid: 20,
        muted: false,
        solo: false,
        color: '#00E5FF',
        baseCpm: 5.9,
        baseCtr: 3.1,
        harmonicRatio: 2.2,
      },
      {
        id: 'x_threads',
        code: 'CH-04',
        name: 'X // THREADS',
        shortName: 'X/THRD',
        fader: 48,
        panPaid: -30,
        muted: false,
        solo: false,
        color: '#FFB800',
        baseCpm: 5.2,
        baseCtr: 2.7,
        harmonicRatio: 3.1,
      },
      {
        id: 'spotify_drop',
        code: 'CH-05',
        name: 'AUDIO // DROP',
        shortName: 'AUDIO',
        fader: 56,
        panPaid: 25,
        muted: false,
        solo: false,
        color: '#FF2A6D',
        baseCpm: 7.5,
        baseCtr: 2.4,
        harmonicRatio: 0.65,
      },
    ],
    stems: [
      {
        id: 'stem-1',
        trackNum: '01',
        title: 'GLITCH RUNWAY 15s TEASER',
        format: '9:16 MOTION REEL',
        channelId: 'tiktok',
        durationSec: 15,
        hookScore: 94,
        ctrBase: 5.4,
        roasBase: 5.8,
        viewsBaseK: 1420,
        retentionCurve: [100, 95, 91, 88, 84, 80, 78, 75, 73, 70, 68, 66, 65, 63, 61, 59],
        status: 'HOT',
        boosted: true,
      },
      {
        id: 'stem-2',
        trackNum: '02',
        title: 'ATELIER SOUNDCHECK POV',
        format: 'CREATOR SPARK',
        channelId: 'ig_reels',
        durationSec: 28,
        hookScore: 88,
        ctrBase: 4.7,
        roasBase: 5.1,
        viewsBaseK: 980,
        retentionCurve: [100, 92, 86, 82, 77, 74, 70, 68, 65, 61, 58, 55, 52, 50, 48, 46],
        status: 'HOT',
        boosted: true,
      },
      {
        id: 'stem-3',
        trackNum: '03',
        title: 'GORETEX SHELL TORTURE TEST',
        format: 'DEMO SHORT',
        channelId: 'yt_shorts',
        durationSec: 34,
        hookScore: 81,
        ctrBase: 3.9,
        roasBase: 4.4,
        viewsBaseK: 640,
        retentionCurve: [100, 89, 82, 76, 72, 69, 65, 62, 58, 55, 53, 50, 47, 45, 43, 41],
        status: 'NOMINAL',
        boosted: false,
      },
      {
        id: 'stem-4',
        trackNum: '04',
        title: 'DESIGNER MANIFESTO THREAD',
        format: 'CAROUSEL + HOOK',
        channelId: 'x_threads',
        durationSec: 45,
        hookScore: 76,
        ctrBase: 3.3,
        roasBase: 3.9,
        viewsBaseK: 410,
        retentionCurve: [100, 84, 75, 68, 63, 59, 55, 52, 48, 46, 43, 40, 38, 36, 35, 33],
        status: 'NOMINAL',
        boosted: false,
      },
      {
        id: 'stem-5',
        trackNum: '05',
        title: 'MIDNIGHT WAREHOUSE BINAURAL AD',
        format: '3D SPATIAL AUDIO',
        channelId: 'spotify_drop',
        durationSec: 20,
        hookScore: 85,
        ctrBase: 3.1,
        roasBase: 4.2,
        viewsBaseK: 530,
        retentionCurve: [100, 94, 89, 85, 81, 78, 75, 71, 69, 66, 63, 60, 58, 56, 54, 52],
        status: 'NOMINAL',
        boosted: false,
      },
      {
        id: 'stem-6',
        trackNum: '06',
        title: 'COUNTDOWN HARD-SELL LOOP v1',
        format: 'PAID RETARGET',
        channelId: 'ig_reels',
        durationSec: 12,
        hookScore: 62,
        ctrBase: 2.4,
        roasBase: 2.9,
        viewsBaseK: 790,
        retentionCurve: [100, 72, 58, 49, 43, 39, 35, 32, 29, 27, 25, 24, 22, 21, 20, 19],
        status: 'FATIGUE',
        boosted: false,
      },
    ],
    sequencer: [
      { id: 's1', day: 1, channelId: 'ig_reels', tier: 'TEASER', title: 'Silhouette Frequency Teaser', timeWib: '19:00', budgetBoostUsd: 1200, format: '9:16 Reel' },
      { id: 's2', day: 2, channelId: 'tiktok', tier: 'VIRAL_BURST', title: 'Soundcheck Transition Challenge', timeWib: '20:00', budgetBoostUsd: 2400, format: 'Spark Video' },
      { id: 's3', day: 4, channelId: 'x_threads', tier: 'TEASER', title: 'Fabric Spec Blueprint Drop', timeWib: '12:30', budgetBoostUsd: 600, format: 'Spec Thread' },
      { id: 's4', day: 5, channelId: 'ig_reels', tier: 'HERO_DROP', title: 'FW26 HERO FILM PREMIERE', timeWib: '19:30', budgetBoostUsd: 5500, format: 'Hero Film' },
      { id: 's5', day: 5, channelId: 'tiktok', tier: 'HERO_DROP', title: 'FW26 Hero Cut + Creator Live', timeWib: '20:00', budgetBoostUsd: 4800, format: 'Live + Spark' },
      { id: 's6', day: 6, channelId: 'yt_shorts', tier: 'VIRAL_BURST', title: 'Waterproof Torture Test Lab', timeWib: '18:00', budgetBoostUsd: 2100, format: 'YT Short' },
      { id: 's7', day: 7, channelId: 'spotify_drop', tier: 'TEASER', title: 'Binaural Runway Playlist Takeover', timeWib: '21:00', budgetBoostUsd: 1900, format: 'Spatial Audio' },
      { id: 's8', day: 9, channelId: 'tiktok', tier: 'VIRAL_BURST', title: 'Tokyo/Jakarta Street Styling Remix', timeWib: '19:30', budgetBoostUsd: 2900, format: 'Creator Duet' },
      { id: 's9', day: 10, channelId: 'ig_reels', tier: 'ECHO_RETARGET', title: 'VIP Early Access Code Echo', timeWib: '20:30', budgetBoostUsd: 2200, format: 'Dynamic Reel' },
      { id: 's10', day: 12, channelId: 'yt_shorts', tier: 'HERO_DROP', title: 'Behind The Seams Mini-Doc', timeWib: '19:00', budgetBoostUsd: 3400, format: '60s Short' },
      { id: 's11', day: 14, channelId: 'ig_reels', tier: 'HERO_DROP', title: 'DROP 01 LIVE RELEASE BELL', timeWib: '20:00', budgetBoostUsd: 6200, format: 'Shoppable Reel' },
      { id: 's12', day: 14, channelId: 'tiktok', tier: 'VIRAL_BURST', title: 'Unbox & Fit-Check Blitz', timeWib: '20:15', budgetBoostUsd: 4100, format: 'Creator Blitz' },
      { id: 's13', day: 16, channelId: 'x_threads', tier: 'ECHO_RETARGET', title: 'Sold-Out Sizes Stock Alert', timeWib: '17:00', budgetBoostUsd: 900, format: 'Live Thread' },
      { id: 's14', day: 18, channelId: 'spotify_drop', tier: 'VIRAL_BURST', title: 'Afterhours Synth Session Ad', timeWib: '22:00', budgetBoostUsd: 1700, format: 'Audio Spot' },
      { id: 's15', day: 21, channelId: 'ig_reels', tier: 'VIRAL_BURST', title: 'Community Styling Compilation', timeWib: '19:30', budgetBoostUsd: 2800, format: 'UGC Cut' },
      { id: 's16', day: 24, channelId: 'tiktok', tier: 'ECHO_RETARGET', title: 'Last 150 Units Cart Echo', timeWib: '20:00', budgetBoostUsd: 3100, format: 'Retarget Spark' },
      { id: 's17', day: 27, channelId: 'ig_reels', tier: 'HERO_DROP', title: 'ENCORE ARCHIVE VAULT UNLOCK', timeWib: '19:30', budgetBoostUsd: 4900, format: 'Vault Drop' },
    ],
    patches: [
      { id: 'p-1', sourceId: 'src_viral_spike', targetId: 'dst_spark_boost', color: '#00F59B' },
      { id: 'p-2', sourceId: 'src_prime_window', targetId: 'dst_echo_retarget', color: '#FF5E1A' },
    ],
  },
  {
    id: 'camp-kinetic-audio',
    tapeCode: 'TAPE 02',
    name: 'KINETIC X1 // SYNTH HEADPHONE',
    brand: 'KINETIC ACOUSTICS',
    objective: 'GLOBAL PRE-ORDER WAVE & PRODUCER SEEDING',
    status: 'MASTERING',
    monthLabel: 'NOVEMBER 2026',
    tempoBpm: 116,
    accentColor: '#00E5FF',
    knobs: {
      driveBudget: 82,
      freqCadence: 48,
      resonanceHook: 71,
      warmthCreator: 86,
      stereoWidth: 42,
      delayTail: 78,
    },
    channels: [
      { id: 'ig_reels', code: 'CH-01', name: 'IG REELS', shortName: 'REELS', fader: 76, panPaid: 10, muted: false, solo: false, color: '#00F59B', baseCpm: 7.1, baseCtr: 3.6, harmonicRatio: 1.0 },
      { id: 'tiktok', code: 'CH-02', name: 'TIKTOK PULSE', shortName: 'TIKTOK', fader: 70, panPaid: -15, muted: false, solo: false, color: '#FF5E1A', baseCpm: 5.2, baseCtr: 4.1, harmonicRatio: 1.65 },
      { id: 'yt_shorts', code: 'CH-03', name: 'YT SHORTS', shortName: 'SHORTS', fader: 94, panPaid: 25, muted: false, solo: false, color: '#00E5FF', baseCpm: 6.5, baseCtr: 4.4, harmonicRatio: 2.2 },
      { id: 'x_threads', code: 'CH-04', name: 'X // THREADS', shortName: 'X/THRD', fader: 68, panPaid: -20, muted: false, solo: false, color: '#FFB800', baseCpm: 5.8, baseCtr: 3.2, harmonicRatio: 3.1 },
      { id: 'spotify_drop', code: 'CH-05', name: 'AUDIO // DROP', shortName: 'AUDIO', fader: 88, panPaid: 30, muted: false, solo: false, color: '#FF2A6D', baseCpm: 6.9, baseCtr: 3.8, harmonicRatio: 0.65 },
    ],
    stems: [
      {
        id: 'ka-1',
        trackNum: '01',
        title: 'PLANAR DRIVER EXPLODED CAD VIEW',
        format: '3D MACRO SHORT',
        channelId: 'yt_shorts',
        durationSec: 24,
        hookScore: 92,
        ctrBase: 5.1,
        roasBase: 6.2,
        viewsBaseK: 1180,
        retentionCurve: [100, 96, 92, 89, 86, 82, 79, 76, 74, 71, 69, 67, 65, 64, 62, 60],
        status: 'HOT',
        boosted: true,
      },
      {
        id: 'ka-2',
        trackNum: '02',
        title: 'BLIND STUDIO ENGINEER TEST',
        format: 'CREATOR REACTION',
        channelId: 'tiktok',
        durationSec: 38,
        hookScore: 89,
        ctrBase: 4.8,
        roasBase: 5.5,
        viewsBaseK: 920,
        retentionCurve: [100, 91, 87, 83, 80, 77, 74, 71, 68, 65, 63, 60, 58, 56, 54, 53],
        status: 'HOT',
        boosted: true,
      },
      {
        id: 'ka-3',
        trackNum: '03',
        title: '8D ANC SUBWAY SILENCE DEMO',
        format: 'SPATIAL AUDIO',
        channelId: 'spotify_drop',
        durationSec: 30,
        hookScore: 86,
        ctrBase: 4.2,
        roasBase: 4.9,
        viewsBaseK: 760,
        retentionCurve: [100, 93, 88, 84, 80, 76, 73, 70, 66, 64, 61, 59, 57, 55, 53, 51],
        status: 'NOMINAL',
        boosted: false,
      },
      {
        id: 'ka-4',
        trackNum: '04',
        title: 'CNC ALUMINUM UNBOXING ASMR',
        format: '9:16 REEL',
        channelId: 'ig_reels',
        durationSec: 18,
        hookScore: 84,
        ctrBase: 4.0,
        roasBase: 4.7,
        viewsBaseK: 810,
        retentionCurve: [100, 90, 84, 79, 74, 70, 67, 63, 60, 57, 54, 52, 49, 47, 45, 44],
        status: 'NOMINAL',
        boosted: false,
      },
    ],
    sequencer: [
      { id: 'k1', day: 2, channelId: 'yt_shorts', tier: 'TEASER', title: 'Frequency Response Teaser', timeWib: '18:30', budgetBoostUsd: 2100, format: '3D Short' },
      { id: 'k2', day: 4, channelId: 'spotify_drop', tier: 'VIRAL_BURST', title: '8D Subway ANC Switch Spot', timeWib: '19:00', budgetBoostUsd: 3200, format: 'Spatial Audio' },
      { id: 'k3', day: 7, channelId: 'yt_shorts', tier: 'HERO_DROP', title: 'KINETIC X1 KEYNOTE REVEAL', timeWib: '20:00', budgetBoostUsd: 7400, format: 'Hero Launch' },
      { id: 'k4', day: 8, channelId: 'tiktok', tier: 'VIRAL_BURST', title: 'Grammy Producer Blind Reaction', timeWib: '19:30', budgetBoostUsd: 3900, format: 'Creator Collab' },
      { id: 'k5', day: 11, channelId: 'ig_reels', tier: 'HERO_DROP', title: 'CNC Industrial Design Breakdown', timeWib: '20:00', budgetBoostUsd: 4500, format: 'Macro Reel' },
      { id: 'k6', day: 15, channelId: 'x_threads', tier: 'TEASER', title: 'Acoustic Whitepaper Thread', timeWib: '13:00', budgetBoostUsd: 1100, format: 'Tech Thread' },
      { id: 'k7', day: 19, channelId: 'yt_shorts', tier: 'ECHO_RETARGET', title: 'Batch-01 Preorder 80% Full', timeWib: '20:30', budgetBoostUsd: 3600, format: 'Retarget Cut' },
      { id: 'k8', day: 25, channelId: 'ig_reels', tier: 'HERO_DROP', title: 'PRE-ORDER CLOSING BELL', timeWib: '21:00', budgetBoostUsd: 5800, format: 'Final Call' },
    ],
    patches: [
      { id: 'kp-1', sourceId: 'src_creator_echo', targetId: 'dst_spark_boost', color: '#00E5FF' },
      { id: 'kp-2', sourceId: 'src_hook_drop', targetId: 'dst_swap_hook', color: '#FFB800' },
    ],
  },
  {
    id: 'camp-solstice-brew',
    tapeCode: 'TAPE 03',
    name: 'SOLSTICE NITRO // CITY PULSE',
    brand: 'SOLSTICE ROASTERS LAB',
    objective: 'OMNICHANNEL SAMPLING & URBAN HABIT LOOP',
    status: 'STANDBY',
    monthLabel: 'NOVEMBER 2026',
    tempoBpm: 138,
    accentColor: '#FF5E1A',
    knobs: {
      driveBudget: 46,
      freqCadence: 79,
      resonanceHook: 84,
      warmthCreator: 66,
      stereoWidth: 76,
      delayTail: 44,
    },
    channels: [
      { id: 'ig_reels', code: 'CH-01', name: 'IG REELS', shortName: 'REELS', fader: 82, panPaid: 0, muted: false, solo: false, color: '#00F59B', baseCpm: 4.5, baseCtr: 4.2, harmonicRatio: 1.0 },
      { id: 'tiktok', code: 'CH-02', name: 'TIKTOK PULSE', shortName: 'TIKTOK', fader: 95, panPaid: -20, muted: false, solo: false, color: '#FF5E1A', baseCpm: 3.6, baseCtr: 5.1, harmonicRatio: 1.65 },
      { id: 'yt_shorts', code: 'CH-03', name: 'YT SHORTS', shortName: 'SHORTS', fader: 50, panPaid: 10, muted: false, solo: false, color: '#00E5FF', baseCpm: 4.3, baseCtr: 3.4, harmonicRatio: 2.2 },
      { id: 'x_threads', code: 'CH-04', name: 'X // THREADS', shortName: 'X/THRD', fader: 72, panPaid: -35, muted: false, solo: false, color: '#FFB800', baseCpm: 3.9, baseCtr: 3.7, harmonicRatio: 3.1 },
      { id: 'spotify_drop', code: 'CH-05', name: 'AUDIO // DROP', shortName: 'AUDIO', fader: 64, panPaid: 15, muted: false, solo: false, color: '#FF2A6D', baseCpm: 5.1, baseCtr: 2.9, harmonicRatio: 0.65 },
    ],
    stems: [
      {
        id: 'sb-1',
        trackNum: '01',
        title: 'NITRO CAN CRACK SOUND-WAVE',
        format: 'ASMR HOOK',
        channelId: 'tiktok',
        durationSec: 11,
        hookScore: 95,
        ctrBase: 5.8,
        roasBase: 4.9,
        viewsBaseK: 1650,
        retentionCurve: [100, 97, 94, 90, 87, 83, 80, 77, 75, 72, 70, 68, 66, 65, 63, 62],
        status: 'HOT',
        boosted: true,
      },
      {
        id: 'sb-2',
        trackNum: '02',
        title: '2PM COMMUTER SLUMP RESCUE',
        format: 'STREET POV REEL',
        channelId: 'ig_reels',
        durationSec: 22,
        hookScore: 83,
        ctrBase: 4.4,
        roasBase: 4.5,
        viewsBaseK: 890,
        retentionCurve: [100, 90, 84, 79, 75, 71, 68, 65, 62, 59, 57, 54, 52, 50, 48, 47],
        status: 'NOMINAL',
        boosted: false,
      },
      {
        id: 'sb-3',
        trackNum: '03',
        title: 'SECRET COFFEE RAVE LOCATION DROP',
        format: 'GEO PASS THREAD',
        channelId: 'x_threads',
        durationSec: 15,
        hookScore: 90,
        ctrBase: 5.0,
        roasBase: 5.3,
        viewsBaseK: 730,
        retentionCurve: [100, 92, 88, 84, 80, 77, 73, 70, 68, 65, 62, 60, 58, 56, 55, 53],
        status: 'HOT',
        boosted: true,
      },
    ],
    sequencer: [
      { id: 'sb-s1', day: 1, channelId: 'tiktok', tier: 'HERO_DROP', title: 'Nitro Can Crack Sound Challenge', timeWib: '14:00', budgetBoostUsd: 2600, format: 'ASMR Spark' },
      { id: 'sb-s2', day: 3, channelId: 'x_threads', tier: 'VIRAL_BURST', title: 'Secret Rooftop Brew Coordinates', timeWib: '15:00', budgetBoostUsd: 1100, format: 'Geo Drop' },
      { id: 'sb-s3', day: 6, channelId: 'ig_reels', tier: 'HERO_DROP', title: 'Weekend Morning Rave Recap', timeWib: '11:00', budgetBoostUsd: 3400, format: 'Recap Reel' },
      { id: 'sb-s4', day: 10, channelId: 'spotify_drop', tier: 'TEASER', title: '2PM Focus Beats Sponsored Session', timeWib: '14:00', budgetBoostUsd: 1800, format: 'Audio Trigger' },
      { id: 'sb-s5', day: 13, channelId: 'tiktok', tier: 'VIRAL_BURST', title: 'Barista Speed-Pour Duet', timeWib: '15:30', budgetBoostUsd: 2200, format: 'Creator Duet' },
      { id: 'sb-s6', day: 20, channelId: 'ig_reels', tier: 'ECHO_RETARGET', title: 'Bundle 12-Pack Subscription Echo', timeWib: '19:00', budgetBoostUsd: 2900, format: 'Shoppable Reel' },
    ],
    patches: [
      { id: 'sbp-1', sourceId: 'src_viral_spike', targetId: 'dst_cross_pan', color: '#FF5E1A' },
    ],
  },
];

/**
 * Real-time Campaign Synthesizer Telemetry Engine
 * Computes realistic marketing performance metrics dynamically from knobs, mixer faders,
 * sequencer density, content stem boosts, and active modular patch cables.
 */
export function computeTelemetry(campaign: CampaignPatch): TelemetrySnapshot {
  const { knobs, channels, sequencer, patches, stems } = campaign;

  // Base budget from DRIVE knob ($15,000 to $250,000) + scheduled boost additions
  const baseDriveUsd = Math.round(15000 + Math.pow(knobs.driveBudget / 100, 1.35) * 235000);
  const sequencerBoostUsd = sequencer.reduce((acc, s) => acc + s.budgetBoostUsd, 0);
  const budgetUsd = baseDriveUsd + sequencerBoostUsd;
  const dailyBurnUsd = Math.round(budgetUsd / 28);

  // Determine active channels (respect Solo & Mute)
  const hasSolo = channels.some((c) => c.solo);
  const activeChannels = channels.map((ch) => {
    const isActive = hasSolo ? ch.solo : !ch.muted && ch.fader > 0;
    return { ...ch, isActive, effectiveGain: isActive ? ch.fader : 0 };
  });

  const totalGain = activeChannels.reduce((s, c) => s + c.effectiveGain, 0) || 1;

  // Audience fatigue / clipping distortion (THD %)
  // Pushing high cadence + ultra-aggressive hook without enough creator warmth causes ad fatigue clipping!
  const aggressionPressure =
    (knobs.freqCadence * 0.52 + knobs.resonanceHook * 0.48) - knobs.warmthCreator * 0.42;
  const rawThd = Math.max(0.4, (aggressionPressure - 28) * 0.24);
  const hasAntiFatiguePatch = patches.some((p) => p.targetId === 'dst_swap_hook');
  const thdClippingPct = Number(
    Math.min(18.5, Math.max(0.3, rawThd * (hasAntiFatiguePatch ? 0.58 : 1))).toFixed(1)
  );
  const isClipping = thdClippingPct >= 8.0;

  // Patch Bay Automation Multipliers
  let patchRoasBonus = 0;
  let patchCtrBonus = 0;
  patches.forEach((cable) => {
    const src = PATCH_SOURCES.find((s) => s.id === cable.sourceId);
    const dst = PATCH_TARGETS.find((t) => t.id === cable.targetId);
    if (src && dst) {
      patchRoasBonus += (src.roasLift + dst.roasLift) * 0.5;
      patchCtrBonus += (src.ctrLift + dst.ctrLift) * 0.5;
    }
  });

  // Boosted stems multiplier
  const boostedCount = stems.filter((st) => st.boosted).length;
  const stemBonus = 1 + boostedCount * 0.035;

  // Per-channel breakdown
  const channelMetrics: TelemetrySnapshot['channelMetrics'] = {};
  let totalImpressionsK = 0;
  let weightedCtrSum = 0;
  let weightedRoasSum = 0;

  activeChannels.forEach((ch) => {
    const share = ch.isActive ? ch.effectiveGain / totalGain : 0;
    const spendUsd = Math.round(budgetUsd * share);

    // Paid vs Organic pan modifier: negative pan = more organic viral efficiency (lower effective CPM, slightly slower scale)
    const paidRatio = (ch.panPaid + 50) / 100; // 0..1
    const effectiveCpm =
      ch.baseCpm *
      (0.75 + paidRatio * 0.45) *
      (1 - (knobs.stereoWidth / 100) * 0.18);

    // Sequencer drops on this channel boost organic reach
    const channelDrops = sequencer.filter((s) => s.channelId === ch.id).length;
    const cadenceMult = 0.82 + (knobs.freqCadence / 100) * 0.52 + channelDrops * 0.035;

    const impressionsK = ch.isActive
      ? Math.round((spendUsd / Math.max(2.1, effectiveCpm)) * cadenceMult)
      : 0;

    // Channel CTR & ROAS
    const hookFactor = 0.72 + (knobs.resonanceHook / 100) * 0.68;
    const warmthFactor = 0.78 + (knobs.warmthCreator / 100) * 0.55;
    const retargetFactor = 0.88 + (knobs.delayTail / 100) * 0.36;
    const fatiguePenalty = isClipping ? 1 - (thdClippingPct - 6) * 0.018 : 1;

    const chCtr =
      ch.baseCtr * hookFactor * (1 + patchCtrBonus * 0.35) * fatiguePenalty;
    const chRoas =
      (2.4 + (ch.baseCtr / 4.2) * 1.65) *
      warmthFactor *
      retargetFactor *
      stemBonus *
      (1 + patchRoasBonus * 0.45) *
      (1.08 - (knobs.stereoWidth / 100) * 0.16) *
      fatiguePenalty;

    const vuLevel = ch.isActive
      ? Math.min(100, Math.round(ch.fader * (0.72 + (knobs.driveBudget / 100) * 0.36)))
      : 0;

    channelMetrics[ch.id] = {
      active: ch.isActive,
      sharePct: Math.round(share * 100),
      spendUsd,
      impressionsK,
      vuLevel,
      roas: Number(chRoas.toFixed(2)),
    };

    totalImpressionsK += impressionsK;
    weightedCtrSum += chCtr * share;
    weightedRoasSum += chRoas * share;
  });

  const impressionsM = Number((totalImpressionsK / 1000).toFixed(2));
  const reachUniqueM = Number(
    (impressionsM * (0.52 + (knobs.stereoWidth / 100) * 0.28)).toFixed(2)
  );
  const blendedCtr = Number(Math.max(0.8, weightedCtrSum).toFixed(2));
  const blendedRoas = Number(Math.max(1.1, weightedRoasSum).toFixed(2));

  const clicks = totalImpressionsK * 1000 * (blendedCtr / 100);
  const convRate =
    0.022 *
    (0.75 + (knobs.warmthCreator / 100) * 0.65) *
    (0.85 + (knobs.delayTail / 100) * 0.45);
  const conversions = Math.max(12, Math.round(clicks * convRate));
  const cpaUsd = Number((budgetUsd / Math.max(1, conversions)).toFixed(2));

  // Signal-to-Noise Ratio dB (Studio Quality Score 40dB .. 98dB)
  const rawSnr =
    58 +
    blendedRoas * 5.2 +
    patches.length * 2.4 -
    thdClippingPct * 1.45;
  const snrDb = Number(Math.min(98.4, Math.max(38.0, rawSnr)).toFixed(1));

  return {
    budgetUsd,
    dailyBurnUsd,
    impressionsM,
    reachUniqueM,
    conversions,
    blendedCtr,
    blendedRoas,
    cpaUsd,
    snrDb,
    thdClippingPct,
    isClipping,
    scheduledDropsCount: sequencer.length,
    activePatchBonusPct: Math.round(patchRoasBonus * 45),
    channelMetrics,
  };
}
