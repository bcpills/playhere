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
  { id: 'bb-g1', name: 'Vintage Brass Casino Token', description: 'Recovered from a vintage slot hopper.', rarity: 'common', value: 4, icon: '🪙', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 24, lore: 'Grade A casino alley floor find.' },
  { id: 'bb-g2', name: 'Scratch-Off Lucky 7s Ticket', description: 'Scored a clean bottom-tier line match.', rarity: 'common', value: 7, icon: '🎫', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 22, lore: 'Every chip counts when you are climbing.' },
  { id: 'bb-1', name: 'Silver High-Roller Zippo', description: 'Engraved: "Fortune favors the stubborn".', rarity: 'uncommon', value: 12, icon: '🔥', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 20, lore: 'Smells of butane and winning streaks.' },
  { id: 'bb-2', name: 'Neon Aviator Sunglasses', description: 'Look like a baller under fluorescent bulbs.', rarity: 'uncommon', value: 18, icon: '🕶️', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 16, lore: 'For squinting at pocket aces.' },
  { id: 'bb-6', name: 'Velvet Dice Bag with Loaded Dice', description: 'Weighted on the natural 7s and 11s.', rarity: 'rare', value: 35, icon: '🎲', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 10, lore: 'Rolls high, stays quiet.' },
  { id: 'bb-7', name: 'Solid Silver Chip (100 Denom)', description: 'Hefty, cold, and satisfying to flick.', rarity: 'classified', value: 75, icon: '🪙', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 5, lore: 'Clinks like pure success.' },
  { id: 'bb-8', name: 'Golden Slot Machine Knob', description: 'Ripped straight off a Lucky 7s progressive machine.', rarity: 'covert', value: 180, icon: '🕹️', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 2.2, lore: 'Pulls the jackpot every time in your mind.' },
  { id: 'bb-9', name: '★ Karambit | Cardboard Fade ★', description: 'Crafted from an Amazon Prime box. Factory New.', rarity: 'exotic', value: 480, icon: '🗡️', color: '#eab308', bgGradient: 'from-yellow-950 to-purple-950', dropWeight: 0.8, lore: 'Highest tier cardboard craftsmanship.' },
];

// Crate 2: Street Hustler Case ($50)
const STREET_HUSTLER_ITEMS: LootItem[] = [
  { id: 'sh-g1', name: 'Casino Alley Lucky 8-Ball', description: 'Solid resin sphere with favorable predictions.', rarity: 'common', value: 20, icon: '🎱', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 24, lore: 'Consult before splitting tens.' },
  { id: 'sh-g2', name: 'Custom Vegas Chip Stack', description: 'Minted clay chips with custom edge spots.', rarity: 'common', value: 32, icon: '🪙', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 22, lore: 'Authentic casino weight and feel.' },
  { id: 'sh-1', name: 'Precision Loaded Dice Pair', description: 'Weighted on the 6. Pit boss never noticed.', rarity: 'uncommon', value: 55, icon: '🎲', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 20, lore: 'Natural sevens on demand.' },
  { id: 'sh-3', name: 'Velvet Dice Cup from Monte Carlo', description: 'Lined with royal purple baize felt.', rarity: 'uncommon', value: 80, icon: '🏆', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 16, lore: 'Rolls high, muffles the sound.' },
  { id: 'sh-5', name: 'Gold Foil Strategy Card Set', description: 'Memorized by few, mastered by legends.', rarity: 'rare', value: 160, icon: '🃏', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 10, lore: 'Always split aces and eights.' },
  { id: 'sh-6', name: 'Solid Silver 1,000c Dealer Chip', description: 'Heft of pure 999 silver with mirror proof finish.', rarity: 'classified', value: 360, icon: '🪙', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 5.5, lore: 'Certified high-limit table currency.' },
  { id: 'sh-7', name: 'Diamond-Studded Card Guard', description: 'Heavy brass encased with real diamond accents.', rarity: 'covert', value: 850, icon: '🛡️', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 2, lore: 'Protects monster pocket hands.' },
  { id: 'sh-8', name: '★ Butterfly Knife | Case Hardened ★', description: 'Blue gem pattern on authentic digital steel.', rarity: 'exotic', value: 2600, icon: '🦋', color: '#eab308', bgGradient: 'from-yellow-950 to-purple-950', dropWeight: 0.5, lore: 'Flick it smoothly at the craps table.' },
];

