export type SlotGameId = 'neon777' | 'holdAndWin';

export interface BaseSlotSymbol {
  id: string;
  name: string;
  emoji: string;
  color: string;
  glow?: string;
  payouts: [number, number, number]; // 3, 4, 5 of a kind multipliers
  isWild?: boolean;
  isScatter?: boolean;
  isBonusOrb?: boolean;
  orbValue?: number; // Multiplier of base bet
  jackpotType?: 'mini' | 'minor' | 'major' | 'grand';
}

export interface BonusSummaryData {
  gameTitle: string;
  bonusType: 'free_spins' | 'hold_and_win';
  currencyMode: 'gc' | 'cash';
  totalWon: number;
  multiplier: number;
  totalSpinsOrOrbs: number;
  jackpotHit?: 'mini' | 'minor' | 'major' | 'grand' | null;
  featureDetails: string;
}
