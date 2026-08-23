import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Info, RefreshCw, Zap, Shield, HelpCircle } from 'lucide-react';
import { Card, PlayerHand, BlackjackSideBets, SideBetResults, CasinoStats } from '../types';
import {
  createShoe,
  calculateHandValue,
  evaluate21Plus3,
  evaluatePerfectPairs,
  evaluateLuckyLadies,
} from '../utils/blackjack';
import { sound } from '../utils/audio';
import { ChipSelector } from './ChipSelector';

interface BlackjackGameProps {
  balance: number;
  onUpdateBalance: (delta: number) => void;
  onUpdateStats: (updater: (prev: CasinoStats) => CasinoStats) => void;
}

const DEALER_QUIPS = {
  idle: [
    "Step right up. The cards are hot and my mortgage is due.",
    "Place your bets! Side bets pay out like crazy (when they hit).",
    "Don't be shy, fortune favors the degenerate.",
  ],
  deal: [
    "Cards on the felt. Let's see what you've got.",
    "Big money, no whammies.",
  ],
  playerBlackjack: [
    "Blackjack! Look at Mr. Moneybags over here.",
    "Natural 21! Don't spend it all in one loot crate.",
    "Clean 3:2 payout. Nicely done.",
  ],
  dealerWin: [
    "House takes it. The casino air conditioning isn't free!",
    "Tough break. Double down next time to get it all back!",
    "Dealer wins. Thanks for your generous contribution.",
  ],
  playerWin: [
    "Winner winner! Take your chips before we change the rules.",
    "Nice hand! You beat the pit boss.",
  ],
  push: [
    "Push! Nobody wins, nobody cries. Chips returned.",
    "A standoff. Live to gamble another round.",
  ],
  sideBetHit: [
    "🔥 SIDE BET JACKPOT HIT! That's what I'm talking about!",
    "BOOM! Look at that side bet payout!",
  ],
};