// Crate 3: High Roller Vault ($200)
const HIGH_ROLLER_ITEMS: LootItem[] = [
  { id: 'hr-g1', name: 'Chilled Crystal Tumbler & Bourbon', description: 'Single-malt 25yr scotch in cut crystal glass.', rarity: 'common', value: 80, icon: '🥃', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 24, lore: 'Top shelf comps.' },
  { id: 'hr-g2', name: 'Platinum Precision Cigar Cutter', description: 'Slices through hesitation with surgical edge.', rarity: 'common', value: 125, icon: '✂️', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 22, lore: 'Pure executive precision.' },
  { id: 'hr-1', name: 'Macau High-Limit Baccarat Plaque', description: 'Heavy ceramic plaque stamped with 200c denomination.', rarity: 'uncommon', value: 230, icon: '🀄', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 20, lore: 'Direct from Cotai Strip high-limit salons.' },
  { id: 'hr-2', name: 'Rolex Oyster Perpetual Homage', description: 'Gleams with golden numerals and sapphire crystal.', rarity: 'rare', value: 420, icon: '⌚', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 15, lore: 'Tells you it is always time to bet.' },
  { id: 'hr-3', name: 'Rolex | Day-Date Diamond President', description: '18K solid yellow gold with diamond dial markers.', rarity: 'classified', value: 1100, icon: '⌚', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 6.5, lore: 'Executive presence at any table.' },
  { id: 'hr-4', name: 'VIP Diamond Black Sovereign Card', description: 'Unlimited comps, penthouse suite reserved indefinitely.', rarity: 'covert', value: 2600, icon: '💳', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 2.5, lore: 'Cardholder status: Sovereign.' },
  { id: 'hr-6', name: '★ AWP | Dragon Lore (StatTrak) ★', description: 'The holy grail of digital flexing.', rarity: 'exotic', value: 11500, icon: '🐉', color: '#eab308', bgGradient: 'from-yellow-950 to-purple-950', dropWeight: 0.5, lore: 'Breathes fire directly into your bankroll.' },
];

// Crate 4: The Mythic Bullshit Crate ($500)
const MYTHIC_ITEMS: LootItem[] = [
  { id: 'mb-g1', name: 'Solid Brass High-Roller Horseshoe', description: 'Forged in Vegas and magnetized for good fortune.', rarity: 'common', value: 210, icon: '🧲', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 24, lore: 'Magnetic attraction to blackjacks.' },
  { id: 'mb-g2', name: 'Faceted Diamond Roulette Ball', description: 'Precision weighted for maximum chaos and zero bias.', rarity: 'common', value: 320, icon: '⚪', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 22, lore: 'Spins forever on the winning pocket.' },
  { id: 'mb-1', name: 'Solid 24K Gold Horseshoe of Fortune', description: 'Forged in the fires of lucky streaks.', rarity: 'uncommon', value: 580, icon: '🧲', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 20, lore: 'Pure 24k gold luck.' },
  { id: 'mb-2', name: 'Diamond Encrusted Roulette Trophy', description: 'Gleams with 50 cut diamonds and golden turntable.', rarity: 'rare', value: 1200, icon: '💎', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 14, lore: 'The mark of a true wheel master.' },
  { id: 'mb-3', name: 'Crown of the Pit Boss King', description: 'Worn by the legend who broke the bank in Monaco.', rarity: 'covert', value: 4800, icon: '👑', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 4, lore: 'All hail the sovereign high roller.' },
  { id: 'mb-4', name: '★ M9 Bayonet | Doppler Sapphire ★', description: 'Deep crystalline blue hue that blinds the dealer.', rarity: 'exotic', value: 19500, icon: '🗡️', color: '#eab308', bgGradient: 'from-yellow-950 to-purple-950', dropWeight: 0.8, lore: 'Pure sapphire reflection.' },
  { id: 'mb-5', name: '★ The Golden ChipZone Trophy ★', description: '100% Solid 24K Gold. Ultimate high-roller glory.', rarity: 'exotic', value: 38000, icon: '🏆', color: '#eab308', bgGradient: 'from-yellow-950 via-amber-950 to-purple-950', dropWeight: 0.3, lore: 'You won the casino. Now keep gambling.' },
];

