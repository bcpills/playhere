import { LootCrate, LootItem, ItemRarity } from '../types';

export const RARITY_CONFIG: Record<ItemRarity, {
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
  text: string;
}> = {
  common: {
    label: 'Common',
    color: '#9ca3af',
    bg: 'from-zinc-900 to-zinc-950',
    border: 'border-zinc-700',
    glow: 'shadow-zinc-800/20',
    text: 'text-zinc-400',
  },
  uncommon: {
    label: 'Uncommon',
    color: '#3b82f6',
    bg: 'from-blue-950/60 to-zinc-950',
    border: 'border-blue-500/50',
    glow: 'shadow-blue-500/20',
    text: 'text-blue-400',
  },
  rare: {
    label: 'Rare',
    color: '#a855f7',
    bg: 'from-purple-950/60 to-zinc-950',
    border: 'border-purple-500/50',
    glow: 'shadow-purple-500/30',
    text: 'text-purple-400',
  },
  classified: {
    label: 'Classified',
    color: '#ec4899',
    bg: 'from-pink-950/60 to-zinc-950',
    border: 'border-pink-500/60',
    glow: 'shadow-pink-500/30',
    text: 'text-pink-400',
  },
  covert: {
    label: 'Covert',
    color: '#ef4444',
    bg: 'from-red-950/70 to-zinc-950',
    border: 'border-red-500/70',
    glow: 'shadow-red-500/40',
    text: 'text-red-400',
  },
  mythic: {
    label: 'Mythic',
    color: '#f59e0b',
    bg: 'from-amber-950/80 to-zinc-950',
    border: 'border-amber-500/80',
    glow: 'shadow-amber-500/50',
    text: 'text-amber-300',
  },
  exotic: {
    label: '★ Exotic Special ★',
    color: '#eab308',
    bg: 'from-yellow-950/90 via-amber-950/80 to-purple-950/90',
    border: 'border-yellow-400',
    glow: 'shadow-yellow-400/60 animate-pulse',
    text: 'text-yellow-300',
  },
};

// Crate 1: Bum Bag Crate ($10)
const BUM_BAG_ITEMS: LootItem[] = [
  { id: 'bb-1', name: 'Half-Smoked Marlboro', description: 'Still has two good drags left on it.', rarity: 'common', value: 2, icon: '🚬', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 40, lore: 'Vintage casino alley floor drop.' },
  { id: 'bb-2', name: 'Scratched Lottery Ticket', description: 'Lost by 1 single digit.', rarity: 'common', value: 3, icon: '🎫', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 35, lore: 'The numbers that got away.' },
  { id: 'bb-3', name: 'Sticky Casino Coaster', description: 'Vintage stains from a 3 AM White Russian.', rarity: 'common', value: 5, icon: '🍸', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 25, lore: 'Guaranteed to stick to the glass.' },
  { id: 'bb-4', name: 'Expired Buffet Coupon', description: 'Expired in 2018. Pit boss gave you a roll.', rarity: 'uncommon', value: 12, icon: '🥩', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 18, lore: 'Prime rib memories.' },
  { id: 'bb-5', name: 'Brass Keyring Opener', description: 'Essential tools for degenerate longevity.', rarity: 'uncommon', value: 18, icon: '🔑', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 14, lore: 'Opens beers and dubious opportunities.' },
  { id: 'bb-6', name: 'Neon Sunglasses', description: 'Look like a baller under fluorescent bulbs.', rarity: 'rare', value: 35, icon: '🕶️', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 8, lore: 'For squinting at pocket aces.' },
  { id: 'bb-7', name: 'Rusty High-Roller Zippo', description: 'Engraved: "Fortune favors the stubborn".', rarity: 'classified', value: 75, icon: '🔥', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 4, lore: 'Smells of butane and glory.' },
  { id: 'bb-8', name: 'Golden Slot Knob', description: 'Ripped straight off a Lucky 7s machine.', rarity: 'covert', value: 160, icon: '🕹️', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 1.5, lore: 'Pulls the jackpot every time in your mind.' },
  { id: 'bb-9', name: '★ Karambit | Cardboard Fade ★', description: 'Crafted from an Amazon Prime box. Factory New.', rarity: 'exotic', value: 450, icon: '🗡️', color: '#eab308', bgGradient: 'from-yellow-950 to-purple-950', dropWeight: 0.5, lore: 'Highest tier cardboard craftsmanship.' },
];

