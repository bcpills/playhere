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
  { id: 'bb-g1', name: 'Used Plastic Toothpick', description: 'Found stuck between the slot machine buttons.', rarity: 'common', value: 0.5, icon: '🥢', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 45, lore: 'Grade A casino alley garbage.' },
  { id: 'bb-g2', name: 'Pocket Lint & Sticky Penny', description: 'Covered in spilled rum and desperation.', rarity: 'common', value: 1, icon: '🪙', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 35, lore: 'Every penny counts when you are down bad.' },
  { id: 'bb-1', name: 'Half-Smoked Marlboro', description: 'Still has two good drags left on it.', rarity: 'common', value: 2, icon: '🚬', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 20, lore: 'Vintage casino alley floor drop.' },
  { id: 'bb-2', name: 'Scratched Lottery Ticket', description: 'Lost by 1 single digit.', rarity: 'common', value: 3, icon: '🎫', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 15, lore: 'The numbers that got away.' },
  { id: 'bb-4', name: 'Expired Buffet Coupon', description: 'Expired in 2018. Pit boss gave you a roll.', rarity: 'uncommon', value: 8, icon: '🥩', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 8, lore: 'Prime rib memories.' },
  { id: 'bb-6', name: 'Neon Sunglasses', description: 'Look like a baller under fluorescent bulbs.', rarity: 'rare', value: 25, icon: '🕶️', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 3, lore: 'For squinting at pocket aces.' },
  { id: 'bb-7', name: 'Rusty High-Roller Zippo', description: 'Engraved: "Fortune favors the stubborn".', rarity: 'classified', value: 65, icon: '🔥', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 1, lore: 'Smells of butane and glory.' },
  { id: 'bb-8', name: 'Golden Slot Knob', description: 'Ripped straight off a Lucky 7s machine.', rarity: 'covert', value: 150, icon: '🕹️', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 0.4, lore: 'Pulls the jackpot every time in your mind.' },
  { id: 'bb-9', name: '★ Karambit | Cardboard Fade ★', description: 'Crafted from an Amazon Prime box. Factory New.', rarity: 'exotic', value: 450, icon: '🗡️', color: '#eab308', bgGradient: 'from-yellow-950 to-purple-950', dropWeight: 0.1, lore: 'Highest tier cardboard craftsmanship.' },
];

// Crate 2: Street Hustler Case ($50)
const STREET_HUSTLER_ITEMS: LootItem[] = [
  { id: 'sh-g1', name: 'Crushed Energy Drink Can', description: 'Stomped flat in the parking garage after 6 hours on Keno.', rarity: 'common', value: 2, icon: '🥫', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 45, lore: 'Pure taurine and regret.' },
  { id: 'sh-g2', name: 'Fake $100 Bill with Bible Verse', description: 'Looked real from 10 feet away in dim lighting.', rarity: 'common', value: 5, icon: '💵', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 35, lore: 'The classic bait and switch.' },
  { id: 'sh-1', name: 'Used Lucky 8-Ball', description: 'Outlook not so good.', rarity: 'common', value: 12, icon: '🎱', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 20, lore: 'Never consult on a hard 16.' },
  { id: 'sh-3', name: 'Loaded Dice Set', description: 'Weighted on the 6. Hide from the pit boss.', rarity: 'uncommon', value: 40, icon: '🎲', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 10, lore: 'Natural sevens on demand.' },
  { id: 'sh-5', name: 'Velvet Dice Cup', description: 'Lined with pure purple felt from Monte Carlo.', rarity: 'rare', value: 120, icon: '🏆', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 4, lore: 'Rolls high, stays quiet.' },
  { id: 'sh-6', name: 'Gold Foil Strategy Card', description: 'Memorized by few, ignored by many.', rarity: 'classified', value: 300, icon: '🃏', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 1.5, lore: 'Always split aces and eights.' },
  { id: 'sh-7', name: 'Solid Silver Chip (1000 Denom)', description: 'Hefty, cold, and satisfying to flick.', rarity: 'covert', value: 750, icon: '🪙', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 0.6, lore: 'Clinks like pure success.' },
  { id: 'sh-8', name: '★ Butterfly Knife | Case Hardened ★', description: 'Blue gem pattern on authentic digital steel.', rarity: 'exotic', value: 2400, icon: '🦋', color: '#eab308', bgGradient: 'from-yellow-950 to-purple-950', dropWeight: 0.1, lore: 'Flick it smoothly at the craps table.' },
];

