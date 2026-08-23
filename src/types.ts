export type GameTab = 'home' | 'blackjack' | 'keno' | 'unboxer' | 'inventory' | 'leaderboard';

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number;
  isAce: boolean;
  hidden?: boolean;
}

export type BlackjackStage = 
  | 'betting'
  | 'dealing'
  | 'player-turn'
  | 'dealer-turn'
  | 'game-over';

export interface BlackjackSideBets {
  twentyOnePlusThree: number;
  perfectPairs: number;
  luckyLadies: number;
}

export interface SideBetResults {
  twentyOnePlusThree?: { name: string; multiplier: number; win: number };
  perfectPairs?: { name: string; multiplier: number; win: number };
  luckyLadies?: { name: string; multiplier: number; win: number };
}

export interface HandResult {
  outcome: 'win' | 'lose' | 'push' | 'blackjack' | 'bust' | 'surrender';
  payout: number;
  message: string;
}

export interface PlayerHand {
  id: string;
  cards: Card[];
  bet: number;
  status: 'active' | 'stood' | 'busted' | 'blackjack' | 'doubled' | 'surrendered';
  result?: HandResult;
}

export type KenoDifficulty = 'safe' | 'classic' | 'degen';

export type KenoPaytable = Record<number, Record<number, number>>;

export interface KenoPayoutTier {
  hits: number;
  multiplier: number;
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'classified' | 'covert' | 'mythic' | 'exotic';

export interface LootItem {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  value: number; // chip resale / instant cash value
  icon: string;
  color: string;
  bgGradient: string;
  dropWeight: number; // For RNG wheel
  lore: string;
}

export interface LootCrate {
  id: string;
  name: string;
  tagline: string;
  cost: number;
  icon: string;
  accentColor: string;
  glowColor: string;
  items: LootItem[];
}

export interface InventoryItem {
  instanceId: string;
  item: LootItem;
  obtainedAt: number;
  crateId: string;
}

export interface CasinoStats {
  totalWagered: number;
  totalWon: number;
  totalLost: number;
  netProfit: number;
  handsPlayedBlackjack: number;
  roundsPlayedKeno: number;
  cratesOpened: number;
  biggestWin: number;
  biggestMultiplier: number;
  sideBetWinsBlackjack: number;
  bailoutCount: number;
}

export type VIPTier = 
  | 'Bronze Degen' 
  | 'Silver Grinder' 
  | 'Gold Regular' 
  | 'Platinum Shark' 
  | 'Diamond High-Roller' 
  | 'Whale of the Lounge' 
  | 'Sovereign Degenerate';

export interface UserAccount {
  id: string;
  username: string;
  avatar: string;
  title: string;
  bio: string;
  luckyNumber: number;
  createdAt: number;
  lastDailyClaim: number;
  dailyStreak: number;
}

export type LeaderboardCategory = 'profit' | 'multiplier' | 'volume' | 'vault';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  vipTier: VIPTier;
  score: number;
  formattedScore: string;
  badge?: string;
  isUser?: boolean;
}
