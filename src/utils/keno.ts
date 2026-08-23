import { KenoDifficulty, KenoPaytable } from '../types';

export const TOTAL_KENO_NUMBERS = 40;
export const KENO_DRAW_COUNT = 10;
export const MAX_KENO_PICKS = 10;

/**
 * Mathematically calibrated Keno paytables for 40 numbers (10 drawn),
 * delivering ~95.0% Expected Value (RTP) across all pick selections (1-10)
 * in all 3 volatility modes.
 */
export const KENO_PAYTABLES: Record<KenoDifficulty, KenoPaytable> = {
  // 1. Classic Vegas: Balanced standard casino curve (~95% RTP)
  classic: {
    1: { 1: 3.8 }, // 25% prob * 3.8 = 95.0%
    2: { 2: 16.5 }, // 5.77% prob * 16.5 = 95.2%
    3: { 2: 2.2, 3: 53.5 }, // 95.0%
    4: { 2: 1.2, 3: 9.5, 4: 140 }, // 95.3%
    5: { 2: 0.8, 3: 4.2, 4: 28, 5: 350 }, // 95.7%
    6: { 3: 2.8, 4: 14, 5: 110, 6: 1500 }, // 95.5%
    7: { 3: 1.7, 4: 7.0, 5: 40, 6: 300, 7: 5000 }, // 95.4%
    8: { 3: 1.1, 4: 3.5, 5: 18, 6: 120, 7: 1200, 8: 15000 }, // 95.3%
    9: { 4: 2.5, 5: 12, 6: 65, 7: 500, 8: 4000, 9: 25000 }, // 95.1%
    10: { 4: 1.8, 5: 7.5, 6: 35, 7: 220, 8: 1500, 9: 11000, 10: 50000 } // 95.1%
  },

  // 2. Safe Grinder: High hit frequency, lower top multipliers (~95% RTP)
  safe: {
    1: { 1: 3.8 },
    2: { 1: 1.5, 2: 6.5 },
    3: { 1: 1.0, 2: 2.8, 3: 10.5 },
    4: { 1: 0.7, 2: 1.8, 3: 4.5, 4: 30 },
    5: { 1: 0.5, 2: 1.4, 3: 3.0, 4: 10, 5: 50 },
    6: { 2: 1.2, 3: 2.5, 4: 7.0, 5: 30, 6: 150 },
    7: { 2: 1.0, 3: 1.8, 4: 4.2, 5: 13, 6: 50, 7: 350 },
    8: { 2: 0.8, 3: 1.5, 4: 3.0, 5: 7.5, 6: 22, 7: 90, 8: 500 },
    9: { 2: 0.4, 3: 1.2, 4: 2.2, 5: 5.0, 6: 15, 7: 50, 8: 180, 9: 900 },
    10: { 2: 0.3, 3: 1.0, 4: 1.8, 5: 3.5, 6: 10, 7: 28, 8: 90, 9: 350, 10: 1800 }
  },

  // 3. Bullshit Degen: Extreme jackpot multipliers, all-or-nothing (~95% RTP)
  degen: {
    1: { 1: 3.8 },
    2: { 2: 16.5 },
    3: { 3: 78 },
    4: { 3: 4.0, 4: 345 },
    5: { 4: 15, 5: 2100 },
    6: { 4: 8, 5: 90, 6: 10500 },
    7: { 4: 2.0, 5: 32, 6: 550, 7: 75000 },
    8: { 4: 2.2, 5: 16, 6: 180, 7: 2600, 8: 320000 },
    9: { 5: 12, 6: 95, 7: 1200, 8: 20000, 9: 1200000 },
    10: { 5: 6.5, 6: 45, 7: 500, 8: 7000, 9: 100000, 10: 3000000 }
  }
};

/**
 * Calculates payout multiplier for given picks, hits, and difficulty
 */
export function getKenoMultiplier(
  pickCount: number,
  hitCount: number,
  difficulty: KenoDifficulty
): number {
  if (pickCount < 1 || pickCount > MAX_KENO_PICKS) return 0;
  const table = KENO_PAYTABLES[difficulty]?.[pickCount];
  if (!table) return 0;
  return table[hitCount] || 0;
}

/**
 * Generates array of 20 drawn numbers without duplicates
 */
export function drawKenoNumbers(): number[] {
  const pool = Array.from({ length: TOTAL_KENO_NUMBERS }, (_, i) => i + 1);
  const drawn: number[] = [];
  
  for (let i = 0; i < KENO_DRAW_COUNT; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    drawn.push(pool[randomIndex]);
    pool.splice(randomIndex, 1);
  }
  
  return drawn;
}
