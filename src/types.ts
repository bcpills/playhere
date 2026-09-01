export type GameTab = 
  | 'home' 
  | 'slots'
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
  crates: LootCrate[];
  seats: (BattleSeat | null)[];
  status: 'waiting' | 'in-progress' | 'completed';
  currentRound: number;
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
  roundsPlayedDiceDuels?: number;
  roundsPlayedCoinflip?: number;
  roundsPlayedSlots?: number;
  dailyWagerGoldCoins?: number;
  dailyWagerCash?: number;
  lastDailyWagerDateEst?: string;
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

export type UserRole = 'player' | 'moderator' | 'admin';
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
  userRole?: UserRole;
  isRegistered: boolean;
  dailyStreak: number;
  lastDailyClaim: number;
  lastActiveEstDate: string; // YYYY-MM-DD in EST
  peakBalanceAllTime: number; // Highest chip count reached
  cashBalance?: number; // Real Money / Sweeps Cash in $USD (Starts with $2.00 Sign Up Bonus)
  lastDailyDollarClaimEstDate?: string; // YYYY-MM-DD for Daily Dollar Reload ($1.00 + 100k GC at Midnight EST)
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
  category: string;
  chips: number;
  formattedScore?: string;
  badge?: string;
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
  winningChips: number;
  formattedScore: string;
  payoutStatus: 'Pending' | 'Paid' | 'Processing' | 'Rejected';
  payoutNote?: string;
  paidAt?: number;
  isUser?: boolean;
}

export interface FakePlayer {
  id: string;
  username: string;
  avatar: string;
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
  vipTier: VIPTier;
  balance: number;
  peakBalance: number;
  totalWagered: number;
  accountStatus: AccountStatus;
  accountType: AccountType;
  userRole?: UserRole;
  isAdFree: boolean;
  createdAt: number;
  lastActive: string;
  isCurrentUser?: boolean;
  chatCount?: number;
}

// REAL MONEY & CASHIER SYSTEM TYPES
export type PayoutStatus = 'Pending' | 'Processing' | 'Paid' | 'Rejected';
export type PaymentMethod = 'card' | 'crypto' | 'paypal' | 'apple_pay' | 'cashapp' | 'bank_wire';

export interface PayoutRequest {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  chipsAmount: number;
  usdAmount: number;
  method: 'bank_wire' | 'crypto' | 'paypal' | 'cashapp';
  destination: string; // Account # / routing, wallet address, paypal email, $cashtag
  destinationDetails?: {
    accountHolder?: string;
    bankName?: string;
    routingNumber?: string;
    cryptoNetwork?: string;
    walletAddress?: string;
    tagOrEmail?: string;
  };
  requestedAt: number;
  status: PayoutStatus;
  adminNote?: string;
  processedAt?: number;
  processedBy?: string;
  transactionRef?: string;
}

export interface DepositTransaction {
  id: string;
  userId: string;
  username: string;
  usdAmount: number;
  chipsCredited: number;
  method: PaymentMethod;
  timestamp: number;
  status: 'Completed' | 'Failed';
  transactionRef: string;
  methodDetails?: string;
}

export interface BalanceAdjustmentLog {
  id: string;
  userId: string;
  username: string;
  amountChanged: number; // e.g. +5000 or -2000
  previousBalance: number;
  newBalance: number;
  reason: string;
  adjustedBy: string;
  timestamp: number;
}