// Crate 3: High Roller Vault ($200)
const HIGH_ROLLER_ITEMS: LootItem[] = [
  { id: 'hr-g1', name: 'Lukewarm Tap Water in VIP Cup', description: 'Server promised Fiji water 45 minutes ago.', rarity: 'common', value: 8, icon: '🥤', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 45, lore: 'Hydration for the down-bad.' },
  { id: 'hr-g2', name: 'Chewed Plastic Cocktail Stirrer', description: 'Souvenir from an overpriced gin & tonic.', rarity: 'common', value: 15, icon: '🍸', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 35, lore: 'Chewed during a 10-hand loss streak.' },
  { id: 'hr-1', name: 'Chilled Crystal Tumbler', description: 'Poured with single-malt 25yr scotch.', rarity: 'uncommon', value: 80, icon: '🥃', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 16, lore: 'Top shelf comps.' },
  { id: 'hr-2', name: 'Platinum Cigar Cutter', description: 'Slices through doubt and hesitation.', rarity: 'rare', value: 220, icon: '✂️', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 6, lore: 'Pure executive precision.' },
  { id: 'hr-3', name: 'Rolex | Day-Date Diamond', description: 'Tells you when you should have cashed out.', rarity: 'classified', value: 850, icon: '⌚', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 2, lore: 'Time is money; you have neither.' },
  { id: 'hr-4', name: 'VIP Diamond Black Card', description: 'Unlimited comps, penthouse suite reserved.', rarity: 'covert', value: 2200, icon: '💳', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 0.8, lore: 'Cardholder status: Sovereign.' },
  { id: 'hr-6', name: '★ AWP | Dragon Lore (StatTrak) ★', description: 'The holy grail of digital flexing.', rarity: 'exotic', value: 10000, icon: '🐉', color: '#eab308', bgGradient: 'from-yellow-950 to-purple-950', dropWeight: 0.1, lore: 'Breathes fire directly into your bankroll.' },
];

// Crate 4: The Mythic Bullshit Crate ($500)
const MYTHIC_ITEMS: LootItem[] = [
  { id: 'mb-g1', name: 'Unwashed Casino Ashtray', description: 'Filled with ash, stale mints, and shattered dreams.', rarity: 'common', value: 15, icon: '🪨', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 45, lore: 'Smells exactly like 4:00 AM on a Tuesday.' },
  { id: 'mb-g2', name: 'Cracked Roulette Ball', description: 'Landed on 0 twice and then chipped on the brass rim.', rarity: 'common', value: 35, icon: '⚪', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 32, lore: 'Lost its aerodynamic balance.' },
  { id: 'mb-1', name: 'Solid Gold Horseshoe', description: 'Forged in the fires of Mount Degeneracy.', rarity: 'rare', value: 350, icon: '🧲', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 14, lore: 'Magnetic attraction to 21.' },
  { id: 'mb-2', name: 'Diamond Roulette Ball', description: 'Precision weighted for maximum chaos.', rarity: 'classified', value: 1400, icon: '💎', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 4, lore: 'Spins forever on 00.' },
  { id: 'mb-3', name: 'Crown of the Pit Boss King', description: 'Worn by the legend who broke the bank.', rarity: 'covert', value: 4500, icon: '👑', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 1.2, lore: 'All hail the degenerate sovereign.' },
  { id: 'mb-4', name: '★ M9 Bayonet | Doppler Sapphire ★', description: 'Deep crystalline blue hue that blinds the dealer.', rarity: 'exotic', value: 18000, icon: '🗡️', color: '#eab308', bgGradient: 'from-yellow-950 to-purple-950', dropWeight: 0.35, lore: 'Pure sapphire reflection.' },
  { id: 'mb-5', name: '★ The Golden ChipZone Trophy ★', description: '100% Solid 24K Gold. Ultimate high-roller glory.', rarity: 'exotic', value: 35000, icon: '🏆', color: '#eab308', bgGradient: 'from-yellow-950 via-amber-950 to-purple-950', dropWeight: 0.15, lore: 'You won the casino. Now keep gambling.' },
];

// Crate 5: Diamond Whale Coffer ($1,500)
const DIAMOND_WHALE_ITEMS: LootItem[] = [
  { id: 'dw-g1', name: 'Stained VIP Carpet Fiber', description: 'Snagged by a high roller’s heel in the baccarat pit.', rarity: 'common', value: 30, icon: '🧶', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 45, lore: 'Smells of champagne spillover.' },
  { id: 'dw-g2', name: 'Soggy Lemon Wedge from Martini', description: 'Left behind by a whale who just blew 50,000 chips.', rarity: 'common', value: 65, icon: '🍋', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 32, lore: 'Extremely sour return.' },
  { id: 'dw-1', name: 'Vintage 1982 Dom Pérignon', description: 'Chilled in an ice bucket delivered by the VIP manager.', rarity: 'rare', value: 800, icon: '🍾', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 15, lore: 'Tastes like high roller comps.' },
  { id: 'dw-2', name: 'Macau VIP Diamond Tile', description: 'Heavy jade and gold baccarat commission marker.', rarity: 'classified', value: 2500, icon: '🀄', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 4.5, lore: 'Direct from Cotai Strip high-limit salons.' },
  { id: 'dw-3', name: 'Patek Philippe Celestial Watch', description: 'Tracks moonphases and your diminishing savings.', rarity: 'covert', value: 7500, icon: '⌚', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 1.5, lore: 'You never actually own a Patek, you merely blow the money.' },
  { id: 'dw-4', name: 'Gulfstream Jet Charter Voucher', description: 'Non-stop one-way flight directly to the Monte Carlo casino tarmac.', rarity: 'mythic', value: 16500, icon: '🛩️', color: '#f59e0b', bgGradient: 'from-amber-950 to-zinc-950', dropWeight: 0.45, lore: 'Skip TSA, head straight to the craps table.' },
  { id: 'dw-5', name: '★ Karambit | Gamma Doppler Emerald ★', description: 'Flawless 0.001 float luminous emerald blade.', rarity: 'exotic', value: 55000, icon: '🗡️', color: '#eab308', bgGradient: 'from-emerald-950 via-teal-950 to-yellow-950', dropWeight: 0.15, lore: 'Radiates pure radioactive wealth.' },
];