// Crate 2: Street Hustler Case ($50)
const STREET_HUSTLER_ITEMS: LootItem[] = [
  { id: 'sh-1', name: 'Used Lucky 8-Ball', description: 'Outlook not so good.', rarity: 'common', value: 15, icon: '🎱', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 35, lore: 'Never consult on a hard 16.' },
  { id: 'sh-2', name: 'Plastic Poker Visor', description: 'Essential gear for squinting at 2-7 offsuit.', rarity: 'common', value: 25, icon: '🧢', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 28, lore: 'Shields eyes from bad decisions.' },
  { id: 'sh-3', name: 'Loaded Dice Set', description: 'Weighted on the 6. Hide from the pit boss.', rarity: 'uncommon', value: 65, icon: '🎲', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 20, lore: 'Natural sevens on demand.' },
  { id: 'sh-4', name: 'Sleeve Mirror', description: 'Subtle reflections for degenerate precision.', rarity: 'uncommon', value: 90, icon: '🪞', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 15, lore: 'Look at the cards, not the mirror.' },
  { id: 'sh-5', name: 'Velvet Dice Cup', description: 'Lined with pure purple felt from Monte Carlo.', rarity: 'rare', value: 175, icon: '🏆', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 10, lore: 'Rolls high, stays quiet.' },
  { id: 'sh-6', name: 'Gold Foil Strategy Card', description: 'Memorized by few, ignored by many.', rarity: 'classified', value: 380, icon: '🃏', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 5, lore: 'Always split aces and eights.' },
  { id: 'sh-7', name: 'Solid Silver Chip (1000 Denom)', description: 'Hefty, cold, and satisfying to flick.', rarity: 'covert', value: 850, icon: '🪙', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 2, lore: 'Clinks like pure success.' },
  { id: 'sh-8', name: '★ Butterfly Knife | Case Hardened ★', description: 'Blue gem pattern on authentic digital steel.', rarity: 'exotic', value: 2400, icon: '🦋', color: '#eab308', bgGradient: 'from-yellow-950 to-purple-950', dropWeight: 0.6, lore: 'Flick it smoothly at the craps table.' },
];

// Crate 3: High Roller Vault ($200)
const HIGH_ROLLER_ITEMS: LootItem[] = [
  { id: 'hr-1', name: 'Chilled Crystal Tumbler', description: 'Poured with single-malt 25yr scotch.', rarity: 'uncommon', value: 120, icon: '🥃', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 35, lore: 'Top shelf comps.' },
  { id: 'hr-2', name: 'Platinum Cigar Cutter', description: 'Slices through doubt and hesitation.', rarity: 'rare', value: 320, icon: '✂️', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 25, lore: 'Pure executive precision.' },
  { id: 'hr-3', name: 'Rolex | Day-Date Diamond', description: 'Tells you when you should have cashed out.', rarity: 'classified', value: 950, icon: '⌚', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 14, lore: 'Time is money; you have neither.' },
  { id: 'hr-4', name: 'VIP Diamond Black Card', description: 'Unlimited comps, penthouse suite reserved.', rarity: 'covert', value: 2200, icon: '💳', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 6, lore: 'Cardholder status: Sovereign.' },
  { id: 'hr-5', name: 'Bespoke Silk Tuxedo', description: 'Tailored for high stakes baccarat in Macau.', rarity: 'covert', value: 3500, icon: '🤵', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 3, lore: 'Look sharp while going bust.' },
  { id: 'hr-6', name: '★ AWP | Dragon Lore (StatTrak) ★', description: 'The holy grail of digital flexing.', rarity: 'exotic', value: 10000, icon: '🐉', color: '#eab308', bgGradient: 'from-yellow-950 to-purple-950', dropWeight: 0.8, lore: 'Breathes fire directly into your bankroll.' },
];

