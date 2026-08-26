import { LootItem, VIPTier } from '../types';

export interface MilestoneCrateDef {
  id: string;
  title: string;
  vipTierRequired: VIPTier;
  minWager: number;
  levelBadge: string;
  bonusChips: number;
  description: string;
  icon: string;
  color: string;
  borderColor: string;
  rewardItem: LootItem;
}

export const MILESTONE_CRATES: MilestoneCrateDef[] = [
  {
    id: 'milestone-bronze-init',
    title: '🥉 Rookie Degen Crate',
    vipTierRequired: 'Bronze Degen',
    minWager: 100,
    levelBadge: 'Wager 100c',
    bonusChips: 100,
    description: 'Unlocked by making your first bets in the casino.',
    icon: '📦',
    color: 'from-zinc-800 to-zinc-900',
    borderColor: 'border-zinc-700',
    rewardItem: {
      id: 'item-milestone-dice-wood',
      name: 'Rookie Wooden Dice Set',
      description: 'A modest pair of polished oak dice for casino newcomers.',
      rarity: 'uncommon',
      value: 150,
      icon: '🎲',
      color: '#4ade80',
      bgGradient: 'from-emerald-950 to-zinc-900',
      dropWeight: 100,
      lore: 'Carved by early casino founders to test game fairness.',
    },
  },
  {
    id: 'milestone-silver-grinder',
    title: '🥈 Silver Grinder Supply Box',
    vipTierRequired: 'Silver Grinder',
    minWager: 1000,
    levelBadge: 'Silver VIP (1,000c)',
    bonusChips: 500,
    description: 'Awarded for reaching Silver VIP rank.',
    icon: '💼',
    color: 'from-sky-950 to-zinc-900',
    borderColor: 'border-sky-500/60',
    rewardItem: {
      id: 'item-milestone-silver-chips',
      name: 'Silver Ingot Playing Card',
      description: 'An engraved silver commemorative playing card.',
      rarity: 'rare',
      value: 800,
      icon: '🃏',
      color: '#38bdf8',
      bgGradient: 'from-sky-950 to-zinc-900',
      dropWeight: 60,
      lore: 'Forged from genuine casino reserve bullion.',
    },
  },
  {
    id: 'milestone-gold-regular',
    title: '🥇 Gold Regular Vault Crate',
    vipTierRequired: 'Gold Regular',
    minWager: 5000,
    levelBadge: 'Gold VIP (5,000c)',
    bonusChips: 2500,
    description: 'Awarded for achieving Gold VIP status.',
    icon: '🏆',
    color: 'from-amber-950 to-zinc-900',
    borderColor: 'border-amber-500/60',
    rewardItem: {
      id: 'item-milestone-gold-watch',
      name: '24K Golden Pocket Watch',
      description: 'Gilded Swiss movement pocket watch with diamond accents.',
      rarity: 'classified',
      value: 3500,
      icon: '⏱️',
      color: '#facc15',
      bgGradient: 'from-amber-950 to-zinc-900',
      dropWeight: 30,
      lore: 'Ticks in rhythm with the midnight tournament countdown.',
    },
  },
  {
    id: 'milestone-platinum-shark',
    title: '🔮 Platinum Shark Safe',
    vipTierRequired: 'Platinum Shark',
    minWager: 25000,
    levelBadge: 'Platinum VIP (25k c)',
    bonusChips: 10000,
    description: 'Exclusive lockbox for Platinum table dominators.',
    icon: '🔮',
    color: 'from-purple-950 to-zinc-900',
    borderColor: 'border-purple-500/60',
    rewardItem: {
      id: 'item-milestone-karambit-plasma',
      name: '★ Karambit | Plasma Fade ★',
      description: 'Curved talon blade reflecting high-voltage neon hues.',
      rarity: 'covert',
      value: 18000,
      icon: '🗡️',
      color: '#c084fc',
      bgGradient: 'from-purple-950 to-zinc-900',
      dropWeight: 15,
      lore: 'Wielded only by sharks with cold calculation.',
    },
  },
  {
    id: 'milestone-diamond-highroller',
    title: '💎 Diamond High-Roller Coffer',
    vipTierRequired: 'Diamond High-Roller',
    minWager: 100000,
    levelBadge: 'Diamond VIP (100k c)',
    bonusChips: 45000,
    description: 'Prestigious treasure chest for Diamond High-Rollers.',
    icon: '💎',
    color: 'from-cyan-950 to-zinc-900',
    borderColor: 'border-cyan-400/70',
    rewardItem: {
      id: 'item-milestone-diamond-crown',
      name: '★ Imperial Diamond Crown ★',
      description: 'Heirloom crown encrusted with flawless brilliant-cut diamonds.',
      rarity: 'mythic',
      value: 75000,
      icon: '👑',
      color: '#22d3ee',
      bgGradient: 'from-cyan-950 to-zinc-900',
      dropWeight: 5,
      lore: 'The ultimate symbol of diamond-tier luxury.',
    },
  },
  {
    id: 'milestone-whale-lounge',
    title: '🐋 Whale of the Lounge Apex Cache',
    vipTierRequired: 'Whale of the Lounge',
    minWager: 500000,
    levelBadge: 'Whale VIP (500k c)',
    bonusChips: 200000,
    description: 'Legendary Apex container for high-stakes casino royalty.',
    icon: '🐋',
    color: 'from-rose-950 to-zinc-900',
    borderColor: 'border-rose-500/70',
    rewardItem: {
      id: 'item-milestone-butterfly-ruby',
      name: '★ Butterfly Knife | Doppler Ruby ★',
      description: 'Custom-balanced balisong forged from deep blood ruby composite.',
      rarity: 'exotic',
      value: 350000,
      icon: '🦋',
      color: '#f43f5e',
      bgGradient: 'from-rose-950 to-zinc-900',
      dropWeight: 2,
      lore: 'The prized possession of high-roller whales.',
    },
  },
  {
    id: 'milestone-sovereign-degen',
    title: '👑 Sovereign Degenerate Master Vault',
    vipTierRequired: 'Sovereign Degenerate',
    minWager: 2000000,
    levelBadge: 'Sovereign VIP (2M c)',
    bonusChips: 1000000,
    description: 'The pinnacle of casino wealth and degen supremacy.',
    icon: '🔱',
    color: 'from-yellow-950 via-amber-900 to-zinc-950',
    borderColor: 'border-yellow-300',
    rewardItem: {
      id: 'item-milestone-dragon-lore-gold',
      name: '★ AWP | Sovereign Dragon Lore (Gold Foil) ★',
      description: 'Masterpiece sniper rifle wrapped in 24-karat gold foil dragon knots.',
      rarity: 'exotic',
      value: 1500000,
      icon: '🐉',
      color: '#eab308',
      bgGradient: 'from-yellow-950 to-zinc-900',
      dropWeight: 1,
      lore: 'Legends say this weapon has never missed a jackpot.',
    },
  },
];

export function isMilestoneUnlocked(milestone: MilestoneCrateDef, totalWagered: number): boolean {
  return totalWagered >= milestone.minWager;
}

export function isMilestoneClaimed(milestoneId: string, claimedList?: string[]): boolean {
  return !!claimedList && claimedList.includes(milestoneId);
}

export function getUnclaimedMilestoneCount(totalWagered: number, claimedList?: string[]): number {
  return MILESTONE_CRATES.filter(m => isMilestoneUnlocked(m, totalWagered) && !isMilestoneClaimed(m.id, claimedList)).length;
}