// Crate 6: The Degenerate Overlord Armory ($5,000)
const OVERLORD_ITEMS: LootItem[] = [
  { id: 'ov-g1', name: 'Final Eviction Notice (Framed)', description: 'Certified red stamp. Paid $5,000 for this crate instead of rent.', rarity: 'common', value: 80, icon: '📜', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 46, lore: 'True degen commitment.' },
  { id: 'ov-g2', name: 'Broken Plastic Roulette Rake', description: 'Snapped in half by an angry croupier after a hot streak.', rarity: 'common', value: 180, icon: '🧹', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 32, lore: 'Hazardous piece of junk.' },
  { id: 'ov-1', name: '1 Kilo Pure Platinum Bullion', description: '99.95% fine platinum bar stamped with the casino crest.', rarity: 'classified', value: 2800, icon: '🪙', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 14, lore: 'Heavier than your worst financial regrets.' },
  { id: 'ov-2', name: 'Monte Carlo Penthouse Keycard', description: 'Presidential suite key with personal butler on 24/7 call.', rarity: 'covert', value: 11000, icon: '🗝️', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 3.5, lore: 'Overlooks the Mediterranean and the roulette wheels.' },
  { id: 'ov-3', name: '★ Butterfly Knife | Lore (Factory New) ★', description: 'Dragon knotwork inlayed over ancient gold steel.', rarity: 'exotic', value: 38000, icon: '🦋', color: '#eab308', bgGradient: 'from-yellow-950 via-amber-950 to-purple-950', dropWeight: 0.8, lore: 'Smooth spinning motion mesmerizes dealers.' },
  { id: 'ov-4', name: '1% Ownership Stake in ChipZone', description: 'Certified registered share certificate signed in gold ink.', rarity: 'exotic', value: 85000, icon: '📜', color: '#eab308', bgGradient: 'from-amber-950 via-yellow-950 to-emerald-950', dropWeight: 0.25, lore: 'The house always wins, and now you are the house.' },
  { id: 'ov-5', name: '★ StatTrak™ AK-47 | Case Hardened (Scar #661) ★', description: 'Tier 1 Blue Gem legendary specimen.', rarity: 'exotic', value: 160000, icon: '💎', color: '#eab308', bgGradient: 'from-blue-950 via-cyan-950 to-yellow-950', dropWeight: 0.15, lore: 'Worth more than an actual high-limit casino license.' },
];

// Crate 2.5: Neo-Tokyo Cyberpunk Case ($100)
const CYBERPUNK_ITEMS: LootItem[] = [
  { id: 'cp-g1', name: 'Burnt Cyberware Fuse', description: 'Overheated during an unauthorized casino neural hack.', rarity: 'common', value: 4, icon: '🔌', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 44, lore: 'Smells of ozone and silicon.' },
  { id: 'cp-g2', name: 'Glitchy 16MB RAM Stick', description: 'Recovered from an arcade slot motherboard.', rarity: 'common', value: 9, icon: '💾', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 34, lore: 'Corrupted memories of winning hands.' },
  { id: 'cp-1', name: 'Holographic Neon Visor', description: 'HUD displays live roulette spin velocity in real time.', rarity: 'uncommon', value: 25, icon: '🥽', color: '#3b82f6', bgGradient: 'from-cyan-950 to-zinc-950', dropWeight: 14, lore: 'Projecting neon stats since 2077.' },
  { id: 'cp-2', name: 'Overclocked Neural Deck', description: 'Injects pure adrenaline directly into hard 16 hit decisions.', rarity: 'rare', value: 95, icon: '📟', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 5, lore: 'Zero ping card counting.' },
  { id: 'cp-3', name: 'Thermal Camo Smart-Pistol', description: 'Auto-locks onto the casino jackpot button.', rarity: 'classified', value: 380, icon: '🔫', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 2, lore: 'Homing rounds with neon tracer fire.' },
  { id: 'cp-4', name: 'Cyberpunk Hoverbike Keyfob', description: 'Twin-turbine neon speedster parked in the VIP bay.', rarity: 'covert', value: 980, icon: '🏍️', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 0.8, lore: 'Accelerates from 0 to 200 mph in 1.8 seconds.' },
  { id: 'cp-5', name: '★ Neo-Tokyo Katana | Damascus Matrix ★', description: 'Forged from folded nanotech steel with radioactive cyan glow.', rarity: 'exotic', value: 4200, icon: '🗡️', color: '#eab308', bgGradient: 'from-cyan-950 via-purple-950 to-yellow-950', dropWeight: 0.15, lore: 'Slices through house edge cleanly.' },
];

