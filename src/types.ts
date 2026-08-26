export type GameTab = 
  | 'home' 
  | 'blackjack' 
  | 'keno' 
  | 'unboxer' 
  | 'crate-battles' 
  | 'mines' 
  | 'dice-duels' 
  | 'coinflip' 
  | 'leaderboard';

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
  dropWeight: number;
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

export type BattleMode = '1v1' | '2v2' | 'group-ffa' | 'group-split';

export interface BattleSeat {
  id: string;
  name: string;
  avatar: string;
  isAI: boolean;
  isUser: boolean;
  team?: 1 | 2;
  ready: boolean;
  currentTotalValue: number;
  unboxedItems: LootItem[];
}

export interface CrateBattle {
  id: string;
  title: string;
  mode: BattleMode;
  maxPlayers: number;
  crates: LootCrate[]; // Ordered from least expensive to most expensive
  seats: (BattleSeat | null)[];
  status: 'waiting' | 'in-progress' | 'completed';
  currentRound: number; // 0 to crates.length - 1
  createdAt: number;
  createdBy: string;
  winnerTeam?: 1 | 2;
  winnerSeatIndex?: number;
  sharedPotPerPlayer?: number;
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
  roundsPlayedMines?: number;
  roundsPlayedDice?: number;
  roundsPlayedCoinflip?: number;
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

export type ContactPlatform = 'discord' | 'telegram';

export type AccountStatus = 'active' | 'moderator' | 'banned' | 'closed';
export type AccountType = 'free' | 'paid';

export interface UserAccount {
  id: string;
  username: string;
  avatar: string;
  title: string;
  bio: string;
  luckyNumber: number;
  createdAt: number;
  contactPlatform: ContactPlatform;
  contactHandle: string;
  isRegistered: boolean;
  dailyStreak: number;
  lastDailyClaim: number;
  lastActiveEstDate: string; // YYYY-MM-DD in EST
  peakBalanceAllTime: number; // Highest chip count reached
  unclaimedRakeback?: number; // Accumulated instant rakeback
  totalRakebackClaimed?: number; // Total rakeback redeemed all-time
  claimedMilestoneCrates?: string[]; // IDs of claimed VIP milestone crates
  authMethod?: 'google' | 'email' | 'guest';
  email?: string;
  googleLinked?: boolean;
  googleEmail?: string;
  googleName?: string;
  googlePicture?: string;
  isAdFree?: boolean;
  accountType?: AccountType;
  accountStatus?: AccountStatus;
  bannedReason?: string;
  currentPlacement?: number;
  highestEverPlacement?: number;
}

export interface PlayerPlacementRecord {
  id: string;
  dateEst: string; // YYYY-MM-DD
  formattedDate: string;
  rank: number; // 1, 2, 3, etc.
  category: string; // 'Daily Race' | 'Peak All-Time' | 'Tournament Winner'
  chips: number;
  formattedScore?: string;
  badge?: string; // '🏆 Daily Champion' | '🥈 Runner-Up' | '🥉 Bronze' | '⭐ Top 5'
  payoutStatus?: 'Paid' | 'Pending' | 'Processing' | 'None';
}

export type LeaderboardCategory = 'profit' | 'multiplier' | 'volume';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  vipTier: VIPTier;
  score: number;
  formattedScore: string;
  contactPlatform?: ContactPlatform;
  contactHandle?: string;
  badge?: string;
  isUser?: boolean;
}

export interface DailyWinnerRecord {
  id: string;
  dateEst: string; // YYYY-MM-DD
  formattedDate: string;
  username: string;
  avatar: string;
  vipTier: VIPTier;
  contactPlatform: ContactPlatform;
  contactHandle: string;
  winningChips: number;
  formattedScore: string;
  payoutStatus: 'Pending' | 'Paid' | 'Processing';
  payoutNote?: string;
  paidAt?: number;
  isUser?: boolean;
}

export interface FakePlayer {
  id: string;
  username: string;
  avatar: string;
  contactPlatform: ContactPlatform;
  contactHandle: string;
  vipTier: VIPTier;
  balance: number;
  baseMultiplier: number;
  baseVolume: number;
  baseVault: number;
}

export interface AllTimePeakRecord {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  contactPlatform: ContactPlatform;
  contactHandle: string;
  vipTier: VIPTier;
  peakChips: number;
  formattedScore: string;
  dateAchieved: string;
  isUser?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  username: string;
  avatar: string;
  vipTier: VIPTier;
  text: string;
  timestamp: number;
  badge?: string;
  type?: 'chat' | 'system' | 'jackpot' | 'mod_action' | 'rain';
  contactPlatform?: ContactPlatform;
  contactHandle?: string;
  balance?: number;
  totalWagered?: number;
  isUser?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  rainAmount?: number;
  rainRecipients?: number;
}

export interface PlayerProfileData {
  id: string;
  username: string;
  avatar: string;
  vipTier: VIPTier;
  contactPlatform?: ContactPlatform;
  contactHandle?: string;
  balance: number;
  peakBalance?: number;
  bio?: string;
  luckyNumber?: number;
  totalWagered?: number;
  cratesOpened?: number;
  isUser?: boolean;
  isAdmin?: boolean;
  email?: string;
  accountStatus?: AccountStatus;
  accountType?: AccountType;
  isAdFree?: boolean;
  currentPlacement?: number;
  highestEverPlacement?: number;
  placementHistory?: PlayerPlacementRecord[];
}

export interface AdminManagedUser {
  id: string;
  username: string;
  avatar: string;
  email?: string;
  contactPlatform: ContactPlatform;
  contactHandle: string;
  vipTier: VIPTier;
  balance: number;
  peakBalance: number;
  totalWagered: number;
  accountStatus: AccountStatus;
  accountType: AccountType;
  isAdFree: boolean;
  createdAt: number;
  lastActive: string;
  isCurrentUser?: boolean;
  chatCount?: number;
}