// Crate 4: The Mythic Bullshit Crate ($500)
const MYTHIC_ITEMS: LootItem[] = [
  { id: 'mb-1', name: 'Solid Gold Horseshoe', description: 'Forged in the fires of Mount Degeneracy.', rarity: 'rare', value: 750, icon: '🧲', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 35, lore: 'Magnetic attraction to 21.' },
  { id: 'mb-2', name: 'Diamond Roulette Ball', description: 'Precision weighted for maximum chaos.', rarity: 'classified', value: 2000, icon: '💎', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 26, lore: 'Spins forever on 00.' },
  { id: 'mb-3', name: 'Crown of the Pit Boss King', description: 'Worn by the legend who broke the bank.', rarity: 'covert', value: 5500, icon: '👑', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 12, lore: 'All hail the degenerate sovereign.' },
  { id: 'mb-4', name: '★ M9 Bayonet | Doppler Sapphire ★', description: 'Deep crystalline blue hue that blinds the dealer.', rarity: 'exotic', value: 18000, icon: '🗡️', color: '#eab308', bgGradient: 'from-yellow-950 to-purple-950', dropWeight: 3.5, lore: 'Pure sapphire reflection.' },
  { id: 'mb-5', name: '★ The Golden Bullshit Trophy ★', description: '100% Solid 24K Gold. Ultimate degenerate glory.', rarity: 'exotic', value: 35000, icon: '🏆', color: '#eab308', bgGradient: 'from-yellow-950 via-amber-950 to-purple-950', dropWeight: 1.2, lore: 'You won the casino. Now keep gambling.' },
];

export const LOOT_CRATES: LootCrate[] = [
  {
    id: 'bum-bag',
    name: 'Bum Bag Crate',
    tagline: 'Pocket change, street relics, and budget degenerate artifacts.',
    cost: 10,
    icon: '🎒',
    accentColor: '#9ca3af',
    glowColor: 'rgba(156, 163, 175, 0.3)',
    items: BUM_BAG_ITEMS,
  },
  {
    id: 'street-hustler',
    name: 'Street Hustler Case',
    tagline: 'Underground casino tools, weighted dice, and flashy gear.',
    cost: 50,
    icon: '🎲',
    accentColor: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    items: STREET_HUSTLER_ITEMS,
  },
  {
    id: 'high-roller',
    name: 'High Roller Vault',
    tagline: 'Penthouse comps, luxury watches, and Macau tournament trophies.',
    cost: 200,
    icon: '💎',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    items: HIGH_ROLLER_ITEMS,
  },
  {
    id: 'mythic-bullshit',
    name: 'The Bullshit Mythic Crate',
    tagline: 'Ridiculous golden artifacts, legendary knifes, and maximum flex.',
    cost: 500,
    icon: '👑',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    items: MYTHIC_ITEMS,
  },
];

/**
 * Picks a random item from a crate based on item drop weights
 */
export function pickRandomLootItem(crate: LootCrate): LootItem {
  const totalWeight = crate.items.reduce((sum, item) => sum + item.dropWeight, 0);
  let rand = Math.random() * totalWeight;

  for (const item of crate.items) {
    if (rand < item.dropWeight) {
      return item;
    }
    rand -= item.dropWeight;
  }

  return crate.items[crate.items.length - 1];
}

/**
 * Builds array of items for the CS-style spinner strip with the winning item at targetIndex
 */
export function generateReelItems(
  crate: LootCrate,
  winningItem: LootItem,
  totalCount = 60,
  targetIndex = 45
): LootItem[] {
  const items: LootItem[] = [];
  for (let i = 0; i < totalCount; i++) {
    if (i === targetIndex) {
      items.push(winningItem);
    } else {
      items.push(pickRandomLootItem(crate));
    }
  }
  return items;
}