// Crate 4.5: Underworld Mafia Syndicate Safe ($800)
const SYNDICATE_ITEMS: LootItem[] = [
  { id: 'syn-g1', name: 'Counterfeit Havana Cigar', description: 'Filled with shredded newspapers and dried oregano.', rarity: 'common', value: 20, icon: '🚬', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 45, lore: 'Smokes worse than a busted split.' },
  { id: 'syn-g2', name: 'Spent Brass .45 Shell', description: 'Ejected after a poker game dispute back in 1932.', rarity: 'common', value: 50, icon: '🪙', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 33, lore: 'Vintage speakeasy relic.' },
  { id: 'syn-1', name: 'Italian Silk Fedora', description: 'Worn by the Don himself when overseeing the counting room.', rarity: 'uncommon', value: 180, icon: '🎩', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 14, lore: 'Tip it with respect.' },
  { id: 'syn-2', name: 'Solid Gold Mafia Signet Ring', description: '24K gold with an onyx skull crest for sealing private deals.', rarity: 'rare', value: 750, icon: '💍', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 5, lore: 'Kiss the ring before doubling down.' },
  { id: 'syn-3', name: 'Gold-Plated Chicago Typewriter', description: 'Vintage drum-fed Tommy Gun with custom floral engravings.', rarity: 'classified', value: 2600, icon: '🎷', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 2, lore: 'Plays the music of total table dominance.' },
  { id: 'syn-4', name: 'Armored Syndicate Maybach V12', description: 'Bulletproof presidential cruiser with built-in champagne cellar.', rarity: 'covert', value: 6800, icon: '🚗', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 0.8, lore: 'Silent V12 getaway engine.' },
  { id: 'syn-5', name: '★ Italian Stiletto | Black Pearl Galaxy ★', description: 'Ultra-rare mirror finish Damascus steel with pearl inlays.', rarity: 'exotic', value: 21000, icon: '🗡️', color: '#eab308', bgGradient: 'from-zinc-950 via-purple-950 to-yellow-950', dropWeight: 0.15, lore: 'Opens with a lethal mechanical snap.' },
];

// Crate 7: Sovereign Bullshit Reliquary ($15,000)
const SOVEREIGN_ITEMS: LootItem[] = [
  { id: 'sov-g1', name: 'Gold-Plated Plastic Spork', description: 'Stolen from the ultra-VIP buffet cart. Worth less than $1.', rarity: 'common', value: 150, icon: '🍴', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 48, lore: 'The absolute pinnacle of high-stakes trolling.' },
  { id: 'sov-g2', name: 'Used Wet Napkin from High-Limit Salon', description: 'Embossed with gold foil edges, but still just a damp piece of paper.', rarity: 'common', value: 400, icon: '🧻', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 32, lore: 'Dries the tears of broken sovereigns.' },
  { id: 'sov-1', name: 'Diamond Encrusted Pit Boss Gavel', description: 'Cracks down on card counters and bad bets with 50 carats of VVS1 diamonds.', rarity: 'covert', value: 7500, icon: '🔨', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 14, lore: 'One bang closes the table forever.' },
  { id: 'sov-2', name: 'Master Key to Fort Knox & Federal Reserve', description: 'A solid titanium bypass key for international gold vaults.', rarity: 'mythic', value: 28000, icon: '🗝️', color: '#f59e0b', bgGradient: 'from-amber-950 to-zinc-950', dropWeight: 3.5, lore: 'Guaranteed access to emergency liquidity.' },
  { id: 'sov-3', name: '★ AWP | Gungnir (Souvenir Factory New) ★', description: 'The spear of Odin forged into a celestial precision instrument.', rarity: 'exotic', value: 110000, icon: '🐉', color: '#eab308', bgGradient: 'from-sky-950 via-indigo-950 to-yellow-950', dropWeight: 0.8, lore: 'Never misses the jackpot target.' },
  { id: 'sov-4', name: 'Imperial Crown of the Sovereign Casino Monarch', description: 'Embossed with 1,000 rubies, sapphires, and uncut Vegas emeralds.', rarity: 'exotic', value: 250000, icon: '👑', color: '#eab308', bgGradient: 'from-purple-950 via-rose-950 to-yellow-950', dropWeight: 0.25, lore: 'Wear it while demanding unlimited ATM bailouts.' },
  { id: 'sov-5', name: '★ The 1-of-1 Infinity Bullshit Poop Scepter ★', description: 'Mythological supreme artifact of infinite degens. Grants ultimate flex supremacy.', rarity: 'exotic', value: 650000, icon: '💩', color: '#eab308', bgGradient: 'from-yellow-950 via-amber-950 to-purple-950', dropWeight: 0.12, lore: 'The rarest virtual asset ever minted in human civilization.' },
];

