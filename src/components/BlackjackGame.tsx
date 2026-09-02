import React, { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Zap } from 'lucide-react';
import { Card, PlayerHand, BlackjackSideBets, SideBetResults, CasinoStats, CurrencyMode } from '../types';
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
  onAddRakeback?: (wager: number, isBlackjack?: boolean, isCash?: boolean) => void;
  currencyMode?: CurrencyMode;
  cashBalance?: number;
  onUpdateCashBalance?: (amount: number | ((prev: number) => number)) => void;
  onRecordWager?: (amount: number, isCash: boolean) => void;
}

export const BlackjackGame: React.FC<BlackjackGameProps> = ({
  balance,
  onUpdateBalance,
  onUpdateStats,
  onAddRakeback,
  currencyMode = 'gc',
  cashBalance = 0,
  onUpdateCashBalance,
  onRecordWager,
}) => {
  const isCash = currencyMode === 'cash';
  const effectiveBalance = isCash ? cashBalance : balance;

  // Shoe & Deck
  const [shoe, setShoe] = useState<Card[]>(() => createShoe(6));
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [hands, setHands] = useState<PlayerHand[]>([]);
  const [activeHandIndex, setActiveHandIndex] = useState<number>(0);

  // Betting
  const [selectedChip, setSelectedChip] = useState<number>(isCash ? 1 : 25);
  const [mainBet, setMainBet] = useState<number>(isCash ? 1 : 50);
  const [sideBets, setSideBets] = useState<BlackjackSideBets>({
    twentyOnePlusThree: 0,
    perfectPairs: 0,
    luckyLadies: 0,
  });

  // Switch chip presets when currency mode changes
  useEffect(() => {
    if (isCash) {
      setSelectedChip(1);
      setMainBet(1);
      setSideBets({ twentyOnePlusThree: 0, perfectPairs: 0, luckyLadies: 0 });
    } else {
      setSelectedChip(25);
      setMainBet(50);
      setSideBets({ twentyOnePlusThree: 0, perfectPairs: 0, luckyLadies: 0 });
    }
  }, [isCash]);

  // Balance update helper
  const modifyBalance = (delta: number) => {
    if (isCash && onUpdateCashBalance) {
      onUpdateCashBalance(prev => Number((prev + delta).toFixed(2)));
    } else {
      onUpdateBalance(delta);
    }
  };

  // Game Phases
  const [phase, setPhase] = useState<'betting' | 'dealing' | 'insurance' | 'player' | 'dealer' | 'payout'>('betting');
  const [sideBetResults, setSideBetResults] = useState<SideBetResults | null>(null);
  const [showPaytableModal, setShowPaytableModal] = useState<boolean>(false);
  const [roundResultSummary, setRoundResultSummary] = useState<string | null>(null);

  const totalCurrentBet = Number((mainBet + sideBets.twentyOnePlusThree + sideBets.perfectPairs + sideBets.luckyLadies).toFixed(2));

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
    if (effectiveBalance < totalCurrentBet + selectedChip) return;

    sound.playChip();
    if (spot === 'main') {
      setMainBet(prev => Number((prev + selectedChip).toFixed(2)));
    } else if (spot === '21+3') {
      setSideBets(prev => ({ ...prev, twentyOnePlusThree: Number((prev.twentyOnePlusThree + selectedChip).toFixed(2)) }));
    } else if (spot === 'pairs') {
      setSideBets(prev => ({ ...prev, perfectPairs: Number((prev.perfectPairs + selectedChip).toFixed(2)) }));
    } else if (spot === 'ladies') {
      setSideBets(prev => ({ ...prev, luckyLadies: Number((prev.luckyLadies + selectedChip).toFixed(2)) }));
    }
  };

  const handleClearBets = () => {
    if (phase !== 'betting') return;
    setMainBet(0);
    setSideBets({ twentyOnePlusThree: 0, perfectPairs: 0, luckyLadies: 0 });
  };

  const handleDoubleBets = () => {
    if (phase !== 'betting') return;
    if (effectiveBalance >= totalCurrentBet * 2) {
      setMainBet(prev => Number((prev * 2).toFixed(2)));
      setSideBets(prev => ({
        twentyOnePlusThree: Number((prev.twentyOnePlusThree * 2).toFixed(2)),
        perfectPairs: Number((prev.perfectPairs * 2).toFixed(2)),
        luckyLadies: Number((prev.luckyLadies * 2).toFixed(2)),
      }));
    }
  };

  const handleHalfBets = () => {
    if (phase !== 'betting') return;
    setMainBet(prev => isCash ? Number(Math.max(0.10, prev / 2).toFixed(2)) : Math.max(1, Math.floor(prev / 2)));
    setSideBets(prev => ({
      twentyOnePlusThree: isCash ? Number((prev.twentyOnePlusThree / 2).toFixed(2)) : Math.floor(prev.twentyOnePlusThree / 2),
      perfectPairs: isCash ? Number((prev.perfectPairs / 2).toFixed(2)) : Math.floor(prev.perfectPairs / 2),
      luckyLadies: isCash ? Number((prev.luckyLadies / 2).toFixed(2)) : Math.floor(prev.luckyLadies / 2),
    }));
  };

  const handleMaxBet = () => {
    if (phase !== 'betting') return;
    const maxMain = isCash ? Number(Math.min(cashBalance, 100).toFixed(2)) : Math.min(balance, 10000);
    setMainBet(maxMain);
  };

  // Start Deal
  const handleDeal = async () => {
    if (mainBet <= 0 || effectiveBalance < totalCurrentBet) return;

    modifyBalance(-totalCurrentBet);
    onRecordWager?.(totalCurrentBet, isCash);
    onUpdateStats(prev => ({
      ...prev,
      totalWagered: isCash ? prev.totalWagered + (totalCurrentBet * 1000) : prev.totalWagered + totalCurrentBet,
      handsPlayedBlackjack: prev.handsPlayedBlackjack + 1,
    }));
    onAddRakeback?.(totalCurrentBet, true, isCash);

    setPhase('dealing');
    setSideBetResults(null);
    setRoundResultSummary(null);

    let currentDeck = checkShoe();

    // Deal sequence
    const p1 = drawCard(currentDeck);
    sound.playCardDeal();
    currentDeck = p1.newDeck;

    await new Promise(r => setTimeout(r, 180));
    const d1 = drawCard(currentDeck);
    sound.playCardDeal();
    currentDeck = d1.newDeck;

    await new Promise(r => setTimeout(r, 180));
    const p2 = drawCard(currentDeck);
    sound.playCardDeal();
    currentDeck = p2.newDeck;

    await new Promise(r => setTimeout(r, 180));
    const d2 = drawCard(currentDeck, true); // Face down
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

    // Evaluate Side Bets
    let sideBetWinnings = 0;
    const results: SideBetResults = {};

    // 1. 21+3
    if (sideBets.twentyOnePlusThree > 0) {
      const match21 = evaluate21Plus3(p1.card, p2.card, d1.card);
      if (match21) {
        const win = Number((sideBets.twentyOnePlusThree * (match21.multiplier + 1)).toFixed(2));
        results.twentyOnePlusThree = { name: match21.name, multiplier: match21.multiplier, win };
        sideBetWinnings += win;
      }
    }

    // 2. Perfect Pairs
    if (sideBets.perfectPairs > 0) {
      const matchPairs = evaluatePerfectPairs(p1.card, p2.card);
      if (matchPairs) {
        const win = Number((sideBets.perfectPairs * (matchPairs.multiplier + 1)).toFixed(2));
        results.perfectPairs = { name: matchPairs.name, multiplier: matchPairs.multiplier, win };
        sideBetWinnings += win;
      }
    }

    // 3. Lucky Ladies
    const dealerHasBJ = d1.card.isAce && (d2.card.value === 10);
    if (sideBets.luckyLadies > 0) {
      const matchLadies = evaluateLuckyLadies(p1.card, p2.card, dealerHasBJ);
      if (matchLadies) {
        const win = Number((sideBets.luckyLadies * (matchLadies.multiplier + 1)).toFixed(2));
        results.luckyLadies = { name: matchLadies.name, multiplier: matchLadies.multiplier, win };
        sideBetWinnings += win;
      }
    }

    if (sideBetWinnings > 0) {
      setSideBetResults(results);
      modifyBalance(sideBetWinnings);
      sound.playWin(true);
      onUpdateStats(prev => ({
        ...prev,
        sideBetWinsBlackjack: prev.sideBetWinsBlackjack + 1,
        totalWon: isCash ? prev.totalWon + (sideBetWinnings * 1000) : prev.totalWon + sideBetWinnings,
        biggestWin: isCash ? Math.max(prev.biggestWin, sideBetWinnings * 1000) : Math.max(prev.biggestWin, sideBetWinnings),
      }));
    }

    // Check Natural Blackjacks
    const pScore = calculateHandValue(initialPlayerCards);
    const dScore = calculateHandValue(initialDealerCards);

    // Dealer Ace -> Insurance offer
    if (d1.card.isAce) {
      setPhase('insurance');
      return;
    }

    if (pScore.isBlackjack) {
      // Reveal dealer card
      await revealDealerHoleCard(currentDeck, initialDealerCards, [initialHand]);
      return;
    }

    setPhase('player');
  };

  // Insurance handler
  const handleInsurance = async (take: boolean) => {
    const insuranceCost = isCash ? Number((mainBet / 2).toFixed(2)) : Math.floor(mainBet / 2);

    if (take && effectiveBalance >= insuranceCost) {
      modifyBalance(-insuranceCost);
    }

    const unhiddenDealer = dealerCards.map(c => ({ ...c, hidden: false }));
    const dScore = calculateHandValue(unhiddenDealer);

    if (dScore.isBlackjack) {
      setDealerCards(unhiddenDealer);
      if (take) {
        const insuranceWin = Number((insuranceCost * 3).toFixed(2));
        modifyBalance(insuranceWin);
        sound.playWin(false);
      }
      concludeGame(shoe, unhiddenDealer, hands);
      return;
    }

    // Dealer does not have BJ
    const pScore = calculateHandValue(hands[0].cards);
    if (pScore.isBlackjack) {
      await revealDealerHoleCard(shoe, dealerCards, hands);
      return;
    }

    setPhase('player');
  };

  // Player Actions: HIT
  const handleHit = async () => {
    if (phase !== 'player') return;
    const currentHand = hands[activeHandIndex];
    if (!currentHand || currentHand.status !== 'active') return;

    sound.playCardDeal();
    const { card, newDeck } = drawCard(shoe);
    setShoe(newDeck);

    const updatedCards = [...currentHand.cards, card];
    const score = calculateHandValue(updatedCards);

    const updatedHand: PlayerHand = {
      ...currentHand,
      cards: updatedCards,
      status: score.isBust ? 'busted' : 'active',
    };

    const newHands = [...hands];
    newHands[activeHandIndex] = updatedHand;
    setHands(newHands);

    if (score.isBust || score.total === 21) {
      moveToNextHand(newDeck, dealerCards, newHands);
    }
  };

  // Player Actions: STAND
  const handleStand = () => {
    if (phase !== 'player') return;
    const currentHand = hands[activeHandIndex];
    if (!currentHand) return;

    const newHands = [...hands];
    newHands[activeHandIndex] = { ...currentHand, status: 'standing' };
    setHands(newHands);

    moveToNextHand(shoe, dealerCards, newHands);
  };

  // Player Actions: DOUBLE DOWN
  const handleDoubleDown = async () => {
    if (phase !== 'player') return;
    const currentHand = hands[activeHandIndex];
    if (!currentHand || effectiveBalance < currentHand.bet) return;

    modifyBalance(-currentHand.bet);
    onRecordWager?.(currentHand.bet, isCash);
    onUpdateStats(prev => ({ ...prev, totalWagered: isCash ? prev.totalWagered + (currentHand.bet * 1000) : prev.totalWagered + currentHand.bet }));
    onAddRakeback?.(currentHand.bet, true, isCash);

    sound.playChip();
    sound.playCardDeal();

    const { card, newDeck } = drawCard(shoe);
    setShoe(newDeck);

    const updatedCards = [...currentHand.cards, card];
    const score = calculateHandValue(updatedCards);

    const updatedHand: PlayerHand = {
      ...currentHand,
      cards: updatedCards,
      bet: Number((currentHand.bet * 2).toFixed(2)),
      status: score.isBust ? 'busted' : 'doubled',
    };

    const newHands = [...hands];
    newHands[activeHandIndex] = updatedHand;
    setHands(newHands);

    moveToNextHand(newDeck, dealerCards, newHands);
  };

  // Player Actions: SPLIT
  const handleSplit = () => {
    if (phase !== 'player') return;
    const currentHand = hands[activeHandIndex];
    if (!currentHand || currentHand.cards.length !== 2 || effectiveBalance < currentHand.bet || hands.length > 1) return;

    modifyBalance(-currentHand.bet);
    onRecordWager?.(currentHand.bet, isCash);
    onUpdateStats(prev => ({ ...prev, totalWagered: isCash ? prev.totalWagered + (currentHand.bet * 1000) : prev.totalWagered + currentHand.bet }));
    onAddRakeback?.(currentHand.bet, true, isCash);
    sound.playChip();

    let currentDeck = shoe;
    const hit1 = drawCard(currentDeck);
    currentDeck = hit1.newDeck;
    const hit2 = drawCard(currentDeck);
    currentDeck = hit2.newDeck;
    setShoe(currentDeck);

    const handA: PlayerHand = {
      id: 'hand-0',
      cards: [currentHand.cards[0], hit1.card],
      bet: currentHand.bet,
      status: 'active',
    };

    const handB: PlayerHand = {
      id: 'hand-1',
      cards: [currentHand.cards[1], hit2.card],
      bet: currentHand.bet,
      status: 'active',
    };

    setHands([handA, handB]);
    setActiveHandIndex(0);
  };

  const moveToNextHand = (deck: Card[], curDealerCards: Card[], curHands: PlayerHand[]) => {
    if (activeHandIndex + 1 < curHands.length) {
      setActiveHandIndex(prev => prev + 1);
    } else {
      revealDealerHoleCard(deck, curDealerCards, curHands);
    }
  };

  // Dealer Turn & Drawing
  const revealDealerHoleCard = async (deck: Card[], curDealerCards: Card[], curHands: PlayerHand[]) => {
    setPhase('dealer');

    // Unhide hole card
    let unhidden = curDealerCards.map(c => ({ ...c, hidden: false }));
    sound.playCardFlip();
    setDealerCards(unhidden);

    const allPlayerBusted = curHands.every(h => h.status === 'busted');
    let currentDeck = deck;

    if (!allPlayerBusted) {
      let dVal = calculateHandValue(unhidden);

      // Dealer hits on soft 17 and anything under 17
      while (dVal.total < 17 || (dVal.total === 17 && dVal.isSoft)) {
        await new Promise(r => setTimeout(r, 400));
        const { card, newDeck } = drawCard(currentDeck);
        sound.playCardDeal();
        currentDeck = newDeck;
        unhidden = [...unhidden, card];
        dVal = calculateHandValue(unhidden);
        setDealerCards(unhidden);
      }
    }

    setShoe(currentDeck);
    concludeGame(currentDeck, unhidden, curHands);
  };

  // Final Payout Resolution
  const concludeGame = (deck: Card[], finalDealerCards: Card[], finalHands: PlayerHand[]) => {
    setPhase('payout');
    const dVal = calculateHandValue(finalDealerCards);
    let totalWonThisRound = 0;
    const breakdownMsgs: string[] = [];

    const evaluatedHands = finalHands.map(hand => {
      const pVal = calculateHandValue(hand.cards);
      let outcome: 'win' | 'lose' | 'push' | 'blackjack' | 'bust' = 'lose';
      let payout = 0;
      let msg = '';

      if (pVal.isBust) {
        outcome = 'bust';
        payout = 0;
        msg = `Busted at ${pVal.total}.`;
      } else if (pVal.isBlackjack) {
        if (dVal.isBlackjack) {
          outcome = 'push';
          payout = hand.bet;
          msg = `Push! Both had Blackjack.`;
        } else {
          outcome = 'blackjack';
          payout = isCash ? Number((hand.bet * 2.5).toFixed(2)) : (hand.bet + Math.floor(hand.bet * 1.5));
          msg = `Natural 21! Won ${isCash ? `$${(hand.bet * 1.5).toFixed(2)}` : `${Math.floor(hand.bet * 1.5)} GC`} (3:2).`;
        }
      } else if (dVal.isBust) {
        outcome = 'win';
        payout = Number((hand.bet * 2).toFixed(2));
        msg = `Dealer Busted! Won ${isCash ? `$${hand.bet.toFixed(2)}` : `${hand.bet} GC`}.`;
      } else if (pVal.total > dVal.total) {
        outcome = 'win';
        payout = Number((hand.bet * 2).toFixed(2));
        msg = `${pVal.total} beats ${dVal.total}! Won ${isCash ? `$${hand.bet.toFixed(2)}` : `${hand.bet} GC`}.`;
      } else if (pVal.total === dVal.total) {
        outcome = 'push';
        payout = hand.bet;
        msg = `Push at ${pVal.total}. Bet returned.`;
      } else {
        outcome = 'lose';
        payout = 0;
        msg = `Dealer's ${dVal.total} beats ${pVal.total}.`;
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

    const totalHandsBet = finalHands.reduce((acc, h) => acc + h.bet, 0);

    if (totalWonThisRound > 0) {
      modifyBalance(totalWonThisRound);
      const isBigWin = totalWonThisRound >= mainBet * 3;
      if (isBigWin) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        sound.playWin(true);
      } else if (totalWonThisRound > totalHandsBet) {
        sound.playProfit();
      } else {
        sound.playWin(false);
      }
    } else {
      sound.playLoss();
    }

    setRoundResultSummary(breakdownMsgs.join(' • '));
    onUpdateStats(prev => ({
      ...prev,
      totalWon: isCash ? prev.totalWon + (totalWonThisRound * 1000) : prev.totalWon + totalWonThisRound,
      biggestWin: isCash ? Math.max(prev.biggestWin, totalWonThisRound * 1000) : Math.max(prev.biggestWin, totalWonThisRound),
    }));
  };

  const handleNewRound = () => {
    sound.playChip();
    setHands([]);
    setDealerCards([]);
    setSideBetResults(null);
    setRoundResultSummary(null);
    setPhase('betting');
  };

  const dealerScore = calculateHandValue(dealerCards);
  const activeHand = hands[activeHandIndex];
  const canSplit = phase === 'player' && activeHand && activeHand.cards.length === 2 && activeHand.cards[0].rank === activeHand.cards[1].rank && hands.length === 1 && effectiveBalance >= activeHand.bet;
  const canDouble = phase === 'player' && activeHand && activeHand.cards.length === 2 && effectiveBalance >= activeHand.bet;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-3">
      {/* Compact Felt Table */}
      <div 
        id="blackjack-felt-table"
        className="relative w-full rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-emerald-950 via-emerald-900 to-zinc-950 border-2 sm:border-4 border-amber-600/50 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Table Felt Header Strip */}
        <div className="flex items-center justify-between gap-2 border-b border-emerald-700/40 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
              Classic Blackjack
            </span>
            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${isCash ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'} hidden sm:inline-block`}>
              {isCash ? 'Real Cash Mode • Pays 3:2' : 'Pays 3:2 • Dealer Hits Soft 17'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold ${isCash ? 'text-emerald-300' : 'text-amber-300'}`}>
              Bal: {isCash ? `$${cashBalance.toFixed(2)}` : `${balance.toLocaleString()} GC`}
            </span>
            <button
              id="side-bet-paytable-btn"
              onClick={() => setShowPaytableModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-xl bg-zinc-950/80 hover:bg-zinc-900 text-amber-300 border border-amber-500/40 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Paytables</span>
            </button>
          </div>
        </div>

        {/* DEALER AREA (Compact) */}
        <div className="relative z-10 flex flex-col items-center justify-center py-1 sm:py-2 min-h-[90px] sm:min-h-[110px]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-black text-emerald-300/80">Dealer</span>
            {dealerCards.length > 0 && !dealerCards.some(c => c.hidden) && (
              <span className="px-2 py-0.2 rounded-full text-xs font-black bg-zinc-900/90 text-amber-300 border border-amber-500/40 font-mono">
                {dealerScore.total} {dealerScore.isBlackjack && '🔥 21'} {dealerScore.isBust && '💥 BUST'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
            {dealerCards.length === 0 ? (
              <div className="w-12 h-16 sm:w-16 sm:h-22 rounded-xl border-2 border-dashed border-emerald-500/30 flex items-center justify-center text-emerald-500/40 text-[10px] font-bold">
                Dealer Box
              </div>
            ) : (
              dealerCards.map((card, idx) => (
                <RenderPlayingCard key={card.id || idx} card={card} />
              ))
            )}
          </div>
        </div>

        {/* SIDE BETS BANNER */}
        {sideBetResults && (
          <div className="relative z-20 my-1 p-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black text-center shadow-lg text-xs animate-bounce">
            <span>🔥 Side Bet Win: </span>
            {sideBetResults.twentyOnePlusThree && <span>21+3 (+{sideBetResults.twentyOnePlusThree.win}) </span>}
            {sideBetResults.perfectPairs && <span>Pairs (+{sideBetResults.perfectPairs.win}) </span>}
            {sideBetResults.luckyLadies && <span>Lucky Ladies (+{sideBetResults.luckyLadies.win})</span>}
          </div>
        )}

        {/* BETTING CIRCLES (Compact Layout) */}
        {phase === 'betting' && (
          <div className="relative z-10 grid grid-cols-4 gap-1.5 sm:gap-2.5 max-w-xl mx-auto my-2 sm:my-3">
            {/* 21+3 */}
            <div
              id="bet-circle-21-3"
              onClick={() => handleSpotBet('21+3')}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-zinc-950/70 border border-dashed border-purple-500/60 hover:border-purple-400 cursor-pointer hover:bg-purple-950/40 transition-all text-center group"
            >
              <span className="text-[9px] uppercase font-bold text-purple-300">21+3</span>
              <span className="text-[8px] text-zinc-400">100:1</span>
              <div className="mt-1 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-purple-400/40 flex items-center justify-center font-bold text-xs text-purple-200 bg-purple-950/50">
                {sideBets.twentyOnePlusThree > 0 ? (
                  <span className="text-amber-300 font-black">{sideBets.twentyOnePlusThree}</span>
                ) : (
                  <span className="text-zinc-500 text-[9px]">+</span>
                )}
              </div>
            </div>

            {/* Perfect Pairs */}
            <div
              id="bet-circle-pairs"
              onClick={() => handleSpotBet('pairs')}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-zinc-950/70 border border-dashed border-blue-500/60 hover:border-blue-400 cursor-pointer hover:bg-blue-950/40 transition-all text-center group"
            >
              <span className="text-[9px] uppercase font-bold text-blue-300">Pairs</span>
              <span className="text-[8px] text-zinc-400">25:1</span>
              <div className="mt-1 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-blue-400/40 flex items-center justify-center font-bold text-xs text-blue-200 bg-blue-950/50">
                {sideBets.perfectPairs > 0 ? (
                  <span className="text-amber-300 font-black">{sideBets.perfectPairs}</span>
                ) : (
                  <span className="text-zinc-500 text-[9px]">+</span>
                )}
              </div>
            </div>

            {/* Lucky Ladies */}
            <div
              id="bet-circle-ladies"
              onClick={() => handleSpotBet('ladies')}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-zinc-950/70 border border-dashed border-rose-500/60 hover:border-rose-400 cursor-pointer hover:bg-rose-950/40 transition-all text-center group"
            >
              <span className="text-[9px] uppercase font-bold text-rose-300">Ladies</span>
              <span className="text-[8px] text-zinc-400">1000:1</span>
              <div className="mt-1 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-rose-400/40 flex items-center justify-center font-bold text-xs text-rose-200 bg-rose-950/50">
                {sideBets.luckyLadies > 0 ? (
                  <span className="text-amber-300 font-black">{sideBets.luckyLadies}</span>
                ) : (
                  <span className="text-zinc-500 text-[9px]">+</span>
                )}
              </div>
            </div>

            {/* Main Hand */}
            <div
              id="bet-circle-main"
              onClick={() => handleSpotBet('main')}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-amber-950/60 border-2 border-amber-400 hover:border-amber-300 cursor-pointer hover:bg-amber-950/80 transition-all text-center shadow-md group"
            >
              <span className="text-[9px] uppercase font-black text-amber-300">Main (3:2)</span>
              <span className="text-[8px] text-amber-400/80">Hand</span>
              <div className="mt-1 w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-amber-400 flex items-center justify-center font-black text-xs text-amber-200 bg-amber-900/80">
                {mainBet > 0 ? (
                  <span className="text-yellow-300 font-black">{mainBet}</span>
                ) : (
                  <span className="text-amber-500/60 text-[9px]">+</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PLAYER HANDS AREA */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 py-1 sm:py-2 min-h-[100px] sm:min-h-[120px]">
          {hands.length === 0 ? (
            <div className="flex items-center justify-center p-3 text-emerald-300/60 text-xs font-medium">
              Tap chips below to adjust bets, then press DEAL CARDS
            </div>
          ) : (
            hands.map((hand, hIdx) => {
              const val = calculateHandValue(hand.cards);
              const isActive = hIdx === activeHandIndex && phase === 'player';

              return (
                <div
                  key={hand.id || hIdx}
                  className={`flex flex-col items-center p-2.5 sm:p-3 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-zinc-950/95 ring-2 ring-amber-400 shadow-xl scale-102'
                      : 'bg-zinc-950/70 border border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">
                      {hands.length > 1 ? `Hand #${hIdx + 1}` : 'You'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-xs font-black bg-zinc-900 text-amber-300 border border-amber-500/40 font-mono">
                      {val.total} {val.isBlackjack && '🔥 21'} {val.isBust && '💥 BUST'}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-bold">
                      ({hand.bet})
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    {hand.cards.map((card, cIdx) => (
                      <RenderPlayingCard key={card.id || cIdx} card={card} />
                    ))}
                  </div>

                  {hand.result && (
                    <div className="mt-1.5 text-[11px] font-bold text-center">
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

        {/* Insurance Dialog */}
        {phase === 'insurance' && (
          <div className="relative z-30 my-2 p-3 rounded-2xl bg-zinc-950 border-2 border-amber-500 max-w-sm mx-auto text-center animate-fade-in">
            <div className="text-xs font-black uppercase text-amber-300">
              Dealer Shows Ace: Insurance?
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <button
                disabled={balance < Math.floor(mainBet / 2)}
                onClick={() => handleInsurance(true)}
                className="px-3 py-1.5 text-xs font-black rounded-xl bg-amber-500 text-zinc-950"
              >
                Insure ({Math.floor(mainBet / 2)})
              </button>
              <button
                onClick={() => handleInsurance(false)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-zinc-800 text-zinc-300"
              >
                Pass
              </button>
            </div>
          </div>
        )}

        {/* ACTIONS STRIP */}
        <div className="relative z-20 mt-2 flex flex-wrap items-center justify-center gap-2">
          {phase === 'betting' && (
            <button
              id="deal-cards-btn"
              disabled={mainBet <= 0 || balance < totalCurrentBet}
              onClick={handleDeal}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              DEAL CARDS ({totalCurrentBet} Chips)
            </button>
          )}

          {phase === 'player' && (
            <div className="flex items-center justify-center gap-2 w-full">
              <button
                id="bj-hit-btn"
                onClick={handleHit}
                className="flex-1 max-w-[130px] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-95"
              >
                HIT
              </button>

              <button
                id="bj-stand-btn"
                onClick={handleStand}
                className="flex-1 max-w-[130px] py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-95"
              >
                STAND
              </button>

              {canDouble && (
                <button
                  id="bj-double-btn"
                  onClick={handleDoubleDown}
                  className="flex-1 max-w-[150px] py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-md active:scale-95 flex items-center justify-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" /> 2× DOUBLE
                </button>
              )}

              {canSplit && (
                <button
                  id="bj-split-btn"
                  onClick={handleSplit}
                  className="flex-1 max-w-[130px] py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-95"
                >
                  SPLIT
                </button>
              )}
            </div>
          )}

          {phase === 'payout' && (
            <button
              id="bj-new-round-btn"
              onClick={handleNewRound}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg transition-all transform active:scale-95"
            >
              PLAY AGAIN
            </button>
          )}
        </div>
      </div>

      {/* Chip Selector Rack */}
      {phase === 'betting' && (
        <ChipSelector
          selectedChip={selectedChip}
          onSelectChip={setSelectedChip}
          onClearBets={handleClearBets}
          onDoubleBets={handleDoubleBets}
          onHalfBets={handleHalfBets}
          onMaxBet={handleMaxBet}
          balance={balance}
          currencyMode={currencyMode}
          cashBalance={cashBalance}
          currentBetTotal={totalCurrentBet}
        />
      )}

      {/* Paytable Modal */}
      {showPaytableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <h3 className="text-sm font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Side Bet Odds
              </h3>
              <button
                onClick={() => setShowPaytableModal(false)}
                className="p-1 rounded-lg bg-zinc-900 text-zinc-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40">
                <div className="font-black text-purple-300 mb-1">21 + 3 (Your 2 cards + Dealer Upcard)</div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-zinc-300">
                  <div>Flush: <strong className="text-amber-300">5:1</strong></div>
                  <div>Straight: <strong className="text-amber-300">10:1</strong></div>
                  <div>3 of a Kind: <strong className="text-amber-300">30:1</strong></div>
                  <div>Straight Flush: <strong className="text-amber-300">40:1</strong></div>
                  <div className="col-span-2 text-yellow-300 font-bold">Suited Trips: 100:1</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/40">
                <div className="font-black text-blue-300 mb-1">Perfect Pairs (Your First 2 Cards)</div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px] text-zinc-300">
                  <div>Mixed: <strong className="text-amber-300">6:1</strong></div>
                  <div>Colored: <strong className="text-amber-300">12:1</strong></div>
                  <div className="text-yellow-300 font-bold">Suited: 25:1</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40">
                <div className="font-black text-rose-300 mb-1">Lucky Ladies (Your Total 20 or Queens)</div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-zinc-300">
                  <div>Any 20: <strong className="text-amber-300">4:1</strong></div>
                  <div>Suited 20: <strong className="text-amber-300">10:1</strong></div>
                  <div>Matched 20: <strong className="text-amber-300">25:1</strong></div>
                  <div>Two Q♥: <strong className="text-amber-300">100:1</strong></div>
                  <div className="col-span-2 text-yellow-300 font-black">Two Q♥ + Dealer BJ: 1,000:1</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact playing card renderer
const RenderPlayingCard: React.FC<{ card: Card }> = ({ card }) => {
  if (card.hidden) {
    return (
      <div className="w-11 h-16 sm:w-14 sm:h-20 rounded-xl bg-gradient-to-br from-red-800 to-zinc-950 border-2 border-amber-300 shadow-md flex items-center justify-center">
        <span className="text-sm select-none opacity-80">💩</span>
      </div>
    );
  }

  const isRed = card.suit === '♥' || card.suit === '♦';

  return (
    <div className="w-11 h-16 sm:w-14 sm:h-20 rounded-xl bg-zinc-50 border border-zinc-300 shadow-md flex flex-col justify-between p-1 select-none">
      <div className="flex justify-between items-center leading-none">
        <span className={`text-[10px] sm:text-xs font-black ${isRed ? 'text-rose-600' : 'text-zinc-950'}`}>
          {card.rank}
        </span>
        <span className={`text-[10px] sm:text-xs ${isRed ? 'text-rose-600' : 'text-zinc-950'}`}>
          {card.suit}
        </span>
      </div>

      <div className="flex items-center justify-center my-auto">
        <span className={`text-base sm:text-lg ${isRed ? 'text-rose-600' : 'text-zinc-950'}`}>
          {card.suit}
        </span>
      </div>

      <div className="flex justify-between items-center leading-none rotate-180">
        <span className={`text-[10px] sm:text-xs font-black ${isRed ? 'text-rose-600' : 'text-zinc-950'}`}>
          {card.rank}
        </span>
        <span className={`text-[10px] sm:text-xs ${isRed ? 'text-rose-600' : 'text-zinc-950'}`}>
          {card.suit}
        </span>
      </div>
    </div>
  );
};