// Crate 5: Diamond Whale Coffer ($1,500)
const DIAMOND_WHALE_ITEMS: LootItem[] = [
  { id: 'dw-g1', name: 'Vintage 1982 Dom Pérignon Champagne', description: 'Chilled in an ice bucket delivered by the VIP manager.', rarity: 'common', value: 650, icon: '🍾', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 25, lore: 'Tastes like high roller comps.' },
  { id: 'dw-g2', name: 'Macau Jade & Gold Commission Marker', description: 'Heavy jade and gold baccarat commission marker.', rarity: 'common', value: 950, icon: '🀄', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 22, lore: 'Direct from Cotai Strip high-limit salons.' },
  { id: 'dw-1', name: 'Pure Platinum 100oz Ingot', description: 'Stamped with sovereign mint hallmarks and mirror finish.', rarity: 'uncommon', value: 1750, icon: '🪙', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 20, lore: 'Heavier than any bad beat.' },
  { id: 'dw-2', name: 'Macau VIP Diamond Dragon Tile', description: 'Flawless carved jadeite with pure gold inlay.', rarity: 'rare', value: 3200, icon: '🐉', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 14, lore: 'Reserved for private salon baccarat.' },
  { id: 'dw-3', name: 'Patek Philippe Celestial Sky Moon Watch', description: 'Tracks moonphases and celestial constellations.', rarity: 'covert', value: 8500, icon: '⌚', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 4.5, lore: 'Horological perfection on your wrist.' },
  { id: 'dw-4', name: 'Gulfstream Jet Charter Sovereign Voucher', description: 'Non-stop private jet flight directly to Monte Carlo tarmac.', rarity: 'mythic', value: 18000, icon: '🛩️', color: '#f59e0b', bgGradient: 'from-amber-950 to-zinc-950', dropWeight: 1.2, lore: 'Skip TSA, head straight to the tables.' },
  { id: 'dw-5', name: '★ Karambit | Gamma Doppler Emerald ★', description: 'Flawless 0.001 float luminous emerald blade.', rarity: 'exotic', value: 58000, icon: '🗡️', color: '#eab308', bgGradient: 'from-emerald-950 via-teal-950 to-yellow-950', dropWeight: 0.4, lore: 'Radiates pure radioactive wealth.' },
];

// Crate 6: The Degenerate Overlord Armory ($5,000)
const OVERLORD_ITEMS: LootItem[] = [
  { id: 'ov-g1', name: 'Solid 1 Kilo Pure Platinum Bullion', description: '99.95% fine platinum bar stamped with the casino crest.', rarity: 'common', value: 2100, icon: '🪙', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 25, lore: 'Heavier than your worst financial regrets.' },
  { id: 'ov-g2', name: 'Monte Carlo Penthouse Gold Keycard', description: 'Presidential suite key with personal butler on 24/7 call.', rarity: 'common', value: 3200, icon: '🗝️', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 22, lore: 'Overlooks the Mediterranean and the roulette wheels.' },
  { id: 'ov-1', name: 'Pure 24K Gold 1-Kilo Casino Bar', description: 'Fine gold bullion engraved with high-roller crest.', rarity: 'uncommon', value: 5800, icon: '🪙', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 20, lore: 'Universal liquidity anywhere on earth.' },
  { id: 'ov-2', name: 'Monte Carlo Grand Penthouse Ownership', description: 'Perpetual presidential suite access with private salon table.', rarity: 'rare', value: 12500, icon: '🏰', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 14, lore: 'Panoramic Mediterranean views.' },
  { id: 'ov-3', name: '★ Butterfly Knife | Lore (Factory New) ★', description: 'Dragon knotwork inlayed over ancient gold steel.', rarity: 'covert', value: 42000, icon: '🦋', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 3.5, lore: 'Smooth spinning motion mesmerizes dealers.' },
  { id: 'ov-4', name: '1% Ownership Stake in ChipZone Casino', description: 'Certified registered share certificate signed in gold ink.', rarity: 'exotic', value: 92000, icon: '📜', color: '#eab308', bgGradient: 'from-amber-950 via-yellow-950 to-emerald-950', dropWeight: 0.8, lore: 'The house always wins, and now you are the house.' },
  { id: 'ov-5', name: '★ StatTrak™ AK-47 | Case Hardened (Scar #661) ★', description: 'Tier 1 Blue Gem legendary specimen.', rarity: 'exotic', value: 175000, icon: '💎', color: '#eab308', bgGradient: 'from-blue-950 via-cyan-950 to-yellow-950', dropWeight: 0.4, lore: 'Worth more than an actual high-limit casino license.' },
];