// Crate 8: Cosmic Supernova God Core ($30,000)
const COSMIC_SUPERNOVA_ITEMS: LootItem[] = [
  { id: 'cs-g1', name: 'Irradiated Space Debris', description: 'Chipped off an asteroid entering Earth orbit at Mach 25.', rarity: 'common', value: 450, icon: '☄️', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 46, lore: 'Cold, radioactive cosmic basalt.' },
  { id: 'cs-g2', name: 'Extinguished Pulsar Ash', description: 'Remnants of a collapsed neutron star. Dense and worthless.', rarity: 'common', value: 1100, icon: '🌌', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 32, lore: 'Weighs 10,000 tons per teaspoon.' },
  { id: 'cs-1', name: 'Antimatter Containment Core', description: 'Suspends 50 milligrams of pure antimatter in magnetic vacuum.', rarity: 'classified', value: 14000, icon: '🔮', color: '#ec4899', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 14, lore: 'Handle with utmost care.' },
  { id: 'cs-2', name: 'Starlight Celestial Warp Reactor', description: 'Faster-than-light hyperdrive engine harvested from a Dyson sphere.', rarity: 'covert', value: 48000, icon: '⚛️', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 4, lore: 'Bends space-time around your chip stack.' },
  { id: 'cs-3', name: '★ Gravity Scepter of the Event Horizon ★', description: 'Pulls black hole singularities into physical existence.', rarity: 'mythic', value: 180000, icon: '🪐', color: '#f59e0b', bgGradient: 'from-amber-950 via-purple-950 to-zinc-950', dropWeight: 1.2, lore: 'No light or bad beats can escape its pull.' },
  { id: 'cs-4', name: '★ Karambit | Cosmic Nebula Supernova ★', description: 'Infused with stellar dust from the birth of the Andromeda galaxy.', rarity: 'exotic', value: 480000, icon: '🗡️', color: '#eab308', bgGradient: 'from-indigo-950 via-purple-950 to-yellow-950', dropWeight: 0.4, lore: 'Shimmers across the infrared and ultraviolet spectrum.' },
  { id: 'cs-5', name: '★ The Omniversal 1-of-1 Infinite God Core ★', description: 'The primordial seed of all existence in the multiverse.', rarity: 'exotic', value: 1500000, icon: '🌟', color: '#eab308', bgGradient: 'from-yellow-900 via-amber-700 to-violet-950', dropWeight: 0.15, lore: 'Supreme absolute power over reality itself.' },
];

// Crate 9: Mythic Gemstones & Fictional Minerals Vault ($350)
const GEMSTONES_ITEMS: LootItem[] = [
  { id: 'gem-g1', name: 'Polished River Quartz', description: 'Tumbled in a riverbed. Mildly shiny under direct light.', rarity: 'common', value: 10, icon: '🪨', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 44, lore: 'Standard garden variety stone.' },
  { id: 'gem-g2', name: 'Raw Pyrite (Fools Gold)', description: 'Glittered like gold until you had it appraised.', rarity: 'common', value: 25, icon: '✨', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 32, lore: 'Classic mineral degen bait.' },
  { id: 'gem-1', name: 'Deep Ceylon Star Sapphire', description: 'Exhibits a six-rayed asterism under bright light.', rarity: 'uncommon', value: 95, icon: '🔷', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 14, lore: 'Deep ocean cobalt radiance.' },
  { id: 'gem-2', name: 'Glowing Green Kryptonite Shard', description: 'Radiates strange cosmic radiation. Keep away from Supermen.', rarity: 'rare', value: 450, icon: '🧪', color: '#a855f7', bgGradient: 'from-emerald-950 to-zinc-950', dropWeight: 6, lore: 'Harmful to Kryptonians, valuable to collectors.' },
  { id: 'gem-3', name: 'Refined Wakandan Vibranium Ore', description: 'Absorbs and stores all kinetic energy and vibrational shocks.', rarity: 'classified', value: 1400, icon: '🟣', color: '#ec4899', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 2.5, lore: 'The foundation of advanced civilization.' },
  { id: 'gem-4', name: 'Pure Crimson Kyber Crystal', description: 'Attuned through the Dark Side of the Force to power a plasma blade.', rarity: 'covert', value: 3800, icon: '🏮', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 0.9, lore: 'Bleeds with immense thermal energy.' },
  { id: 'gem-5', name: 'The Philosopher\'s Stone', description: 'Legendary alchemical catalyst capable of turning any base metal into gold.', rarity: 'mythic', value: 12000, icon: '🩸', color: '#f59e0b', bgGradient: 'from-amber-950 to-zinc-950', dropWeight: 0.35, lore: 'Grants infinite wealth and eternal youth.' },
  { id: 'gem-6', name: '★ The Arkenstone | Heart of the Mountain ★', description: 'Faceted jewel of Thrain that shines with its own inner celestial daylight.', rarity: 'exotic', value: 38000, icon: '💎', color: '#eab308', bgGradient: 'from-sky-950 via-indigo-950 to-yellow-950', dropWeight: 0.15, lore: 'The jewel of kings under the lonely mountain.' },
  { id: 'gem-7', name: '★ 1-of-1 Infinite Reality Stone ★', description: 'Cosmic singularity condensed into an ethereal crimson gem that bends all reality.', rarity: 'exotic', value: 120000, icon: '🌌', color: '#eab308', bgGradient: 'from-red-950 via-amber-900 to-yellow-950', dropWeight: 0.1, lore: 'Reality can be whatever you want.' },
];

