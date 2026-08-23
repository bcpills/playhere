import { Card, PlayerHand, Rank, Suit } from '../types';

export const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function createShoe(deckCount = 6): Card[] {
  const shoe: Card[] = [];
  for (let d = 0; d < deckCount; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        let value = parseInt(rank, 10);
        if (['J', 'Q', 'K'].includes(rank)) value = 10;
        if (rank === 'A') value = 11;
        shoe.push({
          id: `${d}-${suit}-${rank}-${Math.random().toString(36).substring(2, 6)}`,
          suit,
          rank,
          value,
          isAce: rank === 'A',
        });
      }
    }
  }
  return shuffle(shoe);
}

export function shuffle(cards: Card[]): Card[] {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function calculateHandValue(cards: Card[]): { total: number; isSoft: boolean; isBlackjack: boolean; isBust: boolean } {
  let total = 0;
  let aces = 0;

  for (const c of cards) {
    if (c.hidden) continue;
    if (c.isAce) {
      aces++;
      total += 11;
    } else {
      total += c.value;
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  const isSoft = aces > 0 && total <= 21;
  const isBlackjack = cards.length === 2 && total === 21;
  const isBust = total > 21;

  return { total, isSoft, isBlackjack, isBust };
}

// Side Bets Evaluation

export function evaluate21Plus3(playerCard1: Card, playerCard2: Card, dealerUpcard: Card): { name: string; multiplier: number } | null {
  const cards = [playerCard1, playerCard2, dealerUpcard];
  const suits = cards.map(c => c.suit);
  const isFlush = suits[0] === suits[1] && suits[1] === suits[2];

  // Rank values for straight check
  const rankOrder: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };

  const ranks = cards.map(c => rankOrder[c.rank]).sort((a, b) => a - b);
  const isThreeOfAKind = cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank;

  // Check straight (including A-2-3 wrap)
  let isStraight = (ranks[0] + 1 === ranks[1] && ranks[1] + 1 === ranks[2]);
  if (!isStraight && ranks[0] === 2 && ranks[1] === 3 && ranks[2] === 14) {
    isStraight = true; // A-2-3
  }

  // Suited Trips (Same rank AND same suit across multi-deck)
  if (isThreeOfAKind && isFlush) {
    return { name: 'Suited Trips', multiplier: 100 };
  }

  // Straight Flush
  if (isStraight && isFlush) {
    return { name: 'Straight Flush', multiplier: 40 };
  }

  // Three of a Kind
  if (isThreeOfAKind) {
    return { name: 'Three of a Kind', multiplier: 30 };
  }

  // Straight
  if (isStraight) {
    return { name: 'Straight', multiplier: 10 };
  }

  // Flush
  if (isFlush) {
    return { name: 'Flush', multiplier: 5 };
  }

  return null;
}

export function evaluatePerfectPairs(card1: Card, card2: Card): { name: string; multiplier: number } | null {
  if (card1.rank !== card2.rank) return null;

  // Perfect Pair: Same rank and same suit
  if (card1.suit === card2.suit) {
    return { name: 'Perfect Pair (Same Suit)', multiplier: 25 };
  }

  // Colored Pair: Same rank, same color, different suit
  const isRed1 = card1.suit === '♥' || card1.suit === '♦';
  const isRed2 = card2.suit === '♥' || card2.suit === '♦';

  if (isRed1 === isRed2) {
    return { name: 'Colored Pair', multiplier: 12 };
  }

  // Mixed Pair: Same rank, different color
  return { name: 'Mixed Pair', multiplier: 6 };
}

export function evaluateLuckyLadies(card1: Card, card2: Card, dealerHasBlackjack: boolean): { name: string; multiplier: number } | null {
  const isQueenHearts1 = card1.rank === 'Q' && card1.suit === '♥';
  const isQueenHearts2 = card2.rank === 'Q' && card2.suit === '♥';

  // Two Queens of Hearts
  if (isQueenHearts1 && isQueenHearts2) {
    if (dealerHasBlackjack) {
      return { name: 'Queens of Hearts + Dealer Blackjack Jackpot!', multiplier: 1000 };
    }
    return { name: 'Two Queens of Hearts', multiplier: 100 };
  }

  // Check if hand sums to 20
  const { total } = calculateHandValue([card1, card2]);
  if (total !== 20) return null;

  // Matched 20: Same rank AND same suit (e.g. 10♠ + 10♠)
  if (card1.rank === card2.rank && card1.suit === card2.suit) {
    return { name: 'Matched 20 (Same Suit & Rank)', multiplier: 25 };
  }

  // Suited 20: Same suit, sum 20 (e.g. K♠ + 10♠)
  if (card1.suit === card2.suit) {
    return { name: 'Suited 20', multiplier: 10 };
  }

  // Any 20: Any combination summing to 20
  return { name: 'Lucky 20', multiplier: 4 };
}