// Crate 2.5: Neo-Tokyo Cyberpunk Case ($100)
const CYBERPUNK_ITEMS: LootItem[] = [
  { id: 'cp-g1', name: 'Holographic Neon Visor HUD', description: 'HUD displays live roulette spin velocity in real time.', rarity: 'common', value: 40, icon: '🥽', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 24, lore: 'Projecting neon stats since 2077.' },
  { id: 'cp-g2', name: 'Overclocked Neural Adrenaline Deck', description: 'Injects pure adrenaline directly into hard 16 hit decisions.', rarity: 'common', value: 65, icon: '📟', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-900', dropWeight: 22, lore: 'Zero ping card counting.' },
  { id: 'cp-1', name: 'Thermal Camo Smart-Targeter', description: 'Auto-locks onto optimal casino payout sequences.', rarity: 'uncommon', value: 115, icon: '🔫', color: '#3b82f6', bgGradient: 'from-cyan-950 to-zinc-950', dropWeight: 20, lore: 'Homing rounds with neon tracer fire.' },
  { id: 'cp-2', name: 'Cyberpunk Hoverbike Neon Keyfob', description: 'Twin-turbine neon speedster parked in the VIP bay.', rarity: 'rare', value: 240, icon: '🏍️', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 15, lore: 'Accelerates from 0 to 200 mph in 1.8 seconds.' },
  { id: 'cp-3', name: 'Quantum Core Nanotech Deck', description: 'Calculates every table permutation before cards are dealt.', rarity: 'classified', value: 520, icon: '🔮', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 6, lore: 'Supercharged quantum computing.' },
  { id: 'cp-4', name: 'Hovercraft Supercar Chassis Key', description: 'Anti-gravity luxury cruiser with titanium gullwing doors.', rarity: 'covert', value: 1200, icon: '🏎️', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 2.2, lore: 'Cruises above the neon skyline.' },
  { id: 'cp-5', name: '★ Neo-Tokyo Katana | Damascus Matrix ★', description: 'Forged from folded nanotech steel with radioactive cyan glow.', rarity: 'exotic', value: 4600, icon: '🗡️', color: '#eab308', bgGradient: 'from-cyan-950 via-purple-950 to-yellow-950', dropWeight: 0.6, lore: 'Slices through house edge cleanly.' },
];

// Crate 4.5: Underworld Mafia Syndicate Safe ($800)
const SYNDICATE_ITEMS: LootItem[] = [
  { id: 'syn-g1', name: 'Hand-Tailored Italian Silk Fedora', description: 'Worn by the Don himself when overseeing the counting room.', rarity: 'common', value: 340, icon: '🎩', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 25, lore: 'Tip it with respect.' },
  { id: 'syn-g2', name: 'Solid Gold Mafia Signet Ring', description: '24K gold with an onyx skull crest for sealing private deals.', rarity: 'common', value: 520, icon: '💍', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 22, lore: 'Kiss the ring before doubling down.' },
  { id: 'syn-1', name: 'Gold-Plated Chicago Typewriter', description: 'Vintage drum-fed Tommy Gun with custom floral engravings.', rarity: 'uncommon', value: 920, icon: '🎷', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 20, lore: 'Plays the music of total table dominance.' },
  { id: 'syn-2', name: 'Armored Syndicate Maybach V12 Key', description: 'Bulletproof presidential cruiser with built-in champagne cellar.', rarity: 'rare', value: 1850, icon: '🚗', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 14, lore: 'Silent V12 getaway engine.' },
  { id: 'syn-3', name: 'Syndicate Diamond Vault Bond', description: 'Redeemable for pure uncut Antwerp diamonds.', rarity: 'classified', value: 3400, icon: '💎', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 5.5, lore: 'Secured by the families.' },
  { id: 'syn-4', name: 'Don Sovereign Platinum Cane', description: 'Encrusted with 100 carats of black diamonds.', rarity: 'covert', value: 7800, icon: '🦯', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 2.2, lore: 'Command total authority in any room.' },
  { id: 'syn-5', name: '★ Italian Stiletto | Black Pearl Galaxy ★', description: 'Ultra-rare mirror finish Damascus steel with pearl inlays.', rarity: 'exotic', value: 23500, icon: '🗡️', color: '#eab308', bgGradient: 'from-zinc-950 via-purple-950 to-yellow-950', dropWeight: 0.5, lore: 'Opens with a lethal mechanical snap.' },
];

// Crate 7: Sovereign Bullshit Reliquary ($15,000)
const SOVEREIGN_ITEMS: LootItem[] = [
  { id: 'sov-g1', name: 'Diamond Encrusted Pit Boss Gavel', description: '50 carats of VVS1 diamonds forged into solid platinum.', rarity: 'common', value: 6500, icon: '🔨', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 25, lore: 'One bang closes the table forever.' },
  { id: 'sov-g2', name: 'Master Key to Fort Knox Vaults', description: 'A solid titanium bypass key for international gold reserves.', rarity: 'common', value: 9800, icon: '🗝️', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 22, lore: 'Guaranteed access to emergency liquidity.' },
  { id: 'sov-1', name: 'Imperial Royal Scepter of Vegas', description: 'Solid gold staff crowned with a 500-carat ruby star.', rarity: 'uncommon', value: 17500, icon: '🪄', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 20, lore: 'Commands every high limit floor in the city.' },
  { id: 'sov-2', name: 'Master Sovereign Liquidity Bond', description: 'Bearer bond guaranteeing immediate wire transfers up to 100k chips.', rarity: 'rare', value: 34000, icon: '📜', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 14, lore: 'Backed by gold reserve vaults.' },
  { id: 'sov-3', name: '★ AWP | Gungnir (Souvenir Factory New) ★', description: 'The spear of Odin forged into a celestial precision instrument.', rarity: 'covert', value: 120000, icon: '🐉', color: '#ef4444', bgGradient: 'from-sky-950 via-indigo-950 to-yellow-950', dropWeight: 3.5, lore: 'Never misses the jackpot target.' },
  { id: 'sov-4', name: 'Imperial Crown of the Sovereign Casino Monarch', description: 'Embossed with 1,000 rubies, sapphires, and uncut Vegas emeralds.', rarity: 'exotic', value: 275000, icon: '👑', color: '#eab308', bgGradient: 'from-purple-950 via-rose-950 to-yellow-950', dropWeight: 0.8, lore: 'Wear it while demanding unlimited table limits.' },
  { id: 'sov-5', name: '★ The 1-of-1 Infinity Bullshit Poop Scepter ★', description: 'Mythological supreme artifact of infinite degens. Grants ultimate flex supremacy.', rarity: 'exotic', value: 680000, icon: '💩', color: '#eab308', bgGradient: 'from-yellow-950 via-amber-950 to-purple-950', dropWeight: 0.3, lore: 'The rarest virtual asset ever minted in human civilization.' },
];

// Crate 8: Cosmic Supernova God Core ($30,000)
const COSMIC_SUPERNOVA_ITEMS: LootItem[] = [
  { id: 'cs-g1', name: 'Antimatter Magnetic Containment Core', description: 'Suspends 50 milligrams of pure antimatter in magnetic vacuum.', rarity: 'common', value: 12500, icon: '🔮', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 25, lore: 'Pure cosmic energy harnessed.' },
  { id: 'cs-g2', name: 'Starlight Celestial Warp Reactor', description: 'Faster-than-light hyperdrive engine harvested from a Dyson sphere.', rarity: 'common', value: 19500, icon: '⚛️', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 22, lore: 'Bends space-time around your chip stack.' },
  { id: 'cs-1', name: 'Quasar Plasma Infusion Matrix', description: 'Channels the concentrated thermal energy of a galactic core.', rarity: 'uncommon', value: 36000, icon: '🌌', color: '#3b82f6', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 20, lore: 'Infinite luminous power.' },
  { id: 'cs-2', name: 'Supernova Time-Dilation Chronometer', description: 'Manipulates localized time-flow to guarantee winning spins.', rarity: 'rare', value: 68000, icon: '⏳', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 14, lore: 'Rewind bad beats at will.' },
  { id: 'cs-3', name: '★ Gravity Scepter of the Event Horizon ★', description: 'Pulls black hole singularities into physical existence.', rarity: 'covert', value: 195000, icon: '🪐', color: '#ef4444', bgGradient: 'from-amber-950 via-purple-950 to-zinc-950', dropWeight: 3.5, lore: 'No light or bad beats can escape its pull.' },
  { id: 'cs-4', name: '★ Karambit | Cosmic Nebula Supernova ★', description: 'Infused with stellar dust from the birth of the Andromeda galaxy.', rarity: 'exotic', value: 520000, icon: '🗡️', color: '#eab308', bgGradient: 'from-indigo-950 via-purple-950 to-yellow-950', dropWeight: 0.8, lore: 'Shimmers across the infrared and ultraviolet spectrum.' },
  { id: 'cs-5', name: '★ The Omniversal 1-of-1 Infinite God Core ★', description: 'The primordial seed of all existence in the multiverse.', rarity: 'exotic', value: 1600000, icon: '🌟', color: '#eab308', bgGradient: 'from-yellow-900 via-amber-700 to-violet-950', dropWeight: 0.3, lore: 'Supreme absolute power over reality itself.' },
];

// Crate 9: Mythic Gemstones & Fictional Minerals Vault ($350)
const GEMSTONES_ITEMS: LootItem[] = [
  { id: 'gem-g1', name: 'Deep Ceylon Star Sapphire', description: 'Exhibits a six-rayed asterism under bright light.', rarity: 'common', value: 140, icon: '🔷', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 24, lore: 'Deep ocean cobalt radiance.' },
  { id: 'gem-g2', name: 'Glowing Green Kryptonite Shard', description: 'Radiates strange cosmic radiation. Keep away from Supermen.', rarity: 'common', value: 230, icon: '🧪', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 22, lore: 'Harmful to Kryptonians, valuable to collectors.' },
  { id: 'gem-1', name: 'Refined Wakandan Vibranium Ingot', description: 'Absorbs and stores all kinetic energy and vibrational shocks.', rarity: 'uncommon', value: 410, icon: '🟣', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 20, lore: 'The foundation of advanced civilization.' },
  { id: 'gem-2', name: 'Pure Crimson Kyber Crystal Core', description: 'Attuned through the Dark Side of the Force to power a plasma blade.', rarity: 'rare', value: 850, icon: '🏮', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 14, lore: 'Bleeds with immense thermal energy.' },
  { id: 'gem-3', name: 'The Philosopher\'s Stone', description: 'Legendary alchemical catalyst capable of turning any base metal into gold.', rarity: 'classified', value: 2200, icon: '🩸', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 6, lore: 'Grants infinite wealth and eternal youth.' },
  { id: 'gem-4', name: 'The Eye of Agamotto Time Relic', description: 'Controls the flow of time and reveals all cosmic paths.', rarity: 'covert', value: 5500, icon: '👁️', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 2.2, lore: 'Dormammu, I have come to gamble.' },
  { id: 'gem-6', name: '★ The Arkenstone | Heart of the Mountain ★', description: 'Faceted jewel of Thrain that shines with inner daylight.', rarity: 'exotic', value: 42000, icon: '💎', color: '#eab308', bgGradient: 'from-sky-950 via-indigo-950 to-yellow-950', dropWeight: 0.6, lore: 'The jewel of kings under the mountain.' },
  { id: 'gem-7', name: '★ 1-of-1 Infinite Reality Stone ★', description: 'Cosmic singularity condensed into an ethereal crimson gem that bends all reality.', rarity: 'exotic', value: 135000, icon: '🌌', color: '#eab308', bgGradient: 'from-red-950 via-amber-900 to-yellow-950', dropWeight: 0.3, lore: 'Reality can be whatever you want.' },
];

// Crate 10: Prehistoric Jurassic Fossil Coffer ($150)
const JURASSIC_FOSSIL_ITEMS: LootItem[] = [
  { id: 'jf-g1', name: 'Mosquito Preserved in Golden Amber', description: 'Contains dinosaur hemoglobin trapped inside ancient tree sap.', rarity: 'common', value: 65, icon: '🪰', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 24, lore: 'Life finds a way.' },
  { id: 'jf-g2', name: 'Curved Velociraptor Predatory Claw', description: 'Sharp as a scalpel. Retractable predatory toe claw.', rarity: 'common', value: 95, icon: '🦅', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 22, lore: 'Taps on floor tiles in your nightmares.' },
  { id: 'jf-1', name: 'Giant Megalodon Shark Serrated Tooth', description: '7-inch serrated black enamel tooth from the apex ocean beast.', rarity: 'uncommon', value: 175, icon: '🦈', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 20, lore: 'Crushed whale vertebrae for breakfast.' },
  { id: 'jf-2', name: 'Intact Spinosaurus Iridescent Dorsal Spine', description: 'Towering dorsal vertebrae with iridescent petrification.', rarity: 'rare', value: 360, icon: '🦖', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 14, lore: 'Ruler of Cretaceous river networks.' },
  { id: 'jf-3', name: 'Petrified Velociraptor Pack Egg', description: 'Intact fossilized nest specimen with golden calcite crystal hollows.', rarity: 'classified', value: 850, icon: '🥚', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 6, lore: 'Preserved under volcanic ash.' },
  { id: 'jf-4', name: 'Complete Triceratops Horn Core', description: 'Massive fossilized brow horn measuring over four feet long.', rarity: 'covert', value: 2600, icon: '🦏', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 2.2, lore: 'Withstood charges from T-Rex.' },
  { id: 'jf-5', name: '★ Tyrannosaurus Rex Skull in Solid Amber ★', description: 'A complete apex predator cranium encased in flawless museum amber.', rarity: 'exotic', value: 17500, icon: '💀', color: '#eab308', bgGradient: 'from-amber-950 via-yellow-950 to-purple-950', dropWeight: 0.6, lore: 'The tyrant lizard king immortalized.' },
  { id: 'jf-6', name: '★ 1-of-1 Living Micro-Raptor Hatchling ★', description: 'Genetically resurrected companion with feathers and inquisitive eyes.', rarity: 'exotic', value: 72000, icon: '🥚', color: '#eab308', bgGradient: 'from-emerald-950 via-amber-900 to-yellow-950', dropWeight: 0.2, lore: 'Welcome... to your casino menagerie.' },
];

// Crate 11: Eldritch Arcane Grimoire Cache ($650)
const ELDRITCH_GRIMOIRE_ITEMS: LootItem[] = [
  { id: 'eg-g1', name: 'Necromancer\'s Raven Bone Wand', description: 'Carved from the thigh bone of an omen raven.', rarity: 'common', value: 260, icon: '🪄', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 24, lore: 'Whispers quiet incantations.' },
  { id: 'eg-g2', name: 'Ancient Golden Scarab Talisman', description: 'Blessed by high priests of Amun-Ra to ward against bad luck.', rarity: 'common', value: 420, icon: '🪲', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 22, lore: 'Flaps solid gold wings when danger nears.' },
  { id: 'eg-1', name: 'Void-Forged Abyssal Obsidian Dagger', description: 'Absorbs all ambient light around the obsidian blade.', rarity: 'uncommon', value: 750, icon: '🗡️', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 20, lore: 'Drawn from the cold dimension beyond stars.' },
  { id: 'eg-2', name: 'Staff of Archmage Azathoth', description: 'Topped with a pulsing eldritch eye that blinks in rhythm with your bets.', rarity: 'rare', value: 1550, icon: '👁️', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 14, lore: 'Channels cosmic horrors directly into chip wins.' },
  { id: 'eg-3', name: 'Grimoire of Forbidden Cthulhu Runes', description: 'Inscribed on dark parchment with shifting starlight glyphs.', rarity: 'classified', value: 3400, icon: '📜', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 6, lore: 'Ph\'nglui mglw\'nafh Cthulhu.' },
  { id: 'eg-4', name: 'Necronomicon Ex-Mortis (Bound in Flesh)', description: 'Ancient Sumerian grimoire inked in demon blood and bound in human leather.', rarity: 'covert', value: 7800, icon: '📖', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 2.5, lore: 'Klaatu barada nikto.' },
  { id: 'eg-5', name: 'Tome of Ultimate Eldritch Transmutation', description: 'Converts cold casino chips into eternal eldritch glory.', rarity: 'mythic', value: 21000, icon: '🔮', color: '#f59e0b', bgGradient: 'from-amber-950 to-zinc-950', dropWeight: 0.8, lore: 'Forbidden knowledge of the outer gods.' },
  { id: 'eg-6', name: '★ Scythe of the Void Harbinger ★', description: 'Reaps the souls of bad beats and splits the fabric of time.', rarity: 'exotic', value: 82000, icon: '🌾', color: '#eab308', bgGradient: 'from-purple-950 via-violet-950 to-yellow-950', dropWeight: 0.4, lore: 'The absolute ruler of forbidden shadow magic.' },
];

// Crate 12: Olympus Mythological Pantheon Reliquary ($2,500)
const OLYMPUS_PANTHEON_ITEMS: LootItem[] = [
  { id: 'oly-g1', name: 'Spartan King\'s Bronze War Helmet', description: 'Corinthian battle helmet dented by Persian spears.', rarity: 'common', value: 1050, icon: '🪖', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 25, lore: 'Tonight we dine in high limits!' },
  { id: 'oly-g2', name: 'Hermes\' Winged Golden Talaria', description: 'Sandals that let the messenger god outrun all bad luck.', rarity: 'common', value: 1600, icon: '🪽', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 22, lore: 'Fly across table minimums.' },
  { id: 'oly-1', name: 'Golden Fleece of Colchis', description: 'Pure ram fleece of celestial gold guarded by a sleepless dragon.', rarity: 'uncommon', value: 2900, icon: '🐑', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 20, lore: 'Brought back by Jason and the Argonauts.' },
  { id: 'oly-2', name: 'Athena\'s Aegis Gorgon Shield', description: 'Embossed with the petrifying gaze of Medusa herself.', rarity: 'rare', value: 5800, icon: '🛡️', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 14, lore: 'Turns losing bets to solid marble.' },
  { id: 'oly-3', name: 'Hades\' Helm of Darkness & Invisibility', description: 'Forged by the Cyclopes to render the wearer completely invisible.', rarity: 'classified', value: 12500, icon: '👑', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 6, lore: 'Walk past the pit bosses undetected.' },
  { id: 'oly-4', name: 'Poseidon\'s Trident of the Ocean Depths', description: 'Strikes the casino floor to summon tidal waves of chips.', rarity: 'covert', value: 29000, icon: '🔱', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 2.2, lore: 'Ruler of the seven seas.' },
  { id: 'oly-6', name: '★ Zeus\'s Primordial Master Thunderbolt ★', description: 'Forged in Mount Etna. Crackles with 100 million volts of raw divine fury.', rarity: 'exotic', value: 175000, icon: '⚡', color: '#eab308', bgGradient: 'from-yellow-950 via-amber-900 to-sky-950', dropWeight: 0.6, lore: 'The supreme weapon of Mount Olympus.' },
  { id: 'oly-7', name: '★ Pandora\'s Box | Primordial Chaos (1-of-1) ★', description: 'The jar containing all cosmic evils and ultimate golden hope.', rarity: 'exotic', value: 420000, icon: '📦', color: '#eab308', bgGradient: 'from-rose-950 via-purple-950 to-yellow-950', dropWeight: 0.2, lore: 'Limitless jackpot glory.' },
];

// Crate 13: Enchanted Forest Alchemist Stash ($75)
const ENCHANTED_ALCHEMIST_ITEMS: LootItem[] = [
  { id: 'ea-g1', name: 'Vial of Shimmering Pixie Dust', description: 'Grants temporary weightlessness and extreme good vibes.', rarity: 'common', value: 30, icon: '✨', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 24, lore: 'Sprinkle over pocket cards.' },
  { id: 'ea-g2', name: 'Elixir of Liquid Fortune & Luck', description: 'Brewed with four-leaf clovers and morning mountain dew.', rarity: 'common', value: 48, icon: '🧪', color: '#9ca3af', bgGradient: 'from-zinc-800 to-zinc-950', dropWeight: 22, lore: 'Sweet, sparkling, and lucky.' },
  { id: 'ea-1', name: 'Root of the Elder Forest Treant', description: 'Knotted root that pulses with ancient botanical magic.', rarity: 'uncommon', value: 85, icon: '🪵', color: '#3b82f6', bgGradient: 'from-blue-950 to-zinc-950', dropWeight: 20, lore: 'Older than the oldest casino in existence.' },
  { id: 'ea-2', name: 'Radiant Phoenix Feather Quill', description: 'Never runs out of fiery ink. Rebirths lost hands from ashes.', rarity: 'rare', value: 180, icon: '🪶', color: '#a855f7', bgGradient: 'from-purple-950 to-zinc-950', dropWeight: 14, lore: 'Burns with eternal warmth.' },
  { id: 'ea-3', name: 'Crystalline Dryad Heart Gem', description: 'Pulsing emerald jewel resonant with natural bounties.', rarity: 'classified', value: 420, icon: '💎', color: '#ec4899', bgGradient: 'from-pink-950 to-zinc-950', dropWeight: 6, lore: 'Glows with living forest energy.' },
  { id: 'ea-4', name: 'Alchemical Philosopher Crucible', description: 'Transmutes low-tier tokens into pure solid gold.', rarity: 'covert', value: 1200, icon: '⚗️', color: '#ef4444', bgGradient: 'from-red-950 to-zinc-950', dropWeight: 2.2, lore: 'Golden alchemical mastery.' },
  { id: 'ea-5', name: '★ Bow of the Celestial Moonlit Huntress ★', description: 'Carved from living Yggdrasil wood strung with silver moonlight.', rarity: 'exotic', value: 5200, icon: '🏹', color: '#eab308', bgGradient: 'from-teal-950 via-emerald-950 to-yellow-950', dropWeight: 0.6, lore: 'Arrows never miss the bullseye multiplier.' },
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