// Crate 10: Prehistoric Jurassic Fossil Coffer ($150)
const JURASSIC_FOSSIL_ITEMS: LootItem[] = [
  { id: 'jf-g1', name: 'Petrified Tree Bark', description: 'Hardened into silicate rock over 65 million years.', rarity: 'common', value: 5, icon: '🪵', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 45, lore: 'Ancient firewood.' },
  { id: 'jf-g2', name: 'Fossilized Trilobite Shell', description: 'Bottom feeder that swam Paleozoic ocean floors.', rarity: 'common', value: 15, icon: '🪲', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 33, lore: 'Over 500 million years old.' },
  { id: 'jf-1', name: 'Mosquito Preserved in Golden Amber', description: 'Contains dinosaur hemoglobin trapped inside ancient tree sap.', rarity: 'uncommon', value: 55, icon: '🪰', color: '#3b82f6', bgGradient: 'from-amber-950 to-zinc-950', dropWeight: 14, lore: 'Life finds a way.' },
  { id: 'jf-2', name: 'Curved Velociraptor Sickle Claw', description: 'Sharp as a scalpel. Retractable predatory toe claw.', rarity: 'rare', value: 240, icon: '🦅', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 5, lore: 'Taps on kitchen floor tiles in your nightmares.' },
  { id: 'jf-3', name: 'Giant Megalodon Shark Tooth', description: '7-inch serrated black enamel tooth from the apex ocean beast.', rarity: 'classified', value: 850, icon: '🦈', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 2, lore: 'Crushed whale vertebrae for breakfast.' },
  { id: 'jf-4', name: 'Intact Spinosaurus Sail Spine', description: 'Towering dorsal vertebrae with iridescent petrification.', rarity: 'covert', value: 2400, icon: '🦖', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 0.8, lore: 'Ruler of the Cretaceous river networks.' },
  { id: 'jf-5', name: '★ Tyrannosaurus Rex Skull in Solid Amber ★', description: 'A complete apex predator cranium encased in flawless museum amber.', rarity: 'exotic', value: 16000, icon: '💀', color: '#eab308', bgGradient: 'from-amber-950 via-yellow-950 to-purple-950', dropWeight: 0.15, lore: 'The tyrant lizard king immortalized.' },
  { id: 'jf-6', name: '★ 1-of-1 Living Micro-Raptor Hatchling ★', description: 'Genetically resurrected companion with feathers and inquisitive eyes.', rarity: 'exotic', value: 65000, icon: '🥚', color: '#eab308', bgGradient: 'from-emerald-950 via-amber-900 to-yellow-950', dropWeight: 0.05, lore: 'Welcome... to your casino menagerie.' },
];

// Crate 11: Eldritch Arcane Grimoire Cache ($650)
const ELDRITCH_GRIMOIRE_ITEMS: LootItem[] = [
  { id: 'eg-g1', name: 'Dried Toad Legs & Black Salt', description: 'Leftovers from an amateur Wiccan ritual in the woods.', rarity: 'common', value: 18, icon: '🧂', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 45, lore: 'Slightly cursed seasoning.' },
  { id: 'eg-g2', name: 'Melted Black Tallow Candle', description: 'Burned down to the brass dish during a midnight seance.', rarity: 'common', value: 45, icon: '🕯️', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 32, lore: 'Smells of sage and sulfur.' },
  { id: 'eg-1', name: 'Necromancer\'s Raven Bone Wand', description: 'Carved from the thigh bone of an omen raven.', rarity: 'uncommon', value: 190, icon: '🪄', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 14, lore: 'Whispers quiet incantations.' },
  { id: 'eg-2', name: 'Ancient Golden Scarab Talisman', description: 'Blessed by high priests of Amun-Ra to ward against curses.', rarity: 'rare', value: 720, icon: '🪲', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 5.5, lore: 'Flaps solid gold wings when danger nears.' },
  { id: 'eg-3', name: 'Void-Forged Abyssal Dagger', description: 'Absorbs all ambient light around the obsidian blade.', rarity: 'classified', value: 2500, icon: '🗡️', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 2.2, lore: 'Drawn from the cold dimension beyond stars.' },
  { id: 'eg-4', name: 'Staff of Archmage Azathoth', description: 'Topped with a pulsing eldritch eye that blinks in rhythm with your bets.', rarity: 'covert', value: 6800, icon: '👁️', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 0.9, lore: 'Channels cosmic horrors directly into chip wins.' },
  { id: 'eg-5', name: 'Necronomicon Ex-Mortis (Bound in Flesh)', description: 'Ancient Sumerian grimoire inked in demon blood and bound in human leather.', rarity: 'mythic', value: 19500, icon: '📖', color: '#f59e0b', bgGradient: 'from-amber-950 to-zinc-950', dropWeight: 0.3, lore: 'Klaatu barada nikto.' },
  { id: 'eg-6', name: '★ Scythe of the Void Harbinger ★', description: 'Reaps the souls of bad beats and splits the fabric of time.', rarity: 'exotic', value: 75000, icon: '🌾', color: '#eab308', bgGradient: 'from-purple-950 via-violet-950 to-yellow-950', dropWeight: 0.1, lore: 'The absolute ruler of forbidden shadow magic.' },
];