export const BlackjackGame: React.FC<BlackjackGameProps> = ({
  balance,
  onUpdateBalance,
  onUpdateStats,
}) => {
  // Shoe & Deck
  const [shoe, setShoe] = useState<Card[]>(() => createShoe(6));
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [hands, setHands] = useState<PlayerHand[]>([]);
  const [activeHandIndex, setActiveHandIndex] = useState<number>(0);

  // Betting
  const [selectedChip, setSelectedChip] = useState<number>(50);
  const [mainBet, setMainBet] = useState<number>(100);
  const [sideBets, setSideBets] = useState<BlackjackSideBets>({
    twentyOnePlusThree: 0,
    perfectPairs: 0,
    luckyLadies: 0,
  });

  // Game Phases
  const [phase, setPhase] = useState<'betting' | 'dealing' | 'insurance' | 'player' | 'dealer' | 'payout'>('betting');
  const [sideBetResults, setSideBetResults] = useState<SideBetResults | null>(null);
  const [showPaytableModal, setShowPaytableModal] = useState<boolean>(false);
  const [dealerComment, setDealerComment] = useState<string>(DEALER_QUIPS.idle[0]);
  const [lastRoundPayout, setLastRoundPayout] = useState<{ total: number; breakdown: string[] } | null>(null);

  const totalCurrentBet = mainBet + sideBets.twentyOnePlusThree + sideBets.perfectPairs + sideBets.luckyLadies;

  // Reshuffle shoe if low
  const checkShoe = useCallback(() => {
    if (shoe.length < 52) {
      const newShoe = createShoe(6);
      setShoe(newShoe);
      return newShoe;
    }
    return shoe;
  }, [shoe]);

  // Draw card helper
  const drawCard = useCallback((deck: Card[], hidden = false): { card: Card; newDeck: Card[] } => {
    const currentDeck = deck.length < 1 ? createShoe(6) : deck;
    const card = { ...currentDeck[0], hidden };
    return { card, newDeck: currentDeck.slice(1) };
  }, []);

  // Place bet on a spot
  const handleSpotBet = (spot: 'main' | '21+3' | 'pairs' | 'ladies') => {
    if (phase !== 'betting') return;
    if (balance < selectedChip) return;

    sound.playChip();
    if (spot === 'main') {
      setMainBet(prev => prev + selectedChip);
    } else if (spot === '21+3') {
      setSideBets(prev => ({ ...prev, twentyOnePlusThree: prev.twentyOnePlusThree + selectedChip }));
    } else if (spot === 'pairs') {
      setSideBets(prev => ({ ...prev, perfectPairs: prev.perfectPairs + selectedChip }));
    } else if (spot === 'ladies') {
      setSideBets(prev => ({ ...prev, luckyLadies: prev.luckyLadies + selectedChip }));
    }
  };

  const handleClearBets = () => {
    if (phase !== 'betting') return;
    setMainBet(0);
    setSideBets({ twentyOnePlusThree: 0, perfectPairs: 0, luckyLadies: 0 });
  };

  const handleDoubleBets = () => {
    if (phase !== 'betting') return;
    if (balance >= totalCurrentBet * 2) {
      setMainBet(prev => prev * 2);
      setSideBets(prev => ({
        twentyOnePlusThree: prev.twentyOnePlusThree * 2,
        perfectPairs: prev.perfectPairs * 2,
        luckyLadies: prev.luckyLadies * 2,
      }));
    }
  };

  const handleHalfBets = () => {
    if (phase !== 'betting') return;
    setMainBet(prev => Math.max(10, Math.floor(prev / 2)));
    setSideBets(prev => ({
      twentyOnePlusThree: Math.floor(prev.twentyOnePlusThree / 2),
      perfectPairs: Math.floor(prev.perfectPairs / 2),
      luckyLadies: Math.floor(prev.luckyLadies / 2),
    }));
  };

  const handleMaxBet = () => {
    if (phase !== 'betting') return;
    const maxMain = Math.min(balance, 10000);
    setMainBet(maxMain);
  };

  // Start Deal
  const handleDeal = async () => {
    if (mainBet <= 0 || balance < totalCurrentBet) return;

    // Deduct wager
    onUpdateBalance(-totalCurrentBet);
    onUpdateStats(prev => ({
      ...prev,
      totalWagered: prev.totalWagered + totalCurrentBet,
      handsPlayedBlackjack: prev.handsPlayedBlackjack + 1,
    }));

    setPhase('dealing');
    setSideBetResults(null);
    setLastRoundPayout(null);
    setDealerComment(DEALER_QUIPS.deal[Math.floor(Math.random() * DEALER_QUIPS.deal.length)]);

    let currentDeck = checkShoe();

    // Deal sequence: Player 1, Dealer 1, Player 2, Dealer 2 (Face down)
    const p1 = drawCard(currentDeck);
    sound.playCardDeal();
    currentDeck = p1.newDeck;

    await new Promise(r => setTimeout(r, 250));
    const d1 = drawCard(currentDeck);
    sound.playCardDeal();
    currentDeck = d1.newDeck;

    await new Promise(r => setTimeout(r, 250));
    const p2 = drawCard(currentDeck);
    sound.playCardDeal();
    currentDeck = p2.newDeck;

    await new Promise(r => setTimeout(r, 250));
    const d2 = drawCard(currentDeck, true); // Dealer hole card hidden
    sound.playCardDeal();
    currentDeck = d2.newDeck;

    const initialPlayerCards = [p1.card, p2.card];
    const initialDealerCards = [d1.card, d2.card];

    setShoe(currentDeck);
    setDealerCards(initialDealerCards);

    const initialHand: PlayerHand = {
      id: 'hand-0',
      cards: initialPlayerCards,
      bet: mainBet,
      status: 'active',
    };
    setHands([initialHand]);
    setActiveHandIndex(0);

    // Evaluate Side Bets!
    let sideBetWinnings = 0;
    const results: SideBetResults = {};

    // 1. 21+3
    if (sideBets.twentyOnePlusThree > 0) {
      const match21 = evaluate21Plus3(p1.card, p2.card, d1.card);
      if (match21) {
        const win = sideBets.twentyOnePlusThree * (match21.multiplier + 1);
        results.twentyOnePlusThree = { name: match21.name, multiplier: match21.multiplier, win };
        sideBetWinnings += win;
      }
    }

    // 2. Perfect Pairs
    if (sideBets.perfectPairs > 0) {
      const matchPairs = evaluatePerfectPairs(p1.card, p2.card);
      if (matchPairs) {
        const win = sideBets.perfectPairs * (matchPairs.multiplier + 1);
        results.perfectPairs = { name: matchPairs.name, multiplier: matchPairs.multiplier, win };
        sideBetWinnings += win;
      }
    }

    // 3. Lucky Ladies
    const dealerHasBJ = d1.card.isAce && (d2.card.value === 10);
    if (sideBets.luckyLadies > 0) {
      const matchLadies = evaluateLuckyLadies(p1.card, p2.card, dealerHasBJ);
      if (matchLadies) {
        const win = sideBets.luckyLadies * (matchLadies.multiplier + 1);
        results.luckyLadies = { name: matchLadies.name, multiplier: matchLadies.multiplier, win };
        sideBetWinnings += win;
      }
    }

    if (sideBetWinnings > 0) {
      setSideBetResults(results);
      onUpdateBalance(sideBetWinnings);
      sound.playWin(true);
      setDealerComment(DEALER_QUIPS.sideBetHit[Math.floor(Math.random() * DEALER_QUIPS.sideBetHit.length)]);
      onUpdateStats(prev => ({
        ...prev,
        sideBetWinsBlackjack: prev.sideBetWinsBlackjack + 1,
        totalWon: prev.totalWon + sideBetWinnings,
        biggestWin: Math.max(prev.biggestWin, sideBetWinnings),
      }));
    }

    // Check Player Natural Blackjack
    const playerVal = calculateHandValue(initialPlayerCards);
    const dealerUpVal = d1.card.value;

    // Check for Dealer Ace (offer Insurance)
    if (d1.card.isAce && !playerVal.isBlackjack) {
      setPhase('insurance');
      return;
    }

    if (playerVal.isBlackjack) {
      initialHand.status = 'blackjack';
      setHands([initialHand]);
      // Reveal dealer hole card
      await revealDealerHoleCard(initialDealerCards, [initialHand]);
      return;
    }

    setPhase('player');
  };

  // Skip insurance or take insurance
  const handleInsurance = async (take: boolean) => {
    if (take) {
      const insCost = Math.floor(mainBet / 2);
      if (balance >= insCost) {
        onUpdateBalance(-insCost);
        // Check dealer hole card
        const dealerVal = calculateHandValue([dealerCards[0], { ...dealerCards[1], hidden: false }]);
        if (dealerVal.isBlackjack) {
          onUpdateBalance(insCost * 3); // 2:1 insurance payout + principal
          sound.playWin();
        }
      }
    }
    setPhase('player');
  };

  // Player Actions: HIT
  const handleHit = async () => {
    if (phase !== 'player') return;
    const currentHand = hands[activeHandIndex];
    if (!currentHand || currentHand.status !== 'active') return;

    let currentDeck = shoe;
    const { card, newDeck } = drawCard(currentDeck);
    sound.playCardDeal();
    setShoe(newDeck);

    const updatedCards = [...currentHand.cards, card];
    const val = calculateHandValue(updatedCards);

    const updatedHands = [...hands];
    if (val.isBust) {
      sound.playLoss();
      updatedHands[activeHandIndex] = {
        ...currentHand,
        cards: updatedCards,
        status: 'busted',
      };
      setHands(updatedHands);
      advanceOrFinishHands(updatedHands);
    } else if (val.total === 21) {
      updatedHands[activeHandIndex] = {
        ...currentHand,
        cards: updatedCards,
        status: 'stood',
      };
      setHands(updatedHands);
      advanceOrFinishHands(updatedHands);
    } else {
      updatedHands[activeHandIndex] = {
        ...currentHand,
        cards: updatedCards,
      };
      setHands(updatedHands);
    }
  };

  // Player Actions: STAND
  const handleStand = () => {
    if (phase !== 'player') return;
    const currentHand = hands[activeHandIndex];
    if (!currentHand || currentHand.status !== 'active') return;

    sound.playCardFlip();
    const updatedHands = [...hands];
    updatedHands[activeHandIndex] = {
      ...currentHand,
      status: 'stood',
    };
    setHands(updatedHands);
    advanceOrFinishHands(updatedHands);
  };

  // Player Actions: DOUBLE DOWN
  const handleDoubleDown = async () => {
    if (phase !== 'player') return;
    const currentHand = hands[activeHandIndex];
    if (!currentHand || currentHand.cards.length !== 2 || balance < currentHand.bet) return;

    // Deduct double bet
    onUpdateBalance(-currentHand.bet);
    onUpdateStats(prev => ({
      ...prev,
      totalWagered: prev.totalWagered + currentHand.bet,
    }));

    let currentDeck = shoe;
    const { card, newDeck } = drawCard(currentDeck);
    sound.playCardDeal();
    setShoe(newDeck);

    const updatedCards = [...currentHand.cards, card];
    const val = calculateHandValue(updatedCards);

    const updatedHands = [...hands];
    updatedHands[activeHandIndex] = {
      ...currentHand,
      cards: updatedCards,
      bet: currentHand.bet * 2,
      status: val.isBust ? 'busted' : 'doubled',
    };
    setHands(updatedHands);

    if (val.isBust) {
      sound.playLoss();
    }
    advanceOrFinishHands(updatedHands);
  };

  // Player Actions: SPLIT
  const handleSplit = () => {
    if (phase !== 'player') return;
    const currentHand = hands[activeHandIndex];
    if (!currentHand || currentHand.cards.length !== 2 || currentHand.cards[0].rank !== currentHand.cards[1].rank || balance < currentHand.bet) return;

    onUpdateBalance(-currentHand.bet);
    sound.playCardFlip();

    let currentDeck = shoe;
    const draw1 = drawCard(currentDeck);
    currentDeck = draw1.newDeck;
    const draw2 = drawCard(currentDeck);
    currentDeck = draw2.newDeck;
    setShoe(currentDeck);

    const hand1: PlayerHand = {
      id: 'hand-0',
      cards: [currentHand.cards[0], draw1.card],
      bet: currentHand.bet,
      status: 'active',
    };

    const hand2: PlayerHand = {
      id: 'hand-1',
      cards: [currentHand.cards[1], draw2.card],
      bet: currentHand.bet,
      status: 'active',
    };

    setHands([hand1, hand2]);
    setActiveHandIndex(0);
  };

  // Advance to next split hand or dealer turn
  const advanceOrFinishHands = (currentHands: PlayerHand[]) => {
    if (activeHandIndex < currentHands.length - 1) {
      setActiveHandIndex(prev => prev + 1);
    } else {
      // Check if all hands busted
      const allBusted = currentHands.every(h => h.status === 'busted');
      if (allBusted) {
        // Reveal dealer hole card and finalize
        revealDealerHoleCard(dealerCards, currentHands);
      } else {
        runDealerTurn(currentHands);
      }
    }
  };

  // Reveal dealer hole card & complete dealer drawing (Hits soft 17, stands hard 17)
  const runDealerTurn = async (currentHands: PlayerHand[]) => {
    setPhase('dealer');

    // Unhide dealer hole card
    let dCards: Card[] = dealerCards.map(c => ({ ...c, hidden: false }));
    setDealerCards(dCards);
    sound.playCardFlip();
    await new Promise(r => setTimeout(r, 600));

    let currentDeck = shoe;
    let dVal = calculateHandValue(dCards);

    // Dealer draws to at least 17 (Dealer hits Soft 17: isSoft && total === 17)
    while (dVal.total < 17 || (dVal.isSoft && dVal.total === 17)) {
      const { card, newDeck } = drawCard(currentDeck);
      currentDeck = newDeck;
      dCards = [...dCards, card];
      setDealerCards(dCards);
      sound.playCardDeal();
      dVal = calculateHandValue(dCards);
      await new Promise(r => setTimeout(r, 600));
    }

    setShoe(currentDeck);
    finalizeRound(dCards, currentHands);
  };

  const revealDealerHoleCard = async (dCards: Card[], currentHands: PlayerHand[]) => {
    const revealed = dCards.map(c => ({ ...c, hidden: false }));
    setDealerCards(revealed);
    sound.playCardFlip();
    await new Promise(r => setTimeout(r, 500));
    finalizeRound(revealed, currentHands);
  };

  // Final settlement
  const finalizeRound = (finalDealerCards: Card[], finalHands: PlayerHand[]) => {
    setPhase('payout');
    const dVal = calculateHandValue(finalDealerCards);
    let totalWonThisRound = 0;
    const breakdownMsgs: string[] = [];

    const evaluatedHands = finalHands.map((hand) => {
      const pVal = calculateHandValue(hand.cards);
      let outcome: 'win' | 'lose' | 'push' | 'blackjack' | 'bust' = 'lose';
      let payout = 0;
      let msg = '';

      if (hand.status === 'busted') {
        outcome = 'bust';
        payout = 0;
        msg = `Busted with ${pVal.total}. Lost ${hand.bet} chips.`;
      } else if (pVal.isBlackjack && !dVal.isBlackjack) {
        outcome = 'blackjack';
        payout = hand.bet + hand.bet * 1.5; // 3:2 payout
        msg = `Blackjack! Won ${(hand.bet * 1.5).toLocaleString()} chips!`;
      } else if (dVal.isBlackjack && !pVal.isBlackjack) {
        outcome = 'lose';
        payout = 0;
        msg = `Dealer has Blackjack. Lost ${hand.bet} chips.`;
      } else if (dVal.isBust) {
        outcome = 'win';
        payout = hand.bet * 2;
        msg = `Dealer Busted with ${dVal.total}! Won ${hand.bet.toLocaleString()} chips.`;
      } else if (pVal.total > dVal.total) {
        outcome = 'win';
        payout = hand.bet * 2;
        msg = `${pVal.total} beats ${dVal.total}! Won ${hand.bet.toLocaleString()} chips.`;
      } else if (pVal.total === dVal.total) {
        outcome = 'push';
        payout = hand.bet;
        msg = `Push at ${pVal.total}. Bet ${hand.bet} returned.`;
      } else {
        outcome = 'lose';
        payout = 0;
        msg = `Dealer's ${dVal.total} beats ${pVal.total}. Lost ${hand.bet} chips.`;
      }

      if (payout > 0) {
        totalWonThisRound += payout;
      }
      breakdownMsgs.push(msg);

      return {
        ...hand,
        result: { outcome, payout, message: msg },
      };
    });

    setHands(evaluatedHands);

    if (totalWonThisRound > 0) {
      onUpdateBalance(totalWonThisRound);
      const isBigWin = totalWonThisRound >= mainBet * 3;
      if (isBigWin) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        sound.playWin(true);
      } else {
        sound.playWin(false);
      }
      setDealerComment(DEALER_QUIPS.playerWin[Math.floor(Math.random() * DEALER_QUIPS.playerWin.length)]);
    } else {
      sound.playLoss();
      setDealerComment(DEALER_QUIPS.dealerWin[Math.floor(Math.random() * DEALER_QUIPS.dealerWin.length)]);
    }

    setLastRoundPayout({ total: totalWonThisRound, breakdown: breakdownMsgs });
    onUpdateStats(prev => ({
      ...prev,
      totalWon: prev.totalWon + totalWonThisRound,
      biggestWin: Math.max(prev.biggestWin, totalWonThisRound),
    }));
  };

  const handleNewRound = () => {
    sound.playChip();
    setHands([]);
    setDealerCards([]);
    setSideBetResults(null);
    setLastRoundPayout(null);
    setPhase('betting');
    setDealerComment(DEALER_QUIPS.idle[Math.floor(Math.random() * DEALER_QUIPS.idle.length)]);
  };

  const dealerScore = calculateHandValue(dealerCards);
  const activeHand = hands[activeHandIndex];
  const canSplit = phase === 'player' && activeHand && activeHand.cards.length === 2 && activeHand.cards[0].rank === activeHand.cards[1].rank && hands.length === 1 && balance >= activeHand.bet;
  const canDouble = phase === 'player' && activeHand && activeHand.cards.length === 2 && balance >= activeHand.bet;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Top Bar: Dealer Speech & Paytable Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-zinc-900 border-2 border-emerald-400 flex items-center justify-center text-lg shadow-md">
            🤵‍♂️
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <span>Casino Pit Dealer</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 italic font-medium">
              "{dealerComment}"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="side-bet-paytable-btn"
            onClick={() => setShowPaytableModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Side Bet Paytables</span>
          </button>
        </div>
      </div>

      {/* Main Blackjack Table Felt */}
      <div 
        id="blackjack-felt-table"
        className="relative w-full rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-emerald-950 via-emerald-900 to-zinc-950 border-4 border-amber-700/60 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Decorative Felt Arch & Watermark */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
          <span className="text-[160px] font-black text-amber-300 select-none">💩</span>
        </div>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-40">
          <div className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-amber-300 font-bold border-b border-amber-400/40 pb-1">
            BLACKJACK PAYS 3 TO 2 • DEALER MUST HIT SOFT 17 • INSURANCE PAYS 2 TO 1
          </div>
        </div>

        {/* DEALER AREA */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[140px] pt-4 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider font-black text-emerald-300/80">Dealer</span>
            {dealerCards.length > 0 && !dealerCards.some(c => c.hidden) && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-zinc-900/90 text-amber-300 border border-amber-500/40 font-mono">
                {dealerScore.total} {dealerScore.isBlackjack && '🔥 BLACKJACK'} {dealerScore.isBust && '💥 BUST'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {dealerCards.length === 0 ? (
              <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-dashed border-emerald-500/30 flex items-center justify-center text-emerald-500/40 text-xs font-bold">
                Dealer Box
              </div>
            ) : (
              dealerCards.map((card, idx) => (
                <RenderPlayingCard key={card.id || idx} card={card} />
              ))
            )}
          </div>
        </div>

        {/* SIDE BETS BANNER / WIN CELEBRATION */}
        {sideBetResults && (
          <div className="relative z-20 my-2 p-3 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-zinc-950 font-black text-center shadow-2xl animate-bounce">
            <div className="text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-white animate-spin" />
              <span>SIDE BET WINNINGS TRIGGERED!</span>
              <Sparkles className="w-5 h-5 text-white animate-spin" />
            </div>
            <div className="text-sm sm:text-base flex flex-wrap items-center justify-center gap-3 mt-1">
              {sideBetResults.twentyOnePlusThree && (
                <span className="bg-black/20 px-2 py-0.5 rounded">
                  21+3 ({sideBetResults.twentyOnePlusThree.name}): +{sideBetResults.twentyOnePlusThree.win.toLocaleString()} chips
                </span>
              )}
              {sideBetResults.perfectPairs && (
                <span className="bg-black/20 px-2 py-0.5 rounded">
                  Pairs ({sideBetResults.perfectPairs.name}): +{sideBetResults.perfectPairs.win.toLocaleString()} chips
                </span>
              )}
              {sideBetResults.luckyLadies && (
                <span className="bg-black/20 px-2 py-0.5 rounded">
                  Lucky Ladies ({sideBetResults.luckyLadies.name}): +{sideBetResults.luckyLadies.win.toLocaleString()} chips
                </span>
              )}
            </div>
          </div>
        )}

        {/* BETTING CIRCLES (Side Bets + Main Bet) */}
        {phase === 'betting' && (
          <div className="relative z-10 grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-2xl mx-auto my-6">
            {/* 21+3 Side Bet Circle */}
            <div
              id="bet-circle-21-3"
              onClick={() => handleSpotBet('21+3')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-950/60 border-2 border-dashed border-purple-500/60 hover:border-purple-400 cursor-pointer hover:bg-purple-950/30 transition-all text-center group"
            >
              <span className="text-[10px] uppercase font-bold text-purple-300 group-hover:scale-105 transition-transform">
                21 + 3
              </span>
              <span className="text-[9px] text-zinc-400">Up to 100:1</span>
              <div className="mt-2 w-12 h-12 rounded-full border-2 border-purple-400/40 flex items-center justify-center font-bold text-xs text-purple-200 bg-purple-950/40">
                {sideBets.twentyOnePlusThree > 0 ? (
                  <span className="text-amber-300 font-black">{sideBets.twentyOnePlusThree}</span>
                ) : (
                  <span className="text-zinc-500 text-[10px]">TAP</span>
                )}
              </div>
            </div>

            {/* Perfect Pairs Side Bet Circle */}
            <div
              id="bet-circle-pairs"
              onClick={() => handleSpotBet('pairs')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-950/60 border-2 border-dashed border-blue-500/60 hover:border-blue-400 cursor-pointer hover:bg-blue-950/30 transition-all text-center group"
            >
              <span className="text-[10px] uppercase font-bold text-blue-300 group-hover:scale-105 transition-transform">
                Perfect Pairs
              </span>
              <span className="text-[9px] text-zinc-400">Up to 25:1</span>
              <div className="mt-2 w-12 h-12 rounded-full border-2 border-blue-400/40 flex items-center justify-center font-bold text-xs text-blue-200 bg-blue-950/40">
                {sideBets.perfectPairs > 0 ? (
                  <span className="text-amber-300 font-black">{sideBets.perfectPairs}</span>
                ) : (
                  <span className="text-zinc-500 text-[10px]">TAP</span>
                )}
              </div>
            </div>

            {/* Lucky Ladies Side Bet Circle */}
            <div
              id="bet-circle-ladies"
              onClick={() => handleSpotBet('ladies')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-950/60 border-2 border-dashed border-rose-500/60 hover:border-rose-400 cursor-pointer hover:bg-rose-950/30 transition-all text-center group"
            >
              <span className="text-[10px] uppercase font-bold text-rose-300 group-hover:scale-105 transition-transform">
                Lucky Ladies
              </span>
              <span className="text-[9px] text-zinc-400">Up to 1000:1</span>
              <div className="mt-2 w-12 h-12 rounded-full border-2 border-rose-400/40 flex items-center justify-center font-bold text-xs text-rose-200 bg-rose-950/40">
                {sideBets.luckyLadies > 0 ? (
                  <span className="text-amber-300 font-black">{sideBets.luckyLadies}</span>
                ) : (
                  <span className="text-zinc-500 text-[10px]">TAP</span>
                )}
              </div>
            </div>

            {/* Main Blackjack Bet Circle */}
            <div
              id="bet-circle-main"
              onClick={() => handleSpotBet('main')}
              className="col-span-3 sm:col-span-1 flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-950/40 border-2 border-amber-400 hover:border-amber-300 cursor-pointer hover:bg-amber-950/60 transition-all text-center shadow-lg shadow-amber-500/10 group"
            >
              <span className="text-[10px] uppercase font-black text-amber-300 group-hover:scale-105 transition-transform">
                Main Bet (3:2)
              </span>
              <span className="text-[9px] text-amber-400/80">Standard Hand</span>
              <div className="mt-2 w-12 h-12 rounded-full border-2 border-amber-400 flex items-center justify-center font-black text-xs text-amber-200 bg-amber-900/60 shadow-inner">
                {mainBet > 0 ? (
                  <span className="text-yellow-300 font-black">{mainBet}</span>
                ) : (
                  <span className="text-amber-500/60 text-[10px]">TAP</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PLAYER HANDS AREA */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 min-h-[160px] pt-4 pb-4">
          {hands.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-emerald-400/50 text-xs font-semibold">
              <span>Place your chips in the betting circles above and press DEAL</span>
            </div>
          ) : (
            hands.map((hand, hIdx) => {
              const val = calculateHandValue(hand.cards);
              const isActive = hIdx === activeHandIndex && phase === 'player';

              return (
                <div
                  key={hand.id || hIdx}
                  className={`flex flex-col items-center p-4 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-zinc-950/90 ring-2 ring-amber-400 shadow-2xl scale-105'
                      : 'bg-zinc-950/60 border border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">
                      {hands.length > 1 ? `Hand #${hIdx + 1}` : 'Your Hand'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-zinc-900 text-amber-300 border border-amber-500/40 font-mono">
                      {val.total} {val.isBlackjack && '🔥 21'} {val.isBust && '💥 BUST'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold">
                      Bet: {hand.bet}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {hand.cards.map((card, cIdx) => (
                      <RenderPlayingCard key={card.id || cIdx} card={card} />
                    ))}
                  </div>

                  {hand.result && (
                    <div className="mt-2 text-xs font-bold text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full ${
                          hand.result.outcome === 'win' || hand.result.outcome === 'blackjack'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : hand.result.outcome === 'push'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {hand.result.message}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Insurance Request Dialog */}
        {phase === 'insurance' && (
          <div className="relative z-30 my-4 p-4 rounded-2xl bg-zinc-950/95 border-2 border-amber-500 shadow-2xl max-w-md mx-auto text-center animate-fade-in">
            <h3 className="text-sm font-black uppercase text-amber-300 tracking-wider">
              Dealer Shows Ace: Insurance?
            </h3>
            <p className="text-xs text-zinc-400 mt-1 mb-3">
              Costs {Math.floor(mainBet / 2)} chips. Pays 2:1 if dealer has Blackjack.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                id="insure-yes-btn"
                disabled={balance < Math.floor(mainBet / 2)}
                onClick={() => handleInsurance(true)}
                className="px-4 py-2 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-md disabled:opacity-50"
              >
                Take Insurance ({Math.floor(mainBet / 2)} Chips)
              </button>
              <button
                id="insure-no-btn"
                onClick={() => handleInsurance(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* PLAYER ACTION CONTROLS */}
        <div className="relative z-20 mt-4 flex flex-wrap items-center justify-center gap-2.5">
          {phase === 'betting' && (
            <button
              id="deal-cards-btn"
              disabled={mainBet <= 0 || balance < totalCurrentBet}
              onClick={handleDeal}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-sm sm:text-base tracking-wider uppercase shadow-xl shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              DEAL CARDS ({totalCurrentBet} Chips)
            </button>
          )}

          {phase === 'player' && (
            <>
              <button
                id="bj-hit-btn"
                onClick={handleHit}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-900/40 transition-transform active:scale-95"
              >
                HIT
              </button>

              <button
                id="bj-stand-btn"
                onClick={handleStand}
                className="px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-900/40 transition-transform active:scale-95"
              >
                STAND
              </button>

              {canDouble && (
                <button
                  id="bj-double-btn"
                  onClick={handleDoubleDown}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-900/40 transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" /> DOUBLE DOWN
                </button>
              )}

              {canSplit && (
                <button
                  id="bj-split-btn"
                  onClick={handleSplit}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-900/40 transition-transform active:scale-95"
                >
                  SPLIT PAIR
                </button>
              )}
            </>
          )}

          {phase === 'payout' && (
            <button
              id="bj-new-round-btn"
              onClick={handleNewRound}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base tracking-wider uppercase shadow-xl transition-all transform hover:scale-105"
            >
              PLAY AGAIN
            </button>
          )}
        </div>
      </div>

      {/* Chip Selector & Quick Bet Toolbar */}
      {phase === 'betting' && (
        <ChipSelector
          selectedChip={selectedChip}
          onSelectChip={setSelectedChip}
          onClearBets={handleClearBets}
          onDoubleBets={handleDoubleBets}
          onHalfBets={handleHalfBets}
          onMaxBet={handleMaxBet}
          balance={balance}
          currentBetTotal={totalCurrentBet}
        />
      )}

      {/* Side Bet Rules / Paytable Modal */}
      {showPaytableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-zinc-950 border-2 border-zinc-700 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black uppercase text-amber-300 tracking-wider">
                  Blackjack Side Bet Paytables
                </h3>
              </div>
              <button
                onClick={() => setShowPaytableModal(false)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* 21+3 Table */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-2">
                <h4 className="font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <span>🃏 21 + 3 Side Bet</span>
                  <span className="text-[10px] text-zinc-400 font-normal">(Player 2 cards + Dealer upcard)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="text-zinc-400">Flush</div>
                    <div className="font-black text-purple-300 text-sm">5 : 1</div>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="text-zinc-400">Straight</div>
                    <div className="font-black text-purple-300 text-sm">10 : 1</div>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="text-zinc-400">3 of a Kind</div>
                    <div className="font-black text-purple-300 text-sm">30 : 1</div>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="text-zinc-400">Straight Flush</div>
                    <div className="font-black text-purple-300 text-sm">40 : 1</div>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-amber-500/50">
                    <div className="text-amber-400 font-bold">Suited Trips</div>
                    <div className="font-black text-amber-300 text-sm">100 : 1</div>
                  </div>
                </div>
              </div>

              {/* Perfect Pairs Table */}
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/40 space-y-2">
                <h4 className="font-black text-blue-300 uppercase tracking-wider flex items-center gap-2">
                  <span>👥 Perfect Pairs</span>
                  <span className="text-[10px] text-zinc-400 font-normal">(Player initial 2 cards)</span>
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="text-zinc-400">Mixed Pair (Diff Color)</div>
                    <div className="font-black text-blue-300 text-sm">6 : 1</div>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="text-zinc-400">Colored Pair (Same Color)</div>
                    <div className="font-black text-blue-300 text-sm">12 : 1</div>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-blue-500/50">
                    <div className="text-blue-300 font-bold">Perfect Pair (Same Suit)</div>
                    <div className="font-black text-amber-300 text-sm">25 : 1</div>
                  </div>
                </div>
              </div>

              {/* Lucky Ladies Table */}
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-2">
                <h4 className="font-black text-rose-300 uppercase tracking-wider flex items-center gap-2">
                  <span>👸 Lucky Ladies</span>
                  <span className="text-[10px] text-zinc-400 font-normal">(Player 2 cards summing to 20 or Queens)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="text-zinc-400">Any 20</div>
                    <div className="font-black text-rose-300 text-sm">4 : 1</div>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="text-zinc-400">Suited 20</div>
                    <div className="font-black text-rose-300 text-sm">10 : 1</div>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="text-zinc-400">Matched 20</div>
                    <div className="font-black text-rose-300 text-sm">25 : 1</div>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="text-rose-400 font-bold">Two Q♥</div>
                    <div className="font-black text-rose-300 text-sm">100 : 1</div>
                  </div>
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-950 to-rose-950 border border-yellow-400">
                    <div className="text-yellow-300 font-black">Two Q♥ + Dealer BJ</div>
                    <div className="font-black text-yellow-300 text-sm">1000 : 1</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPaytableModal(false)}
                className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold"
              >
                Close Paytable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent for rendering authentic cards
const RenderPlayingCard: React.FC<{ card: Card }> = ({ card }) => {
  if (card.hidden) {
    return (
      <div className="w-14 h-20 sm:w-18 sm:h-26 rounded-xl bg-gradient-to-br from-red-800 via-rose-900 to-red-950 border-2 border-amber-300 shadow-xl flex items-center justify-center transform -rotate-1 hover:rotate-0 transition-transform">
        <div className="w-10 h-16 sm:w-14 sm:h-22 border border-amber-400/40 rounded-lg flex items-center justify-center bg-red-950/60 pattern-dots">
          <span className="text-lg select-none opacity-80">💩</span>
        </div>
      </div>
    );
  }

  const isRed = card.suit === '♥' || card.suit === '♦';

  return (
    <div className="w-14 h-20 sm:w-18 sm:h-26 rounded-xl bg-zinc-50 border-2 border-zinc-300 shadow-xl flex flex-col justify-between p-1.5 sm:p-2 select-none transform hover:-translate-y-1 transition-transform">
      <div className="flex justify-between items-center leading-none">
        <span className={`text-xs sm:text-sm font-black ${isRed ? 'text-rose-600' : 'text-zinc-950'}`}>
          {card.rank}
        </span>
        <span className={`text-xs sm:text-sm ${isRed ? 'text-rose-600' : 'text-zinc-950'}`}>
          {card.suit}
        </span>
      </div>

      <div className="flex items-center justify-center my-auto">
        <span className={`text-xl sm:text-2xl ${isRed ? 'text-rose-600' : 'text-zinc-950'}`}>
          {card.suit}
        </span>
      </div>

      <div className="flex justify-between items-center leading-none rotate-180">
        <span className={`text-xs sm:text-sm font-black ${isRed ? 'text-rose-600' : 'text-zinc-950'}`}>
          {card.rank}
        </span>
        <span className={`text-xs sm:text-sm ${isRed ? 'text-rose-600' : 'text-zinc-950'}`}>
          {card.suit}
        </span>
      </div>
    </div>
  );
};