// Crate 12: Olympus Mythological Pantheon Reliquary ($2,500)
const OLYMPUS_PANTHEON_ITEMS: LootItem[] = [
  { id: 'oly-g1', name: 'Chipped Terracotta Olive Oil Flask', description: 'Unearthed from the ruins of ancient Corinth.', rarity: 'common', value: 50, icon: '🏺', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 45, lore: 'Smells of rancid Mediterranean olive oil.' },
  { id: 'oly-g2', name: 'Wilted Golden Laurel Wreath', description: 'Awarded to a runner-up in the 480 BC Isthmian Games.', rarity: 'common', value: 120, icon: '🌿', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 32, lore: 'Foliage dried to a crisp.' },
  { id: 'oly-1', name: 'Spartan King\'s Bronze War Helmet', description: 'Corinthian battle helmet dented by Persian spears.', rarity: 'uncommon', value: 750, icon: '🪖', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 14, lore: 'Tonight we dine in high limits!' },
  { id: 'oly-2', name: 'Hermes\' Winged Golden Talaria', description: 'Sandals that let the messenger god outrun all bad luck.', rarity: 'rare', value: 2900, icon: '🪽', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 5.5, lore: 'Fly across table minimums.' },
  { id: 'oly-3', name: 'Golden Fleece of Colchis', description: 'Pure ram fleece of celestial gold guarded by a sleepless dragon.', rarity: 'classified', value: 9500, icon: '🐑', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 2.2, lore: 'Brought back by Jason and the Argonauts.' },
  { id: 'oly-4', name: 'Athena\'s Aegis Gorgon Shield', description: 'Embossed with the petrifying gaze of Medusa herself.', rarity: 'covert', value: 24000, icon: '🛡️', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 0.9, lore: 'Turns losing bets to solid marble.' },
  { id: 'oly-5', name: 'Hades\' Helm of Darkness & Invisibility', description: 'Forged by the Cyclopes to render the wearer completely invisible.', rarity: 'mythic', value: 55000, icon: '👑', color: '#f59e0b', bgGradient: 'from-amber-950 to-zinc-950', dropWeight: 0.28, lore: 'Walk past the pit bosses undetected.' },
  { id: 'oly-6', name: '★ Zeus\'s Primordial Master Thunderbolt ★', description: 'Forged in the heart of Mount Etna. Crackles with 100 million volts of raw divine fury.', rarity: 'exotic', value: 160000, icon: '⚡', color: '#eab308', bgGradient: 'from-yellow-950 via-amber-900 to-sky-950', dropWeight: 0.12, lore: 'The supreme weapon of Mount Olympus.' },
  { id: 'oly-7', name: '★ Pandora\'s Box | Primordial Chaos (1-of-1) ★', description: 'The jar containing all cosmic evils and ultimate golden hope.', rarity: 'exotic', value: 380000, icon: '📦', color: '#eab308', bgGradient: 'from-rose-950 via-purple-950 to-yellow-950', dropWeight: 0.05, lore: 'Do not open unless you crave limitless jackpot glory.' },
];

// Crate 13: Enchanted Forest Alchemist Stash ($75)
const ENCHANTED_ALCHEMIST_ITEMS: LootItem[] = [
  { id: 'ea-g1', name: 'Poisonous Purple Toadstool', description: 'Glows softly in the damp moss. Do not consume.', rarity: 'common', value: 3, icon: '🍄', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 45, lore: 'Wild swamp forage.' },
  { id: 'ea-g2', name: 'Acorn of the Forest Dryad', description: 'Sprouts roots when placed on a roulette wheel.', rarity: 'common', value: 8, icon: '🌰', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 34, lore: 'Blessed by woodland spirits.' },
  { id: 'ea-1', name: 'Vial of Shimmering Pixie Dust', description: 'Grants temporary weightlessness and extreme good vibes.', rarity: 'uncommon', value: 35, icon: '✨', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 13, lore: 'Sprinkle over pocket cards.' },
  { id: 'ea-2', name: 'Elixir of Liquid Fortune', description: 'Brewed with four-leaf clovers and morning dew.', rarity: 'rare', value: 140, icon: '🧪', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 5, lore: 'Sweet, sparkling, and lucky.' },
  { id: 'ea-3', name: 'Root of the Elder Treant', description: 'Knotted root that pulses with ancient botanical magic.', rarity: 'classified', value: 420, icon: '🪵', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 2, lore: 'Older than the oldest casino in existence.' },
  { id: 'ea-4', name: 'Radiant Phoenix Feather Quill', description: 'Never runs out of fiery ink. Rebirths lost hands from ashes.', rarity: 'covert', value: 1100, icon: '🪶', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 0.8, lore: 'Burns with eternal warmth.' },
  { id: 'ea-5', name: '★ Bow of the Celestial Moonlit Huntress ★', description: 'Carved from living Yggdrasil wood strung with silver moonlight.', rarity: 'exotic', value: 4800, icon: '🏹', color: '#eab308', bgGradient: 'from-teal-950 via-emerald-950 to-yellow-950', dropWeight: 0.15, lore: 'Arrows never miss the bullseye multiplier.' },
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
    id: 'enchanted-alchemist',
    name: 'Enchanted Forest Stash',
    tagline: 'Pixie dust vials, liquid fortune elixirs, and Phoenix feathers.',
    cost: 75,
    icon: '🍄',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    items: ENCHANTED_ALCHEMIST_ITEMS,
  },
  {
    id: 'cyberpunk-case',
    name: 'Neo-Tokyo Cyberpunk Case',
    tagline: 'Neural decks, holographic visors, and Damascus Matrix katanas.',
    cost: 100,
    icon: '⚡',
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    items: CYBERPUNK_ITEMS,
  },
  {
    id: 'jurassic-fossil',
    name: 'Prehistoric Jurassic Coffer',
    tagline: 'Amber mosquitoes, Megalodon shark teeth, and amber T-Rex skulls.',
    cost: 150,
    icon: '🦖',
    accentColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    items: JURASSIC_FOSSIL_ITEMS,
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
    id: 'mythic-gemstones',
    name: 'Mythic Gems & Minerals Vault',
    tagline: 'Kryptonite, Wakandan Vibranium, Kyber Crystals & Arkenstone.',
    cost: 350,
    icon: '💎',
    accentColor: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.45)',
    items: GEMSTONES_ITEMS,
  },
  {
    id: 'mythic-bullshit',
    name: 'The ChipZone Mythic Crate',
    tagline: 'Ridiculous golden artifacts, legendary knifes, and maximum flex.',
    cost: 500,
    icon: '👑',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    items: MYTHIC_ITEMS,
  },
  {
    id: 'eldritch-grimoire',
    name: 'Eldritch Arcane Grimoire',
    tagline: 'Ancient scarabs, Necronomicon Ex-Mortis, and Void Harbingers.',
    cost: 650,
    icon: '🔮',
    accentColor: '#d946ef',
    glowColor: 'rgba(217, 70, 239, 0.45)',
    items: ELDRITCH_GRIMOIRE_ITEMS,
  },
  {
    id: 'syndicate-safe',
    name: 'Underworld Mafia Syndicate Safe',
    tagline: 'Solid gold signet rings, gold Tommy guns, and Maybach keys.',
    cost: 800,
    icon: '💼',
    accentColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    items: SYNDICATE_ITEMS,
  },
  {
    id: 'diamond-whale',
    name: 'Diamond Whale Coffer',
    tagline: 'Private jet charters, Patek Philippe celestial watches, and Emerald Doppler blades.',
    cost: 1500,
    icon: '🐋',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    items: DIAMOND_WHALE_ITEMS,
  },
  {
    id: 'olympus-pantheon',
    name: 'Olympus Pantheon Reliquary',
    tagline: 'Hermes sandals, Athena Aegis shield, Zeus Master Bolt & Pandora Box.',
    cost: 2500,
    icon: '🏛️',
    accentColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.55)',
    items: OLYMPUS_PANTHEON_ITEMS,
  },
  {
    id: 'degenerate-overlord',
    name: 'Degenerate Overlord Armory',
    tagline: 'Casino equity shares, platinum bullion, and legendary Case Hardened Blue Gems.',
    cost: 5000,
    icon: '🔥',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    items: OVERLORD_ITEMS,
  },
  {
    id: 'sovereign-reliquary',
    name: 'Sovereign ChipZone Reliquary',
    tagline: 'The absolute apex of digital opulence. Odin Gungnir, Sovereign Crown & The Infinity Poop Scepter.',
    cost: 15000,
    icon: '👑',
    accentColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.6)',
    items: SOVEREIGN_ITEMS,
  },
  {
    id: 'cosmic-supernova',
    name: 'Cosmic Supernova God Core',
    tagline: 'Antimatter engines, event horizon gravity scepters, and the Omniversal 1-of-1 God Core.',
    cost: 30000,
    icon: '🌌',
    accentColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.6)',
    items: COSMIC_SUPERNOVA_ITEMS,
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

export const AI_BATTLE_BOTS = [
  { name: 'DegenDan', avatar: '🎩', tagline: 'All in or nothing' },
  { name: 'WhaleVince', avatar: '🐋', tagline: 'Unboxing 15k reliquaries' },
  { name: 'CryptoKing', avatar: '👑', tagline: 'Diamond hands only' },
  { name: 'LuckyLucy', avatar: '🍀', tagline: 'Naturally born lucky' },
  { name: 'VegasVic', avatar: '🎲', tagline: 'Vegas strip veteran' },
  { name: 'MatrixNeo', avatar: '⚡', tagline: 'Hacking the odds' },
  { name: 'BaccaratBob', avatar: '🃏', tagline: 'Double down master' },
  { name: 'DiamondDonna', avatar: '💎', tagline: 'Only here for the Karambits' },
  { name: 'CyberSamurai', avatar: '🗡️', tagline: 'Looking for Damascus Matrix' },
  { name: 'OverlordOzzy', avatar: '🔥', tagline: 'Owns 1% casino equity' },
];

export function getRandomAIBot(excludeNames: string[] = []) {
  const available = AI_BATTLE_BOTS.filter(b => !excludeNames.includes(b.name));
  const pool = available.length > 0 ? available : AI_BATTLE_BOTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Sorts crates in order of least expensive to most expensive
 */
export function sortCratesByCost(crates: LootCrate[]): LootCrate[] {
  return [...crates].sort((a, b) => a.cost - b.cost);
}

/**
 * Cleanly formats drop rate percentage ensuring no non-zero drop displays as 0.00%
 */
export function formatDropOdds(dropWeight: number, totalWeight: number): string {
  if (totalWeight <= 0 || dropWeight <= 0) return '0.01%';
  const pct = (dropWeight / totalWeight) * 100;
  if (pct >= 10) {
    return `${pct.toFixed(1)}%`;
  }
  if (pct >= 1) {
    return `${pct.toFixed(1)}%`;
  }
  if (pct >= 0.1) {
    return `${pct.toFixed(2)}%`;
  }
  if (pct >= 0.01) {
    return `${pct.toFixed(2)}%`;
  }
  return `${pct.toFixed(3)}%`;
}

